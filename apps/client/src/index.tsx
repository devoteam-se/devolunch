import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import RestaurantsProvider from './contexts/restaurants';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RestaurantsProvider>
        <App />
      </RestaurantsProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
