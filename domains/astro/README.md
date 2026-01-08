# Astro Domain

Gerencia astrologia, signos zodiacais e informações astrológicas.

## Estrutura

- `components/` - MoonPhaseDisplay, SignDisplay
- `hooks/` - useSignEmoji, useAstroData
- `services/` - Cálculos astrológicos
- `types/` - ZodiacSign, AstroData
- `constants.ts` - ZODIAC_SIGNS, EMOJIS

## Responsabilidades

- Cálculos de signos zodiacais
- Dados astrológicos
- Emojis e labels de signos

## Dependências

- `@/shared/utils` - Formatação

## Roadmap

- [ ] Consolidar lib/astro.ts
- [ ] Consolidar componentes
- [ ] Criar types/
- [ ] Criar index.ts barrel export
