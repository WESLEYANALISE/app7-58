import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskListView } from './TaskListView';
import { TaskView } from './TaskView';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useAuth } from '@/context/AuthContext';
import { TaskListPDFExport } from './TaskListPDFExport';

interface TaskListContainerProps {
  onBack: () => void;
}

export const TaskListContainer = ({ onBack }: TaskListContainerProps) => {
  const { isMobile } = useDeviceDetection();
  const { user } = useAuth();
  const {
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
    getListStats
  } = useTaskManager();

  // Se não estiver logado, mostrar mensagem
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-red-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="mb-6">Você precisa estar logado para acessar suas tarefas.</p>
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-red-900">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const selectedList = taskLists.find(list => list.id === selectedListId);

  const handleCreateTask = async (data: {
    titulo: string;
    descricao?: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento?: string;
  }) => {
    if (selectedListId) {
      return await createTask(selectedListId, {
        ...data,
        descricao: data.descricao || '',
        concluida: false,
        data_vencimento: data.data_vencimento || undefined
      });
    }
    return false;
  };

  const handleUpdateTask = async (id: string, data: {
    titulo: string;
    descricao?: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento?: string;
  }) => {
    return await updateTask(id, {
      ...data,
      descricao: data.descricao || '',
      data_vencimento: data.data_vencimento || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 to-red-900">
      {/* Header */}
      <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} bg-black/10 backdrop-blur-sm border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedListId ? () => setSelectedListId(null) : onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
            {!isMobile && 'Voltar'}
          </Button>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}>
              {selectedList ? selectedList.nome : 'Lista de Tarefas'}
            </h1>
            {selectedList && selectedList.descricao && (
              <p className="text-sm text-white/80">{selectedList.descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : !selectedListId ? (
        <TaskListView
          taskLists={taskLists}
          onSelectList={setSelectedListId}
          onCreateList={(data) => createList(data.nome, data.descricao)}
          onUpdateList={(id, data) => updateList(id, data)}
          onDeleteList={deleteList}
          getListStats={getListStats}
        />
      ) : selectedList ? (
        <TaskView
          tasks={tasks}
          selectedList={selectedList}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={deleteTask}
          onToggleTask={toggleTaskCompletion}
          pdfExportComponent={
            <TaskListPDFExport
              taskList={selectedList}
              tasks={tasks}
              stats={{
                total: tasks.length,
                concluidas: tasks.filter(t => t.concluida).length,
                pendentes: tasks.filter(t => !t.concluida).length,
                atrasadas: tasks.filter(t => !t.concluida && t.data_vencimento && new Date(t.data_vencimento) < new Date()).length
              }}
            />
          }
        />
      ) : null}
    </div>
  );
};