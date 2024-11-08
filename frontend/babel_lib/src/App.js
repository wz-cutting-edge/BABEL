import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { ViewerProvider } from './contexts/ViewerContext';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './components/layouts/MainLayout';

const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ViewerProvider>
          <CustomThemeProvider>
            <ThemedApp />
          </CustomThemeProvider>
        </ViewerProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
