export type UNNEFADyCCEventType = 'inicio_fin_cuatri' | 'receso' | 'mesa_examen' | 'feriado';

export interface UNNEFADyCCEvent {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  nombre: string;
  tipo: UNNEFADyCCEventType;
}

export const UNNE_FADYCC_EVENT_COLORS: Record<UNNEFADyCCEventType, string> = {
  inicio_fin_cuatri: '#10B981',
  receso: '#7DD3FC',
  mesa_examen: '#F97316',
  feriado: '#374151',
};

export const UNNE_FADYCC_EVENT_LABELS: Record<UNNEFADyCCEventType, string> = {
  inicio_fin_cuatri: 'Inicio/Fin cuatri',
  receso: 'Receso',
  mesa_examen: 'Mesa de examen',
  feriado: 'Feriado',
};

// Carreras que usan este calendario (futuras, aún no están en la app)
export const CARRERAS_UNNE_FADYCC = [
  'Licenciatura en Artes Combinadas',
  'Licenciatura en Gestión y Desarrollo Cultural',
  'Licenciatura en Turismo',
  'Tecnicatura en Diseño de Imagen, Sonido y Multimedia',
];

function range(startDate: string, endDate: string, nombre: string, tipo: UNNEFADyCCEventType, idPrefix: string): UNNEFADyCCEvent[] {
  const events: UNNEFADyCCEvent[] = [];
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

function single(fecha: string, nombre: string, tipo: UNNEFADyCCEventType, id: string): UNNEFADyCCEvent {
  return { id, fecha, nombre, tipo };
}

export const CALENDARIO_UNNE_FADYCC_2026: UNNEFADyCCEvent[] = [
  // =====================
  // ENERO
  // =====================
  single('2026-01-01', 'Año Nuevo', 'feriado', 'fadycc-1'),

  // =====================
  // FEBRERO
  // =====================
  single('2026-02-02', 'Fundación de Resistencia', 'feriado', 'fadycc-2'),
  single('2026-02-16', 'Carnaval', 'feriado', 'fadycc-3'),
  single('2026-02-17', 'Carnaval', 'feriado', 'fadycc-4'),
  ...range('2026-02-23', '2026-02-27', 'Exámenes finales — turno febrero, 1er llamado', 'mesa_examen', 'fadycc-5'),

  // =====================
  // MARZO
  // =====================
  ...range('2026-03-09', '2026-03-13', 'Exámenes finales — turno febrero, 2do llamado', 'mesa_examen', 'fadycc-6'),
  single('2026-03-16', 'Inicio del primer cuatrimestre', 'inicio_fin_cuatri', 'fadycc-7'),
  single('2026-03-24', 'Día de la Memoria por la Verdad y la Justicia', 'feriado', 'fadycc-8'),

  // =====================
  // ABRIL
  // =====================
  single('2026-04-02', 'Día del Veterano y de los Caídos en Malvinas / Jueves Santo', 'feriado', 'fadycc-9'),
  single('2026-04-03', 'Viernes Santo', 'feriado', 'fadycc-10'),
  ...range('2026-04-13', '2026-04-17', 'Exámenes finales — turno abril', 'mesa_examen', 'fadycc-11'),

  // =====================
  // MAYO
  // =====================
  single('2026-05-01', 'Día del Trabajador', 'feriado', 'fadycc-12'),
  single('2026-05-25', 'Día de la Revolución de Mayo', 'feriado', 'fadycc-13'),

  // =====================
  // JUNIO
  // =====================
  single('2026-06-17', 'Paso a la Inmortalidad del Gral. Güemes', 'feriado', 'fadycc-14'),
  single('2026-06-20', 'Paso a la Inmortalidad del Gral. Belgrano', 'feriado', 'fadycc-15'),
  single('2026-06-26', 'Finalización del primer cuatrimestre', 'inicio_fin_cuatri', 'fadycc-16'),

  // =====================
  // JULIO
  // =====================
  ...range('2026-07-06', '2026-07-10', 'Exámenes finales — turno julio, 1er llamado', 'mesa_examen', 'fadycc-17'),
  single('2026-07-09', 'Día de la Independencia', 'feriado', 'fadycc-18'),
  ...range('2026-07-20', '2026-07-31', 'Receso de invierno', 'receso', 'fadycc-19'),

  // =====================
  // AGOSTO
  // =====================
  ...range('2026-08-03', '2026-08-07', 'Exámenes finales — turno julio, 2do llamado', 'mesa_examen', 'fadycc-20'),
  single('2026-08-10', 'Inicio del segundo cuatrimestre', 'inicio_fin_cuatri', 'fadycc-21'),
  single('2026-08-17', 'Paso a la Inmortalidad del Gral. San Martín', 'feriado', 'fadycc-22'),
  single('2026-08-27', 'San Fernando Rey', 'feriado', 'fadycc-23'),

  // =====================
  // SEPTIEMBRE
  // =====================
  ...range('2026-09-07', '2026-09-11', 'Exámenes finales — turno septiembre', 'mesa_examen', 'fadycc-24'),
  single('2026-09-17', 'Día del Docente Universitario', 'feriado', 'fadycc-25'),
  single('2026-09-21', 'Día del Estudiante', 'feriado', 'fadycc-26'),

  // =====================
  // OCTUBRE
  // =====================
  single('2026-10-12', 'Día del Respeto a la Diversidad Cultural', 'feriado', 'fadycc-27'),

  // =====================
  // NOVIEMBRE
  // =====================
  single('2026-11-20', 'Día de la Soberanía Nacional / Fin del segundo cuatrimestre', 'feriado', 'fadycc-28'),
  single('2026-11-20', 'Finalización del segundo cuatrimestre', 'inicio_fin_cuatri', 'fadycc-29'),
  single('2026-11-26', 'Día del No Docente Universitario', 'feriado', 'fadycc-30'),
  ...range('2026-11-30', '2026-12-04', 'Exámenes finales — turno diciembre, 1er llamado', 'mesa_examen', 'fadycc-31'),

  // =====================
  // DICIEMBRE
  // =====================
  single('2026-12-08', 'Inmaculada Concepción', 'feriado', 'fadycc-32'),
  single('2026-12-13', 'Provincial de la Memoria (Chaco)', 'feriado', 'fadycc-33'),
  single('2026-12-14', 'Aniversario creación UNNE', 'feriado', 'fadycc-34'),
  ...range('2026-12-14', '2026-12-18', 'Exámenes finales — turno diciembre, 2do llamado', 'mesa_examen', 'fadycc-35'),
  single('2026-12-25', 'Navidad', 'feriado', 'fadycc-36'),
];
