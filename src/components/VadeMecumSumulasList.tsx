import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Scale, Star, ArrowLeft, Volume2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSumulasPorTribunal } from '@/hooks/useSumulas';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/utils/clipboardUtils';

interface VadeMecumSumulasListProps {
  onBack: () => void;
}

export const VadeMecumSumulasList: React.FC<VadeMecumSumulasListProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'STF' | 'STJ' | 'STF_VINCULANTE'>('all');
  const { sumulasPorTribunal, isLoading } = useSumulasPorTribunal();
  const { toast } = useToast();

  const filteredSumulas = useMemo(() => {
    let sumulas = selectedType === 'all' 
      ? [...sumulasPorTribunal.STF, ...sumulasPorTribunal.STJ, ...sumulasPorTribunal.STF_VINCULANTE]
      : sumulasPorTribunal[selectedType];

    if (!searchTerm.trim()) return sumulas;

    const searchLower = searchTerm.toLowerCase();
    return sumulas.filter(sumula => 
      sumula.titulo.toLowerCase().includes(searchLower) ||
      sumula.texto.toLowerCase().includes(searchLower)
    );
  }, [sumulasPorTribunal, selectedType, searchTerm]);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast({
        title: "✅ Súmula copiada!",
        description: "O conteúdo foi copiado para a área de transferência."
      });
    }
  };

  const handleNarrate = (sumula: any) => {
    if (sumula.naracao) {
      const audio = new Audio(sumula.naracao);
      audio.play();
      toast({
        title: "🔊 Narração iniciada",
        description: "A súmula está sendo narrada."
      });
    } else {
      toast({
        title: "Em breve",
        description: "A narração desta súmula estará disponível em breve."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-bold">Súmulas</h2>
          <div className="w-16" />
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar súmula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              Todas
            </Button>
            <Button
              variant={selectedType === 'STF' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('STF')}
            >
              <Scale className="h-3 w-3 mr-1" />
              STF
              <Badge variant="secondary" className="ml-2">{sumulasPorTribunal.STF.length}</Badge>
            </Button>
            <Button
              variant={selectedType === 'STJ' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('STJ')}
            >
              <Scale className="h-3 w-3 mr-1" />
              STJ
              <Badge variant="secondary" className="ml-2">{sumulasPorTribunal.STJ.length}</Badge>
            </Button>
            <Button
              variant={selectedType === 'STF_VINCULANTE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('STF_VINCULANTE')}
            >
              <Star className="h-3 w-3 mr-1" />
              Vinculantes
              <Badge variant="secondary" className="ml-2">{sumulasPorTribunal.STF_VINCULANTE.length}</Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando súmulas...</span>
          </div>
        ) : filteredSumulas.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma súmula encontrada.' : 'Nenhuma súmula disponível.'}
            </p>
          </div>
        ) : (
          filteredSumulas.map((sumula, index) => (
            <motion.div
              key={sumula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={sumula.tipo === 'STF_VINCULANTE' ? 'default' : 'secondary'}>
                          {sumula.tipo === 'STF_VINCULANTE' ? (
                            <>
                              <Star className="h-3 w-3 mr-1" />
                              Vinculante
                            </>
                          ) : sumula.tribunal}
                        </Badge>
                        {sumula.data_aprovacao && (
                          <span className="text-xs text-muted-foreground">
                            {sumula.data_aprovacao}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{sumula.titulo}</h3>
                      <p className="text-muted-foreground leading-relaxed">{sumula.texto}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(sumula.texto)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    {sumula.naracao && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNarrate(sumula)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Ouvir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
