import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ResultadoModeracion {
    aprobado: boolean;
    motivo?: string;
}

/**
 * Modera el contenido de una reseña universitaria usando GPT-4o-mini.
 * Retorna { aprobado: true } si el contenido es aceptable,
 * o { aprobado: false, motivo: "..." } si debe ser rechazado.
 */
export async function moderarResena(comentario: string, profesorNombre: string): Promise<ResultadoModeracion> {
    // Si no hay API key configurada, aprobar por defecto (fallback seguro)
    if (!process.env.OPENAI_API_KEY) {
        console.warn('[moderacion-ia] OPENAI_API_KEY no configurada, omitiendo moderacion IA');
        return { aprobado: true };
    }

    // No gastar tokens en textos muy cortos
    if (comentario.trim().length < 3) {
        return { aprobado: true };
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0,
            max_tokens: 150,
            messages: [
                {
                    role: 'system',
                    content: `Sos un moderador de reseñas de catedras universitarias en una app estudiantil argentina.

Tu trabajo es decidir si una reseña es ACEPTABLE o debe ser RECHAZADA.

RECHAZAR si contiene:
- Insultos, agresiones o ataques personales hacia profesores o alumnos (incluso disfrazados con numeros/simbolos como "p3lotu2o", "id1ota")
- Contenido discriminatorio, racista, sexista o de odio
- Amenazas de cualquier tipo
- Spam, texto sin sentido o caracteres aleatorios
- Contenido sexual o inapropiado
- Doxxing o datos personales (telefono, direccion, redes sociales del profesor)
- Contenido que no es una reseña academica (publicidad, memes, chistes sin relacion)

ACEPTAR si:
- Es una critica negativa pero respetuosa ("El profesor explica mal", "No me gusto la materia", "Los parciales son muy dificiles")
- Usa lenguaje coloquial argentino sin ser ofensivo ("Es un embole", "Me costo banda")
- Expresa frustracion sin agredir ("La cursada fue pesima", "No lo recomiendo")

Responde UNICAMENTE con un JSON valido, sin markdown:
{"aprobado": true}
o
{"aprobado": false, "motivo": "breve explicacion en español"}`,
                },
                {
                    role: 'user',
                    content: `Profesor: ${profesorNombre}\nReseña: ${comentario}`,
                },
            ],
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
            // Si no hay respuesta, aprobar por defecto
            return { aprobado: true };
        }

        const resultado: ResultadoModeracion = JSON.parse(content);
        return resultado;
    } catch (error: any) {
        // Si falla la IA (rate limit, timeout, etc.), aprobar por defecto
        // para no bloquear al usuario. El filtro de palabras prohibidas
        // sigue funcionando como respaldo.
        console.error('[moderacion-ia] Error al moderar:', error.message);
        return { aprobado: true };
    }
}
