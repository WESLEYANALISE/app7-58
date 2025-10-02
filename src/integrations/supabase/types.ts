export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "01. AUTO CONHECIMENTO": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "01. LIVROS-APP-NOVO": {
        Row: {
          area: string | null
          autor: string | null
          "capa-area": string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          "capa-area"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          "capa-area"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "02. Empreendedorismo e Negócios": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "03. Finanças pessoas e Investimento": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "04. Inteligência Emocional e Relacionamentos": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "05. Espiritualidade e Propósitos": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "05. Sociedade e Comportamento": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "06. Romance": {
        Row: {
          area: string | null
          autor: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          last_login: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_super_admin?: boolean | null
          last_login?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
        }
        Relationships: []
      }
      advogados: {
        Row: {
          ativo: boolean | null
          cidade: string
          created_at: string
          descricao_profissional: string | null
          email: string
          endereco_completo: string | null
          especialidades: string[]
          estado: string
          foto_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome_completo: string
          numero_oab: string
          rating: number | null
          telefone: string
          tempo_experiencia: string | null
          updated_at: string
          verificado: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          cidade: string
          created_at?: string
          descricao_profissional?: string | null
          email: string
          endereco_completo?: string | null
          especialidades?: string[]
          estado: string
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_completo: string
          numero_oab: string
          rating?: number | null
          telefone: string
          tempo_experiencia?: string | null
          updated_at?: string
          verificado?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string
          created_at?: string
          descricao_profissional?: string | null
          email?: string
          endereco_completo?: string | null
          especialidades?: string[]
          estado?: string
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_completo?: string
          numero_oab?: string
          rating?: number | null
          telefone?: string
          tempo_experiencia?: string | null
          updated_at?: string
          verificado?: boolean | null
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          book_id: number | null
          created_at: string
          id: string
          image_url: string | null
          message: string
          response: string
          user_id: string
        }
        Insert: {
          book_id?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          response: string
          user_id: string
        }
        Update: {
          book_id?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_courses: {
        Row: {
          created_at: string
          ementa: string | null
          id: string
          json_data: Json | null
          objective: string | null
          resumo_final: string | null
          source_content: string | null
          source_type: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ementa?: string | null
          id?: string
          json_data?: Json | null
          objective?: string | null
          resumo_final?: string | null
          source_content?: string | null
          source_type: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ementa?: string | null
          id?: string
          json_data?: Json | null
          objective?: string | null
          resumo_final?: string | null
          source_content?: string | null
          source_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_flashcards: {
        Row: {
          created_at: string
          dica: string | null
          id: string
          module_id: string | null
          pergunta: string
          resposta: string
        }
        Insert: {
          created_at?: string
          dica?: string | null
          id?: string
          module_id?: string | null
          pergunta: string
          resposta: string
        }
        Update: {
          created_at?: string
          dica?: string | null
          id?: string
          module_id?: string | null
          pergunta?: string
          resposta?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_flashcards_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ai_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lesson_flashcards: {
        Row: {
          card_order: number
          created_at: string
          dica: string | null
          expires_at: string
          generated_at: string
          id: string
          lesson_area: string
          lesson_content: string
          lesson_id: number
          lesson_tema: string
          pergunta: string
          resposta: string
        }
        Insert: {
          card_order: number
          created_at?: string
          dica?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          lesson_area: string
          lesson_content: string
          lesson_id: number
          lesson_tema: string
          pergunta: string
          resposta: string
        }
        Update: {
          card_order?: number
          created_at?: string
          dica?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          lesson_area?: string
          lesson_content?: string
          lesson_id?: number
          lesson_tema?: string
          pergunta?: string
          resposta?: string
        }
        Relationships: []
      }
      ai_lessons: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          examples: string[] | null
          id: string
          module_id: string | null
          order_index: number
          title: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          examples?: string[] | null
          id?: string
          module_id?: string | null
          order_index: number
          title: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          examples?: string[] | null
          id?: string
          module_id?: string | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ai_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index: number
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "ai_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_questions: {
        Row: {
          alternativas: string[]
          created_at: string
          enunciado: string
          explicacao: string | null
          id: string
          module_id: string | null
          resposta_correta: string
        }
        Insert: {
          alternativas: string[]
          created_at?: string
          enunciado: string
          explicacao?: string | null
          id?: string
          module_id?: string | null
          resposta_correta: string
        }
        Update: {
          alternativas?: string[]
          created_at?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          module_id?: string | null
          resposta_correta?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ai_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_quiz_questions: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          comentario: string | null
          created_at: string
          expires_at: string
          generated_at: string
          id: string
          lesson_area: string
          lesson_content: string
          lesson_id: number
          lesson_tema: string
          pergunta: string
          question_order: number
          resposta_correta: string
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          comentario?: string | null
          created_at?: string
          expires_at?: string
          generated_at?: string
          id?: string
          lesson_area: string
          lesson_content: string
          lesson_id: number
          lesson_tema: string
          pergunta: string
          question_order: number
          resposta_correta: string
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          comentario?: string | null
          created_at?: string
          expires_at?: string
          generated_at?: string
          id?: string
          lesson_area?: string
          lesson_content?: string
          lesson_id?: number
          lesson_tema?: string
          pergunta?: string
          question_order?: number
          resposta_correta?: string
        }
        Relationships: []
      }
      api_credentials: {
        Row: {
          api_key_encrypted: string
          base_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          rate_limit_per_minute: number | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          base_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          base_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      APP: {
        Row: {
          capa: string | null
          descricao: string | null
          funcao: string | null
          id: number
          link: string | null
        }
        Insert: {
          capa?: string | null
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Update: {
          capa?: string | null
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Relationships: []
      }
      APP_duplicate: {
        Row: {
          descricao: string | null
          funcao: string | null
          id: number
          link: string | null
        }
        Insert: {
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Update: {
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Relationships: []
      }
      "APP-GRATIS": {
        Row: {
          descricao: string | null
          funcao: string | null
          id: number
          link: string | null
        }
        Insert: {
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Update: {
          descricao?: string | null
          funcao?: string | null
          id?: number
          link?: string | null
        }
        Relationships: []
      }
      "ARITIGOS-COMENTADOS": {
        Row: {
          Area: string | null
          artigo: string | null
          audio: string | null
          capa: string | null
          id: number
          Planalto: string | null
          texto: string | null
        }
        Insert: {
          Area?: string | null
          artigo?: string | null
          audio?: string | null
          capa?: string | null
          id?: number
          Planalto?: string | null
          texto?: string | null
        }
        Update: {
          Area?: string | null
          artigo?: string | null
          audio?: string | null
          capa?: string | null
          id?: number
          Planalto?: string | null
          texto?: string | null
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          ai_response: string
          context: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          context?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          context?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      AUDIOAULAS: {
        Row: {
          area: string | null
          descricao: string | null
          id: number
          imagem_miniatura: string | null
          sequencia: string | null
          tag: string | null
          tema: string | null
          titulo: string | null
          url_audio: string | null
        }
        Insert: {
          area?: string | null
          descricao?: string | null
          id?: number
          imagem_miniatura?: string | null
          sequencia?: string | null
          tag?: string | null
          tema?: string | null
          titulo?: string | null
          url_audio?: string | null
        }
        Update: {
          area?: string | null
          descricao?: string | null
          id?: number
          imagem_miniatura?: string | null
          sequencia?: string | null
          tag?: string | null
          tema?: string | null
          titulo?: string | null
          url_audio?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          query_type: string
          response_data: Json | null
          search_value: string
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          query_type: string
          response_data?: Json | null
          search_value: string
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          query_type?: string
          response_data?: Json | null
          search_value?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      banco_erros: {
        Row: {
          created_at: string | null
          id: string
          motivo: string | null
          questao_id: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          questao_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          questao_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banco_erros_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      "BIBILIOTECA-CONCURSO": {
        Row: {
          Área: string | null
          "Capa-area": string | null
          "Capa-livro": string | null
          "capa-profissao": string | null
          Download: string | null
          id: number
          Link: string | null
          Ordem: string | null
          Profissões: string | null
          "profissões-area": string | null
          Sobre: string | null
          Tema: string | null
        }
        Insert: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          "capa-profissao"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Profissões?: string | null
          "profissões-area"?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Update: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          "capa-profissao"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Profissões?: string | null
          "profissões-area"?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      "BIBILIOTECA-NOVA-490": {
        Row: {
          Área: string | null
          "Capa-area": string | null
          "Capa-livro": string | null
          Download: string | null
          id: number
          Link: string | null
          Ordem: string | null
          Sobre: string | null
          Tema: string | null
        }
        Insert: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Update: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      "BIBILIOTECA-OAB": {
        Row: {
          Área: string | null
          "Capa-area": string | null
          "Capa-livro": string | null
          Download: string | null
          id: number
          Link: string | null
          Ordem: string | null
          Sobre: string | null
          Tema: string | null
        }
        Insert: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Update: {
          Área?: string | null
          "Capa-area"?: string | null
          "Capa-livro"?: string | null
          Download?: string | null
          id?: number
          Link?: string | null
          Ordem?: string | null
          Sobre?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      biblioteca: {
        Row: {
          autor: string | null
          created_at: string | null
          edicao: string | null
          id: string
          pdf_url: string | null
          tags: string[] | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          edicao?: string | null
          id?: string
          pdf_url?: string | null
          tags?: string[] | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          edicao?: string | null
          id?: string
          pdf_url?: string | null
          tags?: string[] | null
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      "BIBLIOTECA-CLASSICOS": {
        Row: {
          area: string | null
          autor: string | null
          beneficios: string | null
          "Capa-area": string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          beneficios?: string | null
          "Capa-area"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          beneficios?: string | null
          "Capa-area"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "BIBLIOTECA-JURIDICA": {
        Row: {
          area: string | null
          "capa-profissao": string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          Profissões: string | null
          "profissões-area": string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          "capa-profissao"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          Profissões?: string | null
          "profissões-area"?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          "capa-profissao"?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          Profissões?: string | null
          "profissões-area"?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "BILBIOTECA-FORA DA TOGA": {
        Row: {
          area: string | null
          autor: string | null
          "capa-area": string | null
          "capa-livro": string | null
          download: string | null
          id: number
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          autor?: string | null
          "capa-area"?: string | null
          "capa-livro"?: string | null
          download?: string | null
          id?: number
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          autor?: string | null
          "capa-area"?: string | null
          "capa-livro"?: string | null
          download?: string | null
          id?: number
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      BLOGER: {
        Row: {
          Área: string | null
          capa: string | null
          id: number
          narração: string | null
          Tema: string | null
          Texto: string | null
        }
        Insert: {
          Área?: string | null
          capa?: string | null
          id?: number
          narração?: string | null
          Tema?: string | null
          Texto?: string | null
        }
        Update: {
          Área?: string | null
          capa?: string | null
          id?: number
          narração?: string | null
          Tema?: string | null
          Texto?: string | null
        }
        Relationships: []
      }
      book_assistant_history: {
        Row: {
          book_id: number | null
          created_at: string
          id: string
          interaction_type: string
          query: string
          response: string
          user_ip: string
        }
        Insert: {
          book_id?: number | null
          created_at?: string
          id?: string
          interaction_type: string
          query: string
          response: string
          user_ip: string
        }
        Update: {
          book_id?: number | null
          created_at?: string
          id?: string
          interaction_type?: string
          query?: string
          response?: string
          user_ip?: string
        }
        Relationships: []
      }
      book_favorites: {
        Row: {
          book_id: number
          created_at: string
          id: string
          user_ip: string
        }
        Insert: {
          book_id: number
          created_at?: string
          id?: string
          user_ip: string
        }
        Update: {
          book_id?: number
          created_at?: string
          id?: string
          user_ip?: string
        }
        Relationships: []
      }
      book_notes: {
        Row: {
          book_id: number
          created_at: string
          id: string
          note_text: string
          user_ip: string
        }
        Insert: {
          book_id: number
          created_at?: string
          id?: string
          note_text: string
          user_ip: string
        }
        Update: {
          book_id?: number
          created_at?: string
          id?: string
          note_text?: string
          user_ip?: string
        }
        Relationships: []
      }
      book_reading_progress: {
        Row: {
          book_id: number
          created_at: string
          id: string
          is_currently_reading: boolean
          last_accessed_at: string
          started_reading_at: string
          user_ip: string
        }
        Insert: {
          book_id: number
          created_at?: string
          id?: string
          is_currently_reading?: boolean
          last_accessed_at?: string
          started_reading_at?: string
          user_ip: string
        }
        Update: {
          book_id?: number
          created_at?: string
          id?: string
          is_currently_reading?: boolean
          last_accessed_at?: string
          started_reading_at?: string
          user_ip?: string
        }
        Relationships: []
      }
      "CA- Código de aguas": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CAPAS-FUNÇÃO": {
        Row: {
          capa: string | null
          Função: string | null
          id: number
        }
        Insert: {
          capa?: string | null
          Função?: string | null
          id?: number
        }
        Update: {
          capa?: string | null
          Função?: string | null
          id?: number
        }
        Relationships: []
      }
      "CBA - Código Brasileiro de Aeronáutica": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CBT - Código Brasileiro de Telecomunicações.": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CC: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CCOM: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CDC: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CDM - Código de Minas": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CE: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CED CÓDIGO DE ETICA - OAB": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CF88: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CLT: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CÓDIGO FLORESTAL": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      codigo_civil: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      codigo_comercial: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_defesa_consumidor: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_eleitoral: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_penal: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_processo_civil: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_processo_penal: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_transito: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      codigo_tributario: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      comment_reports: {
        Row: {
          comment_id: string | null
          id: string
          reason: string
          reported_at: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          comment_id?: string | null
          id?: string
          reason: string
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          comment_id?: string | null
          id?: string
          reason?: string
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_terms_acceptance: {
        Row: {
          accepted_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_best_tip: boolean
          likes: number
          parent_comment_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_best_tip?: boolean
          likes?: number
          parent_comment_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_best_tip?: boolean
          likes?: number
          parent_comment_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          best_tip_id: string | null
          community_type: string
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          likes: number
          tags: string[]
        }
        Insert: {
          author_id: string
          best_tip_id?: string | null
          community_type?: string
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          likes?: number
          tags?: string[]
        }
        Update: {
          author_id?: string
          best_tip_id?: string | null
          community_type?: string
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          likes?: number
          tags?: string[]
        }
        Relationships: []
      }
      consolidacao_leis_trabalho: {
        Row: {
          conteudo: string | null
          created_at: string
          exemplo: string | null
          id: number
          numero: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      constituicao_federal: {
        Row: {
          artigo: string | null
          exemplo: string | null
          "explicacao formal": string | null
          "explicacao tecnica": string | null
          id: number
          numero: string | null
          tipo: string
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          "explicacao formal"?: string | null
          "explicacao tecnica"?: string | null
          id?: number
          numero?: string | null
          tipo?: string
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          "explicacao formal"?: string | null
          "explicacao tecnica"?: string | null
          id?: number
          numero?: string | null
          tipo?: string
        }
        Relationships: []
      }
      conversation_exports: {
        Row: {
          conversation_data: Json
          created_at: string
          expires_at: string
          id: string
          pdf_url: string | null
          user_id: string | null
          user_ip: string
        }
        Insert: {
          conversation_data: Json
          created_at?: string
          expires_at?: string
          id?: string
          pdf_url?: string | null
          user_id?: string | null
          user_ip: string
        }
        Update: {
          conversation_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          pdf_url?: string | null
          user_id?: string | null
          user_ip?: string
        }
        Relationships: []
      }
      CP: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CPC: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CPP: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CPPM - PROCESSO MILITAR": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      cronogramas: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          nome_cronograma: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          nome_cronograma: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          nome_cronograma?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      CTB: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      CTN: {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "CURSO-ARTIGOS-LEIS": {
        Row: {
          analise: string | null
          area: string | null
          artigo: string | null
          "capa-area": string | null
          "capa-artigo": string | null
          id: number
          "link-artigo": string | null
          "texto artigo": string | null
        }
        Insert: {
          analise?: string | null
          area?: string | null
          artigo?: string | null
          "capa-area"?: string | null
          "capa-artigo"?: string | null
          id?: number
          "link-artigo"?: string | null
          "texto artigo"?: string | null
        }
        Update: {
          analise?: string | null
          area?: string | null
          artigo?: string | null
          "capa-area"?: string | null
          "capa-artigo"?: string | null
          id?: number
          "link-artigo"?: string | null
          "texto artigo"?: string | null
        }
        Relationships: []
      }
      "CURSO-ARTIGOS-VIDEO": {
        Row: {
          area: string | null
          artigo: string | null
          "capa-area": string | null
          "capa-artigo": string | null
          id: number
          "link-artigo": string | null
          "texto artigo": string | null
        }
        Insert: {
          area?: string | null
          artigo?: string | null
          "capa-area"?: string | null
          "capa-artigo"?: string | null
          id?: number
          "link-artigo"?: string | null
          "texto artigo"?: string | null
        }
        Update: {
          area?: string | null
          artigo?: string | null
          "capa-area"?: string | null
          "capa-artigo"?: string | null
          id?: number
          "link-artigo"?: string | null
          "texto artigo"?: string | null
        }
        Relationships: []
      }
      "CURSO-FACULDADE": {
        Row: {
          Assunto: string | null
          "capa-assunto": string | null
          "capa-modulo": string | null
          "capa-semestre": string | null
          "capa-tema": string | null
          conteudo: string | null
          id: number
          material: string | null
          modulo: string | null
          "numero-aula": string | null
          semestre: string | null
          Tema: string | null
          video: string | null
        }
        Insert: {
          Assunto?: string | null
          "capa-assunto"?: string | null
          "capa-modulo"?: string | null
          "capa-semestre"?: string | null
          "capa-tema"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          modulo?: string | null
          "numero-aula"?: string | null
          semestre?: string | null
          Tema?: string | null
          video?: string | null
        }
        Update: {
          Assunto?: string | null
          "capa-assunto"?: string | null
          "capa-modulo"?: string | null
          "capa-semestre"?: string | null
          "capa-tema"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          modulo?: string | null
          "numero-aula"?: string | null
          semestre?: string | null
          Tema?: string | null
          video?: string | null
        }
        Relationships: []
      }
      "CURSOS-APP-VIDEO": {
        Row: {
          Area: string | null
          Assunto: string | null
          Aula: string | null
          capa: string | null
          "capa-area": string | null
          "capa-modulo": string | null
          conteudo: string | null
          id: number
          material: string | null
          Modulo: string | null
          Tema: string | null
          video: string | null
        }
        Insert: {
          Area?: string | null
          Assunto?: string | null
          Aula?: string | null
          capa?: string | null
          "capa-area"?: string | null
          "capa-modulo"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          Modulo?: string | null
          Tema?: string | null
          video?: string | null
        }
        Update: {
          Area?: string | null
          Assunto?: string | null
          Aula?: string | null
          capa?: string | null
          "capa-area"?: string | null
          "capa-modulo"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          Modulo?: string | null
          Tema?: string | null
          video?: string | null
        }
        Relationships: []
      }
      custom_decks: {
        Row: {
          areas: string[] | null
          card_count: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          themes: string[] | null
        }
        Insert: {
          areas?: string[] | null
          card_count?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          themes?: string[] | null
        }
        Update: {
          areas?: string[] | null
          card_count?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          themes?: string[] | null
        }
        Relationships: []
      }
      dados_base: {
        Row: {
          coluna_a: string | null
          coluna_b: string | null
          coluna_c: string | null
          coluna_d: string | null
          coluna_e: string | null
          coluna_f_pdf_url: string | null
          coluna_g_pdf_public_url: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          coluna_a?: string | null
          coluna_b?: string | null
          coluna_c?: string | null
          coluna_d?: string | null
          coluna_e?: string | null
          coluna_f_pdf_url?: string | null
          coluna_g_pdf_public_url?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          coluna_a?: string | null
          coluna_b?: string | null
          coluna_c?: string | null
          coluna_d?: string | null
          coluna_e?: string | null
          coluna_f_pdf_url?: string | null
          coluna_g_pdf_public_url?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      deck_flashcards: {
        Row: {
          created_at: string
          deck_id: string | null
          flashcard_id: string
          id: string
        }
        Insert: {
          created_at?: string
          deck_id?: string | null
          flashcard_id: string
          id?: string
        }
        Update: {
          created_at?: string
          deck_id?: string | null
          flashcard_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      default_avatars: {
        Row: {
          created_at: string | null
          gender: string | null
          id: string
          skin_tone: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          gender?: string | null
          id?: string
          skin_tone?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          gender?: string | null
          id?: string
          skin_tone?: string | null
          url?: string
        }
        Relationships: []
      }
      deputados: {
        Row: {
          condicao_eleitoral: string | null
          cpf: string | null
          created_at: string | null
          data_falecimento: string | null
          data_nascimento: string | null
          email: string | null
          escolaridade: string | null
          foto_url: string | null
          gabinete_andar: string | null
          gabinete_email: string | null
          gabinete_nome: string | null
          gabinete_predio: string | null
          gabinete_sala: string | null
          gabinete_telefone: string | null
          id: number
          id_legislatura: number | null
          municipio_nascimento: string | null
          nome: string
          nome_civil: string | null
          partido_nome: string | null
          partido_sigla: string | null
          sexo: string | null
          situacao: string | null
          uf: string
          uf_nascimento: string | null
          updated_at: string | null
        }
        Insert: {
          condicao_eleitoral?: string | null
          cpf?: string | null
          created_at?: string | null
          data_falecimento?: string | null
          data_nascimento?: string | null
          email?: string | null
          escolaridade?: string | null
          foto_url?: string | null
          gabinete_andar?: string | null
          gabinete_email?: string | null
          gabinete_nome?: string | null
          gabinete_predio?: string | null
          gabinete_sala?: string | null
          gabinete_telefone?: string | null
          id: number
          id_legislatura?: number | null
          municipio_nascimento?: string | null
          nome: string
          nome_civil?: string | null
          partido_nome?: string | null
          partido_sigla?: string | null
          sexo?: string | null
          situacao?: string | null
          uf: string
          uf_nascimento?: string | null
          updated_at?: string | null
        }
        Update: {
          condicao_eleitoral?: string | null
          cpf?: string | null
          created_at?: string | null
          data_falecimento?: string | null
          data_nascimento?: string | null
          email?: string | null
          escolaridade?: string | null
          foto_url?: string | null
          gabinete_andar?: string | null
          gabinete_email?: string | null
          gabinete_nome?: string | null
          gabinete_predio?: string | null
          gabinete_sala?: string | null
          gabinete_telefone?: string | null
          id?: number
          id_legislatura?: number | null
          municipio_nascimento?: string | null
          nome?: string
          nome_civil?: string | null
          partido_nome?: string | null
          partido_sigla?: string | null
          sexo?: string | null
          situacao?: string | null
          uf?: string
          uf_nascimento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      direito_administrativo_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_ambiental_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_civil_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_desportivo_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_do_trabalho_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_empresarial_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_financeiro_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_internacional_privado_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_penal_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_previndenciario_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_civil_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_do_trabalho_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_processual_penal_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_tributario_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direito_urbanistico_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      direitos_humanos_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      DOWNLOADS: {
        Row: {
          area: string | null
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          logo: string | null
          "proficao do logo": string | null
          profissao: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          logo?: string | null
          "proficao do logo"?: string | null
          profissao?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          logo?: string | null
          "proficao do logo"?: string | null
          profissao?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - CIDADE": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - DESARMAMENTO": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - ECA": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - IDOSO": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - IGUALDADE RACIAL": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - OAB": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - PESSOA COM DEFICIENCIA": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      "ESTATUTO - TORCEDOR": {
        Row: {
          Artigo: string | null
          id: number
          Narração: string | null
          "Número do Artigo": string | null
        }
        Insert: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Update: {
          Artigo?: string | null
          id?: number
          Narração?: string | null
          "Número do Artigo"?: string | null
        }
        Relationships: []
      }
      estatuto_da_advocacia_e_da_oab: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_cidade: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_crianca_e_do_adolescente: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_igualdade_racial: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_juventude: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_pessoa_com_deficiencia: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_da_terra: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_desarmamento: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_idoso: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_do_torcedor: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      estatuto_dos_servidores_publicos: {
        Row: {
          artigo: string | null
          created_at: string | null
          exemplo: string | null
          explicacao_formal: string | null
          explicacao_tecnica: string | null
          id: number
          numero: string | null
        }
        Insert: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Update: {
          artigo?: string | null
          created_at?: string | null
          exemplo?: string | null
          explicacao_formal?: string | null
          explicacao_tecnica?: string | null
          id?: number
          numero?: string | null
        }
        Relationships: []
      }
      "FLASH-CARDS-FINAL": {
        Row: {
          area: string | null
          exemplo: string | null
          id: number
          pergunta: string | null
          resposta: string | null
          tema: string | null
        }
        Insert: {
          area?: string | null
          exemplo?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Update: {
          area?: string | null
          exemplo?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Relationships: []
      }
      FLASHCARDS: {
        Row: {
          area: string | null
          exemplo: string | null
          id: number
          pergunta: string | null
          resposta: string | null
          tema: string | null
        }
        Insert: {
          area?: string | null
          exemplo?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Update: {
          area?: string | null
          exemplo?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Relationships: []
      }
      flashcards_pro: {
        Row: {
          area: string
          artigos: string
          created_at: string | null
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          tema: string
        }
        Insert: {
          area: string
          artigos: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          tema: string
        }
        Update: {
          area?: string
          artigos?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          tema?: string
        }
        Relationships: []
      }
      formacao_complementar_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      "GALERIA-FOTOS": {
        Row: {
          capa: string | null
          conta: string | null
          id: number
          nome: string | null
        }
        Insert: {
          capa?: string | null
          conta?: string | null
          id?: number
          nome?: string | null
        }
        Update: {
          capa?: string | null
          conta?: string | null
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
      iniciando_em_concursos_publicos_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      INTRO: {
        Row: {
          cards: string | null
          Descrição: string | null
          icone: string | null
          id: number
          Título: string | null
        }
        Insert: {
          cards?: string | null
          Descrição?: string | null
          icone?: string | null
          id?: number
          Título?: string | null
        }
        Update: {
          cards?: string | null
          Descrição?: string | null
          icone?: string | null
          id?: number
          Título?: string | null
        }
        Relationships: []
      }
      juricast: {
        Row: {
          area: string | null
          descricao: string | null
          id: number
          imagem_miniatura: string | null
          tag: string | null
          titulo: string | null
          url_audio: string | null
        }
        Insert: {
          area?: string | null
          descricao?: string | null
          id?: number
          imagem_miniatura?: string | null
          tag?: string | null
          titulo?: string | null
          url_audio?: string | null
        }
        Update: {
          area?: string | null
          descricao?: string | null
          id?: number
          imagem_miniatura?: string | null
          tag?: string | null
          titulo?: string | null
          url_audio?: string | null
        }
        Relationships: []
      }
      JURIFLIX: {
        Row: {
          ano: string | null
          beneficios: string | null
          capa: string | null
          id: number
          link: string | null
          "link Video": string | null
          nome: string | null
          nota: string | null
          plataforma: string | null
          sinopse: string | null
          tipo: string | null
          trailer: string | null
        }
        Insert: {
          ano?: string | null
          beneficios?: string | null
          capa?: string | null
          id?: number
          link?: string | null
          "link Video"?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Update: {
          ano?: string | null
          beneficios?: string | null
          capa?: string | null
          id?: number
          link?: string | null
          "link Video"?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Relationships: []
      }
      law_article_comments: {
        Row: {
          article_number: string
          content: string
          created_at: string | null
          id: string
          law_name: string
          likes: number | null
          tag: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_number: string
          content: string
          created_at?: string | null
          id?: string
          law_name: string
          likes?: number | null
          tag: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_number?: string
          content?: string
          created_at?: string | null
          id?: string
          law_name?: string
          likes?: number | null
          tag?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      law_flashcards: {
        Row: {
          answer: string
          article_content: string
          article_number: string
          created_at: string
          difficulty: string
          id: string
          law_name: string
          question: string
        }
        Insert: {
          answer: string
          article_content: string
          article_number: string
          created_at?: string
          difficulty?: string
          id?: string
          law_name: string
          question: string
        }
        Update: {
          answer?: string
          article_content?: string
          article_number?: string
          created_at?: string
          difficulty?: string
          id?: string
          law_name?: string
          question?: string
        }
        Relationships: []
      }
      law_subject_areas: {
        Row: {
          display_name: string
          icon_name: string | null
          id: string
          table_name: string
        }
        Insert: {
          display_name: string
          icon_name?: string | null
          id: string
          table_name: string
        }
        Update: {
          display_name?: string
          icon_name?: string | null
          id?: string
          table_name?: string
        }
        Relationships: []
      }
      legal_library: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url: string
          publication_date?: string | null
          title: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url?: string
          publication_date?: string | null
          title?: string
        }
        Relationships: []
      }
      legal_movies: {
        Row: {
          average_rating: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          director: string | null
          id: string
          poster_url: string
          rating_count: number | null
          title: string
          tmdb_poster_path: string | null
          year: number
          youtube_trailer_url: string | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          director?: string | null
          id?: string
          poster_url: string
          rating_count?: number | null
          title: string
          tmdb_poster_path?: string | null
          year: number
          youtube_trailer_url?: string | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          director?: string | null
          id?: string
          poster_url?: string
          rating_count?: number | null
          title?: string
          tmdb_poster_path?: string | null
          year?: number
          youtube_trailer_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_movies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "movie_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_news_cache: {
        Row: {
          cached_at: string
          created_at: string
          expires_at: string
          full_content: string | null
          id: string
          image_url: string | null
          news_url: string
          portal: string
          preview: string | null
          published_at: string | null
          title: string
        }
        Insert: {
          cached_at?: string
          created_at?: string
          expires_at?: string
          full_content?: string | null
          id?: string
          image_url?: string | null
          news_url: string
          portal: string
          preview?: string | null
          published_at?: string | null
          title: string
        }
        Update: {
          cached_at?: string
          created_at?: string
          expires_at?: string
          full_content?: string | null
          id?: string
          image_url?: string | null
          news_url?: string
          portal?: string
          preview?: string | null
          published_at?: string | null
          title?: string
        }
        Relationships: []
      }
      lei_penal_especial_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_generated_content: {
        Row: {
          content: Json
          content_type: string
          created_at: string
          expires_at: string
          id: string
          lesson_area: string
          lesson_assunto: string
          lesson_id: number
          lesson_tema: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string
          expires_at?: string
          id?: string
          lesson_area: string
          lesson_assunto: string
          lesson_id: number
          lesson_tema: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          lesson_area?: string
          lesson_assunto?: string
          lesson_id?: number
          lesson_tema?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_pdf_exports: {
        Row: {
          content_type: string
          created_at: string
          expires_at: string
          file_path: string
          id: string
          lesson_area: string
          lesson_id: number
          lesson_title: string
          user_id: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          expires_at?: string
          file_path: string
          id?: string
          lesson_area: string
          lesson_id: number
          lesson_title: string
          user_id?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          expires_at?: string
          file_path?: string
          id?: string
          lesson_area?: string
          lesson_id?: number
          lesson_title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_progress_by_ip: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_position: number
          lesson_id: number
          progress_percent: number
          updated_at: string
          user_ip: string
          watch_time: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_position?: number
          lesson_id: number
          progress_percent?: number
          updated_at?: string
          user_ip: string
          watch_time?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_position?: number
          lesson_id?: number
          progress_percent?: number
          updated_at?: string
          user_ip?: string
          watch_time?: number
        }
        Relationships: []
      }
      "LIVROS-INDICACAO": {
        Row: {
          audio: string | null
          Autor: string | null
          capa: string | null
          Download: string | null
          id: number
          Sobre: string | null
          Titulo: string | null
        }
        Insert: {
          audio?: string | null
          Autor?: string | null
          capa?: string | null
          Download?: string | null
          id?: number
          Sobre?: string | null
          Titulo?: string | null
        }
        Update: {
          audio?: string | null
          Autor?: string | null
          capa?: string | null
          Download?: string | null
          id?: number
          Sobre?: string | null
          Titulo?: string | null
        }
        Relationships: []
      }
      mapas: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          no: string
          parent_id: string | null
          user_id: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          no: string
          parent_id?: string | null
          user_id?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          no?: string
          parent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mapas"
            referencedColumns: ["id"]
          },
        ]
      }
      "MAPAS MENTAIS": {
        Row: {
          Área: string | null
          Conteúdo: string | null
          id: number
          "Ordem Subtema": string | null
          "Ordem Tema": string | null
          Subtema: string | null
          Tema: string | null
        }
        Insert: {
          Área?: string | null
          Conteúdo?: string | null
          id?: number
          "Ordem Subtema"?: string | null
          "Ordem Tema"?: string | null
          Subtema?: string | null
          Tema?: string | null
        }
        Update: {
          Área?: string | null
          Conteúdo?: string | null
          id?: number
          "Ordem Subtema"?: string | null
          "Ordem Tema"?: string | null
          Subtema?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      "MAPAS MENTAIS-FINAL": {
        Row: {
          area: string | null
          id: number
          link: string | null
          mapa: string | null
          Sequencia: string | null
        }
        Insert: {
          area?: string | null
          id?: number
          link?: string | null
          mapa?: string | null
          Sequencia?: string | null
        }
        Update: {
          area?: string | null
          id?: number
          link?: string | null
          mapa?: string | null
          Sequencia?: string | null
        }
        Relationships: []
      }
      movie_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      NETFLIX: {
        Row: {
          ano: number | null
          beneficios: string | null
          capa: string | null
          link: string | null
          "link Video": string | null
          nome: string | null
          nota: string | null
          plataforma: string | null
          sinopse: string | null
          tipo: string | null
          trailer: string | null
        }
        Insert: {
          ano?: number | null
          beneficios?: string | null
          capa?: string | null
          link?: string | null
          "link Video"?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Update: {
          ano?: number | null
          beneficios?: string | null
          capa?: string | null
          link?: string | null
          "link Video"?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Relationships: []
      }
      note_files: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_approved: boolean | null
          note_id: string
          updated_at: string | null
          upload_date: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_approved?: boolean | null
          note_id: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_approved?: boolean | null
          note_id?: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Relationships: []
      }
      "NOTICIAS JURIDICAS": {
        Row: {
          link: string | null
          logo: string | null
          portal: string | null
        }
        Insert: {
          link?: string | null
          logo?: string | null
          portal?: string | null
        }
        Update: {
          link?: string | null
          logo?: string | null
          portal?: string | null
        }
        Relationships: []
      }
      "NOTICIAS-AUDIO": {
        Row: {
          audio: string | null
          capa: string | null
          data: string | null
          fonte: string | null
          id: number
          portal: string | null
          "Resumo breve": string | null
          Titulo: string | null
        }
        Insert: {
          audio?: string | null
          capa?: string | null
          data?: string | null
          fonte?: string | null
          id?: number
          portal?: string | null
          "Resumo breve"?: string | null
          Titulo?: string | null
        }
        Update: {
          audio?: string | null
          capa?: string | null
          data?: string | null
          fonte?: string | null
          id?: number
          portal?: string | null
          "Resumo breve"?: string | null
          Titulo?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          from_user_id: string | null
          id: string
          read: boolean | null
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          read?: boolean | null
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      "OAB -EXAME": {
        Row: {
          "Alternativa A": string | null
          "Alternativa B": string | null
          "Alternativa C": string | null
          "Alternativa D": string | null
          Ano: string | null
          area: string | null
          Banca: string | null
          comentario: string | null
          Enunciado: string | null
          Exame: string | null
          id: number
          "Número da questão": number | null
          resposta: string | null
        }
        Insert: {
          "Alternativa A"?: string | null
          "Alternativa B"?: string | null
          "Alternativa C"?: string | null
          "Alternativa D"?: string | null
          Ano?: string | null
          area?: string | null
          Banca?: string | null
          comentario?: string | null
          Enunciado?: string | null
          Exame?: string | null
          id?: number
          "Número da questão"?: number | null
          resposta?: string | null
        }
        Update: {
          "Alternativa A"?: string | null
          "Alternativa B"?: string | null
          "Alternativa C"?: string | null
          "Alternativa D"?: string | null
          Ano?: string | null
          area?: string | null
          Banca?: string | null
          comentario?: string | null
          Enunciado?: string | null
          Exame?: string | null
          id?: number
          "Número da questão"?: number | null
          resposta?: string | null
        }
        Relationships: []
      }
      orientacoes_bancada: {
        Row: {
          created_at: string | null
          id: string
          orientacao: string
          partido_sigla: string
          votacao_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          orientacao: string
          partido_sigla: string
          votacao_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          orientacao?: string
          partido_sigla?: string
          votacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orientacoes_bancada_votacao_id_fkey"
            columns: ["votacao_id"]
            isOneToOne: false
            referencedRelation: "votacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          mp_payment_id: string | null
          paid_at: string | null
          payment_id: string
          provider: string
          raw: Json | null
          source: string | null
          status: string
          updated_at: string | null
          user_id: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          mp_payment_id?: string | null
          paid_at?: string | null
          payment_id: string
          provider?: string
          raw?: Json | null
          source?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          mp_payment_id?: string | null
          paid_at?: string | null
          payment_id?: string
          provider?: string
          raw?: Json | null
          source?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      pdf_questions: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          comentario: string | null
          created_at: string
          id: string
          pdf_name: string
          pergunta: string
          resposta_correta: string
          tema: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          comentario?: string | null
          created_at?: string
          id?: string
          pdf_name: string
          pergunta: string
          resposta_correta: string
          tema: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          comentario?: string | null
          created_at?: string
          id?: string
          pdf_name?: string
          pergunta?: string
          resposta_correta?: string
          tema?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      perfis: {
        Row: {
          configuracoes: Json | null
          created_at: string | null
          email: string
          foto_perfil_url: string | null
          id: string
          nivel: number | null
          nome_completo: string
          progresso_estudo: number | null
          telefone: string | null
          tipo_usuario: string | null
          updated_at: string | null
        }
        Insert: {
          configuracoes?: Json | null
          created_at?: string | null
          email: string
          foto_perfil_url?: string | null
          id: string
          nivel?: number | null
          nome_completo: string
          progresso_estudo?: number | null
          telefone?: string | null
          tipo_usuario?: string | null
          updated_at?: string | null
        }
        Update: {
          configuracoes?: Json | null
          created_at?: string | null
          email?: string
          foto_perfil_url?: string | null
          id?: string
          nivel?: number | null
          nome_completo?: string
          progresso_estudo?: number | null
          telefone?: string | null
          tipo_usuario?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      peticoes: {
        Row: {
          area: string | null
          id: number
          link: string | null
          total: string | null
        }
        Insert: {
          area?: string | null
          id?: number
          link?: string | null
          total?: string | null
        }
        Update: {
          area?: string | null
          id?: number
          link?: string | null
          total?: string | null
        }
        Relationships: []
      }
      PETIÇÕES: {
        Row: {
          id: number
          Link: string | null
          Petições: string | null
        }
        Insert: {
          id?: number
          Link?: string | null
          Petições?: string | null
        }
        Update: {
          id?: number
          Link?: string | null
          Petições?: string | null
        }
        Relationships: []
      }
      phone_recovery_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      playlists: {
        Row: {
          created_at: string | null
          descricao: string | null
          disciplina: string
          id: string
          youtube_playlist_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          disciplina: string
          id?: string
          youtube_playlist_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          disciplina?: string
          id?: string
          youtube_playlist_id?: string
        }
        Relationships: []
      }
      politicas_publicas_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      portugues_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      pratica_profissional_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          id: number
          produtos: string | null
        }
        Insert: {
          id?: number
          produtos?: string | null
        }
        Update: {
          id?: number
          produtos?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
          avatar_url: string | null
          correct_answers: number | null
          created_at: string | null
          flashcards_completed: number | null
          full_name: string | null
          id: string
          last_active: string | null
          name: string | null
          streak_days: number | null
          total_answers: number | null
        }
        Insert: {
          area?: string | null
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          flashcards_completed?: number | null
          full_name?: string | null
          id: string
          last_active?: string | null
          name?: string | null
          streak_days?: number | null
          total_answers?: number | null
        }
        Update: {
          area?: string | null
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          flashcards_completed?: number | null
          full_name?: string | null
          id?: string
          last_active?: string | null
          name?: string | null
          streak_days?: number | null
          total_answers?: number | null
        }
        Relationships: []
      }
      proposicoes: {
        Row: {
          ano: number
          apresentacao: string | null
          autor_id: number | null
          autor_nome: string | null
          autor_tipo: string | null
          casa_origem: string | null
          created_at: string | null
          ementa: string | null
          id: number
          keywords: string[] | null
          numero: number
          situacao: string | null
          tema: string | null
          tipo: string
          tramitacao_data: string | null
          tramitacao_situacao: string | null
          updated_at: string | null
          url_inteiro_teor: string | null
        }
        Insert: {
          ano: number
          apresentacao?: string | null
          autor_id?: number | null
          autor_nome?: string | null
          autor_tipo?: string | null
          casa_origem?: string | null
          created_at?: string | null
          ementa?: string | null
          id: number
          keywords?: string[] | null
          numero: number
          situacao?: string | null
          tema?: string | null
          tipo: string
          tramitacao_data?: string | null
          tramitacao_situacao?: string | null
          updated_at?: string | null
          url_inteiro_teor?: string | null
        }
        Update: {
          ano?: number
          apresentacao?: string | null
          autor_id?: number | null
          autor_nome?: string | null
          autor_tipo?: string | null
          casa_origem?: string | null
          created_at?: string | null
          ementa?: string | null
          id?: number
          keywords?: string[] | null
          numero?: number
          situacao?: string | null
          tema?: string | null
          tipo?: string
          tramitacao_data?: string | null
          tramitacao_situacao?: string | null
          updated_at?: string | null
          url_inteiro_teor?: string | null
        }
        Relationships: []
      }
      questoes: {
        Row: {
          banca: string
          created_at: string | null
          disciplina: string
          explicacao: string | null
          id: string
          opcoes: string[]
          pergunta: string
          resposta_correta: string
        }
        Insert: {
          banca: string
          created_at?: string | null
          disciplina: string
          explicacao?: string | null
          id?: string
          opcoes: string[]
          pergunta: string
          resposta_correta: string
        }
        Update: {
          banca?: string
          created_at?: string | null
          disciplina?: string
          explicacao?: string | null
          id?: string
          opcoes?: string[]
          pergunta?: string
          resposta_correta?: string
        }
        Relationships: []
      }
      "QUESTÕES-CURSO": {
        Row: {
          "Alternativa A": string | null
          "Alternativa B": string | null
          "Alternativa C": string | null
          "Alternativa D": string | null
          area: string | null
          aula: string | null
          Comentário: string | null
          id: number
          Pergunta: string | null
          "Resposta Correta": string | null
        }
        Insert: {
          "Alternativa A"?: string | null
          "Alternativa B"?: string | null
          "Alternativa C"?: string | null
          "Alternativa D"?: string | null
          area?: string | null
          aula?: string | null
          Comentário?: string | null
          id?: number
          Pergunta?: string | null
          "Resposta Correta"?: string | null
        }
        Update: {
          "Alternativa A"?: string | null
          "Alternativa B"?: string | null
          "Alternativa C"?: string | null
          "Alternativa D"?: string | null
          area?: string | null
          aula?: string | null
          Comentário?: string | null
          id?: number
          Pergunta?: string | null
          "Resposta Correta"?: string | null
        }
        Relationships: []
      }
      reading_plan: {
        Row: {
          added_at: string
          book_id: number
          completed_at: string | null
          id: string
          is_completed: boolean
          order_position: number
          user_id: string
        }
        Insert: {
          added_at?: string
          book_id: number
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          order_position: number
          user_id: string
        }
        Update: {
          added_at?: string
          book_id?: number
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          order_position?: number
          user_id?: string
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          book_author: string | null
          book_id: number | null
          book_image: string | null
          book_title: string
          created_at: string
          id: string
          notes: string | null
          priority: string
          progress_percentage: number | null
          status: string
          target_date: string | null
          updated_at: string
          user_ip: string
        }
        Insert: {
          book_author?: string | null
          book_id?: number | null
          book_image?: string | null
          book_title: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_ip: string
        }
        Update: {
          book_author?: string | null
          book_id?: number | null
          book_image?: string | null
          book_title?: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_ip?: string
        }
        Relationships: []
      }
      redacao_analises: {
        Row: {
          analise: Json
          analise_tecnica: Json | null
          arquivo_id: string | null
          created_at: string | null
          id: string
          nota: number | null
          texto_original: string
          tipo_redacao: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analise: Json
          analise_tecnica?: Json | null
          arquivo_id?: string | null
          created_at?: string | null
          id?: string
          nota?: number | null
          texto_original: string
          tipo_redacao: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analise?: Json
          analise_tecnica?: Json | null
          arquivo_id?: string | null
          created_at?: string | null
          id?: string
          nota?: number | null
          texto_original?: string
          tipo_redacao?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redacao_analises_arquivo_id_fkey"
            columns: ["arquivo_id"]
            isOneToOne: false
            referencedRelation: "redacao_arquivos"
            referencedColumns: ["id"]
          },
        ]
      }
      redacao_arquivos: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          status_processamento: string | null
          tamanho_arquivo: number | null
          texto_extraido: string | null
          tipo_arquivo: string
          updated_at: string
          url_arquivo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          status_processamento?: string | null
          tamanho_arquivo?: number | null
          texto_extraido?: string | null
          tipo_arquivo: string
          updated_at?: string
          url_arquivo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          status_processamento?: string | null
          tamanho_arquivo?: number | null
          texto_extraido?: string | null
          tipo_arquivo?: string
          updated_at?: string
          url_arquivo?: string
          user_id?: string
        }
        Relationships: []
      }
      redacao_historico: {
        Row: {
          analise: Json
          arquivo_url: string | null
          created_at: string
          id: string
          nome_arquivo: string | null
          nota: string | null
          pontos_fortes: string[] | null
          pontos_melhoria: string[] | null
          texto_original: string
          tipo_redacao: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analise: Json
          arquivo_url?: string | null
          created_at?: string
          id?: string
          nome_arquivo?: string | null
          nota?: string | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          texto_original: string
          tipo_redacao: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analise?: Json
          arquivo_url?: string | null
          created_at?: string
          id?: string
          nome_arquivo?: string | null
          nota?: string | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          texto_original?: string
          tipo_redacao?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumos: {
        Row: {
          created_at: string | null
          id: string
          ramo: string
          texto_resumo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ramo: string
          texto_resumo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ramo?: string
          texto_resumo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      "RESUMOS-NOVOS": {
        Row: {
          Área: string | null
          Conteúdo: string | null
          id: number
          "Ordem Subtema": string | null
          "Ordem Tema": string | null
          "Resumo Compacto": string | null
          "Resumo detalhado": string | null
          "Resumo Storytelling": string | null
          Subtema: string | null
          Tema: string | null
        }
        Insert: {
          Área?: string | null
          Conteúdo?: string | null
          id?: number
          "Ordem Subtema"?: string | null
          "Ordem Tema"?: string | null
          "Resumo Compacto"?: string | null
          "Resumo detalhado"?: string | null
          "Resumo Storytelling"?: string | null
          Subtema?: string | null
          Tema?: string | null
        }
        Update: {
          Área?: string | null
          Conteúdo?: string | null
          id?: number
          "Ordem Subtema"?: string | null
          "Ordem Tema"?: string | null
          "Resumo Compacto"?: string | null
          "Resumo detalhado"?: string | null
          "Resumo Storytelling"?: string | null
          Subtema?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      senadores: {
        Row: {
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          foto_url: string | null
          gabinete_email: string | null
          gabinete_telefone: string | null
          id: number
          mandato: string | null
          municipio_nascimento: string | null
          nome: string
          nome_completo: string | null
          partido_nome: string | null
          partido_sigla: string | null
          sexo: string | null
          situacao: string | null
          uf: string
          uf_nascimento: string | null
          updated_at: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          gabinete_email?: string | null
          gabinete_telefone?: string | null
          id: number
          mandato?: string | null
          municipio_nascimento?: string | null
          nome: string
          nome_completo?: string | null
          partido_nome?: string | null
          partido_sigla?: string | null
          sexo?: string | null
          situacao?: string | null
          uf: string
          uf_nascimento?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          gabinete_email?: string | null
          gabinete_telefone?: string | null
          id?: number
          mandato?: string | null
          municipio_nascimento?: string | null
          nome?: string
          nome_completo?: string | null
          partido_nome?: string | null
          partido_sigla?: string | null
          sexo?: string | null
          situacao?: string | null
          uf?: string
          uf_nascimento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      simulado_questoes: {
        Row: {
          acertou: boolean | null
          created_at: string | null
          id: string
          questao_id: string | null
          resposta_usuario: string | null
          simulado_id: string | null
          tempo_resposta: number | null
        }
        Insert: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id?: string | null
          resposta_usuario?: string | null
          simulado_id?: string | null
          tempo_resposta?: number | null
        }
        Update: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id?: string | null
          resposta_usuario?: string | null
          simulado_id?: string | null
          tempo_resposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulado_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_questoes_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          pontuacao_total: number | null
          status: string | null
          tempo_total: number | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao_total?: number | null
          status?: string | null
          tempo_total?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao_total?: number | null
          status?: string | null
          tempo_total?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      "SOM AMBIENTE": {
        Row: {
          id: number
          link: string | null
          numero: string | null
        }
        Insert: {
          id?: number
          link?: string | null
          numero?: string | null
        }
        Update: {
          id?: number
          link?: string | null
          numero?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_trial_active: boolean
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_trial_active?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_trial_active?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string
          data: Json
          error: string | null
          id: string
          status: string
          stripe_event_id: string
          type: string
          user_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          error?: string | null
          id?: string
          status?: string
          stripe_event_id: string
          type: string
          user_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          error?: string | null
          id?: string
          status?: string
          stripe_event_id?: string
          type?: string
          user_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_popular: boolean | null
          name: string
          price: number
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval: string
          is_popular?: boolean | null
          name: string
          price: number
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      SUMULAS: {
        Row: {
          "Data de Aprovação": string | null
          id: number
          Narração: string | null
          "Texto da Súmula": string | null
          "Título da Súmula": string | null
        }
        Insert: {
          "Data de Aprovação"?: string | null
          id?: number
          Narração?: string | null
          "Texto da Súmula"?: string | null
          "Título da Súmula"?: string | null
        }
        Update: {
          "Data de Aprovação"?: string | null
          id?: number
          Narração?: string | null
          "Texto da Súmula"?: string | null
          "Título da Súmula"?: string | null
        }
        Relationships: []
      }
      "SUMULAS VINCULANTES": {
        Row: {
          "Data de Aprovação": string | null
          id: number
          Narração: string | null
          "Texto da Súmula": string | null
          "Título da Súmula": string | null
        }
        Insert: {
          "Data de Aprovação"?: string | null
          id?: number
          Narração?: string | null
          "Texto da Súmula"?: string | null
          "Título da Súmula"?: string | null
        }
        Update: {
          "Data de Aprovação"?: string | null
          id?: number
          Narração?: string | null
          "Texto da Súmula"?: string | null
          "Título da Súmula"?: string | null
        }
        Relationships: []
      }
      suporte_requests: {
        Row: {
          assunto: string
          created_at: string
          data_envio: string
          descricao: string
          email: string
          id: string
          imagem_url: string | null
          nome: string
          status: string
        }
        Insert: {
          assunto: string
          created_at?: string
          data_envio?: string
          descricao: string
          email: string
          id?: string
          imagem_url?: string | null
          nome: string
          status?: string
        }
        Update: {
          assunto?: string
          created_at?: string
          data_envio?: string
          descricao?: string
          email?: string
          id?: string
          imagem_url?: string | null
          nome?: string
          status?: string
        }
        Relationships: []
      }
      tarefas_cronograma: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          cronograma_id: string | null
          data: string
          descricao: string
          id: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          cronograma_id?: string | null
          data: string
          descricao: string
          id?: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          cronograma_id?: string | null
          data?: string
          descricao?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cronograma_cronograma_id_fkey"
            columns: ["cronograma_id"]
            isOneToOne: false
            referencedRelation: "cronogramas"
            referencedColumns: ["id"]
          },
        ]
      }
      teoria_e_filosofia_do_direito_flashcards: {
        Row: {
          created_at: string
          explicacao: string | null
          id: string
          pergunta: string
          resposta: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta: string
          resposta: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explicacao?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      termos_dicionario: {
        Row: {
          area: string | null
          created_at: string
          exemplo: string | null
          id: number
          significado: string | null
          termo: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          significado?: string | null
          termo?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          exemplo?: string | null
          id?: number
          significado?: string | null
          termo?: string | null
        }
        Relationships: []
      }
      TIKTOKLIVROS: {
        Row: {
          id: number
          link: string | null
          livro: string | null
        }
        Insert: {
          id?: number
          link?: string | null
          livro?: string | null
        }
        Update: {
          id?: number
          link?: string | null
          livro?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          id?: string
          points_awarded: number
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          admin_id: string | null
          banned_at: string | null
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          banned_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          banned_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_book_notes: {
        Row: {
          book_id: number
          created_at: string
          id: string
          note_text: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          book_id: number
          created_at?: string
          id?: string
          note_text: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          book_id?: number
          created_at?: string
          id?: string
          note_text?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          article_content: string
          article_number: string
          created_at: string
          example: string | null
          id: string
          law_name: string
          user_id: string
        }
        Insert: {
          article_content: string
          article_number: string
          created_at?: string
          example?: string | null
          id?: string
          law_name: string
          user_id: string
        }
        Update: {
          article_content?: string
          article_number?: string
          created_at?: string
          example?: string | null
          id?: string
          law_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_flashcard_progress: {
        Row: {
          correct_count: number | null
          created_at: string
          flashcard_id: string
          id: string
          last_viewed: string | null
          proficiency_level: number | null
          streak: number | null
          theme: string | null
          user_id: string
          viewed_count: number | null
        }
        Insert: {
          correct_count?: number | null
          created_at?: string
          flashcard_id: string
          id?: string
          last_viewed?: string | null
          proficiency_level?: number | null
          streak?: number | null
          theme?: string | null
          user_id: string
          viewed_count?: number | null
        }
        Update: {
          correct_count?: number | null
          created_at?: string
          flashcard_id?: string
          id?: string
          last_viewed?: string | null
          proficiency_level?: number | null
          streak?: number | null
          theme?: string | null
          user_id?: string
          viewed_count?: number | null
        }
        Relationships: []
      }
      user_news_last_check: {
        Row: {
          created_at: string | null
          id: string
          last_check_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_check_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_check_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_news_read: {
        Row: {
          created_at: string
          id: string
          news_id: number
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          news_id: number
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          news_id?: number
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          article_number: string
          content: string
          created_at: string
          id: string
          law_name: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_number: string
          content: string
          created_at?: string
          id?: string
          law_name: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_number?: string
          content?: string
          created_at?: string
          id?: string
          law_name?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_parliamentary_favorites: {
        Row: {
          created_at: string | null
          deputado_id: number | null
          id: string
          proposicao_id: number | null
          senador_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deputado_id?: number | null
          id?: string
          proposicao_id?: number | null
          senador_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deputado_id?: number | null
          id?: string
          proposicao_id?: number | null
          senador_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_parliamentary_favorites_deputado_id_fkey"
            columns: ["deputado_id"]
            isOneToOne: false
            referencedRelation: "deputados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_parliamentary_favorites_proposicao_id_fkey"
            columns: ["proposicao_id"]
            isOneToOne: false
            referencedRelation: "proposicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_parliamentary_favorites_senador_id_fkey"
            columns: ["senador_id"]
            isOneToOne: false
            referencedRelation: "senadores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_points: number | null
          avatar_url: string | null
          created_at: string
          default_avatar_id: string | null
          full_name: string | null
          id: string
          points: number | null
          rank_score: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          activity_points?: number | null
          avatar_url?: string | null
          created_at?: string
          default_avatar_id?: string | null
          full_name?: string | null
          id: string
          points?: number | null
          rank_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          activity_points?: number | null
          avatar_url?: string | null
          created_at?: string
          default_avatar_id?: string | null
          full_name?: string | null
          id?: string
          points?: number | null
          rank_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_default_avatar_id_fkey"
            columns: ["default_avatar_id"]
            isOneToOne: false
            referencedRelation: "default_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          duration: number | null
          id: string
          login_time: string | null
          logout_time: string | null
          user_id: string | null
        }
        Insert: {
          duration?: number | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          user_id?: string | null
        }
        Update: {
          duration?: number | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          profile_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          profile_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          action_type: string
          article_number: string | null
          created_at: string
          id: string
          law_name: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          article_number?: string | null
          created_at?: string
          id?: string
          law_name?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          article_number?: string | null
          created_at?: string
          id?: string
          law_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          flashcards_correct: number | null
          flashcards_viewed: number | null
          id: string
          started_at: string
          theme: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flashcards_correct?: number | null
          flashcards_viewed?: number | null
          id?: string
          started_at?: string
          theme?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flashcards_correct?: number | null
          flashcards_viewed?: number | null
          id?: string
          started_at?: string
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_task_lists: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          concluida: boolean
          created_at: string
          data_vencimento: string | null
          descricao: string | null
          id: string
          list_id: string
          prioridade: string
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          list_id: string
          prioridade?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          list_id?: string
          prioridade?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_theme_preferences: {
        Row: {
          created_at: string
          font_size: number | null
          id: string
          order_mode: string | null
          selected_themes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_size?: number | null
          id?: string
          order_mode?: string | null
          selected_themes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_size?: number | null
          id?: string
          order_mode?: string | null
          selected_themes?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_weekly_rankings: {
        Row: {
          id: string
          updated_at: string | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
      vade_mecum_flashcards: {
        Row: {
          article_content: string
          article_number: string
          code_name: string
          created_at: string
          dica: string | null
          id: string
          pergunta: string
          resposta: string
          user_id: string | null
        }
        Insert: {
          article_content: string
          article_number: string
          code_name: string
          created_at?: string
          dica?: string | null
          id?: string
          pergunta: string
          resposta: string
          user_id?: string | null
        }
        Update: {
          article_content?: string
          article_number?: string
          code_name?: string
          created_at?: string
          dica?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vade_mecum_questoes: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          article_content: string
          article_number: string
          code_name: string
          created_at: string
          explicacao: string | null
          id: string
          questao: string
          resposta_correta: string
          user_id: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          article_content: string
          article_number: string
          code_name: string
          created_at?: string
          explicacao?: string | null
          id?: string
          questao: string
          resposta_correta: string
          user_id?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          article_content?: string
          article_number?: string
          code_name?: string
          created_at?: string
          explicacao?: string | null
          id?: string
          questao?: string
          resposta_correta?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vender_oratoria: {
        Row: {
          capa: string
          created_at: string
          id: string
          livro: string
          ordem: number
          resumo: string
          updated_at: string
        }
        Insert: {
          capa: string
          created_at?: string
          id?: string
          livro: string
          ordem?: number
          resumo: string
          updated_at?: string
        }
        Update: {
          capa?: string
          created_at?: string
          id?: string
          livro?: string
          ordem?: number
          resumo?: string
          updated_at?: string
        }
        Relationships: []
      }
      "VENDER-ORATORIA": {
        Row: {
          audio: string | null
          capa: string | null
          id: number
          livro: string | null
          resumo: string | null
        }
        Insert: {
          audio?: string | null
          capa?: string | null
          id?: number
          livro?: string | null
          resumo?: string | null
        }
        Update: {
          audio?: string | null
          capa?: string | null
          id?: number
          livro?: string | null
          resumo?: string | null
        }
        Relationships: []
      }
      "VIDEO-AULAS-DIAS": {
        Row: {
          Area: string | null
          Assunto: string | null
          Aula: string | null
          capa: string | null
          "capa-area": string | null
          "capa-modulo": string | null
          conteudo: string | null
          id: number
          material: string | null
          Modulo: string | null
          Tema: string | null
          video: string | null
        }
        Insert: {
          Area?: string | null
          Assunto?: string | null
          Aula?: string | null
          capa?: string | null
          "capa-area"?: string | null
          "capa-modulo"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          Modulo?: string | null
          Tema?: string | null
          video?: string | null
        }
        Update: {
          Area?: string | null
          Assunto?: string | null
          Aula?: string | null
          capa?: string | null
          "capa-area"?: string | null
          "capa-modulo"?: string | null
          conteudo?: string | null
          id?: number
          material?: string | null
          Modulo?: string | null
          Tema?: string | null
          video?: string | null
        }
        Relationships: []
      }
      "video-aulas-youtube": {
        Row: {
          id: number
          Link: string | null
          Título: string | null
        }
        Insert: {
          id?: number
          Link?: string | null
          Título?: string | null
        }
        Update: {
          id?: number
          Link?: string | null
          Título?: string | null
        }
        Relationships: []
      }
      VIDEOS: {
        Row: {
          area: string | null
          "capa-categoria": string | null
          categoria: string | null
          id: number
          link: string | null
        }
        Insert: {
          area?: string | null
          "capa-categoria"?: string | null
          categoria?: string | null
          id?: number
          link?: string | null
        }
        Update: {
          area?: string | null
          "capa-categoria"?: string | null
          categoria?: string | null
          id?: number
          link?: string | null
        }
        Relationships: []
      }
      votacoes: {
        Row: {
          aprovacao: boolean | null
          created_at: string | null
          data_hora: string | null
          descricao: string | null
          id: string
          proposicao_id: number | null
          sigla_orgao: string | null
          ultima_apresentacao_proposicao: string | null
          updated_at: string | null
          uri_orgao: string | null
        }
        Insert: {
          aprovacao?: boolean | null
          created_at?: string | null
          data_hora?: string | null
          descricao?: string | null
          id: string
          proposicao_id?: number | null
          sigla_orgao?: string | null
          ultima_apresentacao_proposicao?: string | null
          updated_at?: string | null
          uri_orgao?: string | null
        }
        Update: {
          aprovacao?: boolean | null
          created_at?: string | null
          data_hora?: string | null
          descricao?: string | null
          id?: string
          proposicao_id?: number | null
          sigla_orgao?: string | null
          ultima_apresentacao_proposicao?: string | null
          updated_at?: string | null
          uri_orgao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votacoes_proposicao_id_fkey"
            columns: ["proposicao_id"]
            isOneToOne: false
            referencedRelation: "proposicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      votos: {
        Row: {
          created_at: string | null
          deputado_id: number | null
          id: string
          senador_id: number | null
          votacao_id: string | null
          voto: string
        }
        Insert: {
          created_at?: string | null
          deputado_id?: number | null
          id?: string
          senador_id?: number | null
          votacao_id?: string | null
          voto: string
        }
        Update: {
          created_at?: string | null
          deputado_id?: number | null
          id?: string
          senador_id?: number | null
          votacao_id?: string | null
          voto?: string
        }
        Relationships: [
          {
            foreignKeyName: "votos_deputado_id_fkey"
            columns: ["deputado_id"]
            isOneToOne: false
            referencedRelation: "deputados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_senador_id_fkey"
            columns: ["senador_id"]
            isOneToOne: false
            referencedRelation: "senadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_votacao_id_fkey"
            columns: ["votacao_id"]
            isOneToOne: false
            referencedRelation: "votacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_activities: {
        Row: {
          activity_type: string
          contact_id: string | null
          created_at: string | null
          description: string
          id: string
        }
        Insert: {
          activity_type: string
          contact_id?: string | null
          created_at?: string | null
          description: string
          id?: string
        }
        Update: {
          activity_type?: string
          contact_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          auto_reply: boolean | null
          created_at: string | null
          custom_prompt: string | null
          gemini_api_key: string | null
          id: string
          response_delay: number | null
          updated_at: string | null
          user_id: string | null
          whatsapp_phone_id: string | null
          whatsapp_token: string | null
          whatsapp_webhook_url: string | null
        }
        Insert: {
          auto_reply?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          gemini_api_key?: string | null
          id?: string
          response_delay?: number | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone_id?: string | null
          whatsapp_token?: string | null
          whatsapp_webhook_url?: string | null
        }
        Update: {
          auto_reply?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          gemini_api_key?: string | null
          id?: string
          response_delay?: number | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_phone_id?: string | null
          whatsapp_token?: string | null
          whatsapp_webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          phone_number: string
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          phone_number: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          phone_number?: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: Json | null
          created_at: string
          from_jid: string
          id: string
          is_ai_response: boolean
          message_id: string
          message_type: string
          response_time_ms: number | null
          session_id: string
          to_jid: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          from_jid: string
          id?: string
          is_ai_response?: boolean
          message_id: string
          message_type: string
          response_time_ms?: number | null
          session_id: string
          to_jid?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          from_jid?: string
          id?: string
          is_ai_response?: boolean
          message_id?: string
          message_type?: string
          response_time_ms?: number | null
          session_id?: string
          to_jid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      whatsapp_metrics: {
        Row: {
          active_contacts: number | null
          ai_responses: number | null
          avg_response_time_ms: number | null
          created_at: string | null
          date: string
          id: string
          response_rate: number | null
          satisfaction_score: number | null
          total_messages: number | null
          updated_at: string | null
        }
        Insert: {
          active_contacts?: number | null
          ai_responses?: number | null
          avg_response_time_ms?: number | null
          created_at?: string | null
          date?: string
          id?: string
          response_rate?: number | null
          satisfaction_score?: number | null
          total_messages?: number | null
          updated_at?: string | null
        }
        Update: {
          active_contacts?: number | null
          ai_responses?: number | null
          avg_response_time_ms?: number | null
          created_at?: string | null
          date?: string
          id?: string
          response_rate?: number | null
          satisfaction_score?: number | null
          total_messages?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          auth_state: Json | null
          connected_at: string | null
          phone_number: string | null
          qr_code: string | null
          session_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          auth_state?: Json | null
          connected_at?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          auth_state?: Json | null
          connected_at?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_rankings: {
        Row: {
          activity_points: number | null
          full_name: string | null
          global_rank: number | null
          id: string | null
          rank_score: number | null
          total_points: number | null
        }
        Relationships: []
      }
      user_weekly_activity: {
        Row: {
          action_count: number | null
          activity_day: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_achievement: {
        Args: {
          p_achievement_type: string
          p_points: number
          p_user_id: string
        }
        Returns: undefined
      }
      check_email_exists: {
        Args: { email_input: string }
        Returns: boolean
      }
      check_if_user_is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_table_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_rls: boolean
          table_name: string
        }[]
      }
      check_user_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_expired_ai_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_conversation_exports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_legal_news: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_lesson_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_recovery_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_temp_pdfs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fetch_all_legal_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }[]
      }
      fetch_artigos_leis: {
        Args: Record<PropertyKey, never>
        Returns: {
          analise: string
          area: string
          artigo: string
          capa_area: string
          capa_artigo: string
          id: number
          link_artigo: string
          texto_artigo: string
        }[]
      }
      fetch_legal_document_by_id: {
        Args: { document_id: string }
        Returns: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          publication_date: string | null
          title: string
        }[]
      }
      get_fresh_legal_news: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          image_url: string
          news_url: string
          portal: string
          preview: string
          published_at: string
          title: string
        }[]
      }
      get_lesson_questions: {
        Args: { lesson_aula: string }
        Returns: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          aula: string
          id: number
          pergunta: string
          resposta: string
        }[]
      }
      get_mapas_mentais_areas: {
        Args: Record<PropertyKey, never>
        Returns: {
          area: string
        }[]
      }
      get_mapas_mentais_subtemas: {
        Args: { area_param: string; tema_param: string }
        Returns: {
          area: string
          conteudo: string
          id: number
          ordem_subtema: string
          ordem_tema: string
          subtema: string
          tema: string
        }[]
      }
      get_mapas_mentais_temas: {
        Args: { area_param: string }
        Returns: {
          ordem_tema: string
          tema: string
        }[]
      }
      get_truly_new_news_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_unique_themes: {
        Args: { table_name: string }
        Returns: {
          tema: string
        }[]
      }
      get_unread_news_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_type: string; details: Json }
        Returns: string
      }
      mark_news_as_read: {
        Args: { news_uuid: string; user_uuid: string }
        Returns: undefined
      }
      reset_weekly_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_active_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_last_check: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      user_has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      flashcard_area:
        | "constitucional"
        | "penal"
        | "civil"
        | "processual_civil"
        | "processual_penal"
        | "trabalho"
        | "tributario"
        | "administrativo"
        | "consumidor"
        | "ambiental"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      flashcard_area: [
        "constitucional",
        "penal",
        "civil",
        "processual_civil",
        "processual_penal",
        "trabalho",
        "tributario",
        "administrativo",
        "consumidor",
        "ambiental",
      ],
    },
  },
} as const
