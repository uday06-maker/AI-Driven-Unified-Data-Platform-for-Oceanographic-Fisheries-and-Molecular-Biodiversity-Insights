import { Waves, Activity, ShieldAlert, Download, Terminal, Database, Home } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.js';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenExport: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
  activeAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text line, clickable to Home) */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap group-hover:text-sky-600 transition-colors">
                SAMUDRA-DATA
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                MoES · CMLRE / INCOIS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Arabian Sea Coastal Surge, Fisheries & eDNA Platform
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => onTabChange('map')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Surge & Map
          </button>
          <button
            onClick={() => onTabChange('kmeans')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'kmeans'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            K-Means Data Mining
          </button>
          <button
            onClick={() => onTabChange('correlation')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'correlation'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cross-Domain
          </button>
          <button
            onClick={() => onTabChange('molecular')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'molecular'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Molecular & eDNA
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-600" />
            AI Query & SQL
          </button>
          <button
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-sky-100/80 text-sky-800 font-semibold border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            Catalog & Ingest
          </button>
        </nav>

        {/* Zone 3: Primary Action & Alert Status & PWA Install */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeAlertsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{activeAlertsCount} Live Alerts</span>
            </div>
          )}

          <PWAInstallButton variant="header" />

          <button
            onClick={onOpenExport}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer font-sans"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Docker</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip & PWA Install */}
      <div className="lg:hidden flex items-center justify-between gap-2 overflow-x-auto pt-2.5 border-t border-slate-200 mt-2.5 pb-1">
        <div className="flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => onTabChange('home')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'home' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('map')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'map' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => onTabChange('kmeans')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'kmeans' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          K-Means
        </button>
        <button
          onClick={() => onTabChange('correlation')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'correlation' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('molecular')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'molecular' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          eDNA
        </button>
        <button
          onClick={() => onTabChange('ai')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'ai' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          AI Query
        </button>
        <button
          onClick={() => onTabChange('catalog')}
          className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
            activeTab === 'catalog' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Catalog
        </button>
        </div>
        <div className="shrink-0 pl-1">
          <PWAInstallButton variant="header" />
        </div>
      </div>
    </header>
  );
};
