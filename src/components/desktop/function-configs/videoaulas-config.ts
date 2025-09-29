import { 
  Grid, Star, Clock, Play, BookOpen, 
  GraduationCap, Scale, Home, Users, Building,
  FileText, Gavel, Heart, Shield, Briefcase
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const videoaulasConfig: FunctionSidebarConfig = {
  title: 'Videoaulas Jurídicas',
  sections: [
    {
      title: 'Navegação',
      items: [
        {
          id: 'todas-areas',
          label: 'Todas as Áreas',
          icon: Grid,
          isActive: true
        },
        {
          id: 'favoritos',
          label: 'Favoritos',
          icon: Star,
          badge: '12'
        },
        {
          id: 'historico',
          label: 'Histórico',
          icon: Clock,
          badge: '45'
        },
        {
          id: 'assistindo',
          label: 'Assistindo Agora',
          icon: Play,
          badge: '3'
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
          badge: '24'
        },
        {
          id: 'civil',
          label: 'Direito Civil',
          icon: Home,
          badge: '32'
        },
        {
          id: 'penal',
          label: 'Direito Penal',
          icon: Shield,
          badge: '18'
        },
        {
          id: 'processual-civil',
          label: 'Direito Processual Civil',
          icon: FileText,
          badge: '28'
        },
        {
          id: 'processual-penal',
          label: 'Direito Processual Penal',
          icon: Gavel,
          badge: '16'
        },
        {
          id: 'administrativo',
          label: 'Direito Administrativo',
          icon: Building,
          badge: '22'
        },
        {
          id: 'trabalho',
          label: 'Direito do Trabalho',
          icon: Briefcase,
          badge: '20'
        },
        {
          id: 'empresarial',
          label: 'Direito Empresarial',
          icon: Users,
          badge: '14'
        },
        {
          id: 'tributario',
          label: 'Direito Tributário',
          icon: FileText,
          badge: '19'
        },
        {
          id: 'familia',
          label: 'Direito de Família',
          icon: Heart,
          badge: '12'
        }
      ]
    },
    {
      title: 'Preparatórios',
      items: [
        {
          id: 'oab',
          label: 'Exame da OAB',
          icon: GraduationCap,
          badge: '156'
        },
        {
          id: 'concursos',
          label: 'Concursos Públicos',
          icon: BookOpen,
          badge: '89'
        }
      ]
    }
  ]
};