# Redistribución del menú móvil — Simulador Mundial 2026

**Fecha:** 2026-06-10
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Problema

En móvil la cabecera del simulador acumula **tres filas de chrome** antes de mostrar contenido:

1. **8 pestañas** de navegación con scroll horizontal (`TabNav`): Grupos, Terceros, Eliminatorias, Probabilidades, Porra, Directo, Cuotas, Noticias.
2. **Barra de acciones**: dropdown *Acciones* + dropdown *Guardar / Compartir* (`ActionsMenu`, `SaveShareMenu`).
3. **Sub-pestañas + exportar**: toggle *Por grupos / Por fecha* + botón *Exportar imagen* (dentro de `GroupStageTab`).

El resultado se siente saturado, se come el alto útil y deja la navegación lejos del pulgar.

## Objetivo

Redistribuir la navegación móvil al patrón nativo de app (**bottom tab bar**), consolidar las acciones en una **hoja inferior** y dejar pegado al contenido solo lo que es específico de cada pestaña. **El desktop no cambia.**

Patrón validado contra apps de fútbol de referencia (FotMob, Sofascore, OneFootball, app oficial FIFA): bottom bar de 4-5 destinos + "Más" + bottom sheet para acciones.

## Diseño aprobado (Enfoque A)

### Reparto de la navegación

| Zona | Contenido |
|---|---|
| **Bottom bar (5 destinos)** | Grupos · Eliminatorias · Probabilidades · Porra · **Más** |
| **Dentro de "Más"** (bottom sheet) | Terceros · En directo · Cuotas · Noticias |
| **Hoja de acciones** (botón `⋯` en cabecera) | Simular por ranking · Rellenar escenario · Limpiar · Compartir enlace · Guardar predicción · Exportar imagen (contextual a la pestaña) |
| **Inline, pegado al contenido** | Toggle *Por grupos / Por fecha* (solo en Grupos), como segmented control |

### Reglas de comportamiento

1. **"En directo" se promociona fuera del "Más"** cuando `state.liveMode` está activo: aparece como destino propio en el bottom bar (icono rojo `#E61D25`) ocupando el 4.º slot en lugar de **Porra** (el primario de menor prioridad), que pasa al "Más". El bottom bar mantiene siempre 5 slots. Mientras no haya modo directo, "Directo" vive dentro de "Más" y Porra es primario.
2. **Solo móvil.** El bottom bar y la hoja de acciones se muestran únicamente en pantallas pequeñas. En `sm:` y mayores se mantienen `TabNav` y los dropdowns actuales **sin cambios**.
3. **Sin parpadeo de hidratación.** El reparto móvil/desktop se hace con clases de Tailwind (`sm:hidden` / `hidden sm:flex`), no con `useMediaQuery`. Ambos árboles se renderizan en SSR y CSS decide cuál se ve.
4. **El contenido gana padding inferior** en móvil (p. ej. `pb-24 sm:pb-0`) para que la barra fija no tape el final del scroll.

## Arquitectura

### Estado compartido de navegación

Hoy `active` (índice de pestaña) vive en `Dashboard` (`app/page.tsx`) y se pasa a `TabNav`. Se mantiene ahí. Tanto `TabNav` (desktop) como el nuevo `BottomTabBar` (móvil) son **componentes controlados** que leen `active` y llaman a `onChange` — comparten la misma fuente de verdad, así desktop y móvil quedan sincronizados.

La lista de pestañas (label, icono, nombre completo, color) se extrae de `TabNav.tsx` a un módulo compartido `lib/nav/tabs.ts` (o `components/nav/tabs.ts`) para que `TabNav` y `BottomTabBar` consuman la **misma** definición. Cada entrada gana un campo de prioridad/grupo que indica si es destino primario del bottom bar o va al "Más".

### Componentes nuevos

- **`BottomSheet`** (`components/ui/BottomSheet.tsx`) — primitivo reutilizable: scrim, panel inferior con esquinas redondeadas, "grab handle", cierre por click en scrim / ESC / swipe-down. Lo usan tanto el menú "Más" como la hoja de acciones. Responsabilidad única: presentación + cierre; el contenido se pasa como `children`.
- **`BottomTabBar`** (`components/nav/BottomTabBar.tsx`) — barra fija inferior (`fixed bottom-0`, `sm:hidden`). Renderiza los destinos primarios desde `tabs.ts` y un botón "Más" que abre un `BottomSheet` con los destinos secundarios. Controlado por `active` / `onChange`.
- **`MobileActionBar`** (`components/nav/MobileActionBar.tsx`) — botón `⋯` en la cabecera (solo móvil) que abre un `BottomSheet` de acciones. Contiene las acciones globales de escenario (Simular / Rellenar / Limpiar) y guardar/compartir, reutilizando la lógica existente de `ActionsMenu` y `SaveShareMenu`.

### Acción contextual de exportar

*Exportar imagen* depende del `ref` del contenido de la pestaña activa (hoy `gridRef` en `GroupStageTab`). Para que aparezca en la hoja de acciones sin acoplar la cabecera a cada pestaña:

- Se introduce un contexto ligero **`MobileActionsContext`** donde la pestaña activa **registra** su acción de exportar (handler + etiqueta) al montar y la limpia al desmontar.
- `MobileActionBar` lee del contexto y muestra "Exportar imagen" solo cuando hay una acción registrada.
- En desktop, `ExportButton` sigue inline en cada pestaña como hasta ahora.

Esto mantiene la cabecera desacoplada del contenido (cumple la regla de "entender la unidad sin leer sus internos") y evita prop-drilling.

### Reutilización de lógica de acciones

`ActionsMenu` y `SaveShareMenu` ya encapsulan el `dispatch` y la lógica de guardado/compartir. Se refactoriza para separar **la lógica/los items** (compartidos) de **la presentación** (dropdown en desktop, lista en bottom sheet en móvil), evitando duplicar la lógica de `localStorage`, `encodeScenario` y los feedbacks ("¡Enlace copiado!").

## Componentes afectados

| Archivo | Cambio |
|---|---|
| `app/page.tsx` | Añadir `BottomTabBar` y `MobileActionBar`; envolver en `MobileActionsContext`; padding inferior en móvil. |
| `components/TabNav.tsx` | Extraer la definición de pestañas a `tabs.ts`; añadir `hidden sm:flex` (desktop-only). |
| `components/group-stage/GroupStageTab.tsx` | En móvil, ocultar la fila de `ActionsMenu`/`SaveShareMenu` (van a la hoja); registrar la acción de exportar en el contexto; el toggle de vista se queda inline. |
| `components/ActionsMenu.tsx`, `components/SaveShareMenu.tsx` | Separar items/lógica de la presentación para reusar en el bottom sheet. |
| **Nuevos** | `components/ui/BottomSheet.tsx`, `components/nav/BottomTabBar.tsx`, `components/nav/MobileActionBar.tsx`, `lib/nav/tabs.ts`, contexto `MobileActionsContext`. |

## Accesibilidad

- Bottom bar: `role="tablist"` / `role="tab"` coherente con `TabNav`, `aria-current` en el destino activo, objetivos táctiles ≥ 44px.
- `BottomSheet`: foco atrapado mientras abierto, cierre con ESC, scrim con `aria-hidden`, restaurar foco al disparador al cerrar.
- Iconos con `aria-hidden` y etiqueta textual visible (igual que hoy).

## Testing

- **`tabs.ts`**: test unitario de la configuración (nº de primarios, que todo destino esté en primario o secundario, promoción de "Directo" según `liveMode`).
- **`BottomSheet`**: abre/cierra por scrim, ESC; atrapa foco; restaura foco.
- **`BottomTabBar`**: marca activo el destino correcto; "Más" abre la hoja con los secundarios; `onChange` se dispara con el índice correcto.
- **`MobileActionBar`**: muestra acciones globales; muestra "Exportar" solo cuando hay acción registrada en el contexto; dispara los `dispatch` correctos.
- **Regresión desktop**: `TabNav` y dropdowns siguen visibles en `sm:` y ocultos en móvil (snapshot/clases).

## Fuera de alcance (YAGNI)

- Gestos avanzados (swipe entre pestañas, drag del sheet con física).
- Reordenar/personalizar destinos por el usuario.
- Cambios de navegación en desktop.
- Animaciones más allá de un fade/slide básico del sheet.
