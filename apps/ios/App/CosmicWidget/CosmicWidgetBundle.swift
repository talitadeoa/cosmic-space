//
//  CosmicWidgetBundle.swift
//  Flua - Cosmic Space
//
//  Bundle que agrupa todos os widgets do app
//

import WidgetKit
import SwiftUI

@main
struct CosmicWidgetBundle: WidgetBundle {
    var body: some Widget {
        CosmicLunarPhaseWidget()
        // Adicione mais widgets aqui conforme necessário
        // CosmicMoodWidget()
        // CosmicCycleWidget()
    }
}
