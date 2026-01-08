# Community Domain

Gerencia comunidade, posts e interações sociais.

## Estrutura

- `components/` - PostCard, CommentList, StreamCard, FeaturedCard
- `hooks/` - useCommunityPosts, useComments, useStreams
- `services/` - API de comunidade, comentários
- `types/` - CommunityPost, Comment, Stream
- `constants.ts` - POST_TYPES, STREAM_TYPES

## Responsabilidades

- CRUD de posts
- Gerenciamento de comentários
- Streams de conteúdo
- Interações sociais (likes, shares)

## Dependências

- `@/domains/auth` - Usuário
- `@/shared/api` - HTTP requests

## Roadmap

- [ ] Consolidar app/comunidade/components/
- [ ] Mover componentes
- [ ] Criar hooks
- [ ] Criar types/
- [ ] Criar index.ts barrel export
