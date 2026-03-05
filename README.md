Labyrinth — Working Document v2
Concept
A gothic castle RPG with a surrealist painterly aesthetic. Inspired by Gormenghast and Piranesi without being derivative of either. The castle is its own character — ancient, indifferent, alive in its own logic. The player is trapped, searching for something they can't fully remember.

The Castle
* Indoor/outdoor gothic environment
* Rooms that rearrange and shift based on amnesia state
* The map itself is unreliable — a living document that changes
* Mixed reality — what is real and what is imagined is deliberately ambiguous

Tech Stack
Core
* React Three Fiber — 3D rendering
* Drei — helpers, environment maps, post-processing effects
* Rapier — physics and collision detection
* React Context + useState — game state to start, migrate to Zustand only if complexity demands it
Generative NPCs
* Anthropic API — character conversations driven by system prompt character bibles
* Simple database (Supabase or localStorage to start) — store conversation history, pass relevant context back into prompts manually. Upgrade to LangChain only when this feels limiting
Visual
* Post-processing via Drei/R3F — painterly watercolor shifts at amnesia thresholds
* Shader work for dreamlike visual states

Art Direction
* Low-poly with painterly watercolor post-processing
* Surrealist gothic aesthetic
* Visual state shifts dramatically with amnesia gauge
* The map UI drawn in an unreliable hand, updates and distorts in real time

Character Assets
* Mixamo — rigged humanoid base characters, customizable in Blender over time
* Kenney — environmental props and structural assets
* Blockbench — stylized low-poly character creation

The Two Gauges
HP
* Conventional health
* Reaching zero means death
* Not directly connected to amnesia
Amnesia Gauge
* Fills gradually over time — a constant passive pressure
* Specific enemies raise it through targeted actions not damage
* Certain NPCs can raise or lower it through dialogue
* Specific rooms trigger shifts on entry
* Creates a persistent tension — you can never fully escape it
Amnesia Thresholds Each threshold crossed triggers a shift:
* Low — clarity, tactical combat memory, full map reliability, antagonist's true nature visible, certain paths close
* Medium — baseline state, balanced access, map begins to distort
* High — wonder-state skills unlock, hidden rooms visible, NPCs behave differently, map unreliable
* Critical — player wakes in a completely new room, certain enemies may or may not be real, post-processing fully dreamlike
* Each threshold crossing unlocks a specific magic ability permanently or temporarily

Magic System
* Unlocked at amnesia thresholds rather than leveling up
* Some abilities only usable in high amnesia state
* Some abilities require low amnesia — clarity as its own kind of power
* The tension between wanting abilities and managing the cost

Generative NPCs
* Each character defined by a detailed system prompt — personality, speech, what they know, what they hide, what they want
* Persistent conversation history via simple database
* NPC dialogue directly affects game state and amnesia gauge
* Some NPCs try to make you forget, some try to help you remember
* The antagonist — manipulative, evasive, never quite honest — most interesting as a generative character
* Trust mechanics — trust gained opens paths, trust lost closes them

Core Loop
1. Explore castle room
2. Encounter — enemy combat or NPC conversation
3. Resolution affects HP, amnesia gauge, trust states
4. Amnesia threshold crossed — map shifts, room changes, magic unlocks
5. World responds to your state — new areas open, others close or rearrange

First Milestone
Single room vertical slice:
* Player moves
* One enemy encounter that raises amnesia through specific action
* One NPC with generative dialogue that can shift the gauge
* Amnesia threshold crossed — visual post-processing shifts
* Map updates to reflect new state
Nail this loop completely before building outward.
