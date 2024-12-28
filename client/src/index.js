import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';
import { ContextProvider } from './Context';

ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
      <ContextProvider>
      <App />
      </ContextProvider>
    </AuthProvider>
  </BrowserRouter >,
  document.getElementById('root')
);