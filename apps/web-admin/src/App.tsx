import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, LogOut, MessageSquare, Send, Phone, User, Menu } from 'lucide-react';

import { useAuthStore } from './stores/auth.store';
import { useChat } from './hooks/useChat';
import { ChatList } from './components/domain/chat/ChatList';

// 👇 TU NÚMERO REAL (Esto asegura que siempre puedas escribirte a ti mismo)
const MY_NUMBER = '573185914450'; 

function App() {
  const { token, setAuth, logout, user } = useAuthStore();

  if (!token) {
    return <LoginScreen onLoginSuccess={setAuth} />;
  }

  return <DashboardContent tenantId={user?.tenantId || ''} onLogout={logout} />;
}

// --- DASHBOARD ---
function DashboardContent({ tenantId, onLogout }: { tenantId: string, onLogout: () => void }) {
  const { messages, isLoading, isError, sendMessage } = useChat(tenantId);
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🧠 LÓGICA CORREGIDA:
  // 1. Siempre incluimos TU número.
  // 2. Filtramos para que NO aparezca "client" ni nada que no sea número.
  const activeChats = useMemo(() => {
    const chatSet = new Set<string>();
    
    // Primero agregamos tu número para que aparezca arriba
    chatSet.add(MY_NUMBER);

    if (messages) {
      messages.forEach(m => {
        // Solo agregamos si NO es "client" y parece un número (tiene más de 5 dígitos)
        if (m.sender !== 'client' && m.sender.length > 5) {
            chatSet.add(m.sender);
        }
      });
    }
    
    return Array.from(chatSet);
  }, [messages]);

  // Autoseleccionar tu número al inicio
  useEffect(() => {
    if (!selectedChat && activeChats.length > 0) {
      setSelectedChat(MY_NUMBER); // Forzamos selección de tu número
    }
  }, [activeChats, selectedChat]);

  // Filtrar mensajes del chat seleccionado
  const filteredMessages = useMemo(() => {
    if (!selectedChat) return [];
    if (!messages) return [];
    return messages.filter(m => m.sender === selectedChat);
  }, [messages, selectedChat]);

  // --- Lógica de Envío ---
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedChat) return;
    setIsSending(true);
    try {
      if (sendMessage) {
        await sendMessage(inputValue, selectedChat);
        setInputValue('');
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-900/50">S</div>
          <span className="font-semibold tracking-wide">SYNAPSE</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Chats</h3>
          <nav className="space-y-1">
            {activeChats.map(number => (
              <button 
                key={number}
                onClick={() => { setSelectedChat(number); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectedChat === number 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedChat === number ? 'bg-white' : 'bg-green-500'}`} />
                <span className="truncate">{number}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
           <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm hover:bg-slate-800 rounded">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500 p-1 hover:bg-gray-100 rounded">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {selectedChat ? `Chat con ${selectedChat}` : 'Selecciona un chat'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">Tenant: {tenantId.slice(0, 8)}...</span>
                  {selectedChat && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        En línea
                    </span>
                  )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <ChatList messages={filteredMessages} isLoading={isLoading} isError={isError} />
          
          <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isSending || !selectedChat}
                autoFocus
                placeholder={selectedChat ? "Escribe un mensaje..." : "Cargando chat..."} 
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending || !selectedChat}
                className={`p-3 rounded-lg text-white transition-all flex items-center justify-center min-w-[3rem] ${
                    !inputValue.trim() || isSending || !selectedChat
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                }`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"></div>
      )}
    </div>
  );
}

// LOGIN SCREEN
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
      const res = await fetch('/api/iam/login', { 
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
          <h2 className="text-2xl font-bold text-gray-800">Synapse</h2>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">EMAIL</label>
            <input className="w-full border border-gray-300 p-3 rounded-lg text-sm" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">CONTRASEÑA</label>
            <input className="w-full border border-gray-300 p-3 rounded-lg text-sm" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all mt-2" disabled={loading}>
            {loading ? 'Entrando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;