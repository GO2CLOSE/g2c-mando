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
  version: '1.3.0',
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

      // Parse response como JSON SIEMPRE para extraer mensaje de error real
      let data;
      try { data = await res.json(); } catch (e) { data = null; }

      if (!res.ok) {
        const errMsg = data?.error || data?.hint || `Worker ${res.status}`;
        throw new Error(errMsg);
      }

      // Anthropic responde con error en lugar de content si hay problema con la key
      if (data && data.type === 'error') {
        throw new Error(data.error?.message || 'Anthropic API error');
      }

      this.trackUsage(model, data.usage);
      return data;
    } catch (e) {
      console.error('IA call error:', e.message);
      return {
        content: null,
        error: true,
        error_message: e.message
      };
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
    if (res.error) {
      return { error: true, error_message: res.error_message };
    }
    return { text: res.content?.[0]?.text || '' };
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

    // Auto-detección de tags especiales (marihuana, café, etc.)
    const concepto = (mov.concepto || '').toLowerCase();
    const tags = [];
    if (/marihuana|mota|mari|cannabis|kush|gota|sativa|indica|hierba|cogollo|joint/i.test(concepto)) {
      tags.push('marihuana');
      mov.color = 'green-mota';
      mov.icono = 'leaf';
      if (!mov.categoria_personal) mov.categoria_personal = 'ocio_marihuana';
    }
    if (/café|cafe|starbucks|tims|cofee|latte|americano|cold brew/i.test(concepto)) {
      tags.push('cafe');
      mov.icono = mov.icono || 'coffee';
    }
    if (/uber|didi|cabify/i.test(concepto)) {
      tags.push('transporte');
    }
    if (tags.length) mov.tags = (mov.tags || []).concat(tags);

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
        const aporte = Math.round(mov.monto * 0.6);
        objCasa.acumulado = (objCasa.acumulado || 0) + aporte;
        objCasa.progreso = Math.round((objCasa.acumulado / objCasa.target) * 100);
        Store.set(Store.KEYS.OBJETIVOS, objetivos);
      }
    }

    this.recalcularProyeccion();
    return { ok: true, movimiento: mov, tags };
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
// 8 · SAT · Calendario fiscal 2026 (Persona Física Act. Empresarial)
// ============================================================

const SAT = {
  /**
   * Obligaciones fiscales recurrentes para Persona Física con Actividad Empresarial.
   * Base oficial: Calendario SAT 2026 publicado en sat.gob.mx
   * Régimen: General (no RESICO)
   */
  REGIMEN: {
    nombre: 'Persona Física · Actividad Empresarial · Régimen General',
    iva: 0.16,
    isr_provisional: 'mensual',
    declaracion_anual: 'abril 2027 (ejercicio 2026)',
    contabilidad_electronica: 'sí · catálogo cuentas + balanza mensual',
    cfdi_obligado: true
  },

  /**
   * Genera el calendario fiscal 2026 con todas las fechas obligatorias.
   * Las fechas son las del SAT · día 17 del mes siguiente para declaración mensual,
   * con extensiones según el sexto dígito del RFC.
   */
  buildCalendar2026(rfc = '') {
    const eventos = [];

    // Determinar día de extensión según sexto dígito del RFC
    // Si RFC empieza con DAVA920607 → sexto dígito es '0' (índice 5)
    // Pero el SAT usa el sexto dígito numérico del RFC (no caracter)
    const sextoDigito = rfc.length >= 10 ? rfc.charAt(9) : '';
    const extension = this.getExtension(sextoDigito);

    // Declaraciones MENSUALES · día 17 + extensión por RFC
    const meses = [
      { num: 1, nombre: 'Enero', periodo: 'Diciembre 2025' },
      { num: 2, nombre: 'Febrero', periodo: 'Enero 2026' },
      { num: 3, nombre: 'Marzo', periodo: 'Febrero 2026' },
      { num: 4, nombre: 'Abril', periodo: 'Marzo 2026' },
      { num: 5, nombre: 'Mayo', periodo: 'Abril 2026' },
      { num: 6, nombre: 'Junio', periodo: 'Mayo 2026' },
      { num: 7, nombre: 'Julio', periodo: 'Junio 2026' },
      { num: 8, nombre: 'Agosto', periodo: 'Julio 2026' },
      { num: 9, nombre: 'Septiembre', periodo: 'Agosto 2026' },
      { num: 10, nombre: 'Octubre', periodo: 'Septiembre 2026' },
      { num: 11, nombre: 'Noviembre', periodo: 'Octubre 2026' },
      { num: 12, nombre: 'Diciembre', periodo: 'Noviembre 2026' }
    ];

    meses.forEach(m => {
      const day = 17 + extension;
      const fecha = new Date(2026, m.num - 1, day);
      // Si cae en sábado/domingo, mover al siguiente lunes
      while (fecha.getDay() === 0 || fecha.getDay() === 6) {
        fecha.setDate(fecha.getDate() + 1);
      }
      eventos.push({
        id: `sat_decl_${m.num}_2026`,
        tipo: 'declaracion_mensual',
        titulo: `Declaración mensual ${m.nombre}`,
        descripcion: `Declaración provisional ISR + IVA · periodo ${m.periodo}`,
        fecha: fecha.getTime(),
        impuestos: ['ISR', 'IVA'],
        plataforma: 'Mi Portal SAT · sat.gob.mx',
        prioridad: 'alta',
        recurrente: true
      });
    });

    // DECLARACIÓN ANUAL · 30 abril 2027 (ejercicio 2026, pero se paga en 2027)
    // Pero como estamos en 2026, agendamos la del ejercicio 2025 que vence 30 abril 2026
    const declaracionAnual2025 = new Date(2026, 3, 30); // 30 abril 2026
    eventos.push({
      id: 'sat_anual_2025',
      tipo: 'declaracion_anual',
      titulo: 'Declaración anual ejercicio 2025',
      descripcion: 'Declaración anual de impuestos del ejercicio 2025 · vence 30 abril 2026',
      fecha: declaracionAnual2025.getTime(),
      impuestos: ['ISR anual'],
      plataforma: 'DeclaraSAT · sat.gob.mx',
      prioridad: 'critica',
      recurrente: false
    });

    // PAGOS PROVISIONALES TRIMESTRALES (si aplica)
    // Para Persona Física General, los pagos son MENSUALES · ya cubiertos arriba.

    // CONTABILIDAD ELECTRÓNICA · día 3 del mes siguiente
    meses.forEach(m => {
      const fecha = new Date(2026, m.num - 1, 3);
      while (fecha.getDay() === 0 || fecha.getDay() === 6) {
        fecha.setDate(fecha.getDate() + 1);
      }
      eventos.push({
        id: `sat_balanza_${m.num}_2026`,
        tipo: 'contabilidad_electronica',
        titulo: `Balanza ${m.nombre}`,
        descripcion: `Envío balanza de comprobación · periodo ${m.periodo}`,
        fecha: fecha.getTime(),
        impuestos: [],
        plataforma: 'Buzón Tributario',
        prioridad: 'media',
        recurrente: true
      });
    });

    // DIOT (Declaración Informativa de Operaciones con Terceros) · mensual día último
    meses.forEach(m => {
      // Último día del mes siguiente
      const fecha = new Date(2026, m.num, 0);
      while (fecha.getDay() === 0 || fecha.getDay() === 6) {
        fecha.setDate(fecha.getDate() - 1);
      }
      eventos.push({
        id: `sat_diot_${m.num}_2026`,
        tipo: 'diot',
        titulo: `DIOT ${m.nombre}`,
        descripcion: `Declaración Informativa de Operaciones con Terceros · ${m.periodo}`,
        fecha: fecha.getTime(),
        impuestos: ['DIOT'],
        plataforma: 'Mi Portal SAT',
        prioridad: 'media',
        recurrente: true
      });
    });

    return eventos.sort((a, b) => a.fecha - b.fecha);
  },

  /**
   * Calcula días de extensión por sexto dígito del RFC (regla SAT).
   */
  getExtension(digito) {
    const map = {
      '1': 1, '2': 1,
      '3': 2, '4': 2,
      '5': 3, '6': 3,
      '7': 4, '8': 4,
      '9': 5, '0': 5
    };
    return map[digito] || 0;
  },

  /**
   * Carga el calendario al storage (idempotente).
   */
  loadCalendar() {
    const config = Store.get(Store.KEYS.CONFIG, {});
    const rfc = config.rfc || '';
    const calendar = this.buildCalendar2026(rfc);
    Store.set('alan_mando_sat_calendar', calendar);
    return calendar;
  },

  /**
   * Próximas obligaciones (siguientes 90 días).
   */
  upcoming(limit = 5) {
    const cal = Store.get('alan_mando_sat_calendar', []);
    const ahora = Date.now();
    const limite = ahora + 90 * 86400000;
    return cal.filter(e => e.fecha >= ahora && e.fecha <= limite).slice(0, limit);
  }
};

// ============================================================
// 9 · ATTACHMENTS · documentos consultables por la IA
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
    contrato: { label: 'Contrato · acuerdo', icon: '§', accept: 'application/pdf,image/*' },
    cfdi: { label: 'CFDI · factura', icon: '$', accept: 'application/pdf,application/xml,text/xml' },
    manual_g2c: { label: 'Manual G2C · uso interno', icon: '★', accept: 'application/pdf,text/markdown,text/plain' },
    portafolio: { label: 'Portafolio productos G2C', icon: '▦', accept: 'application/pdf,text/markdown' },
    caso_exito: { label: 'Caso de éxito · cliente', icon: '◉', accept: 'application/pdf,image/*' },
    otro: { label: 'Otro documento', icon: '·', accept: '*/*' }
  },

  list() { return Store.get(Store.KEYS.ATTACHMENTS, []); },
  byType(type) { return this.list().filter(a => a.type === type); },

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
    Store.set(Store.KEYS.ATTACHMENTS, this.list().filter(a => a.id !== id));
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
   * Inyecta documentos al system prompt de la IA.
   */
  buildContext() {
    const atts = this.list();
    if (atts.length === 0) return '';

    const grouped = {};
    atts.forEach(a => {
      if (!grouped[a.type]) grouped[a.type] = [];
      grouped[a.type].push(a);
    });

    let ctx = '\n# DOCUMENTOS DE ALAN (consulta cuando relevante)\n';
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
// 10 · API KEYS · conexiones que el usuario configura
// ============================================================

const ApiKeys = {
  CONNECTIONS: {
    anthropic: {
      name: 'Anthropic Claude API',
      description: 'Cerebro IA · Sonnet 4.5 + Haiku 4.5',
      storage: 'worker',
      required: true,
      doc_url: 'https://console.anthropic.com/settings/keys',
      placeholder: 'sk-ant-api03-...',
      hint: 'Se guarda en Cloudflare Worker como Secret · NUNCA en cliente'
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
      required: false,
      doc_url: 'https://platform.openai.com/api-keys',
      placeholder: 'sk-...'
    },
    zoho_bigin: {
      name: 'Zoho Bigin',
      description: 'Sync leads del Diagnóstico Inteligente',
      storage: 'worker',
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

  getClient(id) {
    const config = Store.get(Store.KEYS.CONFIG, {});
    const conn = this.CONNECTIONS[id];
    if (!conn || conn.storage !== 'client') return null;
    return config[conn.key_name] || null;
  },

  setClient(id, value) {
    const conn = this.CONNECTIONS[id];
    if (!conn || conn.storage !== 'client') return false;
    const config = Store.get(Store.KEYS.CONFIG, {});
    config[conn.key_name] = value;
    config[conn.key_name + '_connected_at'] = Date.now();
    return Store.set(Store.KEYS.CONFIG, config);
  },

  removeClient(id) {
    const conn = this.CONNECTIONS[id];
    if (!conn || conn.storage !== 'client') return false;
    const config = Store.get(Store.KEYS.CONFIG, {});
    delete config[conn.key_name];
    delete config[conn.key_name + '_connected_at'];
    return Store.set(Store.KEYS.CONFIG, config);
  },

  async setWorker(id, value) {
    try {
      const res = await fetch(G2C.api.proxy + '/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: id, key: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Worker error ' + res.status);

      const config = Store.get(Store.KEYS.CONFIG, {});
      config['conn_' + id + '_connected'] = true;
      config['conn_' + id + '_connected_at'] = Date.now();
      Store.set(Store.KEYS.CONFIG, config);

      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async removeWorker(id) {
    try {
      await fetch(G2C.api.proxy + '/api/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: id })
      });
      const config = Store.get(Store.KEYS.CONFIG, {});
      delete config['conn_' + id + '_connected'];
      delete config['conn_' + id + '_connected_at'];
      Store.set(Store.KEYS.CONFIG, config);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async test(id) {
    const conn = this.CONNECTIONS[id];
    if (!conn) return { success: false, error: 'Conexión desconocida' };

    if (id === 'anthropic') {
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
        if (data.content && data.content[0]) return { success: true, response: data.content[0].text };
        return { success: false, error: data.error || data.hint || 'Sin respuesta' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    if (id === 'youtube') {
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

    return { success: true, message: 'Test no implementado' };
  },

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
// 11 · PUSH NOTIFICATIONS
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
    if (Notification.permission === 'denied') return { granted: false, error: 'Permiso denegado · habilítalo en ajustes del navegador' };
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

  async schedule(opts) {
    if (!opts.subject && !opts.title) return { success: false, error: 'Falta subject' };
    if (!opts.sendAt) return { success: false, error: 'Falta sendAt' };

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
// 12 · BODY · perfil de salud + alimentos sugeridos
// ============================================================

const Body = {
  /**
   * Perfil base de Alan · referencia para sugerencias IA aterrizadas.
   */
  PROFILE: {
    edad: 33,
    condiciones: ['estrés crónico moderado', 'inflamación gastrointestinal recurrente', 'TDAH', 'TOC'],
    medicacion: ['Ritalin · 20mg AM'],
    no_tolera: ['picante (le encanta pero le inflama)'],
    intereses_alimentos: ['comer rico sin culpa', 'descubrir nuevos restaurantes'],
    actividad_fisica: ['gimnasio en casa', 'caminar con Pepe (perro)', 'natación'],
    diversion: ['PlayStation 5', 'ajedrez', 'marihuana recreacional', 'viajes USA shopping'],
    ubicacion: 'Tijuana/Ensenada, BC'
  },

  /**
   * Catálogo curado de alimentos seguros para Alan.
   * Anti-inflamatorios + sin picante + ricos + soportan TDAH/TOC.
   * Fuentes: PubMed, Mayo Clinic, dietas anti-inflamatorias clínicas.
   */
  ALIMENTOS_SEGUROS: {
    desayuno: [
      { nombre: 'Avena con plátano + miel + canela', razon: 'Carbo lento estabiliza dopamina post-Ritalin · canela antiinflamatoria', tags: ['anti-inflamatorio', 'tdah-friendly'] },
      { nombre: 'Huevos revueltos con espinaca + aguacate', razon: 'Colina + omega-3 + fibra · base sólida sin inflamar', tags: ['anti-inflamatorio', 'sin-picante'] },
      { nombre: 'Yogurt griego con arándanos + nueces', razon: 'Probióticos para microbiota inflamada · antioxidantes', tags: ['anti-inflamatorio', 'gut-health'] },
      { nombre: 'Smoothie verde: espinaca, manzana, jengibre, plátano', razon: 'Jengibre antiinflamatorio sin ser picante · energía sostenida', tags: ['anti-inflamatorio', 'gut-health'] }
    ],
    comida: [
      { nombre: 'Salmón al horno con limón + arroz integral + brócoli', razon: 'Omega-3 directo al cerebro · reduce inflamación sistémica', tags: ['anti-inflamatorio', 'tdah-friendly'] },
      { nombre: 'Pollo asado con camote + ensalada de hojas', razon: 'Proteína magra + carbo complejo · evita picos glucémicos', tags: ['sin-picante', 'estable'] },
      { nombre: 'Pasta con pesto + pollo + tomate cherry', razon: 'Sabor intenso sin picante · albahaca antioxidante', tags: ['sin-picante', 'satisfactorio'] },
      { nombre: 'Tacos de pescado con repollo morado + crema (sin salsa picante)', razon: 'Tex-Mex sin disparador · reemplaza picante con cilantro/limón', tags: ['sin-picante', 'mexicano'] },
      { nombre: 'Bowl de arroz, atún, aguacate, edamame, sésamo', razon: 'Estilo poke · proteína + omega-3 + fibra', tags: ['anti-inflamatorio', 'gut-health'] }
    ],
    cena: [
      { nombre: 'Sopa de lentejas con verduras', razon: 'Triptófano para serotonina · ayuda a dormir con TDAH', tags: ['tdah-friendly', 'cena-ligera'] },
      { nombre: 'Tostadas de aguacate con huevo pochado', razon: 'Cena ligera + grasa buena · no compite con Ritalin residual', tags: ['cena-ligera', 'estable'] },
      { nombre: 'Ensalada de quinoa con pollo, manzana, nuez', razon: 'Carbo complejo + proteína · estabiliza glucosa nocturna', tags: ['gut-health', 'estable'] }
    ],
    snacks: [
      { nombre: 'Manzana con almendras', razon: 'Fibra + grasa buena · no spike de azúcar', tags: ['estable'] },
      { nombre: 'Hummus con zanahorias', razon: 'Garbanzo antiinflamatorio · saciante sin pesar', tags: ['anti-inflamatorio'] },
      { nombre: 'Yogurt griego con miel', razon: 'Probióticos + dulce natural · alternativa a antojo malo', tags: ['gut-health'] }
    ],
    cafe_alternativas: [
      { nombre: 'Café americano con canela', razon: 'Canela reduce spike adrenalina del café · mejor con Ritalin', tags: ['cafe-friendly'] },
      { nombre: 'Matcha latte', razon: 'L-teanina balancea cafeína · enfoque sin ansiedad', tags: ['cafe-friendly', 'tdah-friendly'] },
      { nombre: 'Cold brew con leche de almendra', razon: 'Liberación lenta de cafeína · evita crash de mediodía', tags: ['cafe-friendly'] }
    ],
    evitar: [
      'Picante (chiles, salsas tipo Valentina, aguachile, tajín en exceso) · te encanta pero te inflama',
      'Café espresso doble en ayunas · choca con Ritalin',
      'Refresco · spike glucémico empeora TOC',
      'Ultraprocesados · empeoran inflamación'
    ]
  },

  /**
   * Rutinas de ejercicio adaptadas: gym en casa + caminar con Pepe + natación.
   */
  EJERCICIO: {
    gym_casa_30min: [
      { dia: 'Lunes', foco: 'Tren superior + core', ejercicios: 'Push-ups 4x12 · plancha 3x45s · curls mancuerna 3x12 · superman 3x15' },
      { dia: 'Martes', foco: 'Caminata Pepe + movilidad', ejercicios: '40 min caminata zona Cacho/Río · estiramiento cadera 10 min al regresar' },
      { dia: 'Miércoles', foco: 'Tren inferior', ejercicios: 'Sentadillas 4x15 · zancadas 3x12 · puente glúteo 3x15 · pantorrilla 4x20' },
      { dia: 'Jueves', foco: 'Cardio bajo impacto', ejercicios: 'Burpees suaves 3x10 · jumping jacks 4x30s · mountain climbers 3x20' },
      { dia: 'Viernes', foco: 'Caminata + natación si hay tiempo', ejercicios: '45 min caminata + 30 min nadar (alberca local)' },
      { dia: 'Sábado', foco: 'Activo libre', ejercicios: 'Caminata larga con Pepe (1h+) · explora zona nueva Tijuana' },
      { dia: 'Domingo', foco: 'Descanso activo', ejercicios: 'Estiramiento 20 min · respiración 5 min para TOC' }
    ],
    motivacion: {
      tdah: 'Hazlo en bloques de 15 min · NO te exijas 1 hora seguida. Tu cerebro responde mejor a sprints.',
      toc: 'Misma hora cada día · la rutina rígida que te tortura en otras áreas, aquí es tu ventaja.',
      estres: 'Cardio moderado libera endorfinas · mejor que ansiolítico para tu perfil',
      energia: 'Si no tienes ganas: solo ponte la ropa deportiva. 80% del tiempo termina haciendo algo.'
    }
  }
};

// ============================================================
// 13 · OCIO · vicios con enfoque
// ============================================================

const Ocio = {
  ACTIVIDADES: {
    ajedrez: {
      nombre: 'Ajedrez',
      descripcion: 'Tu vicio mental favorito',
      sugerencias: [
        'chess.com · 1 partida diaria 10 min · mantiene mente ágil',
        'Lichess.org · gratis · sin distracciones · puzzles diarios',
        'Estudia 1 apertura por mes · estructura tu TOC en algo productivo'
      ]
    },
    marihuana: {
      nombre: 'Marihuana',
      descripcion: 'Vicio recreacional · enfoque consciente',
      sugerencias: [
        'Sativa AM productiva · creatividad para diseño/UI',
        'Indica PM · ayuda a desconectar TOC nocturno',
        'No mezclar con Ritalin activo · espera 6h post-dosis',
        'Trackea gasto mensual · mantén bajo $1,500 MXN para no descontrol financiero'
      ]
    },
    ps5: {
      nombre: 'PlayStation 5',
      descripcion: 'Tu reset mental nocturno',
      sugerencias: [
        'Sesiones max 90 min · TDAH se hiperfijea fácil',
        'Géneros recomendados: estrategia (XCOM), narrativa (God of War), deportes (FIFA · social)',
        'Evita después de 11pm · afecta sueño + Ritalin del día siguiente'
      ]
    },
    viajes_usa: {
      nombre: 'Viajes USA · shopping + dispensaries',
      descripcion: 'Combinación que te encanta',
      sugerencias: [
        'San Diego día completo: Las Americas Outlets + dispensary downtown',
        'LA fin de semana: Melrose vintage + Venice + dispensaries Hollywood',
        'Combo eficiente: planea 1 viaje cada 6 semanas · presupuesto $5K-8K',
        'Cruza temprano viernes (5am) · evita filas largas · regreso domingo PM'
      ]
    }
  }
};

// ============================================================
// 14 · LYRICS · letras de canciones para modo escena
// ============================================================

const Lyrics = {
  /**
   * Guarda letras vinculadas a canción.
   * Soporta texto plano y formato LRC con timestamps [mm:ss.xx].
   */
  KEY: 'alan_mando_lyrics',

  list() { return Store.get(this.KEY, []); },

  byCancionId(cancionId) {
    return this.list().find(l => l.cancion_id === cancionId);
  },

  save(cancionId, contenido, formato = 'plain') {
    const all = this.list();
    const existing = all.findIndex(l => l.cancion_id === cancionId);
    const obj = {
      cancion_id: cancionId,
      contenido,
      formato, // 'plain' | 'lrc'
      lineas: this.parse(contenido, formato),
      updated_at: Date.now()
    };
    if (existing >= 0) all[existing] = { ...all[existing], ...obj };
    else { obj.id = 'lyr_' + Date.now(); obj.created_at = Date.now(); all.unshift(obj); }
    Store.set(this.KEY, all);
    return obj;
  },

  remove(cancionId) {
    Store.set(this.KEY, this.list().filter(l => l.cancion_id !== cancionId));
  },

  /**
   * Parser de letras: detecta si es LRC sincronizado o texto plano.
   * Devuelve array de {time, text} (time en segundos, null si plain).
   */
  parse(contenido, formato) {
    const lineas = [];
    const text = (contenido || '').trim();
    if (!text) return lineas;

    if (formato === 'lrc' || /^\[\d{2}:\d{2}/.test(text)) {
      // LRC: [00:23.40]línea de letra
      const lrcRegex = /^\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/;
      text.split('\n').forEach(line => {
        const m = line.match(lrcRegex);
        if (m) {
          const min = parseInt(m[1]);
          const sec = parseInt(m[2]);
          const ms = m[3] ? parseInt(m[3].padEnd(3, '0')) : 0;
          lineas.push({
            time: min * 60 + sec + ms / 1000,
            text: (m[4] || '').trim()
          });
        }
      });
    } else {
      // Texto plano · cada línea sin timestamp
      text.split('\n').forEach(line => {
        const t = line.trim();
        if (t) lineas.push({ time: null, text: t });
      });
    }
    return lineas;
  }
};

// ============================================================
// 15 · PROVEEDORES · gastos del negocio para Estado de Resultados
// ============================================================

const Proveedores = {
  KEY: 'alan_mando_proveedores',
  GASTOS_KEY: 'alan_mando_gastos_negocio',

  CATEGORIAS: {
    hosting: 'Hosting · dominios · CDN',
    saas: 'SaaS · suscripciones software',
    publicidad: 'Publicidad · Meta · Google Ads',
    contabilidad: 'Contador · servicios fiscales',
    legal: 'Asesoría legal',
    diseño: 'Diseño · freelancers',
    desarrollo: 'Dev · programadores externos',
    oficina: 'Oficina virtual · coworking',
    transporte: 'Transporte · gasolina · uber',
    comidas_negocio: 'Comidas con clientes',
    capacitacion: 'Cursos · libros',
    equipo: 'Equipo · hardware · gadgets',
    otro: 'Otro'
  },

  list() { return Store.get(this.KEY, []); },

  save(prov) {
    const all = this.list();
    if (prov.id) {
      const idx = all.findIndex(p => p.id === prov.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...prov, updated_at: Date.now() };
    } else {
      prov.id = 'prov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      prov.created_at = Date.now();
      all.unshift(prov);
    }
    Store.set(this.KEY, all);
    return prov;
  },

  remove(id) {
    Store.set(this.KEY, this.list().filter(p => p.id !== id));
  },

  // Gastos individuales por proveedor
  gastos() { return Store.get(this.GASTOS_KEY, []); },

  registrarGasto(g) {
    const all = this.gastos();
    g.id = 'gasto_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    g.fecha = g.fecha || Date.now();
    g.created_at = Date.now();
    all.unshift(g);
    Store.set(this.GASTOS_KEY, all);

    // Cascada: también registra en movimientos generales
    const movimientos = Store.get('alan_mando_movimientos', []);
    movimientos.push({
      id: 'mov_' + Date.now(),
      ts: g.fecha,
      tipo: 'gasto',
      monto: g.monto,
      concepto: g.concepto + ' · ' + g.proveedor_nombre,
      categoria: 'g2c_' + (g.categoria || 'otro'),
      proveedor_id: g.proveedor_id,
      gasto_id: g.id
    });
    Store.set('alan_mando_movimientos', movimientos);

    return g;
  },

  /**
   * Estado de Resultados para periodo dado.
   */
  estadoResultados(desde, hasta) {
    desde = desde || (Date.now() - 30 * 86400000);
    hasta = hasta || Date.now();

    // Ingresos: cobros recibidos en el periodo
    const movs = Store.get('alan_mando_movimientos', []);
    const ingresos = movs.filter(m =>
      m.tipo === 'ingreso' && m.ts >= desde && m.ts <= hasta &&
      (m.categoria || '').startsWith('g2c')
    );

    // Egresos: gastos a proveedores en el periodo
    const gastos = this.gastos().filter(g => g.fecha >= desde && g.fecha <= hasta);

    const totalIngresos = ingresos.reduce((s, m) => s + m.monto, 0);
    const totalEgresos = gastos.reduce((s, g) => s + g.monto, 0);

    // Por categoría
    const egresosPorCat = {};
    gastos.forEach(g => {
      const cat = g.categoria || 'otro';
      egresosPorCat[cat] = (egresosPorCat[cat] || 0) + g.monto;
    });

    // Costo por cliente (cuántos gastos asociados a cada cliente)
    const costoPorCliente = {};
    gastos.forEach(g => {
      if (g.cliente_id) {
        costoPorCliente[g.cliente_id] = (costoPorCliente[g.cliente_id] || 0) + g.monto;
      }
    });

    return {
      periodo: { desde, hasta },
      ingresos: { total: totalIngresos, count: ingresos.length, items: ingresos },
      egresos: { total: totalEgresos, count: gastos.length, por_categoria: egresosPorCat, items: gastos },
      utilidad_bruta: totalIngresos - totalEgresos,
      margen: totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) : 0,
      costo_por_cliente: costoPorCliente,
      roi: totalEgresos > 0 ? (totalIngresos / totalEgresos) : null
    };
  }
};

// ============================================================
// 16 · PROYECCIONES FINANCIERAS
// ============================================================

const Proyecciones = {
  /**
   * Proyecta cuánto tiempo te toma alcanzar una meta financiera específica
   * basado en TODO el contexto: MRR, gastos, ahorro actual, ritmo histórico.
   */
  calcular(metaMonto, opciones = {}) {
    const { conMargen = 0.7, ahorroActual = 0 } = opciones;

    const finanzas = Store.get(Store.KEYS.FINANZAS, {});
    const clientes = Store.get(Store.KEYS.CLIENTES, []);
    const eventos = Store.get(Store.KEYS.EVENTOS_MUSICA, []);
    const serviciosFijos = Store.get(Store.KEYS.SERVICIOS_FIJOS, []);

    // Ingresos mensuales estimados
    const mrrG2C = clientes.filter(c => c.status !== 'archivado').reduce((s, c) => s + (c.monto_mensual || 0), 0);
    const tocadasMes = eventos.filter(e => e.tipo === 'tocada' && e.confirmada).length;
    const ingMusicaPromedio = tocadasMes * 1500; // promedio TJ

    // Gastos fijos mensuales
    const gastosFijos = serviciosFijos.reduce((s, x) => s + (x.monto || 0), 0);
    const gastosVariables = 8400; // estimado del módulo personal

    const ingresoNeto = (mrrG2C + ingMusicaPromedio) - (gastosFijos + gastosVariables);
    const ahorroMensual = ingresoNeto * conMargen; // 70% del neto va a ahorro/meta

    const faltante = metaMonto - ahorroActual;
    const meses = ahorroMensual > 0 ? Math.ceil(faltante / ahorroMensual) : null;

    // Escenarios alternativos
    const escenarios = [];

    if (meses && meses > 6) {
      // Escenario A: cerrar 1 cliente más
      const conClienteExtra = ahorroMensual + (12000 * conMargen);
      escenarios.push({
        nombre: '+1 cliente Plan Parcial',
        delta_mensual: 12000,
        nuevo_ahorro: conClienteExtra,
        meses_resultado: Math.ceil(faltante / conClienteExtra),
        ahorro_meses: meses - Math.ceil(faltante / conClienteExtra)
      });

      // Escenario B: 2 tocadas extras al mes
      const conTocadasExtra = ahorroMensual + (3000 * conMargen);
      escenarios.push({
        nombre: '+2 tocadas/mes',
        delta_mensual: 3000,
        nuevo_ahorro: conTocadasExtra,
        meses_resultado: Math.ceil(faltante / conTocadasExtra),
        ahorro_meses: meses - Math.ceil(faltante / conTocadasExtra)
      });

      // Escenario C: recortar $4K hormiga
      const conRecorte = ahorroMensual + 4000;
      escenarios.push({
        nombre: 'Recortar $4K hormiga',
        delta_mensual: 4000,
        nuevo_ahorro: conRecorte,
        meses_resultado: Math.ceil(faltante / conRecorte),
        ahorro_meses: meses - Math.ceil(faltante / conRecorte)
      });
    }

    return {
      meta: metaMonto,
      ahorro_actual: ahorroActual,
      faltante,
      ingreso_mensual_estimado: mrrG2C + ingMusicaPromedio,
      gastos_mensuales_estimado: gastosFijos + gastosVariables,
      ahorro_mensual_disponible: ahorroMensual,
      meses_a_meta: meses,
      fecha_estimada: meses ? new Date(Date.now() + meses * 30 * 86400000).toISOString().slice(0, 10) : null,
      escenarios,
      mrr_actual: mrrG2C,
      tip: meses && meses > 12 ? 'Más de 1 año a este ritmo · considera escenarios para acelerar' : null
    };
  }
};

// ============================================================
// 17 · OBJETIVOS LINK · vincular tareas a objetivos
// ============================================================

const ObjetivosLink = {
  /**
   * Tareas vinculadas a un objetivo.
   */
  tareasPorObjetivo(objetivoId) {
    const pendientes = Store.get(Store.KEYS.PENDIENTES, []);
    return pendientes.filter(p => p.objetivo_id === objetivoId);
  },

  /**
   * Sugiere tareas auto-generadas para un objetivo según su tipo.
   */
  sugerirTareas(objetivo) {
    const sugerencias = [];
    if (objetivo.tipo === 'ahorro_casa' || (objetivo.nombre || '').toLowerCase().includes('casa')) {
      sugerencias.push(
        'Cerrar 1 cliente Plan Parcial este mes',
        'Agendar 2 tocadas/mes para ingreso paralelo',
        'Recortar $4K gastos hormiga',
        'Revisar opciones crédito Infonavit/banca'
      );
    } else if (objetivo.tipo === 'mrr' || (objetivo.nombre || '').toLowerCase().includes('mrr')) {
      sugerencias.push(
        'Generar 5 propuestas G2C esta semana',
        'Diagnóstico Inteligente: 8 leads/semana',
        'Pedir 1 referido a cada cliente activo',
        'Lanzar webinar mensual privado'
      );
    } else if (objetivo.tipo === 'tocadas_mes') {
      sugerencias.push(
        'Contactar 3 venues TJ esta semana',
        'Actualizar set list según género del lugar',
        'Grabar video promo 60 segundos para venues'
      );
    }
    return sugerencias;
  },

  /**
   * Calcula progreso real de un objetivo basado en tareas completadas + ahorro actual.
   */
  progresoCompleto(objetivo) {
    const tareas = this.tareasPorObjetivo(objetivo.id);
    const completadas = tareas.filter(t => t.done).length;
    const totalTareas = tareas.length;

    const progresoMonetario = objetivo.target ? (objetivo.acumulado || 0) / objetivo.target : 0;
    const progresoTareas = totalTareas > 0 ? completadas / totalTareas : 0;

    return {
      monetario_pct: Math.round(progresoMonetario * 100),
      tareas_pct: Math.round(progresoTareas * 100),
      tareas_total: totalTareas,
      tareas_completadas: completadas,
      tareas_pendientes: tareas.filter(t => !t.done)
    };
  }
};

// ============================================================
// 18 · INICIALIZACIÓN
// ============================================================

window.G2C = G2C;
window.KB = KB;
window.Store = Store;
window.Util = Util;
window.IA = IA;
window.Cascada = Cascada;
window.UI = UI;
window.Auth = Auth;
window.SAT = SAT;
window.Attach = Attach;
window.ApiKeys = ApiKeys;
window.Push = Push;
window.Body = Body;
window.Ocio = Ocio;
window.Lyrics = Lyrics;
window.Proveedores = Proveedores;
window.Proyecciones = Proyecciones;
window.ObjetivosLink = ObjetivosLink;

console.log(`%cG2C Mando v${G2C.version}`, 'color:#FF4F00;font-weight:bold;font-size:14px;');
console.log('%cCreated by Alan Davis · powered by g2c.com.mx', 'color:rgba(244,243,239,0.5);font-size:11px;');
