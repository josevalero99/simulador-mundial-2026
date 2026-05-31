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
