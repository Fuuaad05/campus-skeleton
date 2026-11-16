# Visual design

## Direction: paper from a campus office
Each app looks like a physical paper object you would get at a counter. No gradients, no blur, no glow. Flat colour, hard edges, real type.

| | Lost & Found | Study Séance |
| --- | --- | --- |
| Object | Manila luggage tag with a punched hole and a rubber stamp status | Cream admit-one ticket with a tear-off stub |
| Page | Manila paper with faint ruled lines | Dark room (`#1a1011`) |
| Type | Special Elite for headings, Barlow Condensed for stamps and labels | Young Serif for headings, IBM Plex Mono for details |
| Accent | Stamp red `#b3261e`, blue and green stamps for other states | Vermilion `#f06a3b` on dark, `#c2411a` on cream |
| Hero art | A hanging tag showing the newest open report and a live count | A ticket for the next session with a free seat, seats as filled boxes |

## How skins work
- The skeleton ships a plain, flat default look (`packages/skeleton/src/styles.css`) driven by CSS variables.
- Each app adds `src/skin.css`, scoped with `[data-app="<id>"]`, that overrides variables and restyles the `cs-` classes. The skeleton never contains app-specific colours or fonts.
- Hero artwork is a React function in the app (`TagArt`, `TicketArt`) passed through `config.hero.art`. It receives live items, so it never shows fake data.

## Copy rules
- Say the specific thing. "Somebody found your water bottle" beats "Reclaim your belongings".
- No filler verbs such as unlock, supercharge, streamline, seamless.
- One clear path in the hero: a primary button that opens the form, and a quiet link to the list.
- The name prompt appears only when someone first does something that needs a name, never over the hero.

## Responsive
Hero stacks below 820px. Cards use `auto-fill` columns. Ticket and tag art keep their shape and reduce rotation on small screens.
