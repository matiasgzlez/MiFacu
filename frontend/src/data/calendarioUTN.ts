export type UTNEventType = 'inicio_fin_cuatri' | 'receso' | 'mesa_examen' | 'feriado';

export interface UTNEvent {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  nombre: string;
  tipo: UTNEventType;
}

export const UTN_EVENT_COLORS: Record<UTNEventType, string> = {
  inicio_fin_cuatri: '#10B981',
  receso: '#7DD3FC',
  mesa_examen: '#F97316',
  feriado: '#EF4444',
};

export const UTN_EVENT_LABELS: Record<UTNEventType, string> = {
  inicio_fin_cuatri: 'Inicio/Fin cuatri',
  receso: 'Receso',
  mesa_examen: 'Mesa de examen',
  feriado: 'Feriado',
};

function range(startDate: string, endDate: string, nombre: string, tipo: UTNEventType, idPrefix: string): UTNEvent[] {
  const events: UTNEvent[] = [];
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

function single(fecha: string, nombre: string, tipo: UTNEventType, id: string): UTNEvent {
  return { id, fecha, nombre, tipo };
}

export const CALENDARIO_UTN_2026: UTNEvent[] = [
  // === PRIMER CUATRIMESTRE ===

  // Marzo 2026
  single('2026-03-16', 'Inicio del primer cuatrimestre', 'inicio_fin_cuatri', 'utn-1'),
  single('2026-03-23', 'Feriado puente turístico', 'feriado', 'utn-2'),
  single('2026-03-24', 'Día Nacional de la Memoria por la Verdad y la Justicia', 'feriado', 'utn-3'),

  // Abril 2026
  single('2026-04-02', 'Día del Veterano y de los Caídos en la Guerra de Malvinas', 'feriado', 'utn-4'),
  single('2026-04-03', 'Viernes Santo', 'feriado', 'utn-5'),
  ...range('2026-04-13', '2026-04-18', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-6'),

  // Mayo 2026
  single('2026-05-01', 'Día del Trabajador', 'feriado', 'utn-7'),
  single('2026-05-02', 'Feriado', 'feriado', 'utn-8'),
  single('2026-05-25', 'Día de la Revolución de Mayo', 'feriado', 'utn-9'),

  // Junio 2026
  single('2026-06-10', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-10'),
  single('2026-06-15', 'Paso a la Inmortalidad del Gral. Güemes (trasladado)', 'feriado', 'utn-11'),
  single('2026-06-20', 'Paso a la Inmortalidad del Gral. Manuel Belgrano', 'feriado', 'utn-12'),

  // === RECESO E INICIO SEGUNDO CUATRIMESTRE ===

  // Julio 2026
  single('2026-07-09', 'Día de la Independencia', 'feriado', 'utn-13'),
  single('2026-07-10', 'Feriado puente turístico', 'feriado', 'utn-14'),
  single('2026-07-18', 'Fin del primer cuatrimestre', 'inicio_fin_cuatri', 'utn-15'),
  ...range('2026-07-20', '2026-08-01', 'Receso de invierno', 'receso', 'utn-16'),

  // Agosto 2026
  ...range('2026-08-03', '2026-08-08', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-17'),
  single('2026-08-10', 'Inicio del segundo cuatrimestre', 'inicio_fin_cuatri', 'utn-18'),
  single('2026-08-17', 'Paso a la Inmortalidad del Gral. José de San Martín', 'feriado', 'utn-19'),
  single('2026-08-19', 'Feriado', 'feriado', 'utn-20'),
  single('2026-08-27', 'Feriado', 'feriado', 'utn-21'),

  // === SEGUNDO CUATRIMESTRE ===

  // Septiembre 2026
  ...range('2026-09-07', '2026-09-12', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-22'),
  single('2026-09-21', 'Día del Estudiante (sin actividad académica)', 'feriado', 'utn-23'),

  // Octubre 2026
  single('2026-10-12', 'Día del Respeto a la Diversidad Cultural', 'feriado', 'utn-24'),
  single('2026-10-20', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-25'),

  // Noviembre 2026
  single('2026-11-23', 'Día de la Soberanía Nacional (trasladado)', 'feriado', 'utn-26'),

  // Diciembre 2026
  single('2026-12-05', 'Fin del segundo cuatrimestre', 'inicio_fin_cuatri', 'utn-27'),
  single('2026-12-07', 'Feriado puente turístico', 'feriado', 'utn-28'),
  single('2026-12-08', 'Inmaculada Concepción de María', 'feriado', 'utn-29'),
  ...range('2026-12-09', '2026-12-12', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-30'),
  ...range('2026-12-14', '2026-12-19', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-31'),
  single('2026-12-25', 'Navidad', 'feriado', 'utn-32'),

  // === TURNOS DE EXAMEN 2027 ===

  // Febrero 2027
  single('2027-02-08', 'Carnaval', 'feriado', 'utn-33'),
  single('2027-02-09', 'Carnaval', 'feriado', 'utn-34'),
  ...range('2027-02-15', '2027-02-20', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-35'),
  ...range('2027-02-22', '2027-02-27', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-36'),

  // Marzo 2027
  ...range('2027-03-01', '2027-03-06', 'Mesa de examen con suspensión de clases', 'mesa_examen', 'utn-37'),
  single('2027-03-24', 'Feriado', 'feriado', 'utn-38'),
  single('2027-03-25', 'Feriado', 'feriado', 'utn-39'),
  single('2027-03-26', 'Feriado', 'feriado', 'utn-40'),
];
