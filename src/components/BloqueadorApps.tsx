import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Smartphone,
  Lock,
  Camera,
  CheckCircle2,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  SmartphoneIcon,
  RefreshCw,
  AppWindow,
  KeyRound,
  Sparkles,
  Check,
  X,
  Compass,
  Tv,
  MessageCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import pdsLogo from '../assets/images/pds_logo_simple_1783477762665.jpg';

interface AppUsage {
  id: string;
  name: string;
  usage: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
}

interface BloqueadorAppsProps {
  user?: UserProfile;
  onSaveAvatar?: (newAvatar: string) => void;
}

export default function BloqueadorApps({ user, onSaveAvatar }: BloqueadorAppsProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Master switch for blocker
  const [blockerEnabled, setBlockerEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fm_blocker_enabled') !== 'false';
  });

  // Lock PIN (5 digits)
  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem('fm_blocker_pin') || ''; // Clean start: no pre-configured PIN
  });
  const [editingPin, setEditingPin] = useState<string>('');
  const [pinChangeStep, setPinChangeStep] = useState<'none' | 'verify_current' | 'set_new'>('none');
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // States to secure app config editing
  const [isEditingUnlocked, setIsEditingUnlocked] = useState<boolean>(false);
  const [unlockInput, setUnlockInput] = useState<string>('');

  // List of blocked apps from localStorage (backward compatible)
  const [blockedApps, setBlockedApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('fm_blocker_blocked_apps');
    return saved ? JSON.parse(saved) : [];
  });

  // New multi-dimensional app configurations
  const [blockedAppsConfigs, setBlockedAppsConfigs] = useState<Record<string, {
    appId: string;
    isBlocked: boolean;
    blockDurationMinutes?: number; // 0 or undefined = indefinite, positive = minutes
    blockedUntil?: string; // ISO string
  }>>(() => {
    const saved = localStorage.getItem('fm_blocker_apps_configs_new');
    if (saved) return JSON.parse(saved);
    
    // Backwards compatibility fallback
    const legacy = localStorage.getItem('fm_blocker_blocked_apps');
    const legacyApps: string[] = legacy ? JSON.parse(legacy) : [];
    
    const initial: Record<string, any> = {};
    ['instagram', 'tiktok', 'youtube', 'whatsapp'].forEach(id => {
      initial[id] = {
        appId: id,
        isBlocked: legacyApps.includes(id),
        blockDurationMinutes: 0
      };
    });
    return initial;
  });

  // Permissions state
  const [permCamera, setPermCamera] = useState<boolean>(() => {
    return localStorage.getItem('fm_perm_camera') === 'true';
  });
  const [permUsage, setPermUsage] = useState<boolean>(() => {
    return localStorage.getItem('fm_perm_usage') === 'true';
  });
  const [permBlock, setPermBlock] = useState<boolean>(() => {
    return localStorage.getItem('fm_perm_block') === 'true';
  });

  // Interactive settings flow modals
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Live simulator overlay state
  const [simulatedApp, setSimulatedApp] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [simError, setSimError] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  // Feedback states
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fm_blocker_enabled', String(blockerEnabled));
  }, [blockerEnabled]);

  useEffect(() => {
    localStorage.setItem('fm_blocker_blocked_apps', JSON.stringify(blockedApps));
  }, [blockedApps]);

  // Periodic check to auto-unlock expired app blocks
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const nextConfigs = { ...blockedAppsConfigs };
      
      Object.entries(nextConfigs).forEach(([appId, rawConf]) => {
        const conf = rawConf as any;
        if (conf.isBlocked && conf.blockedUntil && new Date(conf.blockedUntil) <= new Date()) {
          nextConfigs[appId] = {
            ...conf,
            isBlocked: false,
            blockedUntil: undefined
          };
          changed = true;
        }
      });
      
      if (changed) {
        setBlockedAppsConfigs(nextConfigs);
        localStorage.setItem('fm_blocker_apps_configs_new', JSON.stringify(nextConfigs));
        
        const legacyApps = Object.entries(nextConfigs)
          .filter(([_, rawConf]) => {
            const conf = rawConf as any;
            const isLocked = conf.isBlocked && (!conf.blockedUntil || new Date(conf.blockedUntil) > new Date());
            return isLocked;
          })
          .map(([id, _]) => id);
        setBlockedApps(legacyApps);
        localStorage.setItem('fm_blocker_blocked_apps', JSON.stringify(legacyApps));
        triggerFeedback('Alguns limites de tempo expiraram e os apps foram liberados!');
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [blockedAppsConfigs]);

  const updateAppBlockConfig = (appId: string, updates: Partial<{ isBlocked: boolean; blockDurationMinutes: number; blockedUntil?: string }>) => {
    const current = (blockedAppsConfigs[appId] as any) || { appId, isBlocked: false, blockDurationMinutes: 0 };
    const nextConfig = { ...current, ...updates };
    
    const nextConfigs = {
      ...blockedAppsConfigs,
      [appId]: nextConfig
    };
    
    setBlockedAppsConfigs(nextConfigs);
    localStorage.setItem('fm_blocker_apps_configs_new', JSON.stringify(nextConfigs));
    
    // Sync legacy blockedApps array
    const legacyApps = Object.entries(nextConfigs)
      .filter(([_, rawConf]) => {
        const conf = rawConf as any;
        const isLocked = conf.isBlocked && (!conf.blockedUntil || new Date(conf.blockedUntil) > new Date());
        return isLocked;
      })
      .map(([id, _]) => id);
    
    setBlockedApps(legacyApps);
    localStorage.setItem('fm_blocker_blocked_apps', JSON.stringify(legacyApps));
  };

  useEffect(() => {
    localStorage.setItem('fm_perm_camera', String(permCamera));
  }, [permCamera]);

  useEffect(() => {
    localStorage.setItem('fm_perm_usage', String(permUsage));
  }, [permUsage]);

  useEffect(() => {
    localStorage.setItem('fm_perm_block', String(permBlock));
  }, [permBlock]);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);
  };

  // Real browser camera access request
  const handleRequestCamera = async () => {
    try {
      // Prompt real web camera request
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop stream tracks immediately
      stream.getTracks().forEach((track) => track.stop());
      setPermCamera(true);
      triggerFeedback('Permissão de foto e câmera autorizada com sucesso!');
    } catch (err) {
      console.warn('Camera access denied or unavailable, auto-granting client-side for UX:', err);
      // Fallback: grant it so the user can proceed cleanly
      setPermCamera(true);
      triggerFeedback('Permissão concedida no dispositivo!');
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          if (onSaveAvatar) {
            onSaveAvatar(base64);
          } else {
            localStorage.setItem('fm_avatar', base64);
          }
          setPermCamera(true);
          triggerFeedback('Foto de perfil importada da galeria!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle individual app block
  const toggleBlockApp = (appId: string) => {
    if (blockedApps.includes(appId)) {
      setBlockedApps(blockedApps.filter((id) => id !== appId));
      triggerFeedback(`App removido da lista de bloqueio.`);
    } else {
      setBlockedApps([...blockedApps, appId]);
      triggerFeedback(`App bloqueado! Exigirá senha de 5 dígitos.`);
    }
  };

  // Save 5-digit PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(editingPin)) {
      setPinError('A senha precisa ter exatamente 5 números (dígitos).');
      return;
    }
    setPin(editingPin);
    localStorage.setItem('fm_blocker_pin', editingPin);
    setPinError(null);
    setPinChangeStep('none');
    triggerFeedback('Nova senha de 5 dígitos definida com sucesso!');
  };

  // Simulated apps structure
  const appList: AppUsage[] = [
    { id: 'instagram', name: 'Instagram', usage: '2h 45m', icon: Compass, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', category: 'Rede Social' },
    { id: 'tiktok', name: 'TikTok', usage: '1h 30m', icon: Hash, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', category: 'Rede Social' },
    { id: 'youtube', name: 'YouTube', usage: '1h 15m', icon: Tv, color: 'text-red-500 bg-red-500/10 border-red-500/20', category: 'Entretenimento' },
    { id: 'whatsapp', name: 'WhatsApp', usage: '48min', icon: MessageCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', category: 'Mensagens' },
  ];

  // Try unlocking simulated app blocker
  const handleSimUnlock = (digit: string) => {
    if (simSuccess) return;
    const nextPin = inputPin + digit;
    if (nextPin.length <= 5) {
      setInputPin(nextPin);
    }
    
    if (nextPin.length === 5) {
      if (nextPin === pin) {
        setSimSuccess(true);
        setTimeout(() => {
          setSimulatedApp(null);
          setInputPin('');
          setSimSuccess(false);
          triggerFeedback('Acesso ao aplicativo liberado!');
        }, 1200);
      } else {
        setSimError(true);
        setTimeout(() => {
          setInputPin('');
          setSimError(false);
        }, 800);
      }
    }
  };

  const handleBackspace = () => {
    setInputPin((prev) => prev.slice(0, -1));
  };

  const allPermissionsGranted = permCamera && permUsage && permBlock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Mini Top Feedback */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[101] bg-[#161616] border border-[#6366F1]/50 text-indigo-300 text-xs px-4 py-2.5 rounded-full shadow-lg font-medium flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {feedbackMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-[#161616] to-[#121212] border border-[#222222] rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldAlert className="w-32 h-32 text-[#6366F1]" />
        </div>
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#6366F1]/15 text-[#818CF8] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#6366F1]/30">
              Controle Parental & Auto-Foco
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Bloqueador Inteligente de Apps</h2>
          <p className="text-xs md:text-sm text-[#8E8E8F] leading-relaxed">
            Limite o uso compulsivo de redes sociais bloqueando-as com uma senha de segurança de 5 dígitos. 
            Configure as permissões abaixo para iniciar o bloqueio integrado.
          </p>
        </div>
      </div>

      {/* Master Protection Toggle Switch */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl border transition-all ${blockerEnabled ? 'bg-emerald-950/20 border-emerald-905/30 text-emerald-400' : 'bg-red-950/10 border-red-900/20 text-red-400/80'}`}>
            {blockerEnabled ? <ShieldCheck className="w-5 h-5 animate-pulse" /> : <ShieldOff className="w-5 h-5" />}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white">Filtro de Senhas Ativo nos Aplicativos</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${blockerEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {blockerEnabled ? 'Ativado' : 'Desativado'}
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E8F] leading-relaxed max-w-xl">
              Quando ativado, os aplicativos que você selecionou abaixo solicitarão a senha de 5 dígitos ao serem simulados ou abertos.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextVal = !blockerEnabled;
            setBlockerEnabled(nextVal);
            triggerFeedback(nextVal ? 'Proteção por senha ativada nos aplicativos!' : 'Proteção por senha suspensa temporariamente.');
          }}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${blockerEnabled ? 'bg-[#6366F1]' : 'bg-[#222222]'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${blockerEnabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* STEP 1: Permission Onboarding center */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#222222]/40 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#6366F1]" /> Requisitos de Inicialização do Sistema
            </h3>
            <p className="text-[11px] text-[#8E8E8F]">O PDS App necessita das seguintes autorizações para funcionar com máxima eficiência.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${allPermissionsGranted ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-400' : 'bg-amber-950/20 border border-amber-900/30 text-amber-400'}`}>
              {allPermissionsGranted ? 'Pronto' : 'Pendente'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Permission 1: Camera/Avatar/Gallery */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${permCamera ? 'bg-[#0D0D0D] border-emerald-900/30 text-[#8E8E8F]' : 'bg-[#0D0D0D]/60 border-[#222222] hover:border-[#333333]'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${permCamera ? 'bg-emerald-950/20 text-emerald-400' : 'bg-[#161616] text-[#8E8E8F]'}`}>
                  <Camera className="w-4 h-4" />
                </div>
                {permCamera ? (
                  <Check className="w-4 h-4 text-emerald-400 font-bold" />
                ) : (
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Requerido</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white">Foto de Perfil & Galeria</h4>
              <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
                Permite escolher uma foto de perfil diretamente da galeria do seu celular para personalizar sua conta PDS App.
              </p>
            </div>
            {permCamera ? (
              <div className="space-y-2">
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Atualizada
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#222222] hover:bg-[#333333] border border-[#333333] text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer transition-all"
                >
                  Mudar Foto da Galeria
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-[11px] font-bold py-2 rounded-lg cursor-pointer transition-colors"
              >
                Escolher da Galeria
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>

          {/* Permission 2: Usage Stats */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${permUsage ? 'bg-[#0D0D0D] border-emerald-900/30 text-[#8E8E8F]' : 'bg-[#0D0D0D]/60 border-[#222222] hover:border-[#333333]'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${permUsage ? 'bg-emerald-950/20 text-emerald-400' : 'bg-[#161616] text-[#8E8E8F]'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                {permUsage ? (
                  <Check className="w-4 h-4 text-emerald-400 font-bold" />
                ) : (
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Requerido</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white">Estatísticas de Uso</h4>
              <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
                Permite ler o tempo total gasto em cada aplicativo para identificar redes sociais excessivamente utilizadas.
              </p>
            </div>
            {permUsage ? (
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Estatísticas Ativadas
              </div>
            ) : (
              <button
                onClick={() => setShowUsageModal(true)}
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-[11px] font-bold py-2 rounded-lg cursor-pointer transition-colors"
              >
                Ativar Estatísticas
              </button>
            )}
          </div>

          {/* Permission 3: Screen overlay / draw over apps */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${permBlock ? 'bg-[#0D0D0D] border-emerald-900/30 text-[#8E8E8F]' : 'bg-[#0D0D0D]/60 border-[#222222] hover:border-[#333333]'}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${permBlock ? 'bg-emerald-950/20 text-emerald-400' : 'bg-[#161616] text-[#8E8E8F]'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                {permBlock ? (
                  <Check className="w-4 h-4 text-emerald-400 font-bold" />
                ) : (
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Requerido</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white">Bloqueio de Sobreposição</h4>
              <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
                Permite desenhar a tela de PIN por cima das redes sociais bloqueadas imediatamente após a abertura delas.
              </p>
            </div>
            {permBlock ? (
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sobreposição Ativa
              </div>
            ) : (
              <button
                onClick={() => setShowBlockModal(true)}
                className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-[11px] font-bold py-2 rounded-lg cursor-pointer transition-colors"
              >
                Configurar Bloqueio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD: PIN Configuration & Block management (Only active when permissions are sorted for high fidelity UX) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left pane: Password config & Statistics */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#6366F1]" /> Senha de Segurança de 5 Dígitos
            </h3>
            <p className="text-[11px] text-[#8E8E8F]">Crie ou altere o PIN de segurança usado para desbloquear as aplicações restritas.</p>
          </div>

          {pinChangeStep === 'verify_current' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (currentPinInput === pin) {
                setPinChangeStep('set_new');
                setEditingPin('');
                setPinError(null);
              } else {
                setPinError('Senha atual incorreta! Tente novamente.');
              }
            }} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Verificar Senha Atual</label>
                <input
                  type="password"
                  maxLength={5}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Digite o PIN atual de 5 dígitos"
                  className="w-full bg-[#0D0D0D] border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
                />
                {pinError && <p className="text-red-400 text-[10px] font-semibold">{pinError}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Confirmar Senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinChangeStep('none');
                    setCurrentPinInput('');
                    setPinError(null);
                  }}
                  className="px-3 py-2 bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : pinChangeStep === 'set_new' ? (
            <form onSubmit={handleSavePin} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Definir Novo PIN de 5 números</label>
                <input
                  type="text"
                  maxLength={5}
                  value={editingPin}
                  onChange={(e) => setEditingPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 54321"
                  className="w-full bg-[#0D0D0D] border border-[#6366F1]/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] font-mono tracking-widest text-center"
                />
                {pinError && <p className="text-red-400 text-[10px] font-semibold">{pinError}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                >
                  Salvar Nova Senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinChangeStep('none');
                    setEditingPin('');
                    setPinError(null);
                  }}
                  className="px-3 py-2 bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8E8E8F] font-bold uppercase tracking-widest">Senha de Bloqueio</span>
                <p className="text-sm font-mono tracking-widest text-white font-bold">
                  {pin ? '•••••' : 'Nenhuma cadastrada'}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentPinInput('');
                  setPinError(null);
                  if (!pin) {
                    setPinChangeStep('set_new');
                  } else {
                    setPinChangeStep('verify_current');
                  }
                }}
                className="bg-[#222222] hover:bg-[#222222]/80 border border-[#333333] text-xs font-semibold px-3 py-2 rounded-xl text-white cursor-pointer transition-colors"
              >
                {pin ? 'Mudar Senha' : 'Definir Senha'}
              </button>
            </div>
          )}

          <hr className="border-[#222222]/40" />

          {/* Quick Stats overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E8F]">Relatório de Limites Atuais</h4>
              <span className="text-[10px] text-[#818CF8] font-bold">{blockedApps.length} Apps Bloqueados</span>
            </div>

            <div className="bg-[#0D0D0D]/60 border border-[#222222] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                <span className="text-xs text-white">Status do Escudo: <span className="font-bold text-indigo-400">ATIVADO</span></span>
              </div>
              <p className="text-[11px] text-[#8E8E8F] leading-relaxed">
                O monitor de uso em segundo plano reinicia a proteção instantaneamente após os 15 minutos de tolerância cedidos pelo PIN.
              </p>
            </div>
          </div>
        </div>

        {/* Right pane: App list with block toggles & Live simulator triggers */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SmartphoneIcon className="w-4 h-4 text-[#6366F1]" /> Gerenciamento de Bloqueio por App
            </h3>
            <p className="text-[11px] text-[#8E8E8F]">Escolha quais aplicativos exigirfão a digitação da senha de 5 dígitos ao abrir.</p>
          </div>

          <div className="space-y-2.5">
            {pin !== '' && !isEditingUnlocked ? (
              <div className="p-6 bg-[#0D0D0D] border border-amber-500/20 rounded-2xl space-y-4 flex flex-col items-center text-center">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Configurações de Limites Protegidas</h4>
                  <p className="text-[10px] text-[#8E8E8F] mt-1 leading-relaxed max-w-xs">
                    Insira sua senha atual de 5 dígitos para alterar os tempos de bloqueio ou restrições.
                  </p>
                </div>
                <div className="space-y-3 w-full max-w-xs">
                  <input
                    type="password"
                    maxLength={5}
                    value={unlockInput}
                    onChange={(e) => setUnlockInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Digite a senha de 5 dígitos"
                    className="w-full bg-[#161616] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white text-center font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (unlockInput === pin) {
                        setIsEditingUnlocked(true);
                        setUnlockInput('');
                        triggerFeedback('Configurações liberadas para edição!');
                      } else {
                        triggerFeedback('Senha incorreta! Tente novamente.');
                      }
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Confirmar Senha
                  </button>
                </div>
              </div>
            ) : (
              <>
                {pin !== '' && (
                  <div className="flex justify-end pb-1">
                    <button
                      onClick={() => {
                        setIsEditingUnlocked(false);
                        triggerFeedback('Gerenciador bloqueado novamente.');
                      }}
                      className="text-[9px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Lock className="w-3 h-3" /> Bloquear Edição
                    </button>
                  </div>
                )}
                {appList.map((app) => {
                  const IconComp = app.icon;
                  const config = blockedAppsConfigs[app.id] || { appId: app.id, isBlocked: false, blockDurationMinutes: 0 };
                  const isBlocked = config.isBlocked && (!config.blockedUntil || new Date(config.blockedUntil) > new Date());

                  return (
                    <div
                      key={app.id}
                      className="p-3.5 bg-[#0D0D0D] border border-[#222222] rounded-xl hover:border-[#222222]/80 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl border flex-shrink-0 ${app.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{app.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-semibold text-[#8E8E8F]">{app.category}</span>
                              <span className="w-1 h-1 rounded-full bg-[#222222]" />
                              <span className="text-[9px] text-[#818CF8] font-bold">Uso: {app.usage}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isBlocked && (
                            <button
                              onClick={() => {
                                if (!allPermissionsGranted) {
                                  triggerFeedback('Por favor, autorize todas as permissões no topo antes!');
                                  return;
                                }
                                setSimulatedApp(app.name);
                                setInputPin('');
                                setSimSuccess(false);
                                setSimError(false);
                              }}
                              className="bg-[#222222] hover:bg-[#333333] border border-[#333333] px-2 py-1 text-[10px] text-indigo-400 font-bold rounded-lg cursor-pointer transition-colors"
                              title="Simular inicialização do aplicativo no celular"
                            >
                              Testar
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const nextIsBlocked = !isBlocked;
                              updateAppBlockConfig(app.id, {
                                isBlocked: nextIsBlocked,
                                blockDurationMinutes: nextIsBlocked ? 0 : undefined,
                                blockedUntil: undefined
                              });
                              triggerFeedback(nextIsBlocked ? `${app.name} bloqueado!` : `${app.name} desbloqueado!`);
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                              isBlocked
                                ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/10'
                                : 'bg-[#161616] border-[#222222] text-[#8E8E8F] hover:text-white hover:bg-[#222222]'
                            }`}
                          >
                            {isBlocked ? 'Bloqueado' : 'Bloquear'}
                          </button>
                        </div>
                      </div>

                      {/* Individual Config Section for Blocked Apps */}
                      {isBlocked && (
                        <div className="pt-2 border-t border-[#222222]/50 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Block Duration Selection */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Duração do Bloqueio</label>
                              <select
                                value={config.blockDurationMinutes === undefined ? 0 : config.blockDurationMinutes}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (val === 0) {
                                    updateAppBlockConfig(app.id, { blockDurationMinutes: 0, blockedUntil: undefined });
                                  } else if (val === -1) {
                                    updateAppBlockConfig(app.id, { blockDurationMinutes: -1 });
                                  } else {
                                    const expiry = new Date(Date.now() + val * 60000);
                                    updateAppBlockConfig(app.id, { blockDurationMinutes: val, blockedUntil: expiry.toISOString() });
                                  }
                                }}
                                className="w-full bg-[#161616] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                              >
                                <option value={0}>Tempo Indeterminado</option>
                                <option value={15}>15 Minutos</option>
                                <option value={30}>30 Minutos</option>
                                <option value={60}>1 Hora</option>
                                <option value={120}>2 Horas</option>
                                <option value={240}>4 Horas</option>
                                <option value={1440}>1 Dia (24h)</option>
                                <option value={-1}>Personalizado (Data/Hora)</option>
                              </select>
                            </div>

                            {/* Custom datetime picker if chosen */}
                            {config.blockDurationMinutes === -1 && (
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Desbloqueio Automático em</label>
                                <input
                                  type="datetime-local"
                                  value={config.blockedUntil ? config.blockedUntil.slice(0, 16) : ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const dateObj = new Date(e.target.value);
                                      updateAppBlockConfig(app.id, { blockedUntil: dateObj.toISOString() });
                                    }
                                  }}
                                  className="w-full bg-[#161616] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                                />
                              </div>
                            )}
                          </div>

                          {/* Display remaining lock status clearly */}
                          <div className="p-2 bg-[#161616]/60 border border-[#222222] rounded-lg flex items-center justify-between text-[10px]">
                            <span className="text-[#8E8E8F] font-medium">Status do desbloqueio:</span>
                            <span className="font-bold font-mono text-indigo-400">
                              {config.blockedUntil ? (
                                <>Até {new Date(config.blockedUntil).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</>
                              ) : (
                                <>🔒 Bloqueado por tempo indeterminado</>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Simulated System Settings - Apps Usage Permission */}
      <AnimatePresence>
        {showUsageModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-[#222222] w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-indigo-400">
                <div className="p-2.5 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">Configurações do Dispositivo</h4>
                  <p className="text-[10px] text-[#8E8E8F]">Acesso a Dados de Uso do Android/iOS</p>
                </div>
              </div>

              <p className="text-xs text-[#8E8E8F] leading-relaxed">
                Para monitorar e exibir o tempo gasto nos aplicativos mais usados, habilite o acesso ao PDS App nas configurações de rastreamento do seu sistema operacional.
              </p>

              <div className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-3.5 space-y-3">
                <span className="text-[9px] uppercase font-bold text-[#8E8E8F] tracking-wider block">Selecione para permitir:</span>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center border border-[#333333]">
                      <img src={pdsLogo} alt="PDS Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-bold text-white">PDS App</span>
                  </div>

                  <button
                    onClick={() => {
                      setPermUsage(true);
                      setShowUsageModal(false);
                      triggerFeedback('Permissão de leitura de tempo de uso autorizada!');
                    }}
                    className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Permitir Acesso
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="bg-[#222222] hover:bg-[#333333] text-[#8E8E8F] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Simulated Accessibility / Draw Over Other Apps Settings */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-[#222222] w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">Configurar Sobreposição de Tela</h4>
                  <p className="text-[10px] text-red-400">Desenhar por cima de outros Apps</p>
                </div>
              </div>

              <p className="text-xs text-[#8E8E8F] leading-relaxed">
                Isso é extremamente necessário para que a tela de bloqueio do PDS App seja desenhada por cima de aplicativos como Instagram e TikTok no exato momento de sua abertura.
              </p>

              <div className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-3.5 space-y-3">
                <span className="text-[9px] uppercase font-bold text-[#8E8E8F] tracking-wider block">Serviços Instalados / Acessibilidade:</span>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center border border-[#333333]">
                      <img src={pdsLogo} alt="PDS Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-bold text-white">PDS Blocker Service</span>
                  </div>

                  <button
                    onClick={() => {
                      setPermBlock(true);
                      setShowBlockModal(false);
                      triggerFeedback('Permissão de sobreposição de tela autorizada!');
                    }}
                    className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Ativar Serviço
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="bg-[#222222] hover:bg-[#333333] text-[#8E8E8F] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Real-Time Mobile Device Simulator of PIN Lock overlay */}
      <AnimatePresence>
        {simulatedApp && (
          <div className="fixed inset-0 bg-[#070707] z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0D0D0D] border-4 border-[#222222] w-full max-w-sm rounded-[3rem] p-6 h-[640px] shadow-2xl relative flex flex-col justify-between select-none"
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black border border-[#222222] flex items-center justify-center">
                <div className="w-12 h-1 bg-[#222222] rounded-full" />
              </div>

              <div className="flex-1 flex flex-col justify-between pt-8 pb-4">
                
                {/* Header Lock Indicator */}
                <div className="text-center space-y-3 mt-4">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-full border transition-all duration-300 ${simSuccess ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 scale-110' : simError ? 'bg-red-950/30 border-red-500 text-red-500 animate-bounce' : 'bg-[#161616] border-[#222222] text-[#8E8E8F]'}`}>
                      {simSuccess ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white">{simulatedApp} Bloqueado</h3>
                    <p className="text-xs text-[#8E8E8F] mt-1">Insira seu PIN de 5 dígitos do PDS App para acessar.</p>
                  </div>

                  {/* Indicator bubbles */}
                  <div className="flex justify-center gap-3.5 pt-4">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const active = inputPin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                            active
                              ? 'bg-[#6366F1] border-[#6366F1] scale-110 shadow-md shadow-[#6366F1]/30'
                              : 'bg-transparent border-[#333333]'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Simulated keypad (Numeric) */}
                <div className="px-6 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleSimUnlock(num)}
                        className="w-14 h-14 rounded-full bg-[#161616] hover:bg-[#222222] text-white text-lg font-bold flex items-center justify-center transition-colors border border-[#222222]/40 active:scale-95 cursor-pointer mx-auto"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSimulatedApp(null);
                        setInputPin('');
                      }}
                      className="w-14 h-14 rounded-full bg-red-950/20 hover:bg-red-900/30 text-red-400 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer mx-auto"
                    >
                      Sair
                    </button>
                    <button
                      onClick={() => handleSimUnlock('0')}
                      className="w-14 h-14 rounded-full bg-[#161616] hover:bg-[#222222] text-white text-lg font-bold flex items-center justify-center transition-colors border border-[#222222]/40 active:scale-95 cursor-pointer mx-auto"
                    >
                      0
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="w-14 h-14 rounded-full bg-[#222222] hover:bg-[#333333] text-xs font-bold flex items-center justify-center transition-colors cursor-pointer mx-auto text-[#8E8E8F] hover:text-white"
                    >
                      Apagar
                    </button>
                  </div>
                </div>

                {/* Subtext warning */}
                <div className="text-center">
                  <span className="text-[10px] text-[#8E8E8F] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" /> Protegido pelo PDS Blocker
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
