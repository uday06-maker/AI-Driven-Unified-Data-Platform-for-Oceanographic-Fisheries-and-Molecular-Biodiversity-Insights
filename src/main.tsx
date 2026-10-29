import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Automatically register service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('SAMUDRA-DATA: New oceanographic updates available');
  },
  onOfflineReady() {
    console.log('SAMUDRA-DATA: App is cached and ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
