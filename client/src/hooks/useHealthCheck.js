import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/healthService';

export const useHealthCheck = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const performCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkHealth();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performCheck();
  }, [performCheck]);

  return { data, loading, error, refetch: performCheck };
};
