/* G2C Mando v1.0 · shared.js
 * Created by Alan Davis · powered by g2c.com.mx
 *
 * Cerebro inteligente con:
 * - Router Sonnet 4.6 / Haiku 4.5
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
  version: '1.9.0',
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
    sonnet: 'claude-sonnet-4-6',
    haiku: 'claude-haiku-4-5-20251001'
  },
  auth: {
    hash: '9a631086b6658d811f1acb4d6111843f78427c5f9a28edcb755137e105a5df6f'
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
    if (n == null || isNaN(n)) return sym + '0';
    return sym + Math.round(n).toLocaleString('es-MX');
  },

  fmtMoneyK(n) {
    if (n == null || isNaN(n)) return '$0';
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

      // Helper para extraer string limpio de cualquier estructura de error
      const extractErrMsg = (errObj) => {
        if (!errObj) return null;
        if (typeof errObj === 'string') return errObj;
        if (errObj.message) return String(errObj.message);
        if (errObj.error) return extractErrMsg(errObj.error);
        if (errObj.hint) return String(errObj.hint);
        try { return JSON.stringify(errObj); } catch (e) { return 'Error desconocido'; }
      };

      if (!res.ok) {
        const errMsg = extractErrMsg(data?.error) || extractErrMsg(data?.hint) || `Worker HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      // Anthropic responde con error en lugar de content si hay problema con la key
      if (data && data.type === 'error') {
        throw new Error(extractErrMsg(data.error) || 'Anthropic API error');
      }

      this.trackUsage(model, data.usage);
      return data;
    } catch (e) {
      const cleanMsg = (e && e.message) ? String(e.message) : (typeof e === 'string' ? e : 'Error desconocido');
      console.error('IA call error:', cleanMsg);
      return {
        content: null,
        error: true,
        error_message: cleanMsg
      };
    }
  },

  trackUsage(model, usage) {
    if (!usage) return;
    let stats = Store.get(Store.KEYS.CHAT_STATS, null);
    // Auto-reparar si la estructura no es la esperada
    if (!stats || typeof stats !== 'object' || !stats.sonnet || !stats.haiku) {
      stats = { sonnet: { msgs: 0, in: 0, out: 0 }, haiku: { msgs: 0, in: 0, out: 0 } };
    }
    if (!stats.sonnet || typeof stats.sonnet.msgs !== 'number') stats.sonnet = { msgs: 0, in: 0, out: 0 };
    if (!stats.haiku || typeof stats.haiku.msgs !== 'number') stats.haiku = { msgs: 0, in: 0, out: 0 };

    const key = model && model.includes('haiku') ? 'haiku' : 'sonnet';
    stats[key].msgs = (stats[key].msgs || 0) + 1;
    stats[key].in = (stats[key].in || 0) + (usage.input_tokens || 0);
    stats[key].out = (stats[key].out || 0) + (usage.output_tokens || 0);
    try { Store.set(Store.KEYS.CHAT_STATS, stats); } catch (e) { console.warn('No pude guardar stats:', e.message); }
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
${typeof Expediente !== 'undefined' ? Expediente.buildContext() : ''}
${typeof Presupuesto !== 'undefined' ? this.buildPresupuestoContext() : ''}
${typeof Actions !== 'undefined' ? Actions.buildPromptCatalog(scope) : ''}

# CÓMO RESPONDER · ERES AGENTE EJECUTIVO, NO CHATBOT
1. **EJECUTA SIEMPRE · CERO PERMISOS**: Si Alan dice "agrega/registra/elimina/edita/cambia/recuérdame/anota/cobra/paga" → EJECUTA con bloque \`\`\`action al inicio. NO preguntes "¿quieres que...?". NO digas "puedo ayudarte a...". JUSTO EJECUTA. Después confirmas en 1 línea.
2. **NO ESCRIBAS LISTAS LARGAS**: Si Alan pregunta "¿qué clientes tengo?", "¿qué tocadas próximas?", "¿qué pendientes hay?" → emite \`listar\` + tarjeta \`ir_a\` al módulo correspondiente. NO escribas los nombres uno por uno en chat. Una línea de resumen + tarjeta tappeable. PUNTO.
3. **NÚMEROS DUROS, NO PALABRERÍA**: "Tienes $42K por cobrar" mejor que "veo que tienes algunos cobros pendientes que valdría la pena revisar".
4. **3 ORACIONES MAX antes de tu primer bloque action**: si necesitas más espacio, está mal planteado.
5. **CADA respuesta termina con quick_choices**: 2-4 botones tappeables. NUNCA dejes a Alan escribiendo más de lo necesario.
6. **CUANDO ENCUENTRES INFO RELEVANTE**: agrega \`ir_a\` para que Alan vea el módulo · NO leas los datos en chat.
7. **EMOCIONAL ANTES QUE OPERATIVO**: si menciona estrés/cansancio/ánimo, reconoce 1 oración, después puedes operar.
8. **TONO MX NEUTRO DIRECTO**: "va", "ahí va", "ya quedó", "listo". NO "vos", NO formalidades, NO "estimado Alan".
9. **NUNCA digas "agencia de marketing"** para describir G2C → "infraestructura comercial replicable".
10. **NUNCA nombres vendors externos** cuando hables de propuestas → "proveedores externos".
11. **Si ciclo de venta >45 días** → di explícitamente "cortar".
12. **Música vs G2C**: G2C ROI 6× por hora · música es ingreso paralelo confiable, no foco principal.
13. **AL DETECTAR DATA EN ALAN's MENSAJE** (números de teléfono, montos, nombres de empresas) → EXTRAE Y CREA ENTIDAD. No esperes confirmación.
14. **TUS RESPUESTAS NO SON CONVERSACIÓN, SON OUTPUT DE OPERACIÓN**: directo, accionable, sin relleno.

# EJEMPLOS DE CÓMO DEBES RESPONDER

Alan: "Cuántos clientes tengo activos"
MAL: "Tienes 3 clientes activos: Lanmarc, NEOS y SmartMeals. Lanmarc paga $7,500..."
BIEN: \`\`\`action
{"action": "listar", "args": {"tipo": "clientes"}}
\`\`\`
3 activos · MRR combinado $26K.
\`\`\`action
{"action": "ir_a", "args": {"modulo": "finanzas_recurrentes", "label": "Ver los 3 clientes"}}
\`\`\`
\`\`\`action
{"action": "quick_choices", "args": {"choices": ["Crear nuevo cliente", "Marcar como cobrado", "Ver MRR breakdown"]}}
\`\`\`

Alan: "Agrega cliente nuevo Tacos Don Beto, plan Visor, onboarding"
MAL: "¿Quieres que lo registre? Dame más detalles..."
BIEN: \`\`\`action
{"action": "crear_cliente", "args": {"nombre": "Tacos Don Beto", "plan": "Visor", "monto": 7000, "status": "onboarding"}}
\`\`\`
Listo. ¿Industria y contacto?
\`\`\`action
{"action": "quick_choices", "args": {"choices": ["Es restaurante", "Generar cobro recurrente", "Agregar contacto"]}}
\`\`\`

Alan: "Estoy denso, no tengo cabeza para nada"
MAL: "Voy a registrar todos tus pendientes..."
BIEN: Te leo · día denso pasa. Cierra la laptop 30 min, agua y aire. Cuando vuelvas seguimos.
\`\`\`action
{"action": "quick_choices", "args": {"choices": ["Pausa 30 min · agendar", "Modo crisis · solo lo urgente", "Sigamos · estoy bien"]}}
\`\`\`

# TU PERSONALIDAD
- Jefe de gabinete que ejecuta, no asistente que sugiere
- Brutal en honestidad cuando vas en mala dirección
- Celebras logros breve, sin lambisconería
- Distingues trabajo vs personal sin que Alan toggle
- **TIENES MANOS** · ejecutas, no narras lo que harías`;
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
   * Inyecta estado de presupuestos al system prompt para que la IA pueda alertar.
   */
  buildPresupuestoContext() {
    if (typeof Presupuesto === 'undefined') return '';
    const resumen = Presupuesto.resumen();
    const lines = ['\n# PRESUPUESTOS Y LÍMITES PERSONALES'];
    let alguno = false;

    Object.entries(resumen).forEach(([tipo, estado]) => {
      if (!estado || !estado.limite) return;
      const label = tipo.replace(/_/g, ' ');
      const sufijo = tipo === 'mota_semanal' ? '/semana' : (tipo.includes('mensual') ? '/mes' : (tipo.includes('semana') ? '/semana' : ''));
      const moneda = tipo.includes('minutos') ? '' : '$';
      lines.push(`· ${label}: gastado ${moneda}${estado.gasto.toLocaleString()} de ${moneda}${estado.limite.toLocaleString()}${sufijo} (${estado.pct}%)`);
      if (estado.nivel === 'rebasado') { lines.push(`  ⚠ REBASADO · debes alertar a Alan sobre esto si es relevante`); alguno = true; }
      if (estado.nivel === 'cerca') { lines.push(`  ⚠ CERCA DEL LÍMITE · si Alan menciona gastar más, advierte`); alguno = true; }
    });

    if (alguno) lines.push('REGLA: Si Alan menciona gastar en una categoría rebasada, dile el monto exacto que se pasó. Sin sermonear, solo dato.');
    return lines.length > 1 ? lines.join('\n') : '';
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

    // ============================================================
    // AUTO-DETECCIÓN GASTO DÍA · ping proactivo
    // ============================================================
    if (mov.tipo === 'gasto') {
      this.evaluarGastoDia(mov.monto);
    }

    return { ok: true, movimiento: mov, tags };
  },

  /**
   * Evalúa el gasto acumulado del día y emite alerta si excede umbrales.
   * Llamado tras cada movimiento de gasto.
   */
  evaluarGastoDia(montoNuevo) {
    if (typeof Alertas === 'undefined' || typeof Presupuesto === 'undefined') return;

    const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
    const movs = Store.get('alan_mando_movimientos', []);
    const gastoHoy = movs
      .filter(m => m.tipo === 'gasto' && m.ts >= inicioDia.getTime())
      .reduce((s, m) => s + (m.monto || 0), 0);

    const presupMensual = Presupuesto.get().gasto_total_mensual || 30000;
    const presupDiarioPromedio = presupMensual / 30;

    const stateKey = 'alan_mando_gasto_dia_alerts';
    const state = Store.get(stateKey, {});
    const dayKey = inicioDia.toISOString().slice(0, 10);
    const yaEmitido = state[dayKey] || {};

    // Umbral 1: 80% del promedio diario
    if (gastoHoy >= presupDiarioPromedio * 0.8 && !yaEmitido.amarillo) {
      Alertas.emit({
        tipo: 'gasto_dia_alto',
        subject: `Hoy llevas $${Math.round(gastoHoy).toLocaleString()} gastados`,
        body: `Vas en ${Math.round((gastoHoy / presupDiarioPromedio) * 100)}% del promedio diario ($${Math.round(presupDiarioPromedio).toLocaleString()}). Modera el resto del día.`,
        prioridad: 'media',
        amount: gastoHoy
      });
      yaEmitido.amarillo = true;
    }

    // Umbral 2: 120% rebasado
    if (gastoHoy >= presupDiarioPromedio * 1.2 && !yaEmitido.rojo) {
      Alertas.emit({
        tipo: 'gasto_dia_rebasado',
        subject: `⚠ Te pasaste · día caro`,
        body: `Hoy llevas $${Math.round(gastoHoy).toLocaleString()} · 20% arriba del diario promedio. Si sigue así, revienta el mes.`,
        prioridad: 'alta',
        amount: gastoHoy - presupDiarioPromedio
      });
      yaEmitido.rojo = true;
    }

    // Umbral 3: gasto individual MUY grande (>50% del diario)
    if (montoNuevo >= presupDiarioPromedio * 0.5 && !yaEmitido[`grande_${montoNuevo}`]) {
      Alertas.emit({
        tipo: 'gasto_individual_alto',
        subject: `Gasto fuerte · $${Math.round(montoNuevo).toLocaleString()}`,
        body: `Ese solo movimiento es ${Math.round((montoNuevo / presupDiarioPromedio) * 100)}% de tu diario promedio. Respira y revisa si fue necesario.`,
        prioridad: 'media',
        amount: montoNuevo
      });
      yaEmitido[`grande_${montoNuevo}`] = true;
    }

    state[dayKey] = yaEmitido;

    // Limpiar días viejos (>14 días)
    Object.keys(state).forEach(k => {
      const d = new Date(k);
      if (Date.now() - d.getTime() > 14 * 86400000) delete state[k];
    });
    Store.set(stateKey, state);
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
// 7 · ACTIONS · capa única de comandos para IA y UI
// ============================================================

/**
 * Cada Action tiene:
 * - name: identificador único
 * - description: para el LLM (qué hace, cuándo usarla)
 * - parameters: JSON schema simple con campos requeridos
 * - execute(args): función que ejecuta y retorna {ok, msg, data, undo?}
 *
 * El chat IA usa estas actions vía detección de intent. La UI también
 * puede llamarlas directo. SIEMPRE retornan estructura uniforme.
 */
const Actions = {
  /**
   * Diccionario de todas las acciones disponibles.
   */
  CATALOG: {
    // ===== RECORDATORIOS =====
    crear_recordatorio: {
      description: 'Crear un recordatorio agendado (ensayo, tocada, cumpleaños, fiscal, llamada). Úsalo cuando diga "recuérdame", "agéndame", "alarma para".',
      parameters: ['titulo', 'fecha_iso', 'tipo?', 'body?', 'prioridad?'],
      execute(args) {
        if (typeof Recordatorios === 'undefined') return { ok: false, msg: 'Sistema no disponible' };
        const fecha = args.fecha_iso ? new Date(args.fecha_iso).getTime() : Date.now() + 3600000;
        if (isNaN(fecha)) return { ok: false, msg: `Fecha inválida: ${args.fecha_iso}` };
        const r = Recordatorios.agendar({
          tipo: args.tipo || 'personal',
          titulo: args.titulo,
          body: args.body || '',
          fecha,
          prioridad: args.prioridad || 'media'
        });
        const lbl = new Date(fecha).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return { ok: true, msg: `Recordatorio "${args.titulo}" agendado para ${lbl}`, data: r, undo: { action: 'eliminar_recordatorio', args: { id_o_titulo: r.id } } };
      }
    },

    editar_recordatorio: {
      description: 'Editar un recordatorio · cambiar fecha, hora, título, prioridad, body. Identifica por id o por título parcial.',
      parameters: ['id_o_titulo', 'titulo?', 'fecha_iso?', 'prioridad?', 'body?'],
      execute(args) {
        if (typeof Recordatorios === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const all = Recordatorios.list ? Recordatorios.list() : Store.get('alan_mando_recordatorios', []);
        let r = all.find(x => x.id === args.id_o_titulo);
        if (!r) r = all.find(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (!r) return { ok: false, msg: `Recordatorio "${args.id_o_titulo}" no encontrado` };
        const cambios = [];
        if (args.titulo) { cambios.push(`título: ${r.titulo} → ${args.titulo}`); r.titulo = args.titulo; }
        if (args.fecha_iso) {
          const nf = new Date(args.fecha_iso).getTime();
          if (isNaN(nf)) return { ok: false, msg: `Fecha inválida: ${args.fecha_iso}` };
          const lblOld = new Date(r.fecha).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
          const lblNew = new Date(nf).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
          cambios.push(`fecha: ${lblOld} → ${lblNew}`);
          r.fecha = nf;
        }
        if (args.prioridad) { cambios.push(`prioridad: ${r.prioridad} → ${args.prioridad}`); r.prioridad = args.prioridad; }
        if (args.body !== undefined) r.body = args.body;
        Store.set('alan_mando_recordatorios', all);
        return { ok: true, msg: `Recordatorio actualizado · ${cambios.join(' · ')}`, data: r };
      }
    },

    eliminar_recordatorio: {
      description: 'Eliminar recordatorio. Identifica por id o título parcial. Pide confirmación.',
      parameters: ['id_o_titulo', 'confirmar?'],
      execute(args) {
        if (typeof Recordatorios === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const all = Recordatorios.list ? Recordatorios.list() : Store.get('alan_mando_recordatorios', []);
        let idx = all.findIndex(x => x.id === args.id_o_titulo);
        if (idx === -1) idx = all.findIndex(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar "${all[idx].titulo}"`, requires_confirm: true, action: 'eliminar_recordatorio', args: { id_o_titulo: all[idx].id, confirmar: true } };
        }
        const removed = all.splice(idx, 1)[0];
        Store.set('alan_mando_recordatorios', all);
        return { ok: true, msg: `Recordatorio "${removed.titulo}" eliminado`, data: removed };
      }
    },

    // ===== PENDIENTES =====
    crear_pendiente: {
      description: 'Crear tarea/pendiente. Úsalo con "agrega tarea", "pendiente", "tengo que", "anota".',
      parameters: ['titulo', 'prioridad?', 'due_iso?', 'objetivo_id?'],
      execute(args) {
        const due_ts = args.due_iso ? new Date(args.due_iso).getTime() : null;
        const pend = {
          id: 'pend_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          titulo: args.titulo,
          prioridad: args.prioridad || 'media',
          urgente: args.prioridad === 'alta',
          importante: args.prioridad === 'alta' || args.prioridad === 'media',
          due_ts,
          fecha_creacion: Date.now(),
          done: false,
          objetivo_id: args.objetivo_id || null
        };
        Store.push(Store.KEYS.PENDIENTES, pend);
        return { ok: true, msg: `Pendiente creado: "${args.titulo}"`, data: pend, undo: { action: 'eliminar_pendiente', args: { id_o_titulo: pend.id, confirmar: true } } };
      }
    },

    editar_pendiente: {
      description: 'Editar pendiente · cambiar título, prioridad, fecha vencimiento. Identifica por id o título parcial.',
      parameters: ['id_o_titulo', 'titulo?', 'prioridad?', 'due_iso?'],
      execute(args) {
        const pends = Store.get(Store.KEYS.PENDIENTES, []);
        let p = pends.find(x => x.id === args.id_o_titulo);
        if (!p) p = pends.find(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (!p) return { ok: false, msg: `Pendiente "${args.id_o_titulo}" no encontrado` };
        const cambios = [];
        if (args.titulo) { cambios.push(`título: ${p.titulo} → ${args.titulo}`); p.titulo = args.titulo; }
        if (args.prioridad) { cambios.push(`prioridad: ${p.prioridad} → ${args.prioridad}`); p.prioridad = args.prioridad; p.urgente = args.prioridad === 'alta'; p.importante = args.prioridad !== 'baja'; }
        if (args.due_iso) {
          const nf = new Date(args.due_iso).getTime();
          if (isNaN(nf)) return { ok: false, msg: `Fecha inválida: ${args.due_iso}` };
          cambios.push(`fecha: ${args.due_iso}`);
          p.due_ts = nf;
        }
        Store.set(Store.KEYS.PENDIENTES, pends);
        return { ok: true, msg: `Pendiente actualizado · ${cambios.join(' · ')}`, data: p };
      }
    },

    completar_pendiente: {
      description: 'Marcar pendiente como completado',
      parameters: ['id_o_titulo'],
      execute(args) {
        const pends = Store.get(Store.KEYS.PENDIENTES, []);
        let p = pends.find(x => x.id === args.id_o_titulo);
        if (!p) p = pends.find(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (!p) return { ok: false, msg: 'No encontrado' };
        p.done = true; p.completed_at = Date.now();
        Store.set(Store.KEYS.PENDIENTES, pends);
        return { ok: true, msg: `"${p.titulo}" completado`, data: p };
      }
    },

    eliminar_pendiente: {
      description: 'Eliminar pendiente · pide confirmación.',
      parameters: ['id_o_titulo', 'confirmar?'],
      execute(args) {
        const pends = Store.get(Store.KEYS.PENDIENTES, []);
        let idx = pends.findIndex(x => x.id === args.id_o_titulo);
        if (idx === -1) idx = pends.findIndex(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar "${pends[idx].titulo}"`, requires_confirm: true, action: 'eliminar_pendiente', args: { id_o_titulo: pends[idx].id, confirmar: true } };
        }
        const removed = pends.splice(idx, 1)[0];
        Store.set(Store.KEYS.PENDIENTES, pends);
        return { ok: true, msg: 'Pendiente eliminado', data: removed };
      }
    },

    // ===== CLIENTES =====
    crear_cliente: {
      description: 'Agregar cliente nuevo a G2C. Campos: nombre (persona), negocio (empresa/marca), plan (Visor/Parcial/Total), monto (importe mensual), email, whatsapp, status (activo/onboarding/pausado/prospecto), notas.',
      parameters: ['nombre', 'negocio?', 'plan?', 'monto?', 'email?', 'whatsapp?', 'status?', 'frecuencia?', 'notas?'],
      execute(args) {
        const cli = {
          id: 'cli_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          nombre: args.nombre,
          negocio: args.negocio || '',
          plan: args.plan || 'Visor',
          monto: args.monto || 0,
          email: args.email || '',
          whatsapp: args.whatsapp || '',
          frecuencia: args.frecuencia || 'mensual',
          fechaInicio: new Date().toISOString().slice(0, 10),
          notas: args.notas || '',
          status: args.status || 'activo',
          createdAt: Date.now()
        };
        Store.push(Store.KEYS.CLIENTES, cli);
        const label = cli.negocio || cli.nombre;
        return { ok: true, msg: `Cliente "${label}" creado · ${cli.plan} $${cli.monto.toLocaleString()}/mes`, data: cli, undo: { action: 'eliminar_cliente', args: { id_o_nombre: cli.id, confirmar: true } } };
      }
    },

    editar_cliente: {
      description: 'Editar cliente · nombre, negocio, monto, plan, status, email, whatsapp, frecuencia, notas. Identifica por id o nombre parcial.',
      parameters: ['id_o_nombre', 'nombre?', 'negocio?', 'monto?', 'plan?', 'status?', 'email?', 'whatsapp?', 'frecuencia?', 'notas?'],
      execute(args) {
        const clientes = Store.get(Store.KEYS.CLIENTES, []);
        let c = clientes.find(x => x.id === args.id_o_nombre);
        if (!c) c = clientes.find(x => (x.nombre || '').toLowerCase().includes((args.id_o_nombre || '').toLowerCase()) || (x.negocio || '').toLowerCase().includes((args.id_o_nombre || '').toLowerCase()));
        if (!c) return { ok: false, msg: `Cliente "${args.id_o_nombre}" no encontrado` };
        const cambios = [];
        if (args.nombre) { cambios.push(`nombre: ${c.nombre} → ${args.nombre}`); c.nombre = args.nombre; }
        if (args.negocio !== undefined) { cambios.push(`negocio: ${c.negocio || '—'} → ${args.negocio}`); c.negocio = args.negocio; }
        if (args.monto !== undefined) { cambios.push(`monto: $${c.monto} → $${args.monto}`); c.monto = args.monto; }
        if (args.plan) { cambios.push(`plan: ${c.plan} → ${args.plan}`); c.plan = args.plan; }
        if (args.status) { cambios.push(`status: ${c.status} → ${args.status}`); c.status = args.status; }
        if (args.email !== undefined) c.email = args.email;
        if (args.whatsapp !== undefined) c.whatsapp = args.whatsapp;
        if (args.frecuencia) { cambios.push(`frecuencia: ${c.frecuencia} → ${args.frecuencia}`); c.frecuencia = args.frecuencia; }
        if (args.notas !== undefined) c.notas = args.notas;
        Store.set(Store.KEYS.CLIENTES, clientes);
        return { ok: true, msg: `Cliente "${c.negocio || c.nombre}" actualizado · ${cambios.join(' · ')}`, data: c };
      }
    },

    eliminar_cliente: {
      description: 'Eliminar cliente · pide confirmación.',
      parameters: ['id_o_nombre', 'confirmar?'],
      execute(args) {
        const clientes = Store.get(Store.KEYS.CLIENTES, []);
        let idx = clientes.findIndex(x => x.id === args.id_o_nombre);
        if (idx === -1) idx = clientes.findIndex(x => x.nombre.toLowerCase().includes((args.id_o_nombre || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar cliente "${clientes[idx].nombre}"`, requires_confirm: true, action: 'eliminar_cliente', args: { id_o_nombre: clientes[idx].id, confirmar: true } };
        }
        const removed = clientes.splice(idx, 1)[0];
        Store.set(Store.KEYS.CLIENTES, clientes);
        return { ok: true, msg: `Cliente "${removed.nombre}" eliminado`, data: removed };
      }
    },

    // ===== MOVIMIENTOS / FINANZAS =====
    registrar_movimiento: {
      description: 'Registrar ingreso o gasto. Tipo: "ingreso"/"gasto". Categoría: g2c, musica, personal, ocio_marihuana, ocio_shopping, comida, etc.',
      parameters: ['tipo', 'monto', 'concepto', 'categoria?', 'fecha_iso?'],
      execute(args) {
        if (!args.monto || !args.concepto) return { ok: false, msg: 'Falta monto o concepto' };
        const ts = args.fecha_iso ? new Date(args.fecha_iso).getTime() : Date.now();
        const mov = {
          id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          ts,
          tipo: args.tipo,
          monto: parseFloat(args.monto),
          concepto: args.concepto,
          categoria: args.categoria || 'general',
          tags: []
        };
        if (typeof Cascada !== 'undefined') Cascada.registrarMovimiento(mov);
        else { const movs = Store.get('alan_mando_movimientos', []); movs.push(mov); Store.set('alan_mando_movimientos', movs); }
        return { ok: true, msg: `${args.tipo === 'ingreso' ? '+' : '−'}$${args.monto.toLocaleString()} · ${args.concepto}`, data: mov, undo: { action: 'eliminar_movimiento', args: { id_o_concepto: mov.id, confirmar: true } } };
      }
    },

    editar_movimiento: {
      description: 'Editar movimiento · monto, concepto, categoría, tipo, fecha. Identifica por id o concepto parcial.',
      parameters: ['id_o_concepto', 'monto?', 'concepto?', 'categoria?', 'tipo?', 'fecha_iso?'],
      execute(args) {
        const movs = Store.get('alan_mando_movimientos', []);
        let m = movs.find(x => x.id === args.id_o_concepto);
        if (!m) m = movs.find(x => (x.concepto || '').toLowerCase().includes((args.id_o_concepto || '').toLowerCase()));
        if (!m) return { ok: false, msg: `Movimiento "${args.id_o_concepto}" no encontrado` };
        const cambios = [];
        if (args.monto !== undefined) { cambios.push(`monto: $${m.monto} → $${args.monto}`); m.monto = parseFloat(args.monto); }
        if (args.concepto) { cambios.push(`concepto: ${m.concepto} → ${args.concepto}`); m.concepto = args.concepto; }
        if (args.categoria) { cambios.push(`categoría: ${m.categoria} → ${args.categoria}`); m.categoria = args.categoria; }
        if (args.tipo) { cambios.push(`tipo: ${m.tipo} → ${args.tipo}`); m.tipo = args.tipo; }
        if (args.fecha_iso) { m.ts = new Date(args.fecha_iso).getTime(); cambios.push(`fecha: ${args.fecha_iso}`); }
        Store.set('alan_mando_movimientos', movs);
        return { ok: true, msg: `Movimiento actualizado · ${cambios.join(' · ')}`, data: m };
      }
    },

    eliminar_movimiento: {
      description: 'Eliminar movimiento · pide confirmación.',
      parameters: ['id_o_concepto', 'confirmar?'],
      execute(args) {
        const movs = Store.get('alan_mando_movimientos', []);
        let idx = movs.findIndex(m => m.id === args.id_o_concepto);
        if (idx === -1) idx = movs.findIndex(m => (m.concepto || '').toLowerCase().includes((args.id_o_concepto || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar movimiento "${movs[idx].concepto}" · $${movs[idx].monto}`, requires_confirm: true, action: 'eliminar_movimiento', args: { id_o_concepto: movs[idx].id, confirmar: true } };
        }
        const removed = movs.splice(idx, 1)[0];
        Store.set('alan_mando_movimientos', movs);
        return { ok: true, msg: 'Movimiento eliminado', data: removed };
      }
    },

    // ===== TOCADAS / EVENTOS MÚSICA =====
    crear_tocada: {
      description: 'Agendar tocada o evento musical',
      parameters: ['titulo', 'fecha_iso', 'pago?', 'ubicacion?', 'tipo?', 'grupo?', 'contacto?'],
      execute(args) {
        const dt = new Date(args.fecha_iso);
        if (isNaN(dt.getTime())) return { ok: false, msg: `Fecha inválida: ${args.fecha_iso}` };
        const evt = {
          id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          titulo: args.titulo,
          fecha: args.fecha_iso.slice(0, 10),
          hora: dt.toTimeString().slice(0, 5),
          ts: dt.getTime(),
          tipo: args.tipo || 'tocada',
          grupo: args.grupo || 'otro',
          pago: args.pago || 0,
          monto: args.pago || 0,
          status: 'tentativo',
          ubicacion: args.ubicacion || '',
          contacto: args.contacto || '',
          tareas: [],
          createdAt: Date.now()
        };
        Store.push(Store.KEYS.EVENTOS_MUSICA, evt);
        return { ok: true, msg: `Tocada "${args.titulo}" agendada ${evt.fecha} ${evt.hora}`, data: evt, undo: { action: 'eliminar_tocada', args: { id_o_titulo: evt.id, confirmar: true } } };
      }
    },

    editar_tocada: {
      description: 'Editar tocada · cambiar título, fecha/hora, pago, ubicación, status, contacto. Identifica por id o título parcial.',
      parameters: ['id_o_titulo', 'titulo?', 'fecha_iso?', 'pago?', 'ubicacion?', 'status?', 'contacto?', 'grupo?', 'tipo?'],
      execute(args) {
        const eventos = Store.get(Store.KEYS.EVENTOS_MUSICA, []);
        let e = eventos.find(x => x.id === args.id_o_titulo);
        if (!e) e = eventos.find(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (!e) return { ok: false, msg: `Tocada "${args.id_o_titulo}" no encontrada` };
        const cambios = [];
        if (args.titulo) { cambios.push(`título: ${e.titulo} → ${args.titulo}`); e.titulo = args.titulo; }
        if (args.fecha_iso) {
          const dt = new Date(args.fecha_iso);
          if (isNaN(dt.getTime())) return { ok: false, msg: `Fecha inválida` };
          cambios.push(`fecha: ${e.fecha} ${e.hora} → ${args.fecha_iso}`);
          e.fecha = args.fecha_iso.slice(0, 10);
          e.hora = dt.toTimeString().slice(0, 5);
          e.ts = dt.getTime();
        }
        if (args.pago !== undefined) { cambios.push(`pago: $${e.pago} → $${args.pago}`); e.pago = args.pago; e.monto = args.pago; }
        if (args.ubicacion) { cambios.push(`ubicación: ${e.ubicacion || '-'} → ${args.ubicacion}`); e.ubicacion = args.ubicacion; }
        if (args.status) { cambios.push(`status: ${e.status} → ${args.status}`); e.status = args.status; }
        if (args.contacto) e.contacto = args.contacto;
        if (args.grupo) e.grupo = args.grupo;
        if (args.tipo) e.tipo = args.tipo;
        e.updatedAt = Date.now();
        Store.set(Store.KEYS.EVENTOS_MUSICA, eventos);
        return { ok: true, msg: `Tocada actualizada · ${cambios.join(' · ')}`, data: e };
      }
    },

    eliminar_tocada: {
      description: 'Eliminar tocada · pide confirmación.',
      parameters: ['id_o_titulo', 'confirmar?'],
      execute(args) {
        const eventos = Store.get(Store.KEYS.EVENTOS_MUSICA, []);
        let idx = eventos.findIndex(e => e.id === args.id_o_titulo);
        if (idx === -1) idx = eventos.findIndex(e => (e.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrada' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar tocada "${eventos[idx].titulo}"`, requires_confirm: true, action: 'eliminar_tocada', args: { id_o_titulo: eventos[idx].id, confirmar: true } };
        }
        const removed = eventos.splice(idx, 1)[0];
        Store.set(Store.KEYS.EVENTOS_MUSICA, eventos);
        return { ok: true, msg: 'Tocada eliminada', data: removed };
      }
    },

    // ===== CANCIONES =====
    crear_cancion: {
      description: 'Agregar canción al repertorio',
      parameters: ['titulo', 'artista?', 'genero?', 'youtubeUrl?', 'status?'],
      execute(args) {
        const c = {
          id: 'song_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          titulo: args.titulo,
          artista: args.artista || '',
          genero: args.genero || '',
          status: args.status || 'ensayando',
          letraUrl: '',
          youtubeUrl: args.youtubeUrl || '',
          anotaciones: '',
          tareas: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        Store.push(Store.KEYS.CANCIONES, c);
        return { ok: true, msg: `Canción "${args.titulo}" agregada`, data: c, undo: { action: 'eliminar_cancion', args: { id_o_titulo: c.id, confirmar: true } } };
      }
    },

    editar_cancion: {
      description: 'Editar canción · título, artista, género, status (ensayando/lista/descartada), youtube, anotaciones. Identifica por id o título parcial.',
      parameters: ['id_o_titulo', 'titulo?', 'artista?', 'genero?', 'status?', 'youtubeUrl?', 'anotaciones?'],
      execute(args) {
        const cs = Store.get(Store.KEYS.CANCIONES, []);
        let c = cs.find(x => x.id === args.id_o_titulo);
        if (!c) c = cs.find(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (!c) return { ok: false, msg: `Canción "${args.id_o_titulo}" no encontrada` };
        const cambios = [];
        if (args.titulo) { cambios.push(`título: ${c.titulo} → ${args.titulo}`); c.titulo = args.titulo; }
        if (args.artista) { cambios.push(`artista: ${c.artista || '-'} → ${args.artista}`); c.artista = args.artista; }
        if (args.genero) { cambios.push(`género: ${c.genero || '-'} → ${args.genero}`); c.genero = args.genero; }
        if (args.status) { cambios.push(`status: ${c.status} → ${args.status}`); c.status = args.status; }
        if (args.youtubeUrl) c.youtubeUrl = args.youtubeUrl;
        if (args.anotaciones !== undefined) c.anotaciones = args.anotaciones;
        c.updatedAt = Date.now();
        Store.set(Store.KEYS.CANCIONES, cs);
        return { ok: true, msg: `Canción actualizada · ${cambios.join(' · ')}`, data: c };
      }
    },

    eliminar_cancion: {
      description: 'Eliminar canción · pide confirmación.',
      parameters: ['id_o_titulo', 'confirmar?'],
      execute(args) {
        const cs = Store.get(Store.KEYS.CANCIONES, []);
        let idx = cs.findIndex(x => x.id === args.id_o_titulo);
        if (idx === -1) idx = cs.findIndex(x => (x.titulo || '').toLowerCase().includes((args.id_o_titulo || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrada' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar canción "${cs[idx].titulo}"`, requires_confirm: true, action: 'eliminar_cancion', args: { id_o_titulo: cs[idx].id, confirmar: true } };
        }
        const removed = cs.splice(idx, 1)[0];
        Store.set(Store.KEYS.CANCIONES, cs);
        return { ok: true, msg: 'Canción eliminada', data: removed };
      }
    },

    // ===== OBJETIVOS =====
    crear_objetivo: {
      description: 'Crear objetivo financiero o personal',
      parameters: ['nombre', 'descripcion?', 'deadline?', 'target?'],
      execute(args) {
        const obj = {
          id: 'obj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          nombre: args.nombre,
          titulo: args.nombre,
          descripcion: args.descripcion || '',
          deadline: args.deadline || null,
          target: args.target || null,
          progreso: 0,
          completed: false,
          kpis: [],
          createdAt: Date.now()
        };
        Store.push(Store.KEYS.OBJETIVOS, obj);
        return { ok: true, msg: `Objetivo "${args.nombre}" creado`, data: obj, undo: { action: 'eliminar_objetivo', args: { id_o_nombre: obj.id, confirmar: true } } };
      }
    },

    editar_objetivo: {
      description: 'Editar objetivo · nombre, descripción, deadline, target, progreso. Identifica por id o nombre parcial.',
      parameters: ['id_o_nombre', 'nombre?', 'descripcion?', 'deadline?', 'target?', 'progreso?', 'completed?'],
      execute(args) {
        const objs = Store.get(Store.KEYS.OBJETIVOS, []);
        let o = objs.find(x => x.id === args.id_o_nombre);
        if (!o) o = objs.find(x => ((x.nombre || x.titulo) || '').toLowerCase().includes((args.id_o_nombre || '').toLowerCase()));
        if (!o) return { ok: false, msg: `Objetivo "${args.id_o_nombre}" no encontrado` };
        const cambios = [];
        if (args.nombre) { cambios.push(`nombre: ${o.nombre || o.titulo} → ${args.nombre}`); o.nombre = args.nombre; o.titulo = args.nombre; }
        if (args.descripcion !== undefined) o.descripcion = args.descripcion;
        if (args.deadline) { cambios.push(`deadline: ${args.deadline}`); o.deadline = args.deadline; }
        if (args.target !== undefined) { cambios.push(`target: $${args.target}`); o.target = args.target; }
        if (args.progreso !== undefined) { cambios.push(`progreso: ${args.progreso}%`); o.progreso = args.progreso; }
        if (args.completed !== undefined) { o.completed = args.completed; if (args.completed) cambios.push('marcado como completado'); }
        Store.set(Store.KEYS.OBJETIVOS, objs);
        return { ok: true, msg: `Objetivo actualizado · ${cambios.join(' · ')}`, data: o };
      }
    },

    eliminar_objetivo: {
      description: 'Eliminar objetivo · pide confirmación.',
      parameters: ['id_o_nombre', 'confirmar?'],
      execute(args) {
        const objs = Store.get(Store.KEYS.OBJETIVOS, []);
        let idx = objs.findIndex(x => x.id === args.id_o_nombre);
        if (idx === -1) idx = objs.findIndex(x => ((x.nombre || x.titulo) || '').toLowerCase().includes((args.id_o_nombre || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar objetivo "${objs[idx].nombre || objs[idx].titulo}"`, requires_confirm: true, action: 'eliminar_objetivo', args: { id_o_nombre: objs[idx].id, confirmar: true } };
        }
        const removed = objs.splice(idx, 1)[0];
        Store.set(Store.KEYS.OBJETIVOS, objs);
        return { ok: true, msg: 'Objetivo eliminado', data: removed };
      }
    },

    // ===== COBROS RECURRENTES =====
    crear_cobro_recurrente: {
      description: 'Crear cobro recurrente a cliente (auto-genera liga cobros.g2c.com.mx)',
      parameters: ['cliente_nombre', 'monto', 'concepto?', 'frecuencia?'],
      execute(args) {
        if (typeof Recurrentes === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const c = Recurrentes.crearCobro({
          cliente_nombre: args.cliente_nombre,
          concepto: args.concepto || `Plan G2C · ${args.frecuencia || 'mensual'}`,
          monto: parseFloat(args.monto),
          frecuencia: args.frecuencia || 'mensual',
          fecha_inicio: Date.now()
        });
        return { ok: true, msg: `Cobro recurrente ${args.cliente_nombre} creado · $${args.monto}/${args.frecuencia || 'mes'}`, data: c, undo: { action: 'eliminar_cobro_recurrente', args: { id_o_cliente: c.id, confirmar: true } } };
      }
    },

    editar_cobro_recurrente: {
      description: 'Editar cobro recurrente · monto, concepto, frecuencia, status (activo/pausado). Identifica por id o cliente.',
      parameters: ['id_o_cliente', 'monto?', 'concepto?', 'frecuencia?', 'activo?'],
      execute(args) {
        if (typeof Recurrentes === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const all = Recurrentes.cobros();
        let c = all.find(x => x.id === args.id_o_cliente);
        if (!c) c = all.find(x => (x.cliente_nombre || '').toLowerCase().includes((args.id_o_cliente || '').toLowerCase()));
        if (!c) return { ok: false, msg: `Cobro "${args.id_o_cliente}" no encontrado` };
        const cambios = [];
        if (args.monto !== undefined) { cambios.push(`monto: $${c.monto} → $${args.monto}`); c.monto = parseFloat(args.monto); }
        if (args.concepto) { cambios.push(`concepto: ${args.concepto}`); c.concepto = args.concepto; }
        if (args.frecuencia) { cambios.push(`frecuencia: ${c.frecuencia} → ${args.frecuencia}`); c.frecuencia = args.frecuencia; }
        if (args.activo !== undefined) { cambios.push(`activo: ${args.activo}`); c.activo = args.activo; }
        const cobros = Store.get('alan_mando_cobros_recurrentes', []);
        const idx = cobros.findIndex(x => x.id === c.id);
        if (idx >= 0) { cobros[idx] = c; Store.set('alan_mando_cobros_recurrentes', cobros); }
        return { ok: true, msg: `Cobro actualizado · ${cambios.join(' · ')}`, data: c };
      }
    },

    eliminar_cobro_recurrente: {
      description: 'Eliminar cobro recurrente · pide confirmación.',
      parameters: ['id_o_cliente', 'confirmar?'],
      execute(args) {
        const cobros = Store.get('alan_mando_cobros_recurrentes', []);
        let idx = cobros.findIndex(x => x.id === args.id_o_cliente);
        if (idx === -1) idx = cobros.findIndex(x => (x.cliente_nombre || '').toLowerCase().includes((args.id_o_cliente || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar cobro "${cobros[idx].cliente_nombre}"`, requires_confirm: true, action: 'eliminar_cobro_recurrente', args: { id_o_cliente: cobros[idx].id, confirmar: true } };
        }
        const removed = cobros.splice(idx, 1)[0];
        Store.set('alan_mando_cobros_recurrentes', cobros);
        return { ok: true, msg: 'Cobro recurrente eliminado', data: removed };
      }
    },

    // ===== PAGOS RECURRENTES =====
    crear_pago_recurrente: {
      description: 'Crear pago recurrente a proveedor (Netlify, contador, etc)',
      parameters: ['proveedor', 'monto', 'concepto?', 'frecuencia?', 'link_pago?', 'categoria?'],
      execute(args) {
        if (typeof Recurrentes === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const p = Recurrentes.crearPago({
          proveedor: args.proveedor,
          concepto: args.concepto || 'Servicio mensual',
          categoria: args.categoria || 'saas',
          monto: parseFloat(args.monto),
          frecuencia: args.frecuencia || 'mensual',
          fecha_inicio: Date.now(),
          link_pago: args.link_pago || ''
        });
        return { ok: true, msg: `Pago recurrente ${args.proveedor} · $${args.monto}/${args.frecuencia || 'mes'}`, data: p, undo: { action: 'eliminar_pago_recurrente', args: { id_o_proveedor: p.id, confirmar: true } } };
      }
    },

    editar_pago_recurrente: {
      description: 'Editar pago recurrente · monto, concepto, frecuencia, link de pago, status. Identifica por id o proveedor.',
      parameters: ['id_o_proveedor', 'monto?', 'concepto?', 'frecuencia?', 'link_pago?', 'activo?', 'categoria?'],
      execute(args) {
        if (typeof Recurrentes === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const all = Recurrentes.pagos();
        let p = all.find(x => x.id === args.id_o_proveedor);
        if (!p) p = all.find(x => (x.proveedor || '').toLowerCase().includes((args.id_o_proveedor || '').toLowerCase()));
        if (!p) return { ok: false, msg: `Pago "${args.id_o_proveedor}" no encontrado` };
        const cambios = [];
        if (args.monto !== undefined) { cambios.push(`monto: $${p.monto} → $${args.monto}`); p.monto = parseFloat(args.monto); }
        if (args.concepto) { cambios.push(`concepto: ${args.concepto}`); p.concepto = args.concepto; }
        if (args.frecuencia) { cambios.push(`frecuencia: ${p.frecuencia} → ${args.frecuencia}`); p.frecuencia = args.frecuencia; }
        if (args.link_pago) p.link_pago = args.link_pago;
        if (args.activo !== undefined) { cambios.push(`activo: ${args.activo}`); p.activo = args.activo; }
        if (args.categoria) p.categoria = args.categoria;
        const pagos = Store.get('alan_mando_pagos_recurrentes', []);
        const idx = pagos.findIndex(x => x.id === p.id);
        if (idx >= 0) { pagos[idx] = p; Store.set('alan_mando_pagos_recurrentes', pagos); }
        return { ok: true, msg: `Pago actualizado · ${cambios.join(' · ')}`, data: p };
      }
    },

    eliminar_pago_recurrente: {
      description: 'Eliminar pago recurrente · pide confirmación.',
      parameters: ['id_o_proveedor', 'confirmar?'],
      execute(args) {
        const pagos = Store.get('alan_mando_pagos_recurrentes', []);
        let idx = pagos.findIndex(x => x.id === args.id_o_proveedor);
        if (idx === -1) idx = pagos.findIndex(x => (x.proveedor || '').toLowerCase().includes((args.id_o_proveedor || '').toLowerCase()));
        if (idx === -1) return { ok: false, msg: 'No encontrado' };
        if (!args.confirmar) {
          return { ok: false, msg: `Confirmar eliminar pago "${pagos[idx].proveedor}"`, requires_confirm: true, action: 'eliminar_pago_recurrente', args: { id_o_proveedor: pagos[idx].id, confirmar: true } };
        }
        const removed = pagos.splice(idx, 1)[0];
        Store.set('alan_mando_pagos_recurrentes', pagos);
        return { ok: true, msg: 'Pago recurrente eliminado', data: removed };
      }
    },

    // ===== PERFIL FÍSICO =====
    editar_perfil: {
      description: 'Editar datos del perfil físico de Alan · nombre, peso, estatura, sangre, condiciones, medicación.',
      parameters: ['nombre?', 'peso_kg?', 'estatura_cm?', 'sangre?', 'fecha_nacimiento?', 'condiciones?', 'medicacion?'],
      execute(args) {
        if (typeof PerfilFisico === 'undefined') return { ok: false, msg: 'Sin sistema de perfil' };
        const p = PerfilFisico.get();
        const cambios = [];
        if (args.nombre) { cambios.push(`nombre: ${args.nombre}`); p.nombre = args.nombre; }
        if (args.peso_kg !== undefined) { cambios.push(`peso: ${p.peso_kg || '-'} → ${args.peso_kg} kg`); p.peso_kg = parseFloat(args.peso_kg); }
        if (args.estatura_cm !== undefined) { cambios.push(`estatura: ${args.estatura_cm} cm`); p.estatura_cm = parseFloat(args.estatura_cm); }
        if (args.sangre) { cambios.push(`sangre: ${args.sangre}`); p.sangre = args.sangre; }
        if (args.fecha_nacimiento) { cambios.push(`nacimiento: ${args.fecha_nacimiento}`); p.fecha_nacimiento = args.fecha_nacimiento; }
        if (Array.isArray(args.condiciones)) { p.condiciones = args.condiciones; cambios.push('condiciones actualizadas'); }
        if (Array.isArray(args.medicacion)) { p.medicacion = args.medicacion; cambios.push('medicación actualizada'); }
        PerfilFisico.set(p);
        return { ok: true, msg: `Perfil actualizado · ${cambios.join(' · ')}`, data: p };
      }
    },

    // ===== PRESUPUESTOS =====
    editar_presupuesto: {
      description: 'Editar presupuestos · mota_semanal, shopping_mensual, gasto_total_mensual, gaming_minutos_semana.',
      parameters: ['mota_semanal?', 'shopping_mensual?', 'gasto_total_mensual?', 'ingreso_minimo_mes?', 'gaming_minutos_semana?'],
      execute(args) {
        if (typeof Presupuesto === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const p = Presupuesto.get();
        const cambios = [];
        ['mota_semanal','shopping_mensual','gasto_total_mensual','ingreso_minimo_mes','gaming_minutos_semana'].forEach(k => {
          if (args[k] !== undefined) { cambios.push(`${k}: ${p[k]} → ${args[k]}`); p[k] = parseFloat(args[k]); }
        });
        Presupuesto.set(p);
        return { ok: true, msg: `Presupuestos · ${cambios.join(' · ')}`, data: p };
      }
    },

    // ===== NOTIFICACIONES =====
    toggle_notif: {
      description: 'Encender o apagar un tipo de notificación. Tipos: cobro_vencido, gasto_dia_alto, tocada, fiscal, pendiente_alta, etc.',
      parameters: ['tipo', 'activar'],
      execute(args) {
        if (typeof NotifPrefs === 'undefined') return { ok: false, msg: 'Sin sistema' };
        const p = NotifPrefs.get();
        if (!(args.tipo in p)) return { ok: false, msg: `Tipo "${args.tipo}" no existe · usa: ${Object.keys(p).join(', ')}` };
        p[args.tipo] = args.activar === true || args.activar === 'true';
        NotifPrefs.set(p);
        return { ok: true, msg: `Notif "${args.tipo}" ${p[args.tipo] ? 'activada' : 'desactivada'}`, data: p };
      }
    },

    // ===== LECTURAS =====
    listar: {
      description: 'Listar items: clientes, pendientes, recordatorios, tocadas, canciones, objetivos, cobros, pagos, movimientos.',
      parameters: ['tipo'],
      execute(args) {
        const map = {
          clientes: () => Store.get(Store.KEYS.CLIENTES, []),
          pendientes: () => Store.get(Store.KEYS.PENDIENTES, []).filter(p => !p.done),
          recordatorios: () => typeof Recordatorios !== 'undefined' && Recordatorios.proximos ? Recordatorios.proximos(20) : Store.get('alan_mando_recordatorios', []),
          tocadas: () => Store.get(Store.KEYS.EVENTOS_MUSICA, []),
          canciones: () => Store.get(Store.KEYS.CANCIONES, []),
          objetivos: () => Store.get(Store.KEYS.OBJETIVOS, []).filter(o => !o.completed),
          cobros: () => typeof Recurrentes !== 'undefined' ? Recurrentes.cobros() : [],
          pagos: () => typeof Recurrentes !== 'undefined' ? Recurrentes.pagos() : [],
          movimientos: () => Store.get('alan_mando_movimientos', []).slice(-20)
        };
        const fn = map[args.tipo];
        if (!fn) return { ok: false, msg: `Tipo "${args.tipo}" no soportado · usa: ${Object.keys(map).join(', ')}` };
        const items = fn();
        return { ok: true, msg: `${items.length} ${args.tipo}`, data: items };
      }
    },

    // ===== SUGERENCIAS · IA propone, usuario aprueba =====
    sugerir: {
      description: 'Cuando detectes que Alan PROBABLEMENTE quiere algo pero no lo pidió explícito, NO ejecutes · SUGIÉRELO con esta acción. Le aparece tarjeta con botones Aprobar/Rechazar. Para: recordatorios obvios, pendientes que se desprenden de la conversación, gastos que se mencionan al pasar, etc.',
      parameters: ['accion_sugerida', 'args_sugeridos', 'razon'],
      execute(args) {
        const sug = {
          id: 'sug_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          accion: args.accion_sugerida,
          args: args.args_sugeridos || {},
          razon: args.razon || '',
          creado: Date.now(),
          status: 'pendiente'
        };
        const sugs = Store.get('alan_mando_sugerencias', []);
        sugs.unshift(sug);
        if (sugs.length > 50) sugs.length = 50;
        Store.set('alan_mando_sugerencias', sugs);
        return { ok: true, msg: 'Sugerencia creada', data: sug, is_suggestion: true };
      }
    },

    // ===== QUICK CHOICES · botones de decisión rápida =====
    // Esta NO se ejecuta · solo se renderiza como botones tappeables abajo del mensaje.
    // La IA debe agregar quick_choices a CADA respuesta para forzar próxima acción.
    quick_choices: {
      description: 'OBLIGATORIO en CADA respuesta. Termina TODA respuesta con 2-4 botones de acción rápida. Cada botón es texto que se "envía" como si Alan hubiera escrito eso. Hace tu respuesta tappeable, no que tenga que escribir.',
      parameters: ['choices'],
      execute(args) {
        // No ejecuta nada · solo se renderiza como botones inline en chat.html
        return { ok: true, msg: '', data: { choices: args.choices || [] }, is_quick_choices: true };
      }
    },

    // ===== NAVEGACIÓN · cuando IA encuentra algo y quiere mandar a Alan a verlo =====
    ir_a: {
      description: 'Cuando encuentres data relevante (cliente, pendiente, tocada, evento, etc) y quieras que Alan VEA el módulo donde está, agrega esta acción · sale tarjeta con botón "Ver →". Modulos válidos: finanzas, finanzas_recurrentes, finanzas_proyecciones, musica, calendario, pendientes, cuidado, mente, config. Para deep-link a item específico, agrega item_id.',
      parameters: ['modulo', 'item_id?', 'label?'],
      execute(args) {
        const modulos = {
          finanzas: { url: 'finanzas.html', label: 'Ver finanzas' },
          finanzas_recurrentes: { url: 'finanzas.html?tab=recurrentes', label: 'Ver recurrentes' },
          finanzas_proyecciones: { url: 'finanzas.html?tab=proyecciones', label: 'Ver proyecciones' },
          finanzas_objetivos: { url: 'finanzas.html?tab=objetivos', label: 'Ver objetivos' },
          finanzas_personal: { url: 'finanzas.html?tab=personal', label: 'Ver gastos personal' },
          musica: { url: 'musica.html', label: 'Ver música' },
          calendario: { url: 'calendario.html', label: 'Ver calendario' },
          pendientes: { url: 'pendientes.html', label: 'Ver pendientes' },
          cuidado: { url: 'cuidado.html', label: 'Ver cuidado' },
          mente: { url: 'mente.html', label: 'Ver Mente' },
          cuidado_perfil: { url: 'cuidado.html?tab=perfil', label: 'Ver perfil' },
          cuidado_ejercicio: { url: 'cuidado.html?tab=ejercicio', label: 'Ver ejercicio' },
          cuidado_dieta: { url: 'cuidado.html?tab=dieta', label: 'Ver dieta' },
          cuidado_ocio: { url: 'cuidado.html?tab=ocio', label: 'Ver ocio' },
          config: { url: 'config.html', label: 'Ver configuración' },
          chat: { url: 'chat.html', label: 'Ver chat' }
        };
        const m = modulos[args.modulo];
        if (!m) return { ok: false, msg: `Módulo "${args.modulo}" no existe · usa: ${Object.keys(modulos).join(', ')}` };
        let url = m.url;
        if (args.item_id) {
          url += (url.includes('?') ? '&' : '?') + 'highlight=' + encodeURIComponent(args.item_id);
        }
        return { ok: true, msg: '', data: { url, label: args.label || m.label }, is_navigation: true };
      }
    },

    // ===== LISTA VISUAL · cards bonitas en lugar de texto plano =====
    lista_visual: {
      description: 'OBLIGATORIO cuando Alan pida ver/listar/cuáles son sus pendientes/cobros/clientes/tocadas. Genera tarjetas visuales tappeables · NO escribas la lista en texto plano. Tipos: pendientes, cobros, pagos, clientes, tocadas, canciones, objetivos. Limit max 5 items por lista visual.',
      parameters: ['tipo', 'titulo?', 'subtitulo?'],
      execute(args) {
        const tipo = args.tipo;
        const items = [];
        let titulo = args.titulo;
        let color = '#FF4F00';
        let modulo_link = null;

        if (tipo === 'pendientes') {
          const all = (Store.get(Store.KEYS.PENDIENTES, []) || []).filter(p => !p.done);
          items.push(...all.slice(0, 5).map(p => ({
            id: p.id,
            principal: p.titulo || p.descripcion || 'Sin título',
            secundario: p.prioridad === 'alta' ? '★ alta' : p.prioridad || '',
            tag: p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-MX', {day:'numeric', month:'short'}) : '',
            urgente: p.prioridad === 'alta'
          })));
          titulo = titulo || `${all.length} pendientes activos`;
          color = '#7AC8DC';
          modulo_link = 'pendientes';
        } else if (tipo === 'cobros') {
          const cxc = (Store.get('alan_mando_cuentas_cobrar', []) || []).filter(c => !c.cobrado);
          const rec = (Store.get('alan_mando_cobros_recurrentes', []) || []).filter(c => c.activo);
          [...cxc, ...rec].slice(0, 5).forEach(c => {
            items.push({
              id: c.id,
              principal: c.cliente_nombre || c.cliente || c.concepto || 'Sin nombre',
              secundario: c.concepto || c.cliente_nombre || '',
              tag: c.monto ? '$' + Math.round(c.monto).toLocaleString() : '',
              urgente: c.fecha_esperada && c.fecha_esperada < Date.now()
            });
          });
          titulo = titulo || `${cxc.length + rec.length} cobros activos`;
          color = '#7AC68A';
          modulo_link = 'finanzas';
        } else if (tipo === 'pagos') {
          const cxp = (Store.get('alan_mando_cuentas_pagar', []) || []).filter(p => !p.pagado);
          const rec = (Store.get('alan_mando_pagos_recurrentes', []) || []).filter(p => p.activo);
          [...cxp, ...rec].slice(0, 5).forEach(p => {
            items.push({
              id: p.id,
              principal: p.proveedor_nombre || p.proveedor || p.concepto || 'Sin nombre',
              secundario: p.concepto || p.proveedor_nombre || '',
              tag: p.monto ? '$' + Math.round(p.monto).toLocaleString() : '',
              urgente: p.fecha && p.fecha < Date.now()
            });
          });
          titulo = titulo || `${cxp.length + rec.length} pagos activos`;
          color = '#D4A574';
          modulo_link = 'finanzas';
        } else if (tipo === 'clientes') {
          const all = Store.get(Store.KEYS.CLIENTES, []) || [];
          items.push(...all.slice(0, 5).map(c => ({
            id: c.id,
            principal: c.negocio || c.nombre,
            secundario: `${c.plan || 'Plan'} · ${c.status || 'activo'}`,
            tag: c.monto ? '$' + Math.round(c.monto).toLocaleString() : '',
            urgente: c.status === 'vencido'
          })));
          titulo = titulo || `${all.length} clientes`;
          color = '#FF7A00';
          modulo_link = 'finanzas';
        } else if (tipo === 'tocadas') {
          const ev = (Store.get(Store.KEYS.EVENTOS_MUSICA, []) || []).filter(e => e.tipo === 'tocada' && e.ts > Date.now()).sort((a, b) => a.ts - b.ts);
          items.push(...ev.slice(0, 5).map(e => ({
            id: e.id,
            principal: e.titulo || e.lugar || 'Tocada sin nombre',
            secundario: e.lugar || '',
            tag: new Date(e.ts).toLocaleDateString('es-MX', {weekday:'short', day:'numeric', month:'short'}),
            urgente: e.ts < Date.now() + 86400000 * 3
          })));
          titulo = titulo || `${ev.length} tocadas próximas`;
          color = '#7AC8DC';
          modulo_link = 'musica';
        } else if (tipo === 'canciones') {
          const c = Store.get(Store.KEYS.CANCIONES, []) || [];
          items.push(...c.slice(0, 5).map(s => ({
            id: s.id,
            principal: s.titulo || 'Sin título',
            secundario: s.artista || '',
            tag: s.tono || '',
            urgente: false
          })));
          titulo = titulo || `${c.length} canciones`;
          color = '#7AC8DC';
          modulo_link = 'musica';
        } else if (tipo === 'objetivos') {
          const all = (Store.get(Store.KEYS.OBJETIVOS, []) || []).filter(o => !o.cumplido);
          items.push(...all.slice(0, 5).map(o => ({
            id: o.id,
            principal: o.titulo || 'Objetivo sin nombre',
            secundario: o.kpi ? `KPI: ${o.kpi}` : '',
            tag: o.deadline ? new Date(o.deadline).toLocaleDateString('es-MX', {day:'numeric', month:'short'}) : '',
            urgente: false
          })));
          titulo = titulo || `${all.length} objetivos activos`;
          color = '#FF7A00';
          modulo_link = 'finanzas_objetivos';
        }

        if (items.length === 0) {
          return { ok: true, msg: '', data: { tipo, titulo: titulo || 'Sin items', items: [], color, vacio: true, modulo_link }, is_lista_visual: true };
        }
        return { ok: true, msg: '', data: { tipo, titulo, subtitulo: args.subtitulo, items, color, modulo_link }, is_lista_visual: true };
      }
    },

    // ===== TARJETA RESUMEN ·  Para mostrar números grandes destacados =====
    tarjeta_resumen: {
      description: 'Para mostrar UN número/dato importante destacado · ej. "MRR actual $26K". 3 args: titulo (corto), valor (grande), contexto (línea pequeña abajo).',
      parameters: ['titulo', 'valor', 'contexto?', 'color?'],
      execute(args) {
        return { ok: true, msg: '', data: { titulo: args.titulo, valor: args.valor, contexto: args.contexto || '', color: args.color || 'orange' }, is_resumen: true };
      }
    }
  },

  /**
   * Construye un texto con TODAS las acciones disponibles para inyectar al system prompt.
   */
  buildPromptCatalog(scope = 'chat') {
    const ahora = new Date();
    const ahoraMX = ahora.toLocaleString('es-MX', { timeZone: 'America/Tijuana', dateStyle: 'full', timeStyle: 'short' });
    const isoMX = (() => {
      const d = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000));
      return d.toISOString().slice(0, 19);
    })();

    // Scopes que NO necesitan acciones · solo texto narrativo
    const isReadOnly = ['briefing', 'tip', 'analisis', 'resumen', 'pulso'].some(s => scope.includes(s));

    if (isReadOnly) {
      // Briefing/tip/análisis: SIN catálogo de acciones, SIN quick_choices, SIN bloques action.
      // Solo texto natural · la UI tiene sus propios botones hardcoded.
      let txt = '\n# CONTEXTO TEMPORAL\n';
      txt += `Hora actual MX: ${ahoraMX}\n\n`;
      txt += '# FORMATO DE RESPUESTA\n';
      txt += 'Esta respuesta es un BRIEFING/TIP narrativo que se muestra en home/dashboard.\n';
      txt += 'NO uses bloques ```action```. NO uses quick_choices. NO uses JSON.\n';
      txt += 'Solo texto natural directo · 2-4 oraciones máximo · MX neutro.\n';
      txt += 'No saludes con "buenas noches" o similar · ya hay header. Empieza directo con la observación.\n';
      return txt;
    }

    // CHAT scope · catálogo completo + quick_choices obligatorio
    let txt = '\n# ACCIONES QUE PUEDES EJECUTAR EN EL SISTEMA\n';
    txt += `Hora actual MX: ${ahoraMX} (ISO: ${isoMX})\n\n`;
    txt += '## CÓMO EJECUTAR ACCIONES\n';
    txt += 'INMEDIATAMENTE al inicio de tu respuesta abre un bloque (literal con tres backticks):\n\n';
    txt += '```action\n';
    txt += '{"action": "nombre_accion", "args": {"campo": "valor"}}\n';
    txt += '```\n\n';
    txt += 'CRÍTICO: el bloque DEBE empezar con tres backticks + "action" + newline. Sin eso NO se ejecuta. Si dices que ejecutaste algo SIN emitir el bloque, mientes.\n';
    txt += 'Después del bloque, escribe lenguaje natural CORTO confirmando lo hecho.\n\n';

    txt += '## OBLIGATORIO · RESPUESTA TERMINA CON BOTONES\n';
    txt += 'CADA respuesta de chat SIEMPRE termina con un segundo bloque action que define 2-4 botones de "respuesta rápida":\n\n';
    txt += '```action\n';
    txt += '{"action": "quick_choices", "args": {"choices": ["Sí, hazlo", "Cambiar fecha", "Cancelar"]}}\n';
    txt += '```\n\n';
    txt += 'Cada choice es texto corto (máx 5 palabras) que aparece como botón. Tap = se envía como si Alan lo escribiera.\n';
    txt += 'NO uses preguntas largas. Convierte preguntas → botones.\n';
    txt += 'NO escribas párrafos largos cuando puedes dar 3 botones de decisión.\n';
    txt += 'EJEMPLOS de choices buenos:\n';
    txt += '  · ["Confirmar $7500", "Mejor $6500", "Pausar cliente"]\n';
    txt += '  · ["Mover a mañana 9am", "Mover a viernes", "Eliminar"]\n';
    txt += '  · ["Crear pendiente alta", "Solo recordatorio", "Olvídalo"]\n';
    txt += '  · ["Sí, registra ingreso", "Es gasto, no ingreso", "Cancela"]\n\n';

    txt += '## SUGERENCIAS\n';
    txt += 'Para SUGERIR (cuando NO te lo pidió explícito), usa "sugerir" · sale tarjeta Aprobar/Rechazar. NO ejecutes lo que no te pidieron.\n\n';

    txt += 'CATÁLOGO COMPLETO:\n';
    Object.entries(this.CATALOG).forEach(([name, def]) => {
      txt += `· ${name}(${def.parameters.join(', ')}): ${def.description}\n`;
    });

    txt += '\n## REGLAS DURAS\n';
    txt += '1. PEDIDO EXPLÍCITO ("agrega", "edita", "elimina", "cambia", "recuérdame") → EJECUTA con bloque action · NUNCA digas "hazlo tú desde la interfaz".\n';
    txt += '2. **CADA respuesta termina SIEMPRE con quick_choices** (2-4 botones) · NUNCA dejes a Alan sin opciones tappeables.\n';
    txt += '3. **CUANDO ALAN PIDA "lista de X" / "qué X tengo" / "muéstrame X" / "cuáles son mis X"** → usa SIEMPRE `lista_visual` · NUNCA escribas los items uno por uno en texto. UN bloque `lista_visual` reemplaza una lista bullets.\n';
    txt += '4. **CUANDO MENCIONES UN NÚMERO/MONTO IMPORTANTE** ("MRR $26K", "tienes $42K por cobrar") → usa `tarjeta_resumen` con valor grande. NO lo dejes en texto plano.\n';
    txt += '5. INFERENCIA → usa "sugerir" · NO ejecutes directo.\n';
    txt += '6. ELIMINACIONES → primera vez sin "confirmar:true" · sistema pedirá confirmación.\n';
    txt += '7. EDICIONES → usa id_o_nombre/id_o_titulo con búsqueda parcial case-insensitive.\n';
    txt += '8. FECHAS → ISO YYYY-MM-DDTHH:mm:00 zona MX.\n';
    txt += '9. NUNCA digas "no puedo editar/eliminar X" · TODO se puede.\n';
    txt += '10. **TEXTO MÁXIMO 2 ORACIONES** antes del primer bloque action. Si necesitas más, pasa a cards.\n';
    txt += '11. CERO "¿quieres que...?" · ejecuta directo · cero permisos.\n';
    txt += '12. CUANDO ENCUENTRES algo relevante agrega "ir_a" para que Alan VEA el módulo.\n\n';

    txt += '## EJEMPLOS COMPLETOS DE RESPUESTA\n\n';

    txt += '### Ejemplo 1 · Edición + quick_choices\n';
    txt += 'Alan: "Lanmarc ahora paga 7500"\n';
    txt += 'Tu respuesta:\n\n';
    txt += '```action\n';
    txt += '{"action": "editar_cliente", "args": {"id_o_nombre": "Lanmarc", "monto": 7500}}\n';
    txt += '```\n\n';
    txt += 'Subido a 7500.\n\n';
    txt += '```action\n';
    txt += '{"action": "quick_choices", "args": {"choices": ["Aplica ya", "Desde próximo cobro", "Ver historial"]}}\n';
    txt += '```\n\n';

    txt += '### Ejemplo 2 · Pidió ver lista (usar lista_visual + ir_a · NO escribir items)\n';
    txt += 'Alan: "lista de tareas" / "qué pendientes tengo" / "muéstrame mis pendientes"\n';
    txt += 'TU respuesta debe ser EXACTAMENTE así (NO escribir nombres):\n\n';
    txt += 'Acá están tus pendientes activos:\n\n';
    txt += '```action\n';
    txt += '{"action": "lista_visual", "args": {"tipo": "pendientes", "subtitulo": "ordenados por prioridad"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "ir_a", "args": {"modulo": "pendientes", "label": "Ver todos los pendientes"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "quick_choices", "args": {"choices": ["Cerrar el más urgente", "Crear nuevo", "Cuáles son alta"]}}\n';
    txt += '```\n\n';

    txt += '### Ejemplo 3 · Pidió cobros (lista_visual + tarjeta_resumen)\n';
    txt += 'Alan: "qué debo cobrar"\n';
    txt += 'Tu respuesta:\n\n';
    txt += 'Acá los cobros activos:\n\n';
    txt += '```action\n';
    txt += '{"action": "tarjeta_resumen", "args": {"titulo": "POR COBRAR", "valor": "$42,500", "contexto": "5 clientes activos · 2 vencidos", "color": "orange"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "lista_visual", "args": {"tipo": "cobros"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "ir_a", "args": {"modulo": "finanzas_recurrentes", "label": "Ver todos los cobros"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "quick_choices", "args": {"choices": ["Generar liga el más viejo", "Recordatorios WhatsApp", "Crear cobro nuevo"]}}\n';
    txt += '```\n\n';

    txt += '### Ejemplo 4 · Conversación abierta · usa cards no texto\n';
    txt += 'Alan: "cómo estoy esta semana"\n';
    txt += 'Tu respuesta:\n\n';
    txt += 'Tu semana en números:\n\n';
    txt += '```action\n';
    txt += '{"action": "tarjeta_resumen", "args": {"titulo": "MRR ACTUAL", "valor": "$26,000", "contexto": "+12% vs mes pasado", "color": "green"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "lista_visual", "args": {"tipo": "pendientes", "titulo": "Pendientes urgentes"}}\n';
    txt += '```\n\n';
    txt += '```action\n';
    txt += '{"action": "quick_choices", "args": {"choices": ["Ver dashboard completo", "Plan de la semana", "Foco hoy"]}}\n';
    txt += '```\n';
    return txt;
  },

  /**
   * Ejecuta una acción por nombre con args.
   * Retorna {ok, msg, data, undo?}
   */
  execute(name, args = {}) {
    const def = this.CATALOG[name];
    if (!def) return { ok: false, msg: `Acción "${name}" no existe` };
    try {
      return def.execute(args);
    } catch (e) {
      console.error('Action error:', e);
      return { ok: false, msg: `Error ejecutando ${name}: ${e.message}` };
    }
  },

  /**
   * Detecta y extrae bloques de acción de una respuesta del LLM.
   * Soporta:
   *   ```action\n{...}\n```
   *   ```json\n{...}\n```  (si el JSON tiene "action")
   *   {"action":"...","args":{...}}  inline al inicio (sin fences)
   * Retorna array de {name, args, raw}
   */
  parseFromResponse(text) {
    if (!text || typeof text !== 'string') return [];
    const blocks = [];
    const seen = new Set();

    // 1. Bloques con fences ```action``` o ```json``` (con o sin newline)
    const re1 = /```(?:action|json|tool|tool_use)\s*([\s\S]*?)```/gi;
    let m;
    while ((m = re1.exec(text)) !== null) {
      this._tryAddBlock(m[1].trim(), m[0], blocks, seen);
    }

    // 2. Bloques sin lenguaje, pero con {"action": ...} dentro
    const re2 = /```\s*([\s\S]*?)```/g;
    while ((m = re2.exec(text)) !== null) {
      const inner = m[1].trim();
      if (inner.includes('"action"') && (inner.startsWith('{') || inner.startsWith('['))) {
        this._tryAddBlock(inner, m[0], blocks, seen);
      }
    }

    // 3. JSON inline al inicio del texto (último recurso) si la IA olvidó fences
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"action"')) {
      // intentar extraer el primer objeto JSON balanceado
      let depth = 0, end = -1;
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '{') depth++;
        else if (trimmed[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end > 0) {
        this._tryAddBlock(trimmed.slice(0, end), trimmed.slice(0, end), blocks, seen);
      }
    }

    return blocks;
  },

  _tryAddBlock(jsonStr, raw, blocks, seen) {
    try {
      // Soportar arrays de acciones también
      const parsed = JSON.parse(jsonStr);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach(p => {
        if (p && p.action && typeof p.action === 'string') {
          const key = p.action + JSON.stringify(p.args || {});
          if (seen.has(key)) return;
          seen.add(key);
          blocks.push({ name: p.action, args: p.args || {}, raw });
        }
      });
    } catch (e) {
      console.warn('[Actions.parse] JSON inválido:', e.message, jsonStr.slice(0, 100));
    }
  },

  /**
   * Quita los bloques de acción del texto (para mostrar al usuario solo el lenguaje natural).
   */
  stripFromResponse(text) {
    if (!text) return '';
    let out = text;
    // 1. Fences con etiqueta
    out = out.replace(/```(?:action|json|tool|tool_use)\s*[\s\S]*?```\s*/gi, '');
    // 2. Fences anónimos que contengan "action"
    out = out.replace(/```\s*([\s\S]*?)```\s*/g, (full, inner) => {
      return inner.includes('"action"') ? '' : full;
    });
    // 3. JSON inline al inicio
    const trimmed = out.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"action"')) {
      let depth = 0, end = -1;
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '{') depth++;
        else if (trimmed[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end > 0) out = trimmed.slice(end).trim();
    }
    return out.trim();
  }
};

// ============================================================
// 8 · UI HELPERS
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
      { key: 'finanzas', label: 'Finanzas', href: 'finanzas.html', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
      { key: 'musica', label: 'Música', href: 'musica.html', icon: '<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
      { key: 'cuidado', label: 'Cuidado', href: 'cuidado.html', icon: '<path d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10z" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
      { key: 'mente', label: 'Mente', href: 'mente.html', icon: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.1 2.1M16.9 16.9L19 19M5 19l2.1-2.1M16.9 7.1L19 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' }
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

    // ============================================================
    // FIX iOS · keyboard mueve el input arriba del teclado
    // visualViewport API detecta cuando el teclado abre/cierra
    // ============================================================
    const wrapHost = document.querySelector('.chat-input-wrap');
    if (wrapHost && window.visualViewport) {
      const adjustForKeyboard = () => {
        const vv = window.visualViewport;
        const keyboardOpen = vv.height < window.innerHeight - 100;

        if (keyboardOpen) {
          // Calcular cuánto sube · gap pequeño desde abajo del viewport visible
          const gap = window.innerHeight - vv.height - vv.offsetTop + 8;
          wrapHost.style.setProperty('--keyboard-bottom', gap + 'px');
          wrapHost.classList.add('keyboard-open');
        } else {
          wrapHost.classList.remove('keyboard-open');
          wrapHost.style.removeProperty('--keyboard-bottom');
        }
      };

      window.visualViewport.addEventListener('resize', adjustForKeyboard);
      window.visualViewport.addEventListener('scroll', adjustForKeyboard);
      // También en focus/blur del input (extra seguro)
      field.addEventListener('focus', () => setTimeout(adjustForKeyboard, 100));
      field.addEventListener('blur', () => setTimeout(adjustForKeyboard, 100));
    }
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
    analisis_medico: { label: 'Análisis médico · laboratorio', icon: '⊕', accept: 'application/pdf,image/*' },
    receta_medica: { label: 'Receta médica', icon: '℞', accept: 'application/pdf,image/*' },
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
      description: 'Cerebro IA · Sonnet 4.6 + Haiku 4.5',
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
// 18 · EXPEDIENTE · biomarcadores médicos extraídos de análisis
// ============================================================

const Expediente = {
  KEY: 'alan_mando_expediente',

  /**
   * Biomarcadores PRECARGADOS desde el análisis MR5330-0015 (LabExpress · 26 nov 2025).
   * Cuando Alan suba un análisis nuevo, se agrega aquí un nuevo registro con fecha.
   */
  BIOMARCADORES_PRECARGADOS: {
    folio: 'MR5330-0015',
    laboratorio: 'LabExpress',
    fecha: '2025-11-26',
    medico: 'Dr. Gonzalez Ocampo Eduardo',
    paciente_edad: 33,
    valores: [
      // CRÍTICOS · fuera de rango
      { nombre: 'Glucosa', valor: 114, unidad: 'mg/dL', ref_min: 70, ref_max: 99, estado: 'alto', categoria: 'metabolismo', nota: 'Prediabetes leve · vigilar carbos refinados + ejercicio aeróbico' },
      { nombre: 'Vitamina D 25-OH', valor: 18.9, unidad: 'ng/mL', ref_min: 30, ref_max: 50, estado: 'deficiencia', categoria: 'vitaminas', nota: 'Deficiencia franca · suplementar 4000-5000 UI/día por 2-3 meses + sol matutino 15min' },
      { nombre: 'Ácido úrico', valor: 3.12, unidad: 'mg/dL', ref_min: 3.4, ref_max: 7.0, estado: 'bajo', categoria: 'metabolismo', nota: 'Ligeramente bajo · ojo con dieta muy restringida en proteína' },
      // NORMALES · referencia
      { nombre: 'Colesterol total', valor: 194, unidad: 'mg/dL', ref_min: 120, ref_max: 200, estado: 'normal', categoria: 'lípidos' },
      { nombre: 'HDL', valor: 66.5, unidad: 'mg/dL', ref_min: 35, ref_max: 59, estado: 'optimo', categoria: 'lípidos', nota: 'Excelente · arriba del rango referencia (protector)' },
      { nombre: 'LDL', valor: 109.1, unidad: 'mg/dL', ref_min: 62, ref_max: 130, estado: 'normal', categoria: 'lípidos' },
      { nombre: 'Triglicéridos', valor: 92, unidad: 'mg/dL', ref_min: 40, ref_max: 160, estado: 'normal', categoria: 'lípidos' },
      { nombre: 'Índice aterogénico', valor: 2.9, unidad: '', ref_min: 0, ref_max: 4.0, estado: 'normal', categoria: 'lípidos' },
      { nombre: 'TGO (AST)', valor: 18, unidad: 'U/L', ref_min: 20, ref_max: 40, estado: 'bajo_leve', categoria: 'hígado', nota: 'Hígado bien · sin alarma' },
      { nombre: 'TGP (ALT)', valor: 14, unidad: 'U/L', ref_min: 10, ref_max: 40, estado: 'normal', categoria: 'hígado' },
      { nombre: 'Creatinina', valor: 0.73, unidad: 'mg/dL', ref_min: 0.5, ref_max: 1.2, estado: 'normal', categoria: 'riñón' },
      { nombre: 'Filtrado glomerular', valor: 90, unidad: 'mL/min', ref_min: 90, ref_max: null, estado: 'normal', categoria: 'riñón' },
      { nombre: 'Proteínas totales', valor: 7.1, unidad: 'g/dL', ref_min: 6.4, ref_max: 8.3, estado: 'normal', categoria: 'general' },
      { nombre: 'Albúmina', valor: 4.73, unidad: 'g/dL', ref_min: 3.5, ref_max: 5.0, estado: 'normal', categoria: 'general' },
      { nombre: 'TSH', valor: 0.68, unidad: 'uUI/mL', ref_min: 0.40, ref_max: 4.0, estado: 'normal', categoria: 'tiroides' },
      { nombre: 'T4 libre', valor: 0.94, unidad: 'ng/dL', ref_min: 0.89, ref_max: 1.76, estado: 'normal', categoria: 'tiroides', nota: 'En rango bajo · seguir' },
      { nombre: 'Sodio', valor: 140, unidad: 'mmol/L', ref_min: 136, ref_max: 145, estado: 'normal', categoria: 'electrolitos' },
      { nombre: 'Potasio', valor: 4.5, unidad: 'mmol/L', ref_min: 3.5, ref_max: 5.1, estado: 'normal', categoria: 'electrolitos' },
      { nombre: 'Apolipoproteína A1', valor: 1.88, unidad: 'g/L', ref_min: 0.73, ref_max: 1.86, estado: 'optimo', categoria: 'lípidos' },
      { nombre: 'Apolipoproteína B', valor: 0.84, unidad: 'g/L', ref_min: 0.54, ref_max: 1.63, estado: 'normal', categoria: 'lípidos' },
      { nombre: 'Índice ApoB/A1', valor: 0.5, unidad: '', ref_min: 0, ref_max: 0.70, estado: 'normal', categoria: 'lípidos' }
    ]
  },

  /**
   * Lista de análisis (cada uno con sus biomarcadores).
   */
  list() {
    const stored = Store.get(this.KEY, null);
    if (stored && stored.length) return stored;
    // Si no hay nada guardado, devolver el precargado
    return [{ ...this.BIOMARCADORES_PRECARGADOS, id: 'pre_mr5330', precargado: true }];
  },

  agregar(analisis) {
    const all = this.list().filter(a => !a.precargado);
    all.unshift({ ...analisis, id: 'an_' + Date.now(), agregado_at: Date.now() });
    Store.set(this.KEY, all);
    return analisis;
  },

  /**
   * Último análisis (más reciente).
   */
  ultimo() {
    const all = this.list();
    return all[0] || null;
  },

  /**
   * Valores fuera de rango del análisis más reciente.
   */
  alertas() {
    const ultimo = this.ultimo();
    if (!ultimo) return [];
    return ultimo.valores.filter(v => v.estado !== 'normal' && v.estado !== 'optimo');
  },

  /**
   * Construye contexto para inyectar al system prompt de la IA.
   */
  buildContext() {
    const ultimo = this.ultimo();
    if (!ultimo) return '';

    const alertas = this.alertas();
    let ctx = `\n# EXPEDIENTE MÉDICO DE ALAN (último análisis ${ultimo.fecha} · ${ultimo.laboratorio})\n`;

    if (alertas.length) {
      ctx += 'BIOMARCADORES FUERA DE RANGO · considéralos al sugerir dieta, ejercicio, suplementación:\n';
      alertas.forEach(a => {
        ctx += `· ${a.nombre}: ${a.valor} ${a.unidad} (rango ${a.ref_min}${a.ref_max ? '-' + a.ref_max : '+'}) · ${a.estado.toUpperCase()}`;
        if (a.nota) ctx += ` · ${a.nota}`;
        ctx += '\n';
      });
    }

    const optimos = ultimo.valores.filter(v => v.estado === 'optimo');
    if (optimos.length) {
      ctx += 'Excelentes: ' + optimos.map(v => v.nombre).join(', ') + '\n';
    }

    ctx += 'REGLA: cuando Alan pregunte por dieta/ejercicio/salud, considera estos valores ANTES de sugerir.\n';
    return ctx;
  }
};

// ============================================================
// 19 · PERFIL FÍSICO · datos personales para sugerencias aterrizadas
// ============================================================

const PerfilFisico = {
  KEY: 'alan_mando_perfil_fisico',

  /**
   * Datos PRECARGADOS desde sistema basados en lo que sabemos de Alan.
   * Si el usuario los ha actualizado, gana lo del usuario.
   */
  DEFAULTS: {
    nombre: 'Alan Davis',
    fecha_nacimiento: '1992-06-07',
    estatura_cm: 178, // estimado · usuario debe ajustar
    peso_kg: null, // usuario debe ingresar
    sangre: null, // usuario · útil para emergencia
    alergias: [],
    condiciones: ['estrés crónico moderado', 'inflamación gastrointestinal recurrente', 'TDAH', 'TOC'],
    medicacion: ['Ritalin 20mg AM'],
    contactos_emergencia: [],
    objetivos_salud: ['mantener peso saludable', 'reducir inflamación', 'mejorar sueño', 'energía estable durante el día']
  },

  get() {
    const stored = Store.get(this.KEY, null);
    if (stored && Object.keys(stored).length > 0) {
      return { ...this.DEFAULTS, ...stored };
    }
    return { ...this.DEFAULTS };
  },

  set(updates) {
    const current = this.get();
    Store.set(this.KEY, { ...current, ...updates, updated_at: Date.now() });
    return this.get();
  },

  /**
   * Calcula edad a partir de fecha nacimiento.
   */
  edad() {
    const p = this.get();
    if (!p.fecha_nacimiento) return null;
    const fn = new Date(p.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fn.getFullYear();
    const m = hoy.getMonth() - fn.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
    return edad;
  },

  /**
   * IMC calculado.
   */
  imc() {
    const p = this.get();
    if (!p.peso_kg || !p.estatura_cm) return null;
    const m = p.estatura_cm / 100;
    return p.peso_kg / (m * m);
  },

  imcCategoria() {
    const v = this.imc();
    if (v === null) return null;
    if (v < 18.5) return { label: 'Bajo peso', color: 'rgba(150,210,230,0.95)' };
    if (v < 25) return { label: 'Normal', color: 'rgba(180,220,170,0.95)' };
    if (v < 30) return { label: 'Sobrepeso', color: 'rgba(244,213,128,0.95)' };
    return { label: 'Obesidad', color: 'rgba(255,170,110,0.95)' };
  },

  /**
   * Días hasta el próximo cumpleaños.
   */
  diasACumple() {
    const p = this.get();
    if (!p.fecha_nacimiento) return null;
    const fn = new Date(p.fecha_nacimiento);
    const hoy = new Date();
    const proxCumple = new Date(hoy.getFullYear(), fn.getMonth(), fn.getDate());
    if (proxCumple < hoy) proxCumple.setFullYear(hoy.getFullYear() + 1);
    return Math.ceil((proxCumple - hoy) / 86400000);
  }
};

// ============================================================
// XX · RECURRENTES · cobros automáticos + pagos a proveedores recurrentes
// ============================================================

const Recurrentes = {
  COBROS_KEY: 'alan_mando_cobros_recurrentes',
  PAGOS_KEY: 'alan_mando_pagos_recurrentes',

  /**
   * Frecuencias soportadas.
   */
  FRECUENCIAS: {
    semanal: { label: 'Semanal', dias: 7 },
    quincenal: { label: 'Quincenal', dias: 15 },
    mensual: { label: 'Mensual', dias: 30 },
    bimestral: { label: 'Bimestral', dias: 60 },
    trimestral: { label: 'Trimestral', dias: 90 },
    semestral: { label: 'Semestral', dias: 180 },
    anual: { label: 'Anual', dias: 365 }
  },

  // ================== COBROS RECURRENTES (clientes) ==================

  cobros() { return Store.get(this.COBROS_KEY, []); },

  /**
   * Crear cobro recurrente. Auto-genera link MercadoPago a cobros.g2c.com.mx
   * y agenda recordatorios para cada vencimiento.
   */
  crearCobro(c) {
    const all = this.cobros();
    c.id = 'cob_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    c.tipo_recurrencia = 'cobro';
    c.created_at = Date.now();
    c.activo = true;
    c.cobro_link = c.cobro_link || `https://cobros.g2c.com.mx/?cliente=${encodeURIComponent(c.cliente_id || c.cliente_nombre)}&monto=${c.monto}&concepto=${encodeURIComponent(c.concepto || '')}`;
    c.proximo_cobro = c.fecha_inicio || Date.now();
    c.cobros_generados = 0;

    all.unshift(c);
    Store.set(this.COBROS_KEY, all);

    // Agendar primer recordatorio 3 días antes del vencimiento
    if (typeof Recordatorios !== 'undefined') {
      Recordatorios.agendar({
        tipo: 'cobro',
        titulo: `Cobrar ${c.cliente_nombre} · $${c.monto.toLocaleString()}`,
        body: `${c.concepto} · liga lista en cobros.g2c.com.mx`,
        fecha: c.proximo_cobro - 3 * 86400000,
        prioridad: 'alta',
        ref_id: c.id,
        ref_tipo: 'cobro_recurrente'
      });
    }

    return c;
  },

  /**
   * Toggle activo/pausado.
   */
  toggleCobro(id) {
    const all = this.cobros();
    const c = all.find(x => x.id === id);
    if (c) { c.activo = !c.activo; Store.set(this.COBROS_KEY, all); }
    return c;
  },

  removeCobro(id) {
    Store.set(this.COBROS_KEY, this.cobros().filter(c => c.id !== id));
  },

  /**
   * Marca un cobro como ejecutado · avanza siguiente fecha + cascada a movimientos.
   */
  ejecutarCobro(id, montoCobrado = null) {
    const all = this.cobros();
    const c = all.find(x => x.id === id);
    if (!c) return null;

    const monto = montoCobrado || c.monto;
    const freq = this.FRECUENCIAS[c.frecuencia] || this.FRECUENCIAS.mensual;

    c.cobros_generados = (c.cobros_generados || 0) + 1;
    c.ultimo_cobro = Date.now();
    c.proximo_cobro = c.proximo_cobro + freq.dias * 86400000;

    Store.set(this.COBROS_KEY, all);

    // Cascada a movimientos
    const movs = Store.get('alan_mando_movimientos', []);
    movs.push({
      id: 'mov_' + Date.now(),
      ts: Date.now(),
      tipo: 'ingreso',
      monto,
      concepto: `${c.concepto} · ${c.cliente_nombre}`,
      categoria: 'g2c_recurrente',
      cobro_recurrente_id: c.id
    });
    Store.set('alan_mando_movimientos', movs);

    // Agendar próximo recordatorio
    if (typeof Recordatorios !== 'undefined') {
      Recordatorios.agendar({
        tipo: 'cobro',
        titulo: `Cobrar ${c.cliente_nombre} · $${c.monto.toLocaleString()}`,
        body: `${c.concepto} · próximo ciclo`,
        fecha: c.proximo_cobro - 3 * 86400000,
        prioridad: 'alta',
        ref_id: c.id,
        ref_tipo: 'cobro_recurrente'
      });
    }

    return c;
  },

  /**
   * Cobros próximos a vencer (siguientes N días).
   */
  cobrosProximos(diasMax = 30) {
    const limite = Date.now() + diasMax * 86400000;
    return this.cobros().filter(c => c.activo && c.proximo_cobro <= limite).sort((a, b) => a.proximo_cobro - b.proximo_cobro);
  },

  // ================== PAGOS RECURRENTES (proveedores) ==================

  pagos() { return Store.get(this.PAGOS_KEY, []); },

  /**
   * Crea pago recurrente · agenda recordatorios automáticos.
   */
  crearPago(p) {
    const all = this.pagos();
    p.id = 'pag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    p.tipo_recurrencia = 'pago';
    p.created_at = Date.now();
    p.activo = true;
    p.proximo_pago = p.fecha_inicio || Date.now();
    p.pagos_generados = 0;

    all.unshift(p);
    Store.set(this.PAGOS_KEY, all);

    // Agendar recordatorio 3 días antes
    if (typeof Recordatorios !== 'undefined') {
      Recordatorios.agendar({
        tipo: 'fiscal',
        titulo: `Pagar ${p.proveedor} · $${p.monto.toLocaleString()}`,
        body: `${p.concepto}${p.link_pago ? ' · ' + p.link_pago : ''}`,
        fecha: p.proximo_pago - 3 * 86400000,
        prioridad: 'alta',
        ref_id: p.id,
        ref_tipo: 'pago_recurrente',
        link: p.link_pago
      });
    }

    return p;
  },

  togglePago(id) {
    const all = this.pagos();
    const p = all.find(x => x.id === id);
    if (p) { p.activo = !p.activo; Store.set(this.PAGOS_KEY, all); }
    return p;
  },

  removePago(id) {
    Store.set(this.PAGOS_KEY, this.pagos().filter(p => p.id !== id));
  },

  /**
   * Marca pago como ejecutado · avanza siguiente fecha.
   */
  ejecutarPago(id, montoPagado = null) {
    const all = this.pagos();
    const p = all.find(x => x.id === id);
    if (!p) return null;

    const monto = montoPagado || p.monto;
    const freq = this.FRECUENCIAS[p.frecuencia] || this.FRECUENCIAS.mensual;

    p.pagos_generados = (p.pagos_generados || 0) + 1;
    p.ultimo_pago = Date.now();
    p.proximo_pago = p.proximo_pago + freq.dias * 86400000;

    Store.set(this.PAGOS_KEY, all);

    // Cascada: registra como gasto en proveedores y movimientos
    if (typeof Proveedores !== 'undefined') {
      Proveedores.registrarGasto({
        proveedor_nombre: p.proveedor,
        proveedor_id: 'prov_' + p.proveedor.toLowerCase().replace(/\s+/g, '_'),
        categoria: p.categoria || 'saas',
        concepto: p.concepto,
        monto,
        pago_recurrente_id: p.id
      });
    }

    // Agendar próximo recordatorio
    if (typeof Recordatorios !== 'undefined') {
      Recordatorios.agendar({
        tipo: 'fiscal',
        titulo: `Pagar ${p.proveedor} · $${monto.toLocaleString()}`,
        body: `${p.concepto} · próximo ciclo`,
        fecha: p.proximo_pago - 3 * 86400000,
        prioridad: 'alta',
        ref_id: p.id,
        ref_tipo: 'pago_recurrente',
        link: p.link_pago
      });
    }

    return p;
  },

  pagosProximos(diasMax = 30) {
    const limite = Date.now() + diasMax * 86400000;
    return this.pagos().filter(p => p.activo && p.proximo_pago <= limite).sort((a, b) => a.proximo_pago - b.proximo_pago);
  },

  /**
   * Detección de patrones · sugiere convertir gastos repetidos en recurrentes.
   * Si el mismo proveedor aparece 2+ veces con monto similar, sugiere.
   */
  detectarPatron() {
    if (typeof Proveedores === 'undefined') return [];
    const gastos = Proveedores.gastos();
    const porProveedor = {};
    gastos.forEach(g => {
      if (!g.proveedor_nombre) return;
      const key = g.proveedor_nombre.toLowerCase();
      if (!porProveedor[key]) porProveedor[key] = [];
      porProveedor[key].push(g);
    });

    const sugerencias = [];
    Object.entries(porProveedor).forEach(([prov, lista]) => {
      if (lista.length < 2) return;
      // Ya está como recurrente?
      const yaRecurrente = this.pagos().some(p => p.proveedor.toLowerCase() === prov);
      if (yaRecurrente) return;

      // Calcular si los montos son similares (±15%)
      const montos = lista.map(g => g.monto);
      const promedio = montos.reduce((s, m) => s + m, 0) / montos.length;
      const variabilidad = Math.max(...montos.map(m => Math.abs(m - promedio) / promedio));

      if (variabilidad < 0.15) {
        sugerencias.push({
          proveedor: lista[0].proveedor_nombre,
          categoria: lista[0].categoria,
          monto_promedio: Math.round(promedio),
          ocurrencias: lista.length,
          ultimo_concepto: lista[0].concepto
        });
      }
    });
    return sugerencias;
  }
};

// ============================================================
// 19 · EJERCICIO · calendario activo + registro real de entrenamientos
// ============================================================

const Ejercicio = {
  KEY: 'alan_mando_entrenamientos',
  AGENDA_KEY: 'alan_mando_ejercicio_agenda',

  TIPOS: {
    fuerza: { label: 'Fuerza · pesas', color: 'rgba(255,170,110,0.95)', icon: '⚙' },
    cardio: { label: 'Cardio', color: 'rgba(255,79,0,0.95)', icon: '↗' },
    natacion: { label: 'Natación', color: 'rgba(120,200,220,0.95)', icon: '~' },
    caminata: { label: 'Caminata · Pepe', color: 'rgba(180,220,170,0.95)', icon: '◆' },
    flexibilidad: { label: 'Estiramiento · yoga', color: 'rgba(200,180,220,0.95)', icon: '·' },
    deporte: { label: 'Deporte', color: 'rgba(244,213,128,0.95)', icon: '◉' }
  },

  /**
   * Lista de entrenamientos completados.
   */
  list() { return Store.get(this.KEY, []); },

  /**
   * Registrar entrenamiento completado.
   */
  registrar(ent) {
    const all = this.list();
    ent.id = 'ent_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    ent.created_at = Date.now();
    if (!ent.fecha) ent.fecha = Date.now();
    all.unshift(ent);
    Store.set(this.KEY, all);
    return ent;
  },

  /**
   * Eliminar entrenamiento.
   */
  remove(id) {
    Store.set(this.KEY, this.list().filter(e => e.id !== id));
  },

  /**
   * Agenda de ejercicio (planificación futura).
   */
  agenda() { return Store.get(this.AGENDA_KEY, []); },

  agendar(item) {
    const all = this.agenda();
    item.id = 'agej_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    item.created_at = Date.now();
    all.push(item);
    Store.set(this.AGENDA_KEY, all);
    return item;
  },

  /**
   * Stats de cumplimiento últimos N días.
   */
  cumplimiento(dias = 7) {
    const desde = Date.now() - dias * 86400000;
    const ents = this.list().filter(e => e.fecha >= desde);
    const totalMinutos = ents.reduce((s, e) => s + (e.duracion_min || 0), 0);
    const porTipo = {};
    ents.forEach(e => {
      porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
    });

    const diasConActividad = new Set(ents.map(e => new Date(e.fecha).toDateString())).size;
    const meta = 5; // 5 días/semana objetivo
    const pct = Math.round((diasConActividad / meta) * 100);

    return {
      total: ents.length,
      total_minutos: totalMinutos,
      dias_activos: diasConActividad,
      meta_dias: meta,
      cumplimiento_pct: Math.min(pct, 100),
      por_tipo: porTipo,
      promedio_min_dia: diasConActividad > 0 ? Math.round(totalMinutos / diasConActividad) : 0
    };
  },

  /**
   * Próximas sesiones agendadas.
   */
  proximasSesiones(limit = 5) {
    const ahora = Date.now();
    return this.agenda()
      .filter(a => a.fecha >= ahora && !a.completado)
      .sort((a, b) => a.fecha - b.fecha)
      .slice(0, limit);
  }
};

// ============================================================
// 20 · DIETA SEMANAL · plan + lista de mercado
// ============================================================

const Dieta = {
  KEY: 'alan_mando_dieta_semanal',

  /**
   * Plan de la semana actual.
   * { semana_inicio: timestamp, dias: [{dia, desayuno, comida, cena, snacks}], ingredientes_mercado: [] }
   */
  semanaActual() {
    const stored = Store.get(this.KEY, null);
    if (!stored) return null;

    // Si la semana guardada ya terminó, regresa null para que se regenere
    const inicioActual = this.inicioSemana();
    if (stored.semana_inicio !== inicioActual) return null;
    return stored;
  },

  inicioSemana() {
    const hoy = new Date();
    const dia = hoy.getDay(); // 0 = domingo
    const diff = dia === 0 ? -6 : 1 - dia; // lunes = inicio
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff);
    lunes.setHours(0, 0, 0, 0);
    return lunes.getTime();
  },

  guardar(plan) {
    plan.semana_inicio = this.inicioSemana();
    plan.created_at = Date.now();
    Store.set(this.KEY, plan);
    return plan;
  },

  /**
   * Genera plan default basado en alimentos seguros para Alan.
   */
  generarDefault() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const desayunos = ['Avena con plátano + miel', 'Huevos revueltos con espinaca', 'Yogurt griego con arándanos', 'Smoothie verde con jengibre', 'Pan integral con aguacate y huevo', 'Hot cakes integrales con fruta', 'Chilaquiles verdes (sin chile picante)'];
    const comidas = ['Salmón al horno + arroz integral + brócoli', 'Pollo asado + camote + ensalada', 'Pasta con pesto + pollo + tomate', 'Tacos de pescado (sin salsa picante)', 'Bowl poke de atún + edamame', 'Caldo de pollo con verduras + arroz', 'Filete de res + papas asadas + ensalada'];
    const cenas = ['Sopa de lentejas + verduras', 'Tostadas de aguacate con huevo', 'Ensalada quinoa con manzana y nuez', 'Wrap de pollo con vegetales', 'Crema de calabaza + queso panela', 'Sándwich integral pavo y queso', 'Pescado a la plancha + verduras'];

    const plan = {
      dias: dias.map((dia, i) => ({
        dia,
        desayuno: desayunos[i],
        comida: comidas[i],
        cena: cenas[i]
      })),
      ingredientes_mercado: [
        // Proteínas
        'Salmón fresco (300g)', 'Filete de pollo (500g)', 'Atún fresco (200g)', 'Huevos (12)', 'Pavo rebanado (250g)', 'Filete de res (300g)',
        // Verduras
        'Espinaca baby', 'Brócoli (1 pieza)', 'Calabaza (2)', 'Aguacate (5)', 'Tomate cherry', 'Lechugas mixtas', 'Repollo morado',
        // Carbos complejos
        'Arroz integral', 'Pasta integral', 'Avena', 'Pan integral', 'Camote (3)', 'Quinoa (250g)', 'Papas',
        // Grasas buenas
        'Almendras', 'Nueces', 'Aceite de oliva', 'Tahini', 'Edamame congelado',
        // Lácteos
        'Yogurt griego natural (1L)', 'Queso panela (200g)',
        // Frutas
        'Plátano (6)', 'Manzana (5)', 'Arándanos', 'Limones (8)',
        // Otros
        'Lentejas (500g)', 'Pesto', 'Salsa de soya', 'Miel', 'Canela', 'Jengibre fresco', 'Cilantro'
      ]
    };

    return this.guardar(plan);
  },

  /**
   * Toggle ingrediente comprado.
   */
  toggleIngrediente(ingrediente) {
    const plan = this.semanaActual();
    if (!plan) return;
    plan.comprados = plan.comprados || {};
    plan.comprados[ingrediente] = !plan.comprados[ingrediente];
    Store.set(this.KEY, plan);
    return plan;
  }
};

// ============================================================
// 21 · OCIO TRACKING · marihuana + shopping con presupuestos
// ============================================================

const OcioTrack = {
  MOTA_KEY: 'alan_mando_compras_mota',
  SHOPPING_KEY: 'alan_mando_compras_shopping',
  GAMING_KEY: 'alan_mando_gaming_sesiones',

  // ================== MARIHUANA ==================
  comprasMota() { return Store.get(this.MOTA_KEY, []); },

  registrarMota(c) {
    const all = this.comprasMota();
    c.id = 'mota_' + Date.now();
    c.fecha = c.fecha || Date.now();
    c.created_at = Date.now();
    all.unshift(c);
    Store.set(this.MOTA_KEY, all);

    // Cascada: registra en movimientos generales
    const movs = Store.get('alan_mando_movimientos', []);
    movs.push({
      id: 'mov_' + Date.now(),
      ts: c.fecha,
      tipo: 'gasto',
      monto: c.costo,
      concepto: `marihuana · ${c.cantidad || ''} ${c.unidad || 'g'} · ${c.tienda || 'sin tienda'}`,
      categoria: 'ocio_marihuana',
      tags: ['marihuana']
    });
    Store.set('alan_mando_movimientos', movs);

    // Verificar presupuesto
    const alerta = Presupuesto.checkLimite('mota_semanal', this.gastoMotaSemana());
    return { compra: c, alerta };
  },

  gastoMotaSemana() {
    const inicio = Date.now() - 7 * 86400000;
    return this.comprasMota().filter(c => c.fecha >= inicio).reduce((s, c) => s + c.costo, 0);
  },

  gastoMotaMes() {
    const inicio = Date.now() - 30 * 86400000;
    return this.comprasMota().filter(c => c.fecha >= inicio).reduce((s, c) => s + c.costo, 0);
  },

  // ================== SHOPPING ==================
  shopping() { return Store.get(this.SHOPPING_KEY, []); },

  registrarShopping(viaje) {
    const all = this.shopping();
    viaje.id = 'shop_' + Date.now();
    viaje.fecha = viaje.fecha || Date.now();
    viaje.created_at = Date.now();
    viaje.items = viaje.items || [];
    all.unshift(viaje);
    Store.set(this.SHOPPING_KEY, all);

    // Cascada a movimientos
    const movs = Store.get('alan_mando_movimientos', []);
    movs.push({
      id: 'mov_' + Date.now(),
      ts: viaje.fecha,
      tipo: 'gasto',
      monto: viaje.total,
      concepto: `shopping · ${viaje.tienda || viaje.lugar} · ${viaje.items.length} items`,
      categoria: 'ocio_shopping'
    });
    Store.set('alan_mando_movimientos', movs);

    const alerta = Presupuesto.checkLimite('shopping_mensual', this.gastoShoppingMes());
    return { viaje, alerta };
  },

  gastoShoppingMes() {
    const inicio = Date.now() - 30 * 86400000;
    return this.shopping().filter(c => c.fecha >= inicio).reduce((s, c) => s + (c.total || 0), 0);
  },

  // ================== GAMING (PS5) ==================
  sesionesGaming() { return Store.get(this.GAMING_KEY, []); },

  registrarGaming(s) {
    const all = this.sesionesGaming();
    s.id = 'gam_' + Date.now();
    s.fecha = s.fecha || Date.now();
    all.unshift(s);
    Store.set(this.GAMING_KEY, all);
    return s;
  },

  minutosGamingSemana() {
    const inicio = Date.now() - 7 * 86400000;
    return this.sesionesGaming().filter(s => s.fecha >= inicio).reduce((s, x) => s + (x.minutos || 0), 0);
  }
};

// ============================================================
// 22 · PRESUPUESTOS · límites + alertas
// ============================================================

const Presupuesto = {
  KEY: 'alan_mando_presupuestos',

  /**
   * Estructura: { mota_semanal: 1500, shopping_mensual: 5000, gasto_total_mensual: 30000, ingreso_minimo_mes: 25000 }
   */
  DEFAULTS: {
    mota_semanal: 1500,
    shopping_mensual: 5000,
    gasto_total_mensual: 30000,
    ingreso_minimo_mes: 25000,
    gaming_minutos_semana: 600 // 10 horas
  },

  get() {
    const stored = Store.get(this.KEY, {});
    return { ...this.DEFAULTS, ...stored };
  },

  set(updates) {
    const current = this.get();
    Store.set(this.KEY, { ...current, ...updates, updated_at: Date.now() });
    return this.get();
  },

  checkLimite(tipo, gastoActual) {
    const presup = this.get();
    const limite = presup[tipo];
    if (!limite) return null;

    const pct = (gastoActual / limite) * 100;
    if (pct >= 100) {
      return {
        nivel: 'rebasado',
        pct: Math.round(pct),
        mensaje: `Te pasaste $${(gastoActual - limite).toFixed(0)} del presupuesto ${tipo.replace('_', ' ')}`,
        gasto: gastoActual,
        limite
      };
    } else if (pct >= 80) {
      return {
        nivel: 'cerca',
        pct: Math.round(pct),
        mensaje: `Vas en ${Math.round(pct)}% del presupuesto ${tipo.replace('_', ' ')}`,
        gasto: gastoActual,
        limite
      };
    }
    return { nivel: 'ok', pct: Math.round(pct), gasto: gastoActual, limite };
  },

  /**
   * Resumen de TODOS los presupuestos con su estado actual.
   */
  resumen() {
    return {
      mota_semanal: this.checkLimite('mota_semanal', OcioTrack.gastoMotaSemana()),
      shopping_mensual: this.checkLimite('shopping_mensual', OcioTrack.gastoShoppingMes()),
      gaming_minutos_semana: this.checkLimite('gaming_minutos_semana', OcioTrack.minutosGamingSemana())
    };
  }
};

// ============================================================
// 23 · ALERTAS · sistema unificado
// ============================================================

const Alertas = {
  KEY: 'alan_mando_alertas',

  list() { return Store.get(this.KEY, []); },

  /**
   * Registra una alerta. Si es la primera vez en N horas, también notifica.
   */
  emit(alerta) {
    // Filtrar según preferencias del usuario
    if (typeof NotifPrefs !== 'undefined' && alerta.tipo) {
      if (!NotifPrefs.isEnabled(alerta.tipo)) {
        // Usuario no quiere este tipo · NO emitir
        return null;
      }
    }
    const all = this.list();
    alerta.id = 'alert_' + Date.now();
    alerta.ts = Date.now();
    alerta.leida = false;
    all.unshift(alerta);
    if (all.length > 100) all.length = 100; // máx 100
    Store.set(this.KEY, all);
    return alerta;
  },

  marcarLeida(id) {
    const all = this.list();
    const a = all.find(x => x.id === id);
    if (a) { a.leida = true; Store.set(this.KEY, all); }
  },

  noLeidas() { return this.list().filter(a => !a.leida); },

  /**
   * Análisis automático: revisa todos los presupuestos y emite alertas.
   * Llamar cada vez que se hace un movimiento.
   */
  evaluarPresupuestos() {
    const resumen = Presupuesto.resumen();
    const emitidas = [];
    Object.entries(resumen).forEach(([tipo, estado]) => {
      if (estado && estado.nivel === 'rebasado') {
        emitidas.push(this.emit({
          tipo: 'presupuesto_rebasado',
          subject: 'Presupuesto rebasado',
          body: estado.mensaje,
          presupuesto: tipo,
          gasto: estado.gasto,
          limite: estado.limite,
          prioridad: 'alta'
        }));
      } else if (estado && estado.nivel === 'cerca') {
        emitidas.push(this.emit({
          tipo: 'presupuesto_cerca',
          subject: 'Cerca del límite',
          body: estado.mensaje,
          presupuesto: tipo,
          gasto: estado.gasto,
          limite: estado.limite,
          prioridad: 'media'
        }));
      }
    });
    return emitidas;
  }
};

// ============================================================
// 23.5 · NOTIFPREFS · qué push enviar a Alan
// ============================================================

const NotifPrefs = {
  KEY: 'alan_mando_notif_prefs',

  CATALOG: [
    // Finanzas
    { id: 'cobro_vencido', label: 'Cobros vencidos', desc: 'Cliente debe pagar y se pasó la fecha', categoria: 'finanzas', default: true },
    { id: 'cobro_recurrente_proximo', label: 'Cobros próximos a vencer', desc: '3 días antes del cobro mensual de cada cliente', categoria: 'finanzas', default: true },
    { id: 'pago_recurrente_proximo', label: 'Pagos por hacer', desc: '3 días antes de cargo recurrente', categoria: 'finanzas', default: true },
    { id: 'gasto_dia_alto', label: 'Gasto del día alto', desc: 'Cuando llevas 80% del diario promedio', categoria: 'finanzas', default: true },
    { id: 'gasto_dia_rebasado', label: 'Día caro · te pasaste', desc: 'Más de 120% del diario promedio', categoria: 'finanzas', default: true },
    { id: 'gasto_individual_alto', label: 'Gasto individual fuerte', desc: 'Un solo movimiento >50% del diario', categoria: 'finanzas', default: true },
    { id: 'presupuesto_rebasado', label: 'Presupuestos rebasados', desc: 'Mota, shopping, etc por encima del límite', categoria: 'finanzas', default: true },
    { id: 'presupuesto_cerca', label: 'Cerca del límite', desc: '80% del presupuesto consumido', categoria: 'finanzas', default: false },

    // Música
    { id: 'tocada', label: 'Tocadas próximas sin set list', desc: 'Tocada en 7 días sin repertorio armado', categoria: 'musica', default: true },
    { id: 'ensayo_recordatorio', label: 'Recordatorio de ensayos', desc: '30 min antes de cada ensayo', categoria: 'musica', default: true },

    // SAT
    { id: 'fiscal', label: 'Vencimientos fiscales SAT', desc: '7 días antes de cada obligación', categoria: 'sat', default: true },

    // Tareas
    { id: 'pendiente_alta', label: 'Pendientes alta prioridad', desc: 'Recordatorio diario de tareas urgentes', categoria: 'tareas', default: true },
    { id: 'pendiente_vencido', label: 'Pendientes vencidos', desc: 'Cuando un pendiente pasó su fecha', categoria: 'tareas', default: true },

    // Salud
    { id: 'ejercicio_recordatorio', label: 'Recordatorio de ejercicio', desc: '30 min antes de sesión agendada', categoria: 'salud', default: true },
    { id: 'salud_alerta', label: 'Alertas de salud', desc: 'Análisis fuera de rango, suplementos', categoria: 'salud', default: false },

    // IA proactiva
    { id: 'sugerencia_recurrente', label: 'IA detectó pago repetido', desc: '"¿Lo agendamos como recurrente?"', categoria: 'ia', default: false },
    { id: 'patron_detectado', label: 'IA detectó patrón', desc: 'Insights del sistema', categoria: 'ia', default: false }
  ],

  get() {
    const stored = Store.get(this.KEY, null);
    if (stored && typeof stored === 'object') {
      const merged = {};
      this.CATALOG.forEach(item => {
        merged[item.id] = stored[item.id] !== undefined ? stored[item.id] : item.default;
      });
      return merged;
    }
    const defs = {};
    this.CATALOG.forEach(item => { defs[item.id] = item.default; });
    return defs;
  },

  set(prefs) { Store.set(this.KEY, prefs); },

  toggle(id) {
    const p = this.get();
    p[id] = !p[id];
    this.set(p);
    return p[id];
  },

  isEnabled(tipo) {
    const p = this.get();
    return p[tipo] !== false;
  }
};

// ============================================================
// 24 · RECORDATORIOS · sistema agendado
// ============================================================

const Recordatorios = {
  KEY: 'alan_mando_recordatorios',

  TIPOS: {
    tarea: { label: 'Tarea', icon: '◇' },
    musical: { label: 'Musical · ensayo', icon: '♪' },
    tocada: { label: 'Tocada', icon: '★' },
    fiscal: { label: 'Fiscal · SAT', icon: '$' },
    cobro: { label: 'Cobro', icon: '◆' },
    salud: { label: 'Salud · ejercicio', icon: '◉' },
    personal: { label: 'Personal', icon: '·' }
  },

  list() { return Store.get(this.KEY, []); },

  agendar(r) {
    const all = this.list();
    r.id = 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    r.created_at = Date.now();
    r.disparado = false;
    all.push(r);
    Store.set(this.KEY, all);
    return r;
  },

  remove(id) {
    Store.set(this.KEY, this.list().filter(r => r.id !== id));
  },

  marcarDisparado(id) {
    const all = this.list();
    const r = all.find(x => x.id === id);
    if (r) { r.disparado = true; Store.set(this.KEY, all); }
  },

  /**
   * Próximos N recordatorios.
   */
  proximos(limit = 5) {
    const ahora = Date.now();
    return this.list()
      .filter(r => r.fecha >= ahora && !r.disparado)
      .sort((a, b) => a.fecha - b.fecha)
      .slice(0, limit);
  },

  /**
   * Recordatorios que deberían dispararse YA (vencidos en últimos 5 min).
   */
  vencidos() {
    const ahora = Date.now();
    const margen = 5 * 60000;
    return this.list().filter(r => !r.disparado && r.fecha <= ahora && r.fecha > ahora - margen);
  }
};

// ============================================================
// 25 · PROACTIV-IA · monitor que dispara alertas sin pedirlo
// ============================================================

const ProactivIA = {
  /**
   * Estado interno · guarda última ejecución para no repetir alertas.
   */
  STATE_KEY: 'alan_mando_proactiv_state',

  state() { return Store.get(this.STATE_KEY, { ultima_revision: 0, alertas_emitidas: {} }); },
  saveState(s) { Store.set(this.STATE_KEY, s); },

  /**
   * Ejecuta TODOS los chequeos · llamar al cargar cualquier página.
   * Throttle: solo corre 1 vez cada 30 min para no saturar.
   */
  async ejecutar(forzar = false) {
    const s = this.state();
    const ahora = Date.now();
    const minutosDesdeUltima = (ahora - s.ultima_revision) / 60000;

    if (!forzar && minutosDesdeUltima < 30) {
      return { skipped: true, proxima_en_min: Math.round(30 - minutosDesdeUltima) };
    }

    const alertasNuevas = [];

    // 1. Presupuestos rebasados o cerca
    if (typeof Presupuesto !== 'undefined') {
      const resumen = Presupuesto.resumen();
      Object.entries(resumen).forEach(([tipo, estado]) => {
        if (!estado || !estado.limite) return;
        const alertKey = `presup_${tipo}_${estado.nivel}_${this.diaActualKey()}`;
        if (s.alertas_emitidas[alertKey]) return; // ya emitida hoy

        if (estado.nivel === 'rebasado') {
          alertasNuevas.push({
            tipo: 'presupuesto_rebasado',
            subject: `Te pasaste · ${tipo.replace(/_/g, ' ')}`,
            body: estado.mensaje,
            prioridad: 'alta',
            amount: estado.gasto - estado.limite,
            categoria: tipo
          });
          s.alertas_emitidas[alertKey] = ahora;
        } else if (estado.nivel === 'cerca') {
          alertasNuevas.push({
            tipo: 'presupuesto_cerca',
            subject: `${estado.pct}% de presupuesto · ${tipo.replace(/_/g, ' ')}`,
            body: estado.mensaje,
            prioridad: 'media',
            categoria: tipo
          });
          s.alertas_emitidas[alertKey] = ahora;
        }
      });
    }

    // 2. Cobros vencidos o por vencer (clientes)
    const clientes = Store.get(Store.KEYS.CLIENTES, []);
    const vencidos = clientes.filter(c => c.status === 'vencido');
    if (vencidos.length) {
      const alertKey = `cobros_venc_${vencidos.length}_${this.diaActualKey()}`;
      if (!s.alertas_emitidas[alertKey]) {
        const totalVencido = vencidos.reduce((sum, c) => sum + (c.monto_pendiente || c.monto_mensual || 0), 0);
        alertasNuevas.push({
          tipo: 'cobro_vencido',
          subject: `${vencidos.length} cobro${vencidos.length > 1 ? 's' : ''} vencido${vencidos.length > 1 ? 's' : ''}`,
          body: `${vencidos.map(c => c.nombre).join(', ')} · total $${totalVencido.toLocaleString()}`,
          prioridad: 'alta',
          amount: totalVencido,
          link: 'https://cobros.g2c.com.mx'
        });
        s.alertas_emitidas[alertKey] = ahora;
      }
    }

    // 3. Recurrentes próximos a vencer (3 días)
    if (typeof Recurrentes !== 'undefined') {
      const cobrosProx = Recurrentes.cobrosProximos(3);
      if (cobrosProx.length) {
        const alertKey = `recur_cob_${this.diaActualKey()}`;
        if (!s.alertas_emitidas[alertKey]) {
          alertasNuevas.push({
            tipo: 'cobro_recurrente_proximo',
            subject: `${cobrosProx.length} cobro${cobrosProx.length > 1 ? 's' : ''} recurrente${cobrosProx.length > 1 ? 's' : ''} esta semana`,
            body: cobrosProx.map(c => `${c.cliente_nombre} ($${c.monto.toLocaleString()})`).join(' · '),
            prioridad: 'media'
          });
          s.alertas_emitidas[alertKey] = ahora;
        }
      }

      const pagosProx = Recurrentes.pagosProximos(3);
      if (pagosProx.length) {
        const alertKey = `recur_pag_${this.diaActualKey()}`;
        if (!s.alertas_emitidas[alertKey]) {
          alertasNuevas.push({
            tipo: 'pago_recurrente_proximo',
            subject: `${pagosProx.length} pago${pagosProx.length > 1 ? 's' : ''} recurrente${pagosProx.length > 1 ? 's' : ''} esta semana`,
            body: pagosProx.map(p => `${p.proveedor} ($${p.monto.toLocaleString()})`).join(' · '),
            prioridad: 'media'
          });
          s.alertas_emitidas[alertKey] = ahora;
        }
      }
    }

    // 4. SAT vence en 7 días
    if (typeof SAT !== 'undefined') {
      const cal = Store.get('alan_mando_sat_calendar', []);
      const proxFiscal = cal.filter(e => e.fecha > ahora && e.fecha <= ahora + 7 * 86400000)[0];
      if (proxFiscal) {
        const alertKey = `sat_${proxFiscal.id}_${this.diaActualKey()}`;
        if (!s.alertas_emitidas[alertKey]) {
          const dias = Math.ceil((proxFiscal.fecha - ahora) / 86400000);
          alertasNuevas.push({
            tipo: 'fiscal',
            subject: `SAT · ${proxFiscal.titulo} en ${dias}d`,
            body: proxFiscal.descripcion,
            prioridad: dias <= 3 ? 'alta' : 'media'
          });
          s.alertas_emitidas[alertKey] = ahora;
        }
      }
    }

    // 5. Patrón de pagos · sugerir hacerlos recurrentes
    if (typeof Recurrentes !== 'undefined') {
      const sugerencias = Recurrentes.detectarPatron();
      if (sugerencias.length) {
        const alertKey = `patron_recur_${this.diaActualKey()}`;
        if (!s.alertas_emitidas[alertKey]) {
          alertasNuevas.push({
            tipo: 'sugerencia_recurrente',
            subject: `${sugerencias.length} pago${sugerencias.length > 1 ? 's' : ''} parece${sugerencias.length === 1 ? '' : 'n'} recurrente${sugerencias.length > 1 ? 's' : ''}`,
            body: `${sugerencias.map(s => s.proveedor).join(', ')} · ¿quieres convertirlos en pagos automáticos?`,
            prioridad: 'baja',
            sugerencias
          });
          s.alertas_emitidas[alertKey] = ahora;
        }
      }
    }

    // 6. Tocada en próximos 7 días sin set list listo
    const eventos = Store.get(Store.KEYS.EVENTOS_MUSICA, []);
    const proxTocada = eventos.find(e => e.tipo === 'tocada' && e.ts > ahora && e.ts <= ahora + 7 * 86400000);
    if (proxTocada && (!proxTocada.set_list || proxTocada.set_list.length === 0)) {
      const alertKey = `tocada_setlist_${proxTocada.id || proxTocada.ts}`;
      if (!s.alertas_emitidas[alertKey]) {
        alertasNuevas.push({
          tipo: 'tocada',
          subject: `Tocada en ${Util.daysUntil(proxTocada.ts)}d sin set list`,
          body: `${proxTocada.lugar || 'sin lugar'} · falta armar repertorio`,
          prioridad: 'alta'
        });
        s.alertas_emitidas[alertKey] = ahora;
      }
    }

    // 7. Limpiar alertas viejas (>7 días)
    const sieteSemanasAtras = ahora - 7 * 86400000;
    Object.keys(s.alertas_emitidas).forEach(k => {
      if (s.alertas_emitidas[k] < sieteSemanasAtras) delete s.alertas_emitidas[k];
    });

    s.ultima_revision = ahora;
    this.saveState(s);

    // Emitir todas las alertas nuevas al sistema
    if (typeof Alertas !== 'undefined') {
      alertasNuevas.forEach(a => Alertas.emit(a));
    }

    return { alertas_nuevas: alertasNuevas, total: alertasNuevas.length };
  },

  diaActualKey() {
    return new Date().toISOString().slice(0, 10);
  },

  /**
   * Genera sugerencias accionables tipo card para mostrar en el home.
   * Cada sugerencia tiene: titulo, descripcion, accion (texto del botón), prompt (lo que se manda al chat al tocar).
   */
  sugerenciasParaHome() {
    const sugerencias = [];
    const ahora = Date.now();
    const en7d = ahora + 7 * 86400000;

    // 1. Cobros vencidos
    const cxc = (Store.get('alan_mando_cuentas_cobrar', []) || []).filter(c => !c.cobrado);
    const cobrosVencidos = cxc.filter(c => c.fecha_esperada && c.fecha_esperada < ahora);
    if (cobrosVencidos.length) {
      const monto = cobrosVencidos.reduce((s, c) => s + (c.monto || 0), 0);
      sugerencias.push({
        tipo: 'cobro_urgente',
        color: '#C56A6A',
        eyebrow: 'COBRO VENCIDO',
        titulo: `${cobrosVencidos.length} cobro${cobrosVencidos.length > 1 ? 's' : ''} pendiente${cobrosVencidos.length > 1 ? 's' : ''} · $${Math.round(monto).toLocaleString()}`,
        descripcion: `${cobrosVencidos[0].cliente_nombre || 'Cliente'} ${cobrosVencidos.length > 1 ? `+ ${cobrosVencidos.length - 1} más` : ''} llevan días vencidos. Acción inmediata.`,
        accion: 'Generar recordatorio WhatsApp',
        prompt: `Genera recordatorio para los ${cobrosVencidos.length} cobros vencidos`
      });
    }

    // 2. Cobros próximos (recurrentes)
    const cobrosRec = (Store.get('alan_mando_cobros_recurrentes', []) || []).filter(c => c.activo);
    const proximos = cobrosRec.filter(c => c.proximo_cobro && c.proximo_cobro >= ahora && c.proximo_cobro <= en7d);
    if (proximos.length && cobrosVencidos.length === 0) {
      const monto = proximos.reduce((s, c) => s + (c.monto || 0), 0);
      sugerencias.push({
        tipo: 'cobro_proximo',
        color: '#7AC68A',
        eyebrow: 'COBROS ESTA SEMANA',
        titulo: `$${Math.round(monto).toLocaleString()} entrarán en ${proximos.length} cobro${proximos.length > 1 ? 's' : ''}`,
        descripcion: `Liga de cobro lista para enviar · automatiza recordatorios 3 días antes`,
        accion: 'Ver cobros recurrentes',
        prompt: 'Muéstrame los cobros recurrentes próximos'
      });
    }

    // 3. Pagos próximos
    const cxp = (Store.get('alan_mando_cuentas_pagar', []) || []).filter(p => !p.pagado);
    const pagosProx = cxp.filter(p => p.fecha && p.fecha <= en7d);
    if (pagosProx.length) {
      const monto = pagosProx.reduce((s, p) => s + (p.monto || 0), 0);
      sugerencias.push({
        tipo: 'pago_proximo',
        color: '#D4A574',
        eyebrow: 'PAGOS A TU CARGO',
        titulo: `$${Math.round(monto).toLocaleString()} salen en ${pagosProx.length} pago${pagosProx.length > 1 ? 's' : ''}`,
        descripcion: `Verifica que tengas saldo · prioridad por fecha`,
        accion: 'Ver pagos próximos',
        prompt: 'Muéstrame los pagos próximos'
      });
    }

    // 4. Pendientes urgentes vencidos
    const pendientes = (Store.get(Store.KEYS.PENDIENTES, []) || []).filter(p => !p.done);
    const vencidos = pendientes.filter(p => p.fecha_limite && p.fecha_limite < ahora);
    const altas = pendientes.filter(p => p.prioridad === 'alta');
    if (vencidos.length) {
      sugerencias.push({
        tipo: 'pendiente_vencido',
        color: '#FF7A00',
        eyebrow: 'PENDIENTE VENCIDO',
        titulo: `${vencidos.length} pendiente${vencidos.length > 1 ? 's' : ''} sin cerrar`,
        descripcion: `Tu cabeza carga peso. Cierra el más viejo aunque sea pequeño · alivio inmediato.`,
        accion: 'Ver pendientes vencidos',
        prompt: 'Muéstrame mis pendientes vencidos'
      });
    } else if (altas.length >= 3) {
      sugerencias.push({
        tipo: 'pendiente_alta',
        color: '#7AC8DC',
        eyebrow: 'PRIORIDAD ALTA',
        titulo: `${altas.length} pendientes urgentes esperando`,
        descripcion: `Bloquea 90 min de foco profundo · cierra los 3 más viejos`,
        accion: 'Ver pendientes alta',
        prompt: 'Muéstrame los pendientes de alta prioridad'
      });
    }

    // 5. Tocada próxima sin setlist
    const ev = (Store.get(Store.KEYS.EVENTOS_MUSICA, []) || []).filter(e => e.tipo === 'tocada' && e.ts > ahora && e.ts <= ahora + 14 * 86400000);
    const sinSetlist = ev.filter(t => !t.set_list || t.set_list.length === 0);
    if (sinSetlist.length) {
      sugerencias.push({
        tipo: 'setlist',
        color: '#7AC8DC',
        eyebrow: 'TOCADA SIN SETLIST',
        titulo: `${sinSetlist[0].titulo || sinSetlist[0].lugar || 'Tocada'} en ${Math.ceil((sinSetlist[0].ts - ahora) / 86400000)} días`,
        descripcion: `Sin setlist armado · arma uno con tu repertorio`,
        accion: 'Ir a música',
        prompt: 'Ayúdame a armar el setlist'
      });
    }

    // 6. Mente · sin check-in hoy
    const menteState = Store.get('alan_mando_mente_state', { estados_diarios: [] });
    const hoyKey = new Date().toISOString().slice(0, 10);
    const yaCheckIn = menteState.estados_diarios.find(e => e.fecha === hoyKey);
    if (!yaCheckIn) {
      sugerencias.push({
        tipo: 'mente_checkin',
        color: '#7AC68A',
        eyebrow: 'PULSO INTERNO',
        titulo: 'Sin check-in hoy',
        descripcion: `5 segundos · Mente aprende cómo amaneces y cruza con tu carga operativa`,
        accion: 'Hacer check-in',
        prompt: 'Quiero hacer mi check-in de Mente'
      });
    }

    // 7. Pago cliente nuevo · si no hay clientes activos
    const clientes = Store.get(Store.KEYS.CLIENTES, []) || [];
    if (clientes.length === 0) {
      sugerencias.push({
        tipo: 'sin_clientes',
        color: '#FF4F00',
        eyebrow: 'PROSPECTAR',
        titulo: 'Sin clientes activos',
        descripcion: `Define 3 prospects esta semana · usa el portafolio G2C`,
        accion: 'Crear cliente',
        prompt: 'Quiero crear un cliente nuevo'
      });
    }

    // Limitar a top 3 más urgentes
    return sugerencias.slice(0, 3);
  }
};

// ============================================================
// 26 · INICIALIZACIÓN
// ============================================================

window.G2C = G2C;
window.KB = KB;
window.Store = Store;
window.Util = Util;
window.IA = IA;
window.Cascada = Cascada;
window.Actions = Actions;
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
window.PerfilFisico = PerfilFisico;
window.Ejercicio = Ejercicio;
window.Dieta = Dieta;
window.OcioTrack = OcioTrack;
window.Presupuesto = Presupuesto;
window.Alertas = Alertas;
window.Recordatorios = Recordatorios;
window.NotifPrefs = NotifPrefs;
window.Expediente = Expediente;
window.Recurrentes = Recurrentes;
window.ProactivIA = ProactivIA;

console.log(`%cG2C Mando v${G2C.version}`, 'color:#FF4F00;font-weight:bold;font-size:14px;');
console.log('%cCreated by Alan Davis · powered by g2c.com.mx', 'color:rgba(244,243,239,0.5);font-size:11px;');
