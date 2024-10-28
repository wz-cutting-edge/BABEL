import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    primary: '#007bff',
    background: '#ffffff',
    secondaryBackground: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    error: '#dc3545',
    success: '#28a745'
  },
  dark: {
    primary: '#0d6efd',
    background: '#1a1a1a',
    secondaryBackground: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#adb5bd',
    border: '#404040',
    error: '#dc3545',
    success: '#28a745'
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? themes.dark.background : themes.light.background;
    document.body.style.color = isDarkMode ? themes.dark.text : themes.light.text;
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ theme: isDarkMode ? themes.dark : themes.light, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
