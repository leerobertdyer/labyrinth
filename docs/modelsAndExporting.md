# Models

## Sources

**Quaternius** — free, low-poly, game-ready character packs with animations pre-baked. Preferred format is `.blend` (opens natively in Blender with rig and materials intact). Avoid `.obj` — no rig support.

**Sketchfab** — filter by downloadable + animated + low poly. License check required (CC0 or CC-BY for free use).

**itch.io** — indie devs sell/give away character packs, often $2–10. Search "low poly dungeon enemies."

**Kenney.nl** — already in use for environment assets. Dungeon Kit and character packs have stylized creatures.

---

## Pipeline: `.blend` → `.glb`

Blender can run headless. To batch export an entire folder of `.blend` files to `.glb`:

```bash
# Add Blender to PATH if needed (Mac)
export PATH="/Applications/Blender.app/Contents/MacOS:$PATH"

for f in *.blend; do
  blender "$f" --background --python-expr "
import bpy
bpy.ops.export_scene.gltf(filepath='${f%.blend}.glb', export_format='GLB')
"
done
```

Run from the directory containing the `.blend` files. Output `.glb` files land in the same directory. Then run through `gltfjsx` as usual.

---

## Skeleton: Rig Reuse

Rather than building a skeleton from scratch, reuse an existing humanoid rig via **mesh swapping**:

1. Import a Mixamo or Quaternius character with the desired animation
2. Delete (or hide) the skin mesh — keep the armature
3. Add bone-shaped geometry pieces (skull, ribcage, limbs) — Blender primitives or imported meshes work
4. Parent each piece to its corresponding bone (`Ctrl+P` → Bone)
5. Test by scrubbing the timeline — pieces follow the rig

Weight painting is minimal here because the correspondence is nearly 1:1 (skull mesh → head bone, femur mesh → thigh bone). Gaps at joints during movement can read as stylized rather than broken.

---

## Enemy Ideas

### Slime

Non-humanoid, so Mixamo won't help. Options:

- **Find one** — itch.io and Sketchfab both have game-ready slimes
- **Build one** — a UV sphere with 2–3 bones is a beginner-accessible Blender project. The core animation is squash-and-stretch: scale down on impact, elongate on bounce. Probably 2–4 hours first time through

### Beholder (Eye Monster)

No humanoid analog, so this requires custom work. A beholder is a floating eyeball with tentacles radiating outward — think of it as a central body rig with N tentacle chains hanging off it.

**Modeling approach:**
1. Start with a UV sphere for the body, scaled slightly — not a perfect ball
2. Add a large central eye (inset face + iris geometry, or a separate mesh parented to the body)
3. Tentacles: add N curved tube meshes around the equator. Use a Bezier curve + `Convert to Mesh` for organic shape, or just loop-cut a cylinder into segments

**Rigging:**
- Body bone at center
- Each tentacle gets a chain of 3–5 bones (like a finger rig)
- Set up IK (Inverse Kinematics) on tentacle tips for easier animation — move the tip, the chain follows

**Animations to build:**
- **Idle**: slow body bob, tentacles drift independently with slight phase offset (use NLA editor to layer)
- **Alert**: eye widens, tentacles stiffen outward
- **Attack**: one tentacle whips forward

**Realistic scope:** weekend project for someone new to Blender rigging. The modeling is straightforward; the tentacle IK chains are the learning curve.


## simple bash script to generate tsx from glb:
```bash
for f in *.glb; do
  npx gltfjsx "$f" -o "${f%.glb}.tsx" --types
done
```