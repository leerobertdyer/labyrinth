# Labyrinth — Audio Implementation Notes

A reference for when it's time to add audio. The game lives in the browser, so everything here is Web Audio API aware.

---

## The Browser Gesture Rule

Browsers block audio autoplay until a user interaction occurs. This is non-negotiable.

**The fix:** create your `AudioContext` (or Howler instance) on page load, then call `.resume()` inside the "New Game" / "Load Game" click handler. That single click satisfies the requirement for the entire session.

```ts
// Somewhere at app init
const ctx = new AudioContext(); // starts suspended

// Inside your start button handler
await ctx.resume(); // now you're unblocked
```

If you're using Howler.js, it handles this internally — but you still need to trigger your first `Howl.play()` inside a gesture handler.

---

## Recommended Stack

**Howler.js** over raw Three.js Audio for everything except true 3D positional sound.

- Better loop control (gapless looping, loop points)
- Audio sprite support (multiple SFX in one file)
- Fade in/out built in
- Handles the AudioContext resume automatically on first play

For **positional audio** (sounds that move with objects in 3D space), use Three.js `PositionalAudio` + `AudioListener` on the camera. Howler has a spatial mode too but Three.js integrates more naturally with R3F.

```ts
// R3F positional audio setup (rough shape)
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.PositionalAudio(listener);
sound.setRefDistance(5); // how fast it falls off with distance
```

---

## File Format

Logic Pro exports WAV/AIFF. Convert to OGG for the browser.

**Always keep your WAV masters.** Export OGG from those, never re-encode a lossy file.

```bash
# Single file
ffmpeg -i input.wav -c:a libvorbis -q:a 5 output.ogg

# Batch convert a directory
for f in *.wav; do ffmpeg -i "$f" -c:a libvorbis -q:a 4 "${f%.wav}.ogg"; done
```

| Quality flag | Approx bitrate | Use for |
|---|---|---|
| `-q:a 3` | ~110 kbps | Ambient loops, long tracks |
| `-q:a 5` | ~160 kbps | Music, complex SFX |
| `-q:a 7` | ~220 kbps | If you're paranoid |

OGG loops more cleanly than MP3 because MP3 encoding adds silence at the head and tail. For a game with looping ambient music, this matters.

---

## Suggested File Structure

```
/public
  /audio
    /music
      dungeon_ambient_01.ogg
      dungeon_ambient_02.ogg
      combat_theme.ogg
    /sfx
      footstep_stone.ogg
      door_creak.ogg
      combat_hit.ogg
      combat_miss.ogg
      ui_select.ogg
      ui_confirm.ogg
    /voice
      npc_mumble_neutral.ogg
      npc_mumble_hostile.ogg
      npc_mumble_pain.ogg
```

---

## Ambient / Atmospheric Music

### Composing for loops in Logic

- Work in a **cycle region** and audition the loop constantly while composing
- Avoid hard transients at the loop point — let things fade or sustain through it
- Long loops (60–90 sec) are better than short ones; short loops become noticeable fast
- Layers work well: a base drone + occasional melodic layer that drifts in and out
- Gothic/surreal tonal palette: minor keys, tritones, open fifths, slow LFO movement

### Practical loop tip

Leave a short fade at the tail and crossfade at the loop point in Howler:

```ts
const ambience = new Howl({
  src: ['/audio/music/dungeon_ambient_01.ogg'],
  loop: true,
  volume: 0.4,
});
```

Howler's `loop: true` handles the crossfade. For manual crossfades between tracks (e.g. entering combat), use `.fade()`:

```ts
ambience.fade(0.4, 0, 2000); // fade out over 2s
combatTheme.play();
combatTheme.fade(0, 0.6, 2000); // fade in
```

---

## Sound Effects

### Categories to plan for

- **Footsteps** — vary by surface (stone, dirt, wood). Even 2–3 variants with random pitch shift prevents repetition fatigue.
- **Combat** — hit, miss, death, player hurt. Keep these short and punchy (< 1 sec).
- **UI** — menu select, confirm, back. These are heard constantly so keep them subtle.
- **Environment** — door open/close, ambient drips, wind through cracks. Feeds the atmosphere.

### Pitch randomization (prevents ear fatigue)

```ts
const step = new Howl({
  src: ['/audio/sfx/footstep_stone.ogg'],
  rate: 0.9 + Math.random() * 0.2, // ±10% pitch variation
});
```

### Audio sprites

If you have many short SFX, bundle them into one file to reduce HTTP requests:

```ts
const sfx = new Howl({
  src: ['/audio/sfx/sprites.ogg'],
  sprite: {
    hit:    [0,    500],
    miss:   [500,  400],
    select: [900,  300],
  }
});

sfx.play('hit');
```

---

## NPC Mumble Voice (Vocables / Gibberish Voice)

### What this technique is

Used in Zelda, Animal Crossing, Undertale, and others. Instead of real words, you record phoneme-shaped sounds — consonant/vowel patterns that feel like speech without meaning anything. The listener's brain fills in the rest.

For Labyrinth's tone, lean toward:
- Slower cadence than Zelda (which is quick and cheerful)
- More breath, more consonant weight — "grh", "veth", "sulum" type sounds
- Dissonant or raspy timbre for the hostile state

### How to record in Logic

1. Record raw takes with a mic — experiment with mouth position, throat resonance, soft vs. hard consonants
2. Use **Flex Time** to stretch/compress without pitch change if you need timing adjustment
3. A touch of **reverb** and **low-pass filtering** makes it feel like it's coming from somewhere otherworldly
4. Optional: run it through a **vocoder** or **pitch shifter** for inhuman effect

### Implementation approach

Map mumble sounds to dialogue state. Since your NPC is driven by the Anthropic API, you can tag the response with an emotional state and play the corresponding mumble set:

```ts
// Conceptual — tag your LLM responses with mood
type NpcMood = 'neutral' | 'hostile' | 'pain' | 'cryptic';

const mumbleSounds: Record<NpcMood, Howl> = {
  neutral: new Howl({ src: ['/audio/voice/npc_mumble_neutral.ogg'] }),
  hostile: new Howl({ src: ['/audio/voice/npc_mumble_hostile.ogg'] }),
  pain:    new Howl({ src: ['/audio/voice/npc_mumble_pain.ogg'] }),
  cryptic: new Howl({ src: ['/audio/voice/npc_mumble_cryptic.ogg'] }),
};

function playMumble(mood: NpcMood) {
  Object.values(mumbleSounds).forEach(s => s.stop());
  mumbleSounds[mood].play();
}
```

Have the mumble play while the text typewriters in, and stop when the text finishes — mimics the feel of speech.

---

## Positional Audio (3D Space)

Use Three.js `PositionalAudio` for sounds that should move with objects in the scene — a hostile NPC approaching, a door mechanism, ambient drips from a specific corner.

Key parameters:
- `setRefDistance(n)` — distance at which volume is at 100%. Smaller = falls off faster.
- `setRolloffFactor(n)` — how quickly it drops after ref distance. Default 1, increase for more dramatic falloff.
- `setMaxDistance(n)` — beyond this, volume is 0.

```ts
// Attach to an NPC mesh
const npcSound = new THREE.PositionalAudio(listener);
npcSound.setRefDistance(3);
npcSound.setRolloffFactor(2);
npcMesh.add(npcSound); // moves with the mesh automatically
```

---

## XState Integration (Combat Audio Cues)

Since Labyrinth uses XState v5 for combat, fire audio from state transition actions rather than React effects. This keeps audio in sync with actual state rather than render cycles.

```ts
// Inside your combat machine actions
actions: {
  playHitSound: () => sfx.play('hit'),
  playMissSound: () => sfx.play('miss'),
  playDeathSound: () => sfx.play('death'),
}
```

Avoid triggering audio from `useEffect` watching state — you'll get double-fires in Strict Mode (which you've already been burned by).

---

## Quick Checklist Before Shipping Audio

- [ ] AudioContext resumed inside a gesture handler
- [ ] WAV masters stored outside `/public`
- [ ] All browser-facing files are OGG
- [ ] Loops auditioned for seam artifacts
- [ ] SFX have pitch variation to avoid fatigue
- [ ] Volume levels balanced (music should sit under SFX)
- [ ] Positional audio tested at various distances
- [ ] Mumble sounds mapped to NPC mood states
- [ ] Audio fires from XState actions, not React effects
