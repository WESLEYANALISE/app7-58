import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, IText, Line, FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// ColorPicker será definido inline
import { 
  Palette, 
  Type, 
  Circle as CircleIcon, 
  Square, 
  Minus, 
  Move, 
  Download, 
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGenericPDFExport, PDFExportData } from '@/hooks/useGenericPDFExport';

interface MindMapNode {
  id: string;
  label: string;
  content?: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  shape: 'circle' | 'rectangle';
}

interface MindMapConnection {
  from: string;
  to: string;
  color: string;
}

interface FabricMindMapCanvasProps {
  initialData?: {
    title: string;
    nodes: MindMapNode[];
    connections: MindMapConnection[];
  };
  onExport?: (canvasData: string) => void;
}

export const FabricMindMapCanvas = ({ initialData, onExport }: FabricMindMapCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#3B82F6');
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'circle' | 'rectangle' | 'line'>('select');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  const { exportarPDF, exporting } = useGenericPDFExport();

  // Salvar estado do canvas no histórico
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvasData = JSON.stringify(fabricCanvasRef.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvasData);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Inicializar canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;
    
    // Salvar estado inicial
    saveToHistory();

    // Event listeners
    canvas.on('object:added', saveToHistory);
    canvas.on('object:removed', saveToHistory);
    canvas.on('object:modified', saveToHistory);

    // Carregar dados iniciais se fornecidos
    if (initialData) {
      loadInitialData(canvas, initialData);
    }

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Carregar dados iniciais do IA
  const loadInitialData = (canvas: FabricCanvas, data: typeof initialData) => {
    if (!data) return;

    // Limpar canvas
    canvas.clear();

    // Adicionar nós
    data.nodes.forEach((node) => {
      let shape: FabricObject;

      if (node.shape === 'circle') {
        shape = new Circle({
          left: node.x,
          top: node.y,
          fill: node.color,
          radius: 30,
          stroke: '#333',
          strokeWidth: 2,
        });
      } else {
        shape = new Rect({
          left: node.x,
          top: node.y,
          fill: node.color,
          width: 120,
          height: 60,
          stroke: '#333',
          strokeWidth: 2,
          rx: 10,
          ry: 10,
        });
      }

      // Adicionar texto
      const text = new IText(node.label, {
        left: node.x + (node.shape === 'circle' ? 30 : 60),
        top: node.y + (node.shape === 'circle' ? 30 : 30),
        fontFamily: 'Arial',
        fontSize: node.fontSize || 14,
        fill: '#333',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });

      canvas.add(shape, text);
    });

    // Adicionar conexões
    data.connections.forEach((connection) => {
      // Encontrar posições dos nós
      const fromNode = data.nodes.find(n => n.id === connection.from);
      const toNode = data.nodes.find(n => n.id === connection.to);

      if (fromNode && toNode) {
        const line = new Line([
          fromNode.x + 60, fromNode.y + 30,
          toNode.x + 60, toNode.y + 30
        ], {
          stroke: connection.color,
          strokeWidth: 2,
          selectable: false,
        });

        canvas.add(line);
      }
    });

    canvas.renderAll();
  };

  // Ferramentas
  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);
    
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = false;

    if (tool === 'select') {
      canvas.selection = true;
    } else if (tool === 'text') {
      const text = new IText('Novo Texto', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 16,
        fill: activeColor,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 30,
        stroke: '#333',
        strokeWidth: 2,
      });
      canvas.add(circle);
    } else if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 120,
        height: 60,
        stroke: '#333',
        strokeWidth: 2,
        rx: 10,
        ry: 10,
      });
      canvas.add(rect);
    } else if (tool === 'line') {
      const line = new Line([50, 50, 200, 50], {
        stroke: activeColor,
        strokeWidth: 3,
      });
      canvas.add(line);
    }
  };

  // Ações do canvas
  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
    toast({
      title: "Canvas Limpo",
      description: "Todos os elementos foram removidos."
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      fabricCanvasRef.current?.loadFromJSON(prevState, () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      fabricCanvasRef.current?.loadFromJSON(nextState, () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();
    const newZoom = direction === 'in' ? zoom * 1.1 : zoom * 0.9;
    
    if (newZoom >= 0.5 && newZoom <= 3) {
      canvas.setZoom(newZoom);
    }
  };

  const handleExportPDF = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      // Capturar o canvas como imagem
      const canvasElement = fabricCanvasRef.current.getElement();
      const dataURL = canvasElement.toDataURL('image/png');

      // Preparar dados para exportação
      const exportData: PDFExportData = {
        titulo: initialData?.title || 'Mapa Mental Personalizado',
        tipo: 'Mapa Mental',
        sections: [
          {
            titulo: 'Visualização do Mapa',
            conteudo: 'Este mapa mental foi criado utilizando nossa ferramenta interativa.',
            destaque: true
          }
        ],
        metadata: {
          'Criado em': new Date().toLocaleDateString('pt-BR'),
          'Ferramenta': 'Editor de Mapas Mentais',
          'Formato': 'Canvas Interativo'
        }
      };

      // Criar PDF com a imagem do canvas
      await exportarPDF(exportData);

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar PDF do mapa mental.",
        variant: "destructive"
      });
    }
  };

  const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
      '#EC4899', '#6B7280', '#000000', '#FFFFFF'
    ];

    return (
      <div className="flex flex-wrap gap-1 p-2 bg-card border rounded-lg">
        {colors.map((c) => (
          <button
            key={c}
            className={`w-6 h-6 rounded border-2 ${color === c ? 'border-foreground' : 'border-border'}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Card className="p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Ferramentas */}
          <div className="flex gap-1 mr-4">
            <Button
              size="sm"
              variant={activeTool === 'select' ? 'default' : 'outline'}
              onClick={() => handleToolClick('select')}
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'text' ? 'default' : 'outline'}
              onClick={() => handleToolClick('text')}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              onClick={() => handleToolClick('circle')}
            >
              <CircleIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              onClick={() => handleToolClick('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'line' ? 'default' : 'outline'}
              onClick={() => handleToolClick('line')}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Controles */}
          <div className="flex gap-1 mr-4">
            <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyIndex <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Cor */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <ColorPicker color={activeColor} onChange={setActiveColor} />
          </div>

          {/* Ações */}
          <div className="flex gap-1 ml-auto">
            <Button size="sm" variant="outline" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            <Button 
              size="sm" 
              onClick={handleExportPDF} 
              disabled={exporting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              {exporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full"
          style={{ display: 'block', margin: '0 auto' }}
        />
      </div>

      {/* Info */}
      <div className="mt-2">
        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Ferramenta: {activeTool}</Badge>
          <Badge variant="outline">Cor: {activeColor}</Badge>
        </div>
      </div>
    </div>
  );
};