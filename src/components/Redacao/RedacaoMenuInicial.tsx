import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, PlayCircle, GraduationCap, CheckCircle, Clock } from 'lucide-react';

interface RedacaoMenuInicialProps {
  onOpcaoSelecionada: (opcao: 'corrigir' | 'videoaulas' | 'cursos') => void;
}

export const RedacaoMenuInicial = ({ onOpcaoSelecionada }: RedacaoMenuInicialProps) => {
  const opcoes = [
    {
      id: 'corrigir',
      titulo: 'Corrigir minha redação',
      descricao: 'Análise completa com IA especializada em direito',
      icone: <PenTool className="h-8 w-8" />,
      cor: 'from-[hsl(var(--wine-elegant))] to-[hsl(var(--crimson-elegant))]',
      disponivel: true,
      recursos: ['Análise detalhada', 'Nota de 0 a 10', 'Pontos de melhoria', 'Exportar PDF']
    },
    {
      id: 'videoaulas',
      titulo: 'Vídeoaulas',
      descricao: 'Aprenda técnicas de redação jurídica com especialistas',
      icone: <PlayCircle className="h-8 w-8" />,
      cor: 'from-[hsl(var(--red-elegant))] to-[hsl(var(--red-elegant-light))]',
      disponivel: true,
      recursos: ['Aulas especializadas', 'Técnicas de redação', 'Exemplos práticos', 'Professores experts']
    },
    {
      id: 'cursos',
      titulo: 'Cursos',
      descricao: 'Cursos completos de redação jurídica',
      icone: <GraduationCap className="h-8 w-8" />,
      cor: 'from-[hsl(var(--burgundy-elegant))] to-[hsl(var(--red-elegant-dark))]',
      disponivel: false,
      recursos: ['Módulos estruturados', 'Certificado', 'Exercícios práticos', 'Acompanhamento']
    }
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-[hsl(var(--wine-elegant))] to-[hsl(var(--crimson-elegant))] rounded-full">
            <PenTool className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--wine-elegant))] to-[hsl(var(--crimson-elegant))] bg-clip-text text-transparent">
          Redação Perfeita
        </h1>
        <p className="text-lg text-muted-foreground">
          Escolha como você quer aperfeiçoar suas habilidades de redação jurídica
        </p>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {opcoes.map((opcao) => (
          <Card
            key={opcao.id}
            className={`group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 ${
              opcao.disponivel 
                ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' 
                : 'opacity-75 cursor-not-allowed'
            }`}
            onClick={() => opcao.disponivel && onOpcaoSelecionada(opcao.id as any)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${opcao.cor} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Status Badge */}
            {!opcao.disponivel && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Em breve
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 bg-gradient-to-br ${opcao.cor} rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                  {opcao.icone}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {opcao.titulo}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {opcao.descricao}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Recursos */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Recursos inclusos:</h4>
                <div className="space-y-1">
                  {opcao.recursos.map((recurso, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{recurso}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de ação */}
              <div className="pt-4">
                <Button
                  className={`w-full bg-gradient-to-r ${opcao.cor} hover:opacity-90 transition-all duration-300 ${
                    !opcao.disponivel ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!opcao.disponivel}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (opcao.disponivel) {
                      onOpcaoSelecionada(opcao.id as any);
                    }
                  }}
                >
                  {opcao.disponivel ? 'Acessar' : 'Em breve'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="text-center max-w-2xl px-4">
        <p className="text-sm text-muted-foreground">
          Todas as funcionalidades são desenvolvidas com IA especializada em direito para garantir 
          análises precisas e orientações específicas para o contexto jurídico.
        </p>
      </div>
    </div>
  );
};