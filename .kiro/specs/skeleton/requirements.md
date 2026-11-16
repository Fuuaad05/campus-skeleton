# Requirements: Campus Skeleton

## Introduction
A reusable skeleton that turns a config object into a complete campus micro-app, proven by two distinct apps.

## Requirements

### 1. Describe an app in one config
**User story:** As a developer, I want to define my app's data and behaviour in one file, so that a new app takes minutes.

1. The config SHALL define id, name, tagline, emoji, theme, item names, fields, and a title field.
2. Fields SHALL support the types text, longtext, number, select, datetime and people.
3. Fields SHALL support required, min, max, options, default, searchable, filterable, hideInForm and hideInCard.
4. WHEN a developer runs `npm run new-app -- <name>` THEN the system SHALL create `apps/<name>` from the template with the name filled in.

### 2. Browse
1. The skeleton SHALL provide a search box over the title and every searchable field.
2. The skeleton SHALL provide a filter for each filterable select or text field.
3. The skeleton SHALL provide a sort by newest and a sort by each datetime field.
4. WHEN the config defines a status THEN the skeleton SHALL show a badge per item and a chip with a count per status that also filters.
5. WHEN nothing matches THEN the skeleton SHALL show an empty state with a way to clear filters.

### 3. Create and edit
1. The form SHALL be generated from the field definitions.
2. WHEN a required field is empty or a number is out of range THEN the form SHALL block saving and show a message next to the field.
3. Only the creator of an item SHALL be able to edit or delete it.
4. The config MAY adjust values before an item is created (`beforeCreate`).

### 4. Actions and extensions
1. The config MAY define actions with a visibility rule and a function that returns the values to merge.
2. The config MAY render extra content on cards and in the detail view (`renderExtra`).
3. The status MAY be derived from the item and the current time.

### 5. Identity and data
1. On first run the skeleton SHALL ask for a display name and store it locally.
2. Data SHALL persist in localStorage under a key based on the app id.
3. On first run the skeleton SHALL show the sample items from the config.
4. The user SHALL be able to export, import and delete all data. Imports SHALL ignore malformed items.

### 6. Two applications
1. `apps/lost-and-found` SHALL implement lost and found reports with a claim and return workflow.
2. `apps/study-seance` SHALL implement study sessions with seats, join and leave, and a derived status.
3. The two apps SHALL differ in fields, status rules, actions and theme, and SHALL share all UI code from the skeleton.
