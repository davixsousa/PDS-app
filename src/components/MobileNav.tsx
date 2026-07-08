import React, { useState } from 'react';
import { LayoutDashboard, Calendar, BookOpen, Wallet, MoreHorizontal, CheckSquare, Target, Timer, BarChart3, Settings, X, Smartphone, Book } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
}

export default function MobileNav({ activeTab, onSwitchTab }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'calendario', label: 'Agenda', icon: Calendar },
    { id: 'caderno', label: 'Caderno', icon: BookOpen },
    { id: 'financas', label: 'Finanças', icon: Wallet },
  ];

  const secondaryItems = [
    { id: 'biblia', label: 'Bíblia', icon: Book },
    { id: 'habitos', label: 'Hábitos', icon: CheckSquare },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'bloqueador', label: 'Bloquear Apps', icon: Smartphone },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  ];

  const handleTabClick = (tabId: string) => {
    onSwitchTab(tabId);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161616]/95 backdrop-blur-md border-t border-[#222222] px-4 py-2 flex justify-around items-center z-50">
        {primaryItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-1 p-2 cursor-pointer transition-colors ${
                isActive ? 'text-[#6366F1]' : 'text-[#8E8E8F]'
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center gap-1 p-2 cursor-pointer transition-colors ${
            menuOpen ? 'text-[#6366F1]' : 'text-[#8E8E8F]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>

      {/* Quick modal menu for mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-end md:hidden">
          <div className="bg-[#161616] w-full rounded-t-2xl p-6 space-y-4 border-t border-[#222222]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold tracking-tight text-[#8E8E8F]">Outras ferramentas</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 hover:bg-[#222222] rounded-md text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondaryItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#222222] bg-[#0D0D0D]/50 text-sm text-left text-white hover:border-[#6366F1]/50 transition-colors cursor-pointer"
                  >
                    <IconComp className="w-5 h-5 text-[#6366F1]" /> {item.label}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#222222] pt-4">
              <button
                onClick={() => handleTabClick('configuracoes')}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#222222] bg-[#0D0D0D]/50 text-sm text-left text-white hover:border-[#6366F1]/50 transition-colors cursor-pointer"
              >
                <Settings className="w-5 h-5 text-[#8E8E8F]" /> Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
