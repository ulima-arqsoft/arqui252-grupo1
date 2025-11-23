import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database/inventory.db');
const dbDir = dirname(dbPath);

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Inicializar tablas
export function initDatabase() {
  console.log('📊 Inicializando base de datos...');

  // Tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 10,
      price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de movimientos de stock
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      type TEXT CHECK(type IN ('ENTRADA', 'SALIDA', 'AJUSTE')) NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Tabla de órdenes de compra
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDIENTE',
      created_by TEXT DEFAULT 'StockCheckAgent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Tabla de logs de tareas
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      status TEXT CHECK(status IN ('SUCCESS', 'ERROR', 'RUNNING')) NOT NULL,
      message TEXT,
      execution_time REAL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de estado de agents
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
      error_count INTEGER DEFAULT 0
    )
  `);

  // Insertar datos de ejemplo solo si no existen
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (productCount.count === 0) {
    console.log('📦 Insertando productos de ejemplo...');
    
    const insertProduct = db.prepare(`
      INSERT INTO products (name, sku, stock, min_stock, price) 
      VALUES (?, ?, ?, ?, ?)
    `);

    const products = [
      ['Guantes Látex', 'MED-001', 15, 20, 12.50],
      ['Mascarillas N95', 'MED-002', 8, 25, 25.00],
      ['Alcohol en Gel 500ml', 'MED-003', 5, 15, 8.75],
      ['Jeringas 5ml', 'MED-004', 30, 20, 1.20],
      ['Gasas Estériles', 'MED-005', 50, 30, 3.50]
    ];

    products.forEach(product => insertProduct.run(...product));
  }

  // Insertar agents iniciales
  const agentCount = db.prepare('SELECT COUNT(*) as count FROM agent_status').get();
  
  if (agentCount.count === 0) {
    console.log('🤖 Registrando agents...');
    
    const insertAgent = db.prepare(`
      INSERT OR IGNORE INTO agent_status (agent_name, is_active) VALUES (?, 1)
    `);

    insertAgent.run('StockCheckAgent');
    insertAgent.run('ReportAgent');
  }

  console.log('✅ Base de datos inicializada correctamente');
}

export default db;