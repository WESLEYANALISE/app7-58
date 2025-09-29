import { useState } from 'react';
import { Plus, Check, Search, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TaskForm } from './TaskListForm';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import type { Task, TaskList } from '@/hooks/useTaskManager';

interface TaskViewProps {
  tasks: Task[];
  selectedList: TaskList;
  onCreateTask: (data: {
    titulo: string;
    descricao?: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento?: string;
  }) => Promise<boolean>;
  onUpdateTask: (id: string, data: {
    titulo: string;
    descricao?: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento?: string;
  }) => Promise<boolean>;
  onDeleteTask: (id: string) => Promise<boolean>;
  onToggleTask: (id: string) => Promise<boolean>;
  pdfExportComponent?: React.ReactNode;
}

const getPriorityColor = (prioridade: string) => {
  switch (prioridade) {
    case 'alta': return 'bg-red-500/20 text-red-700 border-red-200';
    case 'media': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
    case 'baixa': return 'bg-green-500/20 text-green-700 border-green-200';
    default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
  }
};

const getPriorityIcon = (prioridade: string) => {
  switch (prioridade) {
    case 'alta': return '🔴';
    case 'media': return '🟡';
    case 'baixa': return '🟢';
    default: return '⚪';
  }
};

export const TaskView = ({
  tasks,
  selectedList,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  pdfExportComponent
}: TaskViewProps) => {
  const { isMobile } = useDeviceDetection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'alta' | 'media' | 'baixa'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !task.concluida) ||
                         (filterStatus === 'completed' && task.concluida);
    
    const matchesPriority = filterPriority === 'all' || task.prioridade === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (data: {
    titulo: string;
    descricao: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento: string;
  }) => {
    if (editingTask) {
      const success = await onUpdateTask(editingTask.id, data);
      if (success) {
        setEditingTask(null);
      }
      return success;
    }
    return false;
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{selectedList.nome}</h2>
          {selectedList.descricao && (
            <p className="text-sm text-white/80">{selectedList.descricao}</p>
          )}
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-white/20 hover:bg-white/30 text-white border-white/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros e busca */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de tarefas */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {tasks.length === 0 ? 'Nenhuma tarefa criada' : 'Nenhuma tarefa encontrada'}
          </h3>
          <p className="text-white/80 mb-4">
            {tasks.length === 0 
              ? 'Comece adicionando uma nova tarefa' 
              : 'Tente ajustar os filtros de busca'
            }
          </p>
          {tasks.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              Criar Primeira Tarefa
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all ${
                task.concluida ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-1 p-0 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                    task.concluida
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-white/40 hover:border-white'
                  }`}
                >
                  {task.concluida && <Check className="w-3 h-3" />}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium ${task.concluida ? 'line-through text-white/60' : 'text-white'}`}>
                      {task.titulo}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge className={`text-xs ${getPriorityColor(task.prioridade)}`}>
                        {getPriorityIcon(task.prioridade)} {task.prioridade}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {task.descricao && (
                    <p className={`text-sm mt-1 ${task.concluida ? 'text-white/40' : 'text-white/70'}`}>
                      {task.descricao}
                    </p>
                  )}
                  
                  {task.data_vencimento && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3 text-white/60" />
                      <span className="text-xs text-white/60">
                        {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={onCreateTask}
        title="Nova Tarefa"
      />

      <TaskForm
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        title="Editar Tarefa"
        initialData={editingTask ? {
          titulo: editingTask.titulo,
          descricao: editingTask.descricao || '',
          prioridade: editingTask.prioridade,
          data_vencimento: editingTask.data_vencimento || ''
        } : undefined}
      />
    </div>
  );
};