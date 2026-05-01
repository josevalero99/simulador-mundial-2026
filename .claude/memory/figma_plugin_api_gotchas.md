---
name: Figma Plugin API — gotchas que ya pagué
description: Cosas no obvias del Plugin API que me han hecho perder tiempo y no quiero repetir
type: feedback
---

**Why:** trabajando con figma-console MCP (Desktop Bridge) sobre el archivo Bionta Design, hay propiedades que la docs no aclara que son read-only o que tienen restricciones por tipo de acción. Anoto las que me han mordido para no repetir.

**How to apply:** consultar antes de intentar algo "obvio" que falle con error críptico.

## Reactions y prototype

**1. `OVERLAY` navigation NO acepta `SMART_ANIMATE` transition.**
- Error: `Reaction at index 0 was invalid` (genérico, sin pista útil).
- Causa: smart-animate compara layers entre source y destination. En un OVERLAY, el destination es contenido completamente nuevo (drawer, modal) — no hay layers que matchear.
- Transitions válidas para OVERLAY: `DISSOLVE`, `MOVE_IN`, `MOVE_OUT`, `PUSH`, `SLIDE_IN`, `SLIDE_OUT`, `null` (instant).
- Para NAVIGATE entre frames similares (e.g. estados de un mismo componente) sí se usa SMART_ANIMATE.

**2. `prototypeDevice` en PageNode es read-only.**
- Intentar `dv2.prototypeDevice = { type: 'NONE' }` → `TypeError: object is not extensible`.
- El device preset (Desktop, MacBook Pro 14", iPhone) se cambia desde la UI de Figma, panel Prototype del page → Device dropdown.
- Imposible automatizar — para cada prototipo nuevo, cambio manual.

**3. `overlayPositionType` y `overlayBackgroundInteraction` también read-only.**
- Si quieres un drawer right-pinned con scrim (backdrop), tienes que dibujar el scrim como rectangle a mano dentro del overlay frame. La opción "Background" en el Prototype panel se aplica solo desde UI.
- Workaround usado: overlay frame 1440×900 con `Backdrop` rectangle (50% black) llenándolo + drawer panel right-pinned 440×900 dentro. Backdrop tiene su propia `CLOSE_OVERLAY` reaction al click.

**4. Reaction schema (2025+):**
- Usar **`actions` plural**, NO `action` singular. La docs todavía muestra `action` en algunos sitios.
- `setReactionsAsync()` requiere `[{ trigger, actions: [...] }]`.
- El `transition` puede ser `null` para instantáneo.

## Componentes huérfanos

**5. COMPONENTs sin `parent` siguen existiendo en el archivo.**
- Si arrastras un componente fuera de cualquier sección/page-direct, queda como "Local Component" en el panel Assets pero `parent: null`.
- `node.removed` devuelve `false` aunque no se vean en canvas.
- Esto explica por qué buscar visualmente "elementos test para borrar" puede fallar — los huérfanos no aparecen al hacer fit-screen del archivo.
- Para encontrarlos: `figma.root.findAllWithCriteria({ types: ['COMPONENT'] })` filtrar por `parent === null`.

## Text properties

**6. Para set componentPropertyReferences en text nodes, las fonts deben estar cargadas.**
- Error si no: `Cannot write to node with unloaded font "Clash Display Medium"`.
- Cargar TODAS las fonts del subtree antes de cualquier mutación de textos vía `figma.loadFontAsync({ family, style })`.
- Truco: recolectar fontNames con `text.getStyledTextSegments(['fontName'])` y cargar cada (family, style) único antes de modificar.

**7. `setRangeFontName` per-segment es la forma de override fonts en text.**
- Si un text node tiene `textStyleId` aplicado, settear directamente `fontName` puede ignorarse o detachear el style impredeciblemente.
- Forma robusta: para cada segmento devuelto por `getStyledTextSegments`, llamar `setRangeFontName(start, end, target)`.
- Si quieres "limpiar" el text style aplicado, usar `setTextStyleIdAsync('')` antes.

## Resize y auto-layout

**8. Resize de un nodo en HUG horizontal/vertical no surte efecto.**
- Si `layoutSizingHorizontal === 'HUG'`, el ancho se recalcula desde el contenido.
- Antes de llamar `node.resize(w, h)`, verificar que el sizing sea `FIXED` o forzarlo con `layoutSizingHorizontal = 'FIXED'` antes.

## Scale / screenshots

**9. `figma_take_screenshot` con scale: '2'` (string) falla — debe ser number.**
- Error claro pero fácil de pasar al construir queries dinámicas. Forzar `Number()`.

**10. Screenshots de un node con children ABSOLUTE-positioned fuera del bounds NO los incluyen.**
- Si tu pill está en `y: -28` (fuera del card), screenshot del card no la mostrará. Hacer screenshot del PADRE del padre o cambiar la posición relativa.
