import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      {!isOnline && (
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-500 text-slate-950 font-medium text-xs rounded-xl shadow-lg border border-amber-400 animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline mode active: Cached ocean telemetry is available</span>
        </div>
      )}
      {isOnline && showReconnected && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white font-medium text-xs rounded-xl shadow-lg border border-emerald-500">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connected back online</span>
        </div>
      )}
    </div>
  );
};
