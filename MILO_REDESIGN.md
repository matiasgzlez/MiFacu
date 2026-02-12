# MILO REDESIGN - Documento de Desarrollo

## Resumen General

Milo se redisena como un companion de estudio gamificado con 3 secciones principales:
1. **Timer** (pantalla principal) - Temporizador estilo Forest con 2 modos
2. **Clasificacion** - Rankings semanales y mensuales anonimos
3. **Mis Estadisticas** - Perfil, XP, logros, graficos, historial

---

## 1. TIMER (Pantalla Principal)

### 1.1 Diseno del Timer

Circulo grande central con un **slider circular deslizable** (estilo Forest app).
- El usuario arrastra el deslizador alrededor del circulo para seleccionar el tiempo
- Rango: **0 a 120 minutos** (incrementos de 5 minutos)
- El tiempo seleccionado se muestra grande en el centro del circulo
- Colores: gradiente dorado/navy segun el tema de miFACU

### 1.2 Modos de Timer

Dos modos seleccionables con tabs/segmented control arriba del timer:

#### FOCUS (Temporizador)
- El usuario selecciona cuanto tiempo quiere estudiar (0-120 min)
- Al presionar START, cuenta regresiva
- Al llegar a 0, sesion completada -> se registra XP
- Puede pausar y reanudar
- NO puede agregar tiempo una vez iniciado

#### STOPWATCH (Cronometro)
- Empieza en 00:00 y cuenta hacia arriba
- El usuario estudia el tiempo que quiera
- Cuando se cansa, presiona STOP
- Se registra el tiempo total como sesion completada -> se registra XP

### 1.3 Selector de Materia

Debajo del timer, antes del boton START:
- **Dropdown/Selector** que muestra las materias del plan de estudio del usuario
- Las materias vienen de las que ya tiene cargadas en su carrera (endpoint existente: `/usuario-materias/:userId`)
- **Opcion de crear tag personalizado**: el usuario puede escribir un nombre libre (ej: "Teoria Fisica 1", "Repaso General")
- Los tags personalizados se guardan para reutilizar
- La materia/tag seleccionada se asocia a la sesion de pomodoro
- Es **opcional** - puede estudiar sin seleccionar materia

### 1.4 Controles del Timer

- **Boton START/PAUSE** - Grande, central, debajo del circulo
- **Boton RESET** - Pequeno, al costado, para reiniciar
- **Boton CANCEL** - Para cancelar sesion en curso (no suma XP)

---

## 2. CLASIFICACION (Rankings)

### 2.1 Estructura

Dos tabs: **Semanal** | **Mensual**

#### Clasificacion Semanal
- Va de lunes a domingo
- Se reinicia cada lunes a las 00:00
- Muestra el ranking de los 20 usuarios que mas tiempo estudiaron esa semana

#### Clasificacion Mensual
- Va del dia 1 al ultimo dia del mes
- Se reinicia el dia 1 de cada mes a las 00:00
- Muestra el ranking de los 20 usuarios que mas tiempo estudiaron ese mes

### 2.2 Formato del Ranking

#### Header del usuario
- **Mi tiempo esta semana/mes**: "Xh Ym" (tiempo total del usuario en el periodo)
- **Mi posicion**: "#N" (posicion del usuario en el ranking general)

#### Lista Top 20

```
1. [medalla oro]    (avatar) Mat*****   19h 6m
2. [medalla plata]  (avatar) Jua*****   18h 32m
3. [medalla bronce] (avatar) Luc*****   17h 15m
4.                  (avatar) Ana*****   16h 48m
5.                  (avatar) Car*****   15h 20m
...
20.                 (avatar) Ped*****   8h 12m
```

#### Posicion del usuario (si no esta en top 20)

```
...
24203. (avatar) Mat***** (tu)   15m
```

### 2.3 Anonimato

- Solo se muestran las **primeras 3 letras** del nombre + asteriscos
- Ejemplo: "Matias" -> "Mat*****"
- El usuario se identifica con "(tu)" al lado de su nombre
- Cada usuario tiene un avatar (seleccionable en Mis Estadisticas)

### 2.4 Medallas (Top 3)

- Posicion 1: Medalla de oro (emoji o icono dorado)
- Posicion 2: Medalla de plata
- Posicion 3: Medalla de bronce
- Posiciones 4-20: numero normal

---

## 3. MIS ESTADISTICAS

### 3.1 Perfil del Usuario

- **Avatar**: seleccionable entre varios avatares predefinidos (emojis o ilustraciones)
- **Nombre** (censurado igual que en rankings para consistencia, o nombre completo ya que es su propio perfil)
- **Nivel actual** con nombre del logro
- **Barra de XP** mostrando progreso al siguiente nivel

### 3.2 Stats Principales (Cards)

| Stat | Descripcion |
|------|-------------|
| Racha | Dias consecutivos estudiando |
| Tiempo Total | Suma de todos los minutos estudiados |
| Sesion mas Larga | Duracion de la sesion mas larga registrada |
| Nivel | Nivel actual + nombre del logro |

### 3.3 Sistema de XP

#### Reglas de XP
| Accion | XP |
|--------|-----|
| Por cada minuto estudiado | +1 XP |
| Bono por racha diaria (por dia) | +20 XP |
| Bono por sesion larga (>25 min) | +5 XP |

#### Tabla de Niveles/Logros

| Nivel | XP Requerido | Titulo | Descripcion |
|-------|-------------|--------|-------------|
| 1 | 0 | Beginner | Primer paso hacia el enfoque |
| 2 | 1 | Focused Starter | Empiezas a crear un habito de concentracion |
| 3 | 30 | Concentrated Beginner | Luchas por cada minuto de enfoque |
| 4 | 80 | Focus Fighter | Estudias como un verdadero guerrero |
| 5 | 150 | Study Warrior | Maestro de tu propia atencion |
| 6 | 250 | Attention Master | Profesional del deep work |
| 7 | 400 | Deep Work Pro | Concentracion legendaria en flow |
| 8 | 600 | Zone Legend | Estado de flow real |
| 9 | 850 | Flow State King | Enfoque mental bestial |
| 10 | 1150 | Mindful Beast | Nivel divino de concentracion |
| 11 | 1500 | Concentration God | Regente de todas las distracciones |
| 12 | 1900 | Focus Overlord | Maquina de aprendizaje sin limites |
| 13 | 2400 | Study Machine | Enfoque laser en el objetivo |
| 14 | 3000 | Laser Focus | Monje meditando sobre el conocimiento |
| 15 | 3700 | Mental Monk | Ninja escondido en libros |
| 16 | 4500 | Brain Ninja | Rey de la productividad y la eficiencia |
| 17 | 5400 | Productivity King | Greatest Of All Time en aprendizaje |
| 18 | 6400 | Study GOAT | Emperador del imperio del enfoque |
| 19 | 7500 | Focus Emperor | Leyenda viva de la concentracion |
| 20 | 8800 | Shadow Sensei | Maestro supremo de zen y enfoque |
| 21 | 10300 | Ultimate Zen Master | Guerrero de enfoque de elite |
| 22 | 12000 | Focus Elite | Comandante de tu propia mente |
| 23 | 13900 | Mind Commander | Senor de todas las sesiones de estudio |
| 24 | 16000 | Study Overlord | Senor del estado de flujo supremo |
| 25 | 18300 | Flow State Lord | Titan de fuerza mental y enfoque |
| 26 | 20800 | Mental Titan | Emperador de disciplina inquebrantable |
| 27 | 23500 | Discipline Emperor | Rey del trabajo profundo |
| 28 | 26400 | Deep Work King | Habilidades cognitivas nivel bestia |
| 29 | 29500 | Cognitive Beast | Leyenda del enfoque |
| 30 | 32800 | Focus Legend | Ascendido a reinos mentales superiores |
| 31 | 36300 | Mind Ascendant | Maestria del flow de nivel semidios |
| 32 | 40000 | Flow Demigod | Senor de la guerra del zen |
| 33 | 44000 | Zen Warlord | Poderes divinos de concentracion |
| 34 | 48200 | Concentration Deity | Monarca de la ultra mente |
| 35 | 52600 | Ultra Mind Monarch | Dios del enfoque eterno |
| 36 | 57200 | Eternal Focus God | Deidad cosmica del estudio |
| 37 | 62000 | Cosmic Study Deity | Entidad de enfoque infinito |
| 38 | 67000 | Infinite Focus Entity | Maestro del grind eterno |
| 39 | 72200 | Timeless Grinder | Has superado las limitaciones mentales |
| 40 | 77600 | Transcendent Mind | Senor del enfoque del multiverso |
| 41 | 83200 | Multiverse Focus Lord | Rompes los limites de la realidad |
| 42 | 89000 | Reality Breaker | Viajando por dimensiones de estudio |
| 43 | 95000 | Study Dimension Walker | Maestria de enfoque a nivel cuantico |
| 44 | 101000 | Quantum Focus Master | Gobernante de mentes galacticas |
| 45 | 107500 | Galactic Mind Ruler | Senor del estudio infinito |
| 46 | 114500 | Infinity Study Overlord | Rey de la disciplina eterna |
| 47 | 122000 | Eternal Discipline King | Maquina imparable de enfoque |
| 48 | 130000 | Unstoppable Focus Machine | Ascendido con mente ilimitada |
| 49 | 138500 | Limitless Mind Ascendant | Mas alla de todas las leyendas |
| 50 | 147000 | Beyond Legend | Icono eterno de excelencia en el estudio |
| 51 | 157000 | Eternal Study Icon | Recien empiezas... |

### 3.4 Graficos de Progreso Semanal

- **Grafico de barras** mostrando minutos estudiados por dia de la semana actual
- Eje X: Lun, Mar, Mie, Jue, Vie, Sab, Dom
- Eje Y: minutos
- Barra del dia actual resaltada

### 3.5 Historial de Sesiones

- Lista cronologica de todas las sesiones
- Agrupadas por dia
- Cada sesion muestra:
  - Hora de inicio
  - Duracion (Xh Ym)
  - Materia/tag asociado (si tiene)
  - XP ganado
  - Modo (Focus/Stopwatch)

### 3.6 Mapa de Calor de Actividad

- Grid estilo GitHub contributions
- Muestra los ultimos 3-6 meses
- Cada celda = 1 dia
- Color mas intenso = mas minutos estudiados ese dia
- Colores: gris (0 min), dorado claro -> dorado oscuro (segun intensidad)

### 3.7 Distribucion de Materias

- **Grafico de dona/pie** mostrando porcentaje de tiempo por materia
- Solo materias con sesiones registradas
- "Sin materia" para sesiones sin tag
- Muestra las top 5 materias + "Otras"

---

## 4. NAVEGACION DENTRO DE MILO

La pantalla de Milo tiene **3 secciones** accesibles desde la pantalla principal:

### Opcion A: Bottom tabs dentro de Milo
```
[Timer]  [Ranking]  [Stats]
```

### Opcion B: Timer como pantalla principal + botones para acceder a Ranking y Stats
```
Timer (pantalla principal)
  -> Boton "Ranking" -> abre pantalla de clasificacion
  -> Boton "Stats" -> abre pantalla de estadisticas
```

**Recomendacion**: Opcion B - Timer es lo principal, Ranking y Stats son secundarios accesibles desde iconos/botones en el header.

---

## 5. CAMBIOS EN BACKEND

### 5.1 Nuevos Endpoints Necesarios

#### Rankings
- `GET /rankings/weekly` - Top 20 semanal + posicion del usuario
- `GET /rankings/monthly` - Top 20 mensual + posicion del usuario

#### Avatares
- `PUT /users/:userId/avatar` - Actualizar avatar del usuario

#### Tags Personalizados
- `GET /study-tags/:userId` - Listar tags del usuario
- `POST /study-tags` - Crear tag personalizado

### 5.2 Modificaciones a Endpoints Existentes

#### Pomodoro
- `POST /pomodoro` - Agregar campos: `mode` (focus/stopwatch), `tagId` (opcional)
- `GET /pomodoro/history/:userId` - Agregar modo y tag en respuesta

#### Gamification
- `POST /gamification/complete-session` - Actualizar logica de XP:
  - +1 XP por minuto (en vez de la logica actual)
  - +20 XP por dia de racha
  - +5 XP por sesion >25 min
- `GET /gamification/:userId` - Agregar: nivel con nombre de logro, sesion mas larga

### 5.3 Nuevas Tablas/Columnas

```sql
-- Tabla de tags personalizados
CREATE TABLE study_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columnas nuevas en pomodoro_sessions
ALTER TABLE pomodoro_sessions ADD COLUMN mode TEXT DEFAULT 'focus'; -- 'focus' | 'stopwatch'
ALTER TABLE pomodoro_sessions ADD COLUMN tag_id UUID REFERENCES study_tags(id);
ALTER TABLE pomodoro_sessions ADD COLUMN materia_id UUID; -- referencia a materia del plan

-- Columna de avatar en users o gamification
ALTER TABLE user_gamification ADD COLUMN avatar TEXT DEFAULT 'default';
ALTER TABLE user_gamification ADD COLUMN longest_session_minutes INT DEFAULT 0;
```

### 5.4 Logica de Rankings (Backend)

```sql
-- Ranking semanal (ejemplo query)
SELECT
  ug.user_id,
  ug.avatar,
  u.display_name,
  SUM(ps.duration_seconds) / 60 as total_minutes
FROM pomodoro_sessions ps
JOIN user_gamification ug ON ps.user_id = ug.user_id
JOIN auth.users u ON ps.user_id = u.id
WHERE ps.created_at >= date_trunc('week', NOW())
  AND ps.session_type = 'focus'
GROUP BY ug.user_id, ug.avatar, u.display_name
ORDER BY total_minutes DESC
LIMIT 20;
```

---

## 6. ARCHIVOS A MODIFICAR/CREAR

### Frontend - Nuevos
| Archivo | Descripcion |
|---------|-------------|
| `src/components/milo/CircularSlider.tsx` | Slider circular estilo Forest (0-120 min) |
| `src/components/milo/TimerScreen.tsx` | Pantalla principal del timer (Focus + Stopwatch) |
| `src/components/milo/SubjectSelector.tsx` | Selector de materia / tag personalizado |
| `src/components/milo/RankingScreen.tsx` | Pantalla de clasificaciones |
| `src/components/milo/RankingList.tsx` | Lista del top 20 |
| `src/components/milo/StatsScreen.tsx` | Pantalla de mis estadisticas |
| `src/components/milo/WeeklyChart.tsx` | Grafico de barras semanal |
| `src/components/milo/HeatMap.tsx` | Mapa de calor de actividad |
| `src/components/milo/SubjectDistribution.tsx` | Grafico de dona de materias |
| `src/components/milo/AvatarPicker.tsx` | Selector de avatar |
| `src/components/milo/LevelBadge.tsx` | Badge de nivel con nombre de logro |
| `src/components/milo/XPProgressBar.tsx` | Barra de progreso de XP |
| `src/hooks/useStopwatch.ts` | Hook para modo cronometro |
| `src/hooks/useRankings.ts` | Hook para obtener rankings |
| `src/constants/levels.ts` | Tabla de niveles/logros y funcion de calculo |

### Frontend - Modificar
| Archivo | Cambio |
|---------|--------|
| `app/(tabs)/milo.tsx` | Redisenar como hub con Timer + acceso a Ranking/Stats |
| `src/hooks/usePomodoroTimer.ts` | Adaptar para slider (tiempo variable) en vez de 25/5/15 fijos |
| `src/services/api.ts` | Agregar endpoints de rankings, tags, avatar |

### Backend - Nuevos
| Archivo | Descripcion |
|---------|-------------|
| `src/routes/rankings.routes.ts` | Rutas de rankings |
| `src/controllers/rankings.controller.ts` | Controller de rankings |
| `src/services/rankings.service.ts` | Logica de rankings semanales/mensuales |
| `src/routes/study-tags.routes.ts` | Rutas de tags |
| `src/controllers/study-tags.controller.ts` | Controller de tags |
| `src/services/study-tags.service.ts` | CRUD de tags |
| `migrations/add_rankings_and_tags.sql` | Migracion de nuevas tablas |

### Backend - Modificar
| Archivo | Cambio |
|---------|--------|
| `src/services/gamification.service.ts` | Nueva logica de XP (+1/min, +20/racha, +5/>25min) |
| `src/services/pomodoro.service.ts` | Soporte para mode, tag_id, materia_id |
| `src/controllers/pomodoro.controller.ts` | Aceptar nuevos campos |

---

## 7. PLAN DE MINI TAREAS

Las tareas estan ordenadas por dependencia. Cada tarea es autocontenida.

### Fase 1: Fundamentos
1. Crear constantes de niveles/logros (`levels.ts`)
2. Crear componente CircularSlider
3. Crear hook useStopwatch
4. Adaptar usePomodoroTimer para tiempo variable

### Fase 2: Timer Screen
5. Crear SubjectSelector (materias + tags custom)
6. Crear TimerScreen con ambos modos (Focus + Stopwatch)
7. Redisenar `milo.tsx` como hub principal

### Fase 3: Estadisticas
8. Crear LevelBadge y XPProgressBar
9. Crear StatsScreen con perfil y stats principales
10. Crear WeeklyChart (grafico de barras)
11. Crear HeatMap (mapa de calor)
12. Crear SubjectDistribution (grafico de dona)
13. Crear AvatarPicker

### Fase 4: Rankings
14. Crear RankingList component
15. Crear RankingScreen con tabs semanal/mensual

### Fase 5: Backend
16. Migracion SQL (nuevas tablas y columnas)
17. Actualizar gamification service (nueva logica XP)
18. Actualizar pomodoro service (mode, tags)
19. Crear rankings service + routes
20. Crear study-tags service + routes

### Fase 6: Integracion
21. Conectar frontend con nuevos endpoints
22. Testing y ajustes finales

---

## 8. NOTAS TECNICAS

- **No usar Skia** para graficos en esta rama (estamos en Expo Go)
- Usar `react-native-svg` para CircularSlider, graficos y heatmap
- Usar `expo-haptics` para feedback tactil al deslizar el timer
- El PremiumGate se mantiene pero con `__devSetPremium()` para testing
- Los rankings son anonimos por privacidad (GDPR friendly)
- Los tags personalizados son privados del usuario
