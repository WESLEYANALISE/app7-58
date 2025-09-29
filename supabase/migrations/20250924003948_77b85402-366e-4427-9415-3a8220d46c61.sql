-- Simply insert the new functions without ON CONFLICT since there's no unique constraint
INSERT INTO "APP" (funcao, descricao, link) VALUES 
('Flashcards Jurídicos', 'Sistema de flashcards interativo com dados reais, dicas de IA e controle de progresso para estudo jurídico eficiente', 'flashcards'),
('Blog Jurídico', 'Artigos especializados em Direito organizados por área e tema, com sistema de favoritos e busca', 'blog jurídico');