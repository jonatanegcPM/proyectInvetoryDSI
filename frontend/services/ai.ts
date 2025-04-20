interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

interface AIResponse {
    content: string
    error?: string
}

// Opciones para controlar el comportamiento de la IA
export interface AIOptions {
    maxTokens?: number;     // Limitar longitud de respuesta
    temperature?: number;   // Control de creatividad (0.0-1.0)
    concise?: boolean;      // Modo respuesta concisa
    shortAnswers?: boolean; // Modo respuestas ultra breves
}

// Valores por defecto
const DEFAULT_OPTIONS: AIOptions = {
    maxTokens: 500,         // Respuesta de tamaño moderado por defecto
    temperature: 0.7,       // Creatividad moderada
    concise: false,         // Modo normal por defecto
    shortAnswers: false     // Respuestas normales por defecto
}

export async function getAIResponse(messages: Message[], options: AIOptions = {}): Promise<AIResponse> {
    try {
        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
            throw new Error("API key no configurada");
        }

        // Combinar opciones por defecto con las proporcionadas
        const finalOptions = { ...DEFAULT_OPTIONS, ...options };
        
        // Añadir instrucción de concisión si está activada
        let systemMessage = `Eres un asistente virtual especializado para una farmacia. Debes seguir estas reglas estrictamente:

1. Ámbito de Respuestas:
   - Solo responder preguntas relacionadas con:
     * Medicamentos y productos farmacéuticos
     * Salud y bienestar
     * Inventario y stock
     * Procedimientos farmacéuticos

2. Comportamiento:
   - El que te esta preguntando es personal de la farmacia
   - Ser amable y profesional
   - Ser conciso y directo
   - Usar lenguaje técnico apropiado cuando sea necesario
   - Mantener un tono empático

3. Restricciones:
   - NO responder preguntas fuera del ámbito farmacéutico
   - NO discutir temas políticos, deportivos o de entretenimiento
   - NO responder preguntas personales

4. Respuesta para temas no relacionados:
   - Si la pregunta no está relacionada con la farmacia o salud, responder:
   "Lo siento, solo puedo ayudarte con temas relacionados a la farmacia y la salud. ¿Hay algo específico sobre nuestros productos o servicios que te gustaría saber?"

5. Idioma:
   - Responder siempre en español
   - Usar terminología médica y farmacéutica correcta`;
   
        // Añadir instrucción específica para respuestas concisas si la opción está activada
        if (finalOptions.concise) {
            systemMessage += `\n\n6. Formato de respuesta:
   - IMPORTANTE: Proporciona respuestas BREVES y CONCISAS
   - Limita tus respuestas a 1-3 oraciones cuando sea posible
   - Evita explicaciones largas y párrafos extensos
   - Ve directamente al punto principal`;
        }
        
        // Añadir instrucciones para respuestas ultra breves si la opción está activada
        if (finalOptions.shortAnswers) {
            systemMessage += `\n\n6. Formato de respuesta:
   - EXTREMADAMENTE IMPORTANTE: Proporciona respuestas ULTRA BREVES
   - Limita tus respuestas a 1-2 ORACIONES CORTAS MÁXIMO
   - NUNCA uses más de 50 palabras en tus respuestas
   - Usa frases simples y directas
   - Elimina cualquier información no esencial
   - Omite saludos, introducciones y conclusiones`;
            
            // Si se activa shortAnswers, reducir también el número máximo de tokens
            finalOptions.maxTokens = Math.min(finalOptions.maxTokens || 500, 200);
        }

        systemMessage += `\n\nRecuerda que tu función principal es asistir en temas relacionados con la farmacia y la salud.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Farmacias Brasil",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    ...messages
                ],
                max_tokens: finalOptions.maxTokens,
                temperature: finalOptions.temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en la API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content
        };
    } catch (error) {
        console.error("Error al obtener respuesta de IA:", error);
        return {
            content: "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
} 