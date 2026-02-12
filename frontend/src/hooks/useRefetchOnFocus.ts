import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Refetches a query when the screen gains focus, but only if the data is stale.
 * Replaces the pattern: useFocusEffect(() => loadData())
 */
export function useRefetchOnFocus(query: Pick<UseQueryResult, 'isStale' | 'refetch'>) {
  useFocusEffect(
    useCallback(() => {
      if (query.isStale) {
        query.refetch();
      }
    }, [query.isStale, query.refetch])
  );
}
