# Plan: Milo - Mascota Virtual con Pomodoro y Gamificación

## Resumen
Implementar "Milo", una mascota virtual que acompaña al usuario con un timer Pomodoro, sistema de rachas, XP, niveles y logros. Se implementa como MVP incremental en features chicos.

## Decisiones del usuario
- **Animaciones**: Lottie
- **Alcance**: MVP primero (Timer + mascota básica + rachas + XP)
- **Navegación**: 5to tab
- **Persistencia**: Backend + PostgreSQL

---

## Feature 1: Tab "Milo" vacío + navegación
**Archivos a crear:**
- `frontend/app/(tabs)/milo.tsx` — Pantalla placeholder con icono de paw

**Archivos a modificar:**
- `frontend/app/(tabs)/_layout.tsx` — Agregar 5to tab "Milo" con icono `paw` / `paw-outline`

**Detalle:**
- Agregar el tab entre "Herramientas" y "Perfil"
- Pantalla placeholder: icono de mascota + texto "Próximamente"
- Verificar que los 5 tabs se ven bien en iOS y Android

---

## Feature 2: Modelo de backend para sesiones Pomodoro
**Archivos a crear:**
- `backend/src/models/pomodoro-session.model.ts` — Entity `PomodoroSession`
- `backend/src/services/pomodoro.service.ts` — CRUD de sesiones
- `backend/src/controllers/pomodoro.controller.ts` — Endpoints REST
- `backend/src/routes/pomodoro.routes.ts` — Rutas Express
- `backend/migrations/add_pomodoro_sessions.sql` — SQL de migración

**Archivos a modificar:**
- `backend/src/config/DataSource.ts` — Registrar entity `PomodoroSession`
- `backend/src/index.ts` — Montar ruta `/pomodoro`

**Modelo `PomodoroSession`:**
```
id: PrimaryGeneratedColumn
user_id: uuid (FK → users)
tipo: enum('focus', 'short_break', 'long_break')
duracion_minutos: int (25, 5, 15)
duracion_real_segundos: int (cuánto duró realmente)
completada: boolean
materia_id: int | null (FK → materias, opcional)
xp_ganado: int (default 0)
created_at: timestamp
```

**Endpoints:**
- `POST /pomodoro` — Crear sesión completada
- `GET /pomodoro/stats/:userId` — Stats del usuario (total sesiones, total minutos, racha actual)
- `GET /pomodoro/history/:userId` — Historial reciente (últimas 20)

---

## Feature 3: Modelo de backend para perfil de gamificación
**Archivos a crear:**
- `backend/src/models/user-gamification.model.ts` — Entity `UserGamification`
- `backend/src/services/gamification.service.ts` — Lógica de XP, niveles, rachas
- `backend/src/controllers/gamification.controller.ts` — Endpoints
- `backend/src/routes/gamification.routes.ts` — Rutas
- `backend/migrations/add_user_gamification.sql` — SQL

**Archivos a modificar:**
- `backend/src/config/DataSource.ts` — Registrar entity
- `backend/src/index.ts` — Montar ruta `/gamification`

**Modelo `UserGamification`:**
```
id: PrimaryGeneratedColumn
user_id: uuid (FK → users, UNIQUE)
xp_total: int (default 0)
nivel: int (default 1)
racha_actual: int (default 0, días consecutivos)
racha_maxima: int (default 0)
ultimo_dia_activo: date | null
sesiones_totales: int (default 0)
minutos_totales: int (default 0)
created_at: timestamp
updated_at: timestamp
```

**Endpoints:**
- `GET /gamification/:userId` — Perfil de gamificación
- `POST /gamification/complete-session` — Registrar sesión completada (calcula XP, actualiza racha, sube nivel)

**Lógica XP:**
- Sesión focus completada (25 min): +25 XP
- Sesión focus corta (15 min): +15 XP
- Bonus racha 3 días: +10 XP extra
- Bonus racha 7 días: +25 XP extra

**Niveles (XP acumulado):**
- Nivel 1: 0 XP
- Nivel 2: 100 XP
- Nivel 3: 250 XP
- Nivel 4: 500 XP
- Nivel 5: 1000 XP
- Fórmula: `nivel = floor(sqrt(xp_total / 50)) + 1` (crece cada vez más lento)

---

## Feature 4: API frontend para Pomodoro y Gamificación
**Archivos a modificar:**
- `frontend/src/services/api.js` — Agregar `pomodoroApi` y `gamificationApi`

**Detalle:**
```js
export const pomodoroApi = {
    complete: async (data) => { ... },     // POST /pomodoro
    getStats: async (userId) => { ... },   // GET /pomodoro/stats/:userId
    getHistory: async (userId) => { ... }, // GET /pomodoro/history/:userId
};

export const gamificationApi = {
    getProfile: async (userId) => { ... },         // GET /gamification/:userId
    completeSession: async (data) => { ... },      // POST /gamification/complete-session
};
```

---

## Feature 5: Timer Pomodoro funcional (frontend)
**Archivos a crear:**
- `frontend/src/components/milo/PomodoroTimer.tsx` — Componente del timer circular
- `frontend/src/hooks/usePomodoroTimer.ts` — Hook con lógica del timer

**Archivos a modificar:**
- `frontend/app/(tabs)/milo.tsx` — Reemplazar placeholder con timer

**Detalle del Timer:**
- Timer circular con progreso visual (SVG circle o similar)
- 3 modos: Focus (25 min), Descanso corto (5 min), Descanso largo (15 min)
- Botones: Play/Pause, Reset
- Selector de materia asociada (opcional)
- Al completar sesión focus → llamar API para registrar XP
- Notificación local cuando termina el timer
- Haptic feedback al iniciar/pausar/completar

**Hook `usePomodoroTimer`:**
- State: `timeRemaining`, `isRunning`, `mode`, `sessionsCompleted`
- `useRef` para el interval
- Auto-switch: Focus → Descanso corto (cada 4 sesiones → Descanso largo)
- Persistir estado en AppState (background/foreground)

---

## Feature 6: Mascota Milo con estados básicos (Lottie)
**Archivos a crear:**
- `frontend/assets/lottie/milo-idle.json` — Animación idle (placeholder inicial)
- `frontend/assets/lottie/milo-studying.json` — Animación estudiando
- `frontend/assets/lottie/milo-celebrating.json` — Animación celebrando
- `frontend/assets/lottie/milo-sleeping.json` — Animación durmiendo
- `frontend/src/components/milo/MiloMascot.tsx` — Componente de la mascota

**Archivos a modificar:**
- `frontend/app/(tabs)/milo.tsx` — Agregar mascota arriba del timer

**Estados de Milo:**
- `idle` — Cuando el timer no está corriendo
- `studying` — Cuando el timer focus está corriendo
- `celebrating` — Cuando se completa una sesión (3 seg)
- `sleeping` — Durante descansos

**Nota:** Para MVP, usaremos animaciones Lottie simples. Se necesita instalar `lottie-react-native` si no está. Los archivos JSON de Lottie se pueden obtener de LottieFiles.com (gratuitos) o crear placeholders simples.

---

## Feature 7: Panel de XP, Nivel y Racha
**Archivos a crear:**
- `frontend/src/components/milo/StatsPanel.tsx` — Panel con XP, nivel, racha
- `frontend/src/hooks/useGamification.ts` — Hook para cargar datos de gamificación

**Archivos a modificar:**
- `frontend/app/(tabs)/milo.tsx` — Agregar panel debajo del timer

**Detalle:**
- Barra de progreso XP hacia siguiente nivel
- Número de nivel actual
- Icono de fuego + número de racha
- Sesiones completadas hoy
- Pull-to-refresh para actualizar stats

---

## Feature 8: Historial de sesiones
**Archivos a crear:**
- `frontend/src/components/milo/SessionHistory.tsx` — Lista de sesiones recientes

**Archivos a modificar:**
- `frontend/app/(tabs)/milo.tsx` — Agregar sección de historial (scrollable)

**Detalle:**
- Últimas 10-20 sesiones
- Cada item: fecha, duración, materia (si tiene), XP ganado
- Agrupado por día

---

## Orden de implementación

```
Feature 1 → Feature 2 → Feature 3 → Feature 4 → Feature 5 → Feature 6 → Feature 7 → Feature 8
   Tab        Backend      Backend      API          Timer       Mascota     Stats       Historial
  vacío      Pomodoro    Gamification  Frontend    funcional    Lottie      Panel       sesiones
```

Cada feature es un commit independiente y funcional.

---

## Dependencias a instalar

- `lottie-react-native` + `@lottiefiles/dotlottie-react-native` — Para animaciones de Milo
- `react-native-svg` — Para timer circular (ya instalado)

---

## Verificación

Después de cada feature:
1. Verificar que la app compila sin errores (`npx expo start`)
2. Para backend: verificar que el servidor inicia sin errores y los endpoints responden
3. Feature 1: Verificar que aparecen 5 tabs y Milo se puede seleccionar
4. Feature 5: Verificar que el timer cuenta hacia atrás, se puede pausar/reanudar, y la notificación llega al terminar
5. Feature 7: Verificar que el panel muestra datos reales del backend después de completar una sesión
