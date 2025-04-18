interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

interface AIResponse {
    content: string
    error?: string
}

export async function getAIResponse(messages: Message[]): Promise<AIResponse> {
    try {
        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
            throw new Error("API key no configurada");
        }

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
                        content: `Eres un asistente virtual especializado para una farmacia. Debes seguir estas reglas estrictamente:

1. Ámbito de Respuestas:
   - Solo responder preguntas relacionadas con:
     * Medicamentos y productos farmacéuticos
     * Salud y bienestar
     * Servicios de la farmacia
     * Inventario y stock
     * Ventas y transacciones
     * Atención al cliente
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
   - Usar terminología médica y farmacéutica correcta

Recuerda que tu función principal es asistir en temas relacionados con la farmacia y la salud.`
                    },
                    ...messages
                ]
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