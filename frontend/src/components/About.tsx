import { GlassCard } from './ui/GlassCard';
import { Cpu, Terminal, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">About Project</h1>
        <p className="text-slate-400 text-sm">
          Technical specifications, system design details, and machine learning pipelines architecture.
        </p>
      </div>

      {/* Grid: Project details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ML pipeline card */}
        <GlassCard className="p-6 md:p-8 lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-500 animate-pulse" /> Machine Learning Pipeline Architecture
          </h2>

          <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
            <div className="relative pl-6 border-l-2 border-red-500/30 space-y-1">
              <div className="absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border border-slate-900" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">1. Preprocessing & Data Cleaning</h3>
              <p>
                Cleans the raw dataset by removing duplicates and ensuring strict data type boundaries. Empty values are imputed dynamically using median statistics.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-red-500/30 space-y-1">
              <div className="absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border border-slate-900" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">2. Feature Engineering</h3>
              <p>
                Augments features using domain knowledge: derives `Car_Age` relative to 2026, segments mileage levels, and maps vehicle names to estimate horsepower and engine size classes. Adds `Luxury_Segment` based on showroom price thresholds.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-red-500/30 space-y-1">
              <div className="absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border border-slate-900" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">3. Numerical & Categorical Pipeline</h3>
              <p>
                Integrates standard scaling (`StandardScaler`) for numerical indicators (Present Price, Age, Mileage) and one-hot encoding (`OneHotEncoder`) for categorical parameters (Brand, Fuel Type, Transmission, Segments) via custom column transformers.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-red-500/30 space-y-1">
              <div className="absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border border-slate-900" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">4. Multi-Model GridSearch Optimization</h3>
              <p>
                Trains 8 regression models concurrently, applying 5-fold cross-validation grid search to isolate optimal hyperparameters. Measures execution times and select the estimator scoring the highest test split coefficient of determination ($R^2 \approx 88.1\%$).
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Tech Stack widget */}
        <GlassCard className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500" /> Tech Stack Listing
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Backend</span>
                <p className="text-xs font-semibold text-slate-300">FastAPI</p>
                <p className="text-[9px] text-slate-400">Python Web Framework</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Frontend</span>
                <p className="text-xs font-semibold text-slate-300">React + TS</p>
                <p className="text-[9px] text-slate-400">Vite Bundler</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Styling</span>
                <p className="text-xs font-semibold text-slate-300">Tailwind CSS</p>
                <p className="text-[9px] text-slate-400">CSS Utilities</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">ML Model</span>
                <p className="text-xs font-semibold text-slate-300">Scikit-Learn</p>
                <p className="text-[9px] text-slate-400">Regression Suite</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">XGBoost</span>
                <p className="text-xs font-semibold text-slate-300">xgboost</p>
                <p className="text-[9px] text-slate-400">Gradient Boosting</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Charts</span>
                <p className="text-xs font-semibold text-slate-300">Recharts</p>
                <p className="text-[9px] text-slate-400">Interactive SVG Charts</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">PEP-8 & TS Standards</h4>
              <p className="text-[9px] text-slate-400 leading-normal">
                Strict type safety, custom TypeScript interfaces, modular backend architecture, and PEP-8 clean formats.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
