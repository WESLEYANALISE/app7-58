import { useState, useEffect, useCallback } from 'react';

interface AccessItem {
  id: string;
  title: string;
  icon: string;
  timestamp: number;
  route?: string;
}

const STORAGE_KEY = 'app_access_history';
const MAX_ITEMS = 10;

export const useAccessHistory = () => {
  const [history, setHistory] = useState<AccessItem[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }, []);

  // Salvar no localStorage quando histórico mudar
  const saveHistory = useCallback((newHistory: AccessItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }, []);

  // Adicionar item ao histórico
  const addToHistory = useCallback((item: Omit<AccessItem, 'timestamp'>) => {
    const newItem: AccessItem = {
      ...item,
      timestamp: Date.now()
    };

    setHistory(currentHistory => {
      // Remover item existente se houver
      const filtered = currentHistory.filter(h => h.id !== item.id);
      
      // Adicionar no início e limitar a MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      
      // Salvar no localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erro ao salvar histórico:', error);
      }
      
      return updated;
    });
  }, []);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }, []);

  // Obter últimos N itens
  const getRecentItems = useCallback((count: number = 5) => {
    return history.slice(0, count);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentItems
  };
};