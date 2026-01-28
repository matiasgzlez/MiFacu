// Lista de palabras prohibidas para moderación básica
// Se pueden agregar más palabras según sea necesario
const PALABRAS_PROHIBIDAS = [
    // Insultos comunes
    'idiota', 'estupido', 'estúpido', 'imbecil', 'imbécil', 'pelotudo', 'boludo',
    'tarado', 'mogolico', 'mogólico', 'retrasado', 'subnormal',
    // Palabras ofensivas
    'mierda', 'cagada', 'porqueria', 'porquería', 'basura',
    // Discriminación
    'negro de mierda', 'villero', 'cabeza',
    // Amenazas
    'te voy a matar', 'ojala te mueras', 'ojalá te mueras',
];

// Normalizar texto para comparación (quitar acentos, minúsculas)
const normalizar = (texto: string): string => {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Verifica si el texto contiene palabras prohibidas
 */
export const contieneProhibidas = (texto: string): boolean => {
    const textoNormalizado = normalizar(texto);

    return PALABRAS_PROHIBIDAS.some(palabra => {
        const palabraNormalizada = normalizar(palabra);
        return textoNormalizado.includes(palabraNormalizada);
    });
};

/**
 * Reemplaza palabras prohibidas con asteriscos
 */
export const filtrarContenido = (texto: string): string => {
    let resultado = texto;

    PALABRAS_PROHIBIDAS.forEach(palabra => {
        const regex = new RegExp(palabra, 'gi');
        const reemplazo = '*'.repeat(palabra.length);
        resultado = resultado.replace(regex, reemplazo);
    });

    return resultado;
};

/**
 * Obtiene las palabras prohibidas encontradas en el texto
 */
export const obtenerPalabrasProhibidas = (texto: string): string[] => {
    const textoNormalizado = normalizar(texto);

    return PALABRAS_PROHIBIDAS.filter(palabra => {
        const palabraNormalizada = normalizar(palabra);
        return textoNormalizado.includes(palabraNormalizada);
    });
};
