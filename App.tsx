
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Aspirant, AuthenticationStatus, UserContext, NexusModule } from './types';
import { 
    getNexusModules, getSimuLabModules, getCombatZoneModules, RANKS, BADGES, LEADERBOARD_DATA, 
    EDUCATION_CATEGORIES, SCHOOL_BOARDS, SCHOOL_GRADES, COLLEGE_DEGREES, COMPETITIVE_EXAMS 
} from './constants';
import { motion, AnimatePresence } from 'motion/react';
import ProfileSidebar from './components/ProfileSidebar';
import KnowledgeConstellation from './components/KnowledgeConstellation';
import MainsManifest from './components/MainsManifest';
import StrategicCommand from './components/StrategicCommand';
import VirtualLab from './components/VirtualLab';
import AIAssistant from './components/AIAssistant';
import StudyVault from './components/StudyVault';
import NeuralMentor from './components/NeuralMentor';
import CombatZone from './components/CombatZone';
import MentorshipHub from './components/MentorshipHub';
import ThreeBackground from './components/ThreeBackground';
import MissionAlert from './components/MissionAlert';
import { ChevronLeftIcon, XIcon, TrophyIcon, ShieldIcon, ChevronRightIcon } from './components/icons';

let audioCtx: AudioContext | null = null;

const playSound = (type: 'click' | 'navigate' | 'success' | 'xp' | 'hover' | 'levelup' | 'error' | 'boot' | 'alert') => {
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            audioCtx = new AudioContextClass();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        const osc = audioCtx.createOscillator();
        osc.connect(gain);

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hover':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(250, now + 0.05);
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'boot':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(50, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 1);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
                gain.gain.linearRampToValueAtTime(0, now + 1);
                osc.start(now);
                osc.stop(now + 1);
                break;
            case 'navigate':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
             case 'success':
                 [440, 554, 659].forEach((f, i) => {
                    const o = audioCtx!.createOscillator();
                    const g = audioCtx!.createGain();
                    o.connect(g);
                    g.connect(audioCtx!.destination);
                    o.type = 'sine';
                    o.frequency.value = f;
                    g.gain.setValueAtTime(0.02, now + i*0.1);
                    g.gain.linearRampToValueAtTime(0, now + i*0.1 + 0.4);
                    o.start(now + i*0.1);
                    o.stop(now + i*0.1 + 0.4);
                 });
                 break;
             case 'xp':
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.setValueAtTime(1760, now + 0.1);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'levelup':
                 [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
                     const o = audioCtx!.createOscillator();
                     const g = audioCtx!.createGain();
                     o.connect(g);
                     g.connect(audioCtx!.destination);
                     o.type = 'sawtooth';
                     o.frequency.value = f;
                     g.gain.setValueAtTime(0.05, now);
                     g.gain.exponentialRampToValueAtTime(0.001, now + 2);
                     o.start(now);
                     o.stop(now + 2);
                 });
                 break;
             case 'error':
                 osc.type = 'sawtooth';
                 osc.frequency.setValueAtTime(100, now);
                 osc.frequency.linearRampToValueAtTime(50, now + 0.3);
                 gain.gain.setValueAtTime(0.05, now);
                 gain.gain.linearRampToValueAtTime(0, now + 0.3);
                 osc.start(now);
                 osc.stop(now + 0.3);
                 break;
            case 'alert':
                 const o1 = audioCtx!.createOscillator();
                 const g1 = audioCtx!.createGain();
                 o1.connect(g1);
                 g1.connect(audioCtx!.destination);
                 o1.type = 'square';
                 o1.frequency.setValueAtTime(800, now);
                 o1.frequency.setValueAtTime(0, now + 0.1);
                 o1.frequency.setValueAtTime(800, now + 0.2);
                 o1.frequency.setValueAtTime(0, now + 0.3);
                 g1.gain.setValueAtTime(0.05, now);
                 g1.gain.linearRampToValueAtTime(0, now + 0.4);
                 o1.start(now);
                 o1.stop(now + 0.4);
                 break;
        }
    } catch (e) {
        // Ignored
    }
};

const App: React.FC = () => {
    return (
        <AppContent />
    );
};

const AppContent: React.FC = () => {
    const [authStatus, setAuthStatus] = useState<AuthenticationStatus>(AuthenticationStatus.LANDING);
    const [aspirantName, setAspirantName] = useState('');
    const [userContext, setUserContext] = useState<UserContext | null>(null);
    const [bootSequence, setBootSequence] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            playSound('boot');
            setBootSequence(false);
        }, 3000);
    }, []);

    const handleLogin = (name: string) => {
        setAspirantName(name);
        setAuthStatus(AuthenticationStatus.PROFILE_SETUP);
        playSound('success');
    };
    
    const handleProfileComplete = (context: UserContext) => {
        setUserContext(context);
        setAuthStatus(AuthenticationStatus.AUTHENTICATED);
        playSound('levelup');
    };

    const handleResetProfile = () => {
        setAuthStatus(AuthenticationStatus.LOGIN);
        setAspirantName('');
        setUserContext(null);
        playSound('navigate');
    };

    if (bootSequence) return <BootScreen />;

    return (
        <>
            <ThreeBackground />
            <div id="app-container" className="relative z-10 w-full h-full select-none text-slate-100 font-sans">
                {authStatus === AuthenticationStatus.LANDING && (
                    <LandingPage onBegin={() => { setAuthStatus(AuthenticationStatus.LOGIN); playSound('navigate'); }} />
                )}
                {authStatus === AuthenticationStatus.LOGIN && (
                    <LoginPage onLogin={handleLogin} />
                )}
                {authStatus === AuthenticationStatus.PROFILE_SETUP && (
                    <ProfileSetupWizard onComplete={handleProfileComplete} />
                )}
                {authStatus === AuthenticationStatus.AUTHENTICATED && userContext && (
                    <MainApp aspirantName={aspirantName} context={userContext} onResetProfile={handleResetProfile} />
                )}
            </div>
        </>
    );
};

// --- BOOT SCREEN ---
const BootScreen = () => (
    <div id="boot-screen" className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-cyan-500 z-50">
        <div className="w-64">
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-cyan-400 animate-[width-grow_3s_ease-out] w-full origin-left"></div>
            </div>
            <div className="text-xs space-y-1 opacity-70">
                <p>INITIALIZING CORE SYSTEMS...</p>
                <p className="animate-[pulse_0.2s_infinite]">LOADING NEURAL MENTOR...</p>
                <p>SYNCING SYLLABUS DB...</p>
            </div>
        </div>
    </div>
);

// --- LANDING PAGE ---
const LandingPage: React.FC<{ onBegin: () => void }> = ({ onBegin }) => {
    return (
    <div id="landing-page" className="min-h-screen w-full flex flex-col items-center justify-center text-center p-4 overflow-hidden relative perspective-1000">
        <div className="relative z-10 flex flex-col items-center animate-float">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-slate-500 font-display tracking-tight drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-4 glitch-effect" data-text="ANP ACADEMY">
                ANP ACADEMY
            </h1>
            <div className="flex items-center gap-4 mb-12">
                <div className="h-px w-12 bg-cyan-500"></div>
                <p className="text-xl md:text-2xl text-cyan-400 font-mono tracking-[0.3em] uppercase">Simulation Engine Online</p>
                <div className="h-px w-12 bg-cyan-500"></div>
            </div>
            <button
                onClick={onBegin}
                onMouseEnter={() => playSound('hover')}
                className="group relative px-20 py-6 bg-black/50 border border-cyan-500/50 clip-corner hover:bg-cyan-900/20 transition-all duration-300"
            >
                <span className="text-2xl font-bold text-white group-hover:text-cyan-300 font-display tracking-[0.1em] relative z-10 animate-pulse-glow">ENTER SYSTEM</span>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>
            </button>
        </div>
    </div>
    );
};

// --- LOGIN PAGE ---
const LoginPage: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onLogin(name.trim());
        else playSound('error');
    };
    
    return (
        <div id="login-page" className="min-h-screen w-full flex items-center justify-center p-4">
            <TiltCard>
                <div className="hud-card w-full max-w-lg p-10 text-center relative bg-black/40">
                    <h2 className="text-3xl font-bold text-white mb-2 font-display tracking-widest">IDENTIFICATION</h2>
                    <p className="text-cyan-400/80 font-mono text-xs uppercase tracking-[0.2em] mb-10">Authorized Personnel Only</p>
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-slate-700 focus:border-cyan-400 text-3xl text-center text-white placeholder-slate-800 focus:outline-none py-3 font-display uppercase tracking-widest transition-all"
                            placeholder="CODENAME"
                            required
                            autoFocus
                        />
                        <button type="submit" onMouseEnter={() => playSound('hover')} className="w-full bg-cyan-900/30 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold py-3 clip-corner hover:text-white transition-all duration-300 uppercase tracking-[0.2em]">Authenticate</button>
                    </form>
                </div>
            </TiltCard>
        </div>
    );
};

// --- PROFILE SETUP WIZARD ---
const ProfileSetupWizard: React.FC<{ onComplete: (context: UserContext) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<string>('');
    const [subCategory, setSubCategory] = useState<string>('');
    const [detail, setDetail] = useState<string>('');

    const handleCategorySelect = (id: string) => {
        setCategory(id);
        setStep(2);
        playSound('navigate');
    };

    const handleSubSelect = (id: string) => {
        setSubCategory(id);
        setStep(3);
        playSound('navigate');
    };

    const handleDetailSelect = useCallback((id: string) => {
        setDetail(id);
        // Finalizing
        const context: UserContext = {
            category: category as any,
            subCategory: subCategory,
            detail: id,
            label: `${id.replace(/_/g, ' ')}`,
        };
        onComplete(context);
    }, [category, subCategory, onComplete]);

    useEffect(() => {
        if (step === 3) {
            let options: { id: string; label: string }[] = [];
            if (category === 'SCHOOL') options = SCHOOL_GRADES;
            
            if (options.length === 0) {
                handleDetailSelect(subCategory);
            }
        }
    }, [step, category, subCategory, handleDetailSelect]);

    const renderOptions = () => {
        if (step === 1) {
            return EDUCATION_CATEGORIES.map(cat => (
                <TiltCard key={cat.id} onClick={() => handleCategorySelect(cat.id)}>
                    <div id={`category-${cat.id}`} className="hud-card h-64 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cyan-900/10 group">
                        <div className="w-16 h-16 mb-4 bg-slate-900 rounded-full flex items-center justify-center border border-slate-600 group-hover:border-cyan-400 group-hover:scale-110 transition-all">
                            {cat.icon}
                        </div>
                        <h3 className="text-xl font-bold font-display uppercase mb-2">{cat.label}</h3>
                        <p className="text-xs font-mono text-slate-400">{cat.desc}</p>
                    </div>
                </TiltCard>
            ));
        } else if (step === 2) {
            let options: { id: string; label: string }[] = [];
            if (category === 'SCHOOL') options = SCHOOL_BOARDS;
            else if (category === 'COLLEGE') options = COLLEGE_DEGREES;
            else if (category === 'COMPETITIVE') options = COMPETITIVE_EXAMS;

            return options.map(opt => (
                <button 
                    key={opt.id} 
                    onClick={() => category === 'COMPETITIVE' ? handleDetailSelect(opt.id) : handleSubSelect(opt.id)} // Shortcut for competitive if only 1 step needed or logic differs
                    className="w-full p-5 bg-slate-900/60 border border-slate-600 hover:border-cyan-400 hover:bg-cyan-900/20 clip-corner text-left transition-all group"
                >
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold font-display uppercase tracking-wider text-white group-hover:text-cyan-300">{opt.label}</span>
                        <ChevronRightIcon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400"/>
                    </div>
                </button>
            ));
        } else if (step === 3) {
            
            let options: { id: string; label: string }[] = [];
            if (category === 'SCHOOL') options = SCHOOL_GRADES;
            
            if (options.length === 0) {
                 return null;
            }

            return options.map(opt => (
                <button 
                    key={opt.id} 
                    onClick={() => handleDetailSelect(opt.id)} 
                    className="w-full p-5 bg-slate-900/60 border border-slate-600 hover:border-cyan-400 hover:bg-cyan-900/20 clip-corner text-left transition-all group"
                >
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold font-display uppercase tracking-wider text-white group-hover:text-cyan-300">{opt.label}</span>
                        <div className="h-2 w-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </button>
            ));
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display uppercase tracking-widest text-glow">Neural Configuration</h2>
             <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.3em] mb-10">
                Step {step}/3: {step === 1 ? 'Select Category' : step === 2 ? 'Select Stream/Board' : 'Select Level'}
             </p>
             
             <div className={`${step === 1 ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'flex flex-col gap-3 max-w-xl'} w-full`}>
                {renderOptions()}
             </div>
             
             {step > 1 && (
                 <button onClick={() => setStep(step - 1)} className="mt-8 text-slate-500 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
                     <ChevronLeftIcon className="w-4 h-4"/> Back
                 </button>
             )}
        </div>
    );
};


// --- 3D TILT CARD ---
const TiltCard: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setTransform(`perspective(1000px) rotateX(${((y - centerY) / centerY) * -5}deg) rotateY(${((x - centerX) / centerX) * 5}deg) scale3d(1.02, 1.02, 1.02)`);
    };
    return (
        <div 
            ref={cardRef} className="w-full h-full transition-transform duration-100 ease-out preserve-3d"
            style={{ transform }} onMouseMove={handleMouseMove} onMouseLeave={() => setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')}
            onMouseEnter={() => playSound('hover')} onClick={onClick}
        >
            {children}
        </div>
    );
};

// --- MAIN APP ---
const MainApp: React.FC<{ aspirantName: string; context: UserContext; onResetProfile: () => void }> = ({ aspirantName, context, onResetProfile }) => {
    const [currentView, setCurrentView] = useState<View>(View.Nexus);
    const [aspirant, setAspirant] = useState<Aspirant>({
        name: aspirantName,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${aspirantName}&backgroundColor=b6e3f4`,
        rank: RANKS[0],
        badges: BADGES.slice(0, 1),
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        context: context
    });
    const [xpGain, setXpGain] = useState<number | null>(null);
    const [isLevelUp, setIsLevelUp] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTip, setCurrentTip] = useState<string | null>(null);

    useEffect(() => {
        const tips = [
            "TIP: Use the 'Request Intel' button in Chronosync if you're stuck.",
            "SYSTEM: Neural link stability is at 98.4%.",
            "ADVICE: Check the 'Export Logs' feature in Simu Lab for your records.",
            "FACT: The first computer was invented in 1943.",
            "ALERT: New simulation modules available in the dashboard.",
            "HINT: Drag and drop events onto the timeline for Chronosync.",
            "REMINDER: You can reset any simulation using the 'Reset Sim' button."
        ];
        
        const interval = setInterval(() => {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            setCurrentTip(randomTip);
            setTimeout(() => setCurrentTip(null), 8000);
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Dynamic Modules State
    const [activeModules, setActiveModules] = useState<NexusModule[]>(() => getNexusModules(context));
    const [activeSimuLabs, setActiveSimuLabs] = useState<any[]>(() => getSimuLabModules(context));
    const [activeCombatModules, setActiveCombatModules] = useState<any[]>(() => getCombatZoneModules(context));
    const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

    useEffect(() => {
        setActiveModules(getNexusModules(context));
        setActiveSimuLabs(getSimuLabModules(context));
        setActiveCombatModules(getCombatZoneModules(context));
    }, [context]);

    // --- MISSION SYSTEM ---
    const [missionData, setMissionData] = useState<{title: string, description: string, xpReward: number, targetView?: View} | null>(null);
    const [isMissionAlertOpen, setIsMissionAlertOpen] = useState(false);

    const addXp = useCallback((amount: number) => {
        setAspirant(prev => {
            const newXp = prev.xp + amount;
            const nextLevelThreshold = prev.level * 1000;
            let newLevel = prev.level;
            if (newXp >= nextLevelThreshold) {
                newLevel = prev.level + 1;
                setIsLevelUp(true);
                playSound('levelup');
            } else {
                 playSound('xp');
            }
            return { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newLevel * 1000 };
        });
        setXpGain(amount);
        setTimeout(() => setXpGain(null), 2000);
    }, []);

    const navigateTo = useCallback((view: View, labId?: string) => {
        setCurrentView(view);
        if (labId) setSelectedLabId(labId);
        playSound('navigate');
    }, []);

    // Mission Interval
    useEffect(() => {
        if (isMissionAlertOpen) return;

        const missions = [
            { title: "INTEL REQUIRED", description: "Review your daily strategic briefing.", xpReward: 50, targetView: View.StrategicCommand },
            { title: "NEURAL LINK CHECK", description: "Strategos has a tactical update.", xpReward: 40, targetView: View.NeuralMentor },
            { title: "ARCHIVE SCAN", description: "Refresh your knowledge in the Study Vault.", xpReward: 40, targetView: View.StudyVault },
        ];

        const timer = setTimeout(() => {
            setMissionData(missions[Math.floor(Math.random() * missions.length)]);
            setIsMissionAlertOpen(true);
            playSound('alert');
        }, 60000); // Increased to 60 seconds for better flow

        return () => clearTimeout(timer);
    }, [isMissionAlertOpen]);

    const handleMissionAccept = () => {
        if (missionData) {
            setIsMissionAlertOpen(false);
            addXp(missionData.xpReward / 2);
            if (missionData.targetView) navigateTo(missionData.targetView);
        }
    };

    const renderView = () => {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                >
                    {(() => {
                        switch (currentView) {
                            case View.Nexus: return <NexusDashboard navigateTo={navigateTo} modules={activeModules} />;
                            case View.StudyVault: return <StudyVault context={context} addXp={addXp} />;
                            case View.NeuralMentor: return <NeuralMentor context={context} playSound={playSound} />;
                            case View.Constellation: return <KnowledgeConstellation context={context} />;
                            case View.MainsManifest: return <MainsManifest addXp={addXp} />;
                            case View.SimuLab: return <ModuleListView title="Simu-Labs" modules={activeSimuLabs} navigateTo={navigateTo} openModal={() => setIsModalOpen(true)} />;
                            case View.CombatZone: return <CombatZone context={context} addXp={addXp} />;
                            case View.StrategicCommand: return <StrategicCommand addXp={addXp} context={context} />;
                            case View.VirtualLab: return <VirtualLab context={context} addXp={addXp} onBack={() => navigateTo(View.SimuLab)} labId={selectedLabId} />;
                            case View.MentorshipHub: return <MentorshipHub context={context} onBack={() => navigateTo(View.Nexus)} />;
                            default: return <NexusDashboard navigateTo={navigateTo} modules={activeModules} />;
                        }
                    })()}
                </motion.div>
            </AnimatePresence>
        );
    };
    
    return (
        <div id="main-app-container" className="h-screen w-screen flex overflow-hidden bg-black/50">
            <ProfileSidebar aspirant={aspirant} xpGain={xpGain} currentView={currentView} onNavigateToDashboard={() => navigateTo(View.Nexus)} onResetProfile={onResetProfile} />
            <main id="main-content" className="flex-1 relative overflow-hidden flex flex-col md:ml-20 transition-all duration-300">
                <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                     {currentView !== View.Nexus && (
                        <button onClick={() => navigateTo(View.Nexus)} onMouseEnter={() => playSound('hover')} className="fixed top-6 right-8 z-50 flex items-center gap-3 bg-slate-900/90 border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 px-6 py-2 clip-corner transition-all group hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> <span className="font-display font-bold text-xs tracking-widest">ABORT MODULE</span>
                        </button>
                    )}
                    {renderView()}
                </div>
            </main>
            <MissionAlert isOpen={isMissionAlertOpen} onClose={() => setIsMissionAlertOpen(false)} onAccept={handleMissionAccept} missionData={missionData} />
            
            {/* Floating AI Assistant */}
            <div className="fixed bottom-4 left-4 z-40 w-16 h-16 pointer-events-none opacity-40 hover:opacity-100 transition-opacity md:left-24">
                <AIAssistant className="w-full h-full" message={currentTip} />
            </div>

            <AnimatePresence>
                {isLevelUp && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl" 
                        onClick={() => setIsLevelUp(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className="text-center relative p-20 hud-card border-yellow-500/50"
                        >
                            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 font-display drop-shadow-2xl mb-6 animate-pulse">LEVEL UP</h1>
                            <p className="text-cyan-200 font-mono tracking-[0.5em] text-xl uppercase">Clearance Level {aspirant.level}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="text-center">
                    <ShieldIcon className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse"/>
                    <h2 className="text-2xl font-bold text-white mb-2 font-display tracking-wide">ACCESS DENIED</h2>
                    <p className="text-red-400 font-mono text-sm leading-relaxed mb-6 tracking-widest">CLEARANCE LEVEL INSUFFICIENT</p>
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500 text-red-300 clip-corner text-xs font-bold uppercase tracking-widest transition-colors">Acknowledge</button>
                </div>
            </Modal>
        </div>
    );
};

// --- DASHBOARD & MODULE LIST (Reused) ---
const NexusDashboard: React.FC<{ navigateTo: (view: View) => void, modules: NexusModule[] }> = ({ navigateTo, modules }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    console.log('NexusDashboard modules:', modules);
    return (
        <div id="nexus-dashboard" className="h-full flex flex-col">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10 mt-4 relative"
            >
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-display tracking-tight drop-shadow-2xl">NEXUS</h1>
                <div className="h-0.5 w-full bg-cyan-500 mt-2 shadow-[0_0_20px_#0ff]"></div>
                <p className="text-cyan-400 font-mono tracking-[0.5em] text-xs uppercase mt-3 animate-pulse">Mainframe Status: Online</p>
            </motion.div>
            <div className="flex-grow overflow-visible px-2 pb-20">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto perspective-1000"
                >
                    {modules.map((module) => (
                        <motion.div
                            key={module.id}
                            variants={{
                                hidden: { opacity: 0, y: 20, rotateX: -10 },
                                visible: { opacity: 1, y: 0, rotateX: 0 }
                            }}
                        >
                            <TiltCard onClick={() => navigateTo(View[module.view])}>
                                <div className="hud-card h-64 relative group flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cyan-900/10 transition-all duration-300">
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-500 relative">
                                        <div className="w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center border border-slate-600 group-hover:border-cyan-400 transition-colors">
                                            {React.cloneElement(module.icon as React.ReactElement<any>, { className: 'w-10 h-10 text-slate-300 group-hover:text-cyan-200 transition-colors' })}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display mb-2 uppercase tracking-wider">{module.title}</h3>
                                    <div className="h-px w-10 bg-slate-700 group-hover:bg-cyan-500 transition-colors mb-3"></div>
                                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed px-4 line-clamp-3 uppercase tracking-wide group-hover:text-cyan-200/70">{module.description}</p>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                 <button onClick={() => { setShowLeaderboard(true); playSound('navigate'); }} onMouseEnter={() => playSound('hover')} className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-yellow-500/50 hover:border-yellow-400 px-8 py-3 clip-corner text-yellow-100 hover:text-white transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] group">
                    <TrophyIcon className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform"/><span className="font-bold tracking-[0.2em] text-[10px] font-display">GLOBAL_RANKINGS</span>
                </button>
            </motion.div>
            <Leaderboard show={showLeaderboard} onClose={() => { setShowLeaderboard(false); playSound('click'); }} />
        </div>
    );
};

const ModuleListView: React.FC<{ title: string; modules: any[]; navigateTo: (view: View, id?: string) => void; openModal: any }> = ({ title, modules, navigateTo, openModal }) => (
    <div className="pt-8 h-full flex flex-col items-center">
        <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-black text-white mb-12 font-display tracking-widest text-glow uppercase"
        >
            {title}
        </motion.h1>
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4 pb-12 perspective-1000"
        >
            {modules.map((mod) => (
                <motion.div
                    key={mod.title}
                    variants={{
                        hidden: { opacity: 0, scale: 0.8, y: 20 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                    }}
                >
                    <TiltCard onClick={() => mod.view ? navigateTo(View[mod.view as keyof typeof View], mod.id) : openModal()}>
                        <div className="hud-card h-64 relative group flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all duration-300">
                             <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 bg-slate-900/80 p-5 rounded-full border border-slate-600 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_#0ff]">
                                 {React.cloneElement(mod.icon, { className: 'w-10 h-10 text-slate-300 group-hover:text-cyan-300' })}
                             </div>
                             <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 font-display mb-3 uppercase tracking-wide">{mod.title}</h3>
                             <p className="text-[10px] text-slate-400 font-mono px-6 leading-relaxed uppercase tracking-wider">{mod.description}</p>
                             {!mod.view && <div className="absolute top-3 right-3 text-[9px] text-red-500 font-bold border border-red-500/50 px-2 py-0.5 clip-corner bg-red-900/20 tracking-widest">LOCKED</div>}
                        </div>
                    </TiltCard>
                </motion.div>
            ))}
        </motion.div>
    </div>
);

const Leaderboard: React.FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" 
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="hud-card w-full max-w-3xl p-0 shadow-2xl" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div><h2 className="text-2xl font-bold text-white font-display tracking-widest">ELITE OPERATORS</h2></div>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                        </div>
                         <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                             {LEADERBOARD_DATA.map((user, idx) => (
                                 <motion.div 
                                    key={user.rank}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex items-center justify-between p-4 clip-corner transition-all hover:translate-x-2 ${idx < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border border-yellow-500/30' : 'bg-slate-800/30 border border-white/5'}`}
                                >
                                     <div className="flex items-center gap-6">
                                         <span className={`font-black font-display text-3xl w-12 text-center italic ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-600'}`}>#{user.rank}</span>
                                         <div className="relative"><img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white/10"/></div>
                                         <span className="font-bold text-white tracking-widest text-base uppercase font-display">{user.name}</span>
                                     </div>
                                     <div className="text-right"><div className="font-mono text-cyan-400 font-bold tracking-widest text-xl">{user.xp.toLocaleString()} XP</div></div>
                                 </motion.div>
                             ))}
                         </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4" 
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="hud-card p-10 max-w-lg w-full relative" 
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><XIcon className="w-5 h-5"/></button>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default App;
