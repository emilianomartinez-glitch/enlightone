# Guía Estratégica de Indicadores — Enlight One

> **Versión:** Octubre 2026 (actualizada 26-oct-2026: lectura de "A tiempo" vs "días vs plan" en el detalle de hitos)
> **Propósito:** Documento de referencia para interpretar, navegar y explotar el tablero ejecutivo Enlight One. Optimizado para consulta asistida por IA (NotebookLM).
> **Audiencia:** Dirección General, KAMs, Project Managers, Supervisores, equipo de Innovación y Desarrollo.

---

## Glosario General

### ¿Qué es Enlight One?

Enlight One es el panel de control ejecutivo de Enlight para el seguimiento del portafolio de proyectos de energía solar fotovoltaica (SFV), almacenamiento con baterías (SAE/BESS) y microrredes. Su objetivo es brindar visibilidad completa del portafolio, identificar proyectos en riesgo y detectar desviaciones en hitos clave antes de que se conviertan en penalizaciones contractuales.

El tablero se alimenta de la base de datos **"Enlight One Database_Esquema 2026"** en Google Sheets, la cual combina fórmulas automatizadas con datos ingresados por el equipo de construcción, supervisores y project managers.

### ¿Cuáles son los 13 hitos de seguimiento?

Cada proyecto se monitorea a través de 13 hitos secuenciales que representan las etapas clave de ejecución:

1. Entrega Ingenierías
2. Aprobación de Componentes Críticos
3. Ingeniería Aprobada por el Cliente
4. Comité de Márgenes
5. Compra de Materiales
6. Inicio de Instalación
7. Commissioning (Encendido Net Zero)
8. Visita Calidad a Sitio
9. Entrega al Cliente
10. Pase a Servicios / liberación de sitio
11. Pase a Gestión
12. Cierre Presupuestal
13. Interconexión

Cada hito tiene cuatro fechas posibles: prevista, tentativa, modificada y real. Esta estructura se denomina internamente "cascada de fechas".

### ¿Qué es la cascada de fechas?

Es la jerarquía de fechas que se registra para cada hito:

- **Fecha prevista:** fecha inicial planificada al arranque del proyecto. Se establece con base en la configuración de duración por tipo de instalación y categoría.
- **Fecha tentativa:** fecha re-estimada por el equipo cuando hay un cambio respecto al plan original. Cuando existe, reemplaza a la prevista como referencia operativa.
- **Fecha modificada:** fecha en la que el hito se cumple efectivamente. Es la evidencia de que el hito se cerró.
- **Fecha real:** en la base de datos original, esta columna puede estar auto-poblada con fechas proyectadas futuras para hitos incompletos (por el efecto de cascada en la hoja Pronósticos). Por esta razón el cálculo de estatus **no la utiliza en absoluto** como entrada: la fórmula de estatus solo considera prevista, tentativa y modificada. La protección contra esta contaminación ocurre en la hoja de Desviaciones, mediante el flag `cerrada` (ver "¿Qué son los días On Hold y la desviación neta?" más abajo): un hito se marca como cerrado únicamente cuando existe una "Fecha modificada" genuina en Dashboard, nunca a partir de la "Fecha real" auto-poblada.

La fecha de **referencia** para cálculos de desviación es: tentativa (si existe), si no, prevista.

### ¿Qué significan los estatus de hito?

Cada hito evaluable recibe uno de cuatro estatus:

- **Cumplido a tiempo:** tiene fecha modificada y esta es ≤ la fecha de referencia (tentativa o prevista).
- **Cumplido con retraso:** tiene fecha modificada pero esta es > la fecha de referencia.
- **Atrasado:** no tiene fecha modificada y la fecha de referencia ya pasó (hito vencido, sin cerrar).
- **Pendiente:** no tiene fecha modificada pero la fecha de referencia aún no llega.

Si un hito no tiene ninguna fecha (ni prevista ni tentativa), no es evaluable y no se contabiliza en las métricas.

### ¿Qué es el Estatus AdO (Avance de Obra)?

Es el estado operativo vigente de cada proyecto. Los valores posibles son:

- **Activo:** proyecto en ejecución normal. Máxima prioridad para alertas y seguimiento.
- **On Hold:** proyecto pausado por causas externas (permisos, decisiones del cliente, etc.).
- **Legado:** proyecto heredado de periodos anteriores con seguimiento reducido.
- **En Comercial:** proyecto en fase comercial, aún sin arranque de construcción.
- **Terminado:** proyecto completado y cerrado operativamente.
- **Cancelado:** proyecto descartado.

Por defecto, el tablero muestra únicamente los proyectos con estatus **Activo**. El usuario puede cambiar el filtro para ver cualquier combinación de estatus. Visualmente, cada proyecto muestra un indicador de color (dot) junto al código PROJ que refleja su estatus AdO.

### ¿Qué son los días On Hold y la desviación neta?

Cuando un proyecto entra en pausa (On Hold), los días de pausa se registran por período y se asignan a los hitos cuya ventana de ejecución se traslapa con el período de On Hold.

- **Desviación bruta:** diferencia en días entre la fecha de cumplimiento y la fecha de referencia. Incluye todo el tiempo transcurrido, sin importar si hubo pausas.
- **Días On Hold aplicables:** días de pausa que se traslapan con el período de ejecución de cada hito específico.
- **Desviación neta:** desviación bruta menos los días de On Hold aplicables. Refleja el retraso real atribuible al equipo de ejecución.

Fórmula en texto plano:

```
Desviación neta = Desviación bruta − Días On Hold aplicables
```

$$\text{Desviación neta} = \text{Desviación bruta} - \text{Días On Hold aplicables}$$

Un proyecto con >15 días hábiles acumulados de On Hold se considera significativo para efectos de análisis.

### ¿Qué tipos de proyecto existen?

Los proyectos se clasifican por modelo financiero:

- **PPA (Power Purchase Agreement):** el cliente paga por la energía generada, Enlight es dueño del sistema.
- **CAPEX SFV:** el cliente compra el sistema fotovoltaico.
- **CAPEX STO / CAPEX SAE:** el cliente compra el sistema de almacenamiento.
- **CAPEX MICRORRED:** el cliente compra una microrred integrada (SFV + SAE + controles).
- **SAAS:** modelo de servicio donde Enlight opera el sistema de almacenamiento.

### ¿Qué tipos de tecnología se manejan?

- **FV / Fotovoltaico / SFV:** sistema solar fotovoltaico.
- **SAE / STO / BESS:** sistema de almacenamiento de energía con baterías.
- **FV+SAE:** proyecto híbrido que combina fotovoltaico y almacenamiento.

### ¿Qué tipos de proveeduría existen?

- **EPC Enlight:** Enlight actúa como contratista integral (ingeniería, adquisiciones, construcción).
- **EPC Mixto:** parte del alcance es Enlight, parte es subcontratada.
- **EPC externo:** un contratista externo ejecuta la obra completa.

### ¿Qué son las fases del proyecto?

El campo "Fase Actual" indica en qué etapa se encuentra el proyecto. Las fases posibles son: Sin Fechas, Fase Comercial, Fase Liberación, Fase Propuesta, Fase Licitación, Fase Instalación, Commissioning, Fecha Pase a Servicios/liberación de sitio, y Cerrado.

### ¿Cuáles son los roles de seguimiento?

- **PM (Project Manager):** responsable directo de la ejecución del proyecto.
- **KAM (Key Account Manager):** responsable de la relación comercial con la cuenta/cliente.
- **Supervisor:** responsable de la supervisión en campo de la instalación.
- **Subcontratista (VEN):** empresa externa que ejecuta la instalación física. Se identifica con el campo "Servicio Instalación SFV".

### ¿Qué unidades de medida se usan?

- **kWp:** kilowatts pico (capacidad instalada fotovoltaica).
- **kW:** kilowatts (potencia del sistema de almacenamiento).
- **kWh:** kilowatts-hora (capacidad de almacenamiento energético).

### Paleta de colores del tablero

Los colores tienen significado consistente en todo el tablero:

- `#00AA85` (verde): a tiempo, en control, positivo, SPI ≥ 0.90.
- `#ff9f43` (naranja/ámbar): con retraso, en riesgo, advertencia, SPI 0.70–0.89.
- `#ff4757` (rojo): atrasado, crítico, SPI < 0.70.
- `#4c9fff` (azul): pendiente, en espera, informativo.
- `#3D7D80` (teal): neutro, portafolio.
- `#9f7aff` (púrpura): SPI (indicador dedicado).
- `#293C47` (gris oscuro): bordes, fondo primario.
- `#888686` (gris): texto secundario, datos sin estatus. (Es el gris de marca `#828080` aclarado ligeramente para cumplir contraste de lectura 4.5:1 sobre fondo oscuro.)

**Tipografía:** Alexandria para títulos y valores de KPI, y Albert Sans para texto de interfaz, etiquetas y tablas (ambas incluidas con el tablero, ya no se descargan de Google Fonts). El texto funcional nunca baja de 11 px.

**Navegación y accesibilidad:** las cuatro pestañas se pueden recorrer con el teclado (flechas ← →, Inicio y Fin); los controles muestran un anillo verde de foco al navegar con teclado; con "reducir movimiento" activado en el sistema operativo se desactivan el pulso del indicador "En vivo" y las animaciones de entrada. Las filas de las tablas que se expanden con clic aún no son accesibles por teclado.

---

## Elementos globales del tablero

### ¿Qué es el Resumen Ejecutivo (Executive Summary)?

Es una barra visible en todo momento, independiente del tab activo. Contiene tres tarjetas:

**1. Salud del portafolio:** muestra el SPI global del portafolio filtrado, la cantidad de proyectos con hitos atrasados, y el proyecto más crítico (mayor número de hitos vencidos). El color del indicador refleja el nivel de riesgo. Esta tarjeta es interactiva: al hacer clic, filtra la vista para mostrar únicamente los proyectos con hitos atrasados.

**2. Avance global:** porcentaje de hitos completados (a tiempo + con retraso) sobre el total, con desglose numérico. Indica cuántos proyectos no tienen fechas registradas.

**3. Portafolio:** resumen cuantitativo del portafolio filtrado — total de proyectos, cuentas únicas, potencia SFV acumulada (kWp) y potencia SAE acumulada (kW).

### ¿Qué es el banner de Calidad de Datos?

Es una alerta visible cuando existen proyectos con información incompleta que afecta las métricas. Detecta dos condiciones:

- Proyectos **sin fechas registradas** (ningún hito evaluable).
- Proyectos **sin potencia/capacidad** (sin datos de kWp, kW o kWh).

Estos proyectos se excluyen de las métricas de rendimiento para no contaminar los cálculos. Al pasar el cursor sobre el banner, un tooltip muestra la lista completa de proyectos afectados con su PROJ y PM.

### ¿Cómo funcionan los filtros?

El tablero cuenta con 11 filtros multi-selección que se sincronizan bidireccionalmente entre las tres primeras pestañas:

1. PROJ
2. KAM
3. Sitio (con búsqueda autocompletada)
4. Project Manager
5. Cuenta
6. Tipo
7. Fase
8. Proveeduría
9. Supervisor
10. Entidad Federativa
11. Estatus AdO (por defecto: solo "Activo" seleccionado)

Los filtros de PROJ y Sitio cuentan con búsqueda autocompletada; los demás son de selección múltiple estándar.

Los filtros son **bidireccionales**: al seleccionar un valor en un filtro, las opciones de los demás se actualizan para mostrar solo las combinaciones disponibles en los datos filtrados.

Adicionalmente, se puede filtrar haciendo clic directo en gráficas (barras, donuts, treemap) y en las tarjetas de KPI de hitos. Los filtros activos se muestran como "chips" removibles en la barra de filtros.

El botón "Limpiar" restablece todos los filtros a su estado por defecto (solo Activos en Estatus AdO).

---

## Tab 1 — Estado General

### ¿Qué es el Tab de Estado General?

Es la vista principal del tablero. Ofrece un panorama completo del portafolio con KPIs resumen, gráficas de distribución, y una tabla detallada de todos los proyectos.

### KPIs de Estado General

El tab muestra 10 tarjetas KPI en la sección "Resumen general":

#### KPI: Proyectos

- **Qué mide:** total de proyectos en el portafolio filtrado.
- **Por qué importa:** indica el tamaño del portafolio activo bajo gestión.
- **Interpretación:** si el número cambia al aplicar filtros, revela la concentración del portafolio en determinadas cuentas, PMs, o fases.

#### KPI: Cuentas

- **Qué mide:** número de cuentas (clientes) únicas en el portafolio filtrado.
- **Por qué importa:** indica la diversificación del portafolio. Una alta concentración en pocas cuentas aumenta el riesgo operativo.

#### KPI: Potencia SFV

- **Qué mide:** suma de kWp de todos los proyectos fotovoltaicos filtrados.
- **Por qué importa:** dimensiona la capacidad fotovoltaica total bajo gestión.

#### KPI: Potencia SAE

- **Qué mide:** suma de kW de almacenamiento de los proyectos filtrados.
- **Por qué importa:** dimensiona la capacidad de almacenamiento bajo gestión.

#### KPI: Capacidad SAE

- **Qué mide:** suma de kWh de almacenamiento energético de los proyectos filtrados.
- **Por qué importa:** complementa la potencia SAE con la dimensión de energía almacenable.

#### KPI: SPI Portafolio

- **Qué mide:** Schedule Performance Index global del portafolio filtrado.
- **Fórmula:**

```
SPI = Hitos cumplidos a tiempo / (Hitos a tiempo + Cumplidos con retraso + Atrasados)
```

$$SPI = \frac{\text{Hitos a tiempo}}{\text{Hitos a tiempo} + \text{Cumplidos con retraso} + \text{Atrasados}}$$

- **Detalle técnico:** los hitos Pendientes se **excluyen** del denominador porque su fecha de referencia aún no ha llegado. Solo se evalúan hitos cuya fecha de referencia ya pasó.
- **Umbrales de interpretación:**
  - ≥ 0.90 → **En control** (verde). El portafolio cumple consistentemente.
  - 0.70 – 0.89 → **En riesgo** (naranja). Hay incumplimientos que requieren atención.
  - < 0.70 → **Crítico** (rojo). Acción inmediata requerida.
- **Por qué importa:** es el indicador más importante para Dirección. Un SPI bajo es señal directa de riesgo de penalizaciones contractuales.

#### KPI: Atrasados (clickeable)

- **Qué mide:** total de hitos con estatus "Atrasado" en el portafolio filtrado.
- **Interactividad:** al hacer clic, filtra la tabla para mostrar solo proyectos que tengan al menos un hito atrasado.
- **Por qué importa:** estos hitos ya vencieron y no se han cerrado. Cada día adicional incrementa el riesgo de penalización.

#### KPI: Con retraso (clickeable)

- **Qué mide:** total de hitos cumplidos con retraso.
- **Interactividad:** filtra la tabla al hacer clic.
- **Por qué importa:** aunque el hito se cerró, la desviación indica problemas en la planificación o ejecución que pueden repetirse.

#### KPI: Pendientes (clickeable)

- **Qué mide:** total de hitos cuya fecha de referencia aún no llega.
- **Interactividad:** filtra la tabla al hacer clic.
- **Por qué importa:** permite anticipar la carga de trabajo próxima y preparar recursos.

#### KPI: A tiempo (clickeable)

- **Qué mide:** total de hitos cumplidos dentro de la fecha de referencia.
- **Interactividad:** filtra la tabla al hacer clic.
- **Por qué importa:** mide la capacidad de ejecución del equipo. Es el numerador del SPI.

### Gráficas de Distribución del Portafolio

#### Gráfica: Estatus por Hito

- **Concepto:** gráfica de barras horizontales apiladas que muestra la distribución de estatus para cada uno de los 13 hitos.
- **Resumen ejecutivo:** permite identificar de un vistazo en qué hitos se concentran los atrasos y los cumplimientos. Si un hito específico (por ejemplo, Compra de Materiales) tiene una barra roja desproporcionada, indica un cuello de botella sistémico.
- **Detalle técnico:** cada barra se segmenta en 4 colores: rojo (Atrasado), naranja (Cumplido con retraso), azul (Pendiente), verde (A tiempo). Los datos se calculan recorriendo todos los proyectos filtrados.
- **Interactividad:** al hacer clic en un segmento específico (por ejemplo, "Atrasado" en "Commissioning"), se despliega una tabla debajo del chart mostrando todos los proyectos en esa combinación, con columnas contextuales: PROJ, Sitio, Cuenta, PM, KAM, SPI, y días de atraso/retraso según corresponda.
- **Guía de interpretación:** una concentración de rojo en hitos de las fases tempranas (Entrega Ingenierías, Aprobación Componentes) sugiere problemas de planificación o coordinación con clientes. Rojo concentrado en Commissioning/Interconexión sugiere problemas de campo o regulatorios.

#### Gráfica: Por Fase

- **Concepto:** gráfica de dona (doughnut) que muestra cuántos proyectos hay en cada fase.
- **Resumen ejecutivo:** revela la distribución del portafolio por etapa de avance.
- **Interactividad:** clic en un segmento filtra todo el tablero por esa fase.
- **Guía de interpretación:** una concentración excesiva en "Fase Instalación" puede indicar cuellos de botella en campo. Muchos proyectos en "Sin Fechas" indica problemas de calidad de datos.

#### Gráfica: Por Tipo

- **Concepto:** dona que segmenta el portafolio por tipo de proyecto (PPA, CAPEX SFV, etc.).
- **Resumen ejecutivo:** muestra el mix financiero del portafolio.
- **Interactividad:** clic en segmento filtra por tipo.

#### Gráfica: Por Project Manager

- **Concepto:** barras verticales mostrando cantidad de proyectos por PM.
- **Resumen ejecutivo:** revela la distribución de carga de trabajo entre PMs.
- **Interactividad:** clic en una barra filtra todo el tablero por ese PM.
- **Guía de interpretación:** un PM con muchos más proyectos que el promedio puede estar sobrecargado, lo que se correlaciona con SPIs más bajos.

#### Gráfica: Por Proveeduría

- **Concepto:** dona que segmenta por tipo de EPC (Enlight, Mixto, Externo).
- **Resumen ejecutivo:** muestra el balance de ejecución interna vs. externa.
- **Interactividad:** clic en segmento filtra por proveeduría.

#### Gráfica: Por Cuenta

- **Concepto:** barras horizontales mostrando las top 10 cuentas por cantidad de proyectos.
- **Resumen ejecutivo:** identifica los clientes con mayor volumen.
- **Interactividad:** clic en barra filtra por cuenta.
- **Guía de interpretación:** cuentas con muchos proyectos merecen atención dedicada. Un mal desempeño en una cuenta grande tiene impacto comercial desproporcionado.

#### Gráfica: Por Entidad Federativa

- **Concepto:** barras horizontales mostrando distribución geográfica (top 10 estados).
- **Resumen ejecutivo:** revela la concentración geográfica del portafolio.
- **Interactividad:** clic filtra por estado.

#### Gráfica: Rendimiento por Subcontratista

- **Concepto:** barras horizontales mostrando el porcentaje de hitos a tiempo de cada subcontratista (VEN).
- **Resumen ejecutivo:** evalúa el desempeño de cada empresa subcontratista.
- **Fórmula:**

```
% A tiempo = Hitos a tiempo del subcontratista / Total hitos evaluados del subcontratista × 100
```

$$\% \text{A tiempo} = \frac{\text{Hitos a tiempo}_{\text{sub}}}{\text{Total hitos evaluados}_{\text{sub}}} \times 100$$

- **Detalle técnico:** se consideran solo proyectos donde el campo "Servicio Instalación SFV" tiene un subcontratista asignado. Nunca se usa el campo "Tipo de proveeduría" como fallback para evitar contaminación de datos.
- **Guía de interpretación:** subcontratistas por debajo del 50% requieren revisión de contrato o acompañamiento adicional. Subcontratistas por encima del 70% son confiables para nuevas asignaciones.

### Tabla: Todos los Proyectos

- **Concepto:** tabla maestra con todos los proyectos del portafolio filtrado.
- **Columnas:** PROJ (con dot de Estatus AdO), Sitio, Cuenta, PM, Tipo, Tecnología, kWp SFV, kW SAE, % Proyecto, Fase, SPI, Atrasados, Pendientes, Con retraso, A tiempo.
- **Ordenamiento:** todas las columnas son ordenables al hacer clic en el encabezado.
- **Filas expandibles:** al hacer clic en una fila se despliega un panel con el detalle de los 13 hitos (con barra de progreso visual, estatus y desviación en días) y la información completa del proyecto (Cuenta, PM, KAM, Supervisor, Subcontratista, Tipo, Proveeduría, Fase, % de AdO, Potencia SFV, SAE, SPI, y fecha de Commissioning).
- **Desviación en días mostrada por hito (actualizado sep. 2026):** el número de días que aparece en este panel expandible ya no es siempre el bruto calculado localmente. Ahora el sistema primero busca el registro correspondiente en la hoja Desviaciones: si el hito está cerrado usa la **desviación neta** (sin On Hold), y si está abierto/atrasado usa la desviación bruta vigente contra hoy; solo si no existe un registro coincidente en Desviaciones recurre al cálculo local bruto como respaldo. En la práctica, esto alinea el número que ve el usuario al expandir un proyecto con la misma convención "neta" que ya usan las gráficas del Tab 2.
- **¿Por qué un hito dice "A tiempo" y trae días "vs plan"? (aclarado oct. 2026):** son dos mediciones distintas contra fechas distintas. El **estatus** (A tiempo / Retraso / Atrasado) se calcula contra la fecha **vigente** del hito: la Tentativa si existe y, si no, la Prevista. Los **días "vs plan"** son la desviación **neta** contra la fecha **Prevista original**, sin contar los días On Hold. Si el equipo reprogramó un hito (Tentativa posterior a la Prevista) y cumplió la fecha reprogramada, el estatus es "A tiempo" aunque el hito haya llegado, por ejemplo, 47 días después del plan original. Ambos datos son correctos y responden preguntas diferentes: el estatus dice si se cumplió el compromiso vigente; los días dicen cuánto se movió el proyecto respecto a lo planeado.
- **Cómo se muestran los días "vs plan" (oct. 2026):** el texto lleva la etiqueta "vs plan". Va en **rojo solo si el estatus también es negativo** (Atrasado o Retraso); con "A tiempo" va en gris para que no parezca una contradicción. Los días a favor se muestran en verde. Cuando la desviación neta es 0 no se muestra el texto: es el caso de un hito con estatus Retraso cuya desviación el On Hold absorbió por completo. Al pasar el cursor aparecen las fechas Prevista, Tentativa y Modificada. El mismo criterio de color aplica a las fechas Modificada y Real del panel expandible del Tab 3.
- **% de Proyecto:** se normaliza automáticamente. Si el valor viene como decimal (0.75), se multiplica por 100. Si viene como porcentaje (75), se muestra directamente. El umbral de detección es > 1.01 (para manejar errores de punto flotante como 1.0000000000000002).

---

## Tab 2 — Rendimiento y Desviaciones

### ¿Qué es el Tab de Rendimiento y Desviaciones?

Es la vista analítica del tablero, enfocada en medir el desempeño del portafolio en términos de cumplimiento de tiempos y desviaciones. Contiene cinco KPIs de rendimiento (% Hitos a tiempo, Desviación neta promedio, Días On Hold, Proyecto crítico y Hitos evaluados), análisis de desviación por hito, rendimiento por cuenta y subcontratista, y una tabla detallada por cuenta con datos de On Hold.

### KPIs de Rendimiento

#### KPI: % Hitos a Tiempo

- **Qué mide:** porcentaje de hitos cumplidos a tiempo respecto al total de hitos evaluados.
- **Fórmula:**

```
% A tiempo = Hitos a tiempo / Total hitos evaluados × 100
```

$$\% \text{A tiempo} = \frac{\text{Hitos a tiempo}}{\text{Total hitos evaluados}} \times 100$$

#### KPI: Desviación Neta Promedio

- **Qué mide:** promedio de días de desviación neta (sin On Hold) de los hitos **ya cerrados** registrados en la hoja de Desviaciones, respetando los filtros activos. Es un promedio de los promedios por hito (cada hito pesa igual).
- **Por qué importa:** da una medida más justa del retraso real atribuible al equipo, excluyendo pausas justificadas.
- **Subtítulo de la tarjeta:** muestra la desviación **bruta** promedio y que se le restó el On Hold ("bruta X d − On Hold"), para que el número se pueda reconciliar con lo que se ve en el Sheet. Ejemplo (PROJ-561): neta 49.0 d, bruta 208.5 d, 379 d de On Hold.
- **Fuente:** se calcula a partir de la columna "Desviación Neta (sin OH)" de la hoja Desviaciones. Si el payload no trae el detalle por proyecto, se usa el promedio pre-agregado del servidor.

#### KPI: Días On Hold (nuevo, octubre 2026)

- **Qué mide:** total de días de On Hold de los proyectos del portafolio filtrado. Debajo se indica en cuántos proyectos hay On Hold ("N de M proyectos con On Hold").
- **Por qué importa:** explica la diferencia entre la desviación bruta y la neta, y le da visibilidad a Operaciones de cuánto del retraso está detenido por causas externas (cliente, permisos, sitio) y no por ejecución. Antes de esta tarjeta los On Hold registrados en el Sheet no aparecían en esta pestaña, lo que generaba confusión.
- **Cómo se calcula:** para cada proyecto se toma el **máximo** de "Días On Hold Aplicables" entre sus filas de la hoja Desviaciones (el campo es acumulado por hito, no se puede sumar fila por fila) y se suman los proyectos filtrados.
- **Fórmula:**

```
Días On Hold = Σ por proyecto ( máx. Días On Hold Aplicables de sus hitos )
```

- **Alcance:** es el On Hold acumulado de vida del proyecto, igual que en la hoja; no distingue entre pausas ya terminadas y una pausa vigente. Sin On Hold registrado, la tarjeta muestra 0 d y "sin On Hold registrado".

#### KPI: Proyecto Crítico

- **Qué mide:** identifica el proyecto con mayor cantidad de hitos atrasados.
- **Por qué importa:** señala dónde concentrar recursos de rescate inmediatamente.

#### KPI: Hitos Evaluados

- **Qué mide:** total de hitos con estatus evaluable en el portafolio filtrado.

### Gráficas de Análisis de Desviaciones

#### Gráfica: Desviación Neta Promedio por Hito (días)

- **Concepto:** barras horizontales mostrando la desviación neta promedio (en días) para cada hito.
- **Resumen ejecutivo:** identifica en qué hitos se concentran los mayores retrasos netos del portafolio, ya descontando días de On Hold.
- **Detalle técnico:** se utiliza la desviación neta (sin On Hold) como fuente primaria. El cálculo promedia la desviación de todos los registros de la hoja Desviaciones para cada hito, ordenados de mayor a menor.
- **Fórmula:**

```
Desviación neta promedio por hito = Σ Desviación neta de todas las muestras del hito / Cantidad de muestras
```

$$\overline{D_{\text{neta}}}_{h} = \frac{\sum_{i=1}^{n} d_{\text{neta},i}}{n}$$

- **Colores:** rojo si > 30 días, naranja si > 15 días, verde si ≤ 15 días.
- **Guía de interpretación:** un hito con desviación neta promedio alta (>30 días) indica un problema estructural en esa etapa. Si la desviación bruta era mucho mayor pero la neta es baja, significa que los On Hold fueron la causa principal, no la ejecución.
- **Reactividad a filtros:** cuando el payload del webhook incluye detalle por proyecto y el flag `cerrada`, esta gráfica (y la de "Desviación en curso por hito") se recalcula en el navegador a partir de `rawData.desviaciones`, filtrado por los filtros activos del tablero — es decir, cambia en tiempo real al filtrar por PM, cuenta, fase, etc. Si el payload no trae ese detalle (modo demo o una respuesta cacheada de una versión anterior de la API), el tablero cae de vuelta a los promedios pre-agregados que envía el servidor.

#### Gráfica: Desviación en Curso por Hito (días)

- **Concepto:** barras horizontales mostrando, para cada hito, el promedio de días de desviación **neta** (sin On Hold) en las desviaciones **abiertas** (hitos que aún no tienen "Fecha modificada", es decir, no se han cerrado). Al pasar el cursor, el tooltip muestra también la desviación bruta.
- **Resumen ejecutivo:** complementa la gráfica de desviación neta (que solo mide hitos ya cerrados) mostrando el arrastre de los hitos todavía en curso. Un hito con muchos días acumulados en esta gráfica indica un cuello de botella activo, no histórico. Desde octubre 2026 descuenta el On Hold porque, para Operaciones, lo accionable es el retraso que **no** se explica por pausas externas.
- **Detalle técnico:** se calcula sobre el subconjunto de registros de Desviaciones donde `cerrada = false`, usando la columna "Desviación Neta (sin OH)" (la bruta se conserva para el tooltip), midiendo contra la Fecha Prevista original. Por construcción esta métrica crece día con día mientras el hito permanezca sin cerrar y no esté en pausa (un hito en On Hold deja de crecer en neta), por lo que **nunca se mezcla** con los promedios de desviación bruta/neta de hitos cerrados para no distorsionarlos. Si una fila abierta no trae desviación neta en el Sheet, se omite de la gráfica.
- **Fuente del dato agregado en el backend:** campo `promedioDesviacionAbierta` en la respuesta del webhook (desviación bruta); solo se usa como respaldo en modo demo o con una respuesta antigua de la API.
- **Guía de interpretación:** valores altos y crecientes en esta gráfica para un hito específico son una alerta temprana — el hito lleva mucho tiempo abierto y probablemente terminará como un cumplimiento con retraso severo o un atrasado. Si la barra neta es mucho menor que la bruta del tooltip, la mayor parte del arrastre se debe a On Hold.

#### Gráfica: Duración por Fase — Plan vs. Real/Estimada (semanas)

- **Concepto:** barras comparando, por fase del proyecto, las semanas planificadas contra las semanas reales (fases cerradas) o estimadas a la fecha (fases en curso).
- **Resumen ejecutivo:** identifica qué fases del ciclo de vida consistentemente toman más tiempo del planificado, independientemente del proyecto individual.
- **Guía de interpretación:** una fase donde la barra real/estimada excede sistemáticamente la barra plan es candidata a revisión de la duración planificada en la hoja Configuración, o a un problema recurrente de ejecución en esa etapa.

#### Gráfica: Rendimiento por Cuenta (Scatter/Bubble)

- **Concepto:** gráfica de burbujas donde cada burbuja es una cuenta. Eje X = % hitos a tiempo, Eje Y = cantidad de proyectos, tamaño = proporcional a la cantidad de proyectos.
- **Resumen ejecutivo:** permite cruzar volumen con desempeño por cuenta. Cuentas grandes con bajo % de cumplimiento son las de mayor riesgo comercial.
- **Fórmula por cuenta:**

```
% A tiempo de la cuenta = Hitos a tiempo de todos los proyectos de la cuenta / Total hitos evaluados de la cuenta × 100
```

$$\% \text{A tiempo}_{\text{cuenta}} = \frac{\sum \text{Hitos a tiempo}_{\text{proyectos}}}{\sum \text{Total hitos}_{\text{proyectos}}} \times 100$$

- **Color de burbuja:** basado en el SPI de la cuenta (verde ≥ 0.90, naranja 0.70–0.89, rojo < 0.70).
- **Guía de interpretación:** burbujas grandes en la zona izquierda (bajo % a tiempo) indican cuentas grandes con problemas. Burbujas en la zona derecha (>70% a tiempo) están en buen estado.

#### Gráfica: Proyectos por Fase (Treemap)

- **Concepto:** visualización de áreas proporcionales donde cada bloque representa una fase del proyecto. El tamaño del bloque es proporcional a la cantidad de proyectos en esa fase.
- **Resumen ejecutivo:** muestra de manera intuitiva dónde se concentra el portafolio.
- **Interactividad:** al hacer clic en un bloque, se despliega una tabla de detalle debajo del treemap mostrando todos los proyectos de esa fase, con columnas PROJ, Sitio, Cuenta, PM, SPI, Atrasados, Pendientes y A tiempo. La columna SPI es ordenable.

#### Gráfica: Hitos a Tiempo por Cuenta

- **Concepto:** barras horizontales mostrando el % de hitos a tiempo para las top 12 cuentas.
- **Resumen ejecutivo:** ranking de desempeño de cuentas por cumplimiento.
- **Colores:** verde ≥ 70%, naranja 40–69%, rojo < 40%.
- **Guía de interpretación:** cuentas por debajo del 40% requieren plan de acción inmediato con el KAM responsable.

### Tabla: Detalle por Cuenta

- **Concepto:** tabla resumen por cuenta con métricas agregadas y filas expandibles.
- **Columnas de la tabla principal:** Cuenta, Proyectos, Evaluados, A tiempo, Retraso, Atrasados, Pendientes, % A tiempo (con barra de progreso), SPI.
- **Ordenamiento:** las columnas Proyectos, A tiempo, Retraso, Atrasados, % A tiempo y SPI son ordenables. Por defecto, se ordena por cantidad de atrasados (mayor primero).
- **Filas expandibles:** al hacer clic en una cuenta se despliega el detalle de cada proyecto con columnas adicionales:
  - PROJ (con dot de Estatus AdO)
  - Sitio, PM, KAM, SPI, Atrasados, Con retraso, A tiempo
  - **Días OH:** total de días de On Hold del proyecto. Se muestra en naranja si hay días registrados.
  - **Desviación Neta:** promedio de desviación neta de los hitos del proyecto. Rojo si > 15 días.
  - **Comentarios de Retraso:** texto libre del equipo explicando las causas del retraso.
  - **Área Responsable:** área de Enlight identificada como responsable de la desviación.

---

## Tab 3 — Cronograma y Pronóstico

### ¿Qué es el Tab de Cronograma y Pronóstico?

Es la vista temporal del tablero, enfocada en la línea de tiempo de ejecución de los proyectos. Incluye un Gantt interactivo del portafolio, análisis de dispersión de desviaciones, y una tabla de pronósticos con métricas de ritmo de ejecución.

Este tab se alimenta de la hoja **"Pronósticos"** de la base de datos, que contiene datos de fases con porcentajes de avance, fechas planificadas vs. reales, y métricas de semanas de ejecución.

### Badge: Fecha de Corte de Pronóstico

- **Concepto:** badge que muestra la fecha de corte de los datos de pronóstico.
- **Fuente:** se obtiene de la hoja "Pronósticos" en la base de datos.
- **Interpretación:** si la fecha de corte es antigua (más de una semana), los datos pueden estar desactualizados. Si muestra "pendiente" en naranja, significa que no se encontró fecha de corte.

### KPIs de Pronóstico

#### KPI: Proyectos con Pronóstico

- **Qué mide:** cantidad de proyectos que tienen datos en la hoja de Pronósticos.
- **Por qué importa:** indica la cobertura del pronóstico. Si hay muchos menos proyectos que en Tab 1, hay proyectos sin seguimiento temporal.

#### KPI: Desviación de Commissioning vs. Fecha Base

- **Qué mide:** promedio de la desviación absoluta (en días) entre la fecha de Commissioning planificada y la actual, para todos los proyectos con pronóstico.
- **Clasificación:** críticos son aquellos con >90 días de desviación.
- **Colores:** rojo si >90 días promedio, naranja si >30, verde si ≤30.

#### KPI: % Pronóstico Promedio

- **Qué mide:** promedio del porcentaje de avance del pronóstico de todos los proyectos.
- **Fuente:** campo `pctPronostico` de cada proyecto en Pronósticos.

#### KPI: Interconexión

- **Qué mide:** ratio de proyectos con interconexión completada vs. total con datos de interconexión.
- **Formato:** X/Y (completados/total). Indica cuántos pendientes hay.

#### KPI: Sobre Plazo

- **Qué mide:** cantidad de proyectos donde las semanas reales superan las semanas esperadas.
- **Por qué importa:** un proyecto sobre plazo está consumiendo más tiempo del planificado, lo que impacta costos y recursos.

### Gantt del Portafolio

- **Concepto:** visualización tipo Gantt que muestra la línea de tiempo de todos los proyectos con pronóstico.
- **Resumen ejecutivo:** permite ver de un vistazo la distribución temporal del portafolio, identificar proyectos que se traslapan, y detectar concentraciones de commissioning.
- **Elementos visuales:**
  - **Barras sólidas:** representan las fases reales de cada proyecto (con color por fase).
  - **Barras punteadas:** representan las fases planificadas (plan). Permiten comparar plan vs. realidad.
  - **Barra opaca (35%):** indica un proyecto cerrado (todas las fases cumplidas).
  - **Línea roja vertical:** marca la fecha de hoy.
  - **Dot verde con borde:** hito de Kick Off Interno.
  - **Dot con color de estatus:** hitos de Commissioning e Interconexión. Verde = cumplido, azul = pendiente, rojo = atrasado.
- **Controles:**
  - **Búsqueda:** filtrar proyectos por nombre, sitio o cuenta.
  - **Ordenamiento:** por fecha de Commissioning (default) o por fecha de inicio.
  - **Zoom temporal:** Mes, Trimestre, Año.
- **Tooltip:** al pasar el cursor sobre una barra o hito, muestra nombre de la fase, rango de fechas, y estatus, con texto distinto según el tipo de barra:
  - **Barra sólida (real):** encabezado "Estatus: …", con una de cinco etiquetas legibles — Cumplido, En progreso, Pronóstico, Pendiente, o Sin fecha.
  - **Barra punteada (plan):** encabezado "Estatus actual: …", usando el mismo set de cinco etiquetas, para poder comparar de un vistazo el estatus real de la fase contra su posición en el plan.
- **Guía de interpretación:** proyectos cuya barra real se extiende mucho más allá de la barra plan están en sobre-plazo. Proyectos cerrados se muestran atenuados para no distraer del portafolio activo.

### Gráficas de Análisis de Dispersión

#### Gráfica: Desviación vs. Avance de Pronóstico (Bubble Chart)

- **Concepto:** gráfica de burbujas con cuadrantes. Eje X = % de avance del pronóstico, Eje Y = días de desviación (absoluto), tamaño de burbuja = semanas transcurridas.
- **Resumen ejecutivo:** cruza cuánto ha avanzado un proyecto con cuánto se ha desviado. Permite priorizar intervenciones.
- **Cuadrantes:**
  - **Inferior derecho (verde):** alto avance, baja desviación → ideal.
  - **Superior izquierdo (rojo):** bajo avance, alta desviación → crítico, requiere acción inmediata.
  - **Superior derecho:** alto avance pero con mucha desviación → terminó/casi termina pero con retrasos significativos.
  - **Inferior izquierdo:** bajo avance y poca desviación → proyecto en etapa temprana, monitorear.
- **Líneas de referencia:** vertical en 50% de avance, horizontal en 30 días de desviación.
- **Color de burbuja:** rojo si >90 días de desviación, naranja si >30, verde si ≤30. Proyectos cerrados se muestran en gris.
- **Guía de interpretación:** las burbujas grandes en el cuadrante rojo son la prioridad absoluta — proyectos con mucho tiempo transcurrido, poco avance y alta desviación.

#### Gráfica: Ratio de Sobre-Plazo (Scatter)

- **Concepto:** scatter plot que muestra el ratio entre semanas reales y semanas esperadas de cada proyecto.
- **Fórmula:**

```
Ratio = Semanas reales / Semanas esperadas
```

$$\text{Ratio} = \frac{\text{Semanas reales}}{\text{Semanas esperadas}}$$

- **Ejes:** X = semanas esperadas, Y = ratio.
- **Líneas de referencia:**
  - Línea verde en Y = 1.0 → sin desviación (ritmo perfecto).
  - Línea roja en Y = 1.5 → riesgo (el proyecto lleva 50% más tiempo del esperado).
- **Color de punto:** verde si ratio ≤ 1.0, naranja si 1.0–1.5, rojo si > 1.5. Cerrados en gris.
- **Guía de interpretación:** puntos por encima de la línea roja (ratio > 1.5) son proyectos en sobre-plazo severo. Un ratio de 2.0 significa que el proyecto lleva el doble del tiempo esperado.

### Tabla: Fechas y Pronósticos

- **Concepto:** tabla detallada de todos los proyectos con datos de pronóstico.
- **Columnas:** PROJ, Cuenta, PM, Fase, % Pronóstico (con barra), Inicio, Fin pronóstico, Commissioning prevista, Desviación (con badge de severidad), Semanas esperadas, Semanas reales, Ratio, Interconexión.
- **Badge de desviación:** clasificación por severidad:
  - **Crítico** (rojo): > 90 días.
  - **Alto** (naranja): 31–90 días.
  - **Moderado** (azul): 8–30 días.
  - **En control** (verde): ≤ 7 días.
- **Interconexión:** check verde (✓) si está completada, X roja (✕) si está pendiente.
- **Proyectos cerrados:** se muestran con opacidad reducida (50%) y un check (✓) junto al PROJ.
- **Ordenamiento:** todas las columnas son ordenables.

### Detalle expandible por proyecto (Tabla de Pronósticos) — nuevo, sep. 2026

- **Concepto:** al igual que en las tablas de los Tabs 1 y 2, las filas de la Tabla de Fechas y Pronósticos ahora son clickeables. Al hacer clic se despliega un panel de detalle debajo de la fila.
- **Contenido del panel:**
  1. Tres tarjetas resumen de fechas "previas" a la cascada de los 13 hitos: **Cierre Comercial**, **Pase a Operaciones (Estatuto)** y **Kick Off interno PM/Inter áreas**.
  2. Una tabla completa de los 13 hitos con columnas **Hito | Prevista | Tentativa | Modificada | Real**:
     - Prevista y Tentativa se muestran en texto plano/atenuado (solo referencia).
     - Modificada y Real se colorean con los mismos umbrales de desviación usados en el resto del tablero: verde (a tiempo/adelantado), naranja (retraso ≤30 días), rojo (retraso >30 días). Si el hito aún no tiene fecha Modificada ni Real, se muestra en su lugar un badge de estatus (Atrasado / C. retraso / Pendiente / A tiempo).
- **Fuente del dato "Real":** a diferencia de la columna "Fecha real" del Dashboard (contaminada por la cascada de Pronósticos y nunca usada para calcular estatus, ver Reglas de Negocio #3), el valor "Real" mostrado aquí proviene del campo **"Fecha Real" de la hoja Desviaciones**, hito por hito — es la primera superficie del tablero donde este dato se expone directamente al usuario como referencia visual.
- **Por qué importa:** permite a un PM o KAM auditar, hito por hito y sin salir del tablero, exactamente qué fecha se planeó, qué fecha se re-estimó y cuál fue (o sigue siendo) el resultado real — sin tener que abrir la hoja de cálculo original.

---

## Tab 4 — Insights IA

### ¿Qué es el Tab de Insights IA?

Es la pestaña de análisis automatizado del tablero. Muestra tarjetas de insights generados por inteligencia artificial que analizan el portafolio completo y producen diagnósticos accionables. Los insights se generan automáticamente de lunes a sábado, a las 8:00 AM y 3:00 PM (hora CDMX), y se almacenan en la hoja **"IA_Insights"** de la base de datos.

### ¿Qué tipos de insights existen?

Los insights se clasifican en tres tipos, cada uno con un tratamiento visual distinto:

**1. Alertas y riesgos (negativo):** tarjetas con borde izquierdo rojo y badge "ALERTA". Identifican problemas que requieren atención inmediata: proyectos en riesgo, cuellos de botella, desviaciones críticas, sobrecargas de PM, y patrones preocupantes. Se muestran primero.

**2. Logros y tendencias positivas (positivo):** tarjetas con borde izquierdo verde y badge "POSITIVO". Destacan lo que funciona bien: proyectos con buen desempeño, subcontratistas confiables, mejoras en SPI, y buenas prácticas a replicar.

**3. Contexto y resumen (informativo):** tarjetas con borde izquierdo azul y badge "INFORMATIVO". Proporcionan contexto general del portafolio: distribución de estatus AdO, resumen de On Hold, patrones de desviación por área responsable, o cualquier observación que no es necesariamente positiva ni negativa pero ayuda a entender el panorama. Incluyen análisis de desviación bruta vs. neta para contextualizar el impacto real de las pausas.

### ¿Qué estructura tiene cada tarjeta de insight?

Cada tarjeta contiene cuatro secciones:

- **Título:** encabezado conciso que resume el hallazgo.
- **Diagnóstico:** descripción del problema, logro o contexto identificado, siempre basado en hechos del portafolio.
- **Evidencia:** datos numéricos y métricas que sustentan el diagnóstico (PROJs específicos, porcentajes, días de desviación, comparaciones).
- **Recomendación:** acción sugerida para Dirección o el equipo responsable, con nivel de confianza. En insights informativos, esta sección puede contener observaciones contextuales en lugar de acciones directas.

### ¿Cómo interpretar la pestaña?

El orden de lectura recomendado es:

1. **Revisar alertas primero** (rojo): son las que requieren acción inmediata.
2. **Verificar logros** (verde): confirman qué está funcionando y qué se puede replicar.
3. **Leer informativos** (azul): proporcionan contexto para entender el panorama completo.

### Badge: Último Análisis IA

- **Concepto:** badge que muestra la fecha y hora del último análisis generado.
- **Interpretación:** si la fecha es de más de 24 horas (en día laboral), puede haber un problema con la generación automática.
- **Mensaje vacío:** si no hay insights disponibles, se muestra un mensaje indicando los horarios de generación (8:00 AM y 3:00 PM, lunes a sábado).

---

## Fuente de Datos

### ¿De dónde vienen los datos del tablero?

La fuente principal es el archivo **"Enlight One Database_Esquema 2026"** en Google Sheets. Este documento contiene múltiples hojas:

- **Dashboard:** hoja principal con toda la información de cada proyecto — datos generales, cascada de 4 fechas por cada uno de los 13 hitos (52 columnas de fechas), semanas esperadas/reales, fase actual, % de obra, % de proyecto, estatus AdO, total de On Hold, y Kick Off interno. Contiene 88 columnas.
- **Desviaciones:** hoja con el análisis de desviación hito por hito — incluye hito, fecha prevista, fecha real, días de desviación, tipo de desviación (Adelantado/Retraso), comentarios de retraso, área responsable, días de On Hold aplicables, y desviación neta. Contiene 26 columnas.
- **Pronósticos:** hoja con datos de las fases del proyecto con porcentajes de avance, fechas planificadas y reales por fase, semanas esperadas/reales, y estatus por fase. Incluye la fecha de corte como metadato. Contiene 54 columnas.
- **Configuración:** hoja con catálogos de referencia — tipos de proveeduría con semanas adicionales, tipos de proyecto, estatus AdO válidos, tipos de instalación con duración de ingeniería, y pesos porcentuales por hito para SFV y SAE.
- **IA_Insights:** hoja donde se almacenan los insights generados por IA, con columnas: timestamp, tipo (negativo/positivo/informativo), titulo, diagnostico, evidencia, recomendacion.
- **Datos de Entrada:** hoja base con datos crudos de los proyectos antes de procesamiento.
- **Registro On Holds:** historial detallado de periodos de On Hold por proyecto (PROJ, Sitio, Cuenta, Fecha Inicio, Fecha Fin, Duración).

La base de datos combina **datos manuales** (ingresados por el equipo de construcción, supervisores y PMs) con **fórmulas automatizadas** que calculan campos derivados como semanas esperadas, % de proyecto, y fase actual.

### ¿Qué campos se calculan automáticamente en la base de datos?

Los campos derivados más importantes son:

- **Semanas Esperadas:** duración planificada del proyecto en semanas, calculada según tipo de instalación, categoría de potencia y tipo de proveeduría (la hoja Configuración define los parámetros).
- **Semanas Reales:** semanas transcurridas desde el Pase a Operaciones hasta hoy (o hasta el cierre del proyecto).
- **Fase Actual:** determinada por la combinación de hitos cumplidos y pendientes.
- **% de Proyecto:** progreso global calculado como suma ponderada de los porcentajes de avance de cada hito, usando los pesos definidos en Configuración.
- **Total On Hold:** suma de todos los días de On Hold registrados para el proyecto.

---

## Reglas de Negocio Críticas

### ¿Qué reglas de negocio aplica el sistema?

1. **Fecha de referencia operativa:** la fecha tentativa tiene prioridad sobre la prevista. Si un hito tiene fecha tentativa, esa es la referencia para evaluar desviación y estatus. Si no tiene tentativa, se usa la prevista.

2. **Hitos Pendientes excluidos del SPI:** el SPI solo evalúa hitos cuya fecha de referencia ya pasó. Los Pendientes no afectan el índice para evitar distorsiones por hitos futuros.

3. **Fecha real con contaminación:** la columna "Fecha real" en la base de datos puede contener fechas futuras auto-populadas para hitos no cumplidos (efecto cascada de Pronósticos). El cálculo de estatus por hito **nunca lee esta columna** — solo usa prevista/tentativa/modificada, por lo que la contaminación no puede afectar el estatus. La protección equivalente para las métricas de desviación es el flag `cerrada`: un hito solo se considera cerrado (y entra al promedio de desviación neta/bruta "cerrada") cuando tiene una "Fecha modificada" genuina en Dashboard; de lo contrario se clasifica como desviación **abierta** (ver regla #8 y la gráfica "Desviación en curso por hito"). *Nota (sep. 2026):* esto aplica al **cálculo** de estatus, no a su despliegue visual — desde la actualización del panel expandible en la Tabla de Pronósticos (Tab 3), el valor de "Fecha Real" **de la hoja Desviaciones** (no la columna contaminada del Dashboard) sí se muestra al usuario como referencia informativa hito por hito.

4. **Umbral de punto flotante:** valores de % de obra como 1.0000000000000002 (error de punto flotante) se detectan con umbral > 1.01 para correcta normalización a porcentaje.

5. **Protección contra contaminación de subcontratistas:** el campo "Tipo de proveeduría" (EPC Enlight, EPC Mixto, etc.) nunca se usa como fallback para el campo de subcontratista. Son datos diferentes: uno es el modelo de ejecución, el otro es la empresa física que instala.

6. **Exclusión por calidad de datos:** proyectos sin ningún hito evaluable (sin fechas) o sin potencia/capacidad registrada se excluyen de las métricas de rendimiento y se señalan en el banner de calidad de datos.

7. **Default de filtro Estatus AdO:** al cargar el tablero, solo los proyectos con estatus "Activo" se muestran. El usuario puede cambiar este filtro para incluir otros estatus. Al limpiar todos los filtros, se restablece el default "Activo".

8. **Desviación neta como métrica principal, separada de la desviación abierta:** en las gráficas de desviación promedio por hito (Tab 2), se utiliza la desviación neta (sin On Hold) como métrica primaria, calculada **solo sobre hitos cerrados** (`cerrada = true`, es decir, con "Fecha modificada" genuina). Los hitos aún no cerrados alimentan una métrica separada, la desviación abierta (`promedioDesviacionAbierta`), que nunca se mezcla con la neta/bruta porque su conteo de días crece cada día que el hito permanece sin cerrar y contaminaría el promedio. La desviación bruta está disponible en las tablas expandibles para contexto. *Actualización (sep. 2026):* esta misma preferencia por el dato neto se extendió al nivel de detalle por proyecto — el número de "desviación en días" que se muestra al expandir un proyecto individual (Tab 1) ahora también prioriza el valor exacto de la hoja Desviaciones (neto si el hito está cerrado, bruto vigente si sigue abierto) en vez de recalcularlo siempre localmente, manteniendo consistencia entre los KPIs/gráficas agregadas y el detalle por proyecto.

9. **Proyectos cerrados en Gantt y scatters:** los proyectos donde todas las fases tienen estatus "cumplido" se renderizan con opacidad reducida (35–45%) para no distraer del portafolio activo. Se marcan con un check (✓) junto al PROJ.

10. **Categorización de desviación:** la severidad de desviación se clasifica en cuatro niveles: Crítico (>90 días), Alto (31–90 días), Moderado (8–30 días), En control (≤7 días). Estos umbrales aplican para los badges en la tabla de pronósticos.
