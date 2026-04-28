## Summary
Implementação de funcionalidades de segurança, gestão de barbeiros e serviços com autenticação robusta.

## What
Adição de 4 features principais:

**1. Rate Limiting no Login**
- Configuração do @nestjs/throttler no AppModule
- Aplicação de ThrottlerGuard no endpoint POST /auth/login
- Proteção contra ataques de força bruta

**2. Reset de Senha**
- PáginaForgotPasswordPage para solicitação de reset
- Página ResetPasswordPage com token para nova senha
- Template de email para reset de senha
- Novos DTOs: forgot-password.dto.ts, reset-password.dto.ts
- Melhor tratamento de erros no login e verificação de magic link

**3. Gestão de Serviços**
- CreateBarbershopServiceDto e UpdateBarbershopServiceDto
- CRUD completo no BarbershopServiceController
- Componentes ServiceCard e ServiceForm
- Páginas de listagem e edição de serviços
- Utilitários de validação e Jest configurado

**4. Registo e Permissões de Barbeiros**
- FormRegisterBarber melhorado com seleção de funções
- BarberCard para exibição de informações
- PermissionsPanel para gestão de permissões
- useAuth hook refatorado
- serverAuth para autenticação server-side
- Proxy middleware para auth e authZ
- API client com URLs dinâmicas

**Estatísticas:**
- 74 arquivos alterados
- 3941 inserções
- 586 remoções

## Why
**Segurança:** Proteger o sistema contra ataques de força bruta com rate limiting.

**Recuperação de conta:** Usuários precisam de mecanismo para recuperar acesso quando esquecerem a senha.

**Gestão de serviços:** Barbearias precisam gerenciar seus serviços (cortes, barba, etc.) com CRUD completo.

**Gestão de equipa:** Barbeiros precisam de registo com funções/papéis definidos e permissões adequadas.

## How
**Backend (NestJS):**
- ThrottlerModule configurado com 3 tiers (short/medium/long)
- Guards aplicados diretamente nos endpoints sensíveis
- Serviço de email integrado para envio de reset
- Validação de DTOs com class-validator

**Frontend (Next.js):**
- Páginas de autenticação em /app/auth/
- Server components para SEO
- Client components para interatividade
- Hook useAuth centralizado
- Proxy middleware para Requests com auth token

**Arquitetura:**
- Monorepo com apps/api, apps/web, packages/shared
- DTOs partilhados no packages/shared
- Proxy pattern para API calls
- Contexto BarbershopContext para isolamento de dados

## Type of Change
- [ ] Bug fix
- [x] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Test addition/fix

## Related Issues
<!-- Adicionar referências aos issues -->

## Testing
```bash
npm run test
npm run test:e2e
```

## Screenshots/Videos
<!-- Adicionar screenshots se necessário -->

## Additional Notes
Branch comparada com origin/master. Requer review cuidadosa pelo volume de alterações.