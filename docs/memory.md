**Labyrinth: NPC Intelligence & Memory Architecture**

*Design reference --- api.leedyer.com / Postgres on Render*

**1. Core Architecture Principle**

NPCs are stateless functions that reconstruct their state via tool
calls. Each LLM instantiation is fresh --- the Postgres database carries
all continuity. This keeps token costs predictable and avoids context
overflow.

The analogy: an NPC is like a REST endpoint. It receives a request
(conversation turn + injected context), does its work, and returns. It
has no ambient memory between calls --- only what you give it.

**2. Tiered Memory System**

**2.1 Hot Memory (always in context, \~200 tokens)**

-   NPC core identity + personality traits

-   Current scene/room state

-   Last 3--5 conversation exchanges

This is the only memory that\'s always present. Keep it tight.

**2.2 Warm Memory (retrieved via tool call, on demand)**

-   Relationship state with this player: get_relationship(npc_id,
    player_id)

-   Recent relevant interactions: get_memories(npc_id,
    tags=\[\'player\', \'quest\'\])

-   Facts the NPC knows: get_knowledge(npc_id, topic)

The NPC decides what to retrieve mid-conversation, same as a human
deciding what\'s worth recalling. Retrieval is a tool call, not upfront
stuffing.

**2.3 Cold Memory (summarized, never raw)**

Long past conversations are compressed into a structured summary
artifact and stored. The raw turns are discarded. The NPC never reads
full history --- it reads a compressed record.

Example summary artifact:
```JSON
{
  "npc_id": "elara_the_innkeeper",
  "player_id": "player_001",
  "summary": "Player arrived asking about the northern road. Elara warned
             them about bandits. Player was evasive about their origin.",
  "extracted_facts": [
    "player_asked_about: northern_road",
    "trust_delta: -1",
    "player_deception_suspected: true"
  ],
  "emotional_state": "wary",
  "session": 1
}
```

The summary field is for the LLM to read as prose. extracted_facts drive
game logic without touching the LLM at all.

**3. Compression Pipeline**

**3.1 How compression works**

Raw turns → summarizer LLM call → structured artifact → stored in
Postgres → raw turns discarded.

The summarizer is a cheap, one-time call at session end. System prompt:

> \"You are a memory archivist. Given this conversation, extract:
>
> a 2-3 sentence summary, key facts as tags, any relationship changes,
>
> and the NPC\'s current emotional disposition toward the player.
>
> Return only JSON.\"

Output is \~200-400 tokens regardless of original conversation length.

**3.2 Hierarchical compression**

Over many sessions, even summaries accumulate. Compress summaries of
summaries:

-   Sessions 1--5 → Chapter summary

-   Chapters 1--3 → Arc summary

-   Arc level: \'Player and Elara have a fraught history. She helped
    them once against her better judgment.\'

Each tier loses granularity but preserves significance. This mirrors how
human long-term memory works: the hippocampus replays episodic memories
and transfers the gist to the neocortex as semantic knowledge. You
don\'t remember when you learned fire is hot --- just that it is.

**3.3 Compression triggers**

-   Every N exchanges (e.g., every 10 turns)

-   When context approaches a token budget

-   On scene/session boundaries (player leaves the room)

-   On significant events (player attacked the NPC, major revelation)

For Labyrinth\'s room-to-room structure, room exit is the natural
trigger. Could also use a token-count threshold as a fallback.

**3.4 What you inject at inference time**

When an NPC instantiates, tiered fetch from api.leedyer.com:

> NPC identity (static) \~100 tokens
>
> Arc summary if exists \~100 tokens
>
> Chapter summary if exists \~150 tokens
>
> Last session summary \~200 tokens
>
> Current scene state \~100 tokens
>
> \[tool results fetched mid-conversation as needed\]

\~650 tokens represents potentially hours of prior interaction.

**4. NPC Tool Taxonomy**

**4.1 World-reading tools (read-only, safe)**

-   get_player_inventory(player_id) --- NPC reacts to what you\'re
    carrying

-   get_room_state(room_id) --- knows if candles are lit, a body is
    present

-   get_time_of_day() / get_weather() --- atmospheric awareness

-   get_faction_standing(player_id, faction) --- guild rep, notoriety

-   get_quest_state(quest_id) --- knows if player completed the task

**4.2 Memory tools**

-   recall_memory(npc_id, query) --- semantic search over past events

-   write_memory(npc_id, content, tags) --- NPC explicitly records
    something

-   get_relationship(npc_id, player_id) --- trust, fear, affection
    scores

**4.3 World-writing tools (use carefully --- these have consequences)**

-   update_relationship(npc_id, player_id, delta) --- NPC updates how
    they feel

-   give_item(player_id, item_id) --- actually hands over an item

-   trigger_event(event_id) --- NPC sends a letter, alerts a guard,
    unlocks a door

-   set_npc_state(npc_id, key, value) --- NPC records a decision they
    made

**4.4 Social/world tools**

-   get_rumor(topic, location) --- what has this NPC heard lately

-   get_npc_schedule(npc_id) --- where are they supposed to be right now

-   send_message(npc_id, content) --- NPC tells another NPC something
    (async)

**5. Generative Possibilities with MCP**

**5.1 Procedural dialogue with live world state**

Instead of pre-authored branches, the NPC calls get_quest_state
mid-conversation and generates an appropriate response. No more dialogue
flags --- the world state IS the branch condition.

**5.2 NPC-to-NPC communication**

One NPC calls send_message to another, who picks it up on their next
instantiation. Guards can warn each other. Merchants can gossip. This is
emergent behavior without expensive always-on simulation.

**5.3 Dynamic rumor propagation**

A write_rumor(topic, content, location) tool lets events ripple through
the world. Player burns a barn; three conversations later a stranger
mentions it. The world feels alive without a central event bus.

**5.4 Consequence journaling**

A log_world_event(description, tags) tool creates a living history. NPCs
can query it: \'Has the player ever betrayed someone in this region?\'
Enables morality systems, reputation, emergent consequences.

**5.5 Scheduled behavior**

NPCs check a schedule and refuse to talk (\'I\'m in the middle of
prayers\') or behave differently based on time/location context. Gives
the world a sense of independent life.

**5.6 Intentional memory degradation**

Model realistic forgetting: older summaries get shorter, emotional
coloring fades, specific facts drop. An NPC who barely knows the player
gets a thin summary; one with deep history gets the full hierarchy. This
is realistic and saves tokens.

**6. Postgres Schema Sketch (api.leedyer.com)**

Suggested tables --- namespace under labyrinth\_ if sharing DB with
other projects:

> labyrinth_npc_memories
>
> id, npc_id, player_id, session_id
>
> summary TEXT
>
> extracted_facts JSONB
>
> emotional_state VARCHAR
>
> tier VARCHAR \-- \'session\' \| \'chapter\' \| \'arc\'
>
> created_at TIMESTAMPTZ
>
> labyrinth_relationships
>
> npc_id, player_id
>
> trust INT, fear INT, affection INT
>
> flags JSONB \-- { \"knows_player_lied\": true, \... }
>
> updated_at TIMESTAMPTZ
>
> labyrinth_world_events
>
> id, description TEXT
>
> tags TEXT\[\]
>
> location_id VARCHAR
>
> created_at TIMESTAMPTZ
>
> labyrinth_rumors
>
> id, topic VARCHAR, content TEXT
>
> origin_location VARCHAR
>
> spread_to TEXT\[\] \-- location_ids
>
> created_at TIMESTAMPTZ

**7. MCP Server Integration**

Your MCP server at api.leedyer.com exposes these tools to the Anthropic
API. Each NPC call includes the MCP server config:

> mcp_servers: \[{
>
> type: \"url\",
>
> url: \"https://api.leedyer.com/mcp\",
>
> name: \"labyrinth-world\"
>
> }\]

The NPC\'s system prompt tells it which tools are available and when to
use them. The LLM decides when to call tools mid-conversation --- you
don\'t hardcode the call order.

Keep world-writing tools gated behind intent checks in your MCP handler.
You don\'t want the LLM accidentally triggering give_item from an
ambiguous phrasing.

*Labyrinth --- internal dev reference*
