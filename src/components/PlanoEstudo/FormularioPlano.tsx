import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Clock, Calendar, Loader2, Upload, FileText, Image } from 'lucide-react';
import { FormularioPlanoData } from './types';
import { useToast } from '@/components/ui/use-toast';

interface FormularioPlanoProps {
  onSubmit: (dados: FormularioPlanoData) => void;
  loading: boolean;
}

export const FormularioPlano = ({ onSubmit, loading }: FormularioPlanoProps) => {
  const [materia, setMateria] = useState('');
  const [dias, setDias] = useState(7);
  const [horasPorDia, setHorasPorDia] = useState(2);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
  };

  const handleFileSelection = (file: File | null | undefined) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type)) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "Arquivo muito grande",
            description: "O arquivo deve ter no máximo 10MB",
            variant: "destructive"
          });
          return;
        }
        setArquivo(file);
        toast({
          title: "Arquivo carregado",
          description: `${file.name} foi carregado com sucesso`
        });
      } else {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas PDF e imagens (JPG, PNG, WebP) são aceitos",
          variant: "destructive"
        });
      }
    }
  };


  const handleRemoveFile = () => {
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia.trim()) return;
    
    onSubmit({
      materia: materia.trim(),
      dias,
      horasPorDia,
      arquivo: arquivo || undefined
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader className="text-center px-4 sm:px-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Criar Plano de Estudo
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 text-sm sm:text-base">
          Informe os dados abaixo para gerar um plano de estudos personalizado
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-xs sm:text-sm font-medium">
              Matéria ou Assunto
            </Label>
            <Input
              id="materia"
              placeholder="Ex: Direito Constitucional, Direito Civil, OAB..."
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                Dias disponíveis
              </Label>
              <Select value={dias.toString()} onValueChange={(value) => setDias(parseInt(value))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14, 21, 30, 60, 90].map((d) => (
                    <SelectItem key={d} value={d.toString()} className="text-sm">
                      {d} dias
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Horas por dia
              </Label>
              <Select value={horasPorDia.toString()} onValueChange={(value) => setHorasPorDia(parseInt(value))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                    <SelectItem key={h} value={h.toString()} className="text-sm">
                      {h} {h === 1 ? 'hora' : 'horas'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Label className="text-xs sm:text-sm font-medium">
              Material de Estudo (Opcional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Carregue um PDF ou imagem do seu material para criar um plano personalizado
            </p>
            
            {arquivo ? (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {arquivo.type === 'application/pdf' ? (
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Image className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                    {arquivo.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-muted-foreground hover:text-destructive p-1 h-auto flex-shrink-0"
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Upload PDF
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Galeria
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium"
            disabled={loading || !materia.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Gerando plano...</span>
                <span className="sm:hidden">Gerando...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Gerar Plano de Estudo</span>
                <span className="sm:hidden">Gerar Plano</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};