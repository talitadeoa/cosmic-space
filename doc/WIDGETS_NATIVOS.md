# 🌙 Widgets Nativos - Flua/Cosmic Space

Guia para configurar e personalizar os widgets nativos de Fase Lunar para Android e iOS.

---

## 📱 Android Widget

### Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `widgets/LunarPhaseWidget.kt` | Lógica do widget |
| `res/layout/lunar_phase_widget.xml` | Layout visual |
| `res/drawable/widget_background.xml` | Background gradient |
| `res/xml/lunar_phase_widget_info.xml` | Configurações do widget |
| `res/values/widget_strings.xml` | Strings localizadas |

### Como Testar

```bash
# Sincronizar projeto
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

1. Execute o app no emulador ou dispositivo
2. Vá para a tela inicial do Android
3. Segure em uma área vazia → "Widgets"
4. Procure por "Fase Lunar - Flua"
5. Arraste para a tela inicial

### Personalizações

#### Alterar cores do background
Edite `res/drawable/widget_background.xml`:
```xml
<gradient
    android:startColor="#SEU_COR_1"
    android:centerColor="#SUA_COR_2"
    android:endColor="#SUA_COR_3"
    android:angle="135" />
```

#### Alterar frequência de atualização
Edite `res/xml/lunar_phase_widget_info.xml`:
```xml
<!-- Valor em milissegundos (mínimo 30 minutos = 1800000) -->
android:updatePeriodMillis="21600000"
```

---

## 🍎 iOS Widget (WidgetKit)

### Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `CosmicWidget/CosmicWidget.swift` | Widget principal com 3 tamanhos |
| `CosmicWidget/CosmicWidgetBundle.swift` | Bundle de widgets |
| `CosmicWidget/Assets.xcassets/` | Assets do widget |

### ⚠️ Configuração no Xcode (Obrigatório)

O widget iOS precisa ser adicionado como uma **Target** separada no Xcode:

#### Passo 1: Adicionar Widget Extension

```bash
npx cap open ios
```

1. No Xcode, vá em **File → New → Target**
2. Selecione **Widget Extension**
3. Nome: `CosmicWidget`
4. Desmarque "Include Configuration Intent"
5. Clique em **Finish**

#### Passo 2: Substituir Arquivos

1. Delete os arquivos gerados automaticamente em `CosmicWidget/`
2. Copie os arquivos que criamos:
   - `CosmicWidget.swift`
   - `CosmicWidgetBundle.swift`
   - `Assets.xcassets/`

#### Passo 3: Configurar App Groups (para comunicação app ↔ widget)

1. Selecione o projeto no navigator
2. Vá em **Signing & Capabilities** para o target principal (App)
3. Clique em **+ Capability** → **App Groups**
4. Adicione: `group.app.flua.cosmic`
5. Repita para o target `CosmicWidget`

#### Passo 4: Build e Teste

1. Selecione um simulador iPhone
2. Build o projeto (⌘B)
3. No simulador, segure na tela inicial
4. Toque no "+" → procure "Flua"
5. Escolha o tamanho do widget

### Tamanhos Disponíveis

| Tamanho | Descrição |
|---------|-----------|
| Small (2x2) | Emoji + nome da fase |
| Medium (4x2) | Emoji + fase + descrição |
| Large (4x4) | Visualização completa |

---

## 🔄 Comunicação App ↔ Widget

### Compartilhar Dados (iOS)

```swift
// No app principal - salvar dados
let sharedDefaults = UserDefaults(suiteName: "group.app.flua.cosmic")
sharedDefaults?.set("🌕", forKey: "currentLunarEmoji")
sharedDefaults?.set("Lua Cheia", forKey: "currentLunarPhase")

// Recarregar widget
WidgetCenter.shared.reloadAllTimelines()
```

```swift
// No widget - ler dados
let sharedDefaults = UserDefaults(suiteName: "group.app.flua.cosmic")
let emoji = sharedDefaults?.string(forKey: "currentLunarEmoji") ?? "🌙"
```

### Compartilhar Dados (Android)

```kotlin
// No app principal
val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
prefs.edit()
    .putString("lunar_emoji", "🌕")
    .putString("lunar_phase", "Lua Cheia")
    .apply()

// Notificar widget para atualizar
val intent = Intent(context, LunarPhaseWidget::class.java)
intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
val ids = AppWidgetManager.getInstance(context)
    .getAppWidgetIds(ComponentName(context, LunarPhaseWidget::class.java))
intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
context.sendBroadcast(intent)
```

---

## 🎨 Ideias para Expandir

### Mais Widgets

1. **Widget de Humor** - Mostra o humor registrado hoje
2. **Widget de Ciclo** - Dias até próxima fase do ciclo
3. **Widget de Tarefas** - Próximas tarefas cósmicas
4. **Widget Interativo** - Registrar humor direto do widget (iOS 17+)

### Widget Interativo (iOS 17+)

```swift
Button(intent: LogMoodIntent()) {
    Text("😊")
}
```

---

## 🐛 Troubleshooting

### Android

**Widget não aparece na lista:**
- Verifique se o receiver está no AndroidManifest.xml
- Rebuild o projeto

**Widget mostra erro:**
- Verifique os IDs dos TextViews no layout
- Confirme que R.layout.lunar_phase_widget existe

### iOS

**Widget não compila:**
- Verifique se o Deployment Target é iOS 17+
- Confirme que WidgetKit está importado

**Widget não atualiza:**
- Use `WidgetCenter.shared.reloadAllTimelines()`
- Verifique o TimelinePolicy

---

## 📚 Recursos

- [Android App Widgets Guide](https://developer.android.com/develop/ui/views/appwidgets)
- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
