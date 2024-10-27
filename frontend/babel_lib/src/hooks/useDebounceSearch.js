import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirebase } from './useFirebase';

export const useDebounceSearch = (options = {}) => {
  const {
    debounceTime = 300,
    minChars = 2,
    collectionName,
    searchFields = ['title', 'description']
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeout = useRef(null);
  const { queryDocuments } = useFirebase();

  const performSearch = useCallback(async (term) => {
    if (term.length < minChars) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchConstraints = searchFields.map(field => ({
        field,
        operator: '>=',
        value: term
      }));

      const results = await queryDocuments(collectionName, searchConstraints);
      
      // Filter results that start with the search term
      const filteredResults = results.filter(item =>
        searchFields.some(field =>
          item[field]?.toLowerCase().startsWith(term.toLowerCase())
        )
      );

      setResults(filteredResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, searchFields, minChars, queryDocuments]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      performSearch(searchTerm);
    }, debounceTime);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, debounceTime, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error
  };
};
