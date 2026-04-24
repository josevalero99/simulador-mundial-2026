---
name: Jira / Atlassian — setup para Bionta
description: Site, cloudId, proyecto y tipos de issue disponibles para crear tareas vía MCP Atlassian.
type: reference
---

Conexión a Jira para crear tareas del proyecto Bionta.

- **Site:** `biontagourmet.atlassian.net`
- **CloudId:** `a0f38151-2edc-4b09-93e8-f33dc2c75200`
- **Proyecto único visible:** `KAN` — *MVP Bionta* (Kanban, next-gen)
- **Cuenta:** biontagourmet@gmail.com (accountId `712020:39497b00-f02f-45e0-8b3b-3f2b2b219675`)

**Tipos de issue disponibles (español):**
- `Epic` (id 10001, hierarchy 1) — colección de historias/tareas
- `Feature` (id 10003, hierarchy 0) — funcionalidad amplia
- `Historia` (id 10005) — user story
- `Tarea` (id 10004) — trabajo pequeño independiente
- `Error` (id 10006) — bug
- `Subtask` (id 10002, hierarchy -1)

**MCP:** server `atlassian` en `.mcp.json` (SSE → `mcp.atlassian.com/v1/sse`), habilitado en `.claude/settings.local.json` (`enabledMcpjsonServers: ["figma", "atlassian"]`).

**Deprecación SSE:** el endpoint SSE quedará deprecado el **2026-06-30**. Migrar `.mcp.json` a `https://mcp.atlassian.com/v1/mcp` (Streamable HTTP) antes de esa fecha.

**How to apply:** usar `cloudId = a0f38151-2edc-4b09-93e8-f33dc2c75200` y `projectKey = KAN` en todas las llamadas `mcp__atlassian__*`. Para tareas de dev/producto del MVP, por defecto tipo `Tarea` salvo que el contexto pida `Historia`, `Feature` o `Epic`.
