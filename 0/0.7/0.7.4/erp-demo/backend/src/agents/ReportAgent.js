import db from '../config/database.js';

export class ReportAgent {
  constructor() {
    this.name = 'ReportAgent';
    this.isRunning = false;
  }

  async execute() {
    console.log(`\n📊 [${this.name}] Generando reporte de inventario...`);
    
    const startTime = Date.now();

    try {
      // 1. Obtener resumen de productos
      const productSummary = db.prepare(`
        SELECT 
          COUNT(*) as total_products,
          SUM(stock) as total_units,
          SUM(stock * price) as total_value,
          COUNT(CASE WHEN stock < min_stock THEN 1 END) as low_stock_count
        FROM products
      `).get();

      // 2. Obtener movimientos del día
      const todayMovements = db.prepare(`
        SELECT 
          type,
          COUNT(*) as count,
          SUM(quantity) as total_quantity
        FROM stock_movements
        WHERE DATE(created_at) = DATE('now')
        GROUP BY type
      `).all();

      // 3. Productos más críticos
      const criticalProducts = db.prepare(`
        SELECT name, stock, min_stock
        FROM products
        WHERE stock < min_stock
        ORDER BY (stock - min_stock) ASC
        LIMIT 5
      `).all();

      // 4. Órdenes pendientes
      const pendingOrders = db.prepare(`
        SELECT COUNT(*) as count
        FROM purchase_orders
        WHERE status = 'PENDIENTE'
      `).get();

      const report = {
        generated_at: new Date().toISOString(),
        summary: {
          total_products: productSummary.total_products,
          total_units: productSummary.total_units || 0,
          total_value: parseFloat((productSummary.total_value || 0).toFixed(2)),
          low_stock_products: productSummary.low_stock_count
        },
        movements_today: todayMovements.reduce((acc, mov) => {
          acc[mov.type] = {
            count: mov.count,
            quantity: mov.total_quantity
          };
          return acc;
        }, {}),
        critical_products: criticalProducts,
        pending_orders: pendingOrders.count
      };

      console.log(`📈 Resumen del reporte:`);
      console.log(`   - Total productos: ${report.summary.total_products}`);
      console.log(`   - Total unidades: ${report.summary.total_units}`);
      console.log(`   - Valor inventario: $${report.summary.total_value}`);
      console.log(`   - Productos críticos: ${report.summary.low_stock_products}`);
      console.log(`   - Órdenes pendientes: ${report.pending_orders}`);

      const executionTime = Date.now() - startTime;
      
      this.logTask(
        'SUCCESS', 
        `Reporte generado: ${report.summary.total_products} productos analizados`, 
        executionTime
      );

      console.log(`✅ [${this.name}] Reporte completado en ${executionTime}ms\n`);

      return { 
        success: true, 
        report 
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