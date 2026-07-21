import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-odc-orange opacity-10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-odc-orange opacity-5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-odc-orange mb-6 shadow-[0_0_40px_-10px_#FF7900] flex items-center justify-center">
             <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">ODC <span className="text-odc-orange">Ecosystem</span></h1>
          <p className="text-gray-500 font-medium tracking-tight">Intelligence & Performance Management Platform</p>
        </div>

        <div className="glass-card !bg-white/[0.03] !backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 md:p-14 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8">Connexion sécurisée</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email professionnel</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-odc-orange/50 focus:ring-1 focus:ring-odc-orange/20 transition-all placeholder:text-gray-600"
                placeholder="nom.prenom@orange.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-odc-orange/50 focus:ring-1 focus:ring-odc-orange/20 transition-all placeholder:text-gray-600"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-gradient py-5 rounded-2xl text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(255,121,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2 animate-pulse">Authentification...</span>
              ) : (
                <>
                  Entrer dans l'écosystème
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-600">
             <span>Orange Digital Center © 2026</span>
             <a href="#" className="hover:text-odc-orange transition-colors">Assistance technique</a>
          </div>
        </div>
      </div>
    </div>
  );
}
