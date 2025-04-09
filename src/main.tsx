
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

// Create root immediately to avoid layout shifts
const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

import { ThemeProvider } from './lib/theme-provider';
import { AuthProvider } from './providers/auth-provider';

root.render(
  <ThemeProvider storageKey="betting-buzz-ui-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
