-- Atualizar o nome da função para JusBlog na tabela APP
UPDATE "APP" SET funcao = 'JusBlog' WHERE funcao = 'Blog Jurídico' OR funcao = 'JusBlog';