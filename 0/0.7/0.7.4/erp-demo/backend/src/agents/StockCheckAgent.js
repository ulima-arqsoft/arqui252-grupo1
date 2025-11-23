import db from '../config/database.js';

export class StockCheckAgent {
  constructor() {
    this.name = 'StockCheckAgent';
    this.isRunning = false;
  }

  async execute() {
    console.log(`\n🤖 [${this.name}] Iniciando revisión de stock...`);
    
    const startTime = Date.now();

    try {
      // 1. Buscar productos con stock bajo
      const lowStockProducts = db.prepare(`
        SELECT id, name, sku, stock, min_stock 
        FROM products 
        WHERE stock < min_stock
      `).all();

      if (lowStockProducts.length === 0) {
        const executionTime = Date.now() - startTime;
        console.log(`✅ [${this.name}] No hay productos con stock bajo`);
        
        this.logTask('SUCCESS', 'No se encontraron productos con stock bajo', executionTime);
        return { success: true, productsChecked: 0 };
      }

      console.log(`⚠️  [${this.name}] Encontrados ${lowStockProducts.length} productos con stock bajo:`);

      const ordersCreated = [];

      // 2. Generar órdenes de compra para cada producto
      const insertOrder = db.prepare(`
        INSERT INTO purchase_orders (product_id, quantity, created_by)
        VALUES (?, ?, ?)
      `);

      lowStockProducts.forEach(product => {
        // Calcular cantidad a pedir (el doble del mínimo menos el stock actual)
        const quantityToOrder = (product.min_stock * 2) - product.stock;

        console.log(`   📦 ${product.name} (Stock: ${product.stock}/${product.min_stock}) → Ordenar: ${quantityToOrder} unidades`);

        // Crear orden de compra
        insertOrder.run(product.id, quantityToOrder, this.name);

        ordersCreated.push({
          product: product.name,
          quantity: quantityToOrder
        });
      });

      const executionTime = Date.now() - startTime;
      
      this.logTask(
        'SUCCESS', 
        `Generadas ${ordersCreated.length} órdenes de compra`, 
        executionTime
      );

      console.log(`✅ [${this.name}] Tarea completada en ${executionTime}ms\n`);

      return { 
        success: true, 
        productsChecked: lowStockProducts.length,
        ordersCreated 
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [${this.name}] Error:`, error.message);
      
      this.logTask('ERROR', error.message, executionTime);
      
      throw error;
    }
  }

  async run() {
    if (this.isRunning) {
      console.log(`⏭️  [${this.name}] Ya está ejecutándose, omitiendo...`);
      return { success: false, message: 'Agent already running' };
    }

    this.isRunning = true;
    
    try {
      const result = await this.execute();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      this.isRunning = false;
    }
  }

  logTask(status, message, executionTime) {
    try {
      db.prepare(`
        INSERT INTO task_logs (agent_name, status, message, execution_time)
        VALUES (?, ?, ?, ?)
      `).run(this.name, status, message, executionTime);

      // Actualizar heartbeat del agent
      db.prepare(`
        UPDATE agent_status 
        SET last_heartbeat = CURRENT_TIMESTAMP,
            error_count = CASE WHEN ? = 'ERROR' THEN error_count + 1 ELSE 0 END
        WHERE agent_name = ?
      `).run(status, this.name);
    } catch (error) {
      console.error('Error logging task:', error.message);
    }
  }
}