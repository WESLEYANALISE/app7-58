import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, Image, Loader2, Download, Copy, CheckCircle } from 'lucide-react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumoResult, setResumoResult] = useState<ResumoResult | null>(null);
  const [copied, setCopied] = useState(false);
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
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append('file', file);

      // Chamar o edge function para resumo detalhado
      const { data, error } = await supabase.functions.invoke('generate-detailed-summary', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setResumoResult(data);
      toast({
        title: "Resumo gerado! 📝",
        description: "Seu documento foi resumido com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao gerar resumo:', error);
      toast({
        title: "Erro ao gerar resumo",
        description: error.message || "Erro ao processar o documento",
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
    if (!resumoResult || !file) return;
    
    exportarResumo({
      titulo: `Resumo Detalhado - ${file.name}`,
      resumo: resumoResult.resumo,
      explicacao: resumoResult.explicacao,
      pontosChave: resumoResult.pontosChave,
      documento: file.name,
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
                  Gere um resumo super detalhado e explicativo do seu documento usando IA
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
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

          {/* Generate Button */}
          {file && (
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
                Análise rápida e focada no conteúdo
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
                      <p className="font-medium">Analisando seu documento...</p>
                      <p className="text-sm text-muted-foreground">
                        Extraindo texto e gerando resumo detalhado
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
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
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
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {resumoResult.explicacao}
                  </p>
                </div>
              </CardContent>
            </Card>

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
                      <span className="text-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};