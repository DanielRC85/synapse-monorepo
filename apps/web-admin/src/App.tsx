import React, { useState } from 'react';
import { LayoutDashboard, LogOut, MessageSquare } from 'lucide-react';

// Asegúrate de tener estos archivos creados en sus carpetas:
import { useAuthStore } from './stores/auth.store';
import { useChat } from './hooks/useChat';
import { ChatList } from './components/domain/chat/ChatList';

function App() {
  const { token, setAuth, logout, user } = useAuthStore();

  // 1. SI NO HAY TOKEN -> PANTALLA DE LOGIN
  if (!token) {
    return <LoginScreen onLoginSuccess={setAuth} />;
  }

  // 2. SI HAY TOKEN -> PANTALLA DE CHAT
  // Usamos el tenantId del usuario o un string vacío para evitar errores
  return <DashboardContent tenantId={user?.tenantId || ''} onLogout={logout} />;
}

// --- SUB-COMPONENTE: DASHBOARD PRINCIPAL ---
function DashboardContent({ tenantId, onLogout }: { tenantId: string, onLogout: () => void }) {
  // Aquí usamos el hook que conecta con el servicio
  const { messages, isLoading, isError } = useChat(tenantId);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar (Solo visible en escritorio) */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-900/50">
            S
          </div>
          <span className="font-semibold tracking-wide">SYNAPSE</span>
        </div>
        <nav className="flex-1 p-4">
          <button className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 text-blue-400 rounded-lg text-sm font-medium border border-slate-700">
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm hover:bg-slate-800 rounded">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-gray-400 md:hidden" />
              Torre de Control
            </h1>
            {/* Mostramos el Tenant ID para depuración */}
            <p className="text-xs text-gray-400 mt-1 font-mono">Tenant: {tenantId ? tenantId.split('-')[0] : '...'}...</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onLogout} className="md:hidden text-gray-500 hover:text-red-500">
               <LogOut size={20}/>
             </button>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              En línea
            </span>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Pasamos los mensajes al componente de lista */}
          <ChatList messages={messages} isLoading={isLoading} isError={isError} />
          
          {/* Input Area (Deshabilitado visualmente por ahora) */}
          <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex gap-2 opacity-60 cursor-not-allowed">
              <input 
                disabled 
                placeholder="Escribe un mensaje..." 
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none text-sm"
              />
              <button disabled className="p-3 bg-blue-600 rounded-lg text-white">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTE: LOGIN SCREEN ---
function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (t: string, u: any) => void }) {
  const [email, setEmail] = useState('admin@synapse.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // ⚠️ Asegúrate de que tu backend tenga el módulo IAM escuchando aquí
      const res = await fetch('http://localhost:3000/iam/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if(!res.ok) throw new Error(data.message || 'Error de conexión');
      
      onLoginSuccess(data.accessToken, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-blue-200 shadow-lg">S</div>
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido</h2>
          <p className="text-gray-500 text-sm mt-2">Ingresa tus credenciales de acceso</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Contraseña</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required
            />
          </div>
          <button 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;