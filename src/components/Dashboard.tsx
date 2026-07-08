import React, { useEffect, useState } from 'react';
import { Smartphone, ShieldAlert, ShieldCheck, Instagram, Video, MessageCircle, Twitter, Activity, ArrowRight, Sparkles, Check, Minus, Flame, CheckSquare, Target, BookOpen, Award, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, CalendarAnnotation, Subject, SocialUsage, Habit, Goal } from '../types';
import { getDailyVerse } from '../utils/verses';

interface DashboardProps {
  user: UserProfile;
  annotations: CalendarAnnotation[];
  subjects: Subject[];
  habits?: Habit[];
  goals?: Goal[];
  onToggleHabitDay?: (id: string, dateKey: string) => void;
  onToggleGoalCompleted?: (id: string) => void;
  onIncrementGoalCount?: (id: string, amount: number) => void;
  onSwitchTab: (tabId: string) => void;
  onSelectSubject: (subjectId: string) => void;

  // Screen usage and devocional from central state
  usage: SocialUsage;
  permissionGranted: boolean;
  onTogglePermission: () => void;
  devocionalHistory: Record<string, 'Sim' | 'Não'>;
  onRegisterDevocional: (answer: 'Sim' | 'Não') => void;
}

export default function Dashboard({
  user,
  annotations,
  subjects,
  habits = [],
  goals = [],
  onToggleHabitDay,
  onToggleGoalCompleted,
  onIncrementGoalCount,
  onSwitchTab,
  onSelectSubject,
  usage,
  permissionGranted,
  onTogglePermission,
  devocionalHistory,
  onRegisterDevocional,
}: DashboardProps) {
  // Load last accessed subject
  const [lastSubject, setLastSubject] = useState<Subject | null>(null);
  const [dailyVerse, setDailyVerse] = useState(() => getDailyVerse());

  useEffect(() => {
    const lastId = localStorage.getItem('fm_nb_last_accessed_subject');
    if (lastId) {
      const match = subjects.find(s => s.id === lastId);
      setLastSubject(match || (subjects.length > 0 ? subjects[0] : null));
    } else if (subjects.length > 0) {
      setLastSubject(subjects[0]);
    } else {
      setLastSubject(null);
    }
  }, [subjects]);

  // Date Formatting Helper
  const getTodayKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = getTodayKey();
  const todayNotes = annotations.filter(note => note.date === todayKey);

  // Math stats for usage
  const totalMin = usage.instagram + usage.tiktok + usage.whatsapp + usage.x;
  const pInst = totalMin > 0 ? Math.round((usage.instagram / totalMin) * 100) : 0;
  const pTt = totalMin > 0 ? Math.round((usage.tiktok / totalMin) * 100) : 0;
  const pWa = totalMin > 0 ? Math.round((usage.whatsapp / totalMin) * 100) : 0;
  const pX = totalMin > 0 ? Math.round((usage.x / totalMin) * 100) : 0;

  const formatMinutes = (min: number) => {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Get current devotional answer for today
  const todayDevotionalAnswer = devocionalHistory[todayKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Permanent Highlight Phrase */}
      {habits && habits.length > 0 && (
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 border-l-4 border-l-emerald-500 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5.5 h-5.5 text-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-sm font-extrabold text-white tracking-wide">
              "Continue! A disciplina vence o talento!"
            </p>
          </div>
          <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            Consistência
          </span>
        </div>
      )}

      {/* 2. Daily Verse Widget */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
          <BookOpen className="w-4 h-4" /> Versículo do Dia
        </div>
        <p className="text-sm font-medium text-gray-200 leading-relaxed font-sans italic">
          "{dailyVerse.text}"
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-[#222222]/30">
          <span className="text-xs text-indigo-400 font-bold font-mono">{dailyVerse.reference}</span>
          <span className="text-[10px] bg-[#0D0D0D] border border-[#222222] px-2 py-0.5 rounded text-[#8E8E8F] font-semibold">{dailyVerse.topic}</span>
        </div>
      </div>

      {/* 3. Devocional Diário Widget */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-2">
            <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
            Devocional Diário
          </h3>
          <p className="text-[10px] text-[#8E8E8F]">"Você já fez seu devocional hoje?"</p>
        </div>

        {todayDevotionalAnswer ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D0D0D] border border-[#222222] rounded-xl">
            {todayDevotionalAnswer === 'Sim' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-extrabold text-emerald-400 font-sans">Hoje: Sim! 🎉</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-xs font-extrabold text-red-400 font-sans">Hoje: Não registrado. ⏳</span>
              </>
            )}
            <span className="text-[8px] text-[#8E8E8F] font-bold uppercase ml-2 font-mono">Salvo</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegisterDevocional('Sim')}
              className="px-5 py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" /> Sim
            </button>
            <button
              onClick={() => onRegisterDevocional('Não')}
              className="px-5 py-2 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" /> Não
            </button>
          </div>
        )}
      </div>

      {/* Motivational Quote Banner */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 border-l-4 border-l-blue-600 shadow-md flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium text-blue-500/90 font-sans tracking-wide leading-relaxed">
          "{user.quote}"
        </p>
      </div>


      {/* Dynamic Suggestions Block */}
      {(todayNotes.length > 0 || lastSubject) && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E8F]">Sugestões Inteligentes</h3>

          {/* Today's appointments */}
          {todayNotes.length > 0 && (
            <div className="bg-[#161616] border border-[#222222] border-l-4 border-l-blue-600 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-blue-500 leading-snug">Você tem compromisso marcado para hoje.</h4>
                  <div className="space-y-1 mt-2">
                    {todayNotes.slice(0, 3).map((note) => (
                      <p key={note.id} className="text-xs text-white/90 leading-relaxed truncate">
                        • {note.text}
                      </p>
                    ))}
                    {todayNotes.length > 3 && (
                      <p className="text-[10px] text-[#8E8E8F] italic">E mais {todayNotes.length - 3} itens...</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onSwitchTab('calendario')}
                  className="p-2.5 bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] rounded-xl text-[#8E8E8F] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Study reminder */}
          {lastSubject && (
            <div className="bg-[#161616] border border-[#222222] border-l-4 border-l-blue-600 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-blue-500 leading-snug">Que tal continuar seus estudos de onde você parou?</h4>
                  <p className="text-xs text-white/90 font-medium mt-2">
                    Matéria ativa: <span className="text-[#8E8E8F] font-normal">{lastSubject.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSwitchTab('caderno');
                    onSelectSubject(lastSubject.id);
                  }}
                  className="p-2.5 bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] rounded-xl text-[#8E8E8F] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Time Tracker, Habits Grid & Goals Grid */}
      <div className={`grid grid-cols-1 ${
        (habits.length > 0 && goals.length > 0)
          ? 'xl:grid-cols-3 lg:grid-cols-2'
          : (habits.length > 0 || goals.length > 0)
            ? 'lg:grid-cols-2'
            : ''
      } gap-6`}>
        {/* Screen Time Tracker */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222222]/30">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-blue-500 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Tempo de Uso - Redes Sociais
                </h3>
                <p className="text-[10px] text-[#8E8E8F]">Métricas de tempo gasto em redes sociais conectadas.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Instagram */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-white/95">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
                  </span>
                  <span className="text-[#8E8E8F]">{pInst}% ({formatMinutes(usage.instagram)})</span>
                </div>
                <div className="w-full bg-[#0D0D0D] h-2.5 rounded-full overflow-hidden border border-[#222222]/50">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pInst}%` }}
                  ></div>
                </div>
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-white/95">
                    <Video className="w-3.5 h-3.5 text-cyan-400" /> TikTok
                  </span>
                  <span className="text-[#8E8E8F]">{pTt}% ({formatMinutes(usage.tiktok)})</span>
                </div>
                <div className="w-full bg-[#0D0D0D] h-2.5 rounded-full overflow-hidden border border-[#222222]/50">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pTt}%` }}
                  ></div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-white/95">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp
                  </span>
                  <span className="text-[#8E8E8F]">{pWa}% ({formatMinutes(usage.whatsapp)})</span>
                </div>
                <div className="w-full bg-[#0D0D0D] h-2.5 rounded-full overflow-hidden border border-[#222222]/50">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pWa}%` }}
                  ></div>
                </div>
              </div>

              {/* X */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-white/95">
                    <Twitter className="w-3.5 h-3.5 text-white" /> X (Twitter)
                  </span>
                  <span className="text-[#8E8E8F]">{pX}% ({formatMinutes(usage.x)})</span>
                </div>
                <div className="w-full bg-[#0D0D0D] h-2.5 rounded-full overflow-hidden border border-[#222222]/50">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pX}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[9px] text-[#8E8E8F] text-right italic">
              Dados de uso atualizados automaticamente.
            </p>
          </div>
        </div>

        {/* Habits Checklist Section on Start Page */}
        {habits.length > 0 && (
          <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]/30">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Hábitos de Hoje
                  </h3>
                  <p className="text-[10px] text-[#8E8E8F]">Risque suas metas diárias de foco e consistência.</p>
                </div>
                
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                  {habits.filter(h => h.daysCompleted.includes(todayKey)).length}/{habits.length} feitos
                </span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {habits.map((habit) => {
                  const todayCompleted = habit.daysCompleted.includes(todayKey);
                  return (
                    <div
                      key={habit.id}
                      className="p-3 rounded-xl bg-[#0D0D0D] border border-[#222222]/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleHabitDay?.(habit.id, todayKey)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            todayCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'border-[#333333] hover:border-[#6366F1] bg-[#161616]'
                          }`}
                          title={todayCompleted ? "Marcar como não feito" : "Marcar como feito"}
                        >
                          {todayCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className={`text-xs font-bold transition-all ${todayCompleted ? 'line-through text-[#8E8E8F]' : 'text-white'}`}>
                          {habit.name}
                        </span>
                      </div>

                      {/* Small flame streak indicator */}
                      {habit.daysCompleted.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-[#8E8E8F]">
                          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                          <span>{habit.daysCompleted.length}d</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222]/30 flex items-center justify-between text-[10px] text-[#8E8E8F]">
              <span className="italic">Edição desativada no início.</span>
            </div>
          </div>
        )}

        {/* Goals Checklist Section on Start Page */}
        {goals.length > 0 && (
          <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]/30">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Metas e Objetivos
                  </h3>
                  <p className="text-[10px] text-[#8E8E8F]">Seus objetivos de curto, médio e longo prazo.</p>
                </div>
                
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                  {goals.filter(g => g.completed).length}/{goals.length} concluídas
                </span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {goals.map((goal) => {
                  return (
                    <div
                      key={goal.id}
                      className="p-3 rounded-xl bg-[#0D0D0D] border border-[#222222]/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => onToggleGoalCompleted?.(goal.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                              goal.completed
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'border-[#333333] hover:border-[#6366F1] bg-[#161616]'
                            }`}
                            title={goal.completed ? "Marcar como não concluída" : "Marcar como concluída"}
                          >
                            {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate transition-all leading-tight ${goal.completed ? 'line-through text-[#8E8E8F]' : 'text-white'}`}>
                              {goal.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {goal.term && (
                                <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.2 rounded font-semibold">
                                  {goal.term}
                                </span>
                              )}
                              {goal.isNumeric && (
                                <span className="text-[8px] text-[#8E8E8F] font-mono">
                                  {goal.currentCount || 0} / {goal.targetCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Small percentage indicator */}
                        <span className="text-[10px] font-mono text-[#8E8E8F] flex-shrink-0 bg-[#161616] px-1.5 py-0.5 rounded border border-[#222222]/50">
                          {goal.progress}%
                        </span>
                      </div>

                      {/* Increment buttons on dashboard if numeric and not completed */}
                      {goal.isNumeric && !goal.completed && onIncrementGoalCount && (
                        <div className="flex items-center gap-1 self-end pl-8">
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 1)}
                            className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 2)}
                            className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +2"
                          >
                            +2
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, 3)}
                            className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 rounded cursor-pointer transition-colors"
                            title="Adicionar +3"
                          >
                            +3
                          </button>
                          <button
                            onClick={() => onIncrementGoalCount(goal.id, -1)}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-[#161616] hover:bg-[#222222] border border-[#222222] text-[#8E8E8F] rounded cursor-pointer transition-colors"
                            title="Remover -1"
                          >
                            <Minus className="w-2 h-2" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222]/30 flex items-center justify-between text-[10px] text-[#8E8E8F]">
              <span className="italic">Edição desativada no início.</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Progress Info Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-5 hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Painel Geral</h3>
          </div>
          <p className="text-xs text-[#8E8E8F]">Seu painel integrado para acompanhar os hábitos, finanças, estudos e metas do dia.</p>
        </div>
      </div>
    </motion.div>
  );
}
