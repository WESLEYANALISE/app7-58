
import { Users, BookOpen, Award, Clock } from 'lucide-react';

const stats = [{
  icon: Users,
  value: '50.000+',
  label: 'Estudantes Ativos',
  color: 'text-blue-400'
}, {
  icon: BookOpen,
  value: '10.000+',
  label: 'Materiais de Estudo',
  color: 'text-green-400'
}, {
  icon: Award,
  value: '85%',
  label: 'Taxa de Aprovação OAB',
  color: 'text-amber-400'
}, {
  icon: Clock,
  value: '24/7',
  label: 'Suporte Disponível',
  color: 'text-purple-400'
}];

export const StatsSection = () => {
  return (
    <section className="py-8 sm:py-12 px-3 sm:px-4 md:px-8 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 gradient-text">
            Nossa Plataforma em Números
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Dados que comprovam a excelência e confiabilidade da nossa plataforma jurídica
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-red-500/30 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 ${stat.color}`} />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
