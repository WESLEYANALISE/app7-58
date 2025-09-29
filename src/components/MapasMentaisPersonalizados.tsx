import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, Sparkles, Loader2, FileText, Type, Image, Home, Download } from 'lucide-react';
import { useMindMapPDFExport } from '@/hooks/useMindMapPDFExport';

interface MapasMentaisPersonalizadosProps {
  onBack: () => void;
  onHome?: () => void;
}

interface TextMindMap {
  title: string;
  centralTopic: string;
  branches: {
    title: string;
    icon: string;
    subtopics: {
      title: string;
      content: string;
    }[];
  }[];
}

export const MapasMentaisPersonalizados = ({ onBack, onHome }: MapasMentaisPersonalizadosProps) => {
  const [currentStep, setCurrentStep] = useState<'input' | 'viewer'>('input');
  const [customText, setCustomText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<TextMindMap | null>(null);
  const { toast } = useToast();
  const { exportMindMapToPDF, exporting } = useMindMapPDFExport();

  const generateMindMap = async (content: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-mind-map', {
        body: {
          content,
          type: 'custom',
          format: 'text'
        }
      });

      if (error) {
        throw error;
      }

      const mindMapData = (data as any)?.mindMap ?? data;
      
      if (!mindMapData) {
        throw new Error('Resposta inválida do gerador de mapas');
      }

      // Converter para formato de texto estruturado
      let textMap: TextMindMap;

      if (mindMapData.branches) {
        // Já está no formato texto correto
        textMap = mindMapData as TextMindMap;
      } else {
        // Converter de outros formatos
        textMap = {
          title: mindMapData.title || 'Mapa Mental Personalizado',
          centralTopic: mindMapData.centralTopic || mindMapData.title || content.substring(0, 30),
          branches: mindMapData.nodes?.slice(1, 6).map((node: any, index: number) => ({
            title: node.data?.label || node.label || `Tópico ${index + 1}`,
            icon: getIconForIndex(index),
            subtopics: [
              {
                title: 'Definição',
                content: node.data?.content || 'Conteúdo relacionado ao tópico'
              }
            ]
          })) || []
        };
      }

      setGeneratedMap(textMap);
      setCurrentStep('viewer');
      
      toast({
        title: "Mapa Mental Gerado!",
        description: "Seu mapa mental foi criado com sucesso."
      });
    } catch (error: any) {
      console.error('Error generating mind map:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao gerar o mapa mental. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getIconForIndex = (index: number) => {
    const icons = ['🎯', '📚', '⚖️', '💼', '🔍', '📋', '💡', '🎓'];
    return icons[index % icons.length];
  };

  const handleCustomGeneration = async () => {
    if (!customText.trim() && !uploadedFile) {
      toast({
        title: "Aviso",
        description: "Por favor, insira um texto ou faça upload de um arquivo.",
        variant: "destructive"
      });
      return;
    }

    let content = customText;

    // Processar arquivo se foi enviado
    if (uploadedFile) {
      try {
        console.log('Processing uploaded file:', uploadedFile.name, uploadedFile.type);
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const { data, error } = await supabase.functions.invoke('extract-text', {
          body: formData
        });
        
        if (error) {
          console.error('Extract text error:', error);
          throw new Error(`Erro ao processar arquivo: ${error.message}`);
        }
        
        if (data && data.text) {
          content = data.text;
          console.log('Text extracted successfully, length:', content.length);
        } else {
          throw new Error('Nenhum texto foi extraído do arquivo');
        }
        
        // Se não há texto personalizado, usar apenas o conteúdo extraído
        if (!customText.trim()) {
          // Usar apenas o texto extraído
        } else {
          // Combinar texto personalizado com conteúdo extraído
          content = `${customText}\n\nConteúdo do arquivo:\n${content}`;
        }
        
      } catch (error: any) {
        console.error('Error processing file:', error);
        toast({
          title: "Erro no Processamento",
          description: error.message || "Falha ao processar o arquivo. Usando texto inserido.",
          variant: "destructive"
        });
        
        // Se falhar, usar apenas o texto personalizado se existir
        if (!customText.trim()) {
          return; // Não há conteúdo para processar
        }
        content = customText;
      }
    }

    // Garantir que há conteúdo para processar
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Não há conteúdo para gerar o mapa mental.",
        variant: "destructive"
      });
      return;
    }

    await generateMindMap(content);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Limite de 10MB.",
          variant: "destructive"
        });
        return;
      }
      setUploadedFile(file);
      toast({
        title: "Arquivo Carregado",
        description: `${file.name} foi carregado com sucesso.`
      });
    }
  }, [toast]);

  const handleExportPDF = async () => {
    if (!generatedMap) return;
    await exportMindMapToPDF(generatedMap);
  };

  const handleBack = () => {
    if (currentStep === 'viewer') {
      setCurrentStep('input');
      setGeneratedMap(null);
    } else {
      onBack();
    }
  };

  const renderHeader = () => (
    <div className="bg-card border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tools-primary to-tools-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Mapas Personalizados</h1>
          </div>
        </div>
        
        {onHome && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onHome}
            className="hover:bg-muted flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Início</span>
          </Button>
        )}
      </div>
    </div>
  );

  const renderInputStep = () => (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tools-primary" />
              Criar Mapa Mental com IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Insira um texto ou faça upload de um arquivo para gerar seu mapa mental personalizado.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Type className="w-4 h-4" />
                Digite seu conteúdo (opcional se enviar arquivo)
              </label>
              <Textarea
                placeholder="Digite o conteúdo que você deseja transformar em mapa mental. Por exemplo: conceitos jurídicos, matéria de estudo, resumo de aula..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground px-2">OU</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Faça upload de um arquivo
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isGenerating}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  {uploadedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-tools-primary" />
                      <span className="text-sm font-medium text-foreground">{uploadedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Image className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Clique para selecionar um arquivo
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF, TXT, DOC, DOCX ou Imagens (máx. 10MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button 
              onClick={handleCustomGeneration}
              disabled={isGenerating || (!customText.trim() && !uploadedFile)}
              className="w-full bg-gradient-to-r from-tools-primary to-tools-accent hover:from-tools-primary/90 hover:to-tools-accent/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Mapa Mental...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Mapa Mental
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderViewerStep = () => {
    if (!generatedMap) return null;

    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">{generatedMap.title}</h2>
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-gradient-to-r from-tools-primary to-tools-accent hover:from-tools-primary/90 hover:to-tools-accent/90"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tópico Central */}
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-gradient-to-br from-tools-primary/20 to-tools-accent/20 rounded-xl border-2 border-tools-primary/30">
              <h3 className="text-2xl font-bold text-foreground mb-2">🎯 {generatedMap.centralTopic}</h3>
              <p className="text-sm text-muted-foreground">Tópico Central</p>
            </div>
          </div>

          {/* Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedMap.branches.map((branch, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <span className="text-2xl">{branch.icon}</span>
                    {branch.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {branch.subtopics.map((subtopic, subIndex) => (
                    <div key={subIndex} className="border-l-2 border-tools-primary/30 pl-3">
                      <h4 className="font-medium text-foreground mb-1">{subtopic.title}</h4>
                      <p className="text-sm text-muted-foreground">{subtopic.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {renderHeader()}
      
      <div className="flex-1">
        {currentStep === 'input' && renderInputStep()}
        {currentStep === 'viewer' && renderViewerStep()}
      </div>
    </div>
  );
};