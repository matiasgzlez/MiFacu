export type UNNEFAUEventType = 'inicio_fin_cuatri' | 'receso' | 'mesa_examen' | 'inscripcion' | 'feriado';

export interface UNNEFAUEvent {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  nombre: string;
  tipo: UNNEFAUEventType;
}

export const UNNE_FAU_EVENT_COLORS: Record<UNNEFAUEventType, string> = {
  inicio_fin_cuatri: '#10B981',
  receso: '#7DD3FC',
  mesa_examen: '#F97316',
  inscripcion: '#8B5CF6',
  feriado: '#374151',
};

export const UNNE_FAU_EVENT_LABELS: Record<UNNEFAUEventType, string> = {
  inicio_fin_cuatri: 'Inicio/Fin cuatri',
  receso: 'Receso',
  mesa_examen: 'Mesa de examen',
  inscripcion: 'Inscripción examen',
  feriado: 'Feriado',
};

// Carreras que usan este calendario (incluye futuras que aún no están en la app)
export const CARRERAS_UNNE_FAU = [
  'Arquitectura',
  'Diseño Gráfico',
  'Licenciatura en Diseño Industrial',
  'Taller de Artes Visuales',
];

function range(startDate: string, endDate: string, nombre: string, tipo: UNNEFAUEventType, idPrefix: string): UNNEFAUEvent[] {
  const events: UNNEFAUEvent[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  let i = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    events.push({
      id: `${idPrefix}-${i++}`,
      fecha: `${y}-${m}-${day}`,
      nombre,
      tipo,
    });
  }
  return events;
}

function single(fecha: string, nombre: string, tipo: UNNEFAUEventType, id: string): UNNEFAUEvent {
  return { id, fecha, nombre, tipo };
}

export const CALENDARIO_UNNE_FAU_2026: UNNEFAUEvent[] = [
  // =====================
  // ENERO
  // =====================
  single('2026-01-01', 'Año Nuevo', 'feriado', 'fau-1'),

  // =====================
  // FEBRERO
  // =====================
  single('2026-02-02', 'Fundación de Resistencia', 'feriado', 'fau-2'),
  ...range('2026-02-03', '2026-02-07', '1° período de inscripción a exámenes', 'inscripcion', 'fau-3'),
  ...range('2026-02-09', '2026-02-14', '1° período de exámenes', 'mesa_examen', 'fau-4'),
  single('2026-02-16', 'Carnaval', 'feriado', 'fau-5'),
  single('2026-02-17', 'Carnaval', 'feriado', 'fau-6'),
  ...range('2026-02-18', '2026-02-27', 'Recuperatorios finales (DG, DI y Arquitectura)', 'mesa_examen', 'fau-7'),

  // =====================
  // MARZO
  // =====================
  ...range('2026-03-02', '2026-03-07', '2° período de inscripción a exámenes', 'inscripcion', 'fau-8'),
  ...range('2026-03-09', '2026-03-14', '2° período de exámenes', 'mesa_examen', 'fau-9'),
  single('2026-03-16', 'Inicio del dictado de asignaturas', 'inicio_fin_cuatri', 'fau-10'),
  single('2026-03-24', 'Día de la Memoria por la Verdad y la Justicia', 'feriado', 'fau-11'),

  // =====================
  // ABRIL
  // =====================
  single('2026-04-02', 'Día del Veterano y de los Caídos en Malvinas / Jueves Santo', 'feriado', 'fau-12'),
  single('2026-04-03', 'Viernes Santo', 'feriado', 'fau-13'),

  // =====================
  // MAYO
  // =====================
  single('2026-05-01', 'Día del Trabajador', 'feriado', 'fau-14'),
  ...range('2026-05-11', '2026-05-16', '3° período de inscripción a exámenes', 'inscripcion', 'fau-15'),
  ...range('2026-05-18', '2026-05-23', '3° período de exámenes — suspensión de clases', 'mesa_examen', 'fau-16'),
  single('2026-05-25', 'Día de la Revolución de Mayo', 'feriado', 'fau-17'),

  // =====================
  // JUNIO
  // =====================
  single('2026-06-15', 'Paso a la Inmortalidad del Gral. Güemes (trasladado)', 'feriado', 'fau-18'),
  single('2026-06-20', 'Paso a la Inmortalidad del Gral. Belgrano', 'feriado', 'fau-19'),

  // =====================
  // JULIO
  // =====================
  single('2026-07-04', 'Finalización de clases del 1er cuatrimestre', 'inicio_fin_cuatri', 'fau-20'),
  ...range('2026-07-06', '2026-07-11', '4° período de inscripción a exámenes', 'inscripcion', 'fau-21'),
  single('2026-07-09', 'Día de la Independencia', 'feriado', 'fau-22'),
  ...range('2026-07-13', '2026-07-18', '4° período de exámenes — suspensión de clases', 'mesa_examen', 'fau-23'),
  ...range('2026-07-20', '2026-07-31', 'Receso académico y administrativo', 'receso', 'fau-24'),

  // =====================
  // AGOSTO
  // =====================
  ...range('2026-08-01', '2026-08-02', 'Receso académico y administrativo', 'receso', 'fau-25'),
  ...range('2026-08-03', '2026-08-08', '5° período de inscripción a exámenes', 'inscripcion', 'fau-26'),
  ...range('2026-08-10', '2026-08-15', '5° período de exámenes — suspensión de clases', 'mesa_examen', 'fau-27'),
  single('2026-08-17', 'Paso a la Inmortalidad del Gral. San Martín', 'feriado', 'fau-28'),
  single('2026-08-18', 'Inicio del dictado del 2do cuatrimestre', 'inicio_fin_cuatri', 'fau-29'),
  single('2026-08-27', 'San Fernando Rey', 'feriado', 'fau-30'),

  // =====================
  // SEPTIEMBRE
  // =====================
  single('2026-09-17', 'Día del Docente Universitario', 'feriado', 'fau-31'),
  single('2026-09-21', 'Día del Estudiante', 'feriado', 'fau-32'),

  // =====================
  // OCTUBRE
  // =====================
  single('2026-10-12', 'Día del Respeto a la Diversidad Cultural', 'feriado', 'fau-33'),
  ...range('2026-10-13', '2026-10-17', '6° período de inscripción a exámenes', 'inscripcion', 'fau-34'),
  ...range('2026-10-19', '2026-10-24', '6° período de exámenes — suspensión de clases', 'mesa_examen', 'fau-35'),
  single('2026-10-31', 'Finalización de asignaturas semestrales', 'inicio_fin_cuatri', 'fau-36'),

  // =====================
  // NOVIEMBRE
  // =====================
  single('2026-11-23', 'Día de la Soberanía Nacional (trasladado)', 'feriado', 'fau-37'),
  single('2026-11-26', 'Día del No Docente Universitario', 'feriado', 'fau-38'),
  single('2026-11-28', 'Finalización de asignaturas cuatrimestrales', 'inicio_fin_cuatri', 'fau-39'),

  // =====================
  // DICIEMBRE
  // =====================
  single('2026-12-04', 'Finalización de asignaturas de Taller', 'inicio_fin_cuatri', 'fau-40'),
  ...range('2026-12-07', '2026-12-12', '7° período de inscripción a exámenes', 'inscripcion', 'fau-41'),
  single('2026-12-08', 'Inmaculada Concepción', 'feriado', 'fau-42'),
  single('2026-12-13', 'Provincial de la Memoria (Chaco)', 'feriado', 'fau-43'),
  single('2026-12-14', 'Aniversario creación UNNE', 'feriado', 'fau-44'),
  ...range('2026-12-15', '2026-12-19', '7° período de exámenes', 'mesa_examen', 'fau-45'),
  single('2026-12-25', 'Navidad', 'feriado', 'fau-46'),
];
