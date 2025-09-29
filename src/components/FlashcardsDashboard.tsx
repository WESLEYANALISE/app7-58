import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Target, BookOpen, CheckCircle, AlertCircle, BarChart3, Play, Plus } from 'lucide-react';
import { useFlashcardsData } from '@/hooks/useFlashcardsData';
interface FlashcardsDashboardProps {
  onStartStudy: (area?: string, temas?: string[]) => void;
  onCreatePlan: () => void;
  onViewReview: () => void;
}
const FlashcardsDashboard: React.FC<FlashcardsDashboardProps> = ({
  onStartStudy,
  onCreatePlan,
  onViewReview
}) => {
  const {
    metrics,
    cardsForReview,
    areas,
    sessions,
    studyPlans
  } = useFlashcardsData();
  const activePlan = studyPlans.find(p => p.isActive);

  // Sessões da última semana
  const recentSessions = sessions.filter(s => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return s.date >= weekAgo;
  }).slice(0, 5);
  return <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-center space-y-4">
        <div className="flex items-center justify-between">
          
          <div className="flex space-x-2">
            <Button onClick={onCreatePlan} variant="outline" size="sm" className="border-primary/30">
              <Plus className="h-4 w-4 mr-2" />
              Criar Plano
            </Button>
            <Button onClick={() => onStartStudy()} size="sm" className="bg-primary hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Estudar Agora
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Métricas Principais */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cards</p>
                <p className="text-3xl font-bold text-primary">{metrics.totalCards}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisão</p>
                <p className="text-3xl font-bold text-green-600">{metrics.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Para Revisar</p>
                <p className="text-3xl font-bold text-orange-600">{cardsForReview.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sequência</p>
                <p className="text-3xl font-bold text-red-600">{metrics.streak}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plano de Estudo Ativo */}
      {activePlan && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5
    }}>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Plano de Estudo Ativo: {activePlan.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Áreas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activePlan.areas.slice(0, 3).map(area => <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>)}
                    {activePlan.areas.length > 3 && <Badge variant="outline" className="text-xs">
                        +{activePlan.areas.length - 3}
                      </Badge>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta Diária</p>
                  <p className="text-lg font-semibold">{activePlan.dailyGoal} cards</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta Semanal</p>
                  <p className="text-lg font-semibold">{activePlan.weeklyGoal} cards</p>
                </div>
              </div>
              <Button onClick={() => onStartStudy(activePlan.areas[0], activePlan.temas)} className="mt-4">
                Continuar Plano
              </Button>
            </CardContent>
          </Card>
        </motion.div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Área */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance por Área
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(metrics.areaPerformance)
                .sort(([, a], [, b]) => b.conhecidos / b.total - a.conhecidos / a.total)
                .map(([area, data]) => {
                const accuracy = data.total > 0 ? Math.round(data.conhecidos / data.total * 100) : 0;
                return <div key={area} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">{area}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {data.conhecidos}/{data.total}
                            </span>
                            <Badge variant={accuracy >= 70 ? "default" : accuracy >= 50 ? "secondary" : "destructive"}>
                              {accuracy}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                        <Button size="sm" variant="ghost" onClick={() => onStartStudy(area)} className="w-full text-xs">
                          Estudar {area}
                        </Button>
                      </div>;
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessões Recentes */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.7
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? <div className="space-y-3">
                  {recentSessions.map(session => <div key={session.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{session.area}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.temas.slice(0, 2).join(', ')}
                            {session.temas.length > 2 && ` +${session.temas.length - 2}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round(session.correctAnswers / session.totalCards * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.duration}min
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {session.date.toLocaleDateString('pt-BR')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {session.correctAnswers}/{session.totalCards} cards
                        </Badge>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma sessão recente</p>
                  <Button size="sm" onClick={() => onStartStudy()} className="mt-2">
                    Começar a estudar
                  </Button>
                </div>}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cards para Revisão Rápida */}
      {cardsForReview.length > 0 && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.8
    }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Cards que Precisam de Revisão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cardsForReview.slice(0, 6).map(card => <div key={card.id} className="p-3 border rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800">
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                          {card.area}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{card.pergunta}</p>
                      <Badge variant="secondary" className="text-xs">
                        {card.tema}
                      </Badge>
                    </div>
                  </div>)}
              </div>
              {cardsForReview.length > 6 && <div className="mt-4 text-center">
                  <Button onClick={onViewReview} variant="outline">
                    Ver todos os {cardsForReview.length} cards para revisão
                  </Button>
                </div>}
            </CardContent>
          </Card>
        </motion.div>}
    </div>;
};
export default FlashcardsDashboard;