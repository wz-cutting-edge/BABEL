import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { lightTheme } from './styles/theme';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          <ThemeProvider theme={lightTheme}>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </ThemeProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
