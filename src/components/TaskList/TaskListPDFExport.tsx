import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';
import type { Task, TaskList } from '@/hooks/useTaskManager';

interface TaskListPDFExportProps {
  taskList: TaskList;
  tasks: Task[];
  stats: {
    total: number;
    concluidas: number;
    pendentes: number;
    atrasadas: number;
  };
}

export const TaskListPDFExport = ({ 
  taskList, 
  tasks,
  stats
}: TaskListPDFExportProps) => {
  const { exporting, exportarPDF } = useGenericPDFExport();

  const getPrioridadeText = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Não definida';
    }
  };

  const handleExport = () => {
    const sections = [
      {
        titulo: "Informações da Lista",
        conteudo: `**Nome:** ${taskList.nome}\n${taskList.descricao ? `**Descrição:** ${taskList.descricao}\n` : ''}**Criada em:** ${new Date(taskList.created_at).toLocaleDateString('pt-BR')}`,
        destaque: true
      },
      {
        titulo: "Estatísticas",
        conteudo: `**Total de Tarefas:** ${stats.total}\n**Concluídas:** ${stats.concluidas}\n**Pendentes:** ${stats.pendentes}\n**Atrasadas:** ${stats.atrasadas}`,
        destaque: true
      },
      {
        titulo: "Tarefas Pendentes",
        conteudo: tasks.filter(task => !task.concluida).length > 0 
          ? tasks.filter(task => !task.concluida).map((task, index) => {
              return `**${index + 1}. ${task.titulo}**\n` +
                     `Descrição: ${task.descricao || 'Sem descrição'}\n` +
                     `Prioridade: ${getPrioridadeText(task.prioridade)}\n` +
                     `${task.data_vencimento ? `Vencimento: ${new Date(task.data_vencimento).toLocaleDateString('pt-BR')}\n` : ''}` +
                     `Status: Pendente\n\n`;
            }).join('')
          : 'Nenhuma tarefa pendente.'
      },
      {
        titulo: "Tarefas Concluídas",
        conteudo: tasks.filter(task => task.concluida).length > 0
          ? tasks.filter(task => task.concluida).map((task, index) => {
              return `**${index + 1}. ${task.titulo}**\n` +
                     `Descrição: ${task.descricao || 'Sem descrição'}\n` +
                     `Prioridade: ${getPrioridadeText(task.prioridade)}\n` +
                     `${task.data_vencimento ? `Vencimento: ${new Date(task.data_vencimento).toLocaleDateString('pt-BR')}\n` : ''}` +
                     `Status: ✅ Concluída\n\n`;
            }).join('')
          : 'Nenhuma tarefa concluída.'
      }
    ];

    const dataExport = {
      titulo: taskList.nome,
      tipo: "Lista de Tarefas",
      sections,
      metadata: {
        'Data': new Date().toLocaleDateString('pt-BR'),
        'Total de Tarefas': stats.total.toString(),
        'Taxa de Conclusão': `${Math.round((stats.concluidas / stats.total) * 100)}%`
      }
    };

    exportarPDF(dataExport);
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={exporting || tasks.length === 0}
      size="sm"
      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};