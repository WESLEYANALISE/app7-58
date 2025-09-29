import { 
  Brain, Star, Clock, BarChart3, Target, 
  Repeat, CheckCircle, TrendingUp, Filter,
  Scale, Home, Shield, FileText, Building
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const flashcardsConfig: FunctionSidebarConfig = {
  title: 'Flashcards Jurídicos',
  sections: [
    {
      title: 'Dashboard',
      items: [
        {
          id: 'estatisticas',
          label: 'Estatísticas de Estudo',
          icon: BarChart3,
          isActive: true
        },
        {
          id: 'progresso',
          label: 'Progresso Geral',
          icon: TrendingUp,
          badge: '78%'
        },
        {
          id: 'metas',
          label: 'Metas Diárias',
          icon: Target,
          badge: '5/10'
        }
      ]
    },
    {
      title: 'Estudo',
      items: [
        {
          id: 'estudo-livre',
          label: 'Estudo Livre',
          icon: Brain
        },
        {
          id: 'revisao',
          label: 'Revisão Programada',
          icon: Repeat,
          badge: '23'
        },
        {
          id: 'dificeis',
          label: 'Cards Difíceis',
          icon: Star,
          badge: '12'
        },
        {
          id: 'dominados',
          label: 'Cards Dominados',
          icon: CheckCircle,
          badge: '156'
        }
      ]
    },
    {
      title: 'Áreas de Estudo',
      items: [
        {
          id: 'constitucional',
          label: 'Direito Constitucional',
          icon: Scale,
          badge: '89',
          children: [
            {
              id: 'const-principios',
              label: 'Princípios Constitucionais',
              badge: '24'
            },
            {
              id: 'const-direitos',
              label: 'Direitos Fundamentais',
              badge: '32'
            },
            {
              id: 'const-organizacao',
              label: 'Organização do Estado',
              badge: '33'
            }
          ]
        },
        {
          id: 'civil',
          label: 'Direito Civil',
          icon: Home,
          badge: '127',
          children: [
            {
              id: 'civil-pessoas',
              label: 'Das Pessoas',
              badge: '18'
            },
            {
              id: 'civil-bens',
              label: 'Dos Bens',
              badge: '15'
            },
            {
              id: 'civil-obrigacoes',
              label: 'Das Obrigações',
              badge: '45'
            },
            {
              id: 'civil-contratos',
              label: 'Dos Contratos',
              badge: '49'
            }
          ]
        },
        {
          id: 'penal',
          label: 'Direito Penal',
          icon: Shield,
          badge: '76',
          children: [
            {
              id: 'penal-parte-geral',
              label: 'Parte Geral',
              badge: '28'
            },
            {
              id: 'penal-crimes',
              label: 'Crimes em Espécie',
              badge: '48'
            }
          ]
        },
        {
          id: 'processual-civil',
          label: 'Processual Civil',
          icon: FileText,
          badge: '94'
        },
        {
          id: 'administrativo',
          label: 'Direito Administrativo',
          icon: Building,
          badge: '67'
        }
      ]
    },
    {
      title: 'Configurações',
      items: [
        {
          id: 'filtros',
          label: 'Filtros de Estudo',
          icon: Filter
        },
        {
          id: 'historico-sessoes',
          label: 'Histórico de Sessões',
          icon: Clock,
          badge: '45'
        }
      ]
    }
  ]
};