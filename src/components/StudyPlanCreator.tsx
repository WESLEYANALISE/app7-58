import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Calendar, BookOpen, Save, Plus } from 'lucide-react';
import { useFlashcardsData, StudyPlan } from '@/hooks/useFlashcardsData';
import { useToast } from '@/hooks/use-toast';

interface StudyPlanCreatorProps {
  onBack: () => void;
  onPlanCreated: (plan: StudyPlan) => void;
}

const StudyPlanCreator: React.FC<StudyPlanCreatorProps> = ({ onBack, onPlanCreated }) => {
  const { areas, getTemasByArea, createStudyPlan, studyPlans } = useFlashcardsData();
  const { toast } = useToast();
  
  const [planName, setPlanName] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [weeklyGoal, setWeeklyGoal] = useState(50);
  const [isActive, setIsActive] = useState(true);

  // Obter todos os temas das áreas selecionadas
  const availableTemas = selectedAreas.flatMap(area => 
    getTemasByArea(area).map(tema => ({ area, tema }))
  );

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => {
      const newAreas = prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area];
      
      // Remover temas que não pertencem mais às áreas selecionadas
      if (!prev.includes(area) && newAreas.includes(area)) {
        // Adicionando área - adicionar todos os temas dessa área
        const areaThemes = getTemasByArea(area);
        setSelectedTemas(prevTemas => [...prevTemas, ...areaThemes]);
      } else if (prev.includes(area) && !newAreas.includes(area)) {
        // Removendo área - remover todos os temas dessa área
        const areaThemes = getTemasByArea(area);
        setSelectedTemas(prevTemas => prevTemas.filter(tema => !areaThemes.includes(tema)));
      }
      
      return newAreas;
    });
  };

  const handleTemaToggle = (tema: string) => {
    setSelectedTemas(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const handleCreatePlan = () => {
    if (!planName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o plano de estudo",
        variant: "destructive"
      });
      return;
    }

    if (selectedAreas.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos uma área de estudo",
        variant: "destructive"
      });
      return;
    }

    if (selectedTemas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um tema para estudar",
        variant: "destructive"
      });
      return;
    }

    const newPlan = createStudyPlan({
      name: planName.trim(),
      areas: selectedAreas,
      temas: selectedTemas,
      dailyGoal,
      weeklyGoal,
      isActive
    });

    toast({
      title: "Plano criado!",
      description: `Plano "${planName}" criado com sucesso`,
    });

    onPlanCreated(newPlan);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Criar Plano de Estudo</h1>
          <p className="text-muted-foreground">Monte um plano personalizado para seus estudos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Informações do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="planName">Nome do Plano</Label>
                  <Input
                    id="planName"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Preparação para OAB, Direito Civil Completo..."
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked as boolean)}
                  />
                  <Label htmlFor="isActive">Definir como plano ativo</Label>
                </div>
                
                {isActive && studyPlans.some(p => p.isActive) && (
                  <p className="text-sm text-muted-foreground">
                    * Isso desativará o plano atualmente ativo
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Seleção de Áreas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Estudo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione as áreas jurídicas que deseja estudar
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {areas.map((area) => (
                    <motion.div
                      key={area}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedAreas.includes(area)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAreaToggle(area)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAreas.includes(area)}
                          onChange={() => {}}
                        />
                        <span className="font-medium text-sm">{area}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seleção de Temas */}
          {selectedAreas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Temas Específicos</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Escolha os temas que deseja focar em cada área
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAreas.map((area) => {
                      const temas = getTemasByArea(area);
                      return (
                        <div key={area} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{area}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const allAreaTemas = getTemasByArea(area);
                                const allSelected = allAreaTemas.every(tema => selectedTemas.includes(tema));
                                if (allSelected) {
                                  setSelectedTemas(prev => prev.filter(tema => !allAreaTemas.includes(tema)));
                                } else {
                                  setSelectedTemas(prev => [...new Set([...prev, ...allAreaTemas])]);
                                }
                              }}
                              className="text-xs"
                            >
                              {temas.every(tema => selectedTemas.includes(tema)) ? 'Desmarcar todos' : 'Selecionar todos'}
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {temas.map((tema) => (
                              <div
                                key={`${area}-${tema}`}
                                className={`p-2 border rounded cursor-pointer transition-all text-sm ${
                                  selectedTemas.includes(tema)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => handleTemaToggle(tema)}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedTemas.includes(tema)}
                                    onChange={() => {}}
                                  />
                                  <span className="text-xs">{tema}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar com Metas e Resumo */}
        <div className="space-y-6">
          {/* Metas de Estudo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dailyGoal">Meta Diária (cards)</Label>
                  <Input
                    id="dailyGoal"
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
                    min={1}
                    max={100}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="weeklyGoal">Meta Semanal (cards)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
                    min={1}
                    max={500}
                    className="mt-1"
                  />
                </div>

                <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {Math.ceil(weeklyGoal / dailyGoal)} dias por semana
                  </p>
                  <p>Tempo estimado: ~{Math.round(dailyGoal * 1.5)} min/dia</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resumo do Plano */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Áreas Selecionadas</p>
                  <p className="text-lg font-bold text-primary">{selectedAreas.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Temas Selecionados</p>
                  <p className="text-lg font-bold text-primary">{selectedTemas.length}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Duração Estimada</p>
                  <p className="text-lg font-bold text-primary">
                    {Math.ceil((selectedTemas.length * 5) / weeklyGoal)} semanas
                  </p>
                </div>

                <Button 
                  onClick={handleCreatePlan}
                  disabled={!planName.trim() || selectedAreas.length === 0 || selectedTemas.length === 0}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Criar Plano
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanCreator;