import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMapasMentaisEstruturados } from '@/hooks/useMapasMentaisEstruturados';
import { ArrowLeft, Download, BookOpen, Scale, Gavel, Landmark, FileText, Grid, Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MapasMentaisEstruturadosProps {
  onBack: () => void;
  onHome?: () => void;
}

export const MapasMentaisEstruturados = ({ onBack, onHome }: MapasMentaisEstruturadosProps) => {
  const { loading, areas, mapas, loadMapasPorArea, loadTodosMapas, baixarMapa } = useMapasMentaisEstruturados();
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [currentView, setCurrentView] = useState<'areas' | 'mapas' | 'todos'>('areas');
  const [searchTerm, setSearchTerm] = useState('');

  const getAreaIcon = (area: string) => {
    if (area.includes('Penal')) return <Gavel className="w-5 h-5" />;
    if (area.includes('Civil')) return <Scale className="w-5 h-5" />;
    if (area.includes('Constitucional')) return <Landmark className="w-5 h-5" />;
    return <BookOpen className="w-5 h-5" />;
  };

  const getAreaColor = (area: string) => {
    if (area.includes('Penal')) return 'from-red-500 to-red-600';
    if (area.includes('Civil')) return 'from-blue-500 to-blue-600';
    if (area.includes('Constitucional')) return 'from-green-500 to-green-600';
    if (area.includes('Administrativo')) return 'from-purple-500 to-purple-600';
    if (area.includes('Trabalhista')) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setCurrentView('mapas');
    loadMapasPorArea(area);
  };

  const handleVerTodos = () => {
    setCurrentView('todos');
    loadTodosMapas();
  };

  const handleBack = () => {
    if (currentView === 'mapas') {
      setCurrentView('areas');
      setSelectedArea('');
    } else if (currentView === 'todos') {
      setCurrentView('areas');
    } else {
      onBack();
    }
  };

  const filteredMapas = mapas.filter(mapa =>
    mapa.mapa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapa.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderHeader = () => {
    let title = 'Mapas Estruturados';
    if (currentView === 'mapas') title = selectedArea;
    if (currentView === 'todos') title = 'Todos os Mapas';

    return (
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <FileText className="w-4 h-4 text-background" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
          </div>
          
          {/* Botão Home */}
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
  };

  const renderAreas = () => (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Botão Ver Todos */}
        <Card 
          className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card mb-4" 
          onClick={handleVerTodos}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Ver Todos os Mapas</h3>
                <p className="text-xs text-muted-foreground">
                  Visualizar todos os mapas disponíveis
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {mapas.length > 0 ? mapas.length : '...'} mapas
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Áreas */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando áreas...</p>
            </div>
          ) : (
            areas.map((area) => (
              <Card 
                key={area}
                className="cursor-pointer hover:bg-card/80 transition-all duration-300 border-border bg-card" 
                onClick={() => handleAreaSelect(area)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAreaColor(area)} flex items-center justify-center`}>
                      {getAreaIcon(area)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{area}</h3>
                      <p className="text-xs text-muted-foreground">
                        Mapas especializados em {area}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderMapas = (showAreaBadge = false) => (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Barra de Pesquisa */}
        {currentView === 'todos' && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisar mapas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando mapas...</p>
          </div>
        ) : filteredMapas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum mapa encontrado para sua pesquisa.' : 'Nenhum mapa encontrado.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMapas.map((mapa) => (
              <Card key={mapa.id} className="border-border bg-card hover:bg-card/80 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-foreground mb-1">
                        {mapa.mapa}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          #{mapa.sequencia}
                        </Badge>
                        {showAreaBadge && (
                          <Badge variant="outline" className="text-xs">
                            {mapa.area}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    onClick={() => baixarMapa(mapa.link, mapa.mapa)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Mapa Mental
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderHeader()}
      
      {currentView === 'areas' && renderAreas()}
      {currentView === 'mapas' && renderMapas(false)}
      {currentView === 'todos' && renderMapas(true)}
    </div>
  );
};