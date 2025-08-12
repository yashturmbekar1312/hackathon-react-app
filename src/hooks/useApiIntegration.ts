import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ErrorContext';
import { handleApiError } from '../contexts/ErrorContext';

// Generic API hook for CRUD operations
export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    showSuccessToast?: string,
    showErrorToast: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (showSuccessToast) {
        toast.showSuccess('Success', showSuccessToast);
      }
      
      return result;
    } catch (err: any) {
      const appError = handleApiError(err);
      setError(appError.message);
      
      if (showErrorToast) {
        toast.showError('Error', appError.message);
      }
      
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData
  };
}

// Paginated data hook
export function usePaginatedApi<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchPage = useCallback(async (
    apiCall: (page: number, limit: number) => Promise<{
      data: T[];
      pagination: typeof pagination;
    }>,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(page, limit);
      
      if (page === 1) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setPagination(result.pagination);
      
      return result;
    } catch (err: any) {
      const appError = handleApiError(err);
      setError(appError.message);
      toast.showError('Error', appError.message);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMore = useCallback(async (
    apiCall: (page: number, limit: number) => Promise<{
      data: T[];
      pagination: typeof pagination;
    }>
  ) => {
    if (pagination.page < pagination.totalPages && !loading) {
      await fetchPage(apiCall, pagination.page + 1, pagination.limit);
    }
  }, [pagination, loading, fetchPage]);

  const refresh = useCallback(async (
    apiCall: (page: number, limit: number) => Promise<{
      data: T[];
      pagination: typeof pagination;
    }>
  ) => {
    await fetchPage(apiCall, 1, pagination.limit);
  }, [fetchPage, pagination.limit]);

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages,
    setData
  };
}

// Real-time data hook with WebSocket
export function useRealTimeData<T = any>(
  initialFetch?: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const connect = useCallback((
    wsUrl: string,
    onMessage: (data: any) => void
  ) => {
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      };
      
      ws.onerror = (_error) => {
        setError('WebSocket connection error');
        setConnected(false);
      };
      
      ws.onclose = () => {
        setConnected(false);
      };
      
      return ws;
    } catch (err) {
      setError('Failed to connect to real-time updates');
      return null;
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!initialFetch) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await initialFetch();
      setData(result);
    } catch (err: any) {
      const appError = handleApiError(err);
      setError(appError.message);
      toast.showError('Error', appError.message);
    } finally {
      setLoading(false);
    }
  }, [initialFetch, toast]);

  return {
    data,
    connected,
    loading,
    error,
    setData,
    connect,
    fetchInitialData
  };
}

// Optimistic updates hook
export function useOptimisticUpdates<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map());
  const toast = useToast();

  const addOptimistic = useCallback((id: string, item: T) => {
    setOptimisticUpdates(prev => new Map(prev).set(id, item));
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const executeWithOptimisticUpdate = useCallback(async <R>(
    optimisticId: string,
    optimisticItem: T,
    apiCall: () => Promise<R>,
    onSuccess?: (result: R) => void,
    onError?: (error: any) => void
  ) => {
    // Add optimistic update
    addOptimistic(optimisticId, optimisticItem);
    
    try {
      const result = await apiCall();
      removeOptimistic(optimisticId);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      // Remove optimistic update on error
      removeOptimistic(optimisticId);
      
      const appError = handleApiError(err);
      toast.showError('Error', appError.message);
      
      if (onError) {
        onError(appError);
      }
      
      throw appError;
    }
  }, [addOptimistic, removeOptimistic, toast]);

  const getDisplayData = useCallback(() => {
    const optimisticItems = Array.from(optimisticUpdates.values());
    return [...data, ...optimisticItems];
  }, [data, optimisticUpdates]);

  return {
    data,
    setData,
    optimisticUpdates,
    executeWithOptimisticUpdate,
    getDisplayData
  };
}

// Debounced search hook
export function useDebouncedSearch<T = any>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (err: any) {
        const appError = handleApiError(err);
        setError(appError.message);
        toast.showError('Search Error', appError.message);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, searchFn, delay, toast]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([])
  };
}

// Cache hook for API responses
export function useApiCache<T = any>(key: string) {
  const [cache] = useState(() => new Map<string, { data: T; timestamp: number }>());
  
  const getCached = useCallback((maxAge: number = 5 * 60 * 1000): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cache, key]);
  
  const setCached = useCallback((data: T) => {
    cache.set(key, { data, timestamp: Date.now() });
  }, [cache, key]);
  
  const clearCache = useCallback(() => {
    cache.delete(key);
  }, [cache, key]);
  
  return { getCached, setCached, clearCache };
}
