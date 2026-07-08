import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  Wallet,
  CheckSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  ChevronRight,
  Info,
  Sparkles,
  Award,
  Plus,
  Instagram,
  MessageCircle,
  Twitter,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, Habit, Goal } from '../types';

interface EstatisticasProps {
  transactions: Transaction[];
  habits: Habit[];
  goals: Goal[];
}

export default function Estatisticas({ transactions, habits, goals }: EstatisticasProps) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'financas' | 'aplicativos'>('geral');
  
  // Date period filters
  const [financePeriod, setFinancePeriod] = useState<string>('mes');
  const [appPeriod, setAppPeriod] = useState<string>('semana');

  // Custom period date fields
  const [customFinStart, setCustomFinStart] = useState<string>('');
  const [customFinEnd, setCustomFinEnd] = useState<string>('');
  const [customAppStart, setCustomAppStart] = useState<string>('');
  const [customAppEnd, setCustomAppEnd] = useState<string>('');

  // Transaction ledger search keyword
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  // App Usage data retrieval
  const [appUsageHistory, setAppUsageHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('fm_usage_data');
    let data: any[] = [];
    if (saved) {
      try {
        data = JSON.parse(saved);
      } catch (e) {}
    }
    return Array.isArray(data) ? data : [];
  });

  // App blocking limits retrieval for limits warnings
  const [blockedAppsConfigs] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('fm_blocker_apps_configs_new');
    if (saved) return JSON.parse(saved);
    return {};
  });

  // Date Range Helper based on filter selection
  const getDatesForFilter = (filter: string, customStart: string, customEnd: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (filter) {
      case 'dia':
        start.setHours(0,0,0,0);
        break;
      case 'semana':
        start.setDate(end.getDate() - 7);
        break;
      case 'mes':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'trimestre':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'semestre':
        start.setMonth(end.getMonth() - 6);
        break;
      case 'ano':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'personalizado':
        return {
          start: customStart ? new Date(customStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: customEnd ? new Date(customEnd) : new Date()
        };
      default:
        start.setMonth(end.getMonth() - 1); // fallback month
    }
    return { start, end };
  };

  // Filter list by date range inclusive helper
  const filterByDateRange = (items: any[], dateField: string, start: Date, end: Date) => {
    const s = new Date(start);
    s.setHours(0,0,0,0);
    const e = new Date(end);
    e.setHours(23,59,59,999);

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= s && itemDate <= e;
    });
  };

  // Currency Formatter helper
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // 1. GENERAL TAB CALCULATIONS (Retaining existing logic exactly for backwards compatibility)
  const pomodoroStats = (() => {
    const saved = localStorage.getItem('fm_pomodoro_stats');
    if (saved) return JSON.parse(saved);
    return { sessions: 0, totalMinutes: 0 };
  })();
  const focusHrs = (pomodoroStats.totalMinutes / 60).toFixed(1);

  const incomeTotalAllTime = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotalAllTime = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsAllTime = incomeTotalAllTime - expenseTotalAllTime;
  const savingsRateAllTime = incomeTotalAllTime > 0 ? Math.round((savingsAllTime / incomeTotalAllTime) * 100) : 0;

  const expenseCategoriesAllTime = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const maxExpenseCategoryAmountAllTime = Object.values(expenseCategoriesAllTime).reduce((a, b) => Math.max(a, b), 0);

  const totalHabitsCount = habits.length;
  const todayKey = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  })();
  const completedTodayCount = habits.filter((h) => h.daysCompleted.includes(todayKey)).length;
  const habitCompletionRate = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const averageGoalProgress = totalGoalsCount > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoalsCount)
    : 0;


  // 2. FINANCE TAB PERIOD CALCULATIONS
  const finRange = getDatesForFilter(financePeriod, customFinStart, customFinEnd);
  const filteredFinTransactions = filterByDateRange(transactions, 'date', finRange.start, finRange.end);

  const periodIncomeTotal = filteredFinTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpenseTotal = filteredFinTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodNetBalance = periodIncomeTotal - periodExpenseTotal;

  // Group filtered period transactions by category for breakdown
  const periodExpenseCategories = filteredFinTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const periodMaxExpenseCategoryAmount = Object.keys(periodExpenseCategories).reduce((max, key) => Math.max(max, periodExpenseCategories[key]), 0);
  const periodTotalExpensesSum = Object.keys(periodExpenseCategories).reduce((sum, key) => sum + periodExpenseCategories[key], 0);

  // Group financial evolution transactions by date for dynamic trend plotting
  const financeTrendData = (() => {
    // Group transactions by date
    const grouped: Record<string, { income: number; expense: number }> = {};
    filteredFinTransactions.forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        grouped[t.date].income += t.amount;
      } else {
        grouped[t.date].expense += t.amount;
      }
    });

    // Sort by date key
    const sortedDates = Object.keys(grouped).sort();
    
    // If no data points, return empty array to trigger empty state message
    if (sortedDates.length === 0) {
      return [];
    }

    // Accumulate points
    let cumulativeBalance = 0;
    return sortedDates.map(dStr => {
      const income = grouped[dStr].income;
      const expense = grouped[dStr].expense;
      cumulativeBalance += (income - expense);
      return {
        date: dStr,
        income,
        expense,
        balance: cumulativeBalance,
        label: dStr.split('-').reverse().slice(0, 2).reverse().join('/') // DD/MM format
      };
    });
  })();


  // 3. APP USAGE TAB PERIOD CALCULATIONS
  const appRange = getDatesForFilter(appPeriod, customAppStart, customAppEnd);
  const filteredAppHistory = filterByDateRange(appUsageHistory, 'date', appRange.start, appRange.end)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Cumulative App usage times
  const appCumulativeTotals = filteredAppHistory.reduce(
    (acc, record) => {
      const apps = record.apps || {};
      acc.instagram += apps.instagram || 0;
      acc.tiktok += apps.tiktok || 0;
      acc.whatsapp += apps.whatsapp || 0;
      acc.x += apps.x || 0;
      return acc;
    },
    { instagram: 0, tiktok: 0, whatsapp: 0, x: 0 }
  );

  const totalAppMinutesSum = Object.keys(appCumulativeTotals).reduce((sum, key) => sum + (appCumulativeTotals[key as keyof typeof appCumulativeTotals] || 0), 0);

  // App list configuration mapping
  const socialAppConfigs = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', bg: 'bg-[#E1306C]/10', text: 'text-[#E1306C]' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: '#00F2FE', bg: 'bg-[#00F2FE]/10', text: 'text-[#00F2FE]' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366', bg: 'bg-[#25D366]/10', text: 'text-[#25D366]' },
    { id: 'x', name: 'X / Twitter', icon: Twitter, color: '#1DA1F2', bg: 'bg-[#111111]', text: 'text-white' }
  ];

  // Cumulative App limit notifications check
  // Convert limits (stored per-day) to comparison in selected period range
  const numDaysInPeriod = Math.max(1, Math.round((appRange.end.getTime() - appRange.start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const exceededAppLimits = socialAppConfigs.map(app => {
    const config = blockedAppsConfigs[app.id] || {};
    const dailyLimit = config.blockDurationMinutes || 0;
    
    // We only trigger exceed alerts if a positive limit is declared
    if (dailyLimit <= 0) return null;

    const cumulativeAllowed = dailyLimit * numDaysInPeriod;
    const actualCumulative = appCumulativeTotals[app.id as keyof typeof appCumulativeTotals];
    const isExceeded = actualCumulative > cumulativeAllowed;

    return {
      appId: app.id,
      name: app.name,
      dailyLimit,
      cumulativeAllowed,
      actualCumulative,
      exceededBy: actualCumulative - cumulativeAllowed,
      isExceeded
    };
  }).filter(Boolean).filter(alert => alert?.isExceeded);

  // Custom recommendations based on app times
  const appRecommendations = (() => {
    const recs = [];
    const instaMin = appCumulativeTotals.instagram;
    const tikMin = appCumulativeTotals.tiktok;
    const whatsMin = appCumulativeTotals.whatsapp;

    if (tikMin > 60 * numDaysInPeriod) {
      recs.push({
        title: 'Reduzir Feed do TikTok',
        desc: `O feed do TikTok consumiu ${tikMin} minutos. Tente limitar a 15m diários para proteger seus blocos de foco. 'A disciplina vence o talento!'`
      });
    }
    if (instaMin > 45 * numDaysInPeriod) {
      recs.push({
        title: 'Atenção com Rolagem do Instagram',
        desc: `Você dedicou ${instaMin} minutos ao Instagram. Desative as notificações secundárias para manter-se alinhado às suas metas.`
      });
    }
    if (whatsMin > 120 * numDaysInPeriod) {
      recs.push({
        title: 'Foco nos Grupos de WhatsApp',
        desc: `WhatsApp ativo por ${whatsMin} minutos. Considere fixar apenas contatos essenciais e arquivar conversas de distração.`
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: 'Consumo sob controle!',
        desc: 'Excelente nível de atenção e disciplina. Seus tempos de redes sociais estão dentro das métricas saudáveis recomendadas!'
      });
    }
    return recs;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Main Navigation Header */}
      <div className="bg-[#161616] border border-[#222222] p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 bg-indigo-500/10 text-[#818CF8] rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              Estatísticas e Insights Integrados <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-[#8E8E8F] font-semibold uppercase tracking-wider">Acompanhe seu progresso ao longo do tempo</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-[#0D0D0D] border border-[#222222] p-1 rounded-xl w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveSubTab('geral')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'geral' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            Resumo Geral
          </button>
          <button
            onClick={() => setActiveSubTab('financas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'financas' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            Estatísticas das Finanças
          </button>
          <button
            onClick={() => setActiveSubTab('aplicativos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'aplicativos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
            }`}
          >
            Uso de Aplicativos
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: RESUMO GERAL */}
        {activeSubTab === 'geral' && (
          <motion.div
            key="geral"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Grid of 3 Main Metrics Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Focus Widget */}
              <div className="bg-[#161616] border border-[#222222] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E8F] uppercase tracking-wider pb-2 border-b border-[#222222]/30">
                  <Clock className="w-4 h-4 text-amber-500" /> Rendimento Focado
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Sessões</span>
                    <p className="text-lg font-bold text-white">{pomodoroStats.sessions}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Tempo Total</span>
                    <p className="text-lg font-bold text-white">{focusHrs} horas</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] text-[#8E8E8F] uppercase">
                    <span>Sessões completadas</span>
                    <span>Alvo: 10</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#222222]/50">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((pomodoroStats.sessions / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Finance Widget */}
              <div className="bg-[#161616] border border-[#222222] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E8F] uppercase tracking-wider pb-2 border-b border-[#222222]/30">
                  <Wallet className="w-4 h-4 text-emerald-500" /> Saúde Financeira
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Economias Gerais</span>
                    <p className={`text-sm font-bold truncate ${savingsAllTime >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatBRL(savingsAllTime)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Taxa Poupada</span>
                    <p className="text-sm font-bold text-white">{savingsRateAllTime}%</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] text-[#8E8E8F] uppercase">
                    <span>Taxa de Sobra</span>
                    <span>Min. Alvo: 30%</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#222222]/50">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(savingsRateAllTime, 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Habit Compliance Widget */}
              <div className="bg-[#161616] border border-[#222222] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E8F] uppercase tracking-wider pb-2 border-b border-[#222222]/30">
                  <CheckSquare className="w-4 h-4 text-indigo-500" /> Hábitos de Hoje
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Completados</span>
                    <p className="text-lg font-bold text-white">
                      {completedTodayCount} de {totalHabitsCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#8E8E8F]">Taxa</span>
                    <p className="text-lg font-bold text-white">{habitCompletionRate}%</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] text-[#8E8E8F] uppercase">
                    <span>Consistência Diária</span>
                    <span>Alvo: 100%</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#222222]/50">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${habitCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses Distribution */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-[#222222]/30 pb-3">
                  <h3 className="font-bold text-sm text-white">Distribuição Geral de Despesas</h3>
                  <p className="text-[10px] text-[#8E8E8F]">Gastos agrupados por categoria ao longo do tempo</p>
                </div>

                <div className="space-y-4">
                  {Object.keys(expenseCategoriesAllTime).length === 0 ? (
                    <p className="text-xs text-[#8E8E8F] text-center py-6">Nenhuma despesa registrada para exibir distribuição.</p>
                  ) : (
                    Object.entries(expenseCategoriesAllTime).map(([cat, amt]) => {
                      const percent = maxExpenseCategoryAmountAllTime > 0 ? Math.round((amt / maxExpenseCategoryAmountAllTime) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-white">{cat}</span>
                            <span className="text-[#8E8E8F]">{formatBRL(amt)}</span>
                          </div>
                          <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#222222]/50">
                            <div
                              className="bg-red-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Goals Progress Distribution */}
              <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-[#222222]/30 pb-3">
                  <h3 className="font-bold text-sm text-white">Andamento Geral de Metas</h3>
                  <p className="text-[10px] text-[#8E8E8F]">Evolução dos seus objetivos estruturados</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0D0D0D] border border-[#222222]/40 rounded-xl space-y-1">
                    <span className="text-[10px] text-[#8E8E8F] uppercase font-bold tracking-wider">Metas Concluídas</span>
                    <p className="text-xl font-bold text-emerald-500">
                      {completedGoalsCount} de {totalGoalsCount}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0D0D0D] border border-[#222222]/40 rounded-xl space-y-1">
                    <span className="text-[10px] text-[#8E8E8F] uppercase font-bold tracking-wider">Progresso Médio</span>
                    <p className="text-xl font-bold text-[#6366F1]">
                      {averageGoalProgress}%
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] text-[#8E8E8F]">
                    <span>Progresso geral de objetivos</span>
                    <span>{averageGoalProgress}% completado</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] h-2.5 rounded-full overflow-hidden border border-[#222222]/50">
                    <div
                      className="bg-[#6366F1] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${averageGoalProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ESTATÍSTICAS DAS FINANÇAS */}
        {activeSubTab === 'financas' && (
          <motion.div
            key="financas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters Header Card */}
            <div className="bg-[#161616] border border-[#222222] p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Período de Análise Financeira
                  </h4>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Filtre seus lançamentos e visualize a evolução do fluxo de caixa</p>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap gap-1 bg-[#0D0D0D] border border-[#222222] p-1 rounded-xl">
                  {['dia', 'semana', 'mes', 'trimestre', 'semestre', 'ano', 'personalizado'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFinancePeriod(opt)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all ${
                        financePeriod === opt ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
                      }`}
                    >
                      {opt === 'mes' ? 'Mês' : opt === 'dia' ? 'Dia' : opt === 'semana' ? 'Semana' : opt === 'trimestre' ? 'Trimestre' : opt === 'semestre' ? 'Semestre' : opt === 'ano' ? 'Ano' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Picker Inputs */}
              {financePeriod === 'personalizado' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-2 border-t border-[#222222]/30 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Início do Período</label>
                    <input
                      type="date"
                      value={customFinStart}
                      onChange={(e) => setCustomFinStart(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Fim do Período</label>
                    <input
                      type="date"
                      value={customFinEnd}
                      onChange={(e) => setCustomFinEnd(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Financial Status KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Receipts card */}
              <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Receitas no Período</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">{formatBRL(periodIncomeTotal)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Expenses card */}
              <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">Despesas no Período</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">{formatBRL(periodExpenseTotal)}</p>
                </div>
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>

              {/* Net Balance card */}
              <div className="bg-[#161616] border border-[#222222] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Saldo Líquido</span>
                  <p className={`text-xl sm:text-2xl font-extrabold font-mono ${periodNetBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {formatBRL(periodNetBalance)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${periodNetBalance >= 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Dynamic Evolution Trend Line & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left pane: Dynamic Chart Evolution (8 cols) */}
              <div className="lg:col-span-8 bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Evolução Financeira Comparativa
                  </h3>
                  <p className="text-[10px] text-[#8E8E8F]">Visualização de receitas e despesas ordenadas temporalmente no período</p>
                </div>

                {financeTrendData.length === 0 ? (
                  <div className="py-20 text-center text-[#8E8E8F] text-xs space-y-1 bg-[#0D0D0D] border border-[#222222] rounded-xl">
                    <p className="font-semibold text-white">Nenhum dado cadastrado ainda.</p>
                    <p className="text-[10px]">Adicione informações para visualizar suas estatísticas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* SVG Chart Render */}
                    <div className="w-full h-64 bg-[#0D0D0D] border border-[#222222] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-1/4 border-b border-[#222222]/30 pointer-events-none" />
                      <div className="absolute inset-x-0 top-2/4 border-b border-[#222222]/30 pointer-events-none" />
                      <div className="absolute inset-x-0 top-3/4 border-b border-[#222222]/30 pointer-events-none" />

                      {/* Render line segments inside SVG view box */}
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        {/* Area gradient definition */}
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Drawing paths if points exist */}
                        {(() => {
                          const pts = financeTrendData;
                          const maxVal = Math.max(...pts.map(p => Math.max(Math.abs(p.income), Math.abs(p.expense), Math.abs(p.balance), 100)));
                          const xSpacing = 500 / Math.max(1, pts.length - 1);
                          
                          // Helper to map value to SVG Y coordinates
                          const getY = (val: number) => {
                            const ratio = (val / maxVal) * 80; // Scale to fit in 200px svg heights
                            return 100 - ratio; // 100 is baseline center
                          };

                          // Incomes coordinates
                          const incomeCoords = pts.map((p, i) => `${i * xSpacing},${getY(p.income)}`).join(' ');
                          // Expenses coordinates
                          const expenseCoords = pts.map((p, i) => `${i * xSpacing},${getY(-p.expense)}`).join(' ');
                          // Cumulative Balance coordinates
                          const balanceCoords = pts.map((p, i) => `${i * xSpacing},${getY(p.balance)}`).join(' ');

                          return (
                            <>
                              {/* Incomes Area/Line (Greenish overlay) */}
                              <polyline
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={incomeCoords}
                                className="opacity-80"
                              />

                              {/* Expenses Area/Line (Rose overlay) */}
                              <polyline
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={expenseCoords}
                                className="opacity-80"
                              />

                              {/* Net Balance Solid Overlay line */}
                              <polyline
                                fill="none"
                                stroke="#6366F1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={balanceCoords}
                              />

                              {/* Tooltip trigger indicators */}
                              {pts.map((p, i) => (
                                <g key={i} className="group/dot cursor-pointer">
                                  <circle
                                    cx={i * xSpacing}
                                    cy={getY(p.balance)}
                                    r="4"
                                    fill="#6366F1"
                                    stroke="#161616"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx={i * xSpacing}
                                    cy={getY(p.balance)}
                                    r="8"
                                    fill="#6366F1"
                                    className="opacity-0 group-hover/dot:opacity-30 transition-opacity"
                                  />
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>

                      {/* X Axis labels */}
                      <div className="flex justify-between text-[8px] text-[#8E8E8F] font-mono mt-2 pt-2 border-t border-[#222222]/30">
                        {financeTrendData.map((p, i) => (
                          <span key={i} className="truncate max-w-[40px] text-center">
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Legend keys */}
                    <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Receitas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Despesas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span>Evolução do Saldo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right pane: Period Category Breakdown (4 cols) */}
              <div className="lg:col-span-4 bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Breakdown do Período</h3>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Soma e proporção dos gastos do intervalo selecionado</p>
                </div>

                <div className="space-y-4 pt-2">
                  {Object.keys(periodExpenseCategories).length === 0 ? (
                    <p className="text-xs text-[#8E8E8F] text-center py-10">Nenhuma despesa para detalhar.</p>
                  ) : (
                    Object.entries(periodExpenseCategories).map(([cat, rawAmt]) => {
                      const amt = rawAmt as number;
                      const absoluteSum = amt;
                      const percentVal = periodTotalExpensesSum > 0 ? (amt / periodTotalExpensesSum) * 100 : 0;
                      const sizePercent = periodMaxExpenseCategoryAmount > 0 ? Math.round((amt / periodMaxExpenseCategoryAmount) * 100) : 0;

                      return (
                        <div key={cat} className="space-y-1.5 p-2 bg-[#0D0D0D]/50 rounded-xl border border-[#222222]/40">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{cat}</span>
                            <span className="font-mono text-[10px] text-gray-400">
                              {percentVal.toFixed(1)}% ({formatBRL(absoluteSum)})
                            </span>
                          </div>

                          <div className="w-full bg-[#0D0D0D] h-2 rounded-full overflow-hidden border border-[#222222]/50">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${sizePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Ledger List of the period */}
            <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222222]/30 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Lançamentos deste Período</h3>
                  <p className="text-[10px] text-[#8E8E8F]">Consulte e filtre transações correspondentes às datas escolhidas</p>
                </div>

                {/* Ledger search */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-3.5 h-3.5 text-[#8E8E8F]" />
                  </span>
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Pesquisar lançamentos..."
                    className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Transactions table of the selected period */}
              <div className="overflow-x-auto">
                {filteredFinTransactions.length === 0 ? (
                  <p className="text-xs text-[#8E8E8F] text-center py-10">Nenhum lançamento encontrado no período selecionado.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#222222] text-[#8E8E8F] font-bold">
                        <th className="pb-2.5 pl-2">Lançamento</th>
                        <th className="pb-2.5">Tipo</th>
                        <th className="pb-2.5">Categoria</th>
                        <th className="pb-2.5">Data</th>
                        <th className="pb-2.5 text-right pr-2">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]/30">
                      {filteredFinTransactions
                        .filter(t => t.description.toLowerCase().includes(ledgerSearch.toLowerCase()))
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map(t => (
                          <tr key={t.id} className="hover:bg-[#222222]/10 transition-colors">
                            <td className="py-2.5 pl-2 font-bold text-white">{t.description}</td>
                            <td className="py-2.5">
                              {t.type === 'income' ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 uppercase tracking-wider">
                                  Receita
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-950/20 text-rose-400 border border-rose-900/30 uppercase tracking-wider">
                                  Despesa
                                </span>
                              )}
                            </td>
                            <td className="py-2.5">
                              <span className="px-1.5 py-0.5 bg-[#222222] text-[#8E8E8F] rounded text-[10px] font-bold">
                                {t.category}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono text-[#8E8E8F]">
                              {t.date.split('-').reverse().join('/')}
                            </td>
                            <td className={`py-2.5 text-right pr-2 font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.type === 'income' ? '+' : '-'} {formatBRL(t.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CONTROLE DE APLICATIVOS */}
        {activeSubTab === 'aplicativos' && (
          <motion.div
            key="aplicativos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter Bar */}
            <div className="bg-[#161616] border border-[#222222] p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-400" /> Período de Uso dos Aplicativos
                  </h4>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Monitore seu consumo de redes sociais e bloqueios automáticos</p>
                </div>

                <div className="flex flex-wrap gap-1 bg-[#0D0D0D] border border-[#222222] p-1 rounded-xl">
                  {['dia', 'semana', 'mes', 'trimestre', 'semestre', 'ano', 'personalizado'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAppPeriod(opt)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all ${
                        appPeriod === opt ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8E8E8F] hover:text-white'
                      }`}
                    >
                      {opt === 'mes' ? 'Mês' : opt === 'dia' ? 'Dia' : opt === 'semana' ? 'Semana' : opt === 'trimestre' ? 'Trimestre' : opt === 'semestre' ? 'Semestre' : opt === 'ano' ? 'Ano' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>

              {appPeriod === 'personalizado' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-2 border-t border-[#222222]/30 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Início</label>
                    <input
                      type="date"
                      value={customAppStart}
                      onChange={(e) => setCustomAppStart(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8E8E8F] uppercase tracking-wider">Fim</label>
                    <input
                      type="date"
                      value={customAppEnd}
                      onChange={(e) => setCustomAppEnd(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Exceeded Limits Warn and Custom Advice Section */}
            {exceededAppLimits.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">Alertas de Limite de Tempo Excedido!</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {exceededAppLimits.map((alert: any) => (
                    <div key={alert.appId} className="bg-[#0D0D0D]/40 border border-rose-500/20 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-white">{alert.name}</span>
                        <span className="text-rose-400 font-bold font-mono">Excedeu por {alert.exceededBy}m</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E8F] leading-relaxed">
                        Seu limite diário é de <b>{alert.dailyLimit}m</b> (Permitido acumulado: <b>{alert.cumulativeAllowed}m</b>), mas seu uso real foi de <b className="text-rose-400 font-mono">{alert.actualCumulative}m</b>.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Line Trend and Application Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Usage trend over time (8 cols) */}
              <div className="lg:col-span-8 bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Histórico e Tendência de Consumo Diário
                  </h3>
                  <p className="text-[10px] text-[#8E8E8F]">Consulte o gráfico para avaliar se seu tempo de tela diminuiu ou aumentou no período</p>
                </div>

                {filteredAppHistory.length === 0 ? (
                  <div className="py-20 text-center text-[#8E8E8F] text-xs space-y-1 bg-[#0D0D0D] border border-[#222222] rounded-xl">
                    <p className="font-semibold text-white">Nenhum dado cadastrado ainda.</p>
                    <p className="text-[10px]">Adicione informações para visualizar suas estatísticas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* SVG Screen usage trend */}
                    <div className="w-full h-64 bg-[#0D0D0D] border border-[#222222] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
                      {/* Grid overlays */}
                      <div className="absolute inset-x-0 top-1/4 border-b border-[#222222]/30 pointer-events-none" />
                      <div className="absolute inset-x-0 top-2/4 border-b border-[#222222]/30 pointer-events-none" />
                      <div className="absolute inset-x-0 top-3/4 border-b border-[#222222]/30 pointer-events-none" />

                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        {(() => {
                          const maxVal = Math.max(...filteredAppHistory.map(h => h.totalMinutes || 100), 100);
                          const xSpacing = 500 / Math.max(1, filteredAppHistory.length - 1);
                          
                          // Convert minutes to SVG height coords (100 is safe scale ratio)
                          const getY = (val: number) => {
                            const ratio = (val / maxVal) * 160;
                            return 180 - ratio; // margin bounding
                          };

                          // Render area polygons
                          const pointsStr = filteredAppHistory.map((h, i) => `${i * xSpacing},${getY(h.totalMinutes)}`).join(' ');
                          const areaPoints = `0,180 ${pointsStr} ${500},180`;

                          return (
                            <>
                              {/* Semi-transparent violet filled area */}
                              <polygon
                                points={areaPoints}
                                fill="url(#chartGrad)"
                                className="opacity-40"
                              />

                              {/* Solid line trend */}
                              <polyline
                                fill="none"
                                stroke="#818CF8"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={pointsStr}
                              />

                              {/* Individual dots */}
                              {filteredAppHistory.map((h, i) => (
                                <circle
                                  key={i}
                                  cx={i * xSpacing}
                                  cy={getY(h.totalMinutes)}
                                  r="3.5"
                                  fill="#818CF8"
                                  stroke="#161616"
                                  strokeWidth="1.5"
                                />
                              ))}
                            </>
                          );
                        })()}
                      </svg>

                      {/* X Axis dates */}
                      <div className="flex justify-between text-[8px] text-[#8E8E8F] font-mono mt-2 pt-2 border-t border-[#222222]/30">
                        {filteredAppHistory.map((h, i) => {
                          // Keep visible only standard ticks to avoid layout wrapping
                          const showTick = filteredAppHistory.length <= 10 || i % Math.ceil(filteredAppHistory.length / 5) === 0 || i === filteredAppHistory.length - 1;
                          return (
                            <span key={i} className={`truncate max-w-[45px] text-center ${showTick ? 'opacity-100' : 'opacity-0'}`}>
                              {h.date.split('-').reverse().slice(0,2).join('/')}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-center text-[10px] font-bold text-indigo-400">
                      Total Consumido: {totalAppMinutesSum} minutos no período
                    </div>
                  </div>
                )}
              </div>

              {/* Cumulative Share per app (4 cols) */}
              <div className="lg:col-span-4 bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Percentual e Soma do Uso</h3>
                  <p className="text-[10px] text-[#8E8E8F] mt-0.5">Tempo acumulado gasto em cada rede social com o valor somado ao total</p>
                </div>

                <div className="space-y-4 pt-2">
                  {socialAppConfigs.map(app => {
                    const minutes = appCumulativeTotals[app.id as keyof typeof appCumulativeTotals] || 0;
                    const pct = totalAppMinutesSum > 0 ? (minutes / totalAppMinutesSum) * 100 : 0;
                    const IconComp = app.icon;

                    return (
                      <div key={app.id} className="p-3 bg-[#0D0D0D]/50 border border-[#222222]/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${app.bg} ${app.text}`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-extrabold text-white">{app.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">{minutes}m</span>
                        </div>

                        {/* Percent and total comparison */}
                        <div className="flex justify-between items-center text-[10px] text-[#8E8E8F]">
                          <span>Fração de Tela</span>
                          <span className="text-indigo-400 font-bold">{pct.toFixed(1)}% do uso total</span>
                        </div>

                        <div className="w-full bg-[#0D0D0D] h-1.5 rounded-full overflow-hidden border border-[#222222]/30">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ backgroundColor: app.color, width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Recommendations / Discipline Insights card */}
            <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Diretrizes de Produtividade Personalizadas
                </h3>
                <p className="text-[10px] text-[#8E8E8F]">Conselhos práticos adaptados ao seu padrão de comportamento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-[#0D0D0D]/60 border border-[#222222] p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 text-[#818CF8] rounded-xl shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-extrabold text-white">{rec.title}</h5>
                      <p className="text-[11px] text-[#8E8E8F] leading-relaxed">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
