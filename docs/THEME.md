# Artopus colour theme

The supplied Artopus India light/dark screenshots are the visual reference. This palette follows that direction with stronger text contrast, consistent surface roles and a restrained use of bright accents. These values are chosen for this implementation; they are not claimed to be sampled from the original site's source.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Page background | `#F8FAFC` | `#050912` |
| Card/header surface | `#FFFFFF` | `#101725` |
| Secondary surface | `#F1F5F9` | `#151E30` |
| Main text | `#111827` | `#F8FAFC` |
| Supporting text | `#475569` | `#C2CADA` |
| Purple text/focus | `#7C3AED` | `#A78BFA` |
| Primary button | `#7C3AED` | `#7C3AED` |
| Button hover | `#6D28D9` | `#6D28D9` |
| Main divider | `#DCE1EB` | `#2B3548` |

Creative highlights are orange `#FF6B00`, pink `#EC4899` and cyan `#0EA5E9`. Use them for decorative details and art imagery. Use the semantic text colours for body copy; the highlight colours are not general-purpose text colours.

## Usage

The source of truth is `apps/web/src/styles/index.css`. Tailwind semantic utilities such as `bg-paper`, `bg-surface`, `text-ink`, `text-muted`, `text-accent` and `border-line` resolve to the current mode. Avoid hardcoded white or stone colours in components.

Purple is the primary interaction colour. Keep the warm/cool hero glow subtle, surfaces clean and corners rounded. Orange/pink/cyan highlights support the palette without competing with navigation or buttons. Use a lighter purple for dark-mode links and focus rings while retaining white text on the primary purple button.

## Light and dark modes

`public/theme-init.js` applies the saved or system preference before rendering. `useColorTheme` follows system changes until a visitor chooses a mode, persists an explicit choice, and syncs changes from other tabs. The accessible ThemeToggle is available in the public header, admin shell and login page.

The localStorage key `artopus-color-theme` contains only a visual preference; authentication remains cookie-based. If storage is blocked, the switch still works on the current page. Both modes retain the same content and navigation. Motion is limited and respects reduced-motion preferences.

## Scope

The public website uses this colour system throughout its layouts, filters, cards, articles and contact channels. Administrator implementation remains on the phased task list.
