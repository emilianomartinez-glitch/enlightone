const dashboardItems = $('Leer Dashboard').all();
const desviacionesItems = $('Leer Desviaciones').all();
const dashboard = dashboardItems.map(i => i.json);
const desviacionesRaw = desviacionesItems.map(i => i.json);
const today = new Date();
today.setHours(0, 0, 0, 0);
const fpRaw = $('Fecha pronóstico').first().json;
const fechaCortePronostico = Object.keys(fpRaw).find(k => k !== 'row_number') || null;

// ─── UTILIDADES ──────────────────────────────────────────────────

function parseDate(val) {
  if (!val || val === '' || val === 'null' || val === 'None') return null;
  const s = String(val).trim();
  
  // Handle DD/MM/YYYY or D/M/YYYY format (Google Sheets español)
  const slashParts = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashParts) {
    const day = parseInt(slashParts[1], 10);
    const month = parseInt(slashParts[2], 10) - 1;
    const year = parseInt(slashParts[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(val) {
  const d = parseDate(val);
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysDiff(d1, d2) {
  if (!d1 || !d2) return null;
  const a = parseDate(d1);
  const b = parseDate(d2);
  if (!a || !b) return null;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ─── NUEVA LÓGICA DE ESTATUS ─────────────────────────────────────
// Referencia = tentativa si existe, si no prevista
// Modificada = fecha de cumplimiento real (la que el PM registra)
//
// Sin modificada:
//   - Sin referencia → null (no evaluable)
//   - Referencia ya pasó → Atrasado
//   - Referencia no ha llegado → Pendiente
//
// Con modificada:
//   - Modificada ≤ referencia → Cumplido a tiempo
//   - Modificada > referencia → Cumplido con retraso

function calcEstatus(fechaPrevista, fechaTentativa, fechaModificada) {
  const fp = parseDate(fechaPrevista);
  const ft = parseDate(fechaTentativa);
  const fm = parseDate(fechaModificada);

  // Referencia: tentativa si existe, si no prevista
  const ref = ft || fp;
  if (!ref) return null; // Sin ninguna fecha de referencia → no evaluable

  if (!fm) {
    // No se ha cumplido → comparar referencia contra hoy
    return ref < today ? 'Atrasado' : 'Pendiente';
  }

  // Se cumplió → comparar modificada contra referencia
  return fm <= ref ? 'Cumplido a tiempo' : 'Cumplido con retraso';
}

// ─── LIMPIEZA DE DATOS SUCIOS ────────────────────────────────────

const DIRTY_VALUES = [
  'No encontrado',
  'No encontrado en STO',
  'No existe KAM en scoop',
  'No encontrado en FV',
  'Reintentando...',
  'No localizado',
  'None',
  'null',
  'undefined',
  '#REF!',
  '#N/A',
  '#VALUE!',
  'N/A',
];

const ENTIDAD_MAP = {
  'State of Mexico': 'Estado de México',
  'Estado de Mexico': 'Estado de México',
  'San Luis Potosi': 'San Luis Potosí',
  'Queretaro': 'Querétaro',
  'Nuevo Leon': 'Nuevo León',
  'Yucatan': 'Yucatán',
  'Mexico City': 'CDMX',
  'Ciudad de Mexico': 'CDMX',
  'Ciudad de México': 'CDMX',
};

function clean(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (DIRTY_VALUES.includes(s) || s === '') return '';
  return s;
}

function cleanEntidad(val) {
  const s = clean(val);
  if (!s) return '';
  return ENTIDAD_MAP[s] || s;
}

function cleanNum(val) {
  if (val === null || val === undefined || val === '') return '';
  const s = clean(val);
  if (!s) return '';
  const n = parseFloat(s);
  return isNaN(n) ? '' : String(n);
}

// Distingue "sin dato" (null) de un 0 legítimo — parseFloat(x) || 0 los mezclaba
function numOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ─── DEFINICIÓN DE HITOS ─────────────────────────────────────────

const HITOS = [
  {
    nombre: 'Entrega Ingenierías',
    prevista: 'Fecha prevista entrega ingenierías',
    tentativa: 'Fecha tentativa entrega ingenierías',
    modificada: 'Fecha modificada entrega ingenierías',
    real: 'Fecha entrega ingenierías',
    desvNombre: 'Entrega Ingenierías'
  },{
    nombre: 'Aprobación de Componentes Críticos',
    prevista: 'Fecha prevista aprobación de componentes críticos',
    tentativa: 'Fecha tentativa aprobación de componentes críticos',
    modificada: 'Fecha modificada aprobación de componentes críticos',
    real: 'Fecha aprobación de componentes críticos',
    desvNombre: 'Aprobación Componentes Críticos'
  },
  {
    nombre: 'Ingeniería Aprobada por el Cliente',
    prevista: 'Fecha prevista aprobación de ingeniería por el cliente',
    tentativa: 'Fecha tentativa ingeniería aprobada por el cliente',
    modificada: 'Fecha modificada ingeniería aprobada por el cliente',
    real: 'Fecha ingeniería aprobada por el cliente',
    desvNombre: 'Aprobación Ingeniería Cliente'
  },
  {
    nombre: 'Comité de Márgenes',
    prevista: 'Fecha prevista Comité de Márgenes Aprobado',
    tentativa: 'Fecha tentativa Comité de Márgenes Aprobado',
    modificada: 'Fecha modificada Comité de Márgenes Aprobado',
    real: 'Fecha Comité de Márgenes Aprobado',
    desvNombre: 'Comité de Márgenes'
  },
  {
    nombre: 'Compra de Materiales',
    prevista: 'Fecha prevista Compra de Materiales',
    tentativa: 'Fecha tentativa Compra de Materiales',
    modificada: 'Fecha modificada Compra de Materiales',
    real: 'Fecha Compra de Materiales',
    desvNombre: 'Compra de Materiales'
  },
  {
    nombre: 'Inicio de Instalación',
    prevista: 'Fecha prevista Inicio de Instalación',
    tentativa: 'Fecha tentativa Inicio de Instalación',
    modificada: 'Fecha modificada Inicio de Instalación',
    real: 'Fecha Inicio de Instalación',
    desvNombre: 'Inicio de Instalación'
  },
  {
    nombre: 'Commissioning',
    prevista: 'Fecha prevista Commissioning',
    tentativa: 'Fecha tentativa Commissioning',
    modificada: 'Fecha modificada Commissioning',
    real: 'Fecha Commissioning',
    desvNombre: 'Commissioning'
  },
  {
    nombre: 'Visita Calidad a Sitio',
    prevista: 'Fecha prevista Visita calidad a sitio',
    tentativa: 'Fecha tentativa Visita calidad a sitio',
    modificada: 'Fecha modificada Visita calidad a sitio',
    real: 'Fecha Visita calidad a sitio',
    desvNombre: 'Visita Calidad a Sitio'
  },
  {
    nombre: 'Entrega al Cliente',
    prevista: 'Fecha prevista Entrega al cliente',
    tentativa: 'Fecha tentativa Entrega al cliente',
    modificada: 'Fecha modificada Entrega al cliente',
    real: 'Fecha Entrega al cliente',
    desvNombre: 'Entrega al Cliente'
  },
  {
    nombre: 'Pase a Servicios/liberación de sitio',
    prevista: 'Fecha prevista Pase a Servicios/liberación de sitio',
    tentativa: 'Fecha tentativa Pase a Servicios/liberación de sitio',
    modificada: 'Fecha modificada Pase a Servicios/liberación de sitio',
    real: 'Fecha Pase a Servicios/liberación de sitio',
    desvNombre: 'Pase a Servicios'
  },
  {
    nombre: 'Pase a Gestión',
    prevista: 'Fecha prevista Pase a Gestión',
    tentativa: 'Fecha tentativa Pase a Gestión',
    // El header del sheet tiene el typo "Pase a Pase a"; modificadaAlt cubre el nombre correcto
    // por si algún día se corrige el header sin tocar este código
    modificada: 'Fecha modificada Pase a Pase a Gestión',
    modificadaAlt: 'Fecha modificada Pase a Gestión',
    real: 'Fecha Pase a Gestión',
    desvNombre: 'Pase a Gestión'
  },
  {
    nombre: 'Cierre Presupuestal',
    prevista: 'Fecha prevista Cierre Presupuestal',
    tentativa: 'Fecha tentativa Cierre Presupuestal',
    modificada: 'Fecha modificada Cierre Presupuestal',
    real: 'Fecha Cierre Presupuestal',
    desvNombre: 'Cierre Presupuestal'
  },
  {
    nombre: 'Interconexión',
    prevista: 'Fecha prevista Interconexión',
    tentativa: 'Fecha tentativa Interconexión',
    modificada: 'Fecha modificada Interconexión',
    real: 'Fecha Interconexión',
    desvNombre: 'Interconexión'
  }
];

// Mapeo inverso: nombre en Desviaciones → nombre display
const DESV_TO_HITO = {};
HITOS.forEach(h => { DESV_TO_HITO[h.desvNombre] = h.nombre; });

// Mapeo nombre en Desviaciones → definición completa del hito (para localizar su col. modificada)
const DESV_TO_HITODEF = {};
HITOS.forEach(h => { DESV_TO_HITODEF[h.desvNombre] = h; });

// Lee la fecha modificada de un hito tolerando el header con typo y el corregido
function getModificada(row, h) {
  if (!row || !h) return undefined;
  return row[h.modificada] !== undefined ? row[h.modificada] : (h.modificadaAlt ? row[h.modificadaAlt] : undefined);
}

// Índice Dashboard por PROJ (trim para tolerar espacios accidentales en el sheet)
const dashByProj = new Map(dashboard.map(r => [String(r['PROJ'] || '').trim(), r]));

// ─── PROCESAR PROYECTOS ──────────────────────────────────────────

const proyectos = dashboard.map(row => {
  const hitos = HITOS.map(h => {
    const modVal = getModificada(row, h);
    const estatus = calcEstatus(row[h.prevista], row[h.tentativa], modVal);
    const fp = formatDate(row[h.prevista]);
    const ft = formatDate(row[h.tentativa]);
    const fm = formatDate(modVal);
    const ref = ft || fp; // Referencia usada para el cálculo

    // Calcular días de desviación contra la referencia
    let diasDesviacion = null;
    if (ref && fm) {
      diasDesviacion = daysDiff(ref, fm);
    } else if (ref && !fm && estatus === 'Atrasado') {
      // Hoy en horario local — toISOString() daría UTC y podría correr un día
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      diasDesviacion = daysDiff(ref, todayStr);
    }

    return {
      nombre: h.nombre,
      estatus,
      fechaPlan: fp,
      fechaTentativa: ft,
      fechaModificada: fm,
      fechaReferencia: ref,
      diasDesviacion
    };
  });

  const hitosConEstatus = hitos.filter(h => h.estatus !== null);
  const atrasados = hitos.filter(h => h.estatus === 'Atrasado').length;
  const pendientes = hitos.filter(h => h.estatus === 'Pendiente').length;
  const conRetraso = hitos.filter(h => h.estatus === 'Cumplido con retraso').length;
  const aTiempo = hitos.filter(h => h.estatus === 'Cumplido a tiempo').length;

  // Fecha fin plan = última fecha prevista no nula
  let fechaFinPlan = null;
  for (let i = HITOS.length - 1; i >= 0; i--) {
    const fp = formatDate(row[HITOS[i].prevista]);
    if (fp) { fechaFinPlan = fp; break; }
  }

  return {
    proj:             clean(row['PROJ']),
    sitio:            clean(row['Sitio']),
    cuenta:           clean(row['Cuenta']),
    pm:               clean(row['Project Manager']),
    tipo:             clean(row['Tipo de proyecto']),
    tecnologia:       clean(row['Tecnología']),
    kam:              clean(row['KAM']),
    supervisor:       clean(row['Supervisor']),
    potenciaFV:       cleanNum(row['Potencia FV (kWp)']),
    potenciaSTO:      cleanNum(row['Potencia STO (kW)']),
    capacidadSTO:     cleanNum(row['Capacidad STO (kWh)']),
    faseActual:       clean(row['Fase Actual']),
    pctObra:          row['% de Obra'] || '',
    pctProyecto:      row['% de Proyecto'] || '',
    entidadFed:       cleanEntidad(row['Entidad Federativa']),
    tipoProv:         clean(row['Tipo de proveeduría']),
    estatusAdO:       clean(row['Estatus AdO']),

    // ── CAMPOS NUEVOS ──
    subcontratista:       clean(row['Servicio Instalación SFV']),
    servInstalacionSAE:   clean(row['Servicio Instalación SAE']),
    servObraCivil:        clean(row['Servicio Obra Civil']),
    fechaInicioProyecto:  formatDate(row['Pase a operaciones (Estatuto)']),
    fechaFinPlan:         fechaFinPlan,
    tipoInstalacion:      clean(row['Tipo de instalación']),
    categoria:            clean(row['Categoría']),
    semanasEsperadas:     row['Semanas Esperadas'] || '',
    semanasReales:        row['Semanas Reales'] || '',
    lat:                  cleanNum(row['Latitud']),
    lng:                  cleanNum(row['Longitud']),

    hitos,
    conteos: { atrasados, pendientes, conRetraso, aTiempo, total: hitosConEstatus.length }
  };
});

// ─── PROCESAR DESVIACIONES (array completo) ──────────────────────

const desviacionesArr = desviacionesRaw
  .filter(d => d['PROJ'] && d['Hito'])
  .map(d => {
    const hitoName = clean(d['Hito']);
    // Cerrada = el hito ya tiene fecha modificada en Dashboard.
    // Las filas abiertas traen "Fecha Real" = hoy (cascada del sheet) y su desviación crece a diario,
    // así que hay que separarlas de las desviaciones reales ya consumadas.
    const dashRow = dashByProj.get(clean(d['PROJ']));
    const cerrada = !!parseDate(getModificada(dashRow, DESV_TO_HITODEF[hitoName]));

    return {
    proj:               clean(d['PROJ']),
    sitio:              clean(d['Sitio']),
    cuenta:             clean(d['Cuenta']),
    pm:                 clean(d['Project Manager']),
    tipo:               clean(d['Tipo de Proyecto']),
    tipoInstalacion:    clean(d['Tipo Instalación']),
    kam:                clean(d['KAM']),
    supervisor:         clean(d['Supervisor']),
    tipoProv:           clean(d['Tipo Proveeduría']),
    servInstalacionSFV: clean(d['Serv. Inst. SFV']),
    servInstalacionSAE: clean(d['Serv. Inst. SAE']),
    servObraCivil:      clean(d['Serv. Obra Civil']),
    cierreComercial:    formatDate(d['Cierre Comercial']),
    paseOperaciones:    formatDate(d['Pase a Operaciones']),
    semanasEsperadas:   parseFloat(d['Semanas Esperadas']) || null,
    semanasReales:      parseFloat(d['Semanas Reales']) || null,
    hito:               hitoName,
    hitoNombreDisplay:  DESV_TO_HITO[hitoName] || hitoName,
    fechaPrevista:      formatDate(d['Fecha Prevista']),
    fechaReal:          formatDate(d['Fecha Real']),
    diasDesviacion:     numOrNull(d['Días Desviación']),
    semanasDesviacion:  numOrNull(d['Semanas Desviación']),
    tipoDesviacion:     clean(d['Tipo Desviación']),
    comentariosRetraso: clean(d['Comentarios de Retraso']),
    areaResponsable:    clean(d['Área responsable']),
    diasOnHold:         parseFloat(d['Días On Hold Aplicables']) || 0,
    desviacionNeta:     numOrNull(d['Desviación Neta (sin OH)']),
    cerrada,
    };
  });

// ─── KPIs ────────────────────────────────────────────────────────

const kpis = {
  totalProyectos:    proyectos.length,
  totalCuentas:      [...new Set(proyectos.map(p => p.cuenta).filter(Boolean))].length,
  totalAtrasados:    proyectos.reduce((s, p) => s + p.conteos.atrasados, 0),
  totalPendientes:   proyectos.reduce((s, p) => s + p.conteos.pendientes, 0),
  totalConRetraso:   proyectos.reduce((s, p) => s + p.conteos.conRetraso, 0),
  totalATiempo:      proyectos.reduce((s, p) => s + p.conteos.aTiempo, 0),
  potenciaFVTotal:   proyectos.reduce((s, p) => s + (parseFloat(p.potenciaFV) || 0), 0).toFixed(1),
  potenciaSTOTotal:  proyectos.reduce((s, p) => s + (parseFloat(p.potenciaSTO) || 0), 0).toFixed(1),
  capacidadSTOTotal: proyectos.reduce((s, p) => s + (parseFloat(p.capacidadSTO) || 0), 0).toFixed(1),
  sinFechas:         proyectos.filter(p => p.conteos.total === 0).length,
};

// ─── POR HITO ────────────────────────────────────────────────────

const porHito = HITOS.map(h => {
  const rows = proyectos.map(p => p.hitos.find(x => x.nombre === h.nombre)?.estatus).filter(Boolean);
  return {
    hito: h.nombre,
    atrasado:   rows.filter(s => s === 'Atrasado').length,
    pendiente:  rows.filter(s => s === 'Pendiente').length,
    conRetraso: rows.filter(s => s === 'Cumplido con retraso').length,
    aTiempo:    rows.filter(s => s === 'Cumplido a tiempo').length,
    total:      rows.length
  };
});

// ─── PROYECTO CRÍTICO ────────────────────────────────────────────

const proyectoCritico = [...proyectos]
  .sort((a, b) => b.conteos.atrasados - a.conteos.atrasados)[0] || null;

// ─── PROMEDIO DESVIACIÓN POR HITO ────────────────────────────────

// Solo hitos cerrados: las filas abiertas miden contra hoy y crecerían a diario
function promedioPorHito(rows, campo) {
  const acc = {};
  rows.forEach(d => {
    const dias = d[campo];
    if (!d.hito || !Number.isFinite(dias)) return;
    if (!acc[d.hito]) acc[d.hito] = { suma: 0, count: 0 };
    acc[d.hito].suma += dias;
    acc[d.hito].count += 1;
  });
  return Object.entries(acc)
    .map(([hito, d]) => ({
      hito,
      hitoNombreDisplay: DESV_TO_HITO[hito] || hito,
      promedioDias: +(d.suma / d.count).toFixed(1),
      totalMuestras: d.count
    }))
    .sort((a, b) => b.promedioDias - a.promedioDias);
}

const desvCerradas = desviacionesArr.filter(d => d.cerrada);
const desvAbiertas = desviacionesArr.filter(d => !d.cerrada);

const promedioDesviacion = promedioPorHito(desvCerradas, 'diasDesviacion');
const promedioDesviacionAbierta = promedioPorHito(desvAbiertas, 'diasDesviacion');

  // ─── PROMEDIO DESVIACIÓN NETA POR HITO ───────────────────────

const promedioDesviacionNeta = promedioPorHito(desvCerradas, 'desviacionNeta');

// ─── RENDIMIENTO POR SUBCONTRATISTA ─────────────────────────────

const subContData = {};
proyectos.forEach(p => {
  const sub = p.subcontratista;
  if (!sub) return;
  if (!subContData[sub]) subContData[sub] = { proyectos: 0, aTiempo: 0, conRetraso: 0, atrasados: 0, total: 0 };
  subContData[sub].proyectos++;
  subContData[sub].aTiempo += p.conteos.aTiempo;
  subContData[sub].conRetraso += p.conteos.conRetraso;
  subContData[sub].atrasados += p.conteos.atrasados;
  subContData[sub].total += p.conteos.total;
});

const rendimientoSubcontratista = Object.entries(subContData)
  .filter(([, s]) => s.total > 0)
  .map(([nombre, s]) => ({
    nombre,
    proyectos: s.proyectos,
    aTiempo: s.aTiempo,
    conRetraso: s.conRetraso,
    atrasados: s.atrasados,
    totalHitos: s.total,
    pctATiempo: +((s.aTiempo / s.total) * 100).toFixed(1)
  }))
  .sort((a, b) => b.totalHitos - a.totalHitos);

// ─── FILTROS ─────────────────────────────────────────────────────

const filtros = {
  projs:         [...new Set(proyectos.map(p => p.proj).filter(Boolean))].sort(),
  sitios:        [...new Set(proyectos.map(p => p.sitio).filter(Boolean))].sort(),
  pms:           [...new Set(proyectos.map(p => p.pm).filter(Boolean))].sort(),
  cuentas:       [...new Set(proyectos.map(p => p.cuenta).filter(Boolean))].sort(),
  tipos:         [...new Set(proyectos.map(p => p.tipo).filter(Boolean))].sort(),
  fases:         [...new Set(proyectos.map(p => p.faseActual).filter(Boolean))].sort(),
  supervisores:  [...new Set(proyectos.map(p => p.supervisor).filter(Boolean))].sort(),
  entidades:     [...new Set(proyectos.map(p => p.entidadFed).filter(Boolean))].sort(),
  tecnologias:   [...new Set(proyectos.map(p => p.tecnologia).filter(Boolean))].sort(),
  proveedurias:  [...new Set(proyectos.map(p => p.tipoProv).filter(Boolean))].sort(),
  kams:          [...new Set(proyectos.map(p => p.kam).filter(Boolean))].sort(),
  estatusAdO:    [...new Set(proyectos.map(p => p.estatusAdO).filter(Boolean))].sort(),

};

// ─── LEER DATOS DE PRONÓSTICOS ───────────────────────────────────
 
const pronosticosItems = $('Leer Pronósticos').all();
const pronosticosRaw = pronosticosItems.map(i => i.json);
 
// ─── PARSEO DE FECHAS DD/MM/YYYY ────────────────────────────────
 
function parseDateDMY(val) {
  if (!val || val === '' || val === 'null' || val === 'None') return null;
  const s = String(val).trim();
  // Google Sheets español: DD/MM/YYYY o D/M/YYYY
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const d = new Date(+year, +month - 1, +day);
    return isNaN(d.getTime()) ? null : d;
  }
  // Fallback ISO
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}
 
function fmtDate(val) {
  const d = parseDateDMY(val);
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
 
// ─── DEFINICIÓN DE FASES PARA EL GANTT ──────────────────────────
 
const FASES_GANTT = [
  {
    id: 'comercial',
    nombre: 'Comercial',
    color: '#828080',
    inicioKey: null,  // No hay fecha de Cierre Comercial en Pronósticos
    finKey: 'Fecha Pase a Operaciones',
    hitos: ['Pase a Operaciones']
  },
  {
    id: 'ingenieria',
    nombre: 'Ingeniería',
    color: '#3D7D80',
    inicioKey: 'Fecha Apb Comp Críticos',
    finKey: 'Fecha Apb Cliente',
    hitos: ['Apb Comp Críticos', 'Entrega Ingenierías', 'Apb Cliente']
  },
  {
    id: 'proveeduria',
    nombre: 'Proveeduría',
    color: '#4c9fff',
    inicioKey: 'Fecha Comité Márgenes',
    finKey: 'Fecha Compra Materiales',
    hitos: ['Comité Márgenes', 'Compra Materiales']
  },
  {
    id: 'instalacion',
    nombre: 'Instalación',
    color: '#00AA85',
    inicioKey: 'Fecha Inicio Instalación',
    finKey: 'Fecha Commissioning',
    hitos: ['Inicio Instalación', 'Commissioning']
  },
  {
    id: 'liberacion',
    nombre: 'Liberación',
    color: '#9f7aff',
    inicioKey: 'Fecha Visita Calidad',
    finKey: 'Fecha Entrega Cliente',
    hitos: ['Visita Calidad', 'Entrega Cliente']
  },
  {
    id: 'cierre',
    nombre: 'Cierre',
    color: '#ff9f43',
    inicioKey: 'Fecha Pase Servicios',
    finKey: 'Fecha Cierre Presupuestal',
    hitos: ['Pase Servicios', 'Pase Gestión', 'Cierre Presupuestal']
  }
];
 
// ─── MAPEO DE HITOS PARA PLAN (PREVISTA) vs ACTUAL ──────────────
// Para la línea gris (plan), necesitamos las fechas previstas de Dashboard
// Para la línea de color (actual), usamos las fechas de Pronósticos (cascada)
 
const HITOS_PREVISTA_MAP = {
  'Pase a Operaciones': 'Pase a operaciones (Estatuto)',
  'Apb Comp Críticos': 'Fecha tentativa aprobación de componentes críticos',
  'Entrega Ingenierías': 'Fecha tentativa entrega ingenierías',
  'Apb Cliente': 'Fecha tentativa ingeniería aprobada por el cliente',
  'Comité Márgenes': 'Fecha tentativa Comité de Márgenes Aprobado',
  'Compra Materiales': 'Fecha tentativa Compra de Materiales',
  'Inicio Instalación': 'Fecha tentativa Inicio de Instalación',
  'Commissioning': 'Fecha tentativa Commissioning',
  'Visita Calidad': 'Fecha tentativa Visita calidad a sitio',
  'Entrega Cliente': 'Fecha tentativa Entrega al cliente',
  'Pase Servicios': 'Fecha tentativa Pase a Servicios/liberación de sitio',
  'Pase Gestión': 'Fecha tentativa Pase a Gestión',
  'Cierre Presupuestal': 'Fecha tentativa Cierre Presupuestal',
};
 
// ─── PROCESAR CADA PROYECTO ─────────────────────────────────────
 
const pronosticos = pronosticosRaw
  .filter(row => row['PROJ'] && row['PROJ'] !== '')
  .map(row => {
    const proj = row['PROJ'];
 
    // Buscar datos de Dashboard para las fechas previstas (plan original)
    const dashRow = dashByProj.get(String(proj).trim());
 
    // ── Construir fases para el Gantt ──
    const fases = FASES_GANTT.map(fase => {
      // Fechas ACTUALES (de Pronósticos — cascada Real>Mod>Tent>Prev);
    const fechaInicio = fase.inicioKey ? fmtDate(row[fase.inicioKey]) : fmtDate(row[fase.finKey]);
      const fechaFin = fmtDate(row[fase.finKey]);
 
      // Fechas PLAN (previstas originales de Dashboard)
      let planInicio = null;
      let planFin = null;
      if (dashRow) {
        const inicioHito = fase.hitos[0];
        const finHito = fase.hitos[fase.hitos.length - 1];
        const prevInicioCol = HITOS_PREVISTA_MAP[inicioHito];
        const prevFinCol = HITOS_PREVISTA_MAP[finHito];
        if (prevInicioCol) planInicio = fmtDate(dashRow[prevInicioCol]);
        if (prevFinCol) planFin = fmtDate(dashRow[prevFinCol]);
      }
 
      // Determinar estatus de la fase (basado en el último hito de la fase)
      const finHitoName = fase.hitos[fase.hitos.length - 1];
      const estatusFin = row[`Estatus ${finHitoName}`] || '';
      // Si el primer hito no tiene fecha, toda la fase está sin fecha
      const inicioHitoName = fase.hitos[0];
      const estatusInicio = row[`Estatus ${inicioHitoName}`] || '';
 
      let estatus = 'pendiente';
      if (estatusInicio === 'Sin fecha' || !fechaInicio) {
        estatus = 'sinfecha';
      } else if (estatusFin === 'Cumplido') {
        estatus = 'cumplido';
      } else if (estatusFin === 'Cumplido futuro') {
        estatus = 'pronostico';
      } else if (estatusFin === 'Pronóstico') {
        estatus = 'pronostico';
      } else if (estatusInicio === 'Cumplido' && (estatusFin === 'Pendiente' || estatusFin === 'En progreso')) {
        estatus = 'progreso';
      }
 
      // Para Instalación: calcular % de avance
      let progresoPct = null;
      if (fase.id === 'instalacion') {
        const semanasEsp = parseFloat(row['Semanas esperadas']) || 0;
        const semanaAct = parseFloat(row['Semana actual']) || 0;
        if (semanasEsp > 0) {
          progresoPct = Math.min(+(semanaAct / semanasEsp).toFixed(2), 1);
        }
      }
 
      return {
        id: fase.id,
        nombre: fase.nombre,
        color: fase.color,
        fechaInicio,
        fechaFin,
        planInicio,
        planFin,
        estatus,
        progresoPct,
      };
    });
 
    // ── Interconexión como marcador independiente ──
    const interconexion = {
      check: row['Check Interconexión'] === true || row['Check Interconexión'] === 'TRUE',
      fechaPrevista: dashRow ? fmtDate(dashRow['Fecha prevista Interconexión']) : null,
      fechaActual: dashRow ? fmtDate(
        dashRow['Fecha Interconexión'] ||
        dashRow['Fecha modificada Interconexión'] ||
        dashRow['Fecha tentativa Interconexión'] ||
        dashRow['Fecha prevista Interconexión']
      ) : null,
    };
 
    // ── Hitos individuales (para tooltip) ──
    const HITO_KEYS = [
      'Pase a Operaciones', 'Apb Comp Críticos', 'Entrega Ingenierías',
      'Apb Cliente', 'Comité Márgenes', 'Compra Materiales',
      'Inicio Instalación', 'Commissioning', 'Visita Calidad',
      'Entrega Cliente', 'Pase Servicios', 'Pase Gestión', 'Cierre Presupuestal'
    ];
 
    const hitos = HITO_KEYS.map(nombre => ({
      nombre,
      fecha: fmtDate(row[`Fecha ${nombre}`]),
      // Fallback sin espacios: el sheet tiene "% ApbCliente" (sin espacio)
      pct: parseFloat(row[`% ${nombre}`] ?? row[`% ${nombre.split(' ').join('')}`]) || 0,
      estatus: row[`Estatus ${nombre}`] || row[`Estatus ${nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`] || 'Sin fecha',
    }));
 
    return {
      proj,
      sitio: row['Sitio'] || '',
      tecnologia: row['Tecnología'] || '',
      cuenta: row['Cuenta'] || '',
      pm: row['PM'] || '',
      faseActual: row['Fase Actual'] || '',
      estatusAdO: row['Estatus AdO'] || '',
      pctPronostico: parseFloat(row['% Pronóstico Total']) || 0,
      fechaInicio: fmtDate(row['Fecha inicio proyecto']),
      fechaFin: fmtDate(row['Fecha fin proyecto']),
      previstaCommissioning: fmtDate(row['Prevista Commissioning']),
      diasDesviacion: parseInt(row['Días desviación Commissioning']) || null,
      semanasEsperadas: parseFloat(row['Semanas esperadas']) || null,
      semanaActual: parseFloat(row['Semana actual']) || null,
      checkInterconexion: interconexion,
      kickOffInterno: dashRow ? fmtDate(dashRow['Kick Off interno PM/Inter áreas']) : null,
      fases,
      hitos,
    };
  });

// ─── LEER INSIGHTS IA ────────────────────────────────────────────

let insightsIA = [];
try {
  const insightsItems = $('Leer IA_Insights').all();
  const insightsRaw = insightsItems.map(i => i.json);
  
  if (insightsRaw.length > 0) {
    // Encontrar el timestamp más reciente
    const timestamps = [...new Set(insightsRaw.map(r => r.timestamp).filter(Boolean))];
    timestamps.sort((a, b) => {
      
      const parseTS = (ts) => {
        // Expresión regular actualizada para incluir la captura de a.m./p.m.
        const parts = ts.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*([ap]\.?m\.?)/i);
        
        if (parts) {
          let hour = parseInt(parts[4], 10);
          const ampm = parts[7].toLowerCase();
          
          // Lógica para convertir formato 12h a 24h
          if (ampm.startsWith('p') && hour < 12) {
            hour += 12; // 3 PM se convierte en 15
          } else if (ampm.startsWith('a') && hour === 12) {
            hour = 0;   // 12 AM se convierte en 0 (medianoche)
          }

          return new Date(
            parseInt(parts[3], 10),     // Año
            parseInt(parts[2], 10) - 1, // Mes (indexado en 0)
            parseInt(parts[1], 10),     // Día
            hour,                       // Hora corregida
            parseInt(parts[5], 10),     // Minutos
            parseInt(parts[6], 10)      // Segundos
          ).getTime();
        }
        
        // Fallback por si llega un formato diferente
        return new Date(ts).getTime();
      };
      
      return parseTS(b) - parseTS(a);
    });
    
    const ultimoTimestamp = timestamps[0];
    
    insightsIA = insightsRaw
      .filter(r => r.timestamp === ultimoTimestamp)
      .map(r => ({
        timestamp: r.timestamp,
        tipo: r.tipo,
        titulo: r.titulo,
        diagnostico: r.diagnostico,
        evidencia: r.evidencia,
        recomendacion: r.recomendacion,
      }));
  }
} catch (e) {
  // Si la hoja no existe o está vacía, no romper el dashboard
  insightsIA = [];
}

// ─── RESPUESTA FINAL ─────────────────────────────────────────────

return [{
  json: {
    ok: true,
    generadoEn: new Date().toISOString(),
    kpis,
    filtros,
    proyectos,
    desviaciones: desviacionesArr,
    porHito,
    proyectoCritico,
    promedioDesviacion,
    promedioDesviacionAbierta,
    promedioDesviacionNeta,
    rendimientoSubcontratista,
    pronosticos,
    fechaCortePronostico,
    insightsIA
  }
}];