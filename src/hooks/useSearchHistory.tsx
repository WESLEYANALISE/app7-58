import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  id: string;
  term: string;
  timestamp: number;
  results: number;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const STORAGE_KEY = 'search_history';
  const MAX_HISTORY_ITEMS = 10;

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [history]);

  const addToHistory = (term: string, results: number = 0) => {
    if (!term.trim()) return;

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      term: term.trim(),
      timestamp: Date.now(),
      results
    };

    setHistory(prev => {
      // Remove duplicates (same term)
      const filtered = prev.filter(item => 
        item.term.toLowerCase() !== term.toLowerCase()
      );
      
      // Add new item at the beginning
      const updated = [newItem, ...filtered];
      
      // Keep only the most recent items
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};
