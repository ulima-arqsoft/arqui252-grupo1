import cron from 'node-cron';

export class Scheduler {
  constructor(supervisor) {
    this.supervisor = supervisor;
    this.tasks = [];
    this.isRunning = false;
  }

  // Programar una tarea
  scheduleTask(name, cronExpression, agent) {
    console.log(`📅 [Scheduler] Programando tarea: ${name} (${cronExpression})`);

    const task = cron.schedule(cronExpression, async () => {
      console.log(`\n⏰ [Scheduler] Ejecutando tarea programada: ${name}`);
      await this.supervisor.executeAgent(agent);
    }, {
      scheduled: false
    });

    this.tasks.push({
      name,
      cronExpression,
      task,
      agent: agent.name
    });

    return task;
  }

  // Iniciar todas las tareas
  start() {
    if (this.isRunning) {
      console.log('⚠️  [Scheduler] Ya está ejecutándose');
      return;
    }

    console.log('\n🚀 [Scheduler] Iniciando scheduler...');
    console.log(`📋 Tareas programadas: ${this.tasks.length}\n`);

    this.tasks.forEach(({ name, cronExpression, task }) => {
      task.start();
      console.log(`   ✅ ${name} activada (${cronExpression})`);
    });

    this.isRunning = true;
    console.log('\n✨ [Scheduler] Todas las tareas están activas\n');
  }

  // Detener todas las tareas
  stop() {
    console.log('\n🛑 [Scheduler] Deteniendo scheduler...');
    
    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`   ⏸️  ${name} detenida`);
    });

    this.isRunning = false;
    console.log('✅ [Scheduler] Scheduler detenido\n');
  }

  // Obtener estado de las tareas
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalTasks: this.tasks.length,
      tasks: this.tasks.map(({ name, cronExpression, agent }) => ({
        name,
        schedule: cronExpression,
        agent
      }))
    };
  }

  // Ejecutar una tarea manualmente
  async executeTaskNow(taskName) {
    const taskInfo = this.tasks.find(t => t.name === taskName);
    
    if (!taskInfo) {
      throw new Error(`Tarea "${taskName}" no encontrada`);
    }

    console.log(`\n▶️  [Scheduler] Ejecución manual de: ${taskName}`);
    
    // Buscar el agent en el supervisor
    const agent = this.supervisor.agents.find(a => a.name === taskInfo.agent);
    
    if (!agent) {
      throw new Error(`Agent "${taskInfo.agent}" no encontrado`);
    }

    return await this.supervisor.executeAgent(agent);
  }
}