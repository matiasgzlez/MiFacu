## Contexto del Proyecto

Este es un proyecto React Native / Expo usando TypeScript. Al sugerir builds o flujos de testing, siempre preferir builds de produccion EAS sobre Expo Go o builds de desarrollo a menos que se pida explicitamente lo contrario.

## Desarrollo de UI

Al hacer cambios de UI (especialmente layout, posicionamiento, o estilos visuales), pedir o referenciar un screenshot/mockup antes de implementar. Si el primer intento no coincide visualmente, preferir enfoques basados en SVG o matematicamente precisos sobre ajuste manual de Bezier.

## Exploracion Antes de Implementar

Antes de hacer cambios en componentes complejos (tab bar, navegacion, SVG, etc.), usar un agente para explorar la implementacion actual, la configuracion de renderizado, y la estructura existente. Resumir que componentes existen y como se componen antes de hacer ningun cambio.

## Testing y Verificacion

Despues de hacer cambios en la app, verificar que el build compile exitosamente ejecutando el comando apropiado de build/type-check antes de commitear. No asumir que el testing con codigo QR / Expo Go funcionara para features que requieran modulos nativos (ej. RevenueCat).

## Cache Global con TanStack React Query

### Arquitectura general
Se usa `@tanstack/react-query` para cachear datos globalmente y evitar spinners repetidos al navegar entre pantallas. Los datos se comparten entre pantallas: `recordatorios` se usa en Home, Parciales y Timeline; `misMaterias` se usa en Home, Materias, Horarios, Timeline y Repositorio.

### Archivos core
- **`frontend/src/lib/queryClient.ts`** — QueryClient singleton. Defaults: `staleTime: 2min`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`
- **`frontend/src/lib/queryKeys.ts`** — Factory de query keys tipados. Usar siempre `queryKeys.recordatorios()`, `queryKeys.misMaterias(userId)`, etc. para consistencia en invalidacion
- **`frontend/src/hooks/useQueries.ts`** — Todas las queries y mutations compartidas. Archivo central, cualquier pantalla importa de aca
- **`frontend/src/hooks/useRefetchOnFocus.ts`** — Reemplaza el patron `useFocusEffect(() => loadData())`. Solo refetchea si los datos son stale (> 2min)

### Provider
`QueryClientProvider` esta en `frontend/app/_layout.tsx`, wrapeando `ThemeProvider` (fuera de `AuthProvider` para que el cache persista entre re-renders de auth).

### Queries disponibles (en useQueries.ts)
- `useRecordatorios()` — recordatorios del usuario (usado por Home, Parciales, Timeline)
- `useMisMaterias()` — materias del usuario (usado por Home, Materias, Horarios, Timeline, Repositorio)
- `useMateriasDisponibles()` — materias no agregadas aun (usado por Home, Materias)
- `useFinales()` — finales del usuario (usado por Finales, Timeline)
- `useUserProfile()` — perfil con universidad/carrera (usado por Timeline)
- `useAllMaterias(carreraId)` — todas las materias de una carrera (usado por Parciales, Finales)
- `useLinks()` — links del repositorio (usado por Repositorio)

### Mutations disponibles (en useQueries.ts)
Cada mutation invalida automaticamente las queries relacionadas en `onSuccess`:
- `useCreateRecordatorio()`, `useUpdateRecordatorio()`, `useDeleteRecordatorio()` → invalida `['recordatorios']`
- `useCreateFinal()`, `useDeleteFinal()` → invalida `['finales']`
- `useAddMateria()`, `useUpdateEstadoMateria()`, `useRemoveMateria()` → invalida `['mis-materias']` + `['materias-disponibles']`
- `useCreateLink()`, `useUpdateLink()`, `useDeleteLink()` → invalida `['links']`

### Patron de migracion aplicado
Antes: cada pantalla tenia `useFocusEffect(() => loadData())` con `useState` + `setLoading(true)`.
Ahora: cada pantalla usa las queries de `useQueries.ts` + `useRefetchOnFocus(query)`. El `loading` es `true` solo si no hay data cacheada (primer load). Las computaciones derivadas van en `useMemo` sobre `query.data`.

### Reglas para futuras pantallas/features
1. **Nunca hacer fetch manual** de datos que ya tienen query (recordatorios, misMaterias, finales, links, userProfile). Importar el hook de `useQueries.ts`
2. **Despues de una mutacion** (crear/editar/eliminar), no llamar `loadData()` manualmente. Usar las mutations de `useQueries.ts` que invalidan automaticamente
3. **Para nuevos endpoints**, agregar la query key en `queryKeys.ts` y el hook en `useQueries.ts`
4. **`DataRepository`** (`frontend/src/services/dataRepository.ts`) sigue existiendo como capa de acceso a la API. Las queries de React Query lo usan internamente como `queryFn`
5. **Para refetch on focus**, usar `useRefetchOnFocus(query)` en vez de `useFocusEffect`

### Pantallas migradas
Home (`useHomeData`), Timeline (`useTimelineData`), Parciales, Finales, Materias, Horarios, Repositorio, Linea de Tiempo.

### Pantallas NO migradas (fase 4 opcional)
Simulador, Calificaciones, Temas Finales, Gamification, Materias Resenas. Estas siguen usando el patron viejo de fetch manual.

## Arquitectura del Calendario Academico

### Pantalla principal
- Ruta: `/linea-de-tiempo` (feature premium)
- Archivo: `frontend/app/linea-de-tiempo.tsx`
- Hook de datos: `frontend/src/hooks/useTimelineData.ts`
- Componente del calendario: `frontend/src/components/timeline/TimelineChart.tsx`
- Componente resumen: `frontend/src/components/timeline/SummaryCard.tsx`

### Tipos de eventos
Hay dos categorias de eventos con renderizado distinto:

**Eventos personales** (puntitos de color debajo de la fecha):
- Parcial (#F59E0B amber) — desde API `/recordatorios`
- Final (#EF4444 rojo) — desde API `/finales`
- Entrega (#3B82F6 azul) — desde API `/recordatorios`

**Eventos institucionales** (circulo coloreado alrededor de la fecha):
- inicio_fin_cuatri (#10B981 verde esmeralda)
- receso (#7DD3FC celeste)
- mesa_examen (#F97316 naranja)
- feriado (#374151 gris oscuro)
- inscripcion (#8B5CF6 violeta, solo UNNE FAU)

Los eventos institucionales se renderizan con borde de color + fondo semitransparente + numero en color bold. Los personales usan puntitos 5x5px debajo del numero.

### Calendarios institucionales (datos estaticos)
- UTN-FRRE: `frontend/src/data/calendarioUTN.ts` — exporta CALENDARIO_UTN_2026, UTN_EVENT_COLORS
- UNNE FAU: `frontend/src/data/calendarioUNNE_FAU.ts` — exporta CALENDARIO_UNNE_FAU_2026, UNNE_FAU_EVENT_COLORS, UNNE_FAU_EVENT_LABELS
- UNNE FADyCC: `frontend/src/data/calendarioUNNE_FADyCC.ts` — exporta CALENDARIO_UNNE_FADYCC_2026, UNNE_FADYCC_EVENT_COLORS, UNNE_FADYCC_EVENT_LABELS

Cada calendario tiene funciones helper `range()` y `single()` para generar eventos. Se activan con toggles en AsyncStorage segun la universidad/carrera del usuario.

### Flujo de datos
1. `useTimelineData(options)` recibe flags `showUTN`, `showUNNE_FAU`, `showUNNE_FADyCC`
2. Fetch paralelo de recordatorios + finales + misMaterias desde la API
3. Construye array de `TimelineEvent[]` personales
4. Calcula semanas y stress levels (solo eventos personales afectan esto)
5. Construye `eventsByDate: Map<string, TimelineEvent[]>`
6. Mergea eventos institucionales al map (no afectan stress/hellWeeks)
7. `TimelineChart` recibe `eventsByDate` y renderiza el grid mensual

### Calendario custom (no usa react-native-calendars)
- Grid de 42 celdas (6 filas x 7 dias), Lunes a Domingo
- Navegacion mensual con flechas
- Seleccion de dia con animacion fade para mostrar detalle de eventos
- `getDayDots()` retorna puntitos solo para eventos personales (deduplicados por tipo)
- `getInstitutionalColor()` retorna el color del primer evento institucional del dia
- Prioridad de estilos del circulo: hoy (azul) > seleccionado (gris) > institucional (color) > default

## Arquitectura de Tareas (Quick Tasks)

### Pantalla y componentes
- Seccion de tareas en Home: `frontend/app/(tabs)/index.tsx` (seccion "TAREAS — Attio style")
- Componente de tarea individual: `frontend/src/components/home/TaskItem.tsx`
- Swipe-to-delete wrapper: `frontend/src/components/home/SwipeableTask.tsx`
- Hook de datos: `frontend/src/hooks/useHomeData.ts`

### Modelo de datos
- Tipo frontend: `Recordatorio` en `frontend/src/types/models.ts` (id, nombre, tipo, fecha, hora, color, descripcion)
- Modelo backend: `backend/src/models/recordatorios.model.ts` (tabla `recordatorios` en PostgreSQL via TypeORM)
- Las tareas rapidas usan `tipo: 'quick_task'` para diferenciarlas de Parcial/Entrega/General

### CRUD
- API base: `/recordatorios` (GET, POST, PUT/:id, DELETE/:id) — requiere auth
- Frontend: `DataRepository` en `frontend/src/services/dataRepository.ts` (getRecordatorios, createRecordatorio, updateRecordatorio, deleteRecordatorio)
- Backend: `backend/src/services/recordatorios.service.ts` + `backend/src/controllers/recordatorios.controller.ts`
- Crear: UI optimista con tempId, luego reemplaza con ID real del backend
- Completar (circulo): elimina de la DB via DELETE
- Editar: inline edit (tap en texto), envia PUT con nombre + descripcion + fecha
- Swipe derecha: tambien elimina (mismo handler que completar)

### Funcionalidades
- Date picker con `@react-native-community/datetimepicker` para elegir fecha al crear y editar
- Ordenamiento por fecha (mas proximas / mas lejanas) con toggle en el header
- Fecha se muestra como badge con formato smart: "Hoy", "Manana", "Ayer", "DD Mes"
- Tareas vencidas se muestran en rojo
- KeyboardAvoidingView con offset 85 (iOS) para el input de nueva tarea

## Arquitectura de Parciales/Entregas (Recordatorios)

### Pantalla y componentes
- Pantalla principal: `frontend/app/parciales.tsx`
- Titulo: "Parciales/Entregas"
- Cards con animacion "Thanos Snap" al eliminar (DeletableCard)
- EventCardContent: muestra tipo, countdown, titulo, hora, fecha, iconos de notif/edit/delete/calendario

### Flujo
- Crear: boton + abre sheet modal con form (tipo, titulo, materia, fecha, hora, notificacion, color)
- Editar: tap en card abre el mismo sheet pre-poblado (editingId != null). Llama updateRecordatorio
- Eliminar: long press o tap en trash. Confirmacion con Alert, luego DELETE + cancel notificacion
- Calendario: tap en icono calendario navega a `/linea-de-tiempo?initialDate=YYYY-MM-DD`

### Navegacion al calendario
- `linea-de-tiempo.tsx` lee `initialDate` via `useLocalSearchParams`
- Lo pasa a `TimelineChart` como prop `initialDate`
- TimelineChart auto-navega al mes correcto y selecciona esa fecha

### Datos
- Usa misma tabla `recordatorios` que quick_tasks, filtrado por tipo Parcial/Entrega
- Colores: 7 opciones en PALETA_COLORES
- Notificaciones locales con expo-notifications (anticipacion configurable)
- Materias opcionales asociadas via materiaId

## Arquitectura de Horarios (Multiples por Materia)

### Modelo de datos
- Tabla `usuario_materias` tiene columnas legacy planas (`dia`, `hora`, `duracion`, `aula`) + columna JSONB `schedules` (array de objetos)
- Modelo backend: `backend/src/models/usuario-materias.model.ts` — entity `UsuarioMateria` con campo `schedules: any[]` (JSONB, default `[]`)
- Tipo frontend: `Schedule` en `frontend/src/types/models.ts` — `{ dia: string; hora: number; duracion: number; aula?: string | null }`
- Backend sincroniza automaticamente: el primer schedule del array se copia a los campos planos legacy para backward compatibility

### Soporte multiples horarios
- Maximo 3 horarios por materia (constante `MAX_SCHEDULES` en `materias.tsx`)
- Estado `schedules: Schedule[]` en el formulario del modal de estado
- `activeScheduleIndex` trackea cual bloque esta siendo editado por los DateTimePicker
- Helpers: `addScheduleBlock()`, `removeScheduleBlock(index)`, `updateScheduleField(index, field, value)`

### Validacion de conflictos
- `timeBlocksOverlap(a, b)` — chequea solapamiento en mismo dia (comparacion de rangos hora inicio/fin)
- `getConflictForBlock(index)` — valida conflictos internos (misma materia) y externos (otras materias cursando)
- Lee schedules de TODAS las materias cursando del usuario via `misMateriasQuery.data`
- Si hay conflicto: horas se muestran como `--:--` en rojo + mensaje descriptivo debajo del bloque
- Al guardar: valida todos los bloques, muestra Alert si hay conflicto y no guarda

### Flujo de datos (guardar)
1. Frontend construye `{ schedules: [{dia, hora, duracion, aula}, ...] }` y lo pasa como `schedule` a la mutation
2. `api.js` hace spread: `{ estado, ...schedule }` → produce `{ estado, schedules: [...] }`
3. Backend controller extrae `schedules` de `req.body`
4. Backend service detecta `scheduleData.schedules && Array.isArray(...)` → guarda en JSONB + sincroniza first item a campos planos

### Flujo de datos (cargar para edicion)
- `abrirDetalleMateria()` lee `item.schedules` (JSONB) si existe y tiene items
- Fallback a campos planos `item.dia`, `item.hora`, `item.duracion`, `item.aula` si schedules esta vacio/null
- Siempre inicializa al menos 1 bloque default

### Pantallas que consumen horarios
- **Materias** (`frontend/app/(tabs)/materias.tsx`): formulario multi-schedule, cards con multiples badges
- **Horarios** (`frontend/app/horarios.tsx`): expande cada materia cursando en N entradas (una por schedule block), agrupadas por dia
- **Home** (`frontend/src/hooks/useHomeData.ts`): "Clases Hoy" y "Proxima Clase" iteran sobre `getScheduleEntries(m)` que lee schedules con fallback a campos planos

### Reglas para futuras modificaciones
1. **Siempre leer `schedules` array primero**, fallback a campos planos — patron: `m.schedules?.length ? m.schedules : (m.dia && m.hora != null ? [{...}] : [])`
2. **Al guardar, enviar `{ schedules: [...] }`** — nunca enviar campos planos sueltos, el backend sincroniza automaticamente
3. **No modificar el backend** para cambios de UI de horarios — la columna JSONB ya soporta cualquier estructura de schedule
4. **Validar conflictos en frontend** antes de guardar — el backend no valida solapamientos
