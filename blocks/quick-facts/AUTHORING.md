# Quick Facts Accordion Authoring Contract

## Block-level fields (Quick Facts)

| Field | Required | Type | Description |
|---|---|---|---|
| `title` | No | Text | Section heading rendered above controls. |
| `contentZone` | No | Text | Optional content-zone identifier exposed as `data-content-zone` on block root. |

## Item-level fields (Quick Fact Item)

| Field | Required | Type | Description |
|---|---|---|---|
| `name` | Yes | Text | Accordion trigger label. |
| `description` | No | Rich Text | Body content in expanded panel. Supports inline markup. |
| `linkUrl` | No | Text URL | CTA destination. If absent, CTA is not rendered. |
| `buttonText` | No | Text | CTA label. Defaults to `Learn More` when empty and link exists. |
| `date` | No | Text | Sort date value used by Date sort (descending). |
| `openInNewTab` | No | Select (`true`/`false`) | Opens CTA in new tab when `true`; adds secure `rel` attributes. |

## Behavior notes

- Single-open accordion behavior is enforced.
- Sort options shown: Featured, A-Z, Z-A, and Date only when at least one item has date.
- Pagination: 10 items per page desktop, 5 items per page mobile.
- Empty state appears when no valid items are authored.

## Sample authored content row

- `name`: `Accepted Insurance Plans`
- `description`: `<p>We accept Medicare, Medicaid, and most commercial providers.</p>`
- `linkUrl`: `/insurance-and-billing`
- `buttonText`: `View Coverage`
- `date`: `2026-05-14`
- `openInNewTab`: `false`
