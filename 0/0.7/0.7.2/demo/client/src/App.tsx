import { useEffect, useState } from 'react';

const API = 'http://localhost:3000';

export default function App() {
  const [status, setStatus] = useState({ ok: false, ordersCount: -1, limit: -1, remaining: -1 });
  const [lastResult, setLastResult] = useState<{} | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const r = await fetch(`${API}/status`);
      const data = await r.json();
      setStatus(data);
    } catch (e) {
      setStatus({ ok: false, ordersCount: -1, limit: -1, remaining: -1 });
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const createOrder = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/orders`, { method: 'POST' });
      const data = await r.json();
      setLastResult(data);
      await loadStatus();
    } catch (e) {
      setLastResult({ ok: false, error: String(e), origin: 'create order' });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    await fetch(`${API}/reset`, { method: 'POST' });
    setLastResult(null);
    await loadStatus();
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', margin: 'auto' }}>
      <div style={{display: 'flex', flexDirection:'column', justifyContent: 'center'}}>
        <h1>Órdenes con límite (Key Vault)</h1>
        <p>La API aplica un límite diario leído desde Azure Key Vault.</p>

        <section style={{ background: 'black', padding: 12, borderRadius: 8 }}>
          <h3>Estado</h3>
          <ul>
            <li><b>Usados:</b> {status.ordersCount}</li>
            <li><b>Límite:</b> {status.limit}</li>
            <li><b>Restantes:</b> {status.remaining}</li>
          </ul>
        </section>

        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button onClick={createOrder} disabled={loading} style={{ padding: '8px 14px' }}>
            {loading ? 'Creando…' : 'Crear pedido'}
          </button>
          <button onClick={reset} style={{ padding: '8px 14px' }}>Reset</button>
          <button onClick={loadStatus} style={{ padding: '8px 14px' }}>Refrescar</button>
        </div>

        {lastResult && (
          <section style={{ marginTop: 16, background: 'black', padding: 12, borderRadius: 8 }}>
            <h3>Resultado</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastResult, null, 2)}</pre>
          </section>
        )}

        <p style={{ color: '#666', marginTop: 16 }}>
          API: <code>{API}</code>
        </p>
      </div>

    </main>
  );
}
