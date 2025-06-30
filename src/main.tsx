import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './global.css';
import './index.css';
import { LoginModalProvider } from './context/loginModalContext';
import TagManager from 'react-gtm-module';

const tagManagerArgs = {
  gtmId: import.meta.env.VITE_GTM_ID,
};
console.log('GTM ID:', import.meta.env.VITE_GTM_ID);
TagManager.initialize(tagManagerArgs);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginModalProvider>
      <App />
    </LoginModalProvider>
  </StrictMode>
);
