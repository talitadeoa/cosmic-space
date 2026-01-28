//
//  CosmicWidget.swift
//  Flua - Cosmic Space
//
//  🌙 Widget de Fase Lunar para iOS
//  Exibe a fase lunar atual na tela inicial do iPhone/iPad.
//

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct LunarEntry: TimelineEntry {
    let date: Date
    let lunarEmoji: String
    let lunarPhase: String
    let lunarDescription: String
}

// MARK: - Timeline Provider

struct LunarPhaseProvider: TimelineProvider {
    
    func placeholder(in context: Context) -> LunarEntry {
        LunarEntry(
            date: Date(),
            lunarEmoji: "🌙",
            lunarPhase: "Fase Lunar",
            lunarDescription: "Carregando..."
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (LunarEntry) -> Void) {
        let entry = getLunarEntry()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<LunarEntry>) -> Void) {
        var entries: [LunarEntry] = []
        
        // Gera entradas para as próximas 24 horas
        let currentDate = Date()
        for hourOffset in stride(from: 0, to: 24, by: 6) {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = getLunarEntry(for: entryDate)
            entries.append(entry)
        }
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    // MARK: - Lunar Phase Calculation
    
    private func getLunarEntry(for date: Date = Date()) -> LunarEntry {
        let (emoji, phase, description) = calculateLunarPhase(for: date)
        return LunarEntry(
            date: date,
            lunarEmoji: emoji,
            lunarPhase: phase,
            lunarDescription: description
        )
    }
    
    private func calculateLunarPhase(for date: Date) -> (String, String, String) {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let month = calendar.component(.month, from: date)
        let day = calendar.component(.day, from: date)
        
        // Algoritmo simplificado de cálculo lunar
        let c = year / 100
        let goldenNumber = (year % 19) + 1
        let epact = (11 * goldenNumber + 20 + 30 - c + c / 4) % 30
        
        var lunation = day + epact + month
        if month < 3 { lunation += 2 }
        lunation = lunation % 30
        
        switch lunation {
        case 0..<2:
            return ("🌑", "Lua Nova", "Momento de novos começos")
        case 2..<7:
            return ("🌒", "Crescente", "Fase de crescimento")
        case 7..<9:
            return ("🌓", "Quarto Crescente", "Momento de ação")
        case 9..<14:
            return ("🌔", "Gibosa Crescente", "Preparação para plenitude")
        case 14..<16:
            return ("🌕", "Lua Cheia", "Plenitude e manifestação")
        case 16..<21:
            return ("🌖", "Gibosa Minguante", "Tempo de gratidão")
        case 21..<23:
            return ("🌗", "Quarto Minguante", "Momento de reflexão")
        case 23..<28:
            return ("🌘", "Minguante", "Fase de liberação")
        default:
            return ("🌑", "Lua Nova", "Momento de novos começos")
        }
    }
}

// MARK: - Widget Views

struct LunarPhaseWidgetEntryView: View {
    var entry: LunarPhaseProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    var entry: LunarEntry
    
    var body: some View {
        VStack(spacing: 8) {
            Text(entry.lunarEmoji)
                .font(.system(size: 50))
            
            Text(entry.lunarPhase)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
            
            Text("Flua")
                .font(.system(size: 10))
                .foregroundColor(.purple.opacity(0.8))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.04, green: 0.06, blue: 0.12),
                    Color(red: 0.07, green: 0.09, blue: 0.23),
                    Color(red: 0.10, green: 0.06, blue: 0.25)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct MediumWidgetView: View {
    var entry: LunarEntry
    
    var body: some View {
        HStack(spacing: 20) {
            Text(entry.lunarEmoji)
                .font(.system(size: 60))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.lunarPhase)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Text(entry.lunarDescription)
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.8))
                
                Spacer()
                
                Text("Flua ✨")
                    .font(.system(size: 10))
                    .foregroundColor(.purple.opacity(0.8))
            }
            .padding(.vertical, 12)
            
            Spacer()
        }
        .padding(.horizontal, 20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.04, green: 0.06, blue: 0.12),
                    Color(red: 0.07, green: 0.09, blue: 0.23),
                    Color(red: 0.10, green: 0.06, blue: 0.25)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct LargeWidgetView: View {
    var entry: LunarEntry
    
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Text(entry.lunarEmoji)
                .font(.system(size: 80))
            
            Text(entry.lunarPhase)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text(entry.lunarDescription)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.center)
            
            Spacer()
            
            HStack {
                Text("Flua ✨")
                    .font(.system(size: 12))
                    .foregroundColor(.purple.opacity(0.8))
            }
            .padding(.bottom, 12)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.04, green: 0.06, blue: 0.12),
                    Color(red: 0.07, green: 0.09, blue: 0.23),
                    Color(red: 0.10, green: 0.06, blue: 0.25)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - Widget Configuration

@main
struct CosmicWidget: Widget {
    let kind: String = "CosmicLunarPhaseWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunarPhaseProvider()) { entry in
            LunarPhaseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Fase Lunar")
        .description("Acompanhe a fase lunar atual diretamente na sua tela inicial.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    CosmicWidget()
} timeline: {
    LunarEntry(date: Date(), lunarEmoji: "🌕", lunarPhase: "Lua Cheia", lunarDescription: "Plenitude")
}

#Preview(as: .systemMedium) {
    CosmicWidget()
} timeline: {
    LunarEntry(date: Date(), lunarEmoji: "🌒", lunarPhase: "Crescente", lunarDescription: "Fase de crescimento")
}
