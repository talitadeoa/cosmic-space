# Public Assets

Arquivos públicos compartilhados entre todos os apps do monorepo.

## Estrutura

```
public/
├── images/      # Imagens gerais
├── signs/       # Sinais/elementos visuais
├── *.ico        # Favicons
├── *.jpeg       # Imagens JPEG
├── *.jpg        # Imagens JPG
└── *.png        # Imagens PNG
```

## Uso nos Apps

### Web (Next.js)
```typescript
// public/ é servido na raiz do site
<img src="/images/...png" />
<link rel="icon" href="/fluafavicon.ico" />
```

### iOS/Android
```swift
// Copiar para Assets do projeto
let imagePath = Bundle.main.path(forResource: "ilhas-talita", ofType: "png")
```

## Notas

- Manter imagens otimizadas (WebP quando possível)
- Favicons em múltiplas resoluções (192x192, 512x512)
- Documentar novos assets aqui
