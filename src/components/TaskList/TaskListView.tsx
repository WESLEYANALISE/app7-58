import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskListForm } from './TaskListForm';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import type { TaskList } from '@/hooks/useTaskManager';

interface TaskListViewProps {
  taskLists: TaskList[];
  onSelectList: (listId: string) => void;
  onCreateList: (data: { nome: string; descricao: string }) => Promise<boolean>;
  onUpdateList: (id: string, data: { nome: string; descricao: string }) => Promise<boolean>;
  onDeleteList: (id: string) => Promise<boolean>;
  getListStats: (listId: string) => { completed: number; total: number; progress: number };
}

export const TaskListView = ({
  taskLists,
  onSelectList,
  onCreateList,
  onUpdateList,
  onDeleteList,
  getListStats
}: TaskListViewProps) => {
  const { isMobile, isTablet } = useDeviceDetection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);

  const handleEditList = (list: TaskList) => {
    setEditingList(list);
  };

  const handleUpdateList = async (data: { nome: string; descricao: string }) => {
    if (editingList) {
      const success = await onUpdateList(editingList.id, data);
      if (success) {
        setEditingList(null);
      }
      return success;
    }
    return false;
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Suas Listas</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-white/20 hover:bg-white/30 text-white border-white/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {taskLists.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma lista criada</h3>
          <p className="text-white/80 mb-4">Comece criando sua primeira lista de tarefas</p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            Criar Primeira Lista
          </Button>
        </div>
      ) : (
        <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
          {taskLists.map((list) => {
            const stats = getListStats(list.id);
            return (
              <div
                key={list.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                onClick={() => onSelectList(list.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white group-hover:text-white/90">
                    {list.nome}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditList(list);
                      }}
                      className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list.id);
                      }}
                      className="h-6 w-6 p-0 text-white/60 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {list.descricao && (
                  <p className="text-sm text-white/70 mb-3">{list.descricao}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/80">
                    <span>{stats.completed} de {stats.total} concluídas</span>
                    <span>{stats.progress}%</span>
                  </div>
                  <Progress value={stats.progress} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskListForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={onCreateList}
        title="Nova Lista"
      />

      <TaskListForm
        open={!!editingList}
        onClose={() => setEditingList(null)}
        onSubmit={handleUpdateList}
        title="Editar Lista"
        initialData={editingList ? { nome: editingList.nome, descricao: editingList.descricao || '' } : undefined}
      />
    </div>
  );
};