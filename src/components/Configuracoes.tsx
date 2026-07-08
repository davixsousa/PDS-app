import React, { useState, useRef } from 'react';
import { UserCog, ShieldCheck, Save, User } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

interface ConfiguracoesProps {
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
}

export default function Configuracoes({ user, onSave }: ConfiguracoesProps) {
  const [name, setName] = useState(user.name);
  const [quote, setQuote] = useState(user.quote);
  const [passwordEnabled, setPasswordEnabled] = useState(user.passwordEnabled);
  const [password, setPassword] = useState(user.password || '');
  const [avatar, setAvatar] = useState(user.avatar);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordEnabled && !password.trim()) {
      alert('Defina uma senha válida para ativar o bloqueio de segurança.');
      return;
    }

    onSave({
      name: name.trim() || 'Davi',
      quote: quote.trim() || 'Se você não fizer, ninguém vai fazer por você.',
      passwordEnabled,
      password: passwordEnabled ? password : '',
      avatar,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card Info */}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-[#222222]/50">
            <UserCog className="w-5 h-5 text-[#6366F1]" />
            <h3 className="font-semibold text-sm text-white">Editar Perfil</h3>
          </div>

          {/* Profile image picker */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border border-[#222222] overflow-hidden bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#8E8E8F]" />
              )}
            </div>
            
            <div className="flex flex-col items-center sm:items-start gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] text-xs px-3 py-2 rounded-lg transition-colors font-medium text-white cursor-pointer"
              >
                Alterar Foto da Galeria
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-[10px] text-[#8E8E8F] mt-1">Formatos suportados: PNG, JPG ou WEBP.</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#8E8E8F]">Seu Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Davi"
              className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6366F1] text-white transition-all"
              required
            />
          </div>

          {/* Quote Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#8E8E8F]">Sua Frase Motivacional</label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Ex: Se você não fizer, ninguém vai fazer por você."
              className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6366F1] text-white transition-all"
              required
            />
          </div>
        </div>

        {/* Privacy Lock Card */}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-[#222222]/50">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
            <h3 className="font-semibold text-sm text-white">Privacidade e Segurança</h3>
          </div>

          {/* Toggle Block */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Exigir senha para entrar</p>
              <p className="text-[10px] text-[#8E8E8F] mt-0.5">Proteja seu aplicativo contra acessos não autorizados.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={passwordEnabled}
                onChange={(e) => setPasswordEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#0D0D0D] border border-[#222222] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#8E8E8F] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366F1]"></div>
            </label>
          </div>

          {/* Input Block */}
          {passwordEnabled && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#8E8E8F]">Definir Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite uma senha forte"
                className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6366F1] text-white transition-all"
                required
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#6366F1]/90 px-6 py-3 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6366F1]/20"
          >
            <Save className="w-4 h-4" /> Salvar alterações
          </button>
        </div>

      </form>
    </motion.div>
  );
}
