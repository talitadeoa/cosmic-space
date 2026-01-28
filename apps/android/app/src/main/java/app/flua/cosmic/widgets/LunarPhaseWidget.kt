package app.flua.cosmic.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import app.flua.cosmic.MainActivity
import app.flua.cosmic.R
import java.util.Calendar

/**
 * 🌙 Widget de Fase Lunar para Flua/Cosmic Space
 * 
 * Exibe a fase lunar atual na tela inicial do Android.
 * Atualiza automaticamente a cada 6 horas.
 */
class LunarPhaseWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Atualiza cada widget individualmente
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Chamado quando o primeiro widget é criado
    }

    override fun onDisabled(context: Context) {
        // Chamado quando o último widget é removido
    }

    companion object {
        
        /**
         * Calcula a fase lunar baseada na data atual
         * Retorna: emoji e nome da fase
         */
        private fun getLunarPhase(): Pair<String, String> {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH) + 1
            val day = calendar.get(Calendar.DAY_OF_MONTH)
            
            // Algoritmo simplificado de cálculo lunar
            // Baseado no ciclo de 29.53 dias
            val c = (year / 100.0).toInt()
            val goldenNumber = (year % 19) + 1
            val epact = (11 * goldenNumber + 20 + 30 - c + c / 4) % 30
            
            var lunation = day + epact + month
            if (month < 3) lunation += 2
            lunation %= 30
            
            return when {
                lunation < 2 -> "🌑" to "Lua Nova"
                lunation < 7 -> "🌒" to "Crescente"
                lunation < 9 -> "🌓" to "Quarto Crescente"
                lunation < 14 -> "🌔" to "Gibosa Crescente"
                lunation < 16 -> "🌕" to "Lua Cheia"
                lunation < 21 -> "🌖" to "Gibosa Minguante"
                lunation < 23 -> "🌗" to "Quarto Minguante"
                lunation < 28 -> "🌘" to "Minguante"
                else -> "🌑" to "Lua Nova"
            }
        }

        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val (emoji, phaseName) = getLunarPhase()
            
            // Cria intent para abrir o app ao tocar no widget
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Configura as views do widget
            val views = RemoteViews(context.packageName, R.layout.lunar_phase_widget)
            views.setTextViewText(R.id.widget_lunar_emoji, emoji)
            views.setTextViewText(R.id.widget_lunar_phase, phaseName)
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Atualiza o widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
