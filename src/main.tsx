
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preconnect to external domains for faster resource loading
const preconnectLinks = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://cdn.gpteng.co' }
];

// Add preconnect links dynamically
preconnectLinks.forEach(link => {
  const linkElement = document.createElement('link');
  Object.entries(link).forEach(([key, value]) => {
    if (value !== undefined) {
      linkElement.setAttribute(key, value.toString());
    }
  });
  document.head.appendChild(linkElement);
});

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
