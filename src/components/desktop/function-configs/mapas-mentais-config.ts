import { 
  Brain, Search, Star, Clock, Download, 
  Eye, Grid, Share, Edit, Plus,
  Scale, Home, Shield, Building, Briefcase
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const mapasMentaisConfig: FunctionSidebarConfig = {
  title: 'Mapas Mentais',
  sections: [
    {
      title: 'Navegação',
      items: [
        {
          id: 'todos-mapas',
          label: 'Todos os Mapas',
          icon: Grid,
          isActive: true
        },
        {
          id: 'favoritos',
          label: 'Favoritos',
          icon: Star,
          badge: '9'
        },
        {
          id: 'recentes',
          label: 'Recentemente Visualizados',
          icon: Clock,
          badge: '6'
        },
        {
          id: 'compartilhados',
          label: 'Compartilhados',
          icon: Share,
          badge: '3'
        }
      ]
    },
    {
      title: 'Ações',
      items: [
        {
          id: 'criar-mapa',
          label: 'Criar Novo Mapa',
          icon: Plus
        },
        {
          id: 'editar-mapas',
          label: 'Editar Mapas Existentes',
          icon: Edit
        },
        {
          id: 'visualizar',
          label: 'Modo Visualização',
          icon: Eye
        },
        {
          id: 'downloads',
          label: 'Downloads',
          icon: Download,
          badge: '18'
        }
      ]
    },
    {
      title: 'Áreas de Conhecimento',
      items: [
        {
          id: 'constitucional',
          label: 'Direito Constitucional',
          icon: Scale,
          badge: '25'
        },
        {
          id: 'civil',
          label: 'Direito Civil',
          icon: Home,
          badge: '34'
        },
        {
          id: 'penal',
          label: 'Direito Penal',
          icon: Shield,
          badge: '19'
        },
        {
          id: 'administrativo',
          label: 'Direito Administrativo',
          icon: Building,
          badge: '28'
        },
        {
          id: 'trabalho',
          label: 'Direito do Trabalho',
          icon: Briefcase,
          badge: '22'
        }
      ]
    },
    {
      title: 'Categorias',
      items: [
        {
          id: 'conceitos-basicos',
          label: 'Conceitos Básicos',
          icon: Brain,
          badge: '45'
        },
        {
          id: 'jurisprudencia',
          label: 'Jurisprudência',
          icon: Scale,
          badge: '32'
        },
        {
          id: 'doutrinas',
          label: 'Doutrinas',
          icon: Grid,
          badge: '28'
        }
      ]
    }
  ]
};