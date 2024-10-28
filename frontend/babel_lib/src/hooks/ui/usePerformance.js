import { useEffect, useCallback } from 'react';

export const usePerformance = (componentName) => {
  const logPerformance = useCallback((entries) => {
    entries.forEach(entry => {
      console.log(`${componentName} Performance Metrics:`, {
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        entryType: entry.entryType,
      });
    });
  }, [componentName]);

  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      logPerformance(list.getEntries());
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, [logPerformance]);

  const measurePerformance = useCallback((label, fn) => {
    const startMark = `${componentName}-${label}-start`;
    const endMark = `${componentName}-${label}-end`;

    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    
    performance.measure(
      `${componentName}-${label}`,
      startMark,
      endMark
    );

    return result;
  }, [componentName]);

  return { measurePerformance };
};
