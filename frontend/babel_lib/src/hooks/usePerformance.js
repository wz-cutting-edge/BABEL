import { useEffect, useRef } from 'react';

export const usePerformance = (componentName) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    // Log performance metrics
    console.log(`${componentName} rendered in ${duration}ms`);

    // You could send this to your analytics service
    if (duration > 100) {
      console.warn(`${componentName} took longer than 100ms to render`);
    }

    return () => {
      const unmountTime = performance.now();
      console.log(`${componentName} unmounted after ${unmountTime - startTime.current}ms`);
    };
  }, [componentName]);
};
