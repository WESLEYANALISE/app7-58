import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Brain, HelpCircle, Download, Loader2 } from 'lucide-react';
import { useLessonContent, type LessonData } from '@/hooks/useLessonContent';
import { useLessonPDFExport } from '@/hooks/useLessonPDFExport';
import { LessonSummaryModal } from './LessonSummaryModal';
import { FlashcardsViewer } from './FlashcardsViewer';
import { QuizViewer } from './QuizViewer';
import ProfessoraIA from '../ProfessoraIA';
interface LessonActionButtonsProps {
  lesson: LessonData;
}
export const LessonActionButtons = ({
  lesson
}: LessonActionButtonsProps) => {
  const {
    loading,
    generateContent,
    exportToPDF
  } = useLessonContent();
  const {
    exportLessonSummary,
    exporting
  } = useLessonPDFExport();
  const [activeModal, setActiveModal] = useState<'summary' | 'flashcards' | 'quiz' | null>(null);
  const [showProfessora, setShowProfessora] = useState(false);
  const [content, setContent] = useState<any>(null);
  const handleGenerateContent = async (type: 'summary' | 'flashcards' | 'quiz') => {
    const generatedContent = await generateContent(lesson, type);
    if (generatedContent) {
      setContent(generatedContent);
      setActiveModal(type);
    }
  };
  const handleExportPDF = async () => {
    if (content && activeModal === 'summary') {
      await exportLessonSummary(content, lesson);
    } else if (content && activeModal) {
      await exportToPDF(lesson, content, activeModal);
    }
  };
  return <>
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => handleGenerateContent('summary')} 
          disabled={loading} 
          variant="outline" 
          className="flex items-center gap-2 bg-background hover:bg-muted border-2 hover:border-primary/50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {loading ? 'Gerando...' : 'Resumo'}
        </Button>

        <Button 
          onClick={() => handleGenerateContent('flashcards')} 
          disabled={loading} 
          variant="outline" 
          className="flex items-center gap-2 bg-background hover:bg-muted border-2 hover:border-primary/50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? 'Gerando...' : 'Flashcards'}
        </Button>

        <Button 
          onClick={() => handleGenerateContent('quiz')} 
          disabled={loading} 
          variant="outline" 
          className="flex items-center gap-2 bg-background hover:bg-muted border-2 hover:border-primary/50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          {loading ? 'Gerando...' : 'Questões'}
        </Button>
      </div>

      {/* Modais */}
      <LessonSummaryModal isOpen={activeModal === 'summary'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />

      <FlashcardsViewer isOpen={activeModal === 'flashcards'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />

      <QuizViewer isOpen={activeModal === 'quiz'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />

      {/* Professora IA Modal */}
      <ProfessoraIA video={{
      title: lesson.assunto,
      area: lesson.area,
      channelTitle: 'Cursos Preparatórios'
    }} isOpen={showProfessora} onClose={() => setShowProfessora(false)} />
    </>;
};