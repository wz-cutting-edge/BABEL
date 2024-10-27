import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useTheme } from './hooks/useTheme';
import GlobalStyle from './styles/GlobalStyle';
import { AuthProvider } from './contexts/AuthContext';
import Loading from './components/Loading';
import { ProfiledComponent } from './utils/Profiler';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserHome = lazy(() => import('./pages/UserHome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Search = lazy(() => import('./pages/Search'));
const Collections = lazy(() => import('./pages/Collections'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <ProfiledComponent id="App">
            <MainLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}>
              <Suspense fallback={<Loading />}>
                <AppRoutes />
              </Suspense>
            </MainLayout>
          </ProfiledComponent>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
