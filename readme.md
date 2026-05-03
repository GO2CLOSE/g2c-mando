# G2C Mando · v1.6.6

**ERP personal y operativo para Alan Davis · founder GO2CLOSE.**

PWA single-user para móvil con cerebro IA conectado, ejecución de acciones por voz/texto, sistema completo de finanzas, música, cuidado personal y notificaciones push selectivas. Deployado en `alan.g2c.com.mx`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Vanilla JS · HTML · CSS · sin frameworks |
| PWA | Service Worker v1.6 · cache versionado · manifest installable |
| IA | Claude Sonnet 4.6 + Haiku 4.5 vía proxy Cloudflare Worker |
| Storage | localStorage (single-user) |
| Push | Web Push API + VAPID + Cloudflare Worker scheduler |
| Hosting frontend | Netlify (drag & drop) |
| Backend proxy | Cloudflare Worker (`g2c-mando-push.direccionalom.workers.dev`) |
| KV store | Cloudflare KV (PUSH_KV) para keys, subs, scheduling |

Dominio: `alan.g2c.com.mx` · DNS GoDaddy · SSL Let's Encrypt vía Netlify.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    iPhone PWA · Safari                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              alan.g2c.com.mx (Netlify)                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ Frontend: shared.js + 8 HTMLs + sw.js + css     │  │ │
│  │  │   localStorage · 47 keys · single-user           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│       Cloudflare Worker · g2c-mando-push (v1.4)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PUSH_KV (Cloudflare KV)                               │ │
│  │   · subs:{userId}:* · usage:* · conn:*                 │ │
│  │   · schedule:{minute}:{uuid}  ← cron 1/min            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Endpoints:                                                  │
│   /health · /api/chat · /api/models · /api/connect          │
│   /api/disconnect · /api/check · /api/maps · /api/youtube   │
│   /subscribe · /schedule · /sync-reminders · /send-now      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼──────────────────┐
            ▼                 ▼                  ▼
       Anthropic API    Google Maps API    YouTube API
       (Sonnet/Haiku)   (places)           (search)
```

---

## Estructura de archivos

```
/
├── index.html              · Home / Mando · briefing IA + chips + timeline
├── chat.html               · Conversación libre con Sonnet
├── calendario.html         · Eventos cruzados de todos los módulos
├── finanzas.html           · 5 tabs: Resumen / Trabajo / Recurrentes / Personal / Objetivos / Proyecciones
├── musica.html             · Repertorio + tocadas + ensayos + setlist IA
├── pendientes.html         · Tareas + recordatorios + objetivos
├── cuidado.html            · 4 tabs: Perfil / Ejercicio / Dieta / Ocio
├── config.html             · Diagnóstico + conexiones API + datos fiscales + notif prefs
├── shared.js               · 4,300 líneas · TODOS los módulos compartidos
├── shared.css              · variables CSS + utilidades
├── sw.js                   · Service Worker · cache versionado v1.6
├── manifest.json           · PWA installable
└── icons/                  · 9 íconos en distintos tamaños
```

### Módulos en `shared.js`

| Módulo | Función |
|---|---|
| `G2C` | Constantes globales · version, user, models, branding, api endpoints |
| `Auth` | SHA256 hash · session 30 días · password Alan1992 |
| `Util` | esc, fmtMoney, fmtMoneyK, fmtDate, greeting, etc. |
| `Store` | Wrapper localStorage · KEYS dictionary · safe parse |
| `IA` | call · briefing · tip · detectIntent · trackUsage · buildSystemPrompt |
| `Cascada` | registrarMovimiento, registrarGasto, etc. (data layer) |
| **`Actions`** | **CRUD universal · 30 acciones para IA y UI · ver detalle abajo** |
| `UI` | renderStatusBar, renderChatInput, renderFooter, renderBottomNav, toast |
| `Cliente`, `Recurrentes`, `Servicios`, `Musica`, `Pendientes` | Domain-specific helpers |
| `PerfilFisico`, `Expediente`, `Presupuesto` | Cuidado personal |
| `Alertas`, `Recordatorios`, `NotifPrefs` | Sistema de notificaciones |
| `Push` | Web Push API + VAPID subscribe |
| `Proyecciones`, `ProactivIA` | Análisis estratégico |
| `Attach`, `SAT` | Adjuntos PDF + calendario fiscal |

---

## Sistema de Actions (CRUD universal)

Capa única de comandos invocables tanto por la IA (vía bloques en chat) como por la UI directa.

### Flujo

```
Usuario: "Lanmarc ahora paga 7500"
   ↓
Sonnet recibe system prompt + catálogo + reglas
   ↓
Sonnet responde:
   ```action
   {"action": "editar_cliente", "args": {"id_o_nombre": "Lanmarc", "monto": 7500}}
   ```
   Subido a 7500. ¿Aplica desde el próximo cobro o ya?
   ```action
   {"action": "quick_choices", "args": {"choices": ["Desde próximo cobro", "Aplica ya este mes", "Ver todos los cobros"]}}
   ```
   ↓
chat.html parsea bloques · ejecuta · renderiza:
   ✓ Cliente "Lanmarc Beauty Spa" actualizado · monto: $6500 → $7500
   [Botones: Desde próximo cobro] [Aplica ya este mes] [Ver todos los cobros]
   [↶ Deshacer]
```

### Catálogo (30 acciones)

| Categoría | Acciones |
|---|---|
| **Recordatorios** | `crear_recordatorio` · `editar_recordatorio` · `eliminar_recordatorio` |
| **Pendientes** | `crear_pendiente` · `editar_pendiente` · `completar_pendiente` · `eliminar_pendiente` |
| **Clientes** | `crear_cliente` · `editar_cliente` · `eliminar_cliente` |
| **Movimientos** | `registrar_movimiento` · `editar_movimiento` · `eliminar_movimiento` |
| **Tocadas** | `crear_tocada` · `editar_tocada` · `eliminar_tocada` |
| **Canciones** | `crear_cancion` · `editar_cancion` · `eliminar_cancion` |
| **Objetivos** | `crear_objetivo` · `editar_objetivo` · `eliminar_objetivo` |
| **Cobros recurrentes** | `crear_cobro_recurrente` · `editar_cobro_recurrente` · `eliminar_cobro_recurrente` |
| **Pagos recurrentes** | `crear_pago_recurrente` · `editar_pago_recurrente` · `eliminar_pago_recurrente` |
| **Perfil físico** | `editar_perfil` |
| **Presupuestos** | `editar_presupuesto` |
| **Notificaciones** | `toggle_notif` |
| **Lecturas** | `listar` (clientes, pendientes, recordatorios, tocadas, canciones, objetivos, cobros, pagos, movimientos) |
| **Sugerencias** | `sugerir` (genera tarjeta Aprobar/Rechazar) |
| **UI** | `quick_choices` (botones de respuesta rápida en chat) |

### Reglas duras del system prompt

1. Pedido explícito → ejecuta acción · NUNCA "hazlo tú desde la interfaz"
2. Toda respuesta de chat termina con `quick_choices` (2-4 botones)
3. Inferencia → `sugerir`, NO ejecutes directo
4. Eliminaciones requieren confirmación inline (sin `confirmar:true` la primera vez)
5. Edición por `id_o_nombre`/`id_o_titulo` con búsqueda parcial case-insensitive
6. Fechas siempre ISO `YYYY-MM-DDTHH:mm:00` zona MX
7. Sin data → `listar` primero
8. Nunca digas "no puedo editar/eliminar X" · todo se puede
9. Respuestas cortas · max 3 oraciones
10. Cero "escríbele a alguien" · ejecuta o sugiere acción del sistema

### Scope-aware prompt

`Actions.buildPromptCatalog(scope)` detecta scope:

- `chat` (default) → catálogo completo + quick_choices obligatorio
- `briefing` / `tip` / `analisis` / `pulso` → texto narrativo, SIN bloques action

Esto evita que el briefing del home muestre `\`\`\`action\`\`\`` literal.

---

## Sistema de notificaciones

### NotifPrefs (17 tipos en 6 categorías)

| Categoría | Tipos |
|---|---|
| Finanzas (8) | cobro_vencido, cobro_recurrente_proximo, pago_recurrente_proximo, gasto_dia_alto, gasto_dia_rebasado, gasto_individual_alto, presupuesto_rebasado, presupuesto_cerca |
| Música (2) | tocada, ensayo_recordatorio |
| SAT (1) | fiscal |
| Tareas (2) | pendiente_alta, pendiente_vencido |
| Salud (2) | ejercicio_recordatorio, salud_alerta |
| ProactivIA (2) | sugerencia_recurrente, patron_detectado |

### Filtrado

`Alertas.emit(alerta)` consulta `NotifPrefs.isEnabled(tipo)` antes de emitir. Si está OFF, no se crea la alerta · cero ruido.

### Push web

- VAPID public/private en Cloudflare Worker como Secret
- Worker recibe `subscription` por `/subscribe`
- App envía recordatorios futuros por `/sync-reminders`
- Cron del Worker dispara push en la minuto exacto

---

## Storage schema (localStorage)

47 keys totales · prefijo `alan_mando_*`:

```
alan_mando_auth                  · session expiry
alan_mando_config                · datos fiscales, conexiones, prefs
alan_mando_calendario            · 29 eventos cruzados
alan_mando_canciones             · repertorio musical
alan_mando_eventos_musica        · tocadas + privados
alan_mando_ensayo                · próximo ensayo
alan_mando_finanzas              · movimientos legacy
alan_mando_movimientos           · movimientos formato nuevo
alan_mando_pendientes            · tareas + recordatorios
alan_mando_chat_conversations    · histórico chat IA
alan_mando_chat_actions          · log de actions ejecutadas
alan_mando_chat_stats            · tokens IN/OUT por modelo
alan_mando_skills                · skill log
alan_mando_objetivos             · metas + KPIs
alan_mando_clientes              · cuentas G2C
alan_mando_servicios_fijos       · proveedores recurrentes (legacy)
alan_mando_pagos_recurrentes     · pagos formato nuevo
alan_mando_cobros_recurrentes    · cobros recurrentes
alan_mando_cuentas_cobrar        · CXC puntuales
alan_mando_cuentas_pagar         · CXP puntuales
alan_mando_achievements          · log de hitos
alan_mando_attachments           · PDFs cédulas/CFDIs
alan_mando_perfil_fisico         · datos médicos Alan
alan_mando_expediente            · análisis biomarcadores
alan_mando_presupuestos          · límites mota/shopping/etc
alan_mando_alertas               · alertas no leídas (max 100)
alan_mando_recordatorios         · agendados vía IA o manual
alan_mando_notif_prefs           · qué tipos están ON/OFF
alan_mando_sugerencias           · IA propone, usuario aprueba/rechaza
alan_mando_proactiv_state        · última revisión, hits emitidos
alan_mando_gasto_dia_alerts      · throttle de gasto del día
alan_mando_entrenamientos        · sesiones registradas
alan_mando_ejercicio_agenda      · sesiones agendadas
alan_mando_dieta_semanal         · plan dieta
alan_mando_compras_mota          · log mota recreativa
alan_mando_compras_shopping      · viajes USA
alan_mando_gaming_sesiones       · PS5
alan_mando_lyrics                · cache letras
alan_mando_proveedores           · directorio
alan_mando_gastos_negocio        · gastos B2B
alan_mando_sat_calendar          · obligaciones fiscales 2026
alan_mando_bitacoras             · bitácora trabajo
alan_mando_bitacora_personal     · bitácora personal
alan_mando_cfdis                 · facturas
alan_mando_decisiones            · log de decisiones tomadas
alan_mando_push_subscription     · sub WebPush
alan_mando_last_briefing         · timestamp último briefing
```

---

## Setup local

```bash
# 1. Clonar (o descomprimir el zip)
unzip g2c-mando-v1.6.6.zip -d g2c-mando

# 2. Servir local (cualquier server estático)
cd g2c-mando
python3 -m http.server 8080
# o: npx serve .

# 3. Abrir http://localhost:8080
# Login: Alan1992
```

**Sin build step.** Todo es vanilla JS servido directo.

---

## Deploy

### Frontend (Netlify)

1. Empacar todo en ZIP
2. netlify.app → drag & drop el ZIP en el sitio existente
3. Esperar 30 seg
4. PWA en iPhone → cerrar Safari completo · reabrir
5. SW v1.6 detecta nueva versión · borra cache viejo · activa código nuevo

### Worker (Cloudflare)

1. Cloudflare Dashboard → Workers & Pages → `g2c-mando-push`
2. Edit Code → pegar contenido nuevo
3. Save and Deploy
4. Verificar: `curl https://g2c-mando-push.direccionalom.workers.dev/health`

### Variables de entorno (Worker Secrets)

| Variable | Tipo | Para qué |
|---|---|---|
| `PUSH_KV` | KV namespace binding | Storage subs + scheduling |
| `VAPID_PUBLIC_KEY` | Variable | Push notifications |
| `VAPID_PRIVATE_KEY` | **Secret** | Push notifications |
| `VAPID_SUBJECT` | Variable | mailto:admin@g2c.com.mx |
| `ANTHROPIC_API_KEY` | **Secret** (opcional) | Fallback si cliente no conectó |
| `ADMIN_SECRET` | **Secret** | Para `/send-now` admin |
| `GOOGLE_MAPS_KEY` | Variable (opcional) | Fallback Maps |
| `YOUTUBE_API_KEY` | Variable | YouTube search |

---

## Conectar APIs

Configuración → Conexiones API:

1. **Anthropic Claude** → pegar key `sk-ant-...` → Conectar (se guarda en KV del Worker, NUNCA en cliente)
2. **YouTube Data** → pegar key `AIza...` → Conectar
3. **Google Maps** → opcional
4. **Whisper** → opcional (audio→texto)
5. **Zoho Bigin** → opcional

Las keys NO se guardan en cliente. Solo metadata `connected_at` para mostrar status.

---

## Troubleshooting

### "No pude conectar con el cerebro IA"

| Error | Causa | Fix |
|---|---|---|
| `messages.0.role: Field required` | Historial corrupto en localStorage | Botón Limpiar en chat (top-right) o auto-migrador en v1.6.5+ |
| `model: claude-sonnet-4-XXX` deprecado | SW sirvió código viejo cacheado | Cerrar Safari completo · reabrir |
| `no_api_key` | Worker sin Secret `ANTHROPIC_API_KEY` o KV vacío | Configuración → conectar Anthropic |
| `Worker viejo · no soporta /api/models` | Worker en Cloudflare es v1.3 | Deployar Worker v1.4+ |
| `stats[key].msgs undefined` | Storage chat_stats malformado | trackUsage auto-repara desde v1.6.1 |

### Briefing del home muestra ` ```action ``` ` literal

Pre-v1.6.5. Actualizar a v1.6.5+ donde el briefing usa scope `briefing` que excluye catálogo + doble defensa stripFromResponse en render.

### Click en cliente no hace nada

Pre-v1.6.4. Actualizar para tener modal de detalle completo (LTV, MRR, historial, pendientes, objetivos vinculados).

### Diagnóstico OK pero chat falla

Diagnóstico hace llamada limpia · chat reusa historial. Limpiar conversación o re-cargar (auto-migrador desde v1.6.5).

### Push notifications no llegan en iPhone

1. PWA debe estar instalada (compartir → Agregar a pantalla de inicio)
2. Permitir notificaciones cuando lo pida
3. Cerrar Safari · reabrir desde icono PWA
4. Configuración → Notificaciones push → Activar

---

## Changelog reciente

### v1.6.6 (current)
- Versión base estable post-fixes acumulados

### v1.6.5
- **Fix crítico**: bug `messages.0.role: Field required`
- Auto-migrador del historial corrupto al cargar chat
- Sanitizado pre-API call (filtra entries malformadas)
- Briefing del home con scope read-only (sin bloques action)
- Doble defensa: `stripFromResponse` también en render del briefing

### v1.6.4
- Sistema `quick_choices` (botones de respuesta rápida en chat)
- Modal de detalle de cliente (LTV, MRR, historial, vinculados)
- Notificaciones movidas a section-block dedicado con counter visible
- Toggles más grandes (46×26)
- Parser de Actions tolerante (`\`\`\`action`, `\`\`\`json`, `\`\`\`tool`, JSON inline)
- Detector de "claim falso" (alerta visible si IA dice editó sin emitir bloque)
- Worker v1.4 con `/api/models`

### v1.6.3
- CRUD universal · `editar_*` y `eliminar_*` para TODO
- Sugerencias IA con tarjetas Aprobar/Rechazar inline
- Tarjetas de confirmación para destructivas
- Tarjetas de Undo automáticas
- Identificación por nombre parcial (id_o_titulo, id_o_nombre, etc.)

### v1.6.2
- Sistema de Actions completo (capa única IA + UI)
- 17 acciones ejecutables
- System prompt con catálogo + reglas duras

### v1.6.1
- Hotfix `IA.trackUsage` y `renderStats` blindados
- SW v1.6 cache versionado · network-first agresivo

### v1.6.0
- Check automático de modelos en diagnóstico
- Perfil físico vista/edición
- RFC fiscal vista/edición
- Tab Proyecciones movido a Finanzas con dashboard anual + tips IA

### v1.5.x
- Push notifications fix
- Modelos `claude-sonnet-4-6` + `claude-haiku-4-5-20251001`
- Patrones IA · Estado de Resultados · Cuidado Personal completo

### v1.4.x
- Cloudflare Worker proxy
- Conexión Anthropic via KV (key nunca en cliente)
- Modal G2C branding

### v1.0–v1.3
- Iteraciones tempranas: layout, finanzas básicas, calendar, música, expediente médico

---

## Reglas de identidad y producto

Estas son reglas duras que el código y la IA respetan:

- **G2C nunca se llama "agencia de marketing"** · siempre "infraestructura comercial replicable"
- **Nunca nombrar vendors externos a clientes** · "proveedores externos" / "herramientas del proyecto"
- **Costos anualizados al inicio del proyecto**, no prorrateados
- **Sin emojis** en notificaciones · símbolos limpios `★ · ▸ ◆ ✓`
- **Tone MX neutro** · "va", "no, va?", contracciones · NO "vos", NO formalismos
- **Estrella G2C** 11×11px `#FF4F00` opacity 0.35→0.85 hover, footer cada módulo
- **Paleta**: Primary `#FF4F00` · Secondary `#FF7A00` · Dark `#0F1419` / `#14181F`
- **Fonts**: Inter (body) · DM Serif Display (display) · JetBrains Mono (mono)
- **El constraint principal de Alan es TIEMPO, no dinero**
- **G2C tiene ROI 6× mejor por hora vs música**, pero música es ingreso paralelo confiable
- **Si el ciclo de venta lleva >45 días, sugerir cortar**

---

## Pricing G2C (visible en cotizador)

- Plan **Visor** $7,000/mes · 24 SKUs nivel CRM-01 a CRM-06
- Plan **Parcial** $12,000/mes · CRM + OPS-01 a OPS-03
- Plan **Total** $16,000/mes · todo + OPS-04 a OPS-06

Surcharges:
- Arranque: +10%
- Control: +7%
- Cierre: +0%

Tier modifica precio mensual antes del IVA.

---

## Identidad técnica

- **PWA single-user**: NO multi-tenant, NO multi-device sync, NO cloud DB
- Storage local + Worker proxy = simplicidad operativa
- Cero dependencies front · todo vanilla JS
- Todo el código en un solo `shared.js` (4,300 líneas) por diseño · facilita debug y refactor

---

## Contacto · creador

Alan Davis · founder GO2CLOSE
Tijuana / Ensenada, Baja California, MX
`g2c.com.mx`

PWA accesible solo para Alan. No publicado, no multi-usuario.

---

**Versión actual: 1.6.6 · 3 mayo 2026**
