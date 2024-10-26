import { useState, useEffect } from 'react';

const lightTheme = {
  background: '#ECDFCC',
  secondaryBackground: '#697565',
  accent: '#3C3D37',
  text: '#1E201E',
};

const darkTheme = {
  background: '#1E201E',
  secondaryBackground: '#3C3D37',
  accent: '#697565',
  text: '#ECDFCC',
};

export const useTheme = () => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
    localStorage.setItem('theme', theme === lightTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
    }
  }, []);

  return { theme, toggleTheme };
};