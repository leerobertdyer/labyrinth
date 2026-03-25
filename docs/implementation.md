# Labyrinth — Implementation Roadmap

## Where we are
Room architecture is modular. RoomManager drives entity placement, encounter triggers, and wall configs from a registry. Combat is triggerable. First room is functional if not yet final.

---

## Phase 1 — Core loop before content

Get the minimum viable game loop working end-to-end. Don't polish the starting room yet.

### 1.1 Death screen
<!-- - On death state, show a full-screen overlay: "You've lost your way" -->
<!-- - Options: Restart (defer load save to later) -->
<!-- - Block all controls until player chooses -->
<!-- - _Defers the amnesia/shopkeeper arc — that's Phase 3_ -->

### 1.2 Start screen
<!-- - New Game / Continue (disabled if no save) -->
<!-- - Brief lore fragment or title treatment — set the tone early -->
<!-- - No need for "About" yet; that's post-launch polish -->

### 1.3 Win/loss state plumbing
<!-- - XState: add `PLAYER_DIED` and `COMBAT_WON` transitions to the machine -->
<!-- - Wire reward XP on `COMBAT_WON` (even if XP does nothing yet — plumbing first) -->
<!-- - Death screen renders on `PLAYER_DIED` -->

### 1.4 Second room
<!-- - Unlock south gate after shopkeeper encounter resolves (win fight/talk past) - fight for now with low stats. -->
<!-- - Doesn't need to be interesting yet — a hall with nothing in it proves the connection system works -->
<!-- - Validates `connections` registry and room transition logic -->

---

## Phase 2 — Combat depth

Once the loop exists, the combat system is worth expanding.

### 2.1 Run mechanic
- Success probability based on player speed vs enemy speed stat
- Failed run: enemy gets a free attack
- Adds meaningful decision-making without much system work

### 2.2 Items / defense / magic stubs
- Define item and spell types even if only 1–2 exist
- Prioritize: healing item, one attack spell, one defense buff
- Luck stat: small random modifier on hit/crit calculations

### 2.3 Enemy conversation
- `talkative` stat (0–1) on Enemy type
- On combat start: roll against stat, if true show dialogue before first turn
- Shopkeeper has high talkative — sets up the Phase 3 arc naturally
- Can stub with hardcoded dialogue for now, Anthropic API integration later

### 2.4 XP and leveling
- Track XP after combat conclusion
- Simple level-up threshold (XP table or formula)
- Level affects stats — even rudimentary scaling matters for feel

--
Phase x: 
- Better UX around combat:
  - Pointer to which enemy card
  - Obvious Option to move back from enemy view
  - Enter Screen with character settings
    - Certain amount of starting points player can divvy up between core stats
        - Speed
        - ???? 
    - Get's more on level up
---
## Phase 3 or 5? - AUDIO!?
- Add music
  - Combat
  - Exploration
- Add SFX
    - Attack
    - Player Hit
    - Defended
    - Use Item
    - Use Spell
    - Click on menu change
    - Enter battle noise
    - Mumbles/grumbles for speech during chat
    - Dice roll sound
        - Speaking of dice rolls see ../dice.html (outside of repo) for css based 3d dice idea.
---

## Phase 4 — The shopkeeper arc _(ambitious, do last)_

This is the most narratively interesting part but also the most complex. Don't let it block Prev phases.

### What needs to exist first
- Win/loss states (Phase 1.3)
- Enemy conversation system (Phase 2.3)
- Death screen (Phase 1.1)

### The arc
1. Player enters, shopkeeper initiates — scary/hostile framing
2. Player loses combat (loss state triggered)
3. Instead of death screen: intercept `PLAYER_DIED` with a special flag on the encounter (`triggersAmnesia: true`)
4. Amnesia cutscene / text sequence
5. Shopkeeper entity swaps to a "friendly" variant (different model state or separate entity in registry)
6. Game restarts from entrance — shopkeeper is now helpful, gate to second room is open

### Implementation notes
- `triggersAmnesia` flag on `EncounterConfig` — RoomManager routes to amnesia flow instead of death screen
- Shopkeeper needs two modes: hostile (encounter entity) and friendly (regular NPC entity)
- Consider XState: amnesia arc is its own state with entry/exit actions

---

## Phase 4 — Visual pass

Don't do this until gameplay is solid. Visuals are expensive and you'll redo them if the game changes.

### 4.1 Animations
- Mixamo idle/walk/attack cycles via `useAnimations` from drei
- Priority order: player, then enemies, then background NPCs
- gltfjsx re-export with animation clips

### 4.2 Scene atmosphere
- Lighting: point lights on torches, ambient very low, colored fog
- Add a post-processing pass (bloom on lights, vignette)
- Particle FX for magic/combat events — use drei `<Sparkles>` or custom instanced mesh

### 4.3 Model customization
- Palette swaps via material override (easy, high impact)
- Custom geometry additions in Blender, re-exported

---

## Phase 5 — Persistence

### 5.1 Database schema (starting data)
- `players`: id, name, created_at
- `player_state`: player_id, current_room, hp, xp, level, inventory (jsonb), flags (jsonb)
- `rooms`: id, unlocked (bool) — tracks what's been opened
- `flags`: key/value store for story state (amnesia triggered, shopkeeper friendly, etc.)

### 5.2 Future data (sketch, don't build yet)
- `items`: id, name, type, stats
- `spells`: id, name, mp_cost, effect
- `enemies`: id, name, stats (if you move away from hardcoded)
- `save_slots`: multiple saves per user

### 5.3 Save/load flow
- Auto-save on room transition and combat conclusion
- Load from start screen
- Flag-based state restoration (room unlocks, shopkeeper mode, etc.)

---

## Deferred / optional

- About / lore section on start screen
- Sound design
- Mobile controls
- Multiple save slots
- Procedural room generation

---

## Not yet covered:
- mcp implementation
- npc manipulation of game
- amnesia stat what it does how it works
- filtering scene look and feel based on amnesia scale