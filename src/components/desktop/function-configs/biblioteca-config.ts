import { 
  BookOpen, Download, Search, Star, Clock, 
  Filter, Grid, List, Eye, FileText,
  Scale, Home, Shield, Gavel, Building, Briefcase
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const bibliotecaConfig: FunctionSidebarConfig = {
  title: 'Biblioteca de Estudos',
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
          badge: '8'
        },
        {
          id: 'recentes',
          label: 'Recentemente Abertos',
          icon: Clock,
          badge: '15'
        },
        {
          id: 'downloads',
          label: 'Downloads',
          icon: Download,
          badge: '23'
        }
      ]
    },
    {
      title: 'Visualização',
      items: [
        {
          id: 'grid-view',
          label: 'Visualização em Grade',
          icon: Grid
        },
        {
          id: 'list-view',
          label: 'Lista Detalhada',
          icon: List
        },
        {
          id: 'search-view',
          label: 'Busca Avançada',
          icon: Search
        }
      ]
    },
    {
      title: 'Áreas Jurídicas',
      items: [
        {
          id: 'constitucional',
          label: 'Direito Constitucional',
          icon: Scale,
          badge: '45'
        },
        {
          id: 'civil',
          label: 'Direito Civil',
          icon: Home,
          badge: '67'
        },
        {
          id: 'penal',
          label: 'Direito Penal',
          icon: Shield,
          badge: '34'
        },
        {
          id: 'processual-civil',
          label: 'Processual Civil',
          icon: FileText,
          badge: '28'
        },
        {
          id: 'processual-penal',
          label: 'Processual Penal',
          icon: Gavel,
          badge: '19'
        },
        {
          id: 'administrativo',
          label: 'Direito Administrativo',
          icon: Building,
          badge: '52'
        },
        {
          id: 'trabalho',
          label: 'Direito do Trabalho',
          icon: Briefcase,
          badge: '38'
        }
      ]
    },
    {
      title: 'Tipos de Material',
      items: [
        {
          id: 'manuais',
          label: 'Manuais Didáticos',
          icon: BookOpen,
          badge: '125'
        },
        {
          id: 'resumos',
          label: 'Resumos Executivos',
          icon: FileText,
          badge: '89'
        },
        {
          id: 'esquematizados',
          label: 'Esquematizados',
          icon: List,
          badge: '156'
        }
      ]
    }
  ]
};