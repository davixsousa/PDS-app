import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
import { UserProfile, CalendarAnnotation, Subject, Note, Transaction, Habit, Goal, SocialUsage } from './types';

// Components
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import LockScreen from './components/LockScreen';
import Dashboard from './components/Dashboard';
import Calendario from './components/Calendario';
import Caderno from './components/Caderno';
import Financas from './components/Financas';
import Habitos from './components/Habitos';
import Metas from './components/Metas';
import Pomodoro from './components/Pomodoro';
import Estatisticas from './components/Estatisticas';
import Configuracoes from './components/Configuracoes';
import BloqueadorApps from './components/BloqueadorApps';
import Biblia from './components/Biblia';

export default function App() {
  // 1. User profile state
  const [user, setUser] = useState<UserProfile>(() => {
    return {
      name: localStorage.getItem('fm_name') || 'Davi',
      avatar: localStorage.getItem('fm_avatar') || '',
      passwordEnabled: localStorage.getItem('fm_pw_enabled') === 'true',
      password: localStorage.getItem('fm_password') || '',
      quote: localStorage.getItem('fm_quote') || 'Se você não fizer, ninguém vai fazer por você.',
    };
  });

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAvatar = event.target.result as string;
          setUser(prev => ({ ...prev, avatar: newAvatar }));
          triggerToast('Foto de perfil atualizada da galeria!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Lock screen state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return user.passwordEnabled && !!user.password;
  });

  // 3. Navigation active tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 4. Calendar Annotations state
  const [annotations, setAnnotations] = useState<CalendarAnnotation[]>(() => {
    const saved = localStorage.getItem('fm_annotations');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Notebook subjects and notes state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('fm_nb_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('fm_nb_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(() => {
    return localStorage.getItem('fm_nb_active_subject') || null;
  });

  // 6. Finances transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fm_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // 7. Habits checklist state
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('fm_habits');
    return saved ? JSON.parse(saved) : [];
  });

  // 8. Goals state
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('fm_goals');
    return saved ? JSON.parse(saved) : [];
  });

  // Devocional History State
  const [devocionalHistory, setDevocionalHistory] = useState<Record<string, 'Sim' | 'Não'>>(() => {
    const saved = localStorage.getItem('fm_devocional_history');
    return saved ? JSON.parse(saved) : {};
  });

  const handleRegisterDevocional = (answer: 'Sim' | 'Não') => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const updated = {
      ...devocionalHistory,
      [today]: answer
    };
    setDevocionalHistory(updated);
    localStorage.setItem('fm_devocional_history', JSON.stringify(updated));
    triggerToast('Devocional registrado para hoje!');
  };

  // Usage permission state
  const [permissionGranted, setPermissionGranted] = useState<boolean>(() => {
    return localStorage.getItem('fm_usage_permission') === 'true';
  });

  const handleTogglePermission = () => {
    const next = !permissionGranted;
    setPermissionGranted(next);
    localStorage.setItem('fm_usage_permission', String(next));
    triggerToast(next ? 'Permissão de rastreamento concedida!' : 'Permissão revogada.');
  };

  // Daily Usage State
  const [usage, setUsage] = useState<SocialUsage>(() => {
    const saved = localStorage.getItem('fm_usage_data');
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const match = list.find(r => r.date === today);
          if (match) {
            return {
              instagram: match.apps.instagram || 0,
              tiktok: match.apps.tiktok || 0,
              whatsapp: match.apps.whatsapp || 0,
              x: match.apps.x || 0
            };
          }
        }
      } catch (e) {}
    }
    return { instagram: 0, tiktok: 0, whatsapp: 0, x: 0 };
  });

  // Keep historical usage data and today's usage synced
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const saved = localStorage.getItem('fm_usage_data');
    let list: any[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch (e) {}
    }
    
    const todayIdx = list.findIndex(r => r.date === today);
    const todayRecord = {
      date: today,
      totalMinutes: usage.instagram + usage.tiktok + usage.whatsapp + usage.x,
      apps: {
        instagram: usage.instagram,
        tiktok: usage.tiktok,
        whatsapp: usage.whatsapp,
        x: usage.x
      }
    };

    if (todayIdx >= 0) {
      list[todayIdx] = todayRecord;
    } else {
      list.push(todayRecord);
    }

    localStorage.setItem('fm_usage_data', JSON.stringify(list));
  }, [usage]);

  // 9. Toast messaging state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request notifications permission on app launch to provide high fidelity focus feedback
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fm_name', user.name);
    localStorage.setItem('fm_avatar', user.avatar);
    localStorage.setItem('fm_pw_enabled', String(user.passwordEnabled));
    localStorage.setItem('fm_password', user.password || '');
    localStorage.setItem('fm_quote', user.quote);
  }, [user]);

  // Toast auto-dismiss helper
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  /* --- Calendar Action Handlers --- */
  const handleAddAnnotation = (date: string, text: string) => {
    const next: CalendarAnnotation = {
      id: 'ann_' + Date.now(),
      date,
      text,
    };
    const updated = [...annotations, next];
    setAnnotations(updated);
    localStorage.setItem('fm_annotations', JSON.stringify(updated));
    triggerToast('Anotação criada com sucesso!');
  };

  const handleEditAnnotation = (id: string, text: string) => {
    const updated = annotations.map((ann) => (ann.id === id ? { ...ann, text } : ann));
    setAnnotations(updated);
    localStorage.setItem('fm_annotations', JSON.stringify(updated));
    triggerToast('Anotação editada com sucesso!');
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((ann) => ann.id !== id);
    setAnnotations(updated);
    localStorage.setItem('fm_annotations', JSON.stringify(updated));
    triggerToast('Anotação removida.');
  };

  /* --- Subject / Notes Action Handlers --- */
  const handleAddSubject = (name: string) => {
    const nextSub: Subject = {
      id: 'sub_' + Date.now(),
      name,
    };
    const updated = [...subjects, nextSub];
    setSubjects(updated);
    localStorage.setItem('fm_nb_subjects', JSON.stringify(updated));
    setSelectedSubjectId(nextSub.id);
    localStorage.setItem('fm_nb_active_subject', nextSub.id);
    triggerToast('Matéria criada!');
  };

  const handleRenameSubject = (id: string, newName: string) => {
    const updated = subjects.map((sub) => (sub.id === id ? { ...sub, name: newName } : sub));
    setSubjects(updated);
    localStorage.setItem('fm_nb_subjects', JSON.stringify(updated));
    triggerToast('Matéria renomeada!');
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter((sub) => sub.id !== id);
    const updatedNotes = notes.filter((n) => n.subjectId !== id);
    
    setSubjects(updatedSubjects);
    setNotes(updatedNotes);
    
    localStorage.setItem('fm_nb_subjects', JSON.stringify(updatedSubjects));
    localStorage.setItem('fm_nb_notes', JSON.stringify(updatedNotes));

    if (selectedSubjectId === id) {
      const nextActive = updatedSubjects.length > 0 ? updatedSubjects[0].id : null;
      setSelectedSubjectId(nextActive);
      if (nextActive) {
        localStorage.setItem('fm_nb_active_subject', nextActive);
      } else {
        localStorage.removeItem('fm_nb_active_subject');
      }
    }
    triggerToast('Matéria excluída.');
  };

  const handleAddNote = (subjectId: string, title: string, content: string) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const nextNote: Note = {
      id: 'note_' + Date.now(),
      subjectId,
      title,
      content,
      updatedAt: dateKey,
    };

    const updated = [...notes, nextNote];
    setNotes(updated);
    localStorage.setItem('fm_nb_notes', JSON.stringify(updated));
    triggerToast('Nota criada!');
  };

  const handleUpdateNote = useCallback((id: string, title: string, content: string, silent?: boolean) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setNotes((prevNotes) => {
      const updated = prevNotes.map((n) => (n.id === id ? { ...n, title, content, updatedAt: dateKey } : n));
      localStorage.setItem('fm_nb_notes', JSON.stringify(updated));
      return updated;
    });
    if (!silent) {
      triggerToast('Nota salva!');
    }
  }, [triggerToast]);

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('fm_nb_notes', JSON.stringify(updated));
    triggerToast('Nota excluída.');
  };

  /* --- Finance Action Handlers --- */
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const next: Transaction = {
      ...t,
      id: 'tx_' + Date.now(),
    };
    const updated = [...transactions, next];
    setTransactions(updated);
    localStorage.setItem('fm_transactions', JSON.stringify(updated));
    triggerToast('Transação registrada!');
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('fm_transactions', JSON.stringify(updated));
    triggerToast('Transação removida.');
  };

  /* --- Habits Action Handlers --- */
  const handleAddHabit = (name: string) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const next: Habit = {
      id: 'hb_' + Date.now(),
      name,
      daysCompleted: [],
      streak: 0,
      createdAt: dateKey,
    };
    const updated = [...habits, next];
    setHabits(updated);
    localStorage.setItem('fm_habits', JSON.stringify(updated));
    triggerToast('Hábito criado!');
  };

  const handleToggleHabitDay = (id: string, dateKey: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const completedList = h.daysCompleted.includes(dateKey)
          ? h.daysCompleted.filter((d) => d !== dateKey)
          : [...h.daysCompleted, dateKey];
        return {
          ...h,
          daysCompleted: completedList,
        };
      }
      return h;
    });
    setHabits(updated);
    localStorage.setItem('fm_habits', JSON.stringify(updated));
    triggerToast('Progresso atualizado!');
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    localStorage.setItem('fm_habits', JSON.stringify(updated));
    triggerToast('Hábito excluído.');
  };

  const handleRenameHabit = (id: string, newName: string) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, name: newName } : h));
    setHabits(updated);
    localStorage.setItem('fm_habits', JSON.stringify(updated));
    triggerToast('Hábito alterado!');
  };

  /* --- Goals Action Handlers --- */
  const handleAddGoal = (g: Omit<Goal, 'id' | 'completed'>) => {
    const next: Goal = {
      ...g,
      id: 'gl_' + Date.now(),
      completed: g.progress === 100,
    };
    const updated = [...goals, next];
    setGoals(updated);
    localStorage.setItem('fm_goals', JSON.stringify(updated));
    triggerToast('Meta registrada!');
  };

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          progress,
          completed: progress === 100,
        };
      }
      return g;
    });
    setGoals(updated);
    localStorage.setItem('fm_goals', JSON.stringify(updated));
  };

  const handleToggleGoalCompleted = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;
        let currentCount = g.currentCount;
        if (g.isNumeric && g.targetCount !== undefined) {
          currentCount = nextCompleted ? g.targetCount : 0;
        }
        return {
          ...g,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : 0,
          currentCount,
        };
      }
      return g;
    });
    setGoals(updated);
    localStorage.setItem('fm_goals', JSON.stringify(updated));
    triggerToast('Status da meta atualizado!');
  };

  const handleIncrementGoalCount = (id: string, amount: number) => {
    const updated = goals.map((g) => {
      if (g.id === id && g.isNumeric && g.targetCount !== undefined) {
        const nextCount = Math.max(0, Math.min(g.targetCount, (g.currentCount || 0) + amount));
        const progress = Math.round((nextCount / g.targetCount) * 100);
        return {
          ...g,
          currentCount: nextCount,
          progress,
          completed: nextCount >= g.targetCount,
        };
      }
      return g;
    });
    setGoals(updated);
    localStorage.setItem('fm_goals', JSON.stringify(updated));
    triggerToast('Progresso da meta atualizado!');
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    localStorage.setItem('fm_goals', JSON.stringify(updated));
    triggerToast('Meta excluída.');
  };

  /* --- Pomodoro Completion Handler --- */
  const handlePomodoroSessionComplete = (minutes: number) => {
    // We can log study focus inside notes or simply update triggerToast
    triggerToast(`Sessão de foco de ${minutes} minutos concluída!`);
  };

  /* --- Save Settings Handler --- */
  const handleSaveSettings = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    triggerToast('Configurações salvas!');
  };

  const handleSelectSubject = (id: string | null) => {
    setSelectedSubjectId(id);
    if (id) {
      localStorage.setItem('fm_nb_active_subject', id);
    } else {
      localStorage.removeItem('fm_nb_active_subject');
    }
  };

  // Switch views inside primary layout
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            annotations={annotations}
            subjects={subjects}
            habits={habits}
            goals={goals}
            onToggleHabitDay={handleToggleHabitDay}
            onToggleGoalCompleted={handleToggleGoalCompleted}
            onIncrementGoalCount={handleIncrementGoalCount}
            onSwitchTab={setActiveTab}
            onSelectSubject={handleSelectSubject}
            usage={usage}
            permissionGranted={permissionGranted}
            onTogglePermission={handleTogglePermission}
            devocionalHistory={devocionalHistory}
            onRegisterDevocional={handleRegisterDevocional}
          />
        );
      case 'calendario':
        return (
          <Calendario
            annotations={annotations}
            onAddAnnotation={handleAddAnnotation}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
          />
        );
      case 'caderno':
        return (
          <Caderno
            subjects={subjects}
            notes={notes}
            selectedSubjectId={selectedSubjectId}
            onAddSubject={handleAddSubject}
            onRenameSubject={handleRenameSubject}
            onDeleteSubject={handleDeleteSubject}
            onSelectSubject={handleSelectSubject}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'biblia':
        return <Biblia />;
      case 'financas':
        return (
          <Financas
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'habitos':
        return (
          <Habitos
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabitDay={handleToggleHabitDay}
            onDeleteHabit={handleDeleteHabit}
            onRenameHabit={handleRenameHabit}
          />
        );
      case 'metas':
        return (
          <Metas
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onToggleGoalCompleted={handleToggleGoalCompleted}
            onDeleteGoal={handleDeleteGoal}
            onIncrementGoalCount={handleIncrementGoalCount}
          />
        );
      case 'pomodoro':
        return <Pomodoro onSessionComplete={handlePomodoroSessionComplete} />;
      case 'estatisticas':
        return <Estatisticas transactions={transactions} habits={habits} goals={goals} />;
      case 'configuracoes':
        return <Configuracoes user={user} onSave={handleSaveSettings} />;
      case 'bloqueador':
        return (
          <BloqueadorApps 
            user={user} 
            onSaveAvatar={(newAvatar) => setUser(prev => ({ ...prev, avatar: newAvatar }))} 
          />
        );
      default:
        return null;
    }
  };

  if (isLocked) {
    return <LockScreen user={user} onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[999] bg-[#161616] border border-[#222222] px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse"></div>
            <span className="text-xs text-white font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSwitchTab={setActiveTab} user={user} />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-6">
        
        {/* Top Header Grid */}
        <header className="p-6 md:px-8 md:py-6 border-b border-[#222222]/30 bg-[#0D0D0D]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#6366F1] flex items-center gap-2">
                Olá {user.name}! <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </h1>
              <p className="text-sm md:text-base font-medium text-[#8E8E8F] tracking-tight">
                O que iremos fazer hoje?
              </p>
            </div>

            {/* Profile circular preview (clicável para escolher foto da galeria) */}
            <div 
              onClick={() => headerFileInputRef.current?.click()}
              className="relative w-12 h-12 rounded-full border border-[#222222] hover:border-[#6366F1]/50 overflow-hidden bg-[#161616] flex items-center justify-center flex-shrink-0 cursor-pointer group transition-all"
              title="Escolher foto de perfil da galeria"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:opacity-85 transition-opacity" />
              ) : (
                <User className="w-6 h-6 text-[#8E8E8F] group-hover:text-white transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[8px] text-indigo-300 font-extrabold text-center leading-none uppercase tracking-wider">Galeria</span>
              </div>
            </div>
            <input
              ref={headerFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeaderAvatarUpload}
              className="hidden"
            />
          </div>
        </header>

        {/* Tab Container */}
        <div className="px-6 md:px-8 py-6 flex-1 max-w-4xl w-full mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Mobile navigation bottom bar */}
      <MobileNav activeTab={activeTab} onSwitchTab={setActiveTab} />
    </div>
  );
}
