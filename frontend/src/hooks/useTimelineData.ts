import { useState, useEffect, useCallback } from 'react';
import { DataRepository } from '../services/dataRepository';
import { useAuth } from '../context/AuthContext';
import { CALENDARIO_UTN_2026, UTN_EVENT_COLORS } from '../data/calendarioUTN';
import { CALENDARIO_UNNE_FAU_2026, UNNE_FAU_EVENT_COLORS, UNNE_FAU_EVENT_LABELS } from '../data/calendarioUNNE_FAU';
import { CALENDARIO_UNNE_FADYCC_2026, UNNE_FADYCC_EVENT_COLORS, UNNE_FADYCC_EVENT_LABELS } from '../data/calendarioUNNE_FADyCC';

// --- Types ---

export type StressLevel = 'green' | 'yellow' | 'red';

export interface TimelineEvent {
  id: string;
  tipo: 'Parcial' | 'Final' | 'Entrega';
  nombre: string;
  materiaId?: number;
  materiaNombre: string;
  fecha: Date;
  isInstitutional?: boolean;
  institutionalTipo?: string;  // dot dedup key, e.g. 'utn:mesa_examen'
  institutionalColor?: string; // pre-resolved color
  institutionalLabel?: string; // pre-resolved label for badge
}

export interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  events: TimelineEvent[];
  stressLevel: StressLevel;
  isCurrentWeek: boolean;
}

export interface MateriaRow {
  materiaId: number | null;
  materiaNombre: string;
  events: TimelineEvent[];
}

export interface TimelineData {
  weeks: WeekData[];
  materiaRows: MateriaRow[];
  semesterLabel: string;
  currentWeekIndex: number;
  totalEvents: number;
  hellWeeks: number;
  eventsByDate: Map<string, TimelineEvent[]>;
  monthsRange: { start: Date; end: Date };
}

// --- Helpers ---

function getYearRange(year: number): { start: Date; end: Date; label: string } {
  return {
    start: new Date(year, 0, 1),    // 1 Ene
    end: new Date(year, 11, 31),    // 31 Dic
    label: `${year}`,
  };
}

function getStressLevel(eventCount: number): StressLevel {
  if (eventCount >= 3) return 'red';
  if (eventCount >= 2) return 'yellow';
  return 'green';
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(str: string): Date {
  // Handles "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss..."
  const parts = str.split('T')[0].split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// --- Hook ---

export function useTimelineData(options?: { showUTN?: boolean; showUNNE_FAU?: boolean; showUNNE_FADyCC?: boolean }) {
  const showUTN = options?.showUTN ?? false;
  const showUNNE_FAU = options?.showUNNE_FAU ?? false;
  const showUNNE_FADyCC = options?.showUNNE_FADyCC ?? false;
  const { user, isGuest } = useAuth();
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const userId = user?.id;

      // Fetch all 3 data sources in parallel
      const [recordatorios, finales, misMaterias] = await Promise.all([
        DataRepository.getRecordatorios(isGuest).catch(() => []),
        DataRepository.getFinales(isGuest).catch(() => []),
        userId ? DataRepository.getMisMaterias(userId).catch(() => []) : Promise.resolve([]),
      ]);

      const now = new Date();
      const year = now.getFullYear();
      const { start, end, label } = getYearRange(year);

      // Build events from recordatorios (Parcial / Entrega)
      const events: TimelineEvent[] = [];

      for (const r of recordatorios) {
        const tipo = r.tipo as string;
        if (tipo !== 'Parcial' && tipo !== 'Entrega') continue;
        if (!r.fecha) continue;
        const fecha = parseISODate(r.fecha);
        if (fecha < start || fecha > end) continue;

        events.push({
          id: `rec-${r.id}`,
          tipo: tipo as 'Parcial' | 'Entrega',
          nombre: r.nombre,
          materiaId: r.materiaId ?? r.materia?.id ?? undefined,
          materiaNombre: r.materia?.nombre || 'Sin materia',
          fecha,
        });
      }

      // Build events from finales
      for (const f of finales) {
        const fechaStr = f.fecha?.toString() || '';
        const fecha = parseISODate(fechaStr);
        if (fecha < start || fecha > end) continue;

        const materiaNombre = f.materia?.nombre || f.materiaNombre || 'Desconocida';
        events.push({
          id: `fin-${f.id}`,
          tipo: 'Final',
          nombre: materiaNombre,
          materiaId: f.materiaId ?? f.materia?.id ?? undefined,
          materiaNombre,
          fecha,
        });
      }

      // Calcular cantidad de semanas segun el rango anual
      const totalWeeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weeks: WeekData[] = [];
      const today = startOfDay(now);
      let currentWeekIndex = -1;

      for (let i = 0; i < totalWeeks; i++) {
        const weekStart = addDays(start, i * 7);
        const weekEnd = addDays(weekStart, 6);

        const weekEvents = events.filter((e) => {
          const d = startOfDay(e.fecha);
          return d >= weekStart && d <= weekEnd;
        });

        const isCurrentWeek = today >= weekStart && today <= weekEnd;
        if (isCurrentWeek) currentWeekIndex = i;

        weeks.push({
          weekNumber: i + 1,
          startDate: weekStart,
          endDate: weekEnd,
          events: weekEvents,
          stressLevel: getStressLevel(weekEvents.length),
          isCurrentWeek,
        });
      }

      // If current week wasn't found (we're before/after semester), find closest
      if (currentWeekIndex === -1) {
        let minDist = Infinity;
        weeks.forEach((w, i) => {
          const dist = Math.abs(today.getTime() - w.startDate.getTime());
          if (dist < minDist) {
            minDist = dist;
            currentWeekIndex = i;
          }
        });
      }

      // Build materia rows from misMaterias with estado 'cursado'
      const cursando = (misMaterias as any[]).filter(
        (um) => um.estado === 'cursado'
      );

      const materiaMap = new Map<number, MateriaRow>();
      for (const um of cursando) {
        const mId = um.materiaId ?? um.materia?.id;
        const mNombre = um.materia?.nombre || 'Sin nombre';
        if (mId && !materiaMap.has(mId)) {
          materiaMap.set(mId, {
            materiaId: mId,
            materiaNombre: mNombre,
            events: [],
          });
        }
      }

      // Distribute events into materia rows
      const otrosEvents: TimelineEvent[] = [];
      for (const ev of events) {
        if (ev.materiaId && materiaMap.has(ev.materiaId)) {
          materiaMap.get(ev.materiaId)!.events.push(ev);
        } else {
          otrosEvents.push(ev);
        }
      }

      const materiaRows: MateriaRow[] = [...materiaMap.values()];

      // Add "Otros" row if there are unmatched events
      if (otrosEvents.length > 0) {
        materiaRows.push({
          materiaId: null,
          materiaNombre: 'Otros',
          events: otrosEvents,
        });
      }

      const hellWeeks = weeks.filter((w) => w.stressLevel === 'red').length;

      // Build eventsByDate map
      const eventsByDate = new Map<string, TimelineEvent[]>();
      for (const ev of events) {
        const key = formatDateKey(ev.fecha);
        if (!eventsByDate.has(key)) {
          eventsByDate.set(key, []);
        }
        eventsByDate.get(key)!.push(ev);
      }

      // Merge institutional calendar events (they don't affect stress/hellWeeks)
      const addInstitutionalEvents = (
        calendar: { id: string; fecha: string; nombre: string; tipo: string }[],
        prefix: string,
        source: string,
        colorMap: Record<string, string>,
        labelMap: Record<string, string>,
      ) => {
        for (const ev of calendar) {
          const key = ev.fecha;
          const timelineEv: TimelineEvent = {
            id: ev.id,
            tipo: 'Parcial', // placeholder, rendering uses institutional fields
            nombre: ev.nombre,
            materiaNombre: source,
            fecha: parseISODate(ev.fecha),
            isInstitutional: true,
            institutionalTipo: `${prefix}:${ev.tipo}`,
            institutionalColor: colorMap[ev.tipo] || '#6B7280',
            institutionalLabel: labelMap[ev.tipo] || ev.tipo,
          };
          if (!eventsByDate.has(key)) {
            eventsByDate.set(key, []);
          }
          eventsByDate.get(key)!.push(timelineEv);
        }
      };

      if (showUTN) {
        addInstitutionalEvents(
          CALENDARIO_UTN_2026, 'utn', 'UTN-FRRE',
          UTN_EVENT_COLORS, { inicio_fin_cuatri: 'Inicio/Fin cuatri', receso: 'Receso', mesa_examen: 'Mesa de examen', feriado: 'Feriado' },
        );
      }

      if (showUNNE_FAU) {
        addInstitutionalEvents(
          CALENDARIO_UNNE_FAU_2026, 'unne_fau', 'UNNE — FAU',
          UNNE_FAU_EVENT_COLORS as Record<string, string>,
          UNNE_FAU_EVENT_LABELS as Record<string, string>,
        );
      }

      if (showUNNE_FADyCC) {
        addInstitutionalEvents(
          CALENDARIO_UNNE_FADYCC_2026, 'unne_fadycc', 'UNNE — FADyCC',
          UNNE_FADYCC_EVENT_COLORS as Record<string, string>,
          UNNE_FADYCC_EVENT_LABELS as Record<string, string>,
        );
      }

      // monthsRange: first and last month of the semester
      const monthsRange = { start, end };

      setData({
        weeks,
        materiaRows,
        semesterLabel: label,
        currentWeekIndex: Math.max(currentWeekIndex, 0),
        totalEvents: events.length,
        hellWeeks,
        eventsByDate,
        monthsRange,
      });
    } catch (error) {
      console.error('Error loading timeline data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isGuest, showUTN, showUNNE_FAU, showUNNE_FADyCC]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
