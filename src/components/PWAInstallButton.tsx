import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'drawer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>App Installed (Standalone Mode)</span>
        </div>
      );
    }
    return null; // Don't clutter header if already inside installed standalone app
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      await promptInstall();
      setIsInstalling(false);
    } else {
      // In desktop chrome/edge without trigger or on browsers where prompt hasn't fired yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-sky-400/30 ${className}`}
          title="Install SAMUDRA-DATA as standalone mobile or desktop App"
        >
          <Download className="w-3.5 h-3.5 animate-pulse" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'drawer' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-cyan-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isInstalling ? 'Installing...' : 'Install SAMUDRA Mobile App'}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Install SAMUDRA-DATA on your device</h4>
              <p className="text-xs text-slate-600">Access real-time surge alerts, K-Means clustering & offline marine data directly from your home screen.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install Now</span>
          </button>
        </div>
      )}

      {/* iOS & Manual Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Install SAMUDRA App</h3>
                  <p className="text-xs text-slate-500">Progressive Web App (PWA)</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs text-slate-700">
              {isIOS ? (
                <>
                  <p className="text-slate-600">
                    To install SAMUDRA-DATA on iOS (iPhone / iPad), follow these quick steps in Apple Safari:
                  </p>
                  <div className="space-y-3 bg-sky-50/80 p-3.5 rounded-xl border border-sky-100">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        1
                      </div>
                      <p className="leading-snug pt-0.5">
                        Tap the <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-sky-600 inline" /> Share</strong> button at the bottom of Safari.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        2
                      </div>
                      <p className="leading-snug pt-0.5">
                        Scroll down and tap <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-teal-600 inline" /> Add to Home Screen</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        3
                      </div>
                      <p className="leading-snug pt-0.5">
                        Tap <strong className="text-slate-900 font-semibold">Add</strong> in the top right corner. The SAMUDRA app icon will appear on your Home Screen!
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-600">
                    SAMUDRA-DATA can be installed directly onto your device (Chrome, Edge, Android, Windows, macOS, or Linux):
                  </p>
                  <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Works seamlessly offline with cached marine telemetry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero download size: launches instantly from home screen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full screen standalone experience without browser address bar</span>
                    </div>
                  </div>
                  <p className="text-slate-500 italic">
                    If prompt is not supported by your current browser preview, look for the install icon <Download className="w-3.5 h-3.5 inline mx-0.5 text-sky-600" /> in the address bar or browser menu.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
