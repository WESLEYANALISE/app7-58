import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, BookOpen, Video, FileText, Scale, Download, Lightbulb, Target, PlayCircle, ArrowRight, CheckCircle, Star, Brain, Library, Headphones, Bot, X, Users, Clock, TrendingUp, Award, Zap, Search, BookMarked, MessageSquare } from 'lucide-react';
interface Funcionalidade {
  id: string;
  nome: string;
  icone: any;
  descricao: string;
  exemplos: string[];
  casosUso: string[];
  tutorial: {
    passos: string[];
    dicas: string[];
  };
  categoria: 'estudo' | 'pesquisa' | 'organizacao' | 'aprendizado';
  cor: string;
}
const funcionalidades: Funcionalidade[] = [{
  id: 'vade-mecum',
  nome: 'Vade Mecum Digital',
  icone: Scale,
  descricao: 'Acesso completo a leis, códigos e normativas sempre atualizados com sistema de busca inteligente.',
  exemplos: ['Estudante de Direito consulta art. 186 do CC para entender responsabilidade civil', 'Concurseiro busca "competência tributária" para revisar matéria da Receita Federal', 'Advogado verifica Lei 13.709/18 (LGPD) durante consultoria empresarial'],
  casosUso: ['Estudante preparando para 2ª fase da OAB precisa citar artigos específicos', 'Concurseiro revisando legislação para prova de Procurador da República', 'Professor criando questões de prova com base legal atualizada'],
  tutorial: {
    passos: ['Acesse "Vade Mecum" no menu principal', 'Digite palavras-chave na busca (ex: "responsabilidade civil")', 'Use filtros por área: Civil, Penal, Trabalhista, etc.', 'Clique no artigo para ver texto completo e atualizações', 'Salve nos favoritos para acesso rápido'],
    dicas: ['Use aspas para busca exata: "boa-fé objetiva"', 'Combine filtros para resultados específicos', 'Ative notificações de mudanças legislativas']
  },
  categoria: 'pesquisa',
  cor: 'from-blue-500 to-indigo-600'
}, {
  id: 'biblioteca',
  nome: 'Biblioteca Jurídica',
  icone: Library,
  descricao: 'Milhares de livros, doutrinas, jurisprudências e artigos organizados por área do direito.',
  exemplos: ['Estudante lê "Curso de Direito Civil" de Carlos Roberto Gonçalves', 'Mestrando pesquisa artigos sobre "direito ao esquecimento" no STF', 'Advogado consulta precedentes sobre união homoafetiva'],
  casosUso: ['Graduando em Direito pesquisando para TCC sobre crimes cibernéticos', 'Advogado civilista buscando jurisprudência atualizada sobre danos morais', 'Professor atualizando material de aula com novas decisões do STJ'],
  tutorial: {
    passos: ['Entre na "Biblioteca" pelo menu', 'Escolha categoria: Livros, Jurisprudência ou Artigos', 'Use filtros por tribunal, área ou período', 'Baixe PDFs para leitura offline', 'Crie sua biblioteca pessoal com favoritos'],
    dicas: ['Baixe materiais importantes para estudar sem internet', 'Use marcadores de página durante leitura', 'Combine busca por autor e assunto']
  },
  categoria: 'estudo',
  cor: 'from-emerald-500 to-teal-600'
}, {
  id: 'videoaulas',
  nome: 'Videoaulas Jurídicas',
  icone: Video,
  descricao: 'Aulas completas com professores renomados cobrindo todas as disciplinas jurídicas.',
  exemplos: ['Estudante assiste aula de Processo Penal com Prof. Aury Lopes Jr.', 'Concurseiro estuda Direito Administrativo para Procuradoria do Estado', 'OAB: revisão intensiva de Ética Profissional antes do exame'],
  casosUso: ['Concurseiro estudando para Magistratura Estadual - foco em Processo Civil', 'Estudante de graduação complementando aulas presenciais', 'Advogado se especializando em Direito Digital'],
  tutorial: {
    passos: ['Acesse "Videoaulas" no menu', 'Escolha a disciplina (Civil, Penal, Constitucional, etc.)', 'Selecione nível: Graduação, OAB ou Concursos', 'Assista em sequência ou por tópicos específicos', 'Faça anotações durante as aulas'],
    dicas: ['Baixe vídeos para assistir offline', 'Use velocidade 1.25x para otimizar tempo', 'Revise anotações após cada módulo']
  },
  categoria: 'aprendizado',
  cor: 'from-red-500 to-pink-600'
}, {
  id: 'audio-aulas',
  nome: 'Áudio-aulas',
  icone: Headphones,
  descricao: 'Conteúdo jurídico em formato de áudio para estudo em movimento.',
  exemplos: ['Estudante escuta resumo do Código de Processo Civil no ônibus', 'Concurseiro ouve podcast sobre mudanças na CLT durante caminhada', 'Advogado escuta análise de julgados do STF no trânsito'],
  casosUso: ['Estudante otimizando tempo durante deslocamento para faculdade', 'Concurseiro revisando matéria durante exercícios físicos', 'Profissional se atualizando durante viagens de trabalho'],
  tutorial: {
    passos: ['Abra "Áudio-aulas" no menu', 'Escolha disciplina ou podcast temático', 'Baixe episódios para ouvir offline', 'Use fones para melhor qualidade', 'Marque trechos importantes'],
    dicas: ['Crie playlists por matéria de concurso', 'Ouça em velocidade normal para melhor compreensão', 'Combine com leitura tradicional']
  },
  categoria: 'aprendizado',
  cor: 'from-purple-500 to-violet-600'
}, {
  id: 'flashcards',
  nome: 'Flashcards Inteligentes',
  icone: Brain,
  descricao: 'Sistema de repetição espaçada com cartões de memória para fixação de conceitos jurídicos.',
  exemplos: ['Estudante memoriza elementos dos crimes contra patrimônio', 'Concurseiro fixa prazos processuais do CPC', 'OAB: definições de princípios constitucionais'],
  casosUso: ['Candidato à OAB memorizando conceitos para prova oral', 'Concurseiro de Delegado fixando tipificação penal', 'Professor criando material de revisão para turma'],
  tutorial: {
    passos: ['Acesse "Flashcards" e escolha deck temático', 'Estude seguindo algoritmo de repetição', 'Avalie dificuldade: fácil, médio ou difícil', 'Crie decks personalizados', 'Acompanhe estatísticas de aprendizado'],
    dicas: ['Estude 20-30 minutos diários', 'Seja honesto na autoavaliação', 'Revise cards difíceis mais vezes']
  },
  categoria: 'aprendizado',
  cor: 'from-orange-500 to-red-600'
}, {
  id: 'mapas-mentais',
  nome: 'Mapas Mentais Jurídicos',
  icone: Brain,
  descricao: 'Visualização de conexões entre institutos jurídicos e organização de conhecimento.',
  exemplos: ['Estudante cria mapa da estrutura do Sistema Judiciário', 'Concurseiro organiza tipos de responsabilidade civil', 'Professor monta esquema do processo legislativo'],
  casosUso: ['Graduando organizando matéria para prova de Constitucional', 'Advogado montando estratégia para caso complexo', 'Concurseiro conectando institutos para prova discursiva'],
  tutorial: {
    passos: ['Entre em "Mapas Mentais"', 'Escolha template ou crie do zero', 'Use cores para categorizar informações', 'Conecte conceitos relacionados', 'Exporte para impressão'],
    dicas: ['Use palavras-chave, não frases longas', 'Aplique cores consistentemente', 'Revise mapas semanalmente']
  },
  categoria: 'organizacao',
  cor: 'from-cyan-500 to-blue-600'
}, {
  id: 'downloads',
  nome: 'Downloads Jurídicos',
  icone: Download,
  descricao: 'Acervo completo de materiais para download: livros, modelos, formulários.',
  exemplos: ['Estudante baixa "Manual de Direito Penal" para estudar offline', 'Advogado obtém modelo de petição inicial trabalhista', 'Contador baixa formulários atualizados da Receita Federal'],
  casosUso: ['Advogado iniciante baixando modelos para montar escritório', 'Estudante criando biblioteca pessoal para concursos', 'Professor distribuindo material complementar'],
  tutorial: {
    passos: ['Acesse "Downloads"', 'Filtre por: Livros, Modelos ou Formulários', 'Visualize prévia antes de baixar', 'Baixe em formato editável', 'Organize em pastas no dispositivo'],
    dicas: ['Sempre adapte modelos ao caso específico', 'Verifique atualizações mensalmente', 'Mantenha backup na nuvem']
  },
  categoria: 'pesquisa',
  cor: 'from-green-500 to-emerald-600'
}, {
  id: 'anotacoes',
  nome: 'Sistema de Anotações',
  icone: FileText,
  descricao: 'Ferramenta completa para criar, organizar e sincronizar suas anotações jurídicas.',
  exemplos: ['Estudante faz resumo de aula sobre Direito Empresarial', 'Concurseiro anota jurisprudência importante do STF', 'Advogado registra estratégias durante reunião com cliente'],
  casosUso: ['Graduando organizando material para trabalho de conclusão', 'Concurseiro criando fichamentos para revisão', 'Advogado documentando andamento de processos'],
  tutorial: {
    passos: ['Abra "Sistema de Anotações"', 'Crie categorias por matéria', 'Use formatação: negrito, listas, cores', 'Adicione tags para busca rápida', 'Sincronize entre dispositivos'],
    dicas: ['Use títulos descritivos', 'Revise anotações semanalmente', 'Integre com outras ferramentas']
  },
  categoria: 'organizacao',
  cor: 'from-amber-500 to-orange-600'
}, {
  id: 'assistente-ia',
  nome: 'Assistente IA Jurídica',
  icone: Bot,
  descricao: 'Inteligência artificial especializada para esclarecer dúvidas e auxiliar em pesquisas.',
  exemplos: ['Estudante pergunta sobre diferença entre dolo direto e eventual', 'Advogado consulta sobre prazos para recurso especial', 'Concurseiro tira dúvida sobre competência em processo penal'],
  casosUso: ['Estudante com dúvida específica durante madrugada de estudos', 'Advogado precisando de esclarecimento rápido antes de audiência', 'Professor verificando conceitos para preparar aula'],
  tutorial: {
    passos: ['Acesse "Assistente IA"', 'Digite sua pergunta de forma clara', 'Especifique área do direito se necessário', 'Leia resposta e faça perguntas complementares', 'Salve respostas úteis para consulta'],
    dicas: ['Seja específico nas perguntas', 'Confirme informações em fontes oficiais', 'Use para esclarecer conceitos, não para substituir estudo']
  },
  categoria: 'pesquisa',
  cor: 'from-indigo-500 to-purple-600'
}];
export const Explorar = () => {
  const [funcionalidadeSelecionada, setFuncionalidadeSelecionada] = useState<Funcionalidade | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const funcionalidadesFiltradas = useMemo(() => {
    return categoriaFiltro === 'todas' ? funcionalidades : funcionalidades.filter(f => f.categoria === categoriaFiltro);
  }, [categoriaFiltro]);
  const categorias = [{
    id: 'todas',
    nome: 'Todas',
    icone: Compass
  }, {
    id: 'estudo',
    nome: 'Estudo',
    icone: BookOpen
  }, {
    id: 'pesquisa',
    nome: 'Pesquisa',
    icone: Search
  }, {
    id: 'organizacao',
    nome: 'Organização',
    icone: Target
  }, {
    id: 'aprendizado',
    nome: 'Aprendizado',
    icone: Brain
  }];
  return <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Header otimizado para mobile */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <Compass className="h-6 w-6 sm:h-8 md:h-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explorar Funcionalidades
          </h1>
        </div>
        <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
          Descubra como usar cada ferramenta com exemplos práticos para estudantes, 
          advogados e concurseiros. Maximize sua produtividade jurídica.
        </p>
      </div>

      {/* Filtros responsivos */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
        {categorias.map(categoria => {
        const IconeCategoria = categoria.icone;
        return <Button key={categoria.id} variant={categoriaFiltro === categoria.id ? "default" : "outline"} onClick={() => setCategoriaFiltro(categoria.id)} className="flex items-center gap-1 sm:gap-2 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2" size="sm">
              <IconeCategoria className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{categoria.nome}</span>
            </Button>;
      })}
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {funcionalidadesFiltradas.map(funcionalidade => {
        const IconeFuncionalidade = funcionalidade.icone;
        return <Card key={funcionalidade.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-card backdrop-blur-sm" onClick={() => setFuncionalidadeSelecionada(funcionalidade)}>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${funcionalidade.cor} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <IconeFuncionalidade className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm sm:text-base md:text-lg leading-tight">{funcionalidade.nome}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {categorias.find(c => c.id === funcionalidade.categoria)?.nome}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-3 text-xs sm:text-sm">
                  {funcionalidade.descricao}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                    <Users className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span>{funcionalidade.exemplos.length} exemplos</span>
                  </div>
                  <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                    <span className="text-xs sm:text-sm font-medium">Ver detalhes</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Modal responsivo */}
      {funcionalidadeSelecionada && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-background rounded-lg sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-3 sm:p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={`p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r ${funcionalidadeSelecionada.cor}`}>
                    <funcionalidadeSelecionada.icone className="h-6 w-6 sm:h-8 md:h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">{funcionalidadeSelecionada.nome}</h2>
                    <Badge className="mt-1 sm:mt-2 text-xs">
                      {categorias.find(c => c.id === funcionalidadeSelecionada.categoria)?.nome}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFuncionalidadeSelecionada(null)}>
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Descrição */}
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    O que é
                  </h3>
                  <p className="text-sm sm:text-lg text-muted-foreground">
                    {funcionalidadeSelecionada.descricao}
                  </p>
                </CardContent>
              </Card>

              {/* Exemplos Práticos */}
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    Exemplos Práticos para Estudantes
                  </h3>
                  <div className="grid gap-2 sm:gap-3">
                    {funcionalidadeSelecionada.exemplos.map((exemplo, index) => <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg border border-green-200 dark:border-green-800 bg-zinc-950">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{exemplo}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              {/* Casos de Uso */}
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    Como Usar na Prática
                  </h3>
                  <div className="grid gap-2 sm:gap-3">
                    {funcionalidadeSelecionada.casosUso.map((caso, index) => <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-zinc-950">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm leading-relaxed">{caso}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              {/* Tutorial */}
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    Tutorial Passo a Passo
                  </h3>
                  
                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-lg">Como começar:</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {funcionalidadeSelecionada.tutorial.passos.map((passo, index) => <div key={index} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="pt-1 leading-relaxed text-xs sm:text-sm">{passo}</span>
                        </div>)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-lg flex items-center gap-2">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      Dicas de Otimização:
                    </h4>
                    <div className="space-y-1 sm:space-y-2">
                      {funcionalidadeSelecionada.tutorial.dicas.map((dica, index) => <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-zinc-950">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm leading-relaxed">{dica}</span>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>}

      {/* CTA responsivo */}
      <Card className="mt-8 sm:mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        
      </Card>
    </div>;
};