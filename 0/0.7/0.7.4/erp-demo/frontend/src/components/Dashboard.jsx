import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Plus,
  Minus,
  ShoppingCart,
  Activity,
  BarChart3,
  PlayCircle
} from 'lucide-react'

const API_URL = 'http://localhost:3000/api'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [products, setProducts] = useState([])
  const [agents, setAgents] = useState([])
  const [logs, setLogs] = useState([])
  const [statistics, setStatistics] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Polling para actualizar datos en tiempo real
  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 3000) // Cada 3 segundos
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      const [productsRes, agentsRes, logsRes, statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/scheduler/agents`),
        axios.get(`${API_URL}/scheduler/logs?limit=30`),
        axios.get(`${API_URL}/scheduler/statistics`),
        axios.get(`${API_URL}/purchase-orders`)
      ])

      setProducts(productsRes.data)
      setAgents(agentsRes.data)
      setLogs(logsRes.data)
      setStatistics(statsRes.data)
      setPurchaseOrders(ordersRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const updateStock = async (productId, quantity, type) => {
    try {
      await axios.patch(`${API_URL}/products/${productId}/stock`, {
        quantity,
        type,
        reason: `Ajuste manual desde dashboard`
      })
      fetchAllData()
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error al actualizar stock')
    }
  }

  const executeTaskManually = async (taskName) => {
    try {
      await axios.post(`${API_URL}/scheduler/execute/${taskName}`)
      alert(`Tarea "${taskName}" ejecutada manualmente`)
      fetchAllData()
    } catch (error) {
      console.error('Error executing task:', error)
      alert('Error al ejecutar tarea')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5 inline-block mr-2" />
            Inventario
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'supervisor'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5 inline-block mr-2" />
            Supervisor
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline-block mr-2" />
            Órdenes de Compra
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && <InventoryTab products={products} updateStock={updateStock} />}
      {activeTab === 'supervisor' && (
        <SupervisorTab 
          agents={agents} 
          logs={logs} 
          statistics={statistics}
          executeTask={executeTaskManually}
        />
      )}
      {activeTab === 'orders' && <OrdersTab orders={purchaseOrders} />}
    </div>
  )
}

// ============================================================================
// TAB: INVENTARIO
// ============================================================================

function InventoryTab({ products, updateStock }) {
  const lowStockProducts = products.filter(p => p.stock < p.min_stock)
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          title="Total Productos"
          value={products.length}
          color="blue"
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6" />}
          title="Stock Bajo"
          value={lowStockProducts.length}
          color="red"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Unidades Totales"
          value={products.reduce((sum, p) => sum + p.stock, 0)}
          color="green"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Valor Total"
          value={`$${totalValue.toFixed(2)}`}
          color="purple"
        />
      </div>

      {/* Alerta de productos con stock bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Stock Bajo Detectado</h3>
              <p className="text-sm text-red-700 mt-1">
                {lowStockProducts.length} producto(s) por debajo del mínimo. 
                El StockCheckAgent generará órdenes automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Productos en Inventario</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mínimo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`font-semibold ${
                      product.stock < product.min_stock ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {product.min_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.stock < product.min_stock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateStock(product.id, 5, 'ENTRADA')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Agregar 5 unidades"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStock(product.id, 5, 'SALIDA')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Quitar 5 unidades"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TAB: SUPERVISOR
// ============================================================================

function SupervisorTab({ agents, logs, statistics, executeTask }) {
  return (
    <div className="space-y-6">
      {/* Estado de Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(agent => (
          <div key={agent.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  agent.isActive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Activity className={`w-6 h-6 ${
                    agent.isActive ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {agent.isRunning ? (
                      <span className="text-blue-600 font-medium">⚡ Ejecutando...</span>
                    ) : (
                      `Último heartbeat: ${new Date(agent.lastHeartbeat).toLocaleTimeString()}`
                    )}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {agent.isActive ? 'Activo' : 'Inactivo'}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Errores:</span>
                <span className={`font-semibold ${
                  agent.errorCount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {agent.errorCount}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const taskName = agent.name === 'StockCheckAgent' 
                  ? 'Revisión de Stock' 
                  : 'Generación de Reportes'
                executeTask(taskName)
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Ejecutar Ahora
            </button>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estadísticas de Ejecución</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {statistics.map(stat => (
              <div key={stat.agentName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{stat.agentName}</h3>
                  <span className="text-sm font-semibold text-green-600">{stat.successRate}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold text-gray-900">{stat.totalExecutions}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Éxitos</div>
                    <div className="font-semibold text-green-600">{stat.successful}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fallos</div>
                    <div className="font-semibold text-red-600">{stat.failed}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Promedio</div>
                    <div className="font-semibold text-blue-600">{stat.avgExecutionTime}ms</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs en Tiempo Real */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Logs en Tiempo Real</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Actualización automática cada 3s
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  {log.status === 'SUCCESS' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : log.status === 'ERROR' ? (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{log.agent_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.executed_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.message}</p>
                    {log.execution_time && (
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {log.execution_time}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TAB: ÓRDENES DE COMPRA
// ============================================================================

function OrdersTab({ orders }) {
  const pendingOrders = orders.filter(o => o.status === 'PENDIENTE')
  const totalAmount = pendingOrders.reduce((sum, o) => sum + (o.quantity * o.price), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          title="Órdenes Pendientes"
          value={pendingOrders.length}
          color="orange"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          title="Total Órdenes"
          value={orders.length}
          color="blue"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Valor Pendiente"
          value={`$${totalAmount.toFixed(2)}`}
          color="green"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Órdenes Generadas Automáticamente</h2>
          <p className="text-sm text-gray-500 mt-1">Creadas por el StockCheckAgent</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.product_name}</div>
                    <div className="text-sm text-gray-500">{order.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                    ${(order.quantity * order.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: StatCard
// ============================================================================

function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard