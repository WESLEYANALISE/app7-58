import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface TaskList {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  list_id: string;
  titulo: string;
  descricao?: string;
  concluida: boolean;
  prioridade: 'alta' | 'media' | 'baixa';
  data_vencimento?: string;
  created_at: string;
  updated_at: string;
}

export const useListaTarefas = () => {
  const { user } = useAuth();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Buscar listas de tarefas
  const fetchTaskLists = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaskLists(data || []);
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      toast.error('Erro ao carregar listas de tarefas');
    }
  }, [user]);

  // Buscar tarefas de uma lista específica
  const fetchTasks = useCallback(async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    }
  }, []);

  // Criar nova lista
  const createList = useCallback(async (nome: string, descricao?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_task_lists')
        .insert({ user_id: user.id, nome, descricao })
        .select()
        .single();

      if (error) throw error;
      
      setTaskLists(prev => [data, ...prev]);
      toast.success('Lista criada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      toast.error('Erro ao criar lista');
    }
  }, [user]);

  // Atualizar lista
  const updateList = useCallback(async (id: string, updates: Partial<Pick<TaskList, 'nome' | 'descricao'>>) => {
    try {
      const { data, error } = await supabase
        .from('user_task_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTaskLists(prev => prev.map(list => list.id === id ? data : list));
      toast.success('Lista atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      toast.error('Erro ao atualizar lista');
    }
  }, []);

  // Excluir lista
  const deleteList = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_task_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTaskLists(prev => prev.filter(list => list.id !== id));
      if (selectedListId === id) {
        setSelectedListId(null);
        setTasks([]);
      }
      toast.success('Lista excluída!');
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast.error('Erro ao excluir lista');
    }
  }, [selectedListId]);

  // Criar nova tarefa
  const createTask = useCallback(async (listId: string, task: Omit<Task, 'id' | 'list_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .insert({ ...task, list_id: listId })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data as Task, ...prev]);
      toast.success('Tarefa criada!');
      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  }, []);

  // Atualizar tarefa
  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'list_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === id ? data as Task : task));
      
      if (updates.concluida !== undefined) {
        toast.success(updates.concluida ? 'Tarefa concluída!' : 'Tarefa reaberta!');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  }, []);

  // Excluir tarefa
  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Tarefa excluída!');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  }, []);

  // Alternar status de conclusão da tarefa
  const toggleTaskCompletion = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { concluida: !task.concluida });
    }
  }, [tasks, updateTask]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchTaskLists().finally(() => setLoading(false));
    } else {
      setTaskLists([]);
      setTasks([]);
      setSelectedListId(null);
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar tarefas quando uma lista é selecionada
  useEffect(() => {
    if (selectedListId) {
      fetchTasks(selectedListId);
    } else {
      setTasks([]);
    }
  }, [selectedListId]);

  // Estatísticas
  const getListStats = useCallback((listId: string) => {
    const listTasks = tasks.filter(task => task.list_id === listId);
    const completed = listTasks.filter(task => task.concluida).length;
    const total = listTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, progress };
  }, [tasks]);

  return {
    taskLists,
    tasks,
    loading,
    selectedListId,
    setSelectedListId,
    createList,
    updateList,
    deleteList,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getListStats,
    fetchTaskLists,
    fetchTasks
  };
};