import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

// ✅ PWA 등록 (추가)
import { registerSW } from 'virtual:pwa-register';

import 'react-perfect-scrollbar/dist/css/styles.css';
import './tailwind.css';
import './i18n';
import './assets/globals.css';

import { RouterProvider } from 'react-router-dom';
import router from './router/index';

import { Provider } from 'react-redux';
import { store } from './store';

// ✅ 앱 시작하자마자 service worker 등록
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <Suspense>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </Suspense>
    </HelmetProvider>
  </React.StrictMode>
);
