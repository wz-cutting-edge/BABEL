import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Return darkTheme if no theme is saved or if saved theme is 'dark'
    return savedTheme === 'light' ? lightTheme : darkTheme;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Return true if no theme is saved or if saved theme is 'dark'
    return savedTheme === 'light' ? false : true;
  });

  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme === darkTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? darkTheme : lightTheme;
      setTheme(newTheme);
      setIsDarkMode(e.matches);
      localStorage.setItem('theme', e.matches ? 'dark' : 'light');
    };

    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark'); // Set default to dark
      setTheme(darkTheme);
      setIsDarkMode(true);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return { theme, isDarkMode, toggleTheme };
};
