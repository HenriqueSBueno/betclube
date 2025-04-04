
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use requestIdleCallback to defer non-critical work
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  }, 0);
}
