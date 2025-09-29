import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { TaskList, Task } from '@/hooks/useTaskManager';

interface TaskListFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; descricao: string }) => Promise<boolean>;
  title: string;
  initialData?: { nome: string; descricao: string };
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento: string;
  }) => Promise<boolean>;
  title: string;
  initialData?: {
    titulo: string;
    descricao: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data_vencimento: string;
  };
}

export const TaskListForm = ({ open, onClose, onSubmit, title, initialData }: TaskListFormProps) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    const success = await onSubmit(formData);
    if (success) {
      setFormData({ nome: '', descricao: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ nome: '', descricao: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nome da lista"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const TaskForm = ({ open, onClose, onSubmit, title, initialData }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    prioridade: initialData?.prioridade || 'media' as 'alta' | 'media' | 'baixa',
    data_vencimento: initialData?.data_vencimento || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;

    const success = await onSubmit(formData);
    if (success) {
      setFormData({ titulo: '', descricao: '', prioridade: 'media', data_vencimento: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ titulo: '', descricao: '', prioridade: 'media', data_vencimento: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Título da tarefa"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <Select 
              value={formData.prioridade} 
              onValueChange={(value: 'alta' | 'media' | 'baixa') => 
                setFormData(prev => ({ ...prev, prioridade: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};