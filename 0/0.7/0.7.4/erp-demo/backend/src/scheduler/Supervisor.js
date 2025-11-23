import db from '../config/database.js';

export class Supervisor {
  constructor() {
    this.agents = [];
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  // Registrar un agent
  registerAgent(agent) {
    console.log(`🤖 [Supervisor] Registrando agent: ${agent.name}`);
    this.agents.push(agent);
  }

  // Ejecutar un agent con manejo de reintentos
  async executeAgent(agent, attempt = 1) {
    console.log(`\n🎯 [Supervisor] Ejecutando ${agent.name} (Intento ${attempt}/${this.maxRetries})`);

    try {
      // Verificar si el agent está activo
      const agentStatus = db.prepare(`
        SELECT is_active FROM agent_status WHERE agent_name = ?
      `).get(agent.name);

      if (agentStatus && !agentStatus.is_active) {
        console.log(`⏸️  [Supervisor] ${agent.name} está desactivado`);
        return { success: false, message: 'Agent desactivado' };
      }

      // Ejecutar el agent
      const result = await agent.run();

      if (result.success) {
        console.log(`✅ [Supervisor] ${agent.name} completado exitosamente`);
        return result;
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error) {
      console.error(`❌ [Supervisor] ${agent.name} falló:`, error.message);

      // Intentar reintento si no se alcanzó el máximo
      if (attempt < this.maxRetries) {
        console.log(`🔄 [Supervisor] Reintentando en ${this.retryDelay/1000} segundos...`);
        
        await this.sleep(this.retryDelay);
        
        return await this.executeAgent(agent, attempt + 1);
      } else {
        console.error(`💥 [Supervisor] ${agent.name} falló después de ${this.maxRetries} intentos`);
        
        // Marcar agent como inactivo después de fallos
        this.markAgentAsInactive(agent.name);
        
        return { 
          success: false, 
          error: error.message,
          attempts: attempt 
        };
      }
    }
  }

  // Obtener estado de todos los agents
  getAgentsStatus() {
    try {
      const statuses = db.prepare(`
        SELECT 
          agent_name,
          is_active,
          last_heartbeat,
          error_count,
          datetime(last_heartbeat) as last_heartbeat_formatted
        FROM agent_status
      `).all();

      return statuses.map(status => ({
        name: status.agent_name,
        isActive: Boolean(status.is_active),
        lastHeartbeat: status.last_heartbeat_formatted,
        errorCount: status.error_count,
        isRunning: this.agents.find(a => a.name === status.agent_name)?.isRunning || false
      }));
    } catch (error) {
      console.error('Error obteniendo estado de agents:', error.message);
      return [];
    }
  }

  // Obtener logs recientes
  getRecentLogs(limit = 50) {
    try {
      return db.prepare(`
        SELECT 
          id,
          agent_name,
          status,
          message,
          execution_time,
          datetime(executed_at) as executed_at
        FROM task_logs
        ORDER BY id DESC
        LIMIT ?
      `).all(limit);
    } catch (error) {
      console.error('Error obteniendo logs:', error.message);
      return [];
    }
  }

  // Obtener estadísticas
  getStatistics() {
    try {
      const stats = db.prepare(`
        SELECT 
          agent_name,
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as failed,
          AVG(execution_time) as avg_execution_time,
          MAX(executed_at) as last_execution
        FROM task_logs
        GROUP BY agent_name
      `).all();

      return stats.map(stat => ({
        agentName: stat.agent_name,
        totalExecutions: stat.total_executions,
        successful: stat.successful,
        failed: stat.failed,
        successRate: ((stat.successful / stat.total_executions) * 100).toFixed(2) + '%',
        avgExecutionTime: parseFloat(stat.avg_execution_time?.toFixed(2) || 0),
        lastExecution: stat.last_execution
      }));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error.message);
      return [];
    }
  }

  // Marcar agent como inactivo
  markAgentAsInactive(agentName) {
    try {
      db.prepare(`
        UPDATE agent_status 
        SET is_active = 0 
        WHERE agent_name = ?
      `).run(agentName);
      
      console.log(`⏸️  [Supervisor] ${agentName} marcado como inactivo`);
    } catch (error) {
      console.error('Error marcando agent como inactivo:', error.message);
    }
  }

  // Activar agent
  activateAgent(agentName) {
    try {
      db.prepare(`
        UPDATE agent_status 
        SET is_active = 1, error_count = 0 
        WHERE agent_name = ?
      `).run(agentName);
      
      console.log(`✅ [Supervisor] ${agentName} activado`);
      return true;
    } catch (error) {
      console.error('Error activando agent:', error.message);
      return false;
    }
  }

  // Utilidad: sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Dashboard en consola
  printDashboard() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUPERVISOR DASHBOARD');
    console.log('='.repeat(60));

    const agentsStatus = this.getAgentsStatus();
    const stats = this.getStatistics();

    console.log('\n🤖 AGENTS:');
    agentsStatus.forEach(agent => {
      const status = agent.isActive ? '🟢' : '🔴';
      const running = agent.isRunning ? '▶️ ' : '';
      console.log(`   ${status} ${running}${agent.name} - Errores: ${agent.errorCount}`);
    });

    console.log('\n📈 ESTADÍSTICAS:');
    stats.forEach(stat => {
      console.log(`   ${stat.agentName}:`);
      console.log(`      Total: ${stat.totalExecutions} | Éxito: ${stat.successful} | Fallos: ${stat.failed} | Tasa: ${stat.successRate}`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }
}