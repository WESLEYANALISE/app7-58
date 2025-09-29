import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import { useDownloads } from '@/hooks/useDownloads';
import { BookCard } from '@/components/BookCard';
import { motion } from 'framer-motion';
import { useNavigation } from '@/context/NavigationContext';

export const Downloads = () => {
  const { setCurrentFunction } = useNavigation();
  const {
    downloads,
    loading,
    error
  } = useDownloads();
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedProfession, setProfession] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleBack = () => {
    setCurrentFunction(null);
  };

  // Cores únicas para cada área
  const areaColors = {
    'Direito Civil': 'bg-blue-100 text-blue-800 border-blue-200',
    'Direito Penal': 'bg-red-100 text-red-800 border-red-200',
    'Direito Administrativo': 'bg-green-100 text-green-800 border-green-200',
    'Direito Constitucional': 'bg-purple-100 text-purple-800 border-purple-200',
    'Direito Tributário': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Direito do Trabalho': 'bg-orange-100 text-orange-800 border-orange-200',
    'Direito Processual': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Direito Empresarial': 'bg-pink-100 text-pink-800 border-pink-200',
    'Direito Ambiental': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Direito Internacional': 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };
  const getAreaColor = (area: string) => {
    return areaColors[area as keyof typeof areaColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  const getAreaColorValue = (area: string) => {
    const colorMap = {
      'Direito Civil': '#3b82f6',
      'Direito Penal': '#ef4444',
      'DireAdministrativo': '#10b981',
      'Direito Constitucional': '#8b5cf6',
      'Direito Tributário': '#f59e0b',
      'Direito do Trabalho': '#f97316',
      'Direito Processual': '#6366f1',
      'Direito Empresarial': '#ec4899',
      'Direito Ambiental': '#059669',
      'Direito Internacional': '#06b6d4'
    };
    return colorMap[area as keyof typeof colorMap] || '#6b7280';
  };
  const areas = useMemo(() => {
    return Array.from(new Set(downloads.map(d => d.area))).filter(Boolean);
  }, [downloads]);
  const professions = useMemo(() => {
    const allProfessions = downloads.map(d => d.profissao ? d.profissao.split(',').map(p => p.trim()) : []).flat().filter(Boolean);
    return Array.from(new Set(allProfessions));
  }, [downloads]);
  const getFilteredBooks = useMemo(() => {
    let filtered = downloads;
    if (searchQuery) {
      filtered = filtered.filter(book => book.livro?.toLowerCase().includes(searchQuery.toLowerCase()) || book.area?.toLowerCase().includes(searchQuery.toLowerCase()) || book.profissao?.toLowerCase().includes(searchQuery.toLowerCase()) || book.sobre?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [downloads, searchQuery]);
  const getProfessionLogo = (profession: string) => {
    const download = downloads.find(d => d['proficao do logo'] && d['proficao do logo'].toLowerCase() === profession.toLowerCase());
    return download?.logo || null;
  };
  const getBooksByArea = (area: string) => {
    return getFilteredBooks.filter(d => d.area === area);
  };
  const getBooksByProfession = (profession: string) => {
    return getFilteredBooks.filter(d => d.profissao && d.profissao.toLowerCase().includes(profession.toLowerCase()));
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Erro: {error}</p>
          </div>
        </div>
      </div>;
  }
  
  return (
    <div className="fixed inset-0 bg-background">
      {/* Header Consistente */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Downloads</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 px-[10px] py-[33px]">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-8">
            <h1 className="font-bold gradient-text mb-3 text-center text-2xl">
              Biblioteca de Downloads
            </h1>
            <p className="text-muted-foreground text-base">
              Descubra e baixe livros de estudos para concursos públicos organizados por área do direito e profissão
            </p>
          </motion.div>

          {/* Controles */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="mb-8 space-y-4">
            {/* Barra de Pesquisa e Controles de Visualização */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Pesquisar livros, áreas ou profissões..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm">
                {downloads.length} livros disponíveis
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {areas.length} áreas do direito
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {professions.length} profissões
              </Badge>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="areas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="areas" className="text-sm">
                <Filter className="h-4 w-4 mr-2" />
                Por Área
              </TabsTrigger>
              <TabsTrigger value="profissoes" className="text-sm">
                <Filter className="h-4 w-4 mr-2" />
                Por Profissão
              </TabsTrigger>
            </TabsList>

            {/* Tab: Por Área */}
            <TabsContent value="areas" className="mt-6">
              <div className="space-y-6">
                {/* Seletor de Área */}
                <div className="w-full max-w-sm">
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma área do direito" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map(area => <SelectItem key={area} value={area}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: getAreaColorValue(area)
                        }}></div>
                            {area}
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Livros da Área Selecionada */}
                {selectedArea ? <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.2
              }}>
                    <div className="flex items-center gap-3 mb-6">
                      <Badge className={`${getAreaColor(selectedArea)} text-base px-3 py-1`}>
                        {getBooksByArea(selectedArea).length} livros
                      </Badge>
                      <h2 className="text-2xl font-bold">{selectedArea}</h2>
                    </div>
                    
                    {getBooksByArea(selectedArea).length === 0 ? <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                          Nenhum livro encontrado
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Tente ajustar sua pesquisa.' : 'Nenhum livro disponível nesta área.'}
                        </p>
                      </div> : <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {getBooksByArea(selectedArea).map((item, index) => <motion.div key={`${selectedArea}-${index}`} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: index * 0.1
                  }}>
                            <BookCard book={item} areaColor={getAreaColorValue(item.area)} getProfessionLogo={getProfessionLogo} />
                          </motion.div>)}
                      </div>}
                  </motion.div> : <div className="text-center py-16">
                    <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-muted-foreground mb-3">
                      Selecione uma área
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Escolha uma área do direito para explorar os livros disponíveis.
                    </p>
                  </div>}
              </div>
            </TabsContent>

            {/* Tab: Por Profissão */}
            <TabsContent value="profissoes" className="mt-6">
              <div className="space-y-6">
                {/* Seletor de Profissão */}
                <div className="w-full max-w-sm">
                  <Select value={selectedProfession} onValueChange={setProfession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma profissão" />
                    </SelectTrigger>
                    <SelectContent>
                      {professions.map(profession => {
                      const logo = getProfessionLogo(profession);
                      return <SelectItem key={profession} value={profession}>
                            <div className="flex items-center gap-2">
                              {logo && <div className="w-4 h-4 p-0.5 bg-white rounded-sm shadow-sm border">
                                  <img src={logo} alt={profession} className="w-full h-full object-contain" />
                                </div>}
                              {profession}
                            </div>
                          </SelectItem>;
                    })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Livros da Profissão Selecionada */}
                {selectedProfession ? <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                delay: 0.2
              }}>
                    <div className="flex items-center gap-3 mb-6">
                      <Badge variant="default" className="text-base px-3 py-1">
                        {getBooksByProfession(selectedProfession).length} livros
                      </Badge>
                      <div className="flex items-center gap-3">
                        {getProfessionLogo(selectedProfession) && <div className="w-8 h-8 p-1 bg-white rounded-md shadow-sm border">
                            <img src={getProfessionLogo(selectedProfession)} alt={selectedProfession} className="w-full h-full object-contain" />
                          </div>}
                        <h2 className="text-2xl font-bold">{selectedProfession}</h2>
                      </div>
                    </div>
                    
                    {getBooksByProfession(selectedProfession).length === 0 ? <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                          Nenhum livro encontrado
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Tente ajustar sua pesquisa.' : 'Nenhum livro disponível para esta profissão.'}
                        </p>
                      </div> : <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {getBooksByProfession(selectedProfession).map((item, index) => <motion.div key={`${selectedProfession}-${index}`} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: index * 0.1
                  }}>
                            <BookCard book={item} areaColor={getAreaColorValue(item.area)} getProfessionLogo={getProfessionLogo} showAreaBadge />
                          </motion.div>)}
                      </div>}
                  </motion.div> : <div className="text-center py-16">
                    <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-muted-foreground mb-3">
                      Selecione uma profissão
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Escolha uma profissão para descobrir os livros recomendados.
                    </p>
                  </div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
