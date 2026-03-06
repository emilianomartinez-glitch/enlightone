# Enlight · Dashboard Proyectos FV

Dashboard interactivo para monitoreo de proyectos fotovoltaicos y BESS.  
Consume datos de Google Sheets vía n8n y se despliega en Vercel.

## Arquitectura

```
Google Sheets → n8n (webhook) → Dashboard HTML (Vercel)
```

- **Fuente de datos:** Google Sheets (hojas "Dashboard" y "Desviaciones")
- **API:** n8n workflow expone un webhook GET que procesa y devuelve JSON
- **Frontend:** HTML estático con Chart.js — sin framework, sin build

## Estructura del proyecto

```
enlight-dashboard/
├── public/
│   └── index.html      ← Dashboard completo (HTML + CSS + JS)
├── n8n/
│   └── workflow.json    ← Flujo de n8n para importar
├── vercel.json          ← Configuración de Vercel
├── package.json
└── README.md
```

## Configuración

### 1. n8n

1. Importar `n8n/workflow.json` en tu instancia de n8n
2. Reemplazar `TU_GOOGLE_SHEET_ID_AQUI` con el ID real de tu Google Sheet
3. Configurar credenciales de Google Sheets en n8n
4. Activar el workflow — el webhook quedará en:
   ```
   https://tu-n8n.com/webhook/enlight-dashboard
   ```

### 2. Dashboard

Editar `public/index.html` y cambiar estas dos líneas al inicio del `<script>`:

```javascript
const API_URL = 'https://tu-n8n.com/webhook/enlight-dashboard'; // ← tu URL
const DEMO_MODE = false; // ← cambiar a false
```

### 3. Despliegue en Vercel

**Opción A — Desde GitHub (recomendado):**

1. Subir este repo a GitHub
2. Ir a [vercel.com/new](https://vercel.com/new)
3. Importar el repositorio
4. Vercel detecta `vercel.json` automáticamente
5. Click en "Deploy"

**Opción B — CLI:**

```bash
npm i -g vercel
vercel --prod
```

## Funcionalidades

### Tab 1: Estado General
- **10 KPIs:** Proyectos, Cuentas, Potencia FV, Potencia BESS, Capacidad BESS, SPI, Atrasados, Con retraso, Pendientes, A tiempo
- **Filtros interactivos:** PM, Cuenta, Tipo, Fase, Supervisor, Entidad
- **Gráficas clickeables:** Clic en cualquier gráfica filtra todo el dashboard
- **Estatus por hito:** Barras apiladas con los 13 hitos del proceso
- **Distribuciones:** Por fase, proveeduría, PM, supervisor, cuenta, entidad
- **SPI por PM:** Schedule Performance Index por Project Manager
- **Tabla sorteable:** Todos los proyectos con SPI por proyecto

### Tab 2: Rendimiento y Desviaciones
- KPIs de rendimiento (% a tiempo, desviación promedio, proyecto crítico)
- Desviación promedio por hito
- Rendimiento por PM (bubble chart)
- Treemap de proyectos por fase
- % a tiempo por cuenta
- Tabla resumen por PM con SPI

### Indicadores
- **SPI (Schedule Performance Index):** Hitos cumplidos a tiempo / Hitos vencidos
  - 🟢 ≥ 0.90 — En control
  - 🟡 ≥ 0.70 — En riesgo
  - 🔴 < 0.70 — Crítico

## Actualización de datos

- Auto-refresh cada 15 minutos
- Botón manual "↻ Actualizar"
- Indicador de última actualización en el header

## Columnas requeridas en Google Sheets

### Hoja "Dashboard"
`PROJ`, `Sitio`, `Cuenta`, `Project Manager`, `Tipo de proyecto`, `Tecnología`, `KAM`, `Supervisor`, `Potencia FV (kWp)`, `Potencia STO (kW)`, `Capacidad STO (kWh)`, `Fase Actual`, `% de Obra`, `% de Proyecto`, `Entidad Federativa`, `Tipo de proveeduría`

Más las columnas de fechas previstas y reales para cada hito (13 hitos × 2 columnas = 26 columnas de fechas).

### Hoja "Desviaciones"
`Hito`, `Días Desviación`
