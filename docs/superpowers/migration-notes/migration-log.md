# Migration log — Figma multi-archivo

Registro cronológico del progreso de la migración.

## 2026-05-31

- **Capa 0 · Task 1** — Safety net creado. Archivo origen duplicado y renombrado a
  `Bionta Design — Legacy snapshot 2026-05-20` (key `lDt77i5sEWleOM8CQk9fCI`).
  Snapshot intocable como red de seguridad.
- **Capa 0 · Task 2** — Inventario capturado (`inventory-2026-05-31.md` + `variables-source.json`).
  Hallazgos: 79 variables OK (28+36+15, solo modo único, sin Dark). **Discrepancias con el plan:**
  (1) design system real = 1351 comp / 69 sets, no 27/147 (inflado por variantes de iconos);
  (2) 20 páginas, no ~10; (3) las páginas Calendario (`730:24739`) y Prototype (`696:22802`)
  citadas en el plan NO existen como páginas → resolver en Capa 3.
- **Capa 1 · Task 3-5** — `Bionta — Foundations` creado (key `BKGqaN0gWxAp8ixPWp5SZk`).
  8 páginas internas creadas (README, System Index, Color, Typography, Spacing & Grid,
  Effects & Radii, Variable collections, Archive); "Page 1" eliminada. README inicial
  (texto plano) construido y validado por screenshot. Naming: usuario eligió convención
  `Bionta — Foundations` (rename manual pendiente; key no cambia).
- **Capa 1 · Task 6** — Color variables migradas a Foundations. Collections `Color — Primitives`
  (28) + `Color — Semantic` (36 aliases, 36/36 enlazados OK). Showcase en página 🎨 Color con
  swatches bound a tokens, validado por screenshot. Gotcha resuelto: `resize()` en eje primario
  de auto-layout lo fuerza a FIXED → fijar tamaño tras append + usar `layoutSizingVertical=HUG`.
- **Capa 1 · Task 7** — Typography migrada. Collection `Typography` (15 vars) + 10 text styles
  (todos Clash Display, disponible en el archivo nuevo). Showcase en página 🔤 Typography con
  frases reales, validado por screenshot. ✅ Ningún estilo usa Bold. ⚠️ Price/L y Price/M usan
  Semibold (> Medium) — preservado del origen; tensión con "max weight Medium" anotada para
  revisión futura (fuera de alcance de esta migración estructural).
- **Capa 1 · Task 8** — Spacing/Grid/Effects/Radii (`effects-grid-notes.md`). Origen sin styles
  con nombre → canonicalizados: collection `Radius` (7, escala 4px), 4 effect styles `elevation/*`
  (de sombras reales observadas en scan de 31k nodos), 4 grid styles (Desktop/Tablet/Mobile/Base 4px).
  Showcases en 🌀 Effects & Radii y 📐 Spacing & Grid validados. ⚠️ Origen tenía 2 sistemas de
  sombra paralelos (verde-card + rampa navy) → consolidar a futuro. Total Foundations: 86 vars /
  4 collections, 4 effect + 4 grid + 10 text styles.
- **Capa 1 · Task 9** — System Index en página 🗺️. Diagrama de dependencias (Foundations → Icons →
  Components → Product/Backoffice), tabla de los 5 archivos con estado por capa, principios y links
  externos. Validado por screenshot. Falta solo Task 10 (publicar — MANUAL del usuario) para cerrar Capa 1.
- **Capa 1 · Task 10** — Foundations publicado como librería por el usuario. ✅ CAPA 1 COMPLETA.
  Archivo renombrado a `Bionta — Foundations` (verificado en vivo) + republish. Nombre consistente.
- **Capa 1b · Task 11** — `Bionta — Icons` creado (key `7WR2fbQIB8Jf5stwHLcnv3`). Foundations
  activada como librería (verificado: las 4 collections disponibles vía teamLibrary API). 5 páginas
  (README · Icons — Material · Logos · Sandbox · Archive), Page 1 eliminada, README validado.
- **Capa 1b · Task 12** — 20 icon components migrados (copy-paste cross-file) a 🔣 Icons — Material.
  ✅ 20/20 verificados, 0 variables locales copiadas (usuario no pulsó "Copy variables").
  El icono de marca `bionta` tenía 1 ref colgante en su stroke a `Icon Color/icon-black` del origen
  → re-bindeada a Foundations `neutral/900` (remote/library). Sección renombrada a "Material Symbols".
  Pendiente Task 13: decidir si `bionta` (hoja) se mueve a 🏷 Logos.

---

## ⏸️ FIN DE SESIÓN 2026-05-31 — RETOMAR AQUÍ

**Completado:** Capa 0 ✅ · Capa 1 ✅ (Foundations publicado) · Capa 1b Tasks 11-12 ✅ (Icons creado + 20 iconos).

**[ACTUALIZADO 2026-05-31 +sesión]** Task 13 (Logos) APLAZADA por decisión del usuario
(saltarse sociales). Logos se rellenará luego (logo blanco + set social) con un republish.
Task 14 hecha: Icons publicado como librería + fila Icons en System Index → "✅ publicado".
**CAPA 1b CERRADA.** Próximo: **Capa 2 — Components** (empieza creando `Bionta — Components`).

- **Capa 2 · Task 15** — `Bionta — Components` creado (key `t4j7zBnG6HC7CQuQmt8Ug3`). Foundations
  activada (4 collections disponibles) + Icons activada por el usuario. 6 páginas (README · Primitives ·
  Patterns · Audit · Sandbox · Archive), Page 1 eliminada, README montado. Próximo: Task 16.1 clasificar.
- **Capa 2 · Task 16.1** — Clasificación (`components-classification.md`). Canónico = "🧩 Components — v1".
- **Capa 2 · Task 16.2** — Sección v1 completa pegada (35 sets + 13 comps, 0 vars locales). **Sweep de
  re-binding de tokens a Foundations: 1137 fills + 101 strokes → 1724 bindings ahora a Color — Semantic
  de Foundations, 0 al origen.** (Gotcha: `boundVariables.fills[i]` ES el VariableAlias, no `.color`.)
  Reparto: L1-L2 + Doc en 🧱 Primitives, L3-L7 en 🧬 Patterns. Validado por screenshot (colores intactos).
  Pendiente: cherry-pick legacy (Avatar/Alert/Tooltip/Loader/ProgressBar) · Audit · publicar · swap.
- **Capa 2 · cherry-pick DESCARTADO** — los 5 legacy son de template genérico off-brand + librería
  externa "Tokens". Decisión usuario: saltarlos. Backlog: diseñarlos nativos Bionta. v1 queda como
  set canónico completo. Pendiente Capa 2: Audit (opcional) · publicar Components · swap library en origen.
- **Capa 2 · Task 17-18** — Verificación final: 35 sets + 13 comps (19+5 Primitives / 16+8 Patterns),
  0 refs colgantes, 0 vars locales. Components **publicado** por el usuario. Fila Components en System
  Index → "✅ publicado". **Swap library en origen (Task 18.2) SALTADO deliberadamente** (recomendación):
  el origen se archiva en Capa 5 y sus pantallas se re-migran con rebind en Capas 3-4 → swap redundante
  y arriesgado. Página 📋 Audit dejada vacía (opcional, documentación). **🎉 CAPA 2 CERRADA — 3/3 librerías publicadas.**

---

## ✅ ESTADO 2026-05-31 — 3 LIBRERÍAS PUBLICADAS

Capa 0 ✅ · Capa 1 ✅ (Foundations) · Capa 1b ✅ (Icons, Logos aplazada) · Capa 2 ✅ (Components).
**Próximo: Capa 3 — Product** (pantallas cliente). Empieza creando `Bionta — Product` + activar las 3 librerías.

- **Capa 3 · Task 19-20** — `Bionta — Product` creado (key `TwvvuI6zvq2cK59pM4TdvQ`). Foundations activada
  (verificado); Icons+Components activadas por usuario (no verificable vía vars API). 11 páginas creadas,
  secciones ✅ Canonical + 🧪 Exploraciones en las 6 páginas de pantalla, README montado.
  Próximo: Task 21 migrar Home (canónico en origen pág. `603:5435` 🧭 Home Audit — Product Lens).

---

## ⏸️ FIN DE SESIÓN 2026-05-31 (2ª parada) — RETOMAR EN MIGRACIÓN DE PANTALLAS

**Completado hoy:** Capa 0 ✅ · Capa 1 ✅ · Capa 1b ✅ · Capa 2 ✅ (3 librerías publicadas) ·
Capa 3 estructura ✅ (Product creado, 11 páginas, secciones Canonical/Exploraciones, README).

**En curso: Capa 3 · Task 21 — migrar Home** (bloqueado en decisión de usuario: cuál Home es canónico).

### Hallazgos de investigación (NO re-investigar):
**3 versiones de Home en el origen** — el usuario debe elegir la canónica:
1. Página "Home" (`300:2840`) → sección "landing" (4537×4840) + "Landing-mobile" (440×4186). **v1 antigua**.
2. Página "🧭 Home Audit — Product Lens" (`603:5435`) → sección análisis anotado (1960×6334). No es diseño limpio.
3. Página "🏠 Design v2" (`606:6018`) → sección **"Home"** (2443×7729). **Parece la v2 más nueva/limpia**.

**🎬 Prototype LOCALIZADO** (resuelve open question): página "🏠 Design v2" → sección
**"🎬 Prototype — User Journey v1"** (11780×8400). El plan citaba `696:22802` (inexistente).
También en Design v2: sección **"🔄 Migrated to DS — v1"** (20000×7571) — revisar qué es.

### Cómo retomar (patrón por pantalla, Tasks 21-26):
1. Usuario decide qué versión de la pantalla es canónica (hay v1/v2/exploraciones).
2. Copy-paste cross-file: canónico → sección ✅ Canonical de su página en Product; resto → 🧪 Exploraciones.
   NO pulsar "Copy variables" en el toast.
3. [MCP] Sweep de re-binding de tokens a Foundations (mismo método que componentes: match por nombre,
   `boundVariables.fills[i]` ES el alias). Verificar 0 refs colgantes.
4. [VERIFY] Instances apuntan a librería remota Components (si hay locales → swap library).
5. Repetir para PDP · Carrito · Checkout · Mi Cuenta · Calendario.
6. Task 27: re-wire prototype (sección localizada arriba). Gotcha: OVERLAY no acepta SMART_ANIMATE.

**Nota conexión:** 5 archivos pueden estar conectados al Bridge; el origen se desconecta al cambiar
de pestaña → re-Run plugin si hace falta. Verificar archivo activo antes de escribir (figma.root.name).

Backlog acumulado:
- Logos: rellenar página 🏷 Logos de Icons (logo blanco + set social) + republish.
- Primitives legacy: diseñar Avatar/Alert/Tooltip/Loader/ProgressBar nativos Bionta.
- 📋 Audit (Components): copiar auditoría P0/P1/P2 del origen (opcional).
- Calendario/Prototype: el plan citaba node IDs inexistentes — localizar en Capa 3.

**~~En curso: Capa 1b · Task 13 — Logos~~** (aplazada — ver arriba):

Decisiones ya tomadas por el usuario:
- Logos sociales: **copiar el set genérico completo** (~30 iconos) desde origen `Design System` → frame "Social" (`152:8040`).
- Logo Bionta: **copiar la instancia del header** (`bionta_logo_wp 1`, ej. `300:3235`). ⚠️ Es la versión BLANCA (para nav oscuro) — al pegar saldrá invisible sobre fondo claro; al montar el layout poner sobre tile oscuro.

**Pasos pendientes para retomar:**
1. Usuario hace 2 copy-paste cross-file a `Bionta — Icons` / página `🏷 Logos`:
   - Frame "Social" (Design System `152:8040`).
   - Logo `bionta_logo_wp 1` desde un header de Home. NO pulsar "Copy variables" si sale el toast.
2. [MCP] Verificar lo pegado + limpiar refs colgantes (como en Task 12).
3. [MCP] Montar layout limpio en Logos: logo blanco sobre tile oscuro + grid de sociales etiquetado.
4. [VERIFY] Decidir si mover `Icon / bionta` (hoja) de Material a Logos.
5. **Task 14** — Publicar Icons como librería (MANUAL) + actualizar fila Icons en System Index de Foundations → cierra Capa 1b.

**Conexión MCP:** abrir en Figma Desktop con Bridge corriendo los archivos que se vayan a tocar.
Keys en `file-keys.md`. Recordar: el origen (`Bionta Design`) se desconecta del Bridge al cambiar de pestaña — re-Run el plugin si hace falta.
