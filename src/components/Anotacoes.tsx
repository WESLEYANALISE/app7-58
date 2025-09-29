import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Tag, 
  Calendar,
  BookOpen,
  Filter,
  BarChart3,
  Upload,
  FileImage,
  FileText,
  Wand2,
  Highlighter,
  Bold,
  Italic,
  Underline,
  ArrowLeft,
  Star,
  Clock,
  FolderOpen,
  Maximize2,
  Minimize2,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';
import { useDropzone } from 'react-dropzone';

interface AnotacaoArquivo {
  id: string;
  tipo: 'image' | 'pdf';
  url: string;
  nome: string;
  textoExtraido?: string;
  aprovado?: boolean;
}

interface AnotacaoMarcacao {
  inicio: number;
  fim: number;
  cor: string;
  tipo: 'destaque' | 'sublinhado' | 'marca';
}

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  tags: string[];
  categoria: string;
  dataModificacao: Date;
  arquivos?: AnotacaoArquivo[];
  marcacoes?: AnotacaoMarcacao[];
  favorito?: boolean;
  privacidade?: 'privado' | 'publico';
  formatacao?: {
    negrito?: boolean;
    italico?: boolean;
    lista?: boolean;
  };
}

interface Categoria {
  nome: string;
  cor: string;
}

const categoriasPadrao: Categoria[] = [
  { nome: 'Geral', cor: 'bg-blue-500' },
  { nome: 'Estudo', cor: 'bg-green-500' },
  { nome: 'Trabalho', cor: 'bg-purple-500' },
  { nome: 'Projeto', cor: 'bg-orange-500' },
  { nome: 'Importante', cor: 'bg-red-500' },
  { nome: 'Jurisprudência', cor: 'bg-amber-500' },
  { nome: 'Doutrina', cor: 'bg-cyan-500' },
  { nome: 'Legislação', cor: 'bg-indigo-500' }
];

export const Anotacoes = () => {
  const { setCurrentFunction } = useNavigation();
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const { exporting, exportarPDF } = useGenericPDFExport();
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [telaInteira, setTelaInteira] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('todas');
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [novaAnotacao, setNovaAnotacao] = useState({
    titulo: '',
    conteudo: '',
    categoria: 'Geral',
    tags: '',
    privacidade: 'privado' as 'privado' | 'publico',
    favorito: false
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: '' });

  // Carregar anotações do localStorage
  useEffect(() => {
    const anotacoesSalvas = localStorage.getItem('anotacoes-juridicas-v2');
    if (anotacoesSalvas) {
      const parsed = JSON.parse(anotacoesSalvas);
      const anotacoesComData = parsed.map((anotacao: any) => ({
        ...anotacao,
        dataModificacao: new Date(anotacao.dataModificacao),
        arquivos: anotacao.arquivos || [],
        marcacoes: anotacao.marcacoes || [],
        favorito: anotacao.favorito || false,
        privacidade: anotacao.privacidade || 'privado'
      }));
      setAnotacoes(anotacoesComData);
    }
  }, []);

  // Salvar anotações
  const salvarAnotacoes = useCallback((novasAnotacoes: Anotacao[]) => {
    localStorage.setItem('anotacoes-juridicas-v2', JSON.stringify(novasAnotacoes));
    setAnotacoes(novasAnotacoes);
  }, []);

  // Upload de arquivos com verificação de conteúdo
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (files) => {
      setUploading(true);
      
      for (const file of files) {
        try {
          // Converter arquivo para base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Remove o prefixo data:
            };
            reader.readAsDataURL(file);
          });

          // Verificar conteúdo se for imagem
          let aprovado = true;
          if (file.type.startsWith('image/')) {
            try {
              const response = await supabase.functions.invoke('content-analysis', {
                body: {
                  imageData: base64,
                  analysisType: 'nsfw'
                }
              });

              if (response.data?.result === 'REJEITADO') {
                toast({
                  title: "Arquivo rejeitado",
                  description: "A imagem não passou na verificação de conteúdo adequado.",
                  variant: "destructive"
                });
                continue;
              }
              aprovado = response.data?.result === 'APROVADO';
            } catch (error) {
              console.error('Erro na análise de conteúdo:', error);
              toast({
                title: "Erro na verificação",
                description: "Não foi possível verificar o conteúdo. Arquivo carregado sem verificação.",
                variant: "destructive"
              });
            }
          }

          // Upload para Supabase Storage
          const filename = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('notes-files')
            .upload(filename, file);

          if (uploadError) throw uploadError;

          // Obter URL público
          const { data: urlData } = supabase.storage
            .from('notes-files')
            .getPublicUrl(filename);

          // Extrair texto se for PDF ou imagem
          let textoExtraido = '';
          if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            try {
              const extractResponse = await supabase.functions.invoke('content-analysis', {
                body: {
                  imageData: base64,
                  analysisType: 'text-extraction'
                }
              });
              
              if (extractResponse.data?.result !== 'NENHUM_TEXTO_ENCONTRADO') {
                textoExtraido = extractResponse.data?.result || '';
              }
            } catch (error) {
              console.error('Erro na extração de texto:', error);
            }
          }

          const novoArquivo: AnotacaoArquivo = {
            id: Date.now().toString(),
            tipo: file.type.startsWith('image/') ? 'image' : 'pdf',
            url: urlData.publicUrl,
            nome: file.name,
            textoExtraido,
            aprovado
          };

          // Adicionar à anotação atual ou criar nova
          if (editandoId) {
            const anotacaoAtual = anotacoes.find(a => a.id === editandoId);
            if (anotacaoAtual) {
              const arquivosAtualizados = [...(anotacaoAtual.arquivos || []), novoArquivo];
              editarAnotacao(editandoId, { arquivos: arquivosAtualizados });
            }
          } else {
            setNovaAnotacao(prev => ({
              ...prev,
              conteudo: prev.conteudo + (textoExtraido ? `\n\n[Texto extraído de ${file.name}]:\n${textoExtraido}` : '')
            }));
          }

          toast({
            title: "Arquivo carregado!",
            description: `${file.name} foi carregado com sucesso.${textoExtraido ? ' Texto extraído automaticamente.' : ''}`,
          });

        } catch (error) {
          console.error('Erro no upload:', error);
          toast({
            title: "Erro no upload",
            description: `Não foi possível carregar ${file.name}.`,
            variant: "destructive"
          });
        }
      }
      
      setUploading(false);
    }
  });

  // Gerar conteúdo com IA
  const gerarComIA = async (tipo: 'summary' | 'expand' | 'questions' | 'outline' | 'flashcards') => {
    if (!novaAnotacao.conteudo.trim() && !editandoId) {
      toast({
        title: "Conteúdo necessário",
        description: "Adicione algum conteúdo para gerar com IA.",
        variant: "destructive"
      });
      return;
    }

    setAiGenerating(true);

    try {
      const content = editandoId 
        ? anotacoes.find(a => a.id === editandoId)?.conteudo || ''
        : novaAnotacao.conteudo;

      const response = await supabase.functions.invoke('ai-note-generator', {
        body: {
          content,
          generationType: tipo,
          context: 'Direito Brasileiro - Estudos Jurídicos'
        }
      });

      if (response.error) throw response.error;

      const resultado = response.data?.result || '';

      if (editandoId) {
        const anotacaoAtual = anotacoes.find(a => a.id === editandoId);
        if (anotacaoAtual) {
          editarAnotacao(editandoId, {
            conteudo: anotacaoAtual.conteudo + '\n\n---\n' + resultado
          });
        }
      } else {
        setNovaAnotacao(prev => ({
          ...prev,
          conteudo: prev.conteudo + '\n\n---\n' + resultado
        }));
      }

      toast({
        title: "Conteúdo gerado!",
        description: "O conteúdo foi gerado com IA e adicionado à sua anotação.",
      });

    } catch (error) {
      console.error('Erro na geração de IA:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o conteúdo com IA.",
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // Funções de formatação
  const aplicarFormatacao = (tipo: 'bold' | 'italic' | 'underline' | 'highlight') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) {
      toast({
        title: "Selecione o texto",
        description: "Selecione o texto que deseja formatar.",
        variant: "destructive"
      });
      return;
    }

    let formattedText = '';
    let marcacao: AnotacaoMarcacao | null = null;

    switch (tipo) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        marcacao = {
          inicio: start,
          fim: end,
          cor: '#fef08a',
          tipo: 'destaque'
        };
        break;
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    if (editandoId) {
      const anotacaoAtual = anotacoes.find(a => a.id === editandoId);
      if (anotacaoAtual) {
        const novasMarcacoes = marcacao 
          ? [...(anotacaoAtual.marcacoes || []), marcacao]
          : anotacaoAtual.marcacoes;
        editarAnotacao(editandoId, { 
          conteudo: newContent,
          marcacoes: novasMarcacoes
        });
      }
    } else {
      setNovaAnotacao(prev => ({ ...prev, conteudo: newContent }));
    }
  };

  const criarAnotacao = () => {
    if (!novaAnotacao.titulo.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Digite um título para sua anotação.",
        variant: "destructive"
      });
      return;
    }

    const anotacao: Anotacao = {
      id: Date.now().toString(),
      titulo: novaAnotacao.titulo,
      conteudo: novaAnotacao.conteudo,
      categoria: novaAnotacao.categoria,
      tags: novaAnotacao.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dataModificacao: new Date(),
      favorito: novaAnotacao.favorito,
      privacidade: novaAnotacao.privacidade,
      arquivos: [],
      marcacoes: []
    };

    const novasAnotacoes = [anotacao, ...anotacoes];
    salvarAnotacoes(novasAnotacoes);
    
    setNovaAnotacao({ 
      titulo: '', 
      conteudo: '', 
      categoria: 'Geral', 
      tags: '',
      privacidade: 'privado',
      favorito: false
    });
    setMostrarFormulario(false);

    toast({
      title: "Anotação criada!",
      description: "Sua anotação foi salva com sucesso.",
    });
  };

  const editarAnotacao = (id: string, dadosAtualizados: Partial<Anotacao>) => {
    const novasAnotacoes = anotacoes.map(anotacao => 
      anotacao.id === id 
        ? { ...anotacao, ...dadosAtualizados, dataModificacao: new Date() }
        : anotacao
    );
    salvarAnotacoes(novasAnotacoes);
  };

  const excluirAnotacao = (id: string) => {
    const novasAnotacoes = anotacoes.filter(anotacao => anotacao.id !== id);
    salvarAnotacoes(novasAnotacoes);
    
    toast({
      title: "Anotação excluída",
      description: "A anotação foi removida permanentemente.",
    });
  };

  const toggleFavorito = (id: string) => {
    editarAnotacao(id, { 
      favorito: !anotacoes.find(a => a.id === id)?.favorito 
    });
  };

  // Filtrar anotações
  const anotacoesFiltradas = anotacoes.filter(anotacao => {
    const textoMatch = !filtroTexto || 
      anotacao.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      anotacao.conteudo.toLowerCase().includes(filtroTexto.toLowerCase());
    
    const categoriaMatch = !filtroCategoria || anotacao.categoria === filtroCategoria;
    const tagMatch = !filtroTag || 
      anotacao.tags.some(tag => tag.toLowerCase().includes(filtroTag.toLowerCase()));

    let abaMatch = true;
    switch (abaSelecionada) {
      case 'favoritos':
        abaMatch = anotacao.favorito === true;
        break;
      case 'recentes':
        abaMatch = anotacao.dataModificacao > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'publicas':
        abaMatch = anotacao.privacidade === 'publico';
        break;
      default:
        abaMatch = true;
    }

    return textoMatch && categoriaMatch && tagMatch && abaMatch;
  });

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const obterCorCategoria = (categoria: string) => {
    const cat = categoriasPadrao.find(c => c.nome === categoria);
    return cat ? cat.cor : 'bg-gray-500';
  };

  const todasAsTags = [...new Set(anotacoes.flatMap(a => a.tags))];

  // Render em tela inteira
  if (telaInteira) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Header em tela inteira */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setTelaInteira(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Minhas Anotações</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                size="sm"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Editar' : 'Visualizar'}
              </Button>
              <Button onClick={() => setMostrarFormulario(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Anotação
              </Button>
            </div>
          </div>

          {/* Conteúdo em tela inteira */}
          <div className="flex-1 flex">
            {/* Sidebar com lista de anotações */}
            <div className="w-80 border-r bg-card/50">
              <div className="p-4 space-y-4">
                {/* Barra de busca */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Buscar anotações..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tabs */}
                <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                    <TabsTrigger value="favoritos">
                      <Star className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="recentes">
                      <Clock className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="publicas">
                      <FolderOpen className="h-3 w-3" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Lista de anotações */}
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {anotacoesFiltradas.map((anotacao) => (
                    <Card 
                      key={anotacao.id} 
                      className={`cursor-pointer transition-colors hover:bg-accent ${editandoId === anotacao.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setEditandoId(anotacao.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{anotacao.titulo}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorito(anotacao.id);
                            }}
                          >
                            <Star className={`h-3 w-3 ${anotacao.favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {anotacao.conteudo || 'Sem conteúdo...'}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${obterCorCategoria(anotacao.categoria)} text-white text-xs`}>
                            {anotacao.categoria}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatarData(anotacao.dataModificacao)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Área de edição/visualização */}
            <div className="flex-1 flex flex-col">
              {editandoId ? (
                <AnotacaoEditor
                  anotacao={anotacoes.find(a => a.id === editandoId)!}
                  onSave={(dados) => editarAnotacao(editandoId, dados)}
                  onClose={() => setEditandoId(null)}
                  showPreview={showPreview}
                  onDelete={() => {
                    excluirAnotacao(editandoId);
                    setEditandoId(null);
                  }}
                  onExportPDF={() => {
                    const anotacao = anotacoes.find(a => a.id === editandoId)!;
                    const dataExport = {
                      titulo: anotacao.titulo,
                      tipo: "Anotação",
                      sections: [
                        {
                          titulo: "Categoria",
                          conteudo: anotacao.categoria,
                          destaque: true
                        },
                        {
                          titulo: "Tags",
                          conteudo: anotacao.tags.length > 0 ? anotacao.tags.join(', ') : 'Nenhuma tag',
                        },
                        {
                          titulo: "Conteúdo",
                          conteudo: anotacao.conteudo || 'Sem conteúdo',
                        },
                        ...(anotacao.arquivos && anotacao.arquivos.length > 0 ? [{
                          titulo: "Arquivos Anexados",
                          conteudo: anotacao.arquivos.map((arquivo: AnotacaoArquivo) => `• ${arquivo.nome} (${arquivo.tipo})`).join('\n'),
                        }] : [])
                      ],
                      metadata: {
                        'Data de Modificação': formatarData(anotacao.dataModificacao),
                        'Privacidade': anotacao.privacidade === 'publico' ? 'Público' : 'Privado',
                        'Favorito': anotacao.favorito ? 'Sim' : 'Não'
                      }
                    };
                    exportarPDF(dataExport);
                  }}
                  gerarComIA={gerarComIA}
                  aiGenerating={aiGenerating}
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                  uploading={uploading}
                  aplicarFormatacao={aplicarFormatacao}
                  textareaRef={textareaRef}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Selecione uma anotação</h3>
                    <p className="text-muted-foreground">
                      Escolha uma anotação da lista para visualizar ou editar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog para nova anotação */}
        <FormularioNovaAnotacao
          mostrar={mostrarFormulario}
          onClose={() => setMostrarFormulario(false)}
          novaAnotacao={novaAnotacao}
          setNovaAnotacao={setNovaAnotacao}
          onSave={criarAnotacao}
          categoriasPadrao={categoriasPadrao}
          gerarComIA={gerarComIA}
          aiGenerating={aiGenerating}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          uploading={uploading}
          aplicarFormatacao={aplicarFormatacao}
          textareaRef={textareaRef}
        />
      </div>
    );
  }

  // Render normal (não tela inteira)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFunction(null)}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">Minhas Anotações</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Organize suas ideias e conhecimentos jurídicos
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={() => setTelaInteira(true)}
              className="flex-1 sm:flex-none"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tela Inteira</span>
              <span className="sm:hidden">Expandir</span>
            </Button>
            <Button onClick={() => setMostrarFormulario(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nova Anotação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>

        {/* Filtros e tabs */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="mb-4">
              <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
                <TabsTrigger value="todas" className="text-xs sm:text-sm">Todas</TabsTrigger>
                <TabsTrigger value="favoritos" className="text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Favoritos</span>
                </TabsTrigger>
                <TabsTrigger value="recentes" className="text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Recentes</span>
                </TabsTrigger>
                <TabsTrigger value="publicas" className="text-xs sm:text-sm">
                  <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Públicas</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={filtroCategoria || "todas"} onValueChange={(value) => setFiltroCategoria(value === "todas" ? "" : value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categoriasPadrao.map(categoria => (
                      <SelectItem key={categoria.nome} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Tag className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por tag..."
                    value={filtroTag}
                    onChange={(e) => setFiltroTag(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Anotações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {anotacoesFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma anotação encontrada</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              {anotacoes.length === 0 
                ? 'Crie sua primeira anotação clicando no botão acima.'
                : 'Tente ajustar os filtros para encontrar suas anotações.'
              }
            </p>
          </div>
        ) : (
          anotacoesFiltradas.map((anotacao) => (
            <AnotacaoCard
              key={anotacao.id}
              anotacao={anotacao}
              onEdit={() => {
                setEditandoId(anotacao.id);
                setTelaInteira(true);
              }}
              onDelete={() => excluirAnotacao(anotacao.id)}
              onToggleFavorito={() => toggleFavorito(anotacao.id)}
              onExportPDF={() => {
                const dataExport = {
                  titulo: anotacao.titulo,
                  tipo: "Anotação",
                  sections: [
                    {
                      titulo: "Categoria",
                      conteudo: anotacao.categoria,
                      destaque: true
                    },
                    {
                      titulo: "Tags",
                      conteudo: anotacao.tags.length > 0 ? anotacao.tags.join(', ') : 'Nenhuma tag',
                    },
                    {
                      titulo: "Conteúdo",
                      conteudo: anotacao.conteudo || 'Sem conteúdo',
                    },
                    ...(anotacao.arquivos && anotacao.arquivos.length > 0 ? [{
                      titulo: "Arquivos Anexados",
                      conteudo: anotacao.arquivos.map((arquivo: AnotacaoArquivo) => `• ${arquivo.nome} (${arquivo.tipo})`).join('\n'),
                    }] : [])
                  ],
                  metadata: {
                    'Data de Modificação': formatarData(anotacao.dataModificacao),
                    'Privacidade': anotacao.privacidade === 'publico' ? 'Público' : 'Privado',
                    'Favorito': anotacao.favorito ? 'Sim' : 'Não'
                  }
                };
                exportarPDF(dataExport);
              }}
              obterCorCategoria={obterCorCategoria}
              formatarData={formatarData}
            />
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card className="mt-6 sm:mt-8">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-primary">{anotacoes.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-500">
                {anotacoes.filter(a => a.favorito).length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Favoritos</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-green-500">{todasAsTags.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Tags</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-blue-500">
                {new Set(anotacoes.map(a => a.categoria)).size}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Categorias</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-lg sm:text-2xl font-bold text-purple-500">
                {anotacoes.filter(a => a.dataModificacao > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Esta Semana</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para nova anotação */}
      <FormularioNovaAnotacao
        mostrar={mostrarFormulario}
        onClose={() => setMostrarFormulario(false)}
        novaAnotacao={novaAnotacao}
        setNovaAnotacao={setNovaAnotacao}
        onSave={criarAnotacao}
        categoriasPadrao={categoriasPadrao}
        gerarComIA={gerarComIA}
        aiGenerating={aiGenerating}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        uploading={uploading}
        aplicarFormatacao={aplicarFormatacao}
        textareaRef={textareaRef}
      />
      </div>
    </div>
  );
};

// Componentes auxiliares
const AnotacaoCard = ({ anotacao, onEdit, onDelete, onToggleFavorito, obterCorCategoria, formatarData, onExportPDF }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2 sm:pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 break-words">{anotacao.titulo}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {anotacao.favorito && <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />}
              {anotacao.privacidade === 'publico' && <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <Badge className={`${obterCorCategoria(anotacao.categoria)} text-white text-xs w-fit`}>
              {anotacao.categoria}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatarData(anotacao.dataModificacao)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorito()}
            className="h-8 w-8 p-0"
            title="Favoritar"
          >
            <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${anotacao.favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExportPDF()}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Exportar PDF"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit()}
            className="h-8 w-8 p-0"
            title="Editar"
          >
            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete()}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="pt-0">
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 break-words">
        {anotacao.conteudo || 'Sem conteúdo...'}
      </p>
      
      {anotacao.arquivos && anotacao.arquivos.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {anotacao.arquivos.slice(0, 2).map((arquivo: AnotacaoArquivo) => (
            <Badge key={arquivo.id} variant="outline" className="text-xs">
              {arquivo.tipo === 'image' ? <FileImage className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              <span className="truncate max-w-20">{arquivo.nome}</span>
            </Badge>
          ))}
          {anotacao.arquivos.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{anotacao.arquivos.length - 2}
            </Badge>
          )}
        </div>
      )}
      
      {anotacao.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {anotacao.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {anotacao.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{anotacao.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

const AnotacaoEditor = ({ anotacao, onSave, onClose, showPreview, onDelete, gerarComIA, aiGenerating, getRootProps, getInputProps, isDragActive, uploading, aplicarFormatacao, textareaRef, onExportPDF }: any) => {
  const [titulo, setTitulo] = useState(anotacao.titulo);
  const [conteudo, setConteudo] = useState(anotacao.conteudo);
  const [categoria, setCategoria] = useState(anotacao.categoria);
  const [tags, setTags] = useState(anotacao.tags.join(', '));
  const [privacidade, setPrivacidade] = useState(anotacao.privacidade || 'privado');

  const salvar = () => {
    onSave({
      titulo,
      conteudo,
      categoria,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      privacidade
    });
    
    toast({
      title: "Anotação salva!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Editando Anotação</h2>
          <div className="flex items-center gap-2">
            <Button onClick={salvar} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button 
              onClick={onExportPDF} 
              size="sm" 
              variant="outline"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="destructive" onClick={onDelete} size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!showPreview && (
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFormatacao('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFormatacao('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFormatacao('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFormatacao('highlight')}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <div {...getRootProps()} className="inline-block">
              <input {...getInputProps()} />
              <Button variant="outline" size="sm" disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => gerarComIA('summary')}
              disabled={aiGenerating}
            >
              {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Resumir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => gerarComIA('expand')}
              disabled={aiGenerating}
            >
              Expandir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => gerarComIA('questions')}
              disabled={aiGenerating}
            >
              Questões
            </Button>
          </div>
        )}

        {/* Meta campos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoriasPadrao.map(cat => (
                <SelectItem key={cat.nome} value={cat.nome}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Tags (separadas por vírgula)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <Select value={privacidade} onValueChange={setPrivacidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="privado">Privado</SelectItem>
              <SelectItem value="publico">Público</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 p-4">
        {showPreview ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{conteudo}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva sua anotação aqui..."
            className="min-h-[500px] resize-none"
          />
        )}

        {isDragActive && (
          <div className="fixed inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center z-50">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-lg font-semibold">Solte os arquivos aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormularioNovaAnotacao = ({ mostrar, onClose, novaAnotacao, setNovaAnotacao, onSave, categoriasPadrao, gerarComIA, aiGenerating, getRootProps, getInputProps, isDragActive, uploading, aplicarFormatacao, textareaRef }: any) => (
  <Dialog open={mostrar} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova Anotação</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => aplicarFormatacao('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => aplicarFormatacao('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <div {...getRootProps()} className="inline-block">
            <input {...getInputProps()} />
            <Button variant="outline" size="sm" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => gerarComIA('summary')}
            disabled={aiGenerating}
          >
            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            IA
          </Button>
        </div>

        <Input
          placeholder="Título da anotação..."
          value={novaAnotacao.titulo}
          onChange={(e) => setNovaAnotacao({...novaAnotacao, titulo: e.target.value})}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select 
            value={novaAnotacao.categoria} 
            onValueChange={(value) => setNovaAnotacao({...novaAnotacao, categoria: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoriasPadrao.map(categoria => (
                <SelectItem key={categoria.nome} value={categoria.nome}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Tags (separadas por vírgula)..."
            value={novaAnotacao.tags}
            onChange={(e) => setNovaAnotacao({...novaAnotacao, tags: e.target.value})}
          />

          <Select 
            value={novaAnotacao.privacidade} 
            onValueChange={(value) => setNovaAnotacao({...novaAnotacao, privacidade: value as 'privado' | 'publico'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="privado">Privado</SelectItem>
              <SelectItem value="publico">Público</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Conteúdo da anotação..."
          value={novaAnotacao.conteudo}
          onChange={(e) => setNovaAnotacao({...novaAnotacao, conteudo: e.target.value})}
          className="min-h-[300px]"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favorito"
            checked={novaAnotacao.favorito}
            onChange={(e) => setNovaAnotacao({...novaAnotacao, favorito: e.target.checked})}
          />
          <label htmlFor="favorito" className="text-sm">Marcar como favorito</label>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>

      {isDragActive && (
        <div className="fixed inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center z-50">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-lg font-semibold">Solte os arquivos aqui</p>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// Adicionar ReactMarkdown se não existir
const ReactMarkdown = ({ children }: { children: string }) => (
  <div className="whitespace-pre-wrap">{children}</div>
);