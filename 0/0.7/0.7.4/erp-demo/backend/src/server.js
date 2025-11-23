import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDatabase } from './config/database.js';
import { Scheduler } from './scheduler/Scheduler.js';
import { Supervisor } from './scheduler/Supervisor.js';
import { StockCheckAgent } from './agents/StockCheckAgent.js';
import { ReportAgent } from './agents/ReportAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar base de datos
initDatabase();

// ============================================================================
// INICIALIZAR EL PATRÓN SCHEDULER-AGENT-SUPERVISOR
// ============================================================================

console.log('\n🎯 Inicializando patrón Scheduler-Agent-Supervisor...\n');

// 1. Crear Supervisor
const supervisor = new Supervisor();

// 2. Crear Agents
const stockCheckAgent = new StockCheckAgent();
const reportAgent = new ReportAgent();

// 3. Registrar agents en el supervisor
supervisor.registerAgent(stockCheckAgent);
supervisor.registerAgent(reportAgent);

// 4. Crear Scheduler
const scheduler = new Scheduler(supervisor);

// 5. Programar tareas
scheduler.scheduleTask(
  'Revisión de Stock',
  process.env.STOCK_CHECK_INTERVAL || '*/1 * * * *',
  stockCheckAgent
);

scheduler.scheduleTask(
  'Generación de Reportes',
  process.env.REPORT_INTERVAL || '*/2 * * * *',
  reportAgent
);

// 6. Iniciar scheduler
scheduler.start();

// Mostrar dashboard inicial
setTimeout(() => {
  supervisor.printDashboard();
}, 2000);

// ============================================================================
// RUTAS DE LA API - INVENTARIO
// ============================================================================

// Obtener todos los productos
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto por ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
app.post('/api/products', (req, res) => {
  try {
    const { name, sku, stock, min_stock, price } = req.body;
    
    const result = db.prepare(`
      INSERT INTO products (name, sku, stock, min_stock, price)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, sku, stock || 0, min_stock || 10, price || 0);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar stock de un producto
app.patch('/api/products/:id/stock', (req, res) => {
  try {
    const { quantity, type, reason } = req.body;
    const productId = req.params.id;

    // Verificar que el producto existe
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Calcular nuevo stock
    let newStock = product.stock;
    if (type === 'ENTRADA') {
      newStock += quantity;
    } else if (type === 'SALIDA') {
      newStock -= quantity;
      if (newStock < 0) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }
    }

    // Actualizar stock
    db.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStock, productId);

    // Registrar movimiento
    db.prepare(`
      INSERT INTO stock_movements (product_id, quantity, type, reason)
      VALUES (?, ?, ?, ?)
    `).run(productId, quantity, type, reason || '');

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener movimientos de stock
app.get('/api/stock-movements', (req, res) => {
  try {
    const movements = db.prepare(`
      SELECT 
        sm.*,
        p.name as product_name,
        p.sku
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 100
    `).all();
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener órdenes de compra
app.get('/api/purchase-orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT 
        po.*,
        p.name as product_name,
        p.sku,
        p.price
      FROM purchase_orders po
      JOIN products p ON po.product_id = p.id
      ORDER BY po.created_at DESC
    `).all();
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTAS DE LA API - SCHEDULER/SUPERVISOR
// ============================================================================

// Obtener estado del scheduler
app.get('/api/scheduler/status', (req, res) => {
  try {
    const status = scheduler.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estado de los agents
app.get('/api/scheduler/agents', (req, res) => {
  try {
    const agents = supervisor.getAgentsStatus();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener logs de tareas
app.get('/api/scheduler/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = supervisor.getRecentLogs(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas
app.get('/api/scheduler/statistics', (req, res) => {
  try {
    const stats = supervisor.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ejecutar manualmente una tarea
app.post('/api/scheduler/execute/:taskName', async (req, res) => {
  try {
    const result = await scheduler.executeTaskNow(req.params.taskName);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Activar/Desactivar un agent
app.patch('/api/scheduler/agents/:agentName', (req, res) => {
  try {
    const { isActive } = req.body;
    const agentName = req.params.agentName;

    if (isActive) {
      supervisor.activateAgent(agentName);
    } else {
      supervisor.markAgentAsInactive(agentName);
    }

    const agents = supervisor.getAgentsStatus();
    const agent = agents.find(a => a.name === agentName);
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RUTA RAÍZ
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    message: '🏥 Mini ERP - Sistema de Inventario Médico',
    version: '1.0.0',
    pattern: 'Scheduler-Agent-Supervisor',
    endpoints: {
      products: '/api/products',
      scheduler: '/api/scheduler/status',
      agents: '/api/scheduler/agents',
      logs: '/api/scheduler/logs',
      statistics: '/api/scheduler/statistics'
    }
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`\n✨ Patrón Scheduler-Agent-Supervisor activo\n`);
});