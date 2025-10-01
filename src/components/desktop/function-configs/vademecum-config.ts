import { 
  Scale, BookOpen, Search, Star, Clock, 
  FileText, Gavel, Building, Shield, Home,
  Users, Briefcase, DollarSign, Globe
} from 'lucide-react';
import type { FunctionSidebarConfig } from '../DesktopFunctionLayout';

export const vademecumConfig: FunctionSidebarConfig = {
  title: 'Vade Mecum Digital',
  sections: [
    {
      title: 'Navegação Rápida',
      items: [
        {
          id: 'home',
          label: 'Início',
          icon: Home,
          isActive: true
        },
        {
          id: 'search',
          label: 'Busca Avançada',
          icon: Search
        },
        {
          id: 'favoritos',
          label: 'Artigos Favoritos',
          icon: Star,
          badge: '27'
        },
        {
          id: 'historico',
          label: 'Histórico de Leitura',
          icon: Clock,
          badge: '156'
        }
      ]
    },
    {
      title: 'Códigos Fundamentais',
      items: [
        {
          id: 'cf88',
          label: 'Constituição Federal',
          icon: Scale,
          badge: '250'
        },
        {
          id: 'cc',
          label: 'Código Civil',
          icon: Home,
          badge: '2046'
        },
        {
          id: 'cp',
          label: 'Código Penal',
          icon: Shield,
          badge: '361'
        },
        {
          id: 'cpc',
          label: 'Código de Processo Civil',
          icon: FileText,
          badge: '1072'
        },
        {
          id: 'cpp',
          label: 'Código de Processo Penal',
          icon: Gavel,
          badge: '811'
        }
      ]
    },
    {
      title: 'Legislação Especial',
      items: [
        {
          id: 'clt',
          label: 'Consolidação das Leis do Trabalho',
          icon: Briefcase,
          badge: '922'
        },
        {
          id: 'ctn',
          label: 'Código Tributário Nacional',
          icon: DollarSign,
          badge: '218'
        },
        {
          id: 'cdc',
          label: 'Código de Defesa do Consumidor',
          icon: Users,
          badge: '119'
        },
        {
          id: 'eoa',
          label: 'Estatuto da Ordem dos Advogados',
          icon: Scale,
          badge: '78'
        },
        {
          id: 'lf',
          label: 'Lei de Falências',
          icon: Building,
          badge: '201'
        }
      ]
    },
    {
      title: 'Processual',
      items: [
        {
          id: 'lei-9099',
          label: 'Juizados Especiais (Lei 9.099/95)',
          icon: Gavel,
          badge: '98'
        },
        {
          id: 'lei-execucao-penal',
          label: 'Lei de Execução Penal',
          icon: Shield,
          badge: '204'
        },
        {
          id: 'lei-arbitragem',
          label: 'Lei de Arbitragem',
          icon: FileText,
          badge: '48'
        }
      ]
    },
    {
      title: 'Internacional',
      items: [
        {
          id: 'tratados',
          label: 'Tratados Internacionais',
          icon: Globe,
          badge: '15'
        },
        {
          id: 'mercosul',
          label: 'Legislação do Mercosul',
          icon: Globe,
          badge: '8'
        }
      ]
    }
  ]
};