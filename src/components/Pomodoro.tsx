import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, SkipForward, Award, Volume2, VolumeX, Sparkles, Flame, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface PomodoroProps {
  onSessionComplete: (minutes: number) => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface Technique {
  id: string;
  name: string;
  workMinutes: number;
  breakMinutes: number;
  description: string;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'classic',
    name: '25/5 (Clássico)',
    workMinutes: 25,
    breakMinutes: 5,
    description: 'Excelente para manter o foco constante sem fadiga mental.',
  },
  {
    id: 'extreme',
    name: '50/10 (Foco Extremo)',
    workMinutes: 50,
    breakMinutes: 10,
    description: 'Ideal para tarefas complexas que exigem imersão profunda.',
  },
  {
    id: 'short',
    name: '15/3 (Sessão Rápida)',
    workMinutes: 15,
    breakMinutes: 3,
    description: 'Para quando você tem pouco tempo ou está com dificuldades de começar.',
  },
  {
    id: 'intense',
    name: '90/15 (Estudo Intenso)',
    workMinutes: 90,
    breakMinutes: 15,
    description: 'Indicado para blocos de estudo denso com descanso merecido.',
  },
];

export default function Pomodoro({ onSessionComplete }: PomodoroProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [selectedTechId, setSelectedTechId] = useState('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const activeTech = TECHNIQUES.find((t) => t.id === selectedTechId) || TECHNIQUES[0];

  // Mode durations (in seconds)
  const durations: Record<TimerMode, number> = {
    work: activeTech.workMinutes * 60,
    shortBreak: activeTech.breakMinutes * 60,
    longBreak: 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState(durations.work);
  const [isActive, setIsActive] = useState(false);

  // Stats stored locally
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('fm_pomodoro_stats');
    if (saved) return JSON.parse(saved);
    return { sessions: 0, totalMinutes: 0 };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsActive(false);
  }, [selectedTechId, mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode, selectedTechId]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Play sound if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.log('AudioContext blocked or unsupported', e);
      }
    }

    if (mode === 'work') {
      const minutesCompleted = activeTech.workMinutes;
      const nextStats = {
        sessions: stats.sessions + 1,
        totalMinutes: stats.totalMinutes + minutesCompleted,
      };
      setStats(nextStats);
      localStorage.setItem('fm_pomodoro_stats', JSON.stringify(nextStats));
      onSessionComplete(minutesCompleted);
      alert(`Excelente trabalho! Sessão de foco concluída (${minutesCompleted} minutos). Hora de descansar!`);
      setMode('shortBreak');
    } else {
      alert('Intervalo concluído! Pronto para mais uma sessão de foco?');
      setMode('work');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  const skipTimer = () => {
    if (confirm('Deseja pular o temporizador atual?')) {
      setIsActive(false);
      if (mode === 'work') {
        setMode('shortBreak');
      } else {
        setMode('work');
      }
    }
  };

  // Percentage for countdown progress bar
  const totalDuration = durations[mode];
  const percentLeft = (timeLeft / totalDuration) * 100;

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
        
        {/* Header Block */}
        <div className="w-full flex justify-between items-center pb-3 border-b border-[#222222]/30">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E8F] uppercase tracking-wider">
            <Timer className="w-4 h-4 text-indigo-400" /> Cronômetro Pomodoro
          </div>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 hover:bg-[#222222] rounded-lg text-[#8E8E8F] hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar Alertas' : 'Ativar Som'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          </button>
        </div>

        {/* Technique Picker Block */}
        <div className="w-full space-y-2">
          <label className="text-[10px] text-[#8E8E8F] font-bold uppercase tracking-wider text-left block">
            Escolha sua Técnica de Foco:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TECHNIQUES.map((tech) => (
              <button
                key={tech.id}
                onClick={() => {
                  setSelectedTechId(tech.id);
                  setMode('work');
                }}
                className={`py-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedTechId === tech.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                    : 'bg-[#0D0D0D] border-[#222222] text-[#8E8E8F] hover:text-white hover:border-[#333333]'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {tech.name}
                </div>
                <p className="text-[8px] text-[#8E8E8F] mt-0.5 leading-tight truncate">
                  {tech.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector Buttons (Work vs Breaks) */}
        <div className="flex gap-2 p-1 bg-[#0D0D0D] border border-[#222222] rounded-2xl w-full max-w-md">
          {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => {
            const labels: Record<TimerMode, string> = {
              work: `Foco (${activeTech.workMinutes}m)`,
              shortBreak: `Intervalo (${activeTech.breakMinutes}m)`,
              longBreak: 'Pausa Longa (15m)',
            };
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-[#8E8E8F] hover:text-white'
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>

        {/* Timer countdown dial block */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[#222222] bg-[#0D0D0D] flex flex-col items-center justify-center shadow-inner">
          
          {/* Radial progress circle using fully responsive SVG viewBox */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#161616]"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-indigo-500 transition-all duration-1000"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - percentLeft / 100)}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="z-10 space-y-1">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white font-mono block">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold text-[#8E8E8F] uppercase tracking-widest block">
              {mode === 'work' ? 'Tempo de Foco' : 'Descanso'}
            </span>
          </div>
        </div>

        {/* Play/Pause controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] text-[#8E8E8F] hover:text-white rounded-2xl transition-colors cursor-pointer"
            title="Recomeçar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-all ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={skipTimer}
            className="p-3 bg-[#0D0D0D] hover:bg-[#222222] border border-[#222222] text-[#8E8E8F] hover:text-white rounded-2xl transition-colors cursor-pointer"
            title="Pular"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Motivational Quotes Box (2 Phrases) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161616] border border-indigo-500/10 rounded-2xl p-5 flex gap-4 items-start">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-left">
            <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Poder da Mente</h5>
            <p className="text-[11px] text-[#8E8E8F] leading-relaxed">
              "Sua mente é como um músculo: o foco é o treino extremo, e o descanso é onde a mágica da memorização e do crescimento acontece!"
            </p>
          </div>
        </div>

        <div className="bg-[#161616] border border-indigo-500/10 rounded-2xl p-5 flex gap-4 items-start">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0 mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-left">
            <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Evolução Diária</h5>
            <p className="text-[11px] text-[#8E8E8F] leading-relaxed">
              "Grandes conquistas de longo prazo são apenas a soma de pequenos blocos de foco inabalável. Vença uma única sessão de cada vez!"
            </p>
          </div>
        </div>
      </div>

      {/* Pomodoro Stats Box */}
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-5 flex items-center gap-4">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 text-left">
          <h4 className="text-xs font-bold text-white">Sua jornada de foco</h4>
          <p className="text-[10px] text-[#8E8E8F]">
            Você já completou <strong className="text-white font-bold">{stats.sessions} sessões</strong>, somando um total de{' '}
            <strong className="text-white font-bold">{stats.totalMinutes} minutos focados</strong>. Continue assim!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

