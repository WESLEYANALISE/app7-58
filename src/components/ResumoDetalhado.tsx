import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, FileText, Image, Loader2, Download, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumoDetalhadoPDFExport } from '@/hooks/useResumoDetalhadoPDFExport';

interface ResumoDetalhadoProps {
  onBack: () => void;
}

interface ResumoResult {
  resumo: string;
  explicacao: string;
  pontosChave: string[];
}

export const ResumoDetalhado = ({ onBack }: ResumoDetalhadoProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumoResult, setResumoResult] = useState<ResumoResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { exportarResumo, exporting } = useResumoDetalhadoPDFExport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, envie apenas arquivos PDF ou imagens (JPEG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (20MB max)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 20MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setInputMode('file');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const generateSummary = async () => {
    if (!file && !textInput.trim()) {
      toast({
        title: "Entrada vazia",
        description: "Por favor, insira um texto ou envie um arquivo",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      if (inputMode === 'text') {
        // Gerar resumo a partir de texto usando Gemini
        const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
          body: {
            message: `Como especialista em Direito, gere um resumo detalhado do seguinte conteúdo:

${textInput}

Por favor, forneça uma resposta estruturada em JSON com o seguinte formato:
{
  "resumo": "um resumo claro e objetivo do conteúdo (2-3 parágrafos)",
  "explicacao": "uma explicação detalhada e didática expandindo os conceitos principais (4-5 parágrafos)",
  "pontosChave": ["ponto 1", "ponto 2", "ponto 3", "ponto 4", "ponto 5"]
}`,
            conversationHistory: []
          }
        });

        if (error) throw error;

        // Tentar extrair JSON da resposta
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResumoResult(parsed);
        } else {
          // Fallback se não conseguir parsear
          setResumoResult({
            resumo: data.response,
            explicacao: "Análise detalhada não disponível neste formato.",
            pontosChave: []
          });
        }

      } else {
        // Gerar resumo a partir de arquivo (método existente)
        const formData = new FormData();
        formData.append('file', file!);

        const { data, error } = await supabase.functions.invoke('generate-detailed-summary', {
          body: formData,
        });

        if (error) throw error;
        setResumoResult(data);
      }

      toast({
        title: "Resumo gerado! 📝",
        description: "Seu conteúdo foi resumido com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao gerar resumo:', error);
      toast({
        title: "Erro ao gerar resumo",
        description: error.message || "Erro ao processar o conteúdo",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!resumoResult) return;

    const fullText = `# RESUMO DETALHADO

## RESUMO PRINCIPAL
${resumoResult.resumo}

## EXPLICAÇÃO DETALHADA
${resumoResult.explicacao}

## PONTOS-CHAVE
${resumoResult.pontosChave.map(item => `• ${item}`).join('\n')}

---
Gerado em: ${new Date().toLocaleString('pt-BR')}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado! 📋",
        description: "O resumo foi copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    if (!resumoResult) return;
    
    const sourceName = inputMode === 'file' && file 
      ? file.name 
      : 'Conteúdo digitado';
    
    exportarResumo({
      titulo: `Resumo Detalhado - ${sourceName}`,
      resumo: resumoResult.resumo,
      explicacao: resumoResult.explicacao,
      pontosChave: resumoResult.pontosChave,
      documento: sourceName,
      dataAnalise: new Date().toLocaleString('pt-BR')
    });
  };

  return (
    <div className="space-y-6">
      {!resumoResult ? (
        <>
          {/* Header Info */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">📝 Resumo Detalhado</h2>
                <p className="text-muted-foreground">
                  Gere um resumo detalhado digitando seu conteúdo ou enviando um arquivo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modo de entrada */}
          <div className="flex gap-3 justify-center">
            <Button
              variant={inputMode === 'text' ? 'default' : 'outline'}
              onClick={() => setInputMode('text')}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Digitar Texto
            </Button>
            <Button
              variant={inputMode === 'file' ? 'default' : 'outline'}
              onClick={() => setInputMode('file')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Enviar Arquivo
            </Button>
          </div>

          {/* Input de texto */}
          {inputMode === 'text' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Digite ou cole o conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite ou cole aqui o texto, tópico ou conteúdo que deseja resumir...

Exemplos:
• Artigos de lei
• Temas jurídicos
• Textos de estudo
• Conceitos para revisar"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[300px] text-base leading-relaxed"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {textInput.length} caracteres
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Area */}
          {inputMode === 'file' && (
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-accent/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Envie seu documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="min-h-[200px] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-accent/10 rounded-lg transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-8 w-8 text-accent" />
                        ) : (
                          <FileText className="h-8 w-8 text-accent" />
                        )}
                      </div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remover arquivo
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Clique ou arraste um arquivo</h3>
                      <p className="text-muted-foreground mb-4">
                        Suporte para PDF e imagens (JPEG, PNG)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tamanho máximo: 20MB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {((inputMode === 'text' && textInput.trim()) || (inputMode === 'file' && file)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Button
                onClick={generateSummary}
                disabled={isAnalyzing}
                size="lg"
                className="px-8"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando resumo...
                  </>
                ) : (
                  <>
                    📝 Gerar Resumo Detalhado
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Análise detalhada gerada por IA
              </p>
            </motion.div>
          )}

          {/* Progress Info */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <div>
                      <p className="font-medium">Analisando seu conteúdo...</p>
                      <p className="text-sm text-muted-foreground">
                        {inputMode === 'file' ? 'Extraindo texto e gerando resumo detalhado' : 'Gerando resumo detalhado do texto'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      ) : (
        /* Results */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
            <Button
              onClick={() => {
                setResumoResult(null);
                setFile(null);
                setTextInput('');
              }}
              variant="outline"
            >
              Novo Resumo
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📄 Resumo Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                    {resumoResult.resumo}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📖 Explicação Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                    {resumoResult.explicacao}
                  </p>
                </div>
              </CardContent>
            </Card>

            {resumoResult.pontosChave && resumoResult.pontosChave.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 Pontos-Chave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {resumoResult.pontosChave.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-accent mt-1 font-bold">•</span>
                        <span className="text-foreground leading-relaxed text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};