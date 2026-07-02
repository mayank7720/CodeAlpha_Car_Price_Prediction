import { useState } from 'react';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import EDADashboard from './components/EDADashboard';
import ModelDashboard from './components/ModelDashboard';
import PredictionForm from './components/PredictionForm';
import About from './components/About';
import PredictionHistory from './components/PredictionHistory';
import CompareCars from './components/CompareCars';
import MarketTrends from './components/MarketTrends';
import SettingsPage from './components/Settings';
import { 
  Home as HomeIcon, 
  Database, 
  BarChart3, 
  Award, 
  Sparkles, 
  Info, 
  Menu, 
  X, 
  History, 
  GitCompare, 
  TrendingUp, 
  Settings, 
  Bell, 
  Maximize2, 
  Sun,
  Flame
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: HomeIcon },
    { id: 'dataset', label: 'Dataset Overview', icon: Database },
    { id: 'eda', label: 'Interactive EDA', icon: BarChart3 },
    { id: 'model', label: 'Model Performance', icon: Award },
    { id: 'prediction', label: 'Price Predictor', icon: Sparkles },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'compare', label: 'Compare Cars', icon: GitCompare },
    { id: 'trends', label: 'Market Trends', icon: TrendingUp },
    { id: 'about', label: 'About Project', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home onNavigate={(page) => setActivePage(page)} />;
      case 'dataset':
        return <Dashboard />;
      case 'eda':
        return <EDADashboard />;
      case 'model':
        return <ModelDashboard />;
      case 'prediction':
        return <PredictionForm />;
      case 'history':
        return <PredictionHistory />;
      case 'compare':
        return <CompareCars />;
      case 'trends':
        return <MarketTrends />;
      case 'about':
        return <About />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Home onNavigate={(page) => setActivePage(page)} />;
    }
  };

  const getPageTitle = () => {
    const item = navigationItems.find(nav => nav.id === activePage);
    return item ? item.label.toUpperCase() : 'DASHBOARD';
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row font-sans overflow-x-hidden custom-scrollbar">
      
      {/* Mobile Header Banner */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0d111a] border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <span className="font-extrabold text-sm tracking-widest text-red-500 uppercase">
            Car Price
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Wrapper */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex flex-col w-64 shrink-0
        bg-[#090d14] border-r border-white/5 z-50 transition-transform duration-300 ease-in-out
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 hidden md:flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-red-600 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white leading-none">
                CAR PRICE
              </span>
              <span className="font-bold text-xs tracking-widest text-red-500 mt-0.5">
                PREDICTION
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group relative cursor-pointer
                  ${isActive 
                    ? 'active-nav-item font-semibold text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Quote */}
        <div className="p-6 border-t border-white/5 space-y-2">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Performance
          </div>
          <p className="text-xs italic text-slate-400 leading-relaxed">
            "is not just about speed, it's about intelligence."
          </p>
          <div className="text-[10px] text-red-500 font-medium">— Car Enthusiast</div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#07090e]">
        {/* Dashboard Top Header bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#090d14]/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-3 bg-red-600 rounded-sm" />
              <span className="w-1.5 h-3 bg-red-600 rounded-sm" />
              <span className="w-1.5 h-3 bg-red-600 rounded-sm" />
            </div>
            <h2 className="text-sm font-extrabold tracking-widest text-slate-200 uppercase">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Server Status:</span>
                <span className="text-emerald-400">Online</span>
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-300">
                Active Model: <span className="text-red-500">Car Price AI v2.4</span>
              </div>
            </div>

            {/* Utility Quick Icons */}
            <div className="flex items-center gap-3 text-slate-400 border-l border-white/10 pl-5 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 hover:text-white transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-64 bg-[#0d111a] border border-white/5 rounded-lg shadow-xl p-3.5 z-50 space-y-2.5 text-left animate-fadeIn">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1.5">
                    Recent Alerts
                  </h4>
                  <div className="space-y-2 text-[10px] leading-relaxed text-slate-300">
                    <div className="border-b border-white/5 pb-1.5">
                      <p className="font-semibold text-white">Model initialized successfully</p>
                      <p className="text-slate-500">Trained model 'Car Price Prediction' is active.</p>
                    </div>
                    <div className="border-b border-white/5 pb-1.5">
                      <p className="font-semibold text-white">Database Loaded</p>
                      <p className="text-slate-500">Cleaned dataset contains 301 records.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">FastAPI Connection Online</p>
                      <p className="text-slate-500">Pinging server metrics returned 200 OK.</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={toggleFullscreen}
                className="p-1 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => triggerToast('Theme is locked to dark mode for optimal car rendering aesthetics.')}
                className="p-1 hover:text-white transition-colors"
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xs font-black">
                MR
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200">Mayank Raj</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Wrapper */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-68px)] md:max-h-screen custom-scrollbar">
          {renderActivePage()}
        </div>
      </main>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 md:hidden z-40 backdrop-blur-sm"
        />
      )}

      {/* Toast Message banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg bg-red-600 border border-red-500/20 text-white font-bold text-xs shadow-xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
