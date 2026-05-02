/* G2C Mando v1.0 · shared.js
 * Created by Alan Davis · powered by g2c.com.mx
 *
 * Cerebro inteligente con:
 * - Router Sonnet 4.5 / Haiku 4.5
 * - Knowledge base G2C (modelo de negocio + 24 SKUs + 3 personas)
 * - CRUD completo por voz/texto
 * - Cascadas de cobro adoptadas
 * - Tips aterrizados al contexto Tijuana/Ensenada
 * - Distinción trabajo vs personal automática
 */

// ============================================================
// 1 · CONFIG GLOBAL
// ============================================================

const G2C = {
  version: '1.0.0',
  user: {
    name: 'Alan',
    fullName: 'Alan Davis',
    company: 'GO2CLOSE',
    domain: 'g2c.com.mx',
    location: 'Tijuana/Ensenada · Baja California, MX',
    rfc: 'DAVA920607XXX',
    tax_regime: 'Actividad empresarial · 16% IVA · No RESICO'
  },
  api: {
    anthropic: 'https://api.anthropic.com/v1/messages',
    proxy: 'https://g2c-mando-push.direccionalom.workers.dev', // Cloudflare worker
    youtube: 'https://www.googleapis.com/youtube/v3'
  },
  models: {
    sonnet: 'claude-sonnet-4-20250514',
    haiku: 'claude-haiku-4-5-20251001'
  },
  auth: {
    hash: '0db087d6b415b97c7641ef7862e88c9aa88323f3c488150ed09d6d1c45c6efc0'
  },
  push: {
    vapid_public: 'BL7J3TfdZEosrdDc5IWs5BBzM6uj0-1PiOPmhNeo0fp08E_NQdrW-VWB8u0b9zANoL5zd2su8gCEcPg8d79fwVM',
    server: 'https://g2c-mando-push.direccionalom.workers.dev'
  }
};

// ============================================================
// 2 · KNOWLEDGE BASE G2C (modelo de negocio cargado)
// ============================================================

const KB = {
  // Diferenciador clave
  positioning: 'Infraestructura comercial replicable. NUNCA decir "agencia de marketing".',

  // Tiers de servicio
  tiers: {
    visor: { mrr: 7000, setup: 'CRM base + tracking', target: 'negocios validando' },
    parcial: { mrr: 12000, setup: 'Visor + automation + apps', target: 'negocios con tracción' },
    total: { mrr: 16000, setup: 'Parcial + chatbot + Creator', target: 'negocios escalando' }
  },

  // Surcharges
  surcharges: {
    arranque: 0.10,  // +10% primeros 3 meses
    control: 0.07,   // +7% intermedio
    cierre: 0.00     // +0% contratos largos
  },

  // 3 personas validadas
  personas: {
    salud: {
      name: 'Dr. Eduardo · Salud regenerativa',
      validated_with: 'NEOS Regenerative Clinic',
      tier: 'total',
      surcharge: 'arranque',
      ticket: 17600, // 16000 * 1.10
      pain: 'Pacientes no convierten a tratamientos largos',
      stack_actual: 'WhatsApp + Excel + redes sueltas',
      trigger: 'Mes con caída pacientes nuevos'
    },
    food_dtc: {
      name: 'Andrea · Alimentación healthy',
      validated_with: 'SmartMeals',
      tier: 'parcial',
      surcharge: 'control',
      ticket: 12840, // 12000 * 1.07
      pain: 'Crece por bocas pero churn alto · sin retención',
      stack_actual: 'Instagram + WhatsApp + planilla manual',
      trigger: 'Quiere escalar 100 → 500 clientes/mes'
    },
    canal: {
      name: 'Roberto · Distribuidor canal',
      validated_with: 'Alom Connect',
      tier: 'visor',
      surcharge: 'arranque',
      ticket: 7700, // 7000 * 1.10
      pain: 'Faltan tools captar leads + trackear comisiones',
      stack_actual: 'Hojas cálculo + WhatsApp',
      trigger: 'Quiere reclutar más referidores'
    }
  },

  // 24 productos SKU (catálogo completo)
  productos: {
    // CAPA 1 · CRM
    'CRM-01': { nombre: 'Setup Zoho CRM Base', setup: 15000, mrr: 3000 },
    'CRM-02': { nombre: 'Setup Zoho CRM Avanzado', setup: 30000, mrr: 5000 },
    'CRM-03': { nombre: 'Setup Zoho CRM Enterprise', setup: 60000, mrr: 8000 },
    'CRM-04': { nombre: 'Migración de datos', setup: 10000, mrr: 0 },
    'CRM-05': { nombre: 'Capacitación equipo', setup: 8000, mrr: 0 },
    // CAPA 2 · Captación
    'CAP-01': { nombre: 'Landing Conversión Premium', setup: 20000, mrr: 0 },
    'CAP-02': { nombre: 'Diagnóstico Inteligente', setup: 25000, mrr: 2000 },
    'CAP-03': { nombre: 'Tarjeta Digital Pro', setup: 8000, mrr: 0 },
    'CAP-04': { nombre: 'Sistema Cobros/Billing', setup: 20000, mrr: 3000 },
    'CAP-05': { nombre: 'Lead Magnet', setup: 9000, mrr: 0 },
    'CAP-06': { nombre: 'Funnel Meta Ads + Landing', setup: 18000, mrr: 4000 },
    // CAPA 3 · Conexión
    'CON-01': { nombre: 'Tracking GTM+GA4+Pixel', setup: 10000, mrr: 1500 },
    'CON-02': { nombre: 'WhatsApp Business API', setup: 15000, mrr: 3000 },
    'CON-03': { nombre: 'Email automation', setup: 8000, mrr: 2000 },
    'CON-04': { nombre: 'Integración API custom', setup: 27500, mrr: 0 },
    'CON-05': { nombre: 'Chatbot Conversacional IA', setup: 25000, mrr: 4000 },
    'CON-06': { nombre: 'Dashboard Zoho Analytics', setup: 12000, mrr: 2500 },
    'CON-07': { nombre: 'Push Notifications PWA', setup: 15000, mrr: 1500 },
    // CAPA 4 · Operación
    'OPS-01': { nombre: 'Mantenimiento Visor', setup: 0, mrr: 3000 },
    'OPS-02': { nombre: 'Mantenimiento Parcial', setup: 0, mrr: 6000 },
    'OPS-03': { nombre: 'Mantenimiento Total', setup: 0, mrr: 8000 },
    'OPS-04': { nombre: 'Auditoría trimestral', setup: 8000, mrr: 0 },
    'OPS-05': { nombre: 'Capacitación adicional', setup: 4000, mrr: 0 },
    'OPS-06': { nombre: 'Diagnóstico fiscal CFDI', setup: 0, mrr: 2500 }
  },

  // Matriz: giro → productos recomendados
  matriz_giros: {
    salud: ['CRM-02', 'CAP-02', 'CAP-04', 'CON-02', 'CON-05', 'OPS-02'],
    inmobiliaria: ['CRM-03', 'CAP-01', 'CAP-06', 'CON-04', 'CON-06', 'OPS-03'],
    distribuidor: ['CRM-03', 'CAP-03', 'CAP-04', 'CON-04', 'CON-06', 'OPS-02'],
    ecommerce: ['CRM-02', 'CAP-04', 'CAP-06', 'CON-01', 'CON-03', 'CON-04'],
    restaurante: ['CRM-02', 'CAP-04', 'CAP-01', 'CON-02', 'CON-04', 'CON-07'],
    servicios_pro: ['CRM-02', 'CAP-03', 'CAP-02', 'CON-03', 'OPS-04', 'OPS-06'],
    educacion: ['CRM-02', 'CAP-02', 'CAP-04', 'CON-03', 'CON-05', 'CON-07'],
    food_dtc: ['CRM-02', 'CAP-04', 'CAP-06', 'CON-02', 'CON-03', 'OPS-02']
  },

  // Lugares música en vivo Tijuana/Ensenada (curado, real)
  music_venues_tj: [
    { nombre: 'Mantamar Bar', zona: 'Río Tijuana', estilo: 'acústico íntimo', pago: '$1500-2000', dias: 'jue-sab' },
    { nombre: 'Las Pulgas', zona: 'Av Revolución', estilo: 'rock pop alternativo', pago: '$1500', dias: 'vie' },
    { nombre: 'Casa Verde Café', zona: 'Cacho', estilo: 'folk acústico', pago: '$1200-1800', dias: 'sab' },
    { nombre: 'La Justina', zona: 'Av Revolución', estilo: 'cantautor', pago: '$1500-2500', dias: 'vie-sab' },
    { nombre: 'Cine Tonalá', zona: 'Cacho', estilo: 'eventos privados', pago: '$2000-3500', dias: 'según evento' }
  ],

  // Restaurantes Tijuana con potencial comercial G2C (B2B prospects)
  restaurant_prospects_tj: [
    { nombre: 'La Justina', zona: 'Av Revolución', ig_seguidores: 12000, gap: 'sin sistema reservas online', pitch_sku: 'CAP-04', valor: 'subir reservas 35% como SmartMeals' },
    { nombre: 'El Taller Baja Med', zona: 'Plaza Río', ig_seguidores: 8000, gap: 'responden tarde WhatsApp', pitch_sku: 'CON-02 + CON-05', valor: 'sin recepcionista 24/7' },
    { nombre: 'Verde y Crema', zona: 'Río Tijuana', ig_seguidores: 18000, gap: 'solo Instagram, sin CRM', pitch_sku: 'CRM-02 + CAP-04 + CON-02', valor: 'Plan Parcial $12K · sistema completo' },
    { nombre: 'Cine Tonalá', zona: 'Cacho', ig_seguidores: 15000, gap: 'eventos privados sin landing', pitch_sku: 'CAP-01 + CAP-04', valor: 'gestiona eventos privados con anticipo' },
    { nombre: 'Madueño', zona: 'Aviación', ig_seguidores: 6000, gap: 'cola sábados sin reservas', pitch_sku: 'CAP-04', valor: 'evita no-shows con anticipo' }
  ],

  // Objeciones y respuestas (script ventas)
  objeciones: {
    'ya_tenemos_agencia': 'G2C no es agencia · es infraestructura. Cuando termina el contrato con tu agencia, ¿qué queda? Con G2C el sistema sigue funcionando. ¿Quieres ver el caso NEOS?',
    'es_caro': 'Veamos ROI. SmartMeals subió ventas 35% en 60 días con Plan Parcial. La inversión se paga en mes 2.',
    'in_house': '6 meses de implementación in-house vs 30-60 días con G2C. Calcula el costo de oportunidad de los 4 meses extra.',
    'hablar_con_socio': 'Te paso un Loom de 5 min con la propuesta. Agendamos los 3 el día específico.',
    'mas_info': '¿Qué información específica te ayudaría a decidir? Te mando solo eso · sin saturar.'
  },

  // Reglas operativas no negociables
  reglas: [
    'Nunca decir "agencia de marketing" → siempre "infraestructura comercial replicable"',
    'Nunca nombrar vendors externos a clientes (GoDaddy, Zoho, Netlify) → "proveedores externos"',
    'Costos anualizados se cobran al inicio · no se prorratean',
    'Contratos mínimos 3 meses · si ciclo >45 días no cierra, cortar',
    'Margen objetivo: 70% mínimo, 89-95% en operación lean actual',
    'Constraint principal del modelo: TIEMPO no dinero (60% horas operativas/semana)',
    'Operador único es ÚNICO punto de fallo · documentar todo'
  ],

  // KPIs target
  kpis: {
    diagnosticos_semana: '5-8',
    llamadas_semana: '2-3',
    propuestas_semana: '1-2',
    cuentas_mes: '1-2',
    ticket_promedio: 11000,
    cac_max: 3000,
    ltv_24m_min: 264000,
    churn_max: 0.10,
    margen_min: 0.70
  }
};

// ============================================================
// 3 · STORAGE LAYER (22 keys + nueva bitácora personal)
// ============================================================

const Store = {
  KEYS: {
    AUTH: 'alan_mando_auth',
    CONFIG: 'alan_mando_config',
    CALENDARIO: 'alan_mando_calendario',
    CANCIONES: 'alan_mando_canciones',
    EVENTOS_MUSICA: 'alan_mando_eventos_musica',
    ENSAYO: 'alan_mando_ensayo',
    FINANZAS: 'alan_mando_finanzas',
    PENDIENTES: 'alan_mando_pendientes',
    CHAT_CONV: 'alan_mando_chat_conversations',
    CHAT_ACTIONS: 'alan_mando_chat_actions',
    CHAT_STATS: 'alan_mando_chat_stats',
    SKILLS: 'alan_mando_skills',
    RECORDATORIOS: 'alan_mando_recordatorios',
    OBJETIVOS: 'alan_mando_objetivos',
    CLIENTES: 'alan_mando_clientes',
    SERVICIOS_FIJOS: 'alan_mando_servicios_fijos',
    BITACORAS: 'alan_mando_bitacoras',
    BITACORA_PERSONAL: 'alan_mando_bitacora_personal', // NUEVO v1.0
    CFDIS: 'alan_mando_cfdis',
    CXC: 'alan_mando_cuentas_cobrar',
    CXP: 'alan_mando_cuentas_pagar',
    ACHIEVEMENTS: 'alan_mando_achievements',
    DECISIONES: 'alan_mando_decisiones',
    ATTACHMENTS: 'alan_mando_attachments',
    PUSH_SUB: 'alan_mando_push_subscription'
  },

  get(key, defaultVal = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch (e) { return defaultVal; }
  },

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  push(key, item) {
    const arr = this.get(key, []);
    arr.push({ id: 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), ts: Date.now(), ...item });
    return this.set(key, arr);
  },

  update(key, id, patch) {
    const arr = this.get(key, []);
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...patch, updated_at: Date.now() };
    return this.set(key, arr);
  },

  remove(key, id) {
    const arr = this.get(key, []);
    return this.set(key, arr.filter(x => x.id !== id));
  },

  // Snapshot completo del ERP para construir contexto IA
  snapshot() {
    const out = {};
    for (const k of Object.values(this.KEYS)) {
      if (k === this.KEYS.AUTH) continue;
      out[k.replace('alan_mando_', '')] = this.get(k);
    }
    return out;
  }
};

// ============================================================
// 4 · DETECTORES & UTILS
// ============================================================

const Util = {
  fmtMoney(n, sym = '$') {
    if (n == null) return '—';
    return sym + Math.round(n).toLocaleString('es-MX');
  },

  fmtMoneyK(n) {
    if (n == null) return '—';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return this.fmtMoney(n);
  },

  fmtDate(ts, opts = {}) {
    const d = new Date(ts);
    const day = d.getDate();
    const month = d.toLocaleDateString('es-MX', { month: 'short' });
    return opts.short ? `${day} ${month}` : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  fmtTime(ts) {
    return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  },

  daysSince(ts) {
    return Math.floor((Date.now() - ts) / 86400000);
  },

  daysUntil(ts) {
    return Math.ceil((ts - Date.now()) / 86400000);
  },

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  },

  todayStr() {
    return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  },

  // SHA-256 para auth
  async sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
};

// ============================================================
// 5 · CEREBRO IA · ROUTER SONNET / HAIKU
// ============================================================

const IA = {
  /**
   * Decide qué modelo usar según el tipo de tarea.
   * Sonnet → decisiones complejas, briefing, coach, tips proactivos
   * Haiku → registros rápidos, CLARIFY, parsing intent
   */
  pickModel(task) {
    const haiku_tasks = ['register', 'clarify', 'parse_intent', 'classify_tone', 'extract_amount'];
    return haiku_tasks.includes(task) ? G2C.models.haiku : G2C.models.sonnet;
  },

  /**
   * Llamada al worker proxy de Cloudflare (que tiene la API key).
   * NUNCA exponer ANTHROPIC_API_KEY en el cliente.
   */
  async call({ model, system, messages, max_tokens = 1024, tools = null, scope = 'general' }) {
    try {
      const res = await fetch(G2C.api.proxy + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, system, messages, max_tokens, tools, scope })
      });
      if (!res.ok) throw new Error('Worker error ' + res.status);
      const data = await res.json();
      this.trackUsage(model, data.usage);
      return data;
    } catch (e) {
      console.error('IA call error:', e);
      return { content: [{ type: 'text', text: 'Hubo un problema conectando. Reintenta en un momento.' }], error: true };
    }
  },

  trackUsage(model, usage) {
    if (!usage) return;
    const stats = Store.get(Store.KEYS.CHAT_STATS, { sonnet: { msgs: 0, in: 0, out: 0 }, haiku: { msgs: 0, in: 0, out: 0 } });
    const key = model.includes('haiku') ? 'haiku' : 'sonnet';
    stats[key].msgs++;
    stats[key].in += usage.input_tokens || 0;
    stats[key].out += usage.output_tokens || 0;
    Store.set(Store.KEYS.CHAT_STATS, stats);
  },

  /**
   * Construye el system prompt completo con knowledge base + estado actual ERP.
   * Esto es lo que hace que Mando sea aterrizado y proactivo.
   */
  buildSystemPrompt(scope = 'mando') {
    const snap = Store.snapshot();
    const date = Util.todayStr();

    return `Eres Mando, el asistente personal de Alan Davis (founder de GO2CLOSE / G2C).

# QUIÉN ES ALAN
- Founder único de GO2CLOSE (consultoría B2B en infraestructura comercial replicable)
- Vive entre Tijuana y Ensenada · Baja California, México
- Vocalista activo en 3 bandas · canta en eventos
- Operador único · tiene ~24h operativas/semana (60% del tiempo)
- Persona Física actividad empresarial · 16% IVA · NO RESICO
- Constraint principal de su vida y negocio: TIEMPO, no dinero

# IDENTIDAD G2C (NO NEGOCIABLE)
${KB.positioning}

# TIERS Y PRICING REAL
- Plan Visor $7,000/mes · negocios validando
- Plan Parcial $12,000/mes · negocios con tracción
- Plan Total $16,000/mes · negocios escalando
Surcharges: Arranque +10% · Control +7% · Cierre +0%
Costos anualizados al inicio (dominio $1,200, licencia Zoho $8,376) · NO prorrateados

# PORTAFOLIO 24 SKUs (cuando sugieras productos, usa estos códigos)
${Object.entries(KB.productos).map(([sku, p]) => `${sku}: ${p.nombre} · setup $${p.setup}, MRR $${p.mrr}`).join('\n')}

# 3 PERSONAS VALIDADAS (para sugerir prospects similares)
${Object.values(KB.personas).map(p => `${p.name} (validado con ${p.validated_with}) · Plan ${p.tier} · pain: ${p.pain}`).join('\n')}

# CONTEXTO TIJUANA · LUGARES MÚSICA EN VIVO REALES
${KB.music_venues_tj.map(v => `${v.nombre} (${v.zona}) · ${v.estilo} · ${v.pago} · ${v.dias}`).join('\n')}

# CONTEXTO TIJUANA · RESTAURANTES PROSPECT G2C REALES
${KB.restaurant_prospects_tj.map(r => `${r.nombre} (${r.zona}) · ${r.ig_seguidores} IG · gap: ${r.gap} · pitch: ${r.pitch_sku}`).join('\n')}

# REGLAS OPERATIVAS NO NEGOCIABLES
${KB.reglas.map((r, i) => `${i + 1}. ${r}`).join('\n')}

# ESTADO ACTUAL DEL ERP DE ALAN (${date})
${this.buildStateContext(snap)}
${typeof Attach !== 'undefined' ? Attach.buildContext() : ''}

# CÓMO RESPONDER
1. Si Alan menciona algo personal/emocional → reconócelo ANTES de operar. Tono cálido pero no empalagoso.
2. Si pregunta operativo → datos duros + acción concreta. No tema dar números.
3. SIEMPRE aterriza tips a su realidad: lugares reales en TJ/Ensenada, montos del portafolio real, tiempo disponible real.
4. Cuando proponga estrategia, da 2 opciones con ROI/tiempo · recomienda una con razón.
5. Usa modismos MX neutros: "va", "no, va?", contracciones naturales. NO "vos", NO formalidades innecesarias.
6. NUNCA digas "agencia de marketing" para describir G2C.
7. NUNCA nombres vendors externos cuando hables de propuesta a cliente.
8. Si el ciclo de venta lleva >45 días, sugiere cortar.
9. Si mete tiempo cantando vs G2C, recuerda que G2C tiene ROI 6x mejor por hora pero la música es ingreso paralelo confiable.
10. Sé conciso. Texto largo solo si Alan lo pidió.

# TU PERSONALIDAD
- Operador-senior, no asistente robótico
- Reconoces estado humano antes que operativo
- Brutal en honestidad cuando vas en mala dirección
- Celebras logros sin lambisconería
- Distingues automáticamente trabajo vs personal sin que Alan toggle nada`;
  },

  /**
   * Resumen del estado actual del ERP para inyectar al system prompt.
   */
  buildStateContext(snap) {
    const lines = [];

    // Clientes
    const clientes = snap.clientes || [];
    if (clientes.length) {
      lines.push(`Clientes G2C activos: ${clientes.length}`);
      const vencidos = clientes.filter(c => c.status === 'vencido');
      if (vencidos.length) lines.push(`  ⚠ Vencidos: ${vencidos.map(c => `${c.nombre} ($${c.monto}, ${c.dias_vencido}d)`).join(', ')}`);
      const al_dia = clientes.filter(c => c.status === 'al_dia');
      if (al_dia.length) lines.push(`  ✓ Al día: ${al_dia.map(c => c.nombre).join(', ')}`);
    }

    // Finanzas
    const fin = snap.finanzas || {};
    if (fin.mrr) lines.push(`MRR actual: $${fin.mrr.toLocaleString()}`);
    if (fin.por_cobrar) lines.push(`Por cobrar: $${fin.por_cobrar.toLocaleString()}`);
    if (fin.flujo_30d) lines.push(`Flujo 30d: $${fin.flujo_30d.toLocaleString()}`);

    // Objetivos
    const obj = snap.objetivos || [];
    if (obj.length) {
      lines.push(`Objetivos vivos: ${obj.length}`);
      obj.forEach(o => lines.push(`  · ${o.nombre}: ${o.progreso}% (ritmo $${o.ritmo}, requerido $${o.requerido})`));
    }

    // Pendientes
    const pend = snap.pendientes || [];
    const altas = pend.filter(p => p.prioridad === 'alta' && !p.done);
    const venceHoy = pend.filter(p => p.due === 'hoy' && !p.done);
    if (altas.length) lines.push(`Pendientes alta prioridad: ${altas.length}`);
    if (venceHoy.length) lines.push(`Vencen hoy: ${venceHoy.length}`);

    // Música
    const eventos = snap.eventos_musica || [];
    const proximaTocada = eventos.filter(e => e.tipo === 'tocada' && e.ts > Date.now()).sort((a, b) => a.ts - b.ts)[0];
    if (proximaTocada) lines.push(`Próxima tocada: ${proximaTocada.lugar} en ${Util.daysUntil(proximaTocada.ts)} días`);

    // Bitácora personal (sentimientos, menciones)
    const bp = snap.bitacora_personal || [];
    const recent = bp.filter(b => Date.now() - b.ts < 7 * 86400000);
    if (recent.length) {
      const themes = [...new Set(recent.map(b => b.tema).filter(Boolean))];
      if (themes.length) lines.push(`Temas personales recientes (7d): ${themes.join(', ')}`);
    }

    return lines.length ? lines.join('\n') : 'ERP recién inicializado · sin datos aún';
  },

  /**
   * Clasifica un mensaje de Alan como "trabajo" u "operativo" vs "personal" automáticamente.
   * Usa Haiku porque es rápido y barato.
   */
  async classifyTone(text) {
    const res = await this.call({
      model: G2C.models.haiku,
      system: 'Eres un clasificador. Responde SOLO con una palabra: "operador" si el mensaje es sobre negocio/finanzas/clientes/G2C/música profesional, "personal" si es sobre emociones/relaciones/dudas existenciales/cansancio/estrés/vida personal, o "ambiguo" si no está claro.',
      messages: [{ role: 'user', content: text }],
      max_tokens: 10,
      scope: 'classify'
    });
    const t = (res.content?.[0]?.text || '').toLowerCase().trim();
    if (t.includes('personal')) return 'personal';
    if (t.includes('operador')) return 'operador';
    return 'ambiguo';
  },

  /**
   * Genera el briefing matutino con tono conversacional.
   */
  async briefing() {
    const sp = this.buildSystemPrompt('briefing');
    const lastBriefing = Store.get('alan_mando_last_briefing', 0);
    const horasDesdeBriefing = (Date.now() - lastBriefing) / 3600000;

    const res = await this.call({
      model: G2C.models.sonnet,
      system: sp,
      messages: [{
        role: 'user',
        content: `Genera mi briefing matutino. Reglas:
- Empieza con "${Util.greeting()}, Alan." en su propia línea.
- Si detectas algo personal en bitácora reciente (cansancio, estrés, ánimo bajo) reconócelo ANTES de operar y pregunta cómo amaneció.
- Después da 1-2 líneas con lo más importante del día (no más).
- NO listes datos. Sé conversacional.
- Máximo 60 palabras total.
- Si han pasado menos de 4 horas desde el último briefing (${horasDesdeBriefing.toFixed(1)}h), saluda más casual sin "buenos días".`
      }],
      max_tokens: 200,
      scope: 'briefing'
    });

    Store.set('alan_mando_last_briefing', Date.now());
    return res.content?.[0]?.text || '';
  },

  /**
   * Tip proactivo aterrizado (cruza ERP + APIs externas + contexto).
   */
  async proactiveTip(trigger) {
    const sp = this.buildSystemPrompt('tip');
    const triggers = {
      ingreso_bajo: 'Alan menciona que necesita más caja. Cruza tu portafolio + lugares música + clientes pipeline + huecos calendario y dale 2 opciones aterrizadas con ROI. Recomienda una.',
      cartera_estancada: 'Alan no ha generado leads G2C en >2 semanas. Sugiere 5 prospects reales de tu base (restaurantes Tijuana) con pitch específico por SKU del portafolio.',
      objetivo_atrasado: 'Alan va atrasado en objetivo casa. Cruza ingresos posibles + recortes de gastos personales y propón plan recuperación.',
      instagram_bajo: 'Alan no ha posteado en >10 días. Propón 3 posts esta semana con hooks específicos para su nicho B2B.',
      tocada_proxima: 'Hay tocada en próximos 7 días. Verifica set list completo, ensayo agendado, vestuario listo.'
    };

    const res = await this.call({
      model: G2C.models.sonnet,
      system: sp,
      messages: [{ role: 'user', content: triggers[trigger] || 'Genera un tip aterrizado relevante para mi situación actual.' }],
      max_tokens: 600,
      scope: 'tip_' + trigger
    });
    return res.content?.[0]?.text || '';
  },

  /**
   * Detecta intent CRUD de un mensaje libre.
   */
  async detectIntent(text) {
    const res = await this.call({
      model: G2C.models.haiku,
      system: `Detecta el intent del usuario. Responde SOLO con JSON, sin markdown:
{
  "intent": "register|edit|delete|query|chat",
  "domain": "movimiento|cliente|tocada|pendiente|ensayo|none",
  "data": {} // datos extraídos si aplica
}

Ejemplos:
- "Cobré $4.5K Bar Z anoche" → {"intent":"register","domain":"movimiento","data":{"tipo":"ingreso","monto":4500,"concepto":"Bar Z","categoria":"musica"}}
- "Cambia cobro SmartMeals a $13K" → {"intent":"edit","domain":"cliente","data":{"cliente":"SmartMeals","monto_nuevo":13000}}
- "Cuánto le cobré a NEOS este año" → {"intent":"query","domain":"cliente","data":{"cliente":"NEOS","periodo":"2026"}}
- "Hola cómo estás" → {"intent":"chat","domain":"none","data":{}}`,
      messages: [{ role: 'user', content: text }],
      max_tokens: 200,
      scope: 'intent'
    });

    try {
      const t = (res.content?.[0]?.text || '').trim().replace(/```json|```/g, '').trim();
      return JSON.parse(t);
    } catch (e) {
      return { intent: 'chat', domain: 'none', data: {} };
    }
  }
};

// ============================================================
// 6 · CASCADAS · "Marcar pagado" y otras
// ============================================================

const Cascada = {
  /**
   * CASCADA CRÍTICA: Marcar cliente como pagado.
   * Dispara TODAS las consecuencias documentadas.
   */
  async marcarPagado(clienteId) {
    const clientes = Store.get(Store.KEYS.CLIENTES, []);
    const idx = clientes.findIndex(c => c.id === clienteId);
    if (idx === -1) return { ok: false, error: 'Cliente no encontrado' };

    const cliente = clientes[idx];
    const monto = cliente.monto_pendiente || cliente.monto_mensual;
    const ahora = Date.now();
    const eraVencido = cliente.status === 'vencido';

    // 1. Registra en movimientos como ingreso
    Store.push(Store.KEYS.CXC, {
      tipo: 'ingreso',
      monto: monto,
      concepto: `Cobro ${cliente.nombre} · ${Util.fmtDate(ahora, { short: true })}`,
      categoria: 'g2c_mrr',
      cliente_id: clienteId,
      metodo: cliente.metodo_pago || 'transferencia',
      iva: true
    });

    // 2. Cambia status del cliente
    clientes[idx] = {
      ...cliente,
      status: 'al_dia',
      ultimo_pago: ahora,
      proximo_cobro: ahora + 30 * 86400000, // 30 días
      dias_vencido: 0,
      monto_pendiente: 0,
      historial_pagos: [...(cliente.historial_pagos || []), { fecha: ahora, monto, on_time: !eraVencido }]
    };
    Store.set(Store.KEYS.CLIENTES, clientes);

    // 3. Cierra alerta visual (notification archive)
    const recordatorios = Store.get(Store.KEYS.RECORDATORIOS, []);
    Store.set(Store.KEYS.RECORDATORIOS, recordatorios.filter(r => r.cliente_id !== clienteId || r.tipo !== 'cobro_vencido'));

    // 4. Suma a objetivo "Pagos puntuales"
    const objetivos = Store.get(Store.KEYS.OBJETIVOS, []);
    const objPuntuales = objetivos.find(o => o.tipo === 'pagos_puntuales');
    if (objPuntuales && !eraVencido) {
      objPuntuales.completado_mes = (objPuntuales.completado_mes || 0) + 1;
      objPuntuales.progreso = Math.round((objPuntuales.completado_mes / objPuntuales.target_mes) * 100);
      Store.set(Store.KEYS.OBJETIVOS, objetivos);
    }

    // 5. Recalcula MRR
    this.recalcularMRR();

    // 6. Recalcula proyección 90 días
    this.recalcularProyeccion();

    // 7. Trigger achievement si aplica
    if (eraVencido) {
      Store.push(Store.KEYS.ACHIEVEMENTS, {
        tipo: 'cobro_recuperado',
        cliente: cliente.nombre,
        monto,
        msg: `Recuperaste $${Util.fmtMoneyK(monto)} de ${cliente.nombre}`
      });
    }

    return {
      ok: true,
      cascade: {
        movimiento_registrado: monto,
        status_actualizado: 'vencido → al_dia',
        alertas_cerradas: 1,
        objetivo_pagos_puntuales: !eraVencido,
        mrr_recalculado: true,
        proyeccion_actualizada: true
      }
    };
  },

  /**
   * Recalcula MRR sumando todos los clientes activos.
   */
  recalcularMRR() {
    const clientes = Store.get(Store.KEYS.CLIENTES, []);
    const mrr = clientes
      .filter(c => c.status !== 'archivado')
      .reduce((sum, c) => sum + (c.monto_mensual || 0), 0);
    const finanzas = Store.get(Store.KEYS.FINANZAS, {});
    finanzas.mrr = mrr;
    finanzas.actualizado = Date.now();
    Store.set(Store.KEYS.FINANZAS, finanzas);
    return mrr;
  },

  /**
   * Recalcula proyección 90 días cruzando todas las variables.
   */
  recalcularProyeccion() {
    const finanzas = Store.get(Store.KEYS.FINANZAS, {});
    const clientes = Store.get(Store.KEYS.CLIENTES, []);
    const eventos = Store.get(Store.KEYS.EVENTOS_MUSICA, []);
    const objetivos = Store.get(Store.KEYS.OBJETIVOS, []);

    const ingresoG2C = clientes.filter(c => c.status !== 'archivado').reduce((s, c) => s + (c.monto_mensual || 0), 0);
    const ingresoMusica = eventos.filter(e => e.tipo === 'tocada' && e.confirmada && e.ts > Date.now() && e.ts < Date.now() + 90 * 86400000).reduce((s, e) => s + (e.pago || 0), 0);
    const gastoFijo = (Store.get(Store.KEYS.SERVICIOS_FIJOS, []) || []).reduce((s, x) => s + (x.monto || 0), 0);

    const proyeccion = {
      d30: ingresoG2C - gastoFijo,
      d60: (ingresoG2C * 2) - (gastoFijo * 2) + (ingresoMusica * 0.5),
      d90: (ingresoG2C * 3) - (gastoFijo * 3) + ingresoMusica,
      hoy: finanzas.patrimonio || 0,
      actualizada: Date.now()
    };

    finanzas.proyeccion_90d = proyeccion;
    Store.set(Store.KEYS.FINANZAS, finanzas);
    return proyeccion;
  },

  /**
   * Cascada: registra movimiento financiero y conecta con objetivos.
   */
  registrarMovimiento(mov) {
    const movimientos = Store.get('alan_mando_movimientos', []);
    movimientos.push({ id: 'mov_' + Date.now(), ts: Date.now(), ...mov });
    Store.set('alan_mando_movimientos', movimientos);

    // Si es ingreso de música, suma a objetivo tocadas
    if (mov.tipo === 'ingreso' && mov.categoria === 'musica') {
      const objetivos = Store.get(Store.KEYS.OBJETIVOS, []);
      const objTocadas = objetivos.find(o => o.tipo === 'tocadas_mes');
      if (objTocadas) {
        objTocadas.completado_mes = (objTocadas.completado_mes || 0) + 1;
        Store.set(Store.KEYS.OBJETIVOS, objetivos);
      }
    }

    // Si es ingreso, suma a ahorro casa proporcionalmente
    if (mov.tipo === 'ingreso') {
      const objetivos = Store.get(Store.KEYS.OBJETIVOS, []);
      const objCasa = objetivos.find(o => o.tipo === 'ahorro_casa');
      if (objCasa) {
        const aporte = Math.round(mov.monto * 0.6); // 60% del ingreso al ahorro
        objCasa.acumulado = (objCasa.acumulado || 0) + aporte;
        objCasa.progreso = Math.round((objCasa.acumulado / objCasa.target) * 100);
        Store.set(Store.KEYS.OBJETIVOS, objetivos);
      }
    }

    this.recalcularProyeccion();
    return { ok: true, movimiento: mov };
  },

  /**
   * Cascada destructiva: requiere confirmación.
   */
  async eliminar(tipo, id, confirmado = false) {
    if (!confirmado) {
      return { ok: false, requires_confirmation: true, msg: `Esto elimina permanente. Confirma con "sí elimina"` };
    }

    const keymap = {
      cliente: Store.KEYS.CLIENTES,
      pendiente: Store.KEYS.PENDIENTES,
      tocada: Store.KEYS.EVENTOS_MUSICA,
      objetivo: Store.KEYS.OBJETIVOS,
      movimiento: 'alan_mando_movimientos'
    };

    const key = keymap[tipo];
    if (!key) return { ok: false, error: 'Tipo desconocido' };

    Store.remove(key, id);

    // Recalcula si es cliente o movimiento
    if (tipo === 'cliente' || tipo === 'movimiento') {
      this.recalcularMRR();
      this.recalcularProyeccion();
    }

    return { ok: true, eliminado: { tipo, id } };
  }
};

// ============================================================
// 7 · UI HELPERS
// ============================================================

const UI = {
  /**
   * Renderiza el footer G2C en cada módulo.
   */
  renderFooter() {
    return `
      <div class="module-footer">
        <svg class="star-icon" width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,79,0,0.55)">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z"/>
        </svg>
        <div class="credits">Created by Alan Davis · powered by <span class="domain">g2c.com.mx</span></div>
      </div>
    `;
  },

  /**
   * Renderiza el bottom nav.
   */
  renderBottomNav(active) {
    const items = [
      { key: 'mando', label: 'Mando', href: 'index.html', icon: '<path d="M12 2L2 9l2 1v9h6v-6h4v6h6v-9l2-1L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>' },
      { key: 'calendario', label: 'Calend', href: 'calendario.html', icon: '<rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.5"/>' },
      { key: 'finanzas', label: 'Finanzas', href: 'finanzas.html', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
      { key: 'musica', label: 'Música', href: 'musica.html', icon: '<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
      { key: 'pendientes', label: 'Pendts', href: 'pendientes.html', icon: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.5"/>' }
    ];
    return `<nav class="bottom-nav">${items.map(i => `
      <a href="${i.href}" class="bottom-nav-item ${active === i.key ? 'active' : ''}">
        <svg width="20" height="20" viewBox="0 0 24 24">${i.icon}</svg>
        <span class="nav-label">${i.label}</span>
      </a>
    `).join('')}</nav>`;
  },

  /**
   * Renderiza status bar.
   */
  renderStatusBar() {
    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="status-bar">
        <div class="time">${time}</div>
        <div class="battery"><div></div></div>
      </div>
    `;
  },

  /**
   * Renderiza chat input fijo.
   */
  renderChatInput(placeholder = 'Háblame...') {
    return `
      <div class="chat-input-wrap">
        <div class="chat-input" id="chat-input">
          <input type="text" id="chat-input-field" placeholder="${placeholder}" autocomplete="off"/>
          <svg class="icon-mic" width="15" height="15" viewBox="0 0 24 24" fill="none" id="chat-mic">
            <path d="M12 1v22M5 8a7 7 0 0114 0v6a7 7 0 01-14 0V8z" stroke="rgba(244,243,239,0.5)" stroke-width="1.5"/>
          </svg>
          <div class="send-btn" id="chat-send-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(244,243,239,0.4)" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Maneja el ciclo de chat input · 3 estados.
   */
  bindChatInput(onSend) {
    const wrap = document.getElementById('chat-input');
    const field = document.getElementById('chat-input-field');
    const btn = document.getElementById('chat-send-btn');

    if (!wrap || !field || !btn) return;

    field.addEventListener('input', () => {
      if (field.value.trim()) wrap.classList.add('active');
      else wrap.classList.remove('active');
    });

    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && field.value.trim()) {
        const txt = field.value.trim();
        field.value = '';
        wrap.classList.remove('active');
        onSend(txt);
      }
    });

    btn.addEventListener('click', () => {
      if (!field.value.trim()) return;
      const txt = field.value.trim();
      field.value = '';
      wrap.classList.remove('active');
      onSend(txt);
    });
  },

  /**
   * Toast/notificación efímera.
   */
  toast(msg, type = 'info', duration = 2500) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:18px;left:18px;right:18px;z-index:200;background:rgba(15,20,25,0.98);border:0.5px solid var(--${type === 'success' ? 'green' : type === 'error' ? 'orange' : 'border-mid'});border-radius:11px;padding:11px 14px;font-size:12px;color:var(--text-primary);backdrop-filter:blur(10px);transform:translateY(-20px);opacity:0;transition:all 0.3s;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transform = 'translateY(0)'; el.style.opacity = '1'; }, 10);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-20px)'; setTimeout(() => el.remove(), 300); }, duration);
  }
};

// ============================================================
// 8 · AUTH
// ============================================================

const Auth = {
  async login(password) {
    const hash = await Util.sha256(password);
    if (hash === G2C.auth.hash) {
      Store.set(Store.KEYS.AUTH, { logged: true, ts: Date.now() });
      return true;
    }
    return false;
  },

  isLogged() {
    const a = Store.get(Store.KEYS.AUTH);
    if (!a || !a.logged) return false;
    // Sesión válida por 30 días
    if (Date.now() - a.ts > 30 * 86400000) {
      Store.set(Store.KEYS.AUTH, { logged: false });
      return false;
    }
    return true;
  },

  logout() {
    Store.set(Store.KEYS.AUTH, { logged: false });
    location.href = 'index.html';
  },

  enforce() {
    if (!this.isLogged()) {
      this.showLogin();
      return false;
    }
    return true;
  },

  showLogin() {
    document.body.innerHTML = `
      <div class="login-wrap">
        <div class="login-star">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,79,0,0.85)">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z"/>
          </svg>
        </div>
        <h1>Mando</h1>
        <p>Tu sistema personal · GO2CLOSE</p>
        <input type="password" id="login-pwd" placeholder="Contraseña" autofocus/>
        <div id="login-err" style="font-size:11px;color:var(--orange-text);margin-top:4px;height:14px;"></div>
      </div>
    `;
    const pwd = document.getElementById('login-pwd');
    const err = document.getElementById('login-err');
    pwd.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const ok = await this.login(pwd.value);
        if (ok) location.reload();
        else { err.textContent = 'Contraseña incorrecta'; pwd.value = ''; }
      }
    });
  }
};

// ============================================================
// 8 · ATTACHMENTS · documentos persistentes consultables por la IA
// ============================================================

const Attach = {
  TYPES: {
    cedula_fiscal: { label: 'Cédula fiscal · RFC', icon: '◈', accept: 'image/*,application/pdf' },
    constancia_situacion_fiscal: { label: 'Constancia de Situación Fiscal', icon: '◆', accept: 'application/pdf,image/*' },
    declaracion_anual: { label: 'Declaración anual', icon: '▣', accept: 'application/pdf' },
    declaracion_mensual: { label: 'Declaración mensual', icon: '▤', accept: 'application/pdf' },
    opinion_cumplimiento: { label: 'Opinión cumplimiento SAT', icon: '✓', accept: 'application/pdf,image/*' },
    identificacion: { label: 'Identificación oficial · INE', icon: '◇', accept: 'image/*,application/pdf' },
    comprobante_domicilio: { label: 'Comprobante de domicilio', icon: '⌂', accept: 'application/pdf,image/*' },
    contrato: { label: 'Contrato / acuerdo', icon: '§', accept: 'application/pdf,image/*' },
    cfdi: { label: 'CFDI · factura', icon: '$', accept: 'application/pdf,application/xml,text/xml' },
    manual_g2c: { label: 'Manual G2C · uso interno', icon: '★', accept: 'application/pdf,text/markdown,text/plain' },
    portafolio: { label: 'Portafolio productos G2C', icon: '▦', accept: 'application/pdf,text/markdown' },
    caso_exito: { label: 'Caso de éxito · cliente', icon: '◉', accept: 'application/pdf,image/*' },
    otro: { label: 'Otro documento', icon: '·', accept: '*/*' }
  },

  list() {
    return Store.get(Store.KEYS.ATTACHMENTS, []);
  },

  byType(type) {
    return this.list().filter(a => a.type === type);
  },

  async save(att) {
    const all = this.list();
    if (att.id) {
      const idx = all.findIndex(a => a.id === att.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...att, updated_at: Date.now() };
    } else {
      att.id = 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      att.created_at = Date.now();
      att.updated_at = Date.now();
      all.unshift(att);
    }
    Store.set(Store.KEYS.ATTACHMENTS, all);
    return att;
  },

  remove(id) {
    const all = this.list();
    Store.set(Store.KEYS.ATTACHMENTS, all.filter(a => a.id !== id));
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Construye el contexto de adjuntos para inyectar al system prompt de la IA.
   * Esto es lo que permite que Claude consulte tus documentos cuando le preguntas.
   */
  buildContext() {
    const atts = this.list();
    if (atts.length === 0) return '';

    const grouped = {};
    atts.forEach(a => {
      if (!grouped[a.type]) grouped[a.type] = [];
      grouped[a.type].push(a);
    });

    let ctx = '\n# DOCUMENTOS DISPONIBLES DE ALAN\nTienes estos documentos cargados que puedes consultar para análisis fiscal, comercial y operativo:\n';
    Object.entries(grouped).forEach(([type, items]) => {
      const meta = this.TYPES[type] || { label: type };
      ctx += `\n## ${meta.label}\n`;
      items.forEach(a => {
        ctx += `- ${a.title || a.fileName || 'Sin título'}${a.notes ? ' · ' + a.notes : ''}\n`;
        if (a.extracted_text) {
          const preview = a.extracted_text.slice(0, 800);
          ctx += `  Contenido: ${preview}${a.extracted_text.length > 800 ? '...' : ''}\n`;
        }
      });
    });
    return ctx;
  }
};

// ============================================================
// 9 · API KEYS · Conexiones que el usuario configura desde UI
// ============================================================

const ApiKeys = {
  /**
   * Definición de las conexiones disponibles. Cada una tiene:
   * - name: nombre humano
   * - storage_key: dónde se guarda (cliente vs worker)
   * - test_url: endpoint para validar conexión
   * - required: si es indispensable
   */
  CONNECTIONS: {
    anthropic: {
      name: 'Anthropic Claude API',
      description: 'Cerebro IA · Sonnet 4.5 + Haiku 4.5',
      storage: 'worker',
      test_endpoint: '/health',
      required: true,
      doc_url: 'https://console.anthropic.com/settings/keys',
      placeholder: 'sk-ant-api03-...',
      hint: 'La key se guarda en el Worker de Cloudflare como Secret · NUNCA en el cliente'
    },
    youtube: {
      name: 'YouTube Data API',
      description: 'Cache de canciones · letras · videos',
      storage: 'client',
      key_name: 'youtube_api_key',
      required: false,
      doc_url: 'https://console.cloud.google.com/apis/credentials',
      placeholder: 'AIzaSy...'
    },
    google_maps: {
      name: 'Google Maps API',
      description: 'Prospects · venues música · lugares Tijuana',
      storage: 'worker',
      test_endpoint: '/api/maps/test',
      required: false,
      doc_url: 'https://console.cloud.google.com/google/maps-apis/credentials',
      placeholder: 'AIzaSy...'
    },
    spotify: {
      name: 'Spotify Web API',
      description: 'Sincronizar repertorio musical',
      storage: 'client',
      key_name: 'spotify_api_key',
      required: false,
      doc_url: 'https://developer.spotify.com/dashboard',
      placeholder: 'client_id:client_secret'
    },
    instagram: {
      name: 'Instagram Graph API',
      description: 'Engagement + métricas posts',
      storage: 'client',
      key_name: 'instagram_token',
      required: false,
      doc_url: 'https://developers.facebook.com/apps',
      placeholder: 'IGQVJX...'
    },
    whisper: {
      name: 'OpenAI Whisper',
      description: 'Voz a texto · registrar movimientos hablando',
      storage: 'worker',
      test_endpoint: '/api/whisper/test',
      required: false,
      doc_url: 'https://platform.openai.com/api-keys',
      placeholder: 'sk-...'
    },
    zoho_bigin: {
      name: 'Zoho Bigin',
      description: 'Sync leads del Diagnóstico Inteligente',
      storage: 'worker',
      test_endpoint: '/api/bigin/test',
      required: false,
      doc_url: 'https://www.zoho.com/bigin/developer/docs/',
      placeholder: '1000.xxx...'
    },
    mercadopago: {
      name: 'MercadoPago',
      description: 'Cobros · ligas de pago',
      storage: 'client',
      key_name: 'mercadopago_token',
      required: false,
      doc_url: 'https://www.mercadopago.com.mx/developers',
      placeholder: 'APP_USR-...'
    }
  },

  /**
   * Get/set keys que viven en el cliente (NO sensibles, OK exponer).
   */
  getClient(connection_id) {
    const config = Store.get(Store.KEYS.CONFIG, {});
    const conn = this.CONNECTIONS[connection_id];
    if (!conn || conn.storage !== 'client') return null;
    return config[conn.key_name] || null;
  },

  setClient(connection_id, value) {
    const conn = this.CONNECTIONS[connection_id];
    if (!conn || conn.storage !== 'client') return false;
    const config = Store.get(Store.KEYS.CONFIG, {});
    config[conn.key_name] = value;
    config[conn.key_name + '_connected_at'] = Date.now();
    return Store.set(Store.KEYS.CONFIG, config);
  },

  removeClient(connection_id) {
    const conn = this.CONNECTIONS[connection_id];
    if (!conn || conn.storage !== 'client') return false;
    const config = Store.get(Store.KEYS.CONFIG, {});
    delete config[conn.key_name];
    delete config[conn.key_name + '_connected_at'];
    return Store.set(Store.KEYS.CONFIG, config);
  },

  /**
   * Para keys que viven en el Worker · solo enviamos la key al worker para que la guarde.
   * El cliente NO la persiste.
   */
  async setWorker(connection_id, value) {
    try {
      const res = await fetch(G2C.api.proxy + '/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: connection_id, key: value })
      });
      if (!res.ok) throw new Error('Worker rechazó la conexión: ' + res.status);
      const data = await res.json();

      // Marcamos en config local que SÍ está conectado, sin guardar la key
      const config = Store.get(Store.KEYS.CONFIG, {});
      config['conn_' + connection_id + '_connected'] = true;
      config['conn_' + connection_id + '_connected_at'] = Date.now();
      Store.set(Store.KEYS.CONFIG, config);

      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async removeWorker(connection_id) {
    try {
      await fetch(G2C.api.proxy + '/api/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: connection_id })
      });
      const config = Store.get(Store.KEYS.CONFIG, {});
      delete config['conn_' + connection_id + '_connected'];
      delete config['conn_' + connection_id + '_connected_at'];
      Store.set(Store.KEYS.CONFIG, config);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Test de una conexión.
   */
  async test(connection_id) {
    const conn = this.CONNECTIONS[connection_id];
    if (!conn) return { success: false, error: 'Conexión desconocida' };

    if (connection_id === 'anthropic') {
      // Test rápido con Haiku
      try {
        const res = await fetch(G2C.api.proxy + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: G2C.models.haiku,
            messages: [{ role: 'user', content: 'di OK' }],
            max_tokens: 10
          })
        });
        const data = await res.json();
        if (data.content && data.content[0]) {
          return { success: true, response: data.content[0].text };
        }
        return { success: false, error: data.error || 'Sin respuesta' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    if (connection_id === 'youtube') {
      const key = this.getClient('youtube');
      if (!key) return { success: false, error: 'No hay key configurada' };
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${key}`);
        const data = await res.json();
        if (data.items) return { success: true, message: 'Conectada' };
        return { success: false, error: data.error?.message || 'Key inválida' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return { success: true, message: 'Test no implementado · marca como conectada manualmente' };
  },

  /**
   * Estado de todas las conexiones.
   */
  status() {
    const config = Store.get(Store.KEYS.CONFIG, {});
    const status = {};
    Object.keys(this.CONNECTIONS).forEach(id => {
      const conn = this.CONNECTIONS[id];
      if (conn.storage === 'client') {
        status[id] = !!config[conn.key_name];
      } else {
        status[id] = !!config['conn_' + id + '_connected'];
      }
    });
    return status;
  }
};

// ============================================================
// 10 · PUSH NOTIFICATIONS · suscripción + test profesional
// ============================================================

const Push = {
  support() {
    return {
      supported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
      service_worker: 'serviceWorker' in navigator,
      push_manager: 'PushManager' in window,
      notification: 'Notification' in window,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
      is_standalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
      ios: /iPad|iPhone|iPod/.test(navigator.userAgent),
      requires_pwa_install: /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
    };
  },

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const arr = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) arr[i] = rawData.charCodeAt(i);
    return arr;
  },

  async registerSW() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (err) {
      console.error('[Push] SW registration failed', err);
      return null;
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) return { granted: false, error: 'Notification API no disponible' };
    if (Notification.permission === 'granted') return { granted: true };
    if (Notification.permission === 'denied') return { granted: false, error: 'Permiso denegado · habilítalo manualmente en ajustes del navegador' };
    try {
      const result = await Notification.requestPermission();
      return { granted: result === 'granted' };
    } catch (err) {
      return { granted: false, error: err.message };
    }
  },

  async subscribe() {
    const support = this.support();
    if (!support.supported) return { success: false, error: 'Push no soportado en este navegador' };
    if (support.requires_pwa_install) return { success: false, error: 'iOS requiere instalar la app a pantalla de inicio · botón compartir → Agregar a pantalla de inicio' };

    const perm = await this.requestPermission();
    if (!perm.granted) return { success: false, error: perm.error || 'Permiso denegado' };

    const reg = await this.registerSW();
    if (!reg) return { success: false, error: 'Service Worker no se pudo registrar' };

    await navigator.serviceWorker.ready;

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      try {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(G2C.push.vapid_public)
        });
      } catch (err) {
        return { success: false, error: 'Error al suscribir: ' + err.message };
      }
    }

    const subData = subscription.toJSON();
    Store.set(Store.KEYS.PUSH_SUB, subData);

    try {
      const res = await fetch(G2C.push.server + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'alan-default',
          subscription: subData,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isStandalone: support.is_standalone
          }
        })
      });
      if (!res.ok) throw new Error('Server returned ' + res.status);
    } catch (err) {
      return { success: true, subscription: subData, warning: 'Suscripción local OK · servidor: ' + err.message };
    }

    return { success: true, subscription: subData };
  },

  async unsubscribe() {
    if (!('serviceWorker' in navigator)) return { success: false };
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const subData = subscription.toJSON();
      await subscription.unsubscribe();
      try {
        await fetch(G2C.push.server + '/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'alan-default', endpoint: subData.endpoint })
        });
      } catch (e) { /* silent */ }
    }
    localStorage.removeItem(Store.KEYS.PUSH_SUB);
    return { success: true };
  },

  async status() {
    const support = this.support();
    if (!support.supported) return { ...support, subscribed: false };
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return { ...support, subscribed: false };
      const subscription = await reg.pushManager.getSubscription();
      return { ...support, subscribed: !!subscription, subscription: subscription ? subscription.toJSON() : null };
    } catch (err) {
      return { ...support, subscribed: false, error: err.message };
    }
  },

  /**
   * Test local · muestra notificación inmediata para validar.
   * Aplica formato profesional: SIN emojis, con prioridad y monto.
   */
  async testLocal(opts = {}) {
    const perm = await this.requestPermission();
    if (!perm.granted) return { success: false, error: perm.error || 'Sin permiso' };

    await this.registerSW();
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return { success: false, error: 'Service Worker no activo · espera unos segundos y reintenta' };

    const payload = {
      priority: opts.priority || 'media',
      subject: opts.subject || 'Test del sistema',
      body: opts.body || 'Sistema de notificaciones operativo. Mando puede alertarte de cobros, tocadas y deadlines fiscales.',
      amount: opts.amount,
      url: opts.url || '/'
    };

    reg.active.postMessage({ type: 'TEST_NOTIFICATION', payload });
    return { success: true };
  },

  /**
   * Programa notificación remota vía Worker.
   * Estructura profesional: priority + subject + amount.
   */
  async schedule(opts) {
    if (!opts.title && !opts.subject) return { success: false, error: 'Falta subject o title' };
    if (!opts.sendAt) return { success: false, error: 'Falta sendAt (timestamp)' };

    const subData = Store.get(Store.KEYS.PUSH_SUB);
    if (!subData) return { success: false, error: 'No hay suscripción activa' };

    try {
      const res = await fetch(G2C.push.server + '/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'alan-default',
          type: opts.type || 'general',
          title: opts.subject || opts.title,
          body: opts.body || '',
          priority: opts.priority || 'media',
          amount: opts.amount,
          sendAt: opts.sendAt,
          url: opts.url || '/',
          data: opts.data || {}
        })
      });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      return { success: true, ...(await res.json()) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

// ============================================================
// 11 · INICIALIZACIÓN
// ============================================================

window.G2C = G2C;
window.KB = KB;
window.Store = Store;
window.Util = Util;
window.IA = IA;
window.Cascada = Cascada;
window.UI = UI;
window.Auth = Auth;
window.Attach = Attach;
window.ApiKeys = ApiKeys;
window.Push = Push;

console.log(`%cG2C Mando v${G2C.version}`, 'color:#FF4F00;font-weight:bold;font-size:14px;');
console.log('%cCreated by Alan Davis · powered by g2c.com.mx', 'color:rgba(244,243,239,0.5);font-size:11px;');
