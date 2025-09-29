import { 
  FileText, BookOpen, Search, Star, Clock, 
  Download, Eye, Grid, List, Filter,
  Scale, Home, Shield, Building, Briefcase, Users
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const resumosConfig: FunctionSidebarConfig = {
  title: 'Resumos Jurídicos',
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
          badge: '15'
        },
        {
          id: 'recentes',
          label: 'Visualizados Recentemente',
          icon: Clock,
          badge: '8'
        },
        {
          id: 'downloads',
          label: 'Downloads',
          icon: Download,
          badge: '12'
        }
      ]
    },
    {
      title: 'Tipos de Resumo',
      items: [
        {
          id: 'esquematicos',
          label: 'Resumos Esquemáticos',
          icon: List,
          badge: '45'
        },
        {
          id: 'mapas-conceituais',
          label: 'Mapas Conceituais',
          icon: Grid,
          badge: '32'
        },
        {
          id: 'fichamentos',
          label: 'Fichamentos',
          icon: FileText,
          badge: '28'
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
          badge: '67'
        },
        {
          id: 'civil',
          label: 'Direito Civil',
          icon: Home,
          badge: '89'
        },
        {
          id: 'penal',
          label: 'Direito Penal',
          icon: Shield,
          badge: '54'
        },
        {
          id: 'administrativo',
          label: 'Direito Administrativo',
          icon: Building,
          badge: '73'
        },
        {
          id: 'trabalho',
          label: 'Direito do Trabalho',
          icon: Briefcase,
          badge: '46'
        },
        {
          id: 'empresarial',
          label: 'Direito Empresarial',
          icon: Users,
          badge: '38'
        }
      ]
    }
  ]
};