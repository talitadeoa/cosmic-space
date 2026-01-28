# 📦 Monorepo Public Assets Structure

## Novo Layout

```
flua/
├── public/                    # ⭐ SHARED - Assets para todos os apps
│   ├── images/
│   ├── signs/
│   ├── *.ico, *.jpeg, *.jpg, *.png
│   └── README.md
│
├── apps/
│   ├── web/
│   │   ├── public → ../../public  # Symlink para raiz
│   │   └── app/
│   │
│   ├── ios/
│   │   └── Assets/                # Copiar de ../../public
│   │
│   └── android/
│       └── assets/                # Copiar de ../../public
```

## Benefícios

✅ **Reutilização**: Um único lugar para assets  
✅ **Sincronização**: Todas as plataformas usam mesmas imagens  
✅ **Manutenção**: Atualizar em um lugar, reflete em tudo  
✅ **Espaço**: Não duplica arquivos  

## Como Usar

### Web (Next.js)
```typescript
// Através do symlink, funciona normalmente
<img src="/images/home-panoramica.jpg" alt="Home" />
<img src="/signs/elemento.svg" alt="Elemento" />
```

### iOS
```swift
// Copiar quando necessário
let imagePath = Bundle.main.path(forResource: "home-panoramica", ofType: "jpg")
if let imagePath = imagePath {
    let image = UIImage(contentsOfFile: imagePath)
}
```

### Android
```kotlin
// Copiar assets para src/main/assets/
val bitmap = BitmapFactory.decodeStream(context.assets.open("home-panoramica.jpg"))
```

## Adicionando Novos Assets

1. Adicione a imagem em `/public/images/` ou `/public/signs/`
2. Documente em `/public/README.md`
3. Otimize (compress, considere WebP)
4. Commit na raiz
5. Pull em cada app conforme necessário
