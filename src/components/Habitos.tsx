import React, { useState } from 'react';
import { CheckSquare, Plus, Flame, Check, X, Award, Edit2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Habit } from '../types';

interface HabitosProps {
  habits: Habit[];
  onAddHabit: (name: string) => void;
  onToggleHabitDay: (id: string, dateKey: string) => void;
  onDeleteHabit: (id: string) => void;
  onRenameHabit: (id: string, newName: string) => void;
}

export default function Habitos({ habits, onAddHabit, onToggleHabitDay, onDeleteHabit, onRenameHabit }: HabitosProps) {
  const [habitName, setHabitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    onRenameHabit(id, editingName.trim());
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const getTodayKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = getTodayKey();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    onAddHabit(habitName.trim());
    setHabitName('');
  };

  // Generate date keys for the last 7 days (reverse order, today first)
  const getLast7Days = () => {
    const list = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push({
        dateKey: `${year}-${month}-${day}`,
        dayName: weekdays[d.getDay()],
        dayNum: d.getDate(),
      });
    }
    return list.reverse(); // Chronological order
  };

  const last7Days = getLast7Days();

  // Helper to compute consecutive streaks up to yesterday/today
  const calculateStreak = (habit: Habit) => {
    const completedSet = new Set(habit.daysCompleted);
    let streak = 0;
    let checkDate = new Date();

    // Check if completed today
    const todayStr = getTodayKey();
    let isCompletedTodayOrYesterday = completedSet.has(todayStr);

    if (!isCompletedTodayOrYesterday) {
      // Check yesterday as well to sustain streak if today hasn't been checked yet
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (completedSet.has(yesterdayStr)) {
        isCompletedTodayOrYesterday = true;
        checkDate = yesterday;
      }
    }

    if (isCompletedTodayOrYesterday) {
      while (true) {
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (completedSet.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1); // Go backward
        } else {
          break;
        }
      }
    }

    return streak;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Frase Motivacional Permanente */}
      {habits && habits.length > 0 && (
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 border-l-4 border-l-emerald-500 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5.5 h-5.5 text-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-sm font-extrabold text-white tracking-wide">
              "Continue! A disciplina vence o talento!"
            </p>
          </div>
          <span className="text-[9px] uppercase font-mono font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">Destaque</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create new habit */}
        <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div className="border-b border-[#222222]/30 pb-3 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#6366F1]" />
            <div>
              <h3 className="font-bold text-sm text-white">Novo Hábito</h3>
              <p className="text-[10px] text-[#8E8E8F]">Insira novos hábitos à sua rotina</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#8E8E8F] font-semibold">Nome do Hábito</label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ex: Meditar 10 minutos"
                className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 transition-colors py-3 rounded-xl text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> Criar Hábito
            </button>
          </form>

          {/* Habit Info Box */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Dica de Consistência
            </h4>
            <p className="text-[10px] text-[#8E8E8F] leading-relaxed">
              Tente começar com hábitos simples. Riscar tarefas completadas diariamente libera dopamina e ajuda seu cérebro a automatizar processos.
            </p>
          </div>
        </div>

        {/* Habits Checklist Grid */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#222222] rounded-2xl p-5 shadow-sm space-y-5 flex flex-col min-h-[350px]">
          <div className="border-b border-[#222222]/30 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-white">Rotina Diária</h3>
              <p className="text-[10px] text-[#8E8E8F]">Acompanhe e complete seus hábitos</p>
            </div>
            <span className="text-[10px] bg-[#222222] text-[#8E8E8F] px-2.5 py-1 rounded-md font-mono font-bold">
              {habits.length} ativos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {habits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <CheckSquare className="w-8 h-8 text-[#8E8E8F]/40" />
                <p className="text-xs text-[#8E8E8F]">Nenhum hábito cadastrado ainda.</p>
              </div>
            ) : (
              habits.map((habit) => {
                const todayCompleted = habit.daysCompleted.includes(todayKey);
                const currentStreak = calculateStreak(habit);

                return (
                  <div
                    key={habit.id}
                    className="p-4 rounded-xl bg-[#0D0D0D] border border-[#222222]/50 hover:border-[#222222] transition-colors space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {editingId === habit.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 bg-[#161616] border border-[#333333] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(habit.id)}
                            className="p-1.5 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/30 rounded-lg text-[#6366F1] hover:text-white transition-colors cursor-pointer"
                            title="Salvar alteração"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-[#222222] hover:bg-[#333333] border border-[#333333] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleHabitDay(habit.id, todayKey)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                              todayCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'border-[#333333] hover:border-[#6366F1] bg-[#161616]'
                            }`}
                            title={todayCompleted ? "Marcar como não feito" : "Marcar como feito"}
                          >
                            {todayCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div className="space-y-0.5">
                            <p className={`text-xs font-bold transition-all leading-tight ${todayCompleted ? 'line-through text-[#8E8E8F]' : 'text-white'}`}>{habit.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8E8E8F]">
                              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                              <span>Sequência: <strong className="text-orange-400 font-bold">{currentStreak} dias</strong></span>
                            </div>
                          </div>
                        </div>
                      )}

                      {editingId !== habit.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleHabitDay(habit.id, todayKey)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              todayCompleted
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
                                : 'bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300'
                            }`}
                          >
                            {todayCompleted ? <Check className="w-3 h-3" /> : null}
                            {todayCompleted ? 'Feito Hoje' : 'Marcar Feito'}
                          </button>

                          <button
                            onClick={() => handleStartEdit(habit.id, habit.name)}
                            className="p-1.5 border border-transparent hover:border-[#222222] hover:bg-[#161616] rounded-lg text-[#8E8E8F] hover:text-[#6366F1] transition-colors cursor-pointer"
                            title="Editar hábito"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeleteId === habit.id ? (
                            <div className="flex items-center gap-1.5 bg-red-950/30 border border-red-900/30 px-2 py-1 rounded-lg">
                              <span className="text-[10px] text-red-400 font-bold">Excluir?</span>
                              <button
                                onClick={() => {
                                  onDeleteHabit(habit.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] text-white bg-red-600 hover:bg-red-700 font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] text-[#8E8E8F] hover:text-white bg-[#222222] hover:bg-[#333333] px-2 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(habit.id)}
                              className="p-1.5 border border-transparent hover:border-[#222222] hover:bg-[#161616] rounded-lg text-[#8E8E8F] hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir hábito"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mini grid of last 7 days */}
                    <div className="pt-2 border-t border-[#222222]/30 flex justify-between items-center gap-2">
                      <span className="text-[9px] text-[#8E8E8F] uppercase font-bold tracking-wider">Histórico recente</span>
                      
                      <div className="flex items-center gap-1.5">
                        {last7Days.map((day) => {
                          const isDone = habit.daysCompleted.includes(day.dateKey);
                          const isToday = day.dateKey === todayKey;
                          
                          return (
                            <button
                              key={day.dateKey}
                              onClick={() => onToggleHabitDay(habit.id, day.dateKey)}
                              className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isToday
                                  ? 'border border-[#6366F1] bg-[#6366F1]/10 text-white'
                                  : 'bg-[#161616] border border-[#222222] text-[#8E8E8F]'
                              }`}
                              title={`${day.dayName} ${day.dayNum} - ${isDone ? 'Concluído' : 'Não concluído'}`}
                            >
                              <span className="text-[7px] font-bold uppercase leading-none">{day.dayName}</span>
                              <span className="text-[9px] font-bold leading-none mt-0.5">{day.dayNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
