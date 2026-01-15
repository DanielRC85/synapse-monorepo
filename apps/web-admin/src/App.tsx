import { useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import { useChat } from './hooks/useChat';

function App() {
  // Conectamos con el Store Global
  const { setAuth, token, user } = useAuthStore();
  
  // 1. SIMULACIÓN: Inyectamos el Token (Hardcode temporal para probar)
  // Usa el token que obtuviste en Postman en el paso anterior
  useEffect(() => {
    if (!token) {
      const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2ZhMDBkYi1hZTRmLTRjNmUtOGZhOC00NDczOWQ1NTliYTMiLCJlbWFpbCI6ImFkbWluQHN5bmFwc2UuY29tIiwicm9sZSI6IlVTRVIiLCJ0ZW5hbnRJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImlhdCI6MTc2ODQzMjYwMSwiZXhwIjoxNzY4NDM2MjAxfQ.IuxCACusLo8c5TqLPJgwnHiYW5utgMy2XUGUNFFRGrg"; 
      
      const fakeUser = {
        id: 'user-id-placeholder',
        email: 'admin@synapse.com',
        role: 'admin',
        tenantId: "550e8400-e29b-41d4-a716-446655440000" // Ej: 550e8400-e29b-41d4-a716-446655440000
      };
      
      setAuth(fakeToken, fakeUser);
    }
  }, [token, setAuth]);

  // 2. CONSUMO: El hook intentará traer los datos automáticamente
  const { messages, isLoading, isError, error } = useChat(user?.tenantId || '');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🛠️ Synapse Data Layer Test</h1>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <strong>Estado de Sesión:</strong> {token ? '✅ Autenticado' : '❌ Sin Token'} <br/>
        <strong>Tenant ID:</strong> {user?.tenantId}
      </div>

      <h2>Mensajes del Backend:</h2>
      
      {isLoading && <p>Cargando datos...</p>}
      
      {isError && (
        <p style={{ color: 'red' }}>
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      )}

      <ul>
        {messages.map((msg) => (
          <li key={msg.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
            <strong>{msg.sender} ({msg.direction}):</strong> {msg.content}
            <br />
            <small>{msg.timestamp}</small>
          </li>
        ))}
      </ul>
      
      {messages.length === 0 && !isLoading && <p>No hay mensajes en este Tenant.</p>}
    </div>
  );
}

export default App;