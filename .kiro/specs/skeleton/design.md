# Design: Campus Skeleton

## Shape of the skeleton
```
packages/skeleton/src
  types.ts        AppConfig, Field, Item, ItemAction, Theme
  utils.ts        validate, formatValue, matchesQuery, filterChoices, parseItems
  store.ts        useCollection (items in localStorage), useMe (display name)
  SkeletonApp.tsx header, toolbar, status chips, grid, detail, menu, name prompt
  ItemCard.tsx    card and shared ItemBody
  ItemForm.tsx    form generated from fields
  Meter.tsx       progress bar apps can use in renderExtra
  styles.css      light and dark themes through CSS variables
```

## Data model
`Item { id, createdAt, createdBy, values }`. All app data lives in `values`, a map keyed by field key. This keeps the skeleton generic. `createdBy` is the local display name, which is what ownership checks use.

## Extension points (all optional, all used by at least one app)
| Hook | Used by |
| --- | --- |
| `status.of(item, now)` | Lost & Found stores status. Study Séance derives it from time and seats. |
| `actions[]` | Claim and return (Lost & Found). Join and leave (Study Séance). |
| `beforeCreate` | Study Séance adds the creator to the members list. |
| `renderExtra` | Study Séance shows a seats meter. |
| `pills`, `summaryField` | Both. |

## Form handling
Inputs hold strings while typing. On submit each string is converted by field type (number, datetime to epoch ms), merged over existing values, and validated. People fields are not editable in the form and are changed by actions.

## Error handling
`parseItems` drops malformed entries instead of throwing. Storage errors are swallowed and the app keeps working in memory.

## Deployment
Each app is a separate static Vite site. On Vercel, import the repo once per app and set the root directory to `apps/<name>`.

## Correctness properties (candidates for property-based tests)
1. `validate` returns no errors for any values that satisfy every field rule.
2. `parseItems(JSON.parse(JSON.stringify(items)))` returns the same items.
3. Search with an empty query returns every item.
4. A derived status never changes the stored values.
