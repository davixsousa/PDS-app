import React from 'react';
import { Sparkles, LayoutDashboard, Calendar, BookOpen, Wallet, CheckSquare, Target, Timer, BarChart3, Settings, User, Smartphone, Book } from 'lucide-react';
import { UserProfile } from '../types';

import pdsLogo from '../assets/images/pds_logo_simple_1783477762665.jpg';

interface SidebarProps {
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
  user: UserProfile;
}

export default function Sidebar({ activeTab, onSwitchTab, user }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'caderno', label: 'Caderno', icon: BookOpen },
    { id: 'biblia', label: 'Bíblia', icon: Book },
    { id: 'financas', label: 'Finanças', icon: Wallet },
    { id: 'habitos', label: 'Hábitos', icon: CheckSquare },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'bloqueador', label: 'Bloquear Apps', icon: Smartphone },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#161616] border-r border-[#222222] p-6 justify-between flex-shrink-0 h-screen sticky top-0">
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 mb-8 px-2 select-none">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center border border-[#333333]">
              <img src={pdsLogo} alt="PDS Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="font-semibold tracking-tight text-sm text-white">PDS App</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSwitchTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'bg-[#222222] text-white'
                      : 'text-[#8E8E8F] hover:text-white hover:bg-[#222222]/50'
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          {/* Profile Widget footer */}
          <div className="flex items-center gap-3 p-2 bg-[#222222]/30 rounded-xl border border-[#222222]/10">
            <div className="w-8 h-8 rounded-full border border-[#222222] overflow-hidden bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[#8E8E8F]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-white">{user.name}</p>
            </div>
          </div>

          {/* Settings base button */}
          <button
            onClick={() => onSwitchTab('configuracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer font-medium ${
              activeTab === 'configuracoes'
                ? 'bg-[#222222] text-white'
                : 'text-[#8E8E8F] hover:text-white hover:bg-[#222222]/50'
            }`}
          >
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </div>
      </div>
    </aside>
  );
}
