import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import pdsLogo from '../assets/images/pds_logo_simple_1783477762665.jpg';

interface LockScreenProps {
  user: UserProfile;
  onUnlock: () => void;
}

export default function LockScreen({ user, onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === user.password) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0D] z-[9999] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#161616] border border-[#222222] p-8 rounded-2xl w-full max-w-sm text-center space-y-6 shadow-2xl"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#222222] shadow-xl">
            <img src={pdsLogo} alt="PDS Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">PDS App</span>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Aplicativo Bloqueado</h2>
          <p className="text-xs text-[#8E8E8F]">Insira sua senha para acessar o PDS App</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Digite sua senha"
              className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-center text-sm focus:outline-none focus:border-indigo-500 text-white transition-all"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500">Senha incorreta. Tente novamente.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
          >
            Desbloquear
          </button>
        </form>
      </motion.div>
    </div>
  );
}
