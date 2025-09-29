# Configuração de Reset de Senha - Supabase

Para que a funcionalidade de "Esqueci a Senha" funcione corretamente, você precisa configurar as URLs de redirecionamento no painel do Supabase:

## Passo 1: Acessar as Configurações de Autenticação

1. Acesse: https://supabase.com/dashboard/project/phzcazcyjhlmdchcjagy/auth/url-configuration
2. Faça login na sua conta Supabase

## Passo 2: Configurar URLs de Redirecionamento

Na seção **Redirect URLs**, adicione:

### Para desenvolvimento local:
```
http://localhost:5173/reset-password
```

### Para produção (substitua pelo seu domínio):
```
https://seu-dominio.com/reset-password
https://juriflow-essentials.lovable.app/reset-password
```

## Passo 3: Site URL

Configure a **Site URL** para:
- Desenvolvimento: `http://localhost:5173`
- Produção: `https://seu-dominio.com` ou `https://juriflow-essentials.lovable.app`

## Como Funciona o Fluxo

1. **Usuário clica "Esqueci minha senha"** → Insere email
2. **Sistema envia email** com link de recuperação
3. **Usuário clica no link** → É redirecionado para `/reset-password`
4. **Usuário define nova senha** → Confirmação de sucesso
5. **Redirecionamento automático** para tela de login

## Personalização do Email (Opcional)

Você pode personalizar o template do email em:
https://supabase.com/dashboard/project/phzcazcyjhlmdchcjagy/auth/templates

## Testando

1. Use a aba "Recuperar" na tela de autenticação
2. Digite um email válido cadastrado
3. Verifique a caixa de entrada do email
4. Clique no link recebido
5. Defina uma nova senha

---

**Nota**: Esta configuração é essencial para o funcionamento correto da recuperação de senha. Sem ela, os links no email não funcionarão adequadamente.