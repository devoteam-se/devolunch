import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import RestaurantsProvider from './contexts/restaurants';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RestaurantsProvider>
      <App />
    </RestaurantsProvider>
  </React.StrictMode>,
);
