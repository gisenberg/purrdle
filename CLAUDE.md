# CLAUDE.md — Purrdle Project Guide

## What is Purrdle?

Purrdle is a cat-themed Wordle clone for children. Players guess cat-related words and phrases with cute, playful hint definitions. Deployed to GitHub Pages at `gisenberg.github.io/purrdle`.

## Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- No backend — fully static SPA with hash-based routing

## Project Structure

```
src/
  components/
    App.tsx          # Root — hash router, daily/random/specific modes
    Game.tsx         # Main game controller — keyboard events, modal state
    Grid.tsx         # 6-row guess grid with revealed position support
    Row.tsx          # Single row of tiles
    Tile.tsx         # Individual letter tile (handles space gaps, revealed style)
    Keyboard.tsx     # On-screen keyboard with color states
    HintPanel.tsx    # Progressive hint definitions with flip card animation
    GameOver.tsx     # End-of-game modal with all 3 definitions
  hooks/
    useGame.ts       # Core game state — guess logic, revealed positions, elapsed timer, share text
  lib/
    utils.ts         # Word selection, evaluation, keyboard states, routing helpers
  data/
    words.csv        # Word list (CSV source of truth) with definitions and quality scores
    words.csv.d.ts   # TypeScript declaration for CSV import
```

## Tone and Content

This is a child-friendly, adorable cat-themed game. All content should be cute, playful, and appropriate for kids.

- **Definitions** are written in a fun, whimsical style — cute imagery, cat puns, playful descriptions. Every definition should make a kid smile.
- **Words and phrases** are drawn from cat sounds, body parts, breeds, behaviors, and items.
- When adding new words or rewriting definitions, keep them wholesome and fun. The bar is "would this make a kid giggle and want to learn more about cats."
- Each word entry has 3 definitions. Definitions should NOT contain the word itself (it gets censored in hints).

## Color Scheme

Cute pastel palette:
- **Background**: Light lavender/purple (`bg-purple-50`)
- **Header**: White/translucent with pink accents
- **Correct tile**: Pink (`bg-pink-400`)
- **Present tile**: Violet (`bg-violet-400`)
- **Absent tile**: Light gray (`bg-gray-300`)
- **Empty tile**: White with pink border
- **Revealed tile**: Light pink (`bg-pink-100`)
- **Keyboard keys**: Pastel pink (`bg-pink-100`)
- **Progress bars**: Pink (`bg-pink-400`)

## Word List Format

The word list lives in `src/data/words.csv` — a CSV file that a Vite plugin (`csv-words-plugin.js`) converts to `WordEntry[]` at build time.

```csv
word,quality,def1,def2,def3
toe beans,3,The adorable little pink pads...,Nature's cutest jelly beans...,The squishiest most boop-able...
```

- 5 columns: `word`, `quality`, `def1`, `def2`, `def3`
- `word`: lowercase, max 6 characters for single words, spaces allowed for multi-word phrases
- `quality`: 1 (filler), 2 (solid), 3 (best cat words)
- Fields containing commas get quoted per CSV spec
- Header row is required

### Quality Scores

Words are scored 1-3. Selection is weighted so better words appear more often:
- **Quality 3** (5x weight): Iconic cat terms, best puns, most fun to guess
- **Quality 2** (2x weight): Solid cat vocabulary with good gameplay
- **Quality 1** (1x weight): Simpler/generic terms that still fit the theme

## Key Game Mechanics

### Revealed Positions (vowels + spaces)
- **Spaces** in phrases are always pre-filled as narrow gaps. Players never type spaces.
- **Vowels** (a, e, i, o, u) are pre-filled on the grid when the target is 8+ characters. They show with a dimmed "revealed" style.
- Both spaces and vowels are "given" — the player's typed input only fills non-revealed positions.
- Typing a revealed letter (e.g., the vowel the cursor just skipped over) is silently consumed so typing feels natural.
- All five vowels are dimmed on the keyboard when reveals are active, not just vowels in the target.

### Hints
- 1st hint shown immediately
- 2nd hint unlocks at 2 guesses OR 30 seconds elapsed (whichever first)
- 3rd hint unlocks at 4 guesses OR 60 seconds elapsed (whichever first)
- Game over modal shows all 3 definitions uncensored
- Locked hints show a thin pink progress bar filling toward their time threshold
- The 3rd hint's progress bar only appears after the 2nd hint is revealed, and starts from 0%
- Unlocking triggers a CSS 3D flip card animation (rotateX with backface-visibility)
- Timer (`elapsedSeconds` in `useGame.ts`) ticks every second while `gameStatus === 'playing'` and pauses on game end
- Flip card CSS lives in `src/index.css` (`.hint-card`, `.hint-card-inner`, `.flipped`)

### Modes
- **Daily** (`#/`): Deterministic word-of-the-day, saved to localStorage
- **Random** (`#/random`): Redirects to a specific word URL
- **Specific** (`#/w/{id}`): Shareable encoded word ID (XOR + base36)

### Share Text
Emoji grid (green/yellow/black squares), spaces render as double-space gaps. Includes shareable URL.

## Build & Deploy

```bash
npm run build    # TypeScript check + Vite build
npm run dev      # Local dev server
```

Deployed via GitHub Pages from the `dist/` directory. Base path is `/purrdle/`.

## Common Tasks

### Adding words
Add rows to `src/data/words.csv`. Each row needs `word`, `quality`, and 3 definitions. Single words must be 6 characters or fewer. Multi-word phrases have no length limit. Quote fields that contain commas. Run `npm run build` to validate.

### Changing game mechanics
Core logic lives in `src/hooks/useGame.ts` (input handling, guess submission) and `src/lib/utils.ts` (evaluation, keyboard states, word selection).

### Styling
Tailwind classes throughout. Tile colors defined in `Tile.tsx` and `Keyboard.tsx` via `stateColors` maps. Key states: `correct` (pink), `present` (violet), `absent` (gray), `revealed` (light pink), `empty` (white).
