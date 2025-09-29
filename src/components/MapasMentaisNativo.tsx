import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Node, Edge, Background, Controls, MiniMap, useReactFlow, ReactFlowProvider, ConnectionMode, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, FileText, Upload, Download, Loader2, BrainCircuit, Sparkles, FileImage, Type, BookOpen, Scale, Gavel, Landmark } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import heroImage from '@/assets/mapas-mentais-hero.png';
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};
interface MindMapNode extends Node {
  data: {
    label: string;
    content?: string;
    level?: number;
  };
}
interface MindMapData {
  title: string;
  nodes: MindMapNode[];
  edges: Edge[];
}
export const MapasMentaisNativo = () => {
  const {
    toast
  } = useToast();
  const {
    isMobile
  } = useDeviceDetection();
  const [currentPage, setCurrentPage] = useState<'home' | 'areas' | 'temas' | 'subtemas' | 'custom' | 'viewer'>('home');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedTema, setSelectedTema] = useState<string>('');
  const [selectedSubtema, setSelectedSubtema] = useState<string>('');
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [temas, setTemas] = useState<string[]>([]);
  const [subtemas, setSubtemas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customText, setCustomText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Load data from Supabase
  useEffect(() => {
    loadAreas();
  }, []);
  useEffect(() => {
    if (selectedArea) {
      loadTemas(selectedArea);
    } else {
      setTemas([]);
      setSelectedTema('');
    }
  }, [selectedArea]);
  useEffect(() => {
    if (selectedArea && selectedTema) {
      loadSubtemas(selectedArea, selectedTema);
    } else {
      setSubtemas([]);
      setSelectedSubtema('');
    }
  }, [selectedArea, selectedTema]);
  const loadAreas = async () => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('get_mapas_mentais_areas');
      if (error) {
        console.error('Error loading areas:', error);
        // Fallback to direct query
        const {
          data: fallbackData,
          error: fallbackError
        } = await supabase.from('MAPAS MENTAIS').select('Área').not('Área', 'is', null);
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setAreas(['Direito Administrativo', 'Direito Civil', 'Direito Constitucional', 'Direito Penal']);
        } else {
          const uniqueAreas = Array.from(new Set(fallbackData?.map(item => item['Área']) || []));
          setAreas(uniqueAreas.filter(Boolean));
        }
      } else {
        // Extract areas from RPC response
        const areasArray = Array.isArray(data) ? data.map((item: any) => item.area || item.Área).filter(Boolean) : [];
        setAreas(areasArray);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      setAreas(['Direito Administrativo', 'Direito Civil', 'Direito Constitucional', 'Direito Penal']);
    }
  };
  const loadTemas = async (area: string) => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('get_mapas_mentais_temas', {
        area_param: area
      });
      if (error) {
        console.error('Error loading temas:', error);
        // Fallback to direct query
        const {
          data: fallbackData,
          error: fallbackError
        } = await supabase.from('MAPAS MENTAIS').select('Tema').eq('Área', area).not('Tema', 'is', null);
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setTemas([]);
        } else {
          const uniqueTemas = Array.from(new Set(fallbackData?.map(item => item['Tema']) || []));
          setTemas(uniqueTemas.filter(Boolean));
          // Auto-select first tema
          const first = uniqueTemas.find(Boolean);
          setSelectedTema(first || '');
        }
      } else {
        // Extract temas from RPC response
        const temasArray = Array.isArray(data) ? data.map((item: any) => item.tema || item.Tema).filter(Boolean) : [];
        setTemas(temasArray);
        // Auto-select first tema
        const first = temasArray[0];
        setSelectedTema(first || '');
      }
    } catch (error) {
      console.error('Error loading temas:', error);
      setTemas([]);
    }
  };
  const loadSubtemas = async (area: string, tema: string) => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('get_mapas_mentais_subtemas', {
        area_param: area,
        tema_param: tema
      });
      if (error) {
        console.error('Error loading subtemas:', error);
        // Fallback to direct query
        const {
          data: fallbackData,
          error: fallbackError
        } = await supabase.from('MAPAS MENTAIS').select('Subtema').eq('Área', area).eq('Tema', tema).not('Subtema', 'is', null);
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setSubtemas([]);
        } else {
          const uniqueSubtemas = Array.from(new Set(fallbackData?.map(item => item['Subtema']) || []));
          setSubtemas(uniqueSubtemas.filter(Boolean));
        }
      } else {
        // Extract subtemas from RPC response
        const subtemasArray = Array.isArray(data) ? data.map((item: any) => item.subtema || item.Subtema).filter(Boolean) : [];
        setSubtemas(subtemasArray);
      }
    } catch (error) {
      console.error('Error loading subtemas:', error);
      setSubtemas([]);
    }
  };
  const generateMindMap = async (content: string, type: 'subtema' | 'custom') => {
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-mind-map', {
        body: {
          content,
          type
        }
      });
      if (error) {
        throw error;
      }
      const mindMap = (data as any)?.mindMap ?? data;
      if (!mindMap?.nodes || !mindMap?.edges) {
        throw new Error('Resposta inválida do gerador de mapas');
      }
      setMindMapData(mindMap as MindMapData);
      setCurrentPage('viewer');
      toast({
        title: "Mapa Mental Gerado!",
        description: "Seu mapa mental foi criado com sucesso."
      });
    } catch (error: any) {
      console.error('Error generating mind map:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar o mapa mental. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSubtemaSelect = async (subtema: string) => {
    setSelectedSubtema(subtema);
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.from('MAPAS MENTAIS').select('Conteúdo').eq('Área', selectedArea).eq('Tema', selectedTema).eq('Subtema', subtema).maybeSingle();
      if (error) {
        console.error('Error loading content:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar o conteúdo do subtema.",
          variant: "destructive"
        });
        return;
      }
      if (data?.['Conteúdo']) {
        await generateMindMap(data['Conteúdo'], 'subtema');
      } else {
        toast({
          title: "Aviso",
          description: "Conteúdo não encontrado para este subtema.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar o subtema selecionado.",
        variant: "destructive"
      });
    }
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
    if (uploadedFile) {
      try {
        if (uploadedFile.type === 'application/pdf') {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          const {
            data,
            error
          } = await supabase.functions.invoke('extract-text', {
            body: formData
          });
          if (error) throw error;
          content = data.text || customText;
        } else if (uploadedFile.type.startsWith('image/')) {
          // Para imagens, usar o texto customizado como base
          content = customText || 'Analise esta imagem e crie um mapa mental com os conceitos principais.';
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Erro",
          description: "Falha ao processar o arquivo. Usando texto inserido.",
          variant: "destructive"
        });
      }
    }
    await generateMindMap(content, 'custom');
  };
  const exportToPDF = async () => {
    const element = document.getElementById('mind-map-container');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a', // Dark background
        scale: 3, // High resolution for crisp PDF
        useCORS: true,
        logging: false,
        removeContainer: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF with pixel-perfect size to avoid blur
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      pdf.save(`mapa-mental-${Date.now()}.pdf`);
      toast({
        title: 'PDF Exportado!',
        description: 'Seu mapa mental foi salvo como PDF nítido.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao exportar PDF.',
        variant: 'destructive',
      });
    }
  };
  const resetToHome = () => {
    // Voltar ao início do aplicativo
    try {
      window.location.href = '/';
    } catch {
      setCurrentPage('home');
    }
    setMindMapData(null);
    setSelectedArea('');
    setSelectedTema('');
    setSelectedSubtema('');
    setCustomText('');
    setUploadedFile(null);
  };
  const goBack = () => {
    if (currentPage === 'areas') setCurrentPage('home');else if (currentPage === 'temas') setCurrentPage('areas');else if (currentPage === 'subtemas') setCurrentPage('temas');else if (currentPage === 'custom') setCurrentPage('home');else if (currentPage === 'viewer') {
      if (selectedArea) setCurrentPage('subtemas');else setCurrentPage('custom');
    }
  };
  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setCurrentPage('temas');
  };
  const handleTemaSelect = (tema: string) => {
    setSelectedTema(tema);
    setCurrentPage('subtemas');
  };

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onSelectStructured={() => {
          loadAreas();
          setCurrentPage('areas');
        }} onSelectCustom={() => setCurrentPage('custom')} />;
      case 'areas':
        return <AreasPage areas={areas} onSelectArea={handleAreaSelect} onBack={goBack} />;
      case 'temas':
        return <TemasPage area={selectedArea} temas={temas} onSelectTema={handleTemaSelect} onBack={goBack} />;
      case 'subtemas':
        return <SubtemasPage area={selectedArea} tema={selectedTema} subtemas={subtemas} onSelectSubtema={handleSubtemaSelect} onBack={goBack} isGenerating={isGenerating} />;
      case 'custom':
        return <CustomPage customText={customText} setCustomText={setCustomText} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} onGenerate={handleCustomGeneration} onBack={goBack} isGenerating={isGenerating} />;
      case 'viewer':
        return mindMapData ? <ReactFlowProvider>
            <ViewerPage mindMapData={mindMapData} onBack={goBack} onExportPDF={exportToPDF} onHome={resetToHome} />
          </ReactFlowProvider> : null;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background text-foreground">
      {renderPage()}
    </div>;
};

// Home Page Component
const HomePage = ({
  onSelectStructured,
  onSelectCustom
}: {
  onSelectStructured: () => void;
  onSelectCustom: () => void;
}) => {
  return <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--red-elegant))] to-[hsl(var(--red-elegant-light))] flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mapas Mentais</h1>
            <p className="text-sm text-muted-foreground">
              Visualize conceitos jurídicos de forma clara
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6 text-center">
        
        <h2 className="text-lg font-bold mb-2 text-foreground">
          Crie Mapas Mentais Interativos
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Transforme informações em visualizações claras
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Mapas Estruturados */}
          <Card className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card" onClick={onSelectStructured}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Mapas Estruturados</h3>
                  <p className="text-xs text-muted-foreground">
                    Base de conhecimento jurídico
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </div>
            </CardContent>
          </Card>

          {/* Mapas Personalizados */}
          <Card className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card" onClick={onSelectCustom}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tools-primary to-tools-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Mapas Personalizados</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie a partir de seus conteúdos
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>;
};

// Areas Page Component
const AreasPage = ({
  areas,
  onSelectArea,
  onBack
}: {
  areas: string[];
  onSelectArea: (area: string) => void;
  onBack: () => void;
}) => {
  return <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Selecione a Área</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-md mx-auto space-y-2">
          {areas.map(area => <Button key={area} variant="outline" className="w-full h-auto p-4 justify-between text-left bg-background hover:bg-muted border-border text-foreground" onClick={() => onSelectArea(area)}>
              <span className="font-medium">{area}</span>
              <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
            </Button>)}
        </div>
      </div>
    </>;
};

// Temas Page Component
const TemasPage = ({
  area,
  temas,
  onSelectTema,
  onBack
}: {
  area: string;
  temas: string[];
  onSelectTema: (tema: string) => void;
  onBack: () => void;
}) => {
  return <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Temas</h1>
              <p className="text-xs text-muted-foreground">{area}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-3xl mx-auto grid gap-2 sm:grid-cols-2">
          {temas.length > 0 ? temas.map(tema => (
            <Button
              key={tema}
              variant="outline"
              className="w-full h-auto p-4 justify-between text-left bg-background hover:bg-muted border-border text-foreground"
              onClick={() => onSelectTema(tema)}
            >
              <span className="font-medium line-clamp-2 pr-2">{tema}</span>
              <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 shrink-0" />
            </Button>
          )) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando temas...
            </div>
          )}
        </div>
      </div>
    </>;
};

// Subtemas Page Component
const SubtemasPage = ({
  area,
  tema,
  subtemas,
  onSelectSubtema,
  onBack,
  isGenerating
}: {
  area: string;
  tema: string;
  subtemas: string[];
  onSelectSubtema: (subtema: string) => void;
  onBack: () => void;
  isGenerating: boolean;
}) => {
  return <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Subtemas</h1>
              <p className="text-xs text-muted-foreground">{area} • {tema}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-4xl mx-auto grid gap-2 sm:grid-cols-2">
          {subtemas.length > 0 ? subtemas.map(subtema => (
            <Button
              key={subtema}
              variant="outline"
              className="w-full h-auto p-4 justify-between text-left bg-background hover:bg-muted border-border text-foreground disabled:opacity-50"
              onClick={() => onSelectSubtema(subtema)}
              disabled={isGenerating}
            >
              <span className="font-medium line-clamp-2 pr-2">{subtema}</span>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </Button>
          )) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando subtemas...
            </div>
          )}
        </div>
      </div>
    </>;
};

// Custom Page Component
const CustomPage = ({
  customText,
  setCustomText,
  uploadedFile,
  setUploadedFile,
  onGenerate,
  onBack,
  isGenerating
}: {
  customText: string;
  setCustomText: (text: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}) => {
  return <>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tools-primary to-tools-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Mapa Personalizado</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* File Upload */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-2">
                  PDF ou imagem (opcional)
                </p>
                <Input type="file" accept=".pdf,image/*" onChange={e => setUploadedFile(e.target.files?.[0] || null)} className="text-xs bg-background border-border" />
                {uploadedFile && <div className="mt-2 text-xs text-foreground">
                    {uploadedFile.name}
                  </div>}
              </div>
            </CardContent>
          </Card>

          {/* Text Input */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <Textarea placeholder="Digite o texto ou tópico que deseja transformar em mapa mental..." value={customText} onChange={e => setCustomText(e.target.value)} rows={4} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button onClick={onGenerate} disabled={isGenerating || !customText.trim() && !uploadedFile} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isGenerating ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </> : <>
                <BrainCircuit className="w-4 h-4 mr-2" />
                Gerar Mapa Mental
              </>}
          </Button>
        </div>
      </div>
    </>;
};

// Helper: icon picker for mind map nodes
const getIconForLabel = (label: string) => {
  const l = (label || '').toLowerCase();
  if (l.includes('penal') || l.includes('crime')) return <Gavel className="w-4 h-4" />;
  if (l.includes('civil')) return <Scale className="w-4 h-4" />;
  if (l.includes('constitucional')) return <Landmark className="w-4 h-4" />;
  return <BookOpen className="w-4 h-4" />;
};

const MindMapNodeComponent = ({ data }: NodeProps<any>) => {
  return (
    <div className="rounded-xl border border-border bg-card text-foreground px-3 py-2 shadow-sm max-w-[260px]">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent text-background flex items-center justify-center shrink-0">
          {getIconForLabel(data?.label)}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm leading-tight line-clamp-2">{data?.label}</div>
          {data?.content && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{data.content}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Viewer Page Component
const ViewerPage = ({
  mindMapData,
  onBack,
  onExportPDF,
  onHome
}: {
  mindMapData: MindMapData;
  onBack: () => void;
  onExportPDF: () => void;
  onHome: () => void;
}) => {
  const reactFlowInstance = useReactFlow();
  const {
    isMobile
  } = useDeviceDetection();
  useEffect(() => {
    if (mindMapData && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.1
        });
      }, 100);
    }
  }, [mindMapData, reactFlowInstance]);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-background" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">{mindMapData.title}</h1>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onHome} variant="outline" size="sm" className="border-border hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isMobile ? 'Início' : 'Voltar ao Início'}
            </Button>
            <Button onClick={onExportPDF} variant="outline" size="sm" className="border-border hover:bg-muted">
              <Download className="w-4 h-4 mr-2" />
              {isMobile ? 'PDF' : 'Exportar PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Mind Map */}
      <div id="mind-map-container" className="h-[calc(100vh-73px)] bg-background">
        <ReactFlow
          nodes={mindMapData.nodes}
          edges={mindMapData.edges}
          nodeTypes={{ mindmap: MindMapNodeComponent }}
          connectionMode={ConnectionMode.Loose}
          fitView
          style={{ backgroundColor: 'hsl(var(--background))' }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="hsl(var(--muted-foreground))"
            gap={20}
            style={{ backgroundColor: 'hsl(var(--background))', opacity: 0.1 }}
          />
          <Controls
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <MiniMap
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            maskColor="hsl(var(--background) / 0.8)"
            nodeColor="hsl(var(--primary))"
          />
        </ReactFlow>
      </div>
    </div>;
};