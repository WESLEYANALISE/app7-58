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

export const useTaskManager = () => {
  const { user } = useAuth();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Buscar listas de tarefas
  const loadTaskLists = useCallback(async () => {
    if (!user?.id) {
      console.log('useTaskManager: user not found');
      return;
    }

    console.log('useTaskManager: loading task lists for user', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useTaskManager: error loading task lists', error);
        throw error;
      }
      
      console.log('useTaskManager: task lists loaded', data);
      setTaskLists(data || []);
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      toast.error('Erro ao carregar listas de tarefas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Buscar tarefas de uma lista específica
  const loadTasks = useCallback(async (listId: string) => {
    if (!listId) return;

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
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('user_task_lists')
        .insert({ user_id: user.id, nome, descricao })
        .select()
        .single();

      if (error) throw error;
      
      setTaskLists(prev => [data, ...prev]);
      toast.success('Lista criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      toast.error('Erro ao criar lista');
      return false;
    }
  }, [user?.id]);

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
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      toast.error('Erro ao atualizar lista');
      return false;
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
      return true;
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast.error('Erro ao excluir lista');
      return false;
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
      return true;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      return false;
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
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      return false;
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
      return true;
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
      return false;
    }
  }, []);

  // Alternar status de conclusão da tarefa
  const toggleTaskCompletion = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      return await updateTask(id, { concluida: !task.concluida });
    }
    return false;
  }, [tasks, updateTask]);

  // Estatísticas
  const getListStats = useCallback((listId: string) => {
    const listTasks = tasks.filter(task => task.list_id === listId);
    const completed = listTasks.filter(task => task.concluida).length;
    const total = listTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, progress };
  }, [tasks]);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('useTaskManager: effect triggered, user:', user?.id);
    if (user?.id) {
      loadTaskLists();
    } else {
      console.log('useTaskManager: clearing data, no user');
      setTaskLists([]);
      setTasks([]);
      setSelectedListId(null);
    }
  }, [user?.id]);

  // Carregar tarefas quando uma lista é selecionada
  useEffect(() => {
    if (selectedListId) {
      loadTasks(selectedListId);
    } else {
      setTasks([]);
    }
  }, [selectedListId]);

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
    loadTaskLists,
    loadTasks
  };
};