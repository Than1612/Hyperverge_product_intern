import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import "@fontsource-variable/inter/index.css";
import './index.css';
import './i18n';
import Login from './routes/Login';
import Home from './routes/Home';
import LoanApply from './routes/LoanApply';
import DocumentUpload from './routes/DocumentUpload';
import LoanStatus from './routes/LoanStatus';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/apply', element: <LoanApply /> },
  { path: '/documents', element: <DocumentUpload /> },
  { path: '/status/:id', element: <LoanStatus /> },
]);

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6F00' },
    background: { default: '#FAFAFA' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'InterVariable, Inter, Roboto, Helvetica, Arial, sans-serif',
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
