import { useState, useEffect } from 'react';
import { PlanoEstudoGerado } from '@/components/PlanoEstudo/types';

export interface PlanoEstudoHistorico extends PlanoEstudoGerado {
  id: string;
  createdAt: string;
}

const STORAGE_KEY = 'plano-estudo-history';
const MAX_HISTORY = 10;

export const usePlanoEstudoHistory = () => {
  const [history, setHistory] = useState<PlanoEstudoHistorico[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }, []);

  // Salvar no localStorage sempre que history mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }, [history]);

  const addToHistory = (plano: PlanoEstudoGerado) => {
    const novoItem: PlanoEstudoHistorico = {
      ...plano,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    setHistory(prev => {
      // Adicionar no início e manter apenas os últimos MAX_HISTORY
      const newHistory = [novoItem, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });

    return novoItem.id;
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getById = (id: string): PlanoEstudoHistorico | undefined => {
    return history.find(item => item.id === id);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getById
  };
};