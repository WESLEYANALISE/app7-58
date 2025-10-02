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
      title: 'Constituição Federal',
      items: [
        {
          id: 'cf88',
          label: 'Constituição Federal',
          icon: Scale,
          badge: '250'
        }
      ]
    },
    {
      title: 'Códigos Fundamentais',
      items: [
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
          id: 'ca',
          label: 'Código de Águas',
          icon: FileText,
          badge: '150'
        },
        {
          id: 'cba',
          label: 'Código Brasileiro de Aeronáutica',
          icon: FileText,
          badge: '180'
        },
        {
          id: 'cbt',
          label: 'Código Brasileiro de Telecomunicações',
          icon: FileText,
          badge: '90'
        },
        {
          id: 'ccom',
          label: 'Código Comercial',
          icon: Briefcase,
          badge: '456'
        },
        {
          id: 'cdm',
          label: 'Código de Minas',
          icon: FileText,
          badge: '100'
        },
        {
          id: 'ced',
          label: 'Código de Ética - OAB',
          icon: Scale,
          badge: '54'
        },
        {
          id: 'cppm',
          label: 'Código de Processo Penal Militar',
          icon: Shield,
          badge: '700'
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
    },
    {
      title: 'Estatutos',
      items: [
        {
          id: 'estatuto-oab',
          label: 'Estatuto da OAB',
          icon: Scale,
          badge: '78'
        },
        {
          id: 'estatuto-eca',
          label: 'Estatuto da Criança e Adolescente',
          icon: Users,
          badge: '267'
        },
        {
          id: 'estatuto-idoso',
          label: 'Estatuto do Idoso',
          icon: Users,
          badge: '118'
        },
        {
          id: 'estatuto-pcd',
          label: 'Estatuto da Pessoa com Deficiência',
          icon: Users,
          badge: '127'
        },
        {
          id: 'estatuto-igualdade-racial',
          label: 'Estatuto da Igualdade Racial',
          icon: Users,
          badge: '65'
        },
        {
          id: 'estatuto-cidade',
          label: 'Estatuto da Cidade',
          icon: Building,
          badge: '58'
        },
        {
          id: 'estatuto-desarmamento',
          label: 'Estatuto do Desarmamento',
          icon: Shield,
          badge: '38'
        },
        {
          id: 'estatuto-torcedor',
          label: 'Estatuto do Torcedor',
          icon: Users,
          badge: '47'
        }
      ]
    },
    {
      title: 'Súmulas',
      items: [
        {
          id: 'sumulas-stf',
          label: 'Súmulas STF',
          icon: Scale,
          badge: '736'
        },
        {
          id: 'sumulas-stj',
          label: 'Súmulas STJ',
          icon: Scale,
          badge: '639'
        },
        {
          id: 'sumulas-vinculantes',
          label: 'Súmulas Vinculantes STF',
          icon: Star,
          badge: '58'
        }
      ]
    }
  ]
};