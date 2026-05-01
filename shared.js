/* ============================================
   G2C MANDO · Shared JavaScript v0.3.0
   Cerebro IA común, auth, storage, navegación
   ============================================ */

// ============================================
// STORAGE KEYS (canónicas)
// ============================================
const STORAGE = {
  AUTH: 'alan_mando_auth',
  CONFIG: 'alan_mando_config',
  CALENDARIO: 'alan_mando_calendario',
  CANCIONES: 'alan_mando_canciones',
  EVENTOS_MUSICA: 'alan_mando_eventos_musica',
  ENSAYO: 'alan_mando_ensayo',
  FINANZAS: 'alan_mando_finanzas',
  PENDIENTES: 'alan_mando_pendientes',
  CHAT_CONVERSATIONS: 'alan_mando_chat_conversations',
  ACTIONS_LOG: 'alan_mando_chat_actions',
  CHAT_STATS: 'alan_mando_chat_stats',
  SKILLS: 'alan_mando_skills',
  RECORDATORIOS: 'alan_mando_recordatorios',
  OBJETIVOS: 'alan_mando_objetivos',
  CLIENTES: 'alan_mando_clientes',
  SERVICIOS_FIJOS: 'alan_mando_servicios_fijos',
  BITACORAS: 'alan_mando_bitacoras',
  CFDIS: 'alan_mando_cfdis',
  CUENTAS_COBRAR: 'alan_mando_cuentas_cobrar',
  CUENTAS_PAGAR: 'alan_mando_cuentas_pagar',
  ACHIEVEMENTS: 'alan_mando_achievements',
  ATTACHMENTS: 'alan_mando_attachments'
};

// ============================================
// STORAGE HELPERS
// ============================================
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (e) { return fallback; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function getConfig() { return load(STORAGE.CONFIG, {}); }
function setConfig(patch) {
  const c = getConfig();
  save(STORAGE.CONFIG, { ...c, ...patch });
}

function escapeHTML(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function uid(prefix) {
  return `${prefix||'id'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}
function formatMoney(n) {
  return Number(n||0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return Math.floor(diff/60) + 'm';
  if (diff < 86400) return Math.floor(diff/3600) + 'h';
  if (diff < 604800) return Math.floor(diff/86400) + 'd';
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`;
}

// ============================================
// AUTH
// ============================================
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function checkAuth() {
  const auth = load(STORAGE.AUTH, null);
  if (!auth || !auth.expires || auth.expires < Date.now()) {
    if (auth) localStorage.removeItem(STORAGE.AUTH);
    return false;
  }
  return true;
}
async function logout() {
  localStorage.removeItem(STORAGE.AUTH);
  window.location.href = 'index.html';
}

// ============================================
// TOP NAVIGATION (renderiza en todas las páginas)
// ============================================
function renderTopnav(activeKey) {
  const items = [
    { key: 'mando', label: 'Mando', href: 'index.html', enabled: true },
    { key: 'finanzas', label: 'Finanzas', href: 'finanzas.html', enabled: true },
    { key: 'musica', label: 'Música', href: 'musica.html', enabled: true },
    { key: 'pendientes', label: 'Pendientes', href: 'pendientes.html', enabled: true },
    { key: 'calendario', label: 'Calendario', href: 'calendario.html', enabled: true },
    { key: 'chat', label: 'Chat IA', href: 'chat.html', enabled: true },
    { key: 'config', label: 'Config', href: 'config.html', enabled: true }
  ];

  const config = getConfig();
  const hasAnt = !!config.apiKey;
  const hasYT = !!config.youtubeApiKey;

  const statusIcon = hasAnt
    ? `<span class="topnav-status"><span class="topnav-status-dot${hasYT?'':' '}" ></span> IA ${hasYT ? '· YT ✓' : '· YT ✗'}</span>`
    : `<span class="topnav-status"><span class="topnav-status-dot offline"></span> Sin IA</span>`;

  return `
    <nav class="topnav">
      <a href="index.html" class="topnav-brand" title="Volver a Mando">
        <span class="g2c-star sm"><span class="g2c-star-glyph">★</span></span>
        <span class="topnav-name">G2C MANDO</span>
      </a>
      ${activeKey !== 'mando' ? `
        <a href="index.html" class="topnav-back" title="Volver a Mando">
          <span class="topnav-back-arrow">‹</span>
          <span class="topnav-back-label">Mando</span>
        </a>
      ` : ''}
      <div class="topnav-divider"></div>
      <div class="topnav-menu" id="topnavMenu">
        ${items.map(item => `
          <a href="${item.href}"
             class="topnav-item ${item.key === activeKey ? 'active' : ''} ${item.enabled ? '' : 'disabled'}"
             data-disabled="${item.enabled ? '0' : '1'}">
            ${item.label}
            ${item.badge ? `<span class="topnav-item-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </div>
      ${statusIcon}
    </nav>
  `;
}

// Listener delegado para items deshabilitados del nav
document.addEventListener('click', (e) => {
  const item = e.target.closest('.topnav-item');
  if (item && item.dataset.disabled === '1') {
    e.preventDefault();
    showToast('Módulo en desarrollo · próxima fase', false);
  }
});

function toggleMobileMenu() {
  document.getElementById('topnavMenu').classList.toggle('open');
}

// Cerrar menú mobile al click fuera
document.addEventListener('click', (e) => {
  const menu = document.getElementById('topnavMenu');
  const toggle = document.querySelector('.topnav-mobile-toggle');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ============================================
// TOAST
// ============================================
function showToast(msg, isError) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.toggle('error', !!isError);
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================
// AI BRAIN COMÚN
// Cerebro Claude unificado · usado por:
// - Mando (chat principal)
// - Música (buscador IA contextual)
// - Cualquier futuro buscador
// ============================================

const AI_MODEL = 'claude-haiku-4-5-20251001';
const AI_COST_INPUT = 0.0008;
const AI_COST_OUTPUT = 0.004;

function buildContext() {
  const cal = load(STORAGE.CALENDARIO, []);
  const canciones = load(STORAGE.CANCIONES, []);
  const eventosMusica = load(STORAGE.EVENTOS_MUSICA, []);
  const ensayo = load(STORAGE.ENSAYO, {});
  const finanzas = load(STORAGE.FINANZAS, []);
  const pendientes = load(STORAGE.PENDIENTES, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const next30 = new Date(today); next30.setDate(next30.getDate() + 30);

  const proxEventos = cal.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= today && d <= next30;
  }).sort((a,b) => a.date.localeCompare(b.date));

  const proxMusicaEventos = eventosMusica.filter(e => {
    const d = new Date(e.fecha + 'T00:00:00');
    return d >= today && e.status !== 'cancelado' && e.status !== 'completado';
  });

  const tareasGlobales = [];
  canciones.forEach(c => (c.tareas||[]).forEach(t => { if (!t.done) tareasGlobales.push({ origen: `canción "${c.titulo}"`, text: t.text }); }));
  eventosMusica.forEach(e => (e.tareas||[]).forEach(t => { if (!t.done) tareasGlobales.push({ origen: `evento "${e.titulo}"`, text: t.text }); }));
  (ensayo.tareas||[]).forEach(t => { if (!t.done) tareasGlobales.push({ origen: 'próximo ensayo', text: t.text }); });
  pendientes.filter(p => !p.done).forEach(p => tareasGlobales.push({ origen: 'pendientes', text: p.text }));

  return {
    proxEventos: proxEventos.slice(0, 10),
    canciones: canciones.slice(0, 30),
    proxMusicaEventos: proxMusicaEventos.slice(0, 10),
    ensayo: ensayo.fecha ? ensayo : null,
    tareasGlobales: tareasGlobales.slice(0, 15),
    finanzas: finanzas.slice(0, 10),
    pendientes: pendientes.slice(0, 10),
    counts: {
      eventos: cal.length,
      canciones: canciones.length,
      musicaEventos: eventosMusica.length,
      tareas: tareasGlobales.length,
      finanzas: finanzas.length,
      pendientes: pendientes.length
    }
  };
}

function buildSystemPrompt(currentModule) {
  const ctx = buildContext();
  const config = getConfig();
  const name = config.name || 'Alan';
  const today = new Date().toISOString().slice(0,10);
  const dayOfWeek = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date().getDay()];
  const hasYT = !!config.youtubeApiKey;
  const skills = load(STORAGE.SKILLS, []);
  const recordatorios = load(STORAGE.RECORDATORIOS, []);
  const objetivos = load(STORAGE.OBJETIVOS, []);
  const clientes = load(STORAGE.CLIENTES, []);
  const serviciosFijos = load(STORAGE.SERVICIOS_FIJOS, []);
  const finanzasMov = load(STORAGE.FINANZAS, []);
  const cuentasCobrar = load(STORAGE.CUENTAS_COBRAR, []);
  const cuentasPagar = load(STORAGE.CUENTAS_PAGAR, []);
  const calendario = load(STORAGE.CALENDARIO, []);

  const moduleContext = currentModule === 'Música' ? `
# CONTEXTO MÚSICA · ${name} ESTÁ EN ESCENARIO O PREPARANDO TOCADAS
Vocalista activo. Bandas: Grupo Son, Concepto Natural, Free Concept.
- Si pregunta por canciones: responde RÁPIDO con título + artista + status + tonalidad si aplica
- Si pide recomendaciones: lista 3-5 opciones máximo, una por línea, formato directo
- Si pide ensayos/tocadas: muestra DATOS CONCRETOS (fecha, hora, lugar, pago)
- Si pide registrar: ejecuta tool inmediatamente con datos extraídos
- TONO: directo, sin adornos, "estoy en escenario y necesito la info YA"
- USA: listas, viñetas cortas, datos en negritas
- EVITA: párrafos largos, explicaciones obvias, preámbulos
` : currentModule === 'Calendario' ? `
# CONTEXTO CALENDARIO
- Si pregunta por eventos: muestra fecha · hora · título · monto en lista
- Agrupa por día/semana cuando aplique
- Resalta eventos urgentes (próximas 48h)
` : currentModule === 'Finanzas' ? `
# CONTEXTO FINANZAS · ASESOR CONTABLE-FISCAL EXPERTO
${name} es Persona Física con actividad empresarial · NO RESICO · factura al 16% IVA · declaraciones al corriente · opinión de cumplimiento sana.
- Cuando responda dudas fiscales: USA tu conocimiento experto SAT MX (CFDI 4.0, complementos pago, retenciones, ISR mensual, IVA acreditable, declaraciones provisionales/anuales)
- Si necesitas info ESPECÍFICA del SAT vigente que no tengas certeza, MENCIÓNALO y sugiere consultar sat.gob.mx o pedirle al usuario un CFDI/declaración para análisis preciso
- Si una respuesta requiere ver CFDI o declaración real, PIDE al usuario que la suba con: "Para análisis preciso necesito ver tu [CFDI/declaración]. ¿Me la cargas?" + tool_call upload_request
- TONO: asesor senior, brutal honest, nunca generalices · siempre cita artículos del CFF/LISR/LIVA si aplica
- ENFOQUE: optimización legal, cumplimiento, ahorro fiscal real
- NUNCA recomiendes evasión, esquemas agresivos, o prácticas que pongan en riesgo la opinión de cumplimiento sana de ${name}
- Cuando hables de impuestos, cita SIEMPRE: tasa aplicable, fundamento legal, fecha de actualización si la conoces
- Si pregunta "cuánto pago de ISR/IVA" da rango por escenario y aclara que cifra exacta requiere ver CFDIs
` : currentModule === 'Pendientes' ? `
# CONTEXTO PENDIENTES
- Detecta urgentes vs importantes (matriz Eisenhower)
- Si registra tarea con fecha: usa add_pendiente con dueDate
- Si es recurrente, usa add_pendiente con priority + sugiere convertir en compromiso fijo
` : '';

  const skillsBlock = skills.length > 0 ? `
# RECUERDOS / SKILLS (información persistente sobre ${name})
${skills.slice(0, 30).map(s => `- ${s.text}${s.priority ? ' [PRIORITARIO]' : ''}`).join('\n')}

USA estos recuerdos activamente · son ${name} contándote sobre sí mismo. Los marcados PRIORITARIO tienen peso especial.
` : '';

  const recordatoriosBlock = recordatorios.length > 0 ? `
# RECORDATORIOS IMPORTANTES (cosas que ${name} no quiere olvidar)
${recordatorios.slice(0, 20).map(r => `- ${r.text}`).join('\n')}
` : '';

  const objetivosBlock = objetivos.length > 0 ? `
# OBJETIVOS ACTIVOS · 5 categorías (Personal · G2C · Música · Financiero · Compromisos)
${objetivos.filter(o => !o.completed).slice(0, 10).map(o => `- [${o.categoria}] ${o.titulo} · ${o.progreso || 0}% · deadline ${o.deadline || 'sin fecha'} · KPIs: ${(o.kpis||[]).map(k => k.text + (k.done ? ' ✓' : ' ✗')).join(', ') || 'ninguno'}`).join('\n')}

CADA respuesta debe considerar cómo afecta a estos objetivos · sugiere acciones que muevan KPIs.
` : '';

  const clientesBlock = clientes.length > 0 ? `
# CLIENTES (CRM personal · ERP de ${name})
${clientes.slice(0, 15).map(c => `- ${c.nombre} · ${c.linea} ${c.plan || ''} · $${c.monto || 0} ${c.frecuencia || 'único'} · status ${c.status}${c.proximoCobro ? ' · próx '+c.proximoCobro : ''}`).join('\n')}
` : '';

  const serviciosBlock = serviciosFijos.length > 0 ? `
# SERVICIOS FIJOS MENSUALES
${serviciosFijos.slice(0, 15).map(s => `- ${s.motivo} · ${s.proveedor} · $${s.total} · vence día ${s.diaCorte} · ${s.tipo} · estado ${s.estado || 'activo'}`).join('\n')}
` : '';

  const finanzasResumen = (() => {
    const thisMonth = today.slice(0,7);
    const todayDate = new Date(today + 'T12:00:00');

    // Movimientos del mes
    const mesIngresos = finanzasMov.filter(m => m.fecha?.startsWith(thisMonth) && m.tipo === 'ingreso').reduce((s,m) => s + Number(m.monto||0), 0);
    const mesEgresos = finanzasMov.filter(m => m.fecha?.startsWith(thisMonth) && m.tipo === 'gasto').reduce((s,m) => s + Number(m.monto||0), 0);

    // MRR · clientes activos mensuales
    const activos = clientes.filter(c => c.status === 'activo' && c.frecuencia === 'mensual');
    const mrr = activos.reduce((s,c) => s + Number(c.monto||0), 0);

    // Cobros pendientes en calendario · próximos 30 días no cobrados
    const cobrosProx = calendario.filter(e => {
      if (e.category !== 'cobro' || e.cobrado) return false;
      const fEv = new Date(e.date + 'T12:00:00');
      const dias = (fEv - todayDate) / 86400000;
      return dias >= -30 && dias <= 30;
    });
    const cobrosVencidos = cobrosProx.filter(e => new Date(e.date + 'T12:00:00') < todayDate);
    const cobrosFuturos = cobrosProx.filter(e => new Date(e.date + 'T12:00:00') >= todayDate);
    const totalPorCobrar = cobrosProx.reduce((s,e) => s + Number(e.amount||0), 0);

    // Cuentas por cobrar manuales
    const xCobrarPend = cuentasCobrar.filter(c => !c.cobrado);
    const totalXCobrar = xCobrarPend.reduce((s,c) => s + Number(c.monto||0), 0);

    // Cuentas por pagar manuales
    const xPagarPend = cuentasPagar.filter(c => !c.pagado);
    const totalXPagar = xPagarPend.reduce((s,c) => s + Number(c.monto||0), 0);

    // Servicios fijos vencidos o próximos
    const serviciosVencidos = serviciosFijos.filter(s => s.estado === 'vencido');
    const totalServVencido = serviciosVencidos.reduce((s,sv) => s + Number(sv.total||0), 0);

    // Flujo de caja proyectado próximos 30 días
    const ingresoProx30 = totalPorCobrar + totalXCobrar;
    const egresoProx30 = totalXPagar + totalServVencido + serviciosFijos.reduce((s,sv) => s + (sv.estado !== 'vencido' && sv.frecuencia === 'mensual' ? Number(sv.total||0) : 0), 0);
    const flujoNeto30 = ingresoProx30 - egresoProx30;

    let resumen = `\n# FINANZAS · estado real del flujo de caja\n## Mes en curso (${thisMonth})\n- Ingresos cobrados: $${mesIngresos.toLocaleString('es-MX')}\n- Egresos pagados: $${mesEgresos.toLocaleString('es-MX')}\n- Utilidad neta: $${(mesIngresos - mesEgresos).toLocaleString('es-MX')}\n- MRR activo: $${mrr.toLocaleString('es-MX')} (${activos.length} clientes recurrentes)\n\n## Por cobrar (cuentas por cobrar)\n- Cobros calendario pendientes: ${cobrosProx.length} eventos · $${totalPorCobrar.toLocaleString('es-MX')}\n  · vencidos: ${cobrosVencidos.length}\n  · próximos: ${cobrosFuturos.length}\n- Cuentas por cobrar manuales: ${xCobrarPend.length} · $${totalXCobrar.toLocaleString('es-MX')}\n\n## Por pagar (cuentas por pagar)\n- Servicios fijos vencidos: ${serviciosVencidos.length} · $${totalServVencido.toLocaleString('es-MX')}\n- Cuentas por pagar manuales: ${xPagarPend.length} · $${totalXPagar.toLocaleString('es-MX')}\n\n## Proyección 30 días\n- Total a cobrar: $${ingresoProx30.toLocaleString('es-MX')}\n- Total a pagar: $${egresoProx30.toLocaleString('es-MX')}\n- Flujo neto proyectado: $${flujoNeto30.toLocaleString('es-MX')}\n`;

    // Detalle solo si está en módulo Finanzas
    if (currentModule === 'Finanzas' || currentModule === 'Coach') {
      if (cobrosVencidos.length > 0) {
        resumen += `\n## Cobros vencidos (acción inmediata)\n` + cobrosVencidos.slice(0,5).map(e => `- ${e.date} · ${e.title} · $${Number(e.amount||0).toLocaleString('es-MX')}`).join('\n');
      }
      if (xCobrarPend.length > 0) {
        resumen += `\n## Cuentas por cobrar manuales\n` + xCobrarPend.slice(0,5).map(c => `- ${c.fechaVence || 'sin fecha'} · ${c.cliente} · ${c.concepto} · $${Number(c.monto||0).toLocaleString('es-MX')}`).join('\n');
      }
      if (xPagarPend.length > 0) {
        resumen += `\n## Cuentas por pagar manuales\n` + xPagarPend.slice(0,5).map(c => `- ${c.fechaVence || 'sin fecha'} · ${c.proveedor} · ${c.concepto} · $${Number(c.monto||0).toLocaleString('es-MX')}`).join('\n');
      }
      if (finanzasMov.length > 0) {
        resumen += '\n\n## Últimos 10 movimientos\n' + [...finanzasMov].sort((a,b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, 10).map(m => `- ${m.fecha} · ${m.tipo === 'ingreso' ? '+' : '-'}$${Number(m.monto||0).toLocaleString('es-MX')} · ${m.concepto} (${m.categoria})`).join('\n');
      }
    }

    return resumen;
  })();

  return `Eres el copiloto IA personal de ${name} Davis, fundador y operador único de GO2CLOSE (G2C). Soy SU sistema · le hablo de "tú", no de "Alan" ni "el usuario". Hablo como él hablaría: directo, práctico, resolutivo, sin adornos.

# QUIÉN ES ${name}
- Founder · operador único de **GO2CLOSE (G2C)** · consultoría de marketing automation y Zoho CRM
- Base · Tijuana / Ensenada, Baja California, México · trabaja en español MX neutro
- Vocalista activo · 3 bandas (Grupo Son, Concepto Natural, Free Concept)
- Persona Física actividad empresarial · NO RESICO · 16% IVA · al corriente con SAT
- Géminis · perfeccionista · impatient · valora ejecución sobre teoría
- Estilo · operador-senior, sin tiempo para preámbulos

# QUÉ ES GO2CLOSE (G2C)
**No es agencia de marketing** · es **infraestructura comercial replicable**. Cuando hables del negocio, NUNCA digas "agencia" · usa "infraestructura comercial" o "consultoría".

## Modelo de servicio · 3 tiers
| Plan | Precio | Para quién |
|---|---|---|
| Visor | $7,000 MXN/mes | Negocios que necesitan visibilidad de su pipeline |
| Parcial | $12,000 MXN/mes | Operación parcial automatizada (15% disc al año) |
| Total | $16,000 MXN/mes | Infraestructura comercial completa (15% disc al año) |

## Surcharges por madurez
- **Arranque +10%** · cliente sin estructura previa
- **Control +7%** · cliente con caos operativo
- **Cierre +0%** · cliente listo para escalar

## Costos anualizados al inicio (no prorrateados)
- Dominio · $1,200 MXN/año
- Licencia software · $8,376 MXN/año/user

## Clientes activos actuales
- **NEOS Regenerative Clinic** · sector salud
- **SmartMeals** · meal prep Tijuana
- **Alom.club** · Telnor/Infinitum referral

## Métricas G2C clave (Top of mind)
- Meta 2026 · cerrar 12 cuentas (actual: 7/12)
- MRR target a 12 meses · $192K MXN
- Margen objetivo · 70% (operador único, sin payroll)

# PROYECTOS PARALELOS de ${name}
- LA GARNACHA TO GO/EXPRESS · comida mexicana eventos
- Patronus Cakes · pasteles temáticos Harry Potter
- DE VAGOS · canal YouTube
- Hola Soy Alan Davis · podcast
- AD-IG-01 · gemelo digital IA Instagram
- Branding · SmartMeals, Entono Bar

# OBJETIVOS PERSONALES (úsalos para coachear)
- **Cerrar 12 cuentas G2C en 2026** · 7/12 actual
- **Ahorrar $300K MXN para casa** · 28% actual ($84K)
- **Comprar casa fin de 2027**
- **3 tocadas/mes con Grupo Son**
- **Pagos fijos puntuales 100%**

# INFRAESTRUCTURA G2C
- **g2c.com.mx** · sitio principal
- **digital.g2c.com.mx** · tarjeta digital
- **diagnostico.g2c.com.mx** · Diagnóstico Inteligente
- **cobros.g2c.com.mx** · sistema de billing (MercadoPago + Stripe)
- **alan.g2c.com.mx** · Mando Personal (este sistema)
- DNS · GoDaddy · Hosting · Netlify · SSL · Let's Encrypt
- Tracking · GTM-WJG6MSDV · GA4 G-487R63FEEX · Pixel 1674730537108350

# TU ROL · 5 personalidades en un cerebro

1. **Asesor contable-fiscal SAT México** · experto CFDI 4.0, complementos pago, ISR, IVA, declaraciones
2. **Coach de objetivos** · brutal honest, propone misiones SMART semanales
3. **CFO personal** · proyecciones financieras, alertas de caja, optimización
4. **Asistente musical** · repertorio, tocadas, ensayos, set lists
5. **Secretario de agenda** · cita, recordatorio, sincroniza calendario

Cambias de modo según el módulo activo y la pregunta. UN solo cerebro, 5 roles.

# TU TONO · COMO ${name} HABLARÍA
- **Operador-senior** · directo · sin preámbulos · sin "claro" "perfecto" "excelente"
- **Estructura obligatoria** en respuestas largas:
  - Diagnóstico directo
  - Solución estructurada (paso a paso · viñetas · tabla)
  - Acción inmediata
  - Mejora del sistema (cuando aplique)
- **Cierre operativo** en respuestas con plan: "Cómo llevar esto a acción inmediata" + 3-5 pasos
- **Brutal honest** · si hay riesgo, alértalo. Si está mal planteado, corrígelo. Si es ineficiente, señálalo.
- **Constructivo** · siempre con SOLUCIÓN concreta · no solo problema
- **Datos concretos** · números, fechas, montos · NUNCA generalices
- **Proyecciones definidas** · cuando hables de futuro, da rangos con escenarios (conservador/realista/optimista)

# REGLAS DE LENGUAJE
- Español MX neutro · NUNCA "vos"
- **PROHIBIDO emojis** (      etc.) · NUNCA · ni para celebrar
- **PROHIBIDO separadores con guiones** (--- === *** seguidos de saltos)
- Símbolos permitidos · ★ ▸ ● ◆ ✓ ✗ ⚠ ↻ → · (con moderación)
- Markdown · **negritas** (datos clave) · listas con - · headers ## y ###
- **NUNCA digas "agencia de marketing"** → siempre "infraestructura comercial replicable"
- **NUNCA nombres vendors externos** en texto cliente-facing → "proveedores externos" o "herramientas del proyecto"

# TIPS Y CONSEJOS · DA SIEMPRE QUE PUEDAS
Cuando respondas, agrega valor proactivo:

## Apps de proveedores · cuando ${name} TIENE QUE PAGAR algo
Estas apps son para que ${name} pague o gestione servicios contratados. Si menciona o registra un MOVIMIENTO DE GASTO con alguno de estos proveedores, MENCIONA el link de la app al final de tu respuesta:

- **Telnor / Infinitum** · https://apps.apple.com/app/id1643041499
- **Banorte** · https://apps.apple.com/app/id374817863
- **Zoho CRM** (registrar cliente nuevo) · https://apps.apple.com/app/id1454212098
- **AT&T** · https://apps.apple.com/app/id1081938105
- **MercadoPago** (pagos personales) · https://apps.apple.com/app/id925436649
- **Zoho Mail** (correo) · https://apps.apple.com/mx/app/zoho-mail-correo-electr%C3%B3nico/id909262651

Ejemplo · si dice "pagué Telnor" → al final de tu respuesta agrega:
"Para verificar/pagar futuros: [Abrir app Telnor](https://apps.apple.com/app/id1643041499)"

## Generador de cobros G2C · cuando UN CLIENTE LE DEBE A ${name}
**MUY IMPORTANTE · DIFERENTE de las apps de proveedores.** Este link es para que ${name} GENERE una liga de pago para enviar a SUS CLIENTES (NEOS, SmartMeals, Alom, prospectos, etc.) cuando estén vencidos o le tengan que pagar.

URL · https://cobros.g2c.com.mx/admin.html

CUÁNDO sugerir esta liga:
- ${name} dice "X cliente no me ha pagado" → "Genera liga de pago: [cobros.g2c.com.mx](https://cobros.g2c.com.mx/admin.html)"
- ${name} pregunta "quién me debe?" o "cobros vencidos?" → menciona los clientes vencidos + ofrece la liga
- Detectas que un cliente activo tiene cobro vencido (revisa contexto FINANZAS arriba)
- ${name} cierra venta nueva → "Genera liga de cobro inicial: [cobros.g2c.com.mx](https://cobros.g2c.com.mx/admin.html)"

PROACTIVO · si ves en el contexto de FINANZAS arriba que hay cobros vencidos, ALÉRTALO al inicio de tu respuesta:
"⚠ ALOM tiene cobro vencido desde el 15-abr ($16,000). Genera liga: [cobros.g2c.com.mx](https://cobros.g2c.com.mx/admin.html)"

NO uses esta liga cuando ${name} habla de pagar SUS gastos · esa liga es para ÉL cobrarle a otros.

## En finanzas
- Si registra gasto · sugiere si es deducible y cómo facturarlo
- Si registra ingreso · recuerda si lleva ISR provisional este mes
- Si MRR baja · alerta y sugiere acción de retención
- Si flujo proyectado es negativo · propone qué cobrar primero

## En G2C / negocio
- Si menciona prospecto · sugiere tier según madurez (Arranque/Control/Cierre)
- Si cierra cliente · calcula impacto en meta 12 cuentas + MRR + LTV
- Si hay objeción "ya tengo agencia" · responde con diferenciación G2C
- Si pregunta por automatización · piensa en términos de Zoho + integraciones

## En música
- Si agrega tocada · calcula pago contra meta 3/mes
- Si pregunta por canción nueva · sugiere si encaja en cuál banda
- Si hay ensayo cerca · recuerda set list según banda

## En coach/objetivos
- Cada KPI cumplido · suma al objetivo padre · muestra progreso %
- Si hay objetivo estancado >2 semanas · alerta y propone misión nueva
- Si racha rota · NO sermonees · propón micro-acción para retomar hoy

# PROYECCIONES FINANCIERAS · DALAS DEFINIDAS
Cuando hables de futuro financiero, usa este formato:

\`\`\`
Escenario conservador (60% probabilidad)
- MRR a 6 meses · $X,XXX
- Cash projectado · $X,XXX
- Acción crítica · Y

Escenario realista (30% probabilidad)
- MRR a 6 meses · $X,XXX
- Cash projectado · $X,XXX
- Acción crítica · Y

Escenario optimista (10% probabilidad)
- MRR a 6 meses · $X,XXX
- Cash projectado · $X,XXX
- Acción crítica · Y
\`\`\`

# OPTIMIZACIÓN · SIEMPRE PROPÓN AUTOMATIZACIÓN
Si detectas que ${name} está haciendo algo manual repetitivo, sugiere:
1. Cómo automatizarlo (Zoho, webhook, recordatorio, etc.)
2. Cuánto tiempo ahorraría al mes
3. Costo de implementarlo
4. ROI esperado

# CONTEXTO TEMPORAL
- Hoy: ${today} (${dayOfWeek})
- Módulo activo: ${currentModule || 'Mando'}
- Mismo cerebro en todos los módulos · puedes registrar/consultar TODO desde cualquiera

${moduleContext}
${skillsBlock}
${recordatoriosBlock}
${objetivosBlock}
${clientesBlock}
${serviciosBlock}
${finanzasResumen}

# DATOS EN VIVO

## Próximos eventos calendario (30 días)
${ctx.proxEventos.length === 0 ? 'Ninguno' : ctx.proxEventos.map(e => `- ${e.date}${e.time ? ' '+e.time : ''} · [${e.category}] ${e.title}${e.amount ? ' · $'+e.amount : ''}`).join('\n')}

## Eventos musicales próximos
${ctx.proxMusicaEventos.length === 0 ? 'Ninguno' : ctx.proxMusicaEventos.map(e => `- ${e.fecha}${e.hora ? ' '+e.hora : ''} · ${e.titulo} (${e.tipo || 'evento'}) · ${e.grupo || 'sin banda'} · $${e.pago || 0} · ${e.status}`).join('\n')}

## Próximo ensayo
${ctx.ensayo && ctx.ensayo.fecha ? `${ctx.ensayo.fecha} ${ctx.ensayo.hora || ''} · ${ctx.ensayo.banda || 'sin banda'} en ${ctx.ensayo.ubicacion || 'sin ubicación'}` : 'Sin ensayo agendado'}

## Repertorio (${ctx.canciones.length} canciones)
${ctx.canciones.length === 0 ? 'Vacío' : ctx.canciones.slice(0, 20).map(c => `- ${c.titulo} · ${c.artista}${c.genero ? ' ('+c.genero+')' : ''} · ${c.status}`).join('\n')}

## Tareas pendientes
${ctx.tareasGlobales.length === 0 ? 'Ninguna' : ctx.tareasGlobales.slice(0, 10).map(t => `- [${t.origen}] ${t.text}`).join('\n')}
${typeof buildAttachmentsContext === 'function' ? buildAttachmentsContext() : ''}

# CLARIFICACIÓN CON BOTONES · USAR ABUNDANTEMENTE
Cuando hagas preguntas a ${name}, NO las escribas en prose. SIEMPRE usa CLARIFY con botones tappables. ${name} prefiere tappear que escribir.

REGLA DE ORO: si tu respuesta contiene una pregunta con respuestas posibles enumerables (sí/no, opciones, categorías, rangos), USA CLARIFY. Es 5x más rápido para ${name}.

Formato:
<<<CLARIFY>>>
{
  "intro": "Texto opcional · contexto antes de las preguntas",
  "questions": [
    {
      "label": "¿Pregunta concreta?",
      "options": [
        { "value": "valor1", "text": "Texto del botón 1" },
        { "value": "valor2", "text": "Texto del botón 2" }
      ]
    }
  ],
  "freeText": "Mensaje opcional · ej. 'O escribe el nombre del proveedor'"
}
<<<END_CLARIFY>>>

EJEMPLOS de cuándo USAR CLARIFY (siempre):
- Confirmaciones simples: "¿Confirmas que pagaste $698 a ATT?" → opciones [Sí, registrar | No, cancelar | Sí, pero con otro monto]
- Categorías: "¿Es gasto personal o de G2C?" → opciones [Personal | G2C | Música]
- Rangos: "¿Qué tan alta prioridad?" → opciones [Alta | Media | Baja]
- Fechas comunes: "¿Para cuándo lo agendamos?" → opciones [Hoy | Mañana | Esta semana | Otra fecha]
- Acciones múltiples: "¿Qué hago con esto?" → opciones [Registrar | Editar primero | Cancelar]
- Selección entre datos existentes: "¿Cuál cliente?" → opciones con cada cliente registrado
- Métodos: "¿Cómo lo pagaste?" → opciones [BBVA débito | BBVA crédito | Efectivo | Transferencia | Otro]
- Opiniones: "¿Quieres que profundice?" → opciones [Sí, dame más detalle | No, suficiente | Hazme un plan completo]
- Después de dar info: "¿Qué hacemos ahora?" → opciones [Registrarlo | Solo era info | Otra pregunta]

EJEMPLOS de cuándo NO usar CLARIFY:
- Petición ya tiene TODOS los datos exactos
- Necesitas texto largo libre (descripción, notas, contexto)
- Es respuesta de información sin pregunta de seguimiento
- Sería absurdo (ej. "¿cómo te llamas?" no necesita botones)

REGLAS de los botones:
- Mínimo 2 opciones · máximo 6
- Texto del botón corto (1-4 palabras ideal)
- Concretos · NO ambiguos ("Sí, registrar" mejor que "OK")
- Si hay datos del sistema relevantes, usa esos como opciones (ej. nombres de clientes, servicios registrados)
- El sistema YA agrega automáticamente un botón "▸ Escribir mi propia respuesta" · NO lo agregues tú

Después de CLARIFY, ${name} responderá con el valor seleccionado (o texto libre si escribió) y entonces continúas la conversación o ejecutas el tool_call.

# TOOL CALLS · acciones del sistema
Cuando ${name} pida REGISTRAR, AGENDAR, AGREGAR, CREAR, GUARDAR, MARCAR PAGADO, CERRAR CLIENTE algo, NO lo hagas verbalmente. TERMINA tu respuesta con un bloque JSON:

<<<TOOL_CALL>>>
{
  "action": "tipo_accion",
  "module": "calendario|musica_canciones|musica_eventos|musica_ensayo|finanzas|pendientes|youtube|cliente|servicio_fijo|skill|recordatorio|objetivo",
  "data": { ...campos... },
  "summary": "Descripción humana corta"
}
<<<END_TOOL_CALL>>>

## Acciones disponibles

### action="add_calendar_event" · module="calendario"
data: { title, date (YYYY-MM-DD), time (HH:MM, opcional), category (g2c|personal|musica|pago|cobro|evento), amount, notes }

### action="add_song" · module="musica_canciones"
data: { titulo, artista, genero (rock|pop|balada|cumbia|ranchera|bolero|alternativo|folk|reggae|jazz|electronica|reggaeton|otro), status (aprender|ensayando|dominada), letraUrl, youtubeUrl }

### action="add_music_event" · module="musica_eventos"
data: { titulo, fecha, hora, tipo (boda|cumpleanos|quinceanera|aniversario|bar|restaurante|suplencia|evento-corporativo|evento-privado|festival|otro), grupo (grupo-son|concepto-natural|free-concept|otro), pago, status (tentativo|confirmado|completado|cancelado), ubicacion, contacto }
Auto-sincroniza al calendario.

### action="set_rehearsal" · module="musica_ensayo"
data: { fecha, hora, banda, ubicacion, notas }
Auto-sincroniza al calendario.

### action="add_pendiente" · module="pendientes"
data: { text, dueDate, priority (alta|media|baja), recurrencia (none|diario|semanal|mensual|anual) }

### action="add_finanza" · module="finanzas"
data: { concepto, monto, categoria (g2c|musica|otros|personal), fecha, tipo (ingreso|gasto), cliente_id (opcional), servicio_id (opcional) }

### action="add_cliente" · module="cliente"
data: { nombre, linea (g2c|musica|otros), plan, monto, frecuencia (mensual|anual|unico), diaCobro, fechaInicio, duracion (meses), notas, status (activo|prospecto|perdido) }
Crea contrato + auto-agenda 12 cobros calendario · actualiza MRR · suma a objetivo "Cerrar 12 cuentas G2C" si aplica.

### action="add_servicio_fijo" · module="servicio_fijo"
data: { motivo, proveedor, tipo (negocio|personal), categoria, total, diaCorte (1-31), frecuencia (mensual|anual), notas }
Auto-agenda alertas 7d/3d/1d antes del vencimiento.

### action="add_ingreso_pendiente" · module="finanzas"
data: { concepto, monto, fechaProyectada, cliente_id (opcional), categoria (g2c|musica|otros), notas }
USAR cuando ${name} proyecta un ingreso futuro que aún no ha cobrado · ej. "Facturé a NEOS pero me pagan en 30 días" o "Cierro venta este mes pero cobro en mayo". El sistema sincroniza al calendario como cobro proyectado.

### action="convertir_ingreso_a_recibido" · module="finanzas"
data: { ingreso_id, fechaPago }
USAR cuando ${name} dice "ya me pagó X" sobre un ingreso pendiente. Convierte el ingreso proyectado en recibido · actualiza MRR · suma a achievements.

### action="mark_servicio_pagado" · module="servicio_fijo"
data: { servicio_id, fechaPago, metodoPago, comprobante (opcional) }
Cascada: registra movimiento egreso · marca PAGADO · suma a KPI "Pagos puntuales" · auto-agenda próximo vencimiento.

### action="mark_cobro_recibido" · module="cobro"
data: { evento_id (id del evento de cobro en calendario), fechaCobro, metodoPago }
USAR cuando ${name} dice "ya cobré X cliente" o "recibí pago de Y". Cascada: marca cobrado en calendario · registra ingreso en finanzas · actualiza MRR efectivo.

### action="add_cuenta_por_cobrar" · module="cuenta_cobrar"
data: { cliente, cliente_id (opcional), concepto, monto, fechaVence, fechaEmision, notas }
USAR cuando ${name} dice "X cliente me debe Y" o "tengo que cobrar Z" o "facturé a tal y aún no me pagan". NO es un cliente recurrente · es un adeudo puntual.

### action="add_cuenta_por_pagar" · module="cuenta_pagar"
data: { proveedor, concepto, monto, fechaVence, fechaEmision, categoria (g2c|personal|musica|otros), notas }
USAR cuando ${name} dice "tengo que pagar X" o "debo Y a tal proveedor" o "vence Z el día tal". NO es servicio fijo recurrente · es deuda puntual.

### action="mark_cuenta_cobrada" · module="cuenta_cobrar"
data: { cuenta_id, fechaCobro, metodoPago }
Cascada: registra ingreso en finanzas · marca cuenta como cobrada.

### action="mark_cuenta_pagada" · module="cuenta_pagar"
data: { cuenta_id, fechaPago, metodoPago }
Cascada: registra gasto en finanzas · marca cuenta como pagada.

### action="add_skill" · module="skill"
data: { text, priority (true|false), category (personal|profesional|fiscal|musical|otro) }
USAR cuando ${name} dice "recuerda que..." o "guarda esto: ..." o "anota: ...".

### action="add_recordatorio" · module="recordatorio"
data: { text, fecha (opcional), repetir (none|cada-dia|cada-semana|cada-mes) }
USAR cuando dice "recuérdame que..." con info importante a futuro.

### action="add_objetivo" · module="objetivo"
data: { titulo, descripcion, categoria (personal|g2c|musica|financiero|compromiso), deadline, kpis (array de objetos {text, deadline, done}), porQueMimporta }
SMART obligatorio: específico, medible, alcanzable, relevante, con fecha. Cada KPI puede tener su propia deadline.

### action="search_youtube" · module="youtube"
data: { query, maxResults }
${hasYT ? `USAR cuando ${name} pida buscar/recomendar videos. El sistema mostrará videos REALES con thumbnails y reproductor inline.` : `NO USAR (sin YouTube API). Sugiere [Título](https://www.youtube.com/results?search_query=URL_ENCODED).`}

### action="request_upload" · module="cfdi" o "declaracion"
data: { tipoArchivo (cfdi|declaracion|xml|pdf), motivo (string explicando por qué necesitas el archivo) }
USAR cuando para responder con precisión necesitas analizar un comprobante fiscal o declaración real. ${name} podrá adjuntar el archivo y entonces lo analizas.

## ACCIONES DE ELIMINACIÓN
USAR cuando ${name} dice EXPLÍCITAMENTE "elimina/borra/quita/remueve X". Confirma con CLARIFY si hay duda.

### action="delete_pendiente" · data: { id }
Elimina tarea + todos sus eventos calendario asociados.

### action="delete_cliente" · data: { id }
Elimina cliente + sus cobros futuros NO cobrados (preserva histórico).

### action="delete_servicio_fijo" · data: { id }
Elimina servicio recurrente · NO afecta movimientos pasados ya pagados.

### action="delete_objetivo" · data: { id }
Elimina objetivo y todos sus KPIs.

### action="delete_kpi" · data: { objetivo_id, kpi_index }
Elimina un KPI específico de un objetivo · recalcula progreso.

### action="delete_finanza" · data: { id }
Elimina movimiento financiero (ingreso o gasto).

### action="delete_calendar_event" · data: { id }
Elimina evento del calendario.

### action="delete_cuenta_cobrar" · data: { id }
Elimina cuenta por cobrar.

### action="delete_cuenta_pagar" · data: { id }
Elimina cuenta por pagar.

# REGLAS GLOBALES
- UN tool call O UN clarify por respuesta · no múltiples
- Si no requiere acción ni clarificación, NO uses ningún bloque · solo responde
- Para fechas relativas calcula fecha real (hoy es ${today})
- NUNCA reproduzcas letras de canciones (copyright). Sugiere link a Genius/letras.com
- En módulo Música prefiere TOOLS musicales primero
- En módulo Finanzas modo ASESOR SAT siempre activo
- Si ${name} pide ELIMINAR algo · ejecuta el delete_* tool · NO solo digas "lo elimino" sin ejecutar
- Si pide "ya cobré" un cliente recurrente · usa mark_cobro_recibido · NO add_finanza directo
- Si dice "tengo que cobrar/pagar" puntualmente · usa add_cuenta_por_cobrar/pagar · NO add_finanza

# RESPUESTAS FISCALES · cómo responder cuando pregunta sobre SAT
1. Identifica el régimen ANTES de calcular (PF actividad empresarial al 16% IVA en su caso)
2. Si necesitas datos exactos pide CFDI/declaración con request_upload
3. SIEMPRE menciona: tasa aplicable + fundamento legal (LISR art X, CFF art Y) si lo conoces
4. Da rango realista por escenario, no número único
5. Cita la fuente: "según LISR vigente 2026" / "según última reforma fiscal"
6. Si dudas de un dato específico vigente, dilo abiertamente y sugiere verificar en sat.gob.mx

# CTA COBROS · SOLO cuando ${name} VA A COBRAR a un cliente
Si la conversación menciona que un CLIENTE le debe a ${name}, o ${name} va a cobrarle a alguien, sugiere generar la liga: https://cobros.g2c.com.mx/admin.html (Stripe + MercadoPago + transferencia). NUNCA sugieras esta liga para que ${name} pague algo a un proveedor · ese caso usa las apps de proveedores arriba.

# OBJETIVO ÚLTIMO
Que ${name} avance hacia sus metas de vida (casa, negocio escalable, banda activa, salud personal) con decisiones inteligentes y acciones concretas. No eres aspiracional · eres operativo. Mueve la aguja, no decores.`;
}

async function callClaude(messages, currentModule) {
  const config = getConfig();
  if (!config.apiKey) throw new Error('Sin API key Anthropic. Configura en /config.html');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(currentModule),
      messages: messages
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const reply = data.content?.[0]?.text || '';

  // Parse tool call
  const toolMatch = reply.match(/<<<TOOL_CALL>>>([\s\S]*?)<<<END_TOOL_CALL>>>/);
  let toolCall = null;
  if (toolMatch) {
    try {
      toolCall = JSON.parse(toolMatch[1].trim());
      toolCall.status = 'pending';
    } catch (e) { console.warn('Tool call parse fail', e); }
  }

  // Parse clarify
  const clarMatch = reply.match(/<<<CLARIFY>>>([\s\S]*?)<<<END_CLARIFY>>>/);
  let clarify = null;
  if (clarMatch) {
    try {
      clarify = JSON.parse(clarMatch[1].trim());
    } catch (e) { console.warn('Clarify parse fail', e); }
  }

  // Update stats
  const stats = load(STORAGE.CHAT_STATS, { totalTokensIn: 0, totalTokensOut: 0, words: {} });
  if (data.usage) {
    stats.totalTokensIn += (data.usage.input_tokens || 0);
    stats.totalTokensOut += (data.usage.output_tokens || 0);
    save(STORAGE.CHAT_STATS, stats);
  }

  return {
    text: reply,
    cleanText: reply
      .replace(/<<<TOOL_CALL>>>[\s\S]*?<<<END_TOOL_CALL>>>/, '')
      .replace(/<<<CLARIFY>>>[\s\S]*?<<<END_CLARIFY>>>/, '')
      .trim(),
    usage: data.usage,
    toolCall: toolCall,
    clarify: clarify
  };
}

// ============================================
// TOOL EXECUTOR (compartido)
// ============================================
function executeTool(tc) {
  const action = tc.action;
  const data = tc.data || {};

  if (action === 'add_calendar_event') {
    const cal = load(STORAGE.CALENDARIO, []);
    cal.push({
      id: uid('ev_ai'),
      title: data.title,
      date: data.date,
      time: data.time || '',
      category: data.category || 'g2c',
      amount: data.amount || '',
      notes: data.notes || '',
      createdAt: Date.now()
    });
    save(STORAGE.CALENDARIO, cal);
  }
  else if (action === 'add_song') {
    const songs = load(STORAGE.CANCIONES, []);
    songs.push({
      id: uid('song_ai'),
      titulo: data.titulo,
      artista: data.artista,
      genero: data.genero || '',
      status: data.status || 'aprender',
      letraUrl: data.letraUrl || '',
      youtubeUrl: data.youtubeUrl || '',
      anotaciones: '',
      tareas: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    save(STORAGE.CANCIONES, songs);
  }
  else if (action === 'add_music_event') {
    const events = load(STORAGE.EVENTOS_MUSICA, []);
    const id = uid('evt_ai');
    events.push({
      id,
      titulo: data.titulo,
      fecha: data.fecha,
      hora: data.hora || '',
      tipo: data.tipo || '',
      grupo: data.grupo || '',
      pago: Number(data.pago) || 0,
      status: data.status || 'tentativo',
      ubicacion: data.ubicacion || '',
      contacto: data.contacto || '',
      tareas: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    save(STORAGE.EVENTOS_MUSICA, events);
    syncMusicEventToCalendar(id, data);
  }
  else if (action === 'set_rehearsal') {
    let ensayo = load(STORAGE.ENSAYO, {});
    ensayo = { ...ensayo,
      fecha: data.fecha, hora: data.hora || '',
      banda: data.banda || '', ubicacion: data.ubicacion || '',
      notas: data.notas || ''
    };
    if (!ensayo.tareas) ensayo.tareas = [];
    save(STORAGE.ENSAYO, ensayo);
    syncRehearsalToCalendar(ensayo);
  }
  else if (action === 'add_pendiente') {
    const pend = load(STORAGE.PENDIENTES, []);
    const id = uid('pend');
    const newPend = {
      id,
      text: data.text,
      dueDate: data.dueDate || new Date().toISOString().slice(0,10), // default HOY si no hay fecha
      priority: data.priority || 'media',
      recurrencia: data.recurrencia || 'none',
      categoria: data.categoria || 'general',
      done: false,
      createdAt: Date.now()
    };
    pend.push(newPend);
    save(STORAGE.PENDIENTES, pend);
    // SIEMPRE sync al calendario (ahora siempre tiene dueDate)
    syncPendienteToCalendar(newPend);
  }
  else if (action === 'add_gasto' || action === 'add_finanza') {
    const fin = load(STORAGE.FINANZAS, []);
    const newMov = {
      id: uid('fin'),
      concepto: data.concepto,
      monto: Number(data.monto) || 0,
      categoria: data.categoria || 'g2c',
      fecha: data.fecha || new Date().toISOString().slice(0,10),
      tipo: data.tipo || 'gasto',
      cliente_id: data.cliente_id || null,
      servicio_id: data.servicio_id || null,
      createdAt: Date.now()
    };
    fin.push(newMov);
    save(STORAGE.FINANZAS, fin);
    // Sync al calendario · cualquier movimiento financiero queda registrado
    syncFinanzaToCalendar(newMov);
  }
  else if (action === 'add_cliente') {
    const clientes = load(STORAGE.CLIENTES, []);
    const cliente = {
      id: uid('cli'),
      numeroContrato: data.numeroContrato || '',
      nombre: data.nombre,
      linea: data.linea || 'g2c',
      plan: data.plan || '',
      monto: Number(data.monto) || 0,
      frecuencia: data.frecuencia || 'mensual',
      diaCobro: Number(data.diaCobro) || 1,
      fechaInicio: data.fechaInicio || new Date().toISOString().slice(0,10),
      duracion: Number(data.duracion) || 12,
      notas: data.notas || '',
      status: data.status || 'activo',
      createdAt: Date.now()
    };
    clientes.push(cliente);
    save(STORAGE.CLIENTES, clientes);
    if (cliente.frecuencia === 'mensual' && cliente.status === 'activo') {
      autoAgendaCobrosCalendario(cliente);
    }
    if (cliente.status === 'activo' && typeof logAchievement === 'function') {
      logAchievement('cliente_ganado', {
        clienteId: cliente.id,
        nombre: cliente.nombre,
        linea: cliente.linea,
        monto: cliente.monto,
        ltv: cliente.monto * cliente.duracion
      });
    }
    // SYNC v0.7.5 · objetivo + decision
    if (cliente.status === 'activo' && cliente.linea === 'g2c' && typeof syncObjetivoCuentas === 'function') {
      syncObjetivoCuentas();
    }
    if (typeof logDecision === 'function') {
      logDecision({
        tipo: 'cliente_ganado',
        titulo: 'Cierre · ' + cliente.nombre,
        impactoMRR: cliente.frecuencia === 'mensual' ? cliente.monto : 0,
        impactoLTV: cliente.monto * cliente.duracion,
        contexto: cliente.linea + ' · ' + cliente.plan,
        moduloAfectado: ['clientes', 'calendario', 'finanzas', 'objetivos']
      });
    }
  }
  else if (action === 'add_ingreso_pendiente') {
    addIngresoPendiente({
      concepto: data.concepto,
      monto: data.monto,
      fechaProyectada: data.fechaProyectada || data.fecha,
      cliente_id: data.cliente_id,
      categoria: data.categoria || 'g2c',
      notas: data.notas
    });
  }
  else if (action === 'convertir_ingreso_a_recibido') {
    convertirIngresoPendienteARecibido(data.ingreso_id, data.fechaPago);
  }
  else if (action === 'add_servicio_fijo') {
    const servicios = load(STORAGE.SERVICIOS_FIJOS, []);
    servicios.push({
      id: uid('srv'),
      motivo: data.motivo,
      proveedor: data.proveedor,
      tipo: data.tipo || 'negocio',
      categoria: data.categoria || '',
      total: Number(data.total) || 0,
      diaCorte: Number(data.diaCorte) || 1,
      frecuencia: data.frecuencia || 'mensual',
      notas: data.notas || '',
      estado: 'activo',
      historialPagos: [],
      createdAt: Date.now()
    });
    save(STORAGE.SERVICIOS_FIJOS, servicios);
  }
  else if (action === 'mark_servicio_pagado') {
    const servicios = load(STORAGE.SERVICIOS_FIJOS, []);
    const idx = servicios.findIndex(s => s.id === data.servicio_id);
    if (idx >= 0) {
      const srv = servicios[idx];
      const fechaPago = data.fechaPago || new Date().toISOString().slice(0,10);
      srv.historialPagos = srv.historialPagos || [];
      srv.historialPagos.push({
        fechaPago: fechaPago,
        metodoPago: data.metodoPago || '',
        comprobante: data.comprobante || '',
        monto: srv.total,
        ts: Date.now()
      });
      srv.ultimoPago = fechaPago;
      // Recalcular estado · si el último pago cubre el período actual, ya no está vencido
      srv.estado = 'activo';
      servicios[idx] = srv;
      save(STORAGE.SERVICIOS_FIJOS, servicios);
      // Cascada · registrar movimiento financiero
      const fin = load(STORAGE.FINANZAS, []);
      fin.push({
        id: uid('fin_srv'),
        concepto: `${srv.motivo} · ${srv.proveedor}`,
        monto: srv.total,
        categoria: srv.tipo === 'negocio' ? 'g2c' : 'personal',
        fecha: fechaPago,
        tipo: 'gasto',
        servicio_id: srv.id,
        metodoPago: data.metodoPago || '',
        createdAt: Date.now()
      });
      save(STORAGE.FINANZAS, fin);

      // Registrar en histórico unificado
      if (typeof logAchievement === 'function') {
        logAchievement('servicio_pagado', {
          servicioId: srv.id,
          motivo: srv.motivo,
          proveedor: srv.proveedor,
          monto: srv.total,
          tipo: srv.tipo
        });
      }
    }
  }
  else if (action === 'mark_cobro_recibido') {
    // Marcar un cobro de cliente como recibido · cascada a finanzas
    const cal = load(STORAGE.CALENDARIO, []);
    const idx = cal.findIndex(e => e.id === data.evento_id);
    if (idx < 0) throw new Error('Evento de cobro no encontrado');
    const evento = cal[idx];
    if (evento.category !== 'cobro') throw new Error('No es evento de cobro');
    const fechaCobro = data.fechaCobro || new Date().toISOString().slice(0,10);
    evento.cobrado = true;
    evento.fechaCobroReal = fechaCobro;
    evento.metodoPago = data.metodoPago || '';
    cal[idx] = evento;
    save(STORAGE.CALENDARIO, cal);
    // Cascada · registrar ingreso en finanzas
    const fin = load(STORAGE.FINANZAS, []);
    const clientes = load(STORAGE.CLIENTES, []);
    const cliente = clientes.find(c => c.id === evento.sourceId);
    fin.push({
      id: uid('fin_cobro'),
      concepto: `Cobro · ${cliente?.nombre || 'Cliente'}`,
      monto: Number(evento.amount) || 0,
      categoria: cliente?.linea || 'g2c',
      fecha: fechaCobro,
      tipo: 'ingreso',
      cliente_id: evento.sourceId,
      metodoPago: data.metodoPago || '',
      createdAt: Date.now()
    });
    save(STORAGE.FINANZAS, fin);
  }
  else if (action === 'add_cuenta_por_cobrar') {
    // Cliente me debe · pendiente de cobrar
    const cuentas = load(STORAGE.CUENTAS_COBRAR, []);
    cuentas.push({
      id: uid('xc'),
      cliente: data.cliente || '',
      cliente_id: data.cliente_id || null,
      concepto: data.concepto || '',
      monto: Number(data.monto) || 0,
      fechaVence: data.fechaVence || '',
      fechaEmision: data.fechaEmision || new Date().toISOString().slice(0,10),
      cobrado: false,
      notas: data.notas || '',
      createdAt: Date.now()
    });
    save(STORAGE.CUENTAS_COBRAR, cuentas);
  }
  else if (action === 'add_cuenta_por_pagar') {
    // Yo debo · pendiente de pagar
    const cuentas = load(STORAGE.CUENTAS_PAGAR, []);
    cuentas.push({
      id: uid('xp'),
      proveedor: data.proveedor || '',
      concepto: data.concepto || '',
      monto: Number(data.monto) || 0,
      fechaVence: data.fechaVence || '',
      fechaEmision: data.fechaEmision || new Date().toISOString().slice(0,10),
      pagado: false,
      categoria: data.categoria || 'g2c',
      notas: data.notas || '',
      createdAt: Date.now()
    });
    save(STORAGE.CUENTAS_PAGAR, cuentas);
  }
  else if (action === 'mark_cuenta_cobrada') {
    const cuentas = load(STORAGE.CUENTAS_COBRAR, []);
    const idx = cuentas.findIndex(c => c.id === data.cuenta_id);
    if (idx >= 0) {
      const c = cuentas[idx];
      c.cobrado = true;
      c.fechaCobroReal = data.fechaCobro || new Date().toISOString().slice(0,10);
      c.metodoPago = data.metodoPago || '';
      cuentas[idx] = c;
      save(STORAGE.CUENTAS_COBRAR, cuentas);
      // Cascada · registrar ingreso
      const fin = load(STORAGE.FINANZAS, []);
      fin.push({
        id: uid('fin_xc'),
        concepto: `Cobro · ${c.cliente || c.concepto}`,
        monto: c.monto,
        categoria: 'g2c',
        fecha: c.fechaCobroReal,
        tipo: 'ingreso',
        cliente_id: c.cliente_id,
        metodoPago: data.metodoPago || '',
        createdAt: Date.now()
      });
      save(STORAGE.FINANZAS, fin);
    }
  }
  else if (action === 'mark_cuenta_pagada') {
    const cuentas = load(STORAGE.CUENTAS_PAGAR, []);
    const idx = cuentas.findIndex(c => c.id === data.cuenta_id);
    if (idx >= 0) {
      const c = cuentas[idx];
      c.pagado = true;
      c.fechaPagoReal = data.fechaPago || new Date().toISOString().slice(0,10);
      c.metodoPago = data.metodoPago || '';
      cuentas[idx] = c;
      save(STORAGE.CUENTAS_PAGAR, cuentas);
      // Cascada · registrar gasto
      const fin = load(STORAGE.FINANZAS, []);
      fin.push({
        id: uid('fin_xp'),
        concepto: `Pago · ${c.proveedor || c.concepto}`,
        monto: c.monto,
        categoria: c.categoria || 'g2c',
        fecha: c.fechaPagoReal,
        tipo: 'gasto',
        metodoPago: data.metodoPago || '',
        createdAt: Date.now()
      });
      save(STORAGE.FINANZAS, fin);
    }
  }
  // ============ TOOLS DE ELIMINACIÓN ============
  else if (action === 'delete_pendiente') {
    const pend = load(STORAGE.PENDIENTES, []).filter(p => p.id !== data.id);
    save(STORAGE.PENDIENTES, pend);
    // También eliminar eventos calendario asociados
    const cal = load(STORAGE.CALENDARIO, []).filter(e => e.sourceId !== data.id);
    save(STORAGE.CALENDARIO, cal);
  }
  else if (action === 'delete_cliente') {
    const clientes = load(STORAGE.CLIENTES, []).filter(c => c.id !== data.id);
    save(STORAGE.CLIENTES, clientes);
    // Eliminar cobros futuros asociados (preservar histórico cobrado)
    const cal = load(STORAGE.CALENDARIO, []).filter(e => !(e.sourceId === data.id && !e.cobrado));
    save(STORAGE.CALENDARIO, cal);
  }
  else if (action === 'delete_servicio_fijo') {
    const servicios = load(STORAGE.SERVICIOS_FIJOS, []).filter(s => s.id !== data.id);
    save(STORAGE.SERVICIOS_FIJOS, servicios);
  }
  else if (action === 'delete_objetivo') {
    const objs = load(STORAGE.OBJETIVOS, []).filter(o => o.id !== data.id);
    save(STORAGE.OBJETIVOS, objs);
  }
  else if (action === 'delete_finanza') {
    const fin = load(STORAGE.FINANZAS, []).filter(f => f.id !== data.id);
    save(STORAGE.FINANZAS, fin);
  }
  else if (action === 'delete_calendar_event') {
    const cal = load(STORAGE.CALENDARIO, []).filter(e => e.id !== data.id);
    save(STORAGE.CALENDARIO, cal);
  }
  else if (action === 'delete_cuenta_cobrar') {
    const cuentas = load(STORAGE.CUENTAS_COBRAR, []).filter(c => c.id !== data.id);
    save(STORAGE.CUENTAS_COBRAR, cuentas);
  }
  else if (action === 'delete_cuenta_pagar') {
    const cuentas = load(STORAGE.CUENTAS_PAGAR, []).filter(c => c.id !== data.id);
    save(STORAGE.CUENTAS_PAGAR, cuentas);
  }
  else if (action === 'delete_kpi') {
    // Eliminar un KPI específico de un objetivo
    const objs = load(STORAGE.OBJETIVOS, []);
    const idx = objs.findIndex(o => o.id === data.objetivo_id);
    if (idx >= 0) {
      objs[idx].kpis = (objs[idx].kpis || []).filter((k, i) => i !== Number(data.kpi_index));
      const total = objs[idx].kpis.length;
      const completos = objs[idx].kpis.filter(k => k.done).length;
      objs[idx].progreso = total > 0 ? Math.round((completos / total) * 100) : 0;
      objs[idx].completed = objs[idx].progreso === 100 && total > 0;
      save(STORAGE.OBJETIVOS, objs);
    }
  }
  else if (action === 'request_upload') {
    return { __upload_request: true, tipoArchivo: data.tipoArchivo, motivo: data.motivo };
  }
  else if (action === 'add_skill') {
    const skills = load(STORAGE.SKILLS, []);
    skills.unshift({
      id: uid('skill'),
      text: data.text,
      priority: !!data.priority,
      category: data.category || 'otro',
      createdAt: Date.now()
    });
    save(STORAGE.SKILLS, skills);
  }
  else if (action === 'add_recordatorio') {
    const recordatorios = load(STORAGE.RECORDATORIOS, []);
    recordatorios.unshift({
      id: uid('rec'),
      text: data.text,
      fecha: data.fecha || '',
      repetir: data.repetir || 'none',
      createdAt: Date.now()
    });
    save(STORAGE.RECORDATORIOS, recordatorios);
  }
  else if (action === 'add_objetivo') {
    const objetivos = load(STORAGE.OBJETIVOS, []);
    objetivos.push({
      id: uid('obj'),
      titulo: data.titulo,
      descripcion: data.descripcion || '',
      categoria: data.categoria || 'personal',
      deadline: data.deadline || '',
      kpis: (data.kpis || []).map(k => typeof k === 'string' ? { text: k, done: false } : k),
      porQueMimporta: data.porQueMimporta || '',
      progreso: 0,
      completed: false,
      createdAt: Date.now()
    });
    save(STORAGE.OBJETIVOS, objetivos);
  }
  else if (action === 'search_youtube') {
    return executeYouTubeSearch(data.query, data.maxResults || 3);
  }
  else {
    throw new Error('Acción desconocida: ' + action);
  }

  logAction(tc);
}

function autoAgendaCobrosCalendario(cliente) {
  if (!cliente.fechaInicio || !cliente.duracion) return;
  const cal = load(STORAGE.CALENDARIO, []);
  const start = new Date(cliente.fechaInicio + 'T12:00:00');
  for (let i = 0; i < cliente.duracion; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    d.setDate(cliente.diaCobro || start.getDate());
    cal.push({
      id: uid('cal_cobro'),
      title: `Cobro · ${cliente.nombre} · $${cliente.monto}`,
      date: d.toISOString().slice(0,10),
      time: '',
      category: 'cobro',
      amount: cliente.monto,
      notes: `Cliente ${cliente.linea} · ${cliente.plan}`,
      sourceModule: 'finanzas',
      sourceId: cliente.id,
      createdAt: Date.now()
    });
  }
  save(STORAGE.CALENDARIO, cal);
}

function logAction(tc) {
  const log = load(STORAGE.ACTIONS_LOG, []);
  log.unshift({
    ts: Date.now(),
    module: tc.module,
    action: tc.action,
    summary: tc.summary,
    data: tc.data
  });
  save(STORAGE.ACTIONS_LOG, log.slice(0, 100));
}

function syncMusicEventToCalendar(eventoId, data) {
  const cal = load(STORAGE.CALENDARIO, []);
  const TIPOS = { boda: 'Boda', cumpleanos: 'Cumpleaños', quinceanera: 'Quinceañera', aniversario: 'Aniversario', bar: 'Bar', restaurante: 'Restaurante', suplencia: 'Suplencia', 'evento-corporativo': 'Corporativo', 'evento-privado': 'Privado', festival: 'Festival', otro: 'Otro' };
  const BANDAS = { 'grupo-son': 'Grupo Son', 'concepto-natural': 'Concepto Natural', 'free-concept': 'Free Concept', 'otro': 'Otro' };
  const tipoName = TIPOS[data.tipo] || 'Evento';
  const grupoName = BANDAS[data.grupo] || '';
  cal.push({
    id: uid('cal_musica_evt'),
    title: ` ${tipoName}: ${data.titulo}${grupoName ? ' · ' + grupoName : ''}`,
    date: data.fecha,
    time: data.hora || '',
    category: 'musica',
    amount: data.pago || '',
    notes: `${data.ubicacion ? 'Ubicación: '+data.ubicacion+'\n' : ''}Status: ${data.status || 'tentativo'}`,
    sourceModule: 'musica',
    sourceId: eventoId,
    sourceTab: 'eventos',
    createdAt: Date.now()
  });
  save(STORAGE.CALENDARIO, cal);
}

function syncRehearsalToCalendar(ensayo) {
  const BANDAS = { 'grupo-son': 'Grupo Son', 'concepto-natural': 'Concepto Natural', 'free-concept': 'Free Concept', 'otro': 'Otro' };
  const banda = BANDAS[ensayo.banda] || 'Banda';
  let cal = load(STORAGE.CALENDARIO, []);
  let idx = -1;
  if (ensayo.calendarioEventId) idx = cal.findIndex(e => e.id === ensayo.calendarioEventId);
  const ev = {
    title: ` Ensayo · ${banda}`,
    date: ensayo.fecha,
    time: ensayo.hora || '',
    category: 'musica',
    amount: '',
    notes: `Ubicación: ${ensayo.ubicacion || 'Sin definir'}\n\n${ensayo.notas || ''}`,
    sourceModule: 'musica',
    sourceId: 'ensayo',
    sourceTab: 'ensayo',
    createdAt: idx >= 0 ? cal[idx].createdAt : Date.now()
  };
  if (idx >= 0) {
    ev.id = ensayo.calendarioEventId;
    cal[idx] = ev;
  } else {
    ev.id = uid('cal_musica_ensayo');
    cal.push(ev);
    ensayo.calendarioEventId = ev.id;
    save(STORAGE.ENSAYO, ensayo);
  }
  save(STORAGE.CALENDARIO, cal);
}

// ============================================
// YOUTUBE SEARCH (compartido)
// ============================================
async function executeYouTubeSearch(query, maxResults) {
  const config = getConfig();
  if (!config.youtubeApiKey) throw new Error('Sin YouTube API key');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults||3}&type=video&key=${encodeURIComponent(config.youtubeApiKey)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.items) throw new Error(data.error?.message || 'YouTube error');
  return data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt
  }));
}

function formatAiText(text) {
  let out = escapeHTML(text);
  out = out.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.replace(/^\n/, '')}</code></pre>`);
  out = out.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  out = out.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  out = out.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  out = out.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  out = out.replace(/^- (.+)$/gm, '<li>$1</li>');
  out = out.replace(/(<li>[\s\S]+?<\/li>)/g, m => `<ul>${m}</ul>`);
  out = out.split(/\n\n+/).map(p => p.trim() ? (p.startsWith('<') ? p : `<p>${p.replace(/\n/g,'<br>')}</p>`) : '').join('');
  return out;
}

// ============================================
// AUTH GUARD (call on each protected page)
// ============================================
async function authGuard() {
  const ok = await checkAuth();
  if (!ok) {
    sessionStorage.setItem('returnTo', window.location.pathname + window.location.search);
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ============================================
// AUTO-VENCIDO de servicios fijos
// Se llama al cargar cualquier página
// ============================================
function checkServiciosVencidos() {
  const servicios = load(STORAGE.SERVICIOS_FIJOS, []);
  const today = new Date(); today.setHours(0,0,0,0);
  let updated = false;

  servicios.forEach(s => {
    if (s.estado === 'pagado_actual') return;
    const vencDate = computeProximoVencimiento(s);
    if (!vencDate) return;
    if (vencDate < today) {
      if (s.estado !== 'vencido') {
        s.estado = 'vencido';
        updated = true;
      }
    } else if ((vencDate - today) / 86400000 <= 7) {
      if (s.estado !== 'proximo') {
        s.estado = 'proximo';
        updated = true;
      }
    } else {
      if (s.estado !== 'activo') {
        s.estado = 'activo';
        updated = true;
      }
    }
  });

  if (updated) save(STORAGE.SERVICIOS_FIJOS, servicios);
}

function computeProximoVencimiento(servicio) {
  if (!servicio.diaCorte) return null;
  const today = new Date();
  let prox = new Date(today.getFullYear(), today.getMonth(), servicio.diaCorte);
  if (servicio.ultimoPago) {
    const last = new Date(servicio.ultimoPago + 'T12:00:00');
    if (last.getMonth() === today.getMonth() && last.getFullYear() === today.getFullYear()) {
      prox = new Date(today.getFullYear(), today.getMonth() + 1, servicio.diaCorte);
    }
  }
  return prox;
}

function getServiciosAlertas() {
  checkServiciosVencidos();
  const servicios = load(STORAGE.SERVICIOS_FIJOS, []);
  return {
    vencidos: servicios.filter(s => s.estado === 'vencido'),
    proximos: servicios.filter(s => s.estado === 'proximo'),
    activos: servicios.filter(s => s.estado === 'activo')
  };
}

// ============================================
// PENDIENTES · sync calendario + recurrencias
// ============================================
function syncPendienteToCalendar(pendiente) {
  if (!pendiente.dueDate) return;
  const cal = load(STORAGE.CALENDARIO, []);

  if (pendiente.recurrencia && pendiente.recurrencia !== 'none') {
    const startDate = new Date(pendiente.dueDate + 'T12:00:00');
    const occurrences = pendiente.recurrencia === 'diario' ? 30
      : pendiente.recurrencia === 'semanal' ? 12
      : pendiente.recurrencia === 'mensual' ? 12
      : pendiente.recurrencia === 'anual' ? 3
      : 1;

    for (let i = 0; i < occurrences; i++) {
      const d = new Date(startDate);
      if (pendiente.recurrencia === 'diario') d.setDate(d.getDate() + i);
      else if (pendiente.recurrencia === 'semanal') d.setDate(d.getDate() + i * 7);
      else if (pendiente.recurrencia === 'mensual') d.setMonth(d.getMonth() + i);
      else if (pendiente.recurrencia === 'anual') d.setFullYear(d.getFullYear() + i);

      cal.push({
        id: uid('cal_pend'),
        title: `▸ ${pendiente.text}`,
        date: d.toISOString().slice(0,10),
        time: '',
        category: 'personal',
        amount: '',
        notes: `Pendiente recurrente · ${pendiente.recurrencia} · prioridad ${pendiente.priority}`,
        sourceModule: 'pendientes',
        sourceId: pendiente.id,
        createdAt: Date.now()
      });
    }
  } else {
    cal.push({
      id: uid('cal_pend'),
      title: `▸ ${pendiente.text}`,
      date: pendiente.dueDate,
      time: '',
      category: 'personal',
      amount: '',
      notes: `Pendiente · prioridad ${pendiente.priority}`,
      sourceModule: 'pendientes',
      sourceId: pendiente.id,
      createdAt: Date.now()
    });
  }
  save(STORAGE.CALENDARIO, cal);
}

function getPendientesAlertas() {
  const pendientes = load(STORAGE.PENDIENTES, []);
  const today = new Date(); today.setHours(0,0,0,0);
  const noDone = pendientes.filter(p => !p.done);
  return {
    vencidos: noDone.filter(p => p.dueDate && new Date(p.dueDate) < today),
    hoy: noDone.filter(p => p.dueDate === today.toISOString().slice(0,10)),
    semana: noDone.filter(p => {
      if (!p.dueDate) return false;
      const d = new Date(p.dueDate);
      const diff = (d - today) / 86400000;
      return diff > 0 && diff <= 7;
    }),
    sinFecha: noDone.filter(p => !p.dueDate),
    todos: noDone
  };
}

// ============================================
// CFDI · parser XML 4.0
// ============================================
function parseCFDI(xmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    if (doc.querySelector('parsererror')) {
      return { error: 'XML malformado' };
    }

    const ns = {
      cfdi: 'http://www.sat.gob.mx/cfd/4',
      tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital'
    };

    const comprobante = doc.documentElement;
    const emisor = doc.getElementsByTagNameNS(ns.cfdi, 'Emisor')[0]
      || doc.querySelector('Emisor');
    const receptor = doc.getElementsByTagNameNS(ns.cfdi, 'Receptor')[0]
      || doc.querySelector('Receptor');
    const conceptos = Array.from(doc.getElementsByTagNameNS(ns.cfdi, 'Concepto'))
      .concat(Array.from(doc.querySelectorAll('Concepto')))
      .filter((v,i,a) => a.indexOf(v) === i);

    const tfd = doc.getElementsByTagNameNS(ns.tfd, 'TimbreFiscalDigital')[0]
      || doc.querySelector('TimbreFiscalDigital');

    const impuestos = doc.getElementsByTagNameNS(ns.cfdi, 'Impuestos')[0]
      || doc.querySelector('Impuestos');
    const totalIVA = impuestos?.getAttribute?.('TotalImpuestosTrasladados') || '0';

    return {
      ok: true,
      version: comprobante?.getAttribute?.('Version') || '4.0',
      tipoComprobante: comprobante?.getAttribute?.('TipoDeComprobante') || '',
      serie: comprobante?.getAttribute?.('Serie') || '',
      folio: comprobante?.getAttribute?.('Folio') || '',
      fecha: comprobante?.getAttribute?.('Fecha') || '',
      formaPago: comprobante?.getAttribute?.('FormaPago') || '',
      metodoPago: comprobante?.getAttribute?.('MetodoPago') || '',
      moneda: comprobante?.getAttribute?.('Moneda') || 'MXN',
      tipoCambio: comprobante?.getAttribute?.('TipoCambio') || '1',
      subtotal: Number(comprobante?.getAttribute?.('SubTotal') || 0),
      total: Number(comprobante?.getAttribute?.('Total') || 0),
      lugarExpedicion: comprobante?.getAttribute?.('LugarExpedicion') || '',
      emisor: {
        rfc: emisor?.getAttribute?.('Rfc') || '',
        nombre: emisor?.getAttribute?.('Nombre') || '',
        regimenFiscal: emisor?.getAttribute?.('RegimenFiscal') || ''
      },
      receptor: {
        rfc: receptor?.getAttribute?.('Rfc') || '',
        nombre: receptor?.getAttribute?.('Nombre') || '',
        usoCFDI: receptor?.getAttribute?.('UsoCFDI') || '',
        regimenFiscal: receptor?.getAttribute?.('RegimenFiscalReceptor') || '',
        domicilioFiscal: receptor?.getAttribute?.('DomicilioFiscalReceptor') || ''
      },
      conceptos: conceptos.map(c => ({
        descripcion: c.getAttribute('Descripcion') || '',
        cantidad: Number(c.getAttribute('Cantidad') || 0),
        valorUnitario: Number(c.getAttribute('ValorUnitario') || 0),
        importe: Number(c.getAttribute('Importe') || 0),
        claveProdServ: c.getAttribute('ClaveProdServ') || '',
        claveUnidad: c.getAttribute('ClaveUnidad') || ''
      })),
      totalIVA: Number(totalIVA),
      uuid: tfd?.getAttribute?.('UUID') || '',
      fechaTimbrado: tfd?.getAttribute?.('FechaTimbrado') || ''
    };
  } catch (e) {
    return { error: 'Error parsing: ' + e.message };
  }
}

function saveCFDI(parsed, fileName) {
  if (!parsed.ok) return null;
  const cfdis = load(STORAGE.CFDIS, []);
  const config = getConfig();
  const myRFC = (config.rfc || '').toUpperCase();
  const isEmitido = parsed.emisor.rfc?.toUpperCase() === myRFC;
  const tipo = isEmitido ? 'emitido' : 'recibido';

  const cfdi = {
    id: uid('cfdi'),
    uuid: parsed.uuid,
    fileName: fileName,
    tipo: tipo,
    direccion: isEmitido ? 'salida' : 'entrada',
    fecha: parsed.fecha,
    fechaTimbrado: parsed.fechaTimbrado,
    emisor: parsed.emisor,
    receptor: parsed.receptor,
    subtotal: parsed.subtotal,
    iva: parsed.totalIVA,
    total: parsed.total,
    moneda: parsed.moneda,
    formaPago: parsed.formaPago,
    metodoPago: parsed.metodoPago,
    conceptos: parsed.conceptos,
    tipoComprobante: parsed.tipoComprobante,
    raw: null,
    createdAt: Date.now()
  };
  cfdis.unshift(cfdi);
  save(STORAGE.CFDIS, cfdis);
  return cfdi;
}

// ============================================
// BOTTOM NAV · estilo app nativa · solo mobile
// ============================================
function renderBottomnav(activeKey) {
  const leftItems = [
    { key: 'finanzas', label: 'FINANZAS', href: 'finanzas.html', icon: '$' },
    { key: 'pendientes', label: 'TAREAS', href: 'pendientes.html', icon: '✓' }
  ];
  const rightItems = [
    { key: 'calendario', label: 'CAL', href: 'calendario.html', icon: '▣' },
    { key: 'musica', label: 'MUSICA', href: 'musica.html', icon: '♪' }
  ];
  const mandoActive = activeKey === 'mando';

  // ESTILOS INLINE FORZADOS · imposible que algo los rompa
  const navStyle = "position:fixed;bottom:0;left:0;right:0;width:100%;height:64px;background-color:#0F1729;border-top:2px solid #FF4F00;box-shadow:0 -10px 30px rgba(0,0,0,0.95);z-index:999999;display:flex;flex-direction:row;justify-content:space-around;align-items:flex-end;padding:8px 0;padding-bottom:max(8px,env(safe-area-inset-bottom));margin:0;opacity:1;visibility:visible;";

  const itemStyle = (active) => `flex:1 1 0;max-width:25%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;color:${active?'#FF4F00':'#C5C9D6'};padding:4px;background:transparent;border:none;outline:none;gap:2px;`;

  const iconStyle = "font-size:18px;line-height:1;color:inherit;";
  const labelStyle = "font-size:9px;letter-spacing:0.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;color:inherit;line-height:1;font-weight:600;";

  const mandoStyle = "flex:0 0 64px;width:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;transform:translateY(-12px);padding:0;background:transparent;border:none;outline:none;";
  const circleStyle = "width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FF4F00 0%,#FF7A00 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(255,79,0,0.6),0 0 0 4px #0F1729;margin-bottom:4px;";
  const starStyle = "color:#FFFFFF;font-size:28px;line-height:1;";
  const mandoLabelStyle = "color:#FF4F00;font-weight:700;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;line-height:1;";

  return `<nav class="bottomnav" style="${navStyle}">
    ${leftItems.map(item => `<a href="${item.href}" class="bottomnav-item" style="${itemStyle(item.key === activeKey)}"><span style="${iconStyle}">${item.icon}</span><span style="${labelStyle}">${item.label}</span></a>`).join('')}
    <a href="index.html" class="bottomnav-item bottomnav-mando" style="${mandoStyle}"><span style="${circleStyle}"><span style="${starStyle}">★</span></span><span style="${mandoLabelStyle}">MANDO</span></a>
    ${rightItems.map(item => `<a href="${item.href}" class="bottomnav-item" style="${itemStyle(item.key === activeKey)}"><span style="${iconStyle}">${item.icon}</span><span style="${labelStyle}">${item.label}</span></a>`).join('')}
  </nav>`;
}

function mountBottomnav(activeKey) {
  // Detectar login: solo si existe el elemento Y esta visible
  var loginScreen = document.getElementById('loginScreen');
  var isOnLogin = false;
  if (loginScreen) {
    // offsetParent es null cuando el elemento esta oculto (display:none o ancestor display:none)
    isOnLogin = loginScreen.offsetParent !== null;
  }
  
  // Eliminar nav viejo
  var existing = document.getElementById('bottomnavMount');
  if (existing) existing.remove();
  
  if (isOnLogin) {
    document.body.style.paddingBottom = '0';
    return;
  }
  
  // Montar nav directo al body
  var div = document.createElement('div');
  div.id = 'bottomnavMount';
  div.innerHTML = renderBottomnav(activeKey);
  document.body.appendChild(div);
  
  document.body.style.paddingBottom = '90px';
  
  // Toggle por viewport
  function checkMobile() {
    var nav = document.querySelector('.bottomnav');
    if (!nav) return;
    if (window.innerWidth > 880) {
      nav.style.display = 'none';
      document.body.style.paddingBottom = '0';
    } else {
      nav.style.display = 'flex';
      document.body.style.paddingBottom = '90px';
    }
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
}

// AUTO-MOUNT · sin importar si el HTML lo llama o no
(function autoMountNav() {
  function detectActiveKey() {
    var path = window.location.pathname.split('/').pop().toLowerCase();
    if (path.indexOf('finanzas') >= 0) return 'finanzas';
    if (path.indexOf('pendientes') >= 0) return 'pendientes';
    if (path.indexOf('calendario') >= 0) return 'calendario';
    if (path.indexOf('musica') >= 0) return 'musica';
    if (path.indexOf('config') >= 0) return 'config';
    if (path.indexOf('chat') >= 0) return 'mando';
    return 'mando';
  }
  
  function tryMount() {
    if (typeof mountBottomnav === 'function' && document.body) {
      try { mountBottomnav(detectActiveKey()); } catch(e) { console.warn('mountBottomnav error:', e); }
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(tryMount, 100);
      setTimeout(tryMount, 500);
      setTimeout(tryMount, 1500);
    });
  } else {
    setTimeout(tryMount, 100);
    setTimeout(tryMount, 500);
    setTimeout(tryMount, 1500);
  }
})();

// ============================================
// ACHIEVEMENTS · histórico de progreso unificado
// ============================================
function logAchievement(type, payload) {
  // type: 'kpi_done' | 'kpi_undone' | 'objetivo_done' | 'pendiente_done' | 'servicio_pagado' | 'cliente_ganado'
  const ach = load(STORAGE.ACHIEVEMENTS, []);
  ach.unshift({
    id: uid('ach'),
    type,
    payload,
    timestamp: Date.now(),
    date: new Date().toISOString().slice(0,10)
  });
  // Limitar a últimos 1000 logros
  if (ach.length > 1000) ach.length = 1000;
  save(STORAGE.ACHIEVEMENTS, ach);
  return ach[0];
}

function getAchievementsStats() {
  const ach = load(STORAGE.ACHIEVEMENTS, []);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toISOString().slice(0,10);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString().slice(0,10);
  const monthStart = todayStr.slice(0,7);

  // KPIs cumplidos (no contar undone)
  const kpisDone = ach.filter(a => a.type === 'kpi_done');
  const objetivosDone = ach.filter(a => a.type === 'objetivo_done');
  const pendientesDone = ach.filter(a => a.type === 'pendiente_done');
  const serviciosPagados = ach.filter(a => a.type === 'servicio_pagado');
  const clientesGanados = ach.filter(a => a.type === 'cliente_ganado');

  return {
    total: ach.length,
    kpisDoneTotal: kpisDone.length,
    kpisDoneToday: kpisDone.filter(a => a.date === todayStr).length,
    kpisDoneWeek: kpisDone.filter(a => a.date >= weekStartStr).length,
    kpisDoneMonth: kpisDone.filter(a => a.date.startsWith(monthStart)).length,
    objetivosCompletados: objetivosDone.length,
    pendientesCompletadosTotal: pendientesDone.length,
    pendientesCompletadosHoy: pendientesDone.filter(a => a.date === todayStr).length,
    pendientesCompletadosSemana: pendientesDone.filter(a => a.date >= weekStartStr).length,
    serviciosPagadosMes: serviciosPagados.filter(a => a.date.startsWith(monthStart)).length,
    clientesGanadosMes: clientesGanados.filter(a => a.date.startsWith(monthStart)).length,
    streakDias: calcularStreakDias(ach),
    historicoTimeline: ach.slice(0, 50)
  };
}

function calcularStreakDias(ach) {
  // Días consecutivos con al menos 1 KPI o pendiente completado
  const fechasConActividad = new Set();
  ach.forEach(a => {
    if (a.type === 'kpi_done' || a.type === 'pendiente_done' || a.type === 'objetivo_done') {
      fechasConActividad.add(a.date);
    }
  });
  if (fechasConActividad.size === 0) return 0;

  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dStr = d.toISOString().slice(0,10);
    if (fechasConActividad.has(dStr)) {
      streak++;
    } else if (i > 0) {
      break; // Romper streak si hay día sin actividad (pero ignorar hoy si aún no cumple nada)
    }
  }
  return streak;
}

function getDailyActivity(days = 30) {
  // Devuelve array de objetos { date, count } para gráfica
  const ach = load(STORAGE.ACHIEVEMENTS, []);
  const today = new Date(); today.setHours(0,0,0,0);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dStr = d.toISOString().slice(0,10);
    const count = ach.filter(a => a.date === dStr && (a.type === 'kpi_done' || a.type === 'pendiente_done' || a.type === 'objetivo_done')).length;
    result.push({ date: dStr, label: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }), count });
  }
  return result;
}

// ============================================
// ADJUNTOS A LA IA · documentos persistentes
// ============================================
// Tipos: cedula_fiscal, declaracion_anual, declaracion_mensual, constancia_situacion_fiscal,
//        constancia_no_adeudo, opinion_cumplimiento, identificacion, comprobante_domicilio,
//        contrato, cfdi, otro
const ATTACHMENT_TYPES = {
  cedula_fiscal: { label: 'Cédula fiscal · RFC', icon: '◈', color: 'var(--orange)', accept: 'image/*,application/pdf' },
  constancia_situacion_fiscal: { label: 'Constancia de Situación Fiscal', icon: '◆', color: 'var(--info)', accept: 'application/pdf,image/*' },
  declaracion_anual: { label: 'Declaración anual', icon: '▣', color: 'var(--success)', accept: 'application/pdf' },
  declaracion_mensual: { label: 'Declaración mensual', icon: '▤', color: 'var(--gold)', accept: 'application/pdf' },
  opinion_cumplimiento: { label: 'Opinión de cumplimiento', icon: '✓', color: 'var(--success)', accept: 'application/pdf,image/*' },
  identificacion: { label: 'Identificación oficial (INE)', icon: '◇', color: 'var(--info)', accept: 'image/*,application/pdf' },
  comprobante_domicilio: { label: 'Comprobante de domicilio', icon: '⌂', color: 'var(--gold)', accept: 'application/pdf,image/*' },
  contrato: { label: 'Contrato / acuerdo', icon: '§', color: 'var(--orange-light)', accept: 'application/pdf,image/*' },
  cfdi: { label: 'CFDI · factura', icon: '$', color: 'var(--success)', accept: 'application/pdf,application/xml,text/xml' },
  otro: { label: 'Otro documento', icon: '·', color: 'var(--gray-light)', accept: '*/*' }
};

function listAttachments() {
  return load(STORAGE.ATTACHMENTS, []);
}

function saveAttachment(att) {
  const all = listAttachments();
  if (att.id) {
    const idx = all.findIndex(a => a.id === att.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...att, updatedAt: Date.now() };
  } else {
    att.id = uid('att');
    att.createdAt = Date.now();
    att.updatedAt = Date.now();
    all.unshift(att);
  }
  save(STORAGE.ATTACHMENTS, all);
  return att;
}

function deleteAttachment(id) {
  const all = listAttachments();
  save(STORAGE.ATTACHMENTS, all.filter(a => a.id !== id));
}

function getAttachmentByType(type) {
  return listAttachments().filter(a => a.type === type);
}

// Convertir File a base64 para guardado
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Generar resumen de adjuntos para el system prompt de la IA
function buildAttachmentsContext() {
  const atts = listAttachments();
  if (atts.length === 0) return '';

  const grouped = {};
  atts.forEach(a => {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  });

  let ctx = '\n## Documentos disponibles del usuario\n';
  ctx += 'El usuario tiene estos documentos cargados que puedes consultar para análisis:\n';
  Object.entries(grouped).forEach(([type, items]) => {
    const meta = ATTACHMENT_TYPES[type] || { label: type };
    ctx += `\n### ${meta.label}\n`;
    items.forEach(a => {
      ctx += `- ${a.title || a.fileName}${a.notes ? ' · ' + a.notes : ''}`;
      if (a.extractedText) {
        const preview = a.extractedText.slice(0, 500);
        ctx += `\n  Contenido: ${preview}${a.extractedText.length > 500 ? '...' : ''}`;
      }
      ctx += '\n';
    });
  });
  return ctx;
}

// Buscar adjuntos relevantes según query
function findRelevantAttachments(query) {
  const atts = listAttachments();
  const q = query.toLowerCase();
  return atts.filter(a => {
    const fields = [a.title, a.fileName, a.notes, ATTACHMENT_TYPES[a.type]?.label, a.extractedText].filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).some(word => word.length > 3 && fields.includes(word));
  });
}

// ============================================
// PUSH NOTIFICATIONS · suscripción y gestión
// ============================================

// VAPID public key · usada para suscripciones push
const VAPID_PUBLIC_KEY = 'BL7J3TfdZEosrdDc5IWs5BBzM6uj0-1PiOPmhNeo0fp08E_NQdrW-VWB8u0b9zANoL5zd2su8gCEcPg8d79fwVM';

// Endpoint del servidor que recibe suscripciones y schedules
const PUSH_SERVER_URL = 'https://g2c-mando-push.REPLACE_WITH_YOUR_SUBDOMAIN.workers.dev';

// Storage para suscripción
STORAGE.PUSH_SUB = 'alan_mando_push_subscription';
STORAGE.PUSH_PREFS = 'alan_mando_push_prefs';

// Verificar soporte
function pushSupport() {
  return {
    supported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notification: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    requiresPWAInstall: /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
  };
}

// Registrar service worker
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[Push] SW registered', reg.scope);
    return reg;
  } catch (err) {
    console.error('[Push] SW registration failed', err);
    return null;
  }
}

// Convertir base64 string a Uint8Array (para applicationServerKey)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Solicitar permiso al usuario
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notification API no disponible' };
  }
  if (Notification.permission === 'granted') {
    return { granted: true };
  }
  if (Notification.permission === 'denied') {
    return { granted: false, error: 'Permiso denegado por el usuario · debes habilitarlo manualmente en ajustes del navegador' };
  }
  try {
    const result = await Notification.requestPermission();
    return { granted: result === 'granted' };
  } catch (err) {
    return { granted: false, error: err.message };
  }
}

// Suscribirse a push
async function subscribeToPush() {
  const support = pushSupport();
  if (!support.supported) {
    return { success: false, error: 'Push no soportado en este navegador' };
  }
  if (support.requiresPWAInstall) {
    return { success: false, error: 'iOS requiere que instales la app a pantalla de inicio primero · botón compartir → Agregar a pantalla de inicio' };
  }

  const perm = await requestNotificationPermission();
  if (!perm.granted) {
    return { success: false, error: perm.error || 'Permiso denegado' };
  }

  const reg = await registerServiceWorker();
  if (!reg) return { success: false, error: 'Service Worker no registrado' };

  // Esperar a que esté activo
  await navigator.serviceWorker.ready;

  // Verificar si ya está suscrito
  let subscription = await reg.pushManager.getSubscription();

  if (!subscription) {
    // Crear nueva suscripción
    if (VAPID_PUBLIC_KEY === 'REPLACE_WITH_VAPID_PUBLIC_KEY') {
      return { success: false, error: 'VAPID key no configurada · configura PUSH_SERVER_URL y VAPID_PUBLIC_KEY en shared.js' };
    }
    try {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    } catch (err) {
      return { success: false, error: 'Error al suscribir: ' + err.message };
    }
  }

  // Guardar suscripción local
  const subData = subscription.toJSON();
  save(STORAGE.PUSH_SUB, subData);

  // Enviar al servidor
  try {
    const config = getConfig();
    const userId = config.userId || 'alan-default';
    const res = await fetch(PUSH_SERVER_URL + '/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: subData,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          isStandalone: support.isStandalone
        }
      })
    });
    if (!res.ok) throw new Error('Server returned ' + res.status);
  } catch (err) {
    console.warn('[Push] Server subscription failed (suscripción local guardada):', err);
    return { success: true, subscription: subData, warning: 'Suscripción local OK · servidor no disponible aún' };
  }

  return { success: true, subscription: subData };
}

// Desuscribirse
async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return { success: false };
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    const subData = subscription.toJSON();
    await subscription.unsubscribe();
    // Notificar al servidor
    try {
      const config = getConfig();
      const userId = config.userId || 'alan-default';
      await fetch(PUSH_SERVER_URL + '/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, endpoint: subData.endpoint })
      });
    } catch (e) { /* silent */ }
  }
  localStorage.removeItem(STORAGE.PUSH_SUB);
  return { success: true };
}

// Verificar estado actual
async function getPushStatus() {
  const support = pushSupport();
  if (!support.supported) {
    return { ...support, subscribed: false };
  }
  if (!('serviceWorker' in navigator)) {
    return { ...support, subscribed: false };
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return { ...support, subscribed: false };
    const subscription = await reg.pushManager.getSubscription();
    return { ...support, subscribed: !!subscription, subscription: subscription ? subscription.toJSON() : null };
  } catch (err) {
    return { ...support, subscribed: false, error: err.message };
  }
}

// Programar notificación
async function schedulePushNotification(opts) {
  // opts: { type, title, body, sendAt (timestamp), url, data }
  const subData = load(STORAGE.PUSH_SUB);
  if (!subData) return { success: false, error: 'No hay suscripción activa' };

  try {
    const config = getConfig();
    const userId = config.userId || 'alan-default';
    const res = await fetch(PUSH_SERVER_URL + '/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: opts.type || 'general',
        title: opts.title || '★ G2C Mando',
        body: opts.body || '',
        sendAt: opts.sendAt || Date.now(),
        url: opts.url || '/',
        data: opts.data || {}
      })
    });
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const result = await res.json();
    return { success: true, scheduleId: result.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Test local · sin servidor
async function testLocalNotification() {
  const support = pushSupport();
  if (!support.supported) return { success: false, error: 'No soportado' };

  const perm = await requestNotificationPermission();
  if (!perm.granted) return { success: false, error: 'Sin permiso' };

  await registerServiceWorker();
  const reg = await navigator.serviceWorker.ready;

  // Mensaje al SW para mostrar notif de prueba
  if (reg.active) {
    reg.active.postMessage({ type: 'TEST_NOTIFICATION' });
    return { success: true };
  }
  return { success: false, error: 'Service Worker no activo' };
}

// Sincronizar todos los recordatorios automáticos al servidor
async function syncRemindersToServer() {
  const subData = load(STORAGE.PUSH_SUB);
  if (!subData) return { success: false, error: 'No hay suscripción' };

  const reminders = [];
  const now = Date.now();

  // 1. Servicios fijos próximos a vencer (7d, 3d, 1d antes)
  const finanzas = load(STORAGE.FINANZAS, {});
  (finanzas.servicios_fijos || []).forEach(s => {
    if (!s.proxima_fecha) return;
    const due = new Date(s.proxima_fecha).getTime();
    [7, 3, 1].forEach(d => {
      const at = due - (d * 24 * 60 * 60 * 1000);
      if (at > now) {
        reminders.push({
          type: 'servicio_vence',
          title: `▸ ${s.proveedor || s.motivo} vence en ${d} ${d===1?'día':'días'}`,
          body: `$${Number(s.total||0).toLocaleString('es-MX')} · ${s.motivo}`,
          sendAt: at,
          url: '/finanzas.html?tab=servicios',
          data: { servicioId: s.id }
        });
      }
    });
  });

  // 2. Cobros vencidos · clientes con cobro proximo
  const clientes = load(STORAGE.CLIENTES, []);
  clientes.filter(c => c.status === 'activo' && c.frecuencia === 'mensual').forEach(c => {
    if (!c.proxima_fecha_cobro) return;
    const due = new Date(c.proxima_fecha_cobro).getTime();
    if (due > now) {
      reminders.push({
        type: 'cobro_proximo',
        title: `$ Cobro a ${c.nombre}`,
        body: `$${Number(c.monto||0).toLocaleString('es-MX')} · vence ${c.proxima_fecha_cobro}`,
        sendAt: due - (24 * 60 * 60 * 1000), // 1 día antes
        url: '/finanzas.html?tab=clientes',
        data: { clienteId: c.id }
      });
    }
  });

  // 3. Pendientes con fecha
  const pendientes = load(STORAGE.PENDIENTES, []);
  pendientes.filter(p => !p.done && p.fecha).forEach(p => {
    const due = new Date(p.fecha + 'T09:00:00').getTime();
    if (due > now) {
      reminders.push({
        type: 'pendiente',
        title: `✓ Pendiente · ${p.text.slice(0,50)}`,
        body: p.categoria ? `Categoría · ${p.categoria}` : 'Tienes un pendiente para hoy',
        sendAt: due,
        url: '/pendientes.html',
        data: { pendienteId: p.id }
      });
    }
  });

  // 4. Eventos musicales
  const eventos = load(STORAGE.EVENTOS_MUSICA, []);
  eventos.filter(e => e.status === 'confirmado' && e.fecha).forEach(e => {
    const due = new Date(e.fecha + 'T' + (e.hora || '12:00')).getTime();
    if (due > now) {
      // 1 día antes y día del evento
      reminders.push({
        type: 'evento_musical',
        title: `★ Mañana · ${e.titulo}`,
        body: `${e.hora || ''} · ${e.ubicacion || ''}`,
        sendAt: due - (24 * 60 * 60 * 1000),
        url: '/musica.html?tab=eventos',
        data: { eventoId: e.id }
      });
    }
  });

  // Enviar todos al servidor en batch
  try {
    const config = getConfig();
    const userId = config.userId || 'alan-default';
    const res = await fetch(PUSH_SERVER_URL + '/sync-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reminders })
    });
    if (!res.ok) throw new Error('Server returned ' + res.status);
    return { success: true, count: reminders.length };
  } catch (err) {
    return { success: false, error: err.message, count: reminders.length };
  }
}

// ============================================
// APPS / PORTALES PROVEEDORES · accesos rápidos
// ============================================
const PROVIDER_APPS = {
  telnor: {
    label: 'Telnor',
    icon: 'T',
    appUrl: 'https://apps.apple.com/app/id1643041499',
    category: 'telecom',
    color: '#0066CC',
    aliases: ['telnor', 'infinitum']
  },
  banorte: {
    label: 'Banorte',
    icon: 'B',
    appUrl: 'https://apps.apple.com/app/id374817863',
    category: 'banco',
    color: '#EB0029',
    aliases: ['banorte', 'banco']
  },
  zoho_crm: {
    label: 'Zoho CRM',
    icon: '◈',
    appUrl: 'https://apps.apple.com/app/id1454212098',
    category: 'crm',
    color: '#E42527',
    aliases: ['zoho', 'crm', 'cliente']
  },
  att: {
    label: 'AT&T',
    icon: 'P',
    appUrl: 'https://apps.apple.com/app/id1081938105',
    category: 'telecom',
    color: '#0057B8',
    aliases: ['att', 'at&t', 'at and t']
  },
  mercadopago: {
    label: 'MercadoPago',
    icon: '$',
    appUrl: 'https://apps.apple.com/app/id925436649',
    category: 'pagos',
    color: '#00B1EA',
    aliases: ['mercadopago', 'mercado pago', 'mp']
  },
  zoho_mail: {
    label: 'Zoho Mail',
    icon: 'M',
    appUrl: 'https://apps.apple.com/mx/app/zoho-mail-correo-electr%C3%B3nico/id909262651',
    category: 'productividad',
    color: '#C8202F',
    aliases: ['zoho mail', 'correo', 'email', 'mail']
  }
};

// Herramienta SEPARADA · TÚ generas ligas de cobro a clientes (NO es app proveedor)
const G2C_TOOLS = {
  generador_cobros: {
    label: 'Generador de cobros',
    descripcion: 'Generar liga de pago para enviar a un cliente vencido',
    url: 'https://cobros.g2c.com.mx/admin.html',
    icon: '$',
    color: '#FF4F00'
  }
};

const APP_CATEGORIES = {
  telecom: { label: 'Telecomunicaciones', icon: 'T', color: 'var(--info)' },
  banco: { label: 'Banca', icon: 'B', color: 'var(--success)' },
  crm: { label: 'CRM', icon: '◈', color: 'var(--orange-light)' },
  pagos: { label: 'Pagos', icon: '$', color: 'var(--success)' },
  productividad: { label: 'Productividad', icon: 'M', color: 'var(--info)' }
};

// Buscar app por nombre del proveedor (matching flexible)
function findProviderApp(providerName) {
  if (!providerName) return null;
  const name = providerName.toLowerCase().trim();
  for (const [key, app] of Object.entries(PROVIDER_APPS)) {
    if (app.aliases.some(a => name.includes(a))) {
      return { key, ...app };
    }
  }
  return null;
}

// Lista todas las apps por categoría
function getAppsByCategory() {
  const grouped = {};
  Object.entries(PROVIDER_APPS).forEach(([key, app]) => {
    if (!grouped[app.category]) grouped[app.category] = [];
    grouped[app.category].push({ key, ...app });
  });
  return grouped;
}

// ============================================
// PUNTO 4 · SINCRONIZACIÓN COMPLETA al calendario
// Cualquier movimiento queda registrado · auditable
// ============================================
function syncFinanzaToCalendar(mov) {
  if (!mov.fecha) return;
  const cal = load(STORAGE.CALENDARIO, []);
  const isIngreso = mov.tipo === 'ingreso';
  const isPagoPendiente = mov.tipo === 'ingreso_pendiente';
  cal.push({
    id: uid('cal_fin'),
    title: (isIngreso ? '+ ' : isPagoPendiente ? '◇ Por cobrar · ' : '- ') + (mov.concepto || 'Movimiento'),
    date: mov.fecha,
    time: '',
    category: isIngreso ? 'ingreso' : isPagoPendiente ? 'cobro' : 'egreso',
    amount: mov.monto,
    notes: `${mov.tipo} · ${mov.categoria}`,
    sourceModule: 'finanzas',
    sourceId: mov.id,
    createdAt: Date.now()
  });
  save(STORAGE.CALENDARIO, cal);
}

// ============================================
// PUNTO 5 · INGRESO PENDIENTE → conversión a Pago Recibido
// ============================================
function addIngresoPendiente(data) {
  // data: { concepto, monto, fechaProyectada, cliente_id, categoria, notas }
  const fin = load(STORAGE.FINANZAS, []);
  const newPend = {
    id: uid('inp'),
    concepto: data.concepto,
    monto: Number(data.monto) || 0,
    fecha: data.fechaProyectada || new Date().toISOString().slice(0,10),
    fechaProyectada: data.fechaProyectada,
    tipo: 'ingreso_pendiente',
    categoria: data.categoria || 'g2c',
    cliente_id: data.cliente_id || null,
    notas: data.notas || '',
    estado: 'pendiente',
    createdAt: Date.now()
  };
  fin.push(newPend);
  save(STORAGE.FINANZAS, fin);
  syncFinanzaToCalendar(newPend);
  return newPend;
}

function convertirIngresoPendienteARecibido(ingresoId, fechaPago) {
  const fin = load(STORAGE.FINANZAS, []);
  const idx = fin.findIndex(m => m.id === ingresoId);
  if (idx < 0) return { success: false, error: 'Ingreso no encontrado' };

  // Actualizar el ingreso pendiente a recibido
  fin[idx].tipo = 'ingreso';
  fin[idx].estado = 'pagado';
  fin[idx].fechaPago = fechaPago || new Date().toISOString().slice(0,10);
  fin[idx].fecha = fin[idx].fechaPago; // fecha real del cobro
  save(STORAGE.FINANZAS, fin);

  // Actualizar el evento del calendario
  const cal = load(STORAGE.CALENDARIO, []);
  const calIdx = cal.findIndex(e => e.sourceId === ingresoId);
  if (calIdx >= 0) {
    cal[calIdx].title = '+ ' + (fin[idx].concepto || 'Cobro recibido');
    cal[calIdx].category = 'ingreso';
    cal[calIdx].date = fin[idx].fechaPago;
    save(STORAGE.CALENDARIO, cal);
  }

  // Loguear achievement
  if (typeof logAchievement === 'function') {
    logAchievement('ingreso_recibido', {
      ingresoId,
      concepto: fin[idx].concepto,
      monto: fin[idx].monto,
      fechaPago: fin[idx].fechaPago
    });
  }

  return { success: true, ingreso: fin[idx] };
}

// Listar ingresos pendientes
function getIngresosPendientes() {
  return load(STORAGE.FINANZAS, []).filter(m => m.tipo === 'ingreso_pendiente' && m.estado !== 'pagado');
}

// ============================================
// PUNTO 6 · VALIDACIÓN DE FORMULARIOS
// Helper genérico que detecta campos faltantes y muestra CLARIFY
// ============================================
function validateForm(formId, requiredFields) {
  // requiredFields: [{ id: 'srvProveedor', label: 'Proveedor', type: 'text' }, ...]
  const missing = [];
  const errors = [];

  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;

    let value = el.value;
    if (typeof value === 'string') value = value.trim();

    // Marcar visualmente · borde rojo
    el.style.borderColor = '';

    let isInvalid = false;
    if (!value || value === '' || value === '0') {
      isInvalid = true;
      missing.push(field.label);
    }
    if (field.type === 'number' && value && (isNaN(Number(value)) || Number(value) <= 0)) {
      isInvalid = true;
      errors.push(`${field.label} debe ser un número mayor a 0`);
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isInvalid = true;
      errors.push(`${field.label} no es un email válido`);
    }
    if (field.type === 'date' && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      isInvalid = true;
      errors.push(`${field.label} debe tener formato AAAA-MM-DD`);
    }

    if (isInvalid) {
      el.style.borderColor = 'var(--danger)';
      el.style.boxShadow = '0 0 0 2px rgba(230,57,70,0.15)';
      // Quitar el highlight cuando el usuario empiece a escribir
      const clearError = () => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
        el.removeEventListener('input', clearError);
        el.removeEventListener('change', clearError);
      };
      el.addEventListener('input', clearError);
      el.addEventListener('change', clearError);
    }
  });

  return { valid: missing.length === 0 && errors.length === 0, missing, errors };
}

function showFormValidationToast(result) {
  if (result.valid) return;
  const items = [...result.missing.map(m => `Falta: ${m}`), ...result.errors];
  showToast('⚠ ' + items.join(' · '), true);
}

// ============================================
// PUNTO 8 · Cross-device sync (parcial)
// Export comprimido vía URL para sincronización manual entre dispositivos
// Para sync REAL en tiempo real se requiere backend (Supabase recomendado)
// ============================================
function exportToShareableString() {
  const data = {};
  Object.keys(STORAGE).forEach(k => {
    const val = localStorage.getItem(STORAGE[k]);
    if (val) data[k] = val;
  });
  data._exportedAt = Date.now();
  data._version = '0.6.3';

  // Comprimir + base64
  const json = JSON.stringify(data);
  // Base64 simple (sin compresión real porque btoa rompe con utf-8)
  // Para producción seria, agregar pako para compresión real
  try {
    const compressed = btoa(unescape(encodeURIComponent(json)));
    return compressed;
  } catch (e) {
    return null;
  }
}

function importFromShareableString(str) {
  try {
    const json = decodeURIComponent(escape(atob(str)));
    const data = JSON.parse(json);
    Object.keys(STORAGE).forEach(k => {
      if (data[k]) localStorage.setItem(STORAGE[k], data[k]);
    });
    return { success: true, importedAt: data._exportedAt, version: data._version };
  } catch (e) {
    return { success: false, error: e.message };
  }
}


// (modal handler removido v0.7.7)

// ============================================
// v0.7.5 · SYNC OBJETIVO 12 CUENTAS
// ============================================
function syncObjetivoCuentas() {
  const objs = load(STORAGE.OBJETIVOS, []);
  const clientes = load(STORAGE.CLIENTES, []);
  const activosG2C = clientes.filter(c => c.status === 'activo' && c.linea === 'g2c').length;
  let obj = objs.find(o => o.titulo && o.titulo.toLowerCase().includes('12 cuentas') && o.categoria === 'g2c');
  if (!obj) {
    obj = {
      id: uid('obj'),
      titulo: 'Cerrar 12 cuentas G2C 2026',
      descripcion: 'Meta anual de cierre de cuentas activas',
      categoria: 'g2c',
      deadline: '2026-12-31',
      kpis: [],
      porQueMimporta: 'Llegar a $192K MRR · escalar G2C',
      progreso: 0,
      completed: false,
      createdAt: Date.now()
    };
    objs.push(obj);
  }
  const idx = objs.findIndex(o => o.id === obj.id);
  if (idx >= 0) {
    objs[idx].progreso = Math.min(100, Math.round((activosG2C / 12) * 100));
    objs[idx].cuentasActuales = activosG2C;
    objs[idx].cuentasMeta = 12;
    objs[idx].completed = activosG2C >= 12;
    save(STORAGE.OBJETIVOS, objs);
  }
  return objs[idx];
}

// ============================================
// v0.7.5 · LOG DE DECISIONES
// ============================================
function logDecision(decision) {
  const log = load('alan_mando_decisiones', []);
  const item = {
    id: uid('dec'),
    timestamp: Date.now(),
    fecha: new Date().toISOString().slice(0,10),
    hora: new Date().toTimeString().slice(0,5),
    ...decision
  };
  log.unshift(item);
  if (log.length > 500) log.length = 500;
  save('alan_mando_decisiones', log);
  if (decision.impactoMRR && Math.abs(decision.impactoMRR) >= 10000) {
    if (typeof showToast === 'function') {
      const sign = decision.impactoMRR > 0 ? '+' : '';
      showToast('Decision critica · ' + decision.titulo + ' · ' + sign + '$' + decision.impactoMRR.toLocaleString('es-MX') + ' MRR', false);
    }
  }
  return item;
}
function getDecisionesUltimos30dias() {
  const log = load('alan_mando_decisiones', []);
  const cutoff = Date.now() - (30 * 86400000);
  return log.filter(d => d.timestamp >= cutoff);
}
function getDecisionesStats() {
  const dec = getDecisionesUltimos30dias();
  return {
    total: dec.length,
    impactoMRR: dec.reduce((s,d) => s + (Number(d.impactoMRR) || 0), 0),
    impactoLTV: dec.reduce((s,d) => s + (Number(d.impactoLTV) || 0), 0),
    porTipo: dec.reduce((acc, d) => { acc[d.tipo] = (acc[d.tipo] || 0) + 1; return acc; }, {})
  };
}

// ============================================
// v0.7.5 · ALERTAS CRITICAS
// ============================================
function checkAlertasCriticas() {
  const today = new Date(); today.setHours(0,0,0,0);
  const cal = load(STORAGE.CALENDARIO, []);
  const alertas = [];
  cal.forEach(e => {
    if (e.category !== 'cobro' || e.cobrado) return;
    const fecha = new Date(e.date + 'T12:00:00');
    const diasVenc = (today - fecha) / 86400000;
    if (diasVenc > 7) {
      alertas.push({ tipo: 'cobro_vencido_grave', titulo: e.title, dias: Math.floor(diasVenc), monto: e.amount });
    }
  });
  const objs = load(STORAGE.OBJETIVOS, []);
  objs.filter(o => !o.completed).forEach(o => {
    if (!o.createdAt) return;
    const dias = (Date.now() - o.createdAt) / 86400000;
    if (dias > 30 && (!o.progreso || o.progreso < 10)) {
      alertas.push({ tipo: 'objetivo_estancado', titulo: o.titulo, dias: Math.floor(dias), progreso: o.progreso || 0 });
    }
  });
  return alertas;
}

function renderAlertasCriticasBanner() {
  const alertas = checkAlertasCriticas();
  const existing = document.getElementById('alertasCriticasBanner');
  if (existing) existing.remove();
  if (!alertas || alertas.length === 0) return;
  const banner = document.createElement('div');
  banner.id = 'alertasCriticasBanner';
  banner.style.cssText = 'position:fixed;top:8px;left:8px;right:8px;z-index:99997;background:linear-gradient(135deg,rgba(230,57,70,0.95),rgba(255,79,0,0.85));border:1px solid rgba(230,57,70,0.6);border-radius:10px;padding:10px 14px;box-shadow:0 6px 20px rgba(230,57,70,0.4);cursor:pointer;font-family:var(--mono),monospace;';
  const cobrosVenc = alertas.filter(a => a.tipo === 'cobro_vencido_grave');
  const objsEst = alertas.filter(a => a.tipo === 'objetivo_estancado');
  let texto = '';
  if (cobrosVenc.length > 0) {
    texto = cobrosVenc.length + ' cobro' + (cobrosVenc.length > 1 ? 's' : '') + ' vencido' + (cobrosVenc.length > 1 ? 's' : '') + ' > 7 dias';
  } else if (objsEst.length > 0) {
    texto = objsEst.length + ' objetivo' + (objsEst.length > 1 ? 's' : '') + ' estancado' + (objsEst.length > 1 ? 's' : '');
  }
  banner.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;color:#fff;font-size:11px;letter-spacing:0.05em;"><div><span style="font-size:13px;margin-right:6px;">!</span><strong>ALERTA · ' + texto + '</strong></div><span style="font-size:18px;opacity:0.6;">></span></div>';
  banner.onclick = function() {
    if (cobrosVenc.length > 0) window.location.href = 'finanzas.html?tab=clientes';
    else window.location.href = 'index.html';
  };
  document.body.appendChild(banner);
  setTimeout(() => { if (banner.parentNode) { banner.style.transition = 'opacity 0.5s'; banner.style.opacity = '0.4'; } }, 6000);
}

(function autoCheckAlertas() {
  function check() {
    if (typeof renderAlertasCriticasBanner === 'function') {
      try { renderAlertasCriticasBanner(); } catch(e) {}
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(check, 800));
  } else {
    setTimeout(check, 800);
  }
})();

// ============================================
// v0.7.5 · TEST RUNNER · runSystemTests() en consola
// ============================================
function runSystemTests() {
  console.log('%c=== G2C MANDO · SYSTEM TESTS ===', 'color:#FF4F00;font-size:14px;font-weight:bold');
  let passed = 0, failed = 0;
  const tests = [];
  function test(name, fn) {
    try {
      const result = fn();
      if (result === false) throw new Error('returned false');
      tests.push({ name, status: 'PASS' });
      console.log('%c[PASS] ' + name, 'color:#00C896');
      passed++;
    } catch (e) {
      tests.push({ name, status: 'FAIL', error: e.message });
      console.log('%c[FAIL] ' + name + ' · ' + e.message, 'color:#E63946');
      failed++;
    }
  }
  const clientesAntes = (load(STORAGE.CLIENTES, []) || []).length;
  const cobrosAntes = (load(STORAGE.CALENDARIO, []) || []).filter(e => e.category === 'cobro').length;
  test('Agregar cliente test', () => {
    executeTool({
      action: 'add_cliente',
      module: 'cliente',
      data: {
        nombre: 'TEST_CLIENTE_' + Date.now(),
        linea: 'g2c', plan: 'Plan Total', monto: 16000,
        frecuencia: 'mensual', diaCobro: 15,
        fechaInicio: new Date().toISOString().slice(0,10),
        duracion: 12, numeroContrato: 'TEST-001',
        notas: 'Test', status: 'activo'
      }
    });
    const after = (load(STORAGE.CLIENTES, []) || []).length;
    if (after !== clientesAntes + 1) throw new Error('Cliente no se guardo');
    return true;
  });
  test('12 cobros agendados al calendario', () => {
    const cobrosDespues = (load(STORAGE.CALENDARIO, []) || []).filter(e => e.category === 'cobro').length;
    if (cobrosDespues < cobrosAntes + 12) throw new Error('Solo se crearon ' + (cobrosDespues - cobrosAntes) + '/12');
    return true;
  });
  test('Achievement cliente_ganado registrado', () => {
    const ach = load(STORAGE.ACHIEVEMENTS, []);
    if (!ach[0] || ach[0].type !== 'cliente_ganado') throw new Error('No registro achievement');
    return true;
  });
  test('Decision logged', () => {
    const dec = load('alan_mando_decisiones', []);
    if (!dec[0] || dec[0].tipo !== 'cliente_ganado') throw new Error('No registro decision');
    if (Number(dec[0].impactoMRR) !== 16000) throw new Error('MRR incorrecto: ' + dec[0].impactoMRR);
    return true;
  });
  // Cleanup
  const clientes = load(STORAGE.CLIENTES, []);
  const testCli = clientes.find(c => c.nombre && c.nombre.startsWith('TEST_CLIENTE_'));
  if (testCli) {
    executeTool({ action: 'delete_cliente', module: 'cliente', data: { id: testCli.id } });
    console.log('%c[CLEANUP] Test cliente eliminado', 'color:#888');
  }
  console.log('%c=== ' + passed + '/' + (passed + failed) + ' tests passed ===', 'color:' + (failed === 0 ? '#00C896' : '#E63946') + ';font-size:13px;font-weight:bold');
  return { passed, failed, tests };
}
if (typeof window !== 'undefined') window.runSystemTests = runSystemTests;
