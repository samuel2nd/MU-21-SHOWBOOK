# SHOWBOOK-ARCHITECTURE.md
## Design Reasoning, Operational Intent, and System Philosophy

*This document explains not just what Showbook does, but why every decision was made.
It exists to inform any developer, AI agent, or collaborator building on, adapting, or
extending this system — so that the reasoning behind the architecture is never lost.*

---

## What Showbook Is

Showbook is a web-based production engineering platform for live broadcast. It serves as the central nervous system of a mobile production unit — replacing paper showbooks and disconnected spreadsheets with a single live system that documents the show, tracks every signal and physical connection, and executes changes directly on the hardware.

It operates across three distinct layers, each complete and useful on its own:

**Layer 1 — Documentation**
The living record of the show. Every source, every cable, every device assignment, every monitor layout. What should be happening at any given moment. Previously this lived on paper or in static spreadsheets that fell out of sync with reality.

**Layer 2 — Data**
Where everything is stored and how it stays consistent. Local for speed and offline resilience, cloud for real-time collaboration across every device in the truck. When something changes in one place, everything that depends on it updates automatically. There is one source of truth, viewed from multiple perspectives.

**Layer 3 — Control**
Environmental changes. When the documentation says Camera 5 goes to Monitor 3, the hardware actually does it. Router crosspoints execute. Multiviewer layouts load. Monitor labels update. This is what separates Showbook from a sophisticated spreadsheet.

---

## Deployment Architecture

Understanding how Showbook is deployed is essential before understanding any other design decision.

**The frontend** is hosted on Netlify and accessible from any browser on any device — laptops, iPads, tablets, phones — anywhere on the truck network or internet.

**The bridges** run only on the engineering computer as local Node.js servers. They are the only component that can physically reach the hardware — the router, multiviewers, and tally system — because those devices live on the truck's internal network.

**This split is intentional.** It means any crew member on any device can view and edit show data. But only the engineering computer executes hardware commands. This mirrors real operational hierarchy — anyone can see the plan, the engineer executes it.

**The RouteQueue system** bridges this gap. When a remote device (an iPad, a director's laptop) makes a change that requires hardware action, that change is queued in the show data via Supabase. The engineering computer detects the queue change through real-time sync and executes it via the local bridges. The queue then clears and syncs back. Remote devices never need to know a bridge exists.

---

## The Home Page

### Operational Intent

The Home page is the first thing an engineer sees when opening Showbook. Its job is orientation — confirming you are looking at the right show in the right configuration — and providing a fast path to wherever you need to go.

**The Home page has no data entry.** Everything it displays is derived from configuration entered elsewhere. It is a read-only dashboard that reflects the current state of the show.

This is a deliberate design decision. The Home page should never be a place where configuration happens. If a number looks wrong on the Home page, the problem exists on a different tab — the Home page is simply surfacing it.

### What It Shows

**Show Identity**
The name of the currently loaded show and its production format. This answers the first question any engineer asks when sitting down at a workstation: "What show am I looking at?" In a busy truck environment where multiple shows may be configured and stored, this confirmation matters. It also displays whether the show is saved locally, synced to cloud, or both.

**Equipment Summary**
A computed overview of how the truck's resources are being used for this show. At MU-21 this specifically tracks:

- **CCUs in use** — CCUs (Camera Control Units) represent the native cameras that belong to the mobile unit itself. They connect directly through the truck's fiber infrastructure. Knowing how many are assigned to the current show versus how many the truck has available is essential for planning.

- **Framesync usage** — This is the most operationally critical number on the Home page. Every external video source — any feed coming from outside the native truck infrastructure — requires a framesync to synchronize it to the truck's reference. Framesyncs are a finite physical resource. MU-21 has a specific count of framesync channels across its AJA FS4 units and EVS Neuron channels. When all framesyncs are consumed, no more external sources can be integrated without reconfiguring existing assignments. Seeing this number at a glance — and how many are consumed versus available — prevents the common problem of discovering mid-show that you've run out of framesync capacity.

- **Show sources in use** — Of the 80 available show source slots, how many are actively assigned to equipment for this production.

These numbers are computed entirely from the CCU/FSY page and the SHOW SOURCES page. The Home page performs no calculation of its own — it calls the same `equipmentSummary()` function that the data layer maintains.

**Why framesync tracking matters enough to surface on the home page:**
In practice, framesync capacity is one of the first constraints a broadcast engineer thinks about when building a show. Before assigning sources, an engineer mentally calculates: "I have X external feeds, I need X framesyncs." Getting to a show day and discovering you're over capacity means pulling assignments, redistributing feeds, and potentially losing sources entirely. Surfacing this on the home page makes that constraint visible from the moment the show is opened.

**Quick Navigation**
Showbook has 20 tabs across 7 categories. Most engineers working on a given show operate within 3 or 4 tabs for their specific role. A camera operator assigning sources doesn't need the EVS Config page. A replay operator configuring EVS servers doesn't need the Fiber TAC page. The quick navigation grid provides one-click access to every tab without scrolling through the sidebar — organized by the same categories the sidebar uses, so the mental model is consistent.

---

## Data Philosophy

### One Source of Truth

Every piece of data in Showbook exists in exactly one place in the data model. When that data appears in multiple tabs — and it frequently does — each tab is reading from the same store, not maintaining its own copy.

This is why a name change on the SHOW SOURCES page immediately appears in the ENGINEER tab's UMD list, on the FIBER TAC assignment labels, and in the monitor wall drag-drop panel. They are all reading from `Store.data`. There is no synchronization step. There is no "update all" button. The data model is the truth and every view reflects it.

### Bidirectional Sync

Where two pages represent related data from different perspectives, changes on either page update the shared data model — which means both pages stay in sync automatically.

The clearest example is CCU/FSY and FIBER TAC. When an engineer assigns a camera to a fiber port on the CCU page, that assignment appears immediately on the visual patch panel on the FIBER TAC page. If the engineer then edits it on the FIBER TAC page, the CCU page reflects the change. Neither page "owns" the data — they both read and write to the same store location.

This bidirectional sync exists because different engineers work from different pages. A systems engineer might cable from the FIBER TAC visual panel. A camera engineer might assign from the CCU list. Both workflows are valid and both produce the same result.

### Computed Fields

Many fields in Showbook are never directly edited — they are computed from other fields. Show Name on the SWR I/O page is computed from the engineering source name via a lookup against the SHOW SOURCES page. I/O RTR OUT on the TX/PGM/GFX page is computed from the physical connection configuration. Device names on the FSY section are computed from the unit number based on MU-21's physical framesync hardware layout.

Computed fields are visually distinct from editable fields. They cannot be directly edited — changing them requires editing the source data they derive from. This prevents a common class of error where documentation is manually corrected without updating the underlying configuration.

---

## Show Data Structure

The show is stored as a single JSON object. Every tab reads from and writes to this object. This flat structure makes export, import, cloud sync, and version comparison straightforward.

The top-level keys reflect the operational organization of the truck:

```
show          — Identity: name and format
sources       — The 80 show source slots
rtrMaster     — Router input device library
rtrOutputs    — Router output device library
txPgmGfx      — Transmission, program, graphics outputs
ccuFsy        — Camera and framesync inputs
swrIo         — Switcher inputs, outputs, tally, GPI
videoIo       — Physical video routing: fiber, coax, tie lines, MUX
fiberTac      — Fiber patch panel assignments
coax          — Coax mult assignments
audioMult     — Audio distribution assignments
networkIo     — Network port assignments
monitorWallsV2 — Monitor wall source assignments by wall
prodDigital   — Production monitor wall: PXM config and MV assignments
evsConfig     — EVS server configuration
kaleidoConfig — Multiviewer hardware config and staged layouts
routerPanels  — Panel button assignments
routeQueue    — Pending hardware commands awaiting execution
sheet8        — Reference lists: device types, formats, locations (page now named Dropdown Options)
```

---

## TX/PGM/GFX — Transmission, Program, and Graphics

### Why This Page Comes First

TX/PGM/GFX is the first input page in operational flow because it establishes the resource constraints that every subsequent page must work within. Before an engineer can intelligently assign show sources, configure cameras, or plan framesync usage, they need to know what the truck is being asked to transmit and what that costs in terms of resources.

This page answers the highest-priority questions of show buildout:

- How many feeds are we transmitting, and where are they going
- Do any of those feeds require timing adjustment — and if so, how many framesyncs does that consume before show sources are even considered
- How many program outputs are there
- How many channels of graphics are there, and what type
- What are we calling all of this — both the show-facing name that appears on monitors via UMD, and the engineering name that identifies it in the router

### Why Naming Happens Here First

TX and program feeds are the most universally referenced signals in the truck. The director calls for program. The replay operator monitors program. Graphics keys against program. Transmission goes to air on program. Getting the naming right at the transmission layer — before anything downstream is assigned — means those names propagate correctly through every page that follows.

The UMD name defined here is what appears on the physical monitor display under the screen showing that feed. The engineering source name is what identifies it in the router device library. Both must be established early because both are referenced everywhere else.

### Transmission Feeds (TX 1-8)

Each TX feed represents a discrete video path being sent out of the truck — to a network, a venue, a remote facility, or a satellite uplink. For each TX feed an engineer defines:

**DA INPUT** — What physical distribution amplifier input this transmission path uses. This is a hardware reference to the physical signal chain.

**UMD NAME** — What this feed is called on monitors throughout the truck and facility. This is the human-readable label. Examples: "TX 1," "CLEAN FEED," "SPANISH."

**ENG SOURCE** — The engineering name of the signal being transmitted. This maps to the router device library and is how routing commands identify this destination.

**AUDIO SRC** — Which audio path accompanies this transmission feed.

**FRAMESYNC** — This is operationally critical. If the signal being transmitted requires timing adjustment — because it originates from an external source not synchronized to the truck's reference — a framesync must be inserted in the signal path. The engineer selects which FS unit handles this from a dropdown of FS 01-67.

**Why framesync selection on TX matters for the whole show:**
Every framesync assigned here is one fewer available for show sources. The Home page equipment summary must account for framesyncs consumed by TX feeds — not just those assigned on the CCU/FSY page. An engineer planning source assignments needs to see the true remaining framesync count, which means TX framesync assignments must deduct from the available pool. Similarly, the CCU/FSY page — which serves as the master view of all framesync usage — should display the UMD name of whatever TX feed is using a given FS unit, so that page presents a complete picture of framesync allocation across the entire show.

**OUTPUT** — The physical output destination of this TX feed.

**I/O COAX 1-4** — Checkboxes indicating which coax I/O paths carry this transmission signal.

**I/O RTR OUT** — Computed and not directly editable. When a TX feed is assigned to an I/O coax output via the I/O COAX checkboxes, that connection appears on the VIDEO I/O page under the corresponding I/O output row. I/O RTR OUT reflects that assignment back on the TX page so the engineer can confirm the full signal path without navigating away. It is the same data viewed from two perspectives — TX page shows where the signal is going, VIDEO I/O page shows what is feeding that output.

### Program Outputs

Program outputs represent the primary switched program signals produced by the production switcher. These are the feeds the director is cutting between — the actual broadcast output.

MU-21 tracks multiple program configurations: PGM A, Clean feed, Preset, and Switcher Preview. Each has its own UMD name, engineering source name, and audio source. These are not transmission feeds — they are internal reference signals that other systems monitor and route from.

### Graphics (CG and Canvas)

Graphics channels come in two distinct types with different technical requirements:

**CG (Character Generator) 1-6** — Traditional character generator outputs. Each has a DA input, UMD name, engineering source, and key input. The key input is significant — CG outputs typically include both a fill signal and a key (matte) signal, and both must be tracked because both consume router resources.

**Canvas 1-8** — Canvas graphics outputs operate differently from CG. They have a router input rather than a DA input, reflecting a different signal flow through the infrastructure. Canvas channels use RTR IN rather than DA INPUT because their signal path enters through the router rather than through a distribution amplifier.

The distinction between CG and Canvas is not cosmetic — it reflects genuinely different hardware signal chains that require different routing approaches.

### Operational Significance of This Page

By the time an engineer completes TX/PGM/GFX they know:

1. The complete list of outgoing signals and what they're called
2. Exactly how many framesyncs are already committed before show sources are touched
3. The naming convention for the most important signals in the show — which sets the tone for how everything else gets named
4. The graphics capacity and configuration for this production

Only with this information can the next page — Show Sources — be approached with full awareness of the constraints in play.

---

---

## SHOW SOURCES

### Operational Intent

The Show Sources page is where the production identity of every video source in the show is established. It answers a deceptively simple question: what are we calling everything, and what are we actually hearing when we call it up?

In broadcast engineering there is a persistent distinction between what a source *is* technically and what it *is* to the production. CCU 01 is a camera control unit — a piece of hardware with a specific physical location, fiber path, and audio configuration. CAM 1 is a show source — a production concept that the director, replay operators, graphics team, and producers all reference by name. These are not the same thing, and treating them as the same thing causes errors.

The Show Sources page maintains that separation explicitly and deliberately.

### The Four Fields Per Source

**SHOW NAME** — The routing identity of this source. This is what gets programmed into the NV9000 router device library for this SHOW slot. When any system or operator calls for this source by name in the router, this is the name it responds to. It is what the production universally calls this feed — CAM 1, CAM 2, ISO 1, HANDOFF, POOL. Stable across the production regardless of what hardware is feeding it.

**UMD NAME** — The text that physically appears on the under-monitor display hardware wherever this source appears on a monitor wall. This serves a display purpose only — it is not used for routing. It is an independent field from show name because display identity and routing identity serve different people for different purposes and frequently differ from one another.

**ENG SOURCE** — The actual hardware device feeding this show source slot. This is the engineering identity — CCU 01, FS 23, EVS 2-A. This is what the router physically switches when this show source is called. An engineer can repoint a show source to different hardware without changing anything the production sees — the show name stays the same, only the engineering source changes.

**AUDIO SOURCE** — The audio that should accompany this source when it is called up by a recorder, sent to EVS, or routed to an external monitor via I/O. This is a critical distinction from the engineering source's native audio. CCU 01 as an engineering source may have IFB, intercom, and raw camera audio embedded in its signal. CAM 1 as a show source needs clean program audio or isolated camera audio depending on the production requirement. De-embedding, audio routing, and mixing decisions made elsewhere in the truck are reflected here as the definitive audio assignment for this source in the production context.

### Why Show Name and Engineering Source Are Separate

This separation exists because the two names serve entirely different audiences and purposes.

The show name serves the production — directors, producers, replay operators, and graphics all work in show names. They never need to know which CCU or framesync is feeding a source.

The engineering source serves the infrastructure — router commands, signal tracing, and hardware troubleshooting all work in engineering names. The router doesn't know what CAM 1 means. It knows CCU 01.

Keeping these separate means production names can be defined at the start of a show and remain stable even if engineering repoints sources during the show — a camera goes down, an engineer switches it to a backup CCU, the show source name never changes, and the production never notices.

### The 80 Source Slots

MU-21 has 80 show source slots. These correspond to 80 pre-built empty entries in the NV9000 router configuration — SHOW 01 through SHOW 80 — that exist in the router's device library waiting to be named and assigned. They are not theoretical capacity, they are physical router entries.

As the Show Sources page is filled out, those names cascade downstream. The RTR I/O Master page reflects the populated show source names in the router device library. The ENGINEER page draws from this information to populate UMD assignments. The monitor wall drag-drop panels display show source names as assignable chips.

The 80 slots are split across two display columns — sources 1-40 and sources 41-80 — for readability on a single screen without scrolling.

### Quick Fill

Because show source naming follows predictable patterns — cameras are typically numbered sequentially, ISOs follow a naming convention, handoff feeds have standard names — a quick fill system allows an engineer to populate multiple sources at once. A prefix and a range generates the sequence automatically: entering "CAM" across positions 1-12 produces CAM 01 through CAM 12 without manual entry of each row. This exists purely for operational efficiency during the time-pressured show buildout process.

### Downstream Cascade

The Show Sources page sits at the top of a data cascade that feeds multiple downstream pages:

- **RTR I/O Master** — Show source names populate the SHOW device entries in the router input library
- **ENGINEER tab** — UMD assignments draw from show source names for monitor label population
- **Monitor wall pages** — Show sources appear as draggable chips for monitor wall assignment
- **SWR I/O** — Switcher input show names are computed by looking up the engineering source against the show source list

No downstream page requires re-entry of show source information. It flows from this single source of truth.

---

## EVS CONFIG

### Operational Intent

The EVS Config page documents the replay server infrastructure on the truck — how many units exist, what their native hardware configuration is, and what everything is called both in the router and on monitors. Replay servers are a major source category in any sports production and need to be fully defined before physical input assignments begin.

### Why EVS Config Comes Before CCU/FSY

Replay servers are configured at the facility level before a show — their channel counts, XNET assignments, and engineering names are determined by the truck's hardware, not by the production. Knowing the EVS configuration establishes another fixed set of constraints: how many replay channels are available, how many are outputs versus inputs, and what they are called in the router. This feeds into source assignments and UMD population downstream.

### MU-21 EVS Configuration

MU-21 runs four EVS servers:

**Three EVS XT VIA machines** — These are 8-channel units configured by default as 6 inputs and 2 outputs (6X2). The 6 input channels receive video for recording and the 2 output channels — called super channels — are the replay outputs that get routed to the switcher, monitors, and transmission paths. Each XT VIA has its own XNET number which determines its position in the EVS network for clip sharing and communication between servers.

**One EVS XS VIA** — This is a dedicated playout-only device used as the spotbox for the TD. The XS VIA is a fundamentally different product from the XT VIA — it is designed exclusively for playout and has no record capability. An XT VIA with proper licensing can be configured to run as a spotbox, but the reverse is not true. The XS VIA cannot record. It runs 4 output channels and operates independently from the three XT VIA machines on its own XNET position.

### Naming on EVS Config

**Engineering names** — The router identifiers for EVS channels. These are established by the truck's hardware configuration and generally do not change between shows. On MU-21 these follow a consistent pattern: EVS 1-Ain through EVS 1-Fin for record inputs, EVS 1-As and EVS 1-Bs for super channel outputs. Engineering names rarely need to change show to show.

**Show names / UMD names** — Each EVS machine has clean air outputs for broadcast and super outputs for monitoring. The super outputs are what gets put on monitor walls so operators can see what is going in and out of the machine — input confidence and output confidence monitoring. The show/UMD names assigned on this page apply specifically to these monitoring channels. They are what appears on the under-monitor display wherever these channels appear on a wall, so operators know exactly what they are looking at. These names feed into the same Tallyman UMD system as all other monitor labels in the truck.

### Show Sources Reference Panel

The EVS Config page includes a read-only reference panel displaying the active show sources. This panel is display only — no routing executes from here. It exists specifically to support the decisions an engineer and EVS operators need to make when configuring record trains.

The panel shows for each active source: the show name, the engineering source, and the show source audio assignment. This gives the EVS team the information they need to decide how to feed each record train — a decision with two options:

**Take the show source** — Routes the SHOW slot into the EVS record input. The EVS operator gets the production audio that has been added and assigned to that show source — the show-context audio defined on the Show Sources page.

**Take the direct engineering source** — Routes the raw CCU or FS directly into the EVS record input. This gives you the direct de-embedded audio straight off the hardware — the original embedded channels from the camera or framesync before any production audio routing has been applied. Preferred when the replay operator or post-production needs the original isolated audio reference directly from the device.

This is a meaningful technical decision that affects what gets recorded and what the replay operator hears. Having the show source and engineering source side by side on this page — without having to navigate away — makes that decision faster and more accurate.

**Why this reference lives on EVS Config and not elsewhere:** The information is directly relevant to configuring EVS record trains. It is the bridge between the show source definitions established earlier and the physical routing decisions being made now for EVS.

**Why Show Sources must be completed before EVS Config:** The reference panel only displays active assigned sources. An empty Show Sources page means an empty reference panel and no basis for making EVS routing decisions. This is the operational dependency that determines page order.

### EVS Position and Wohler Routing

Each EVS server has a physical position in the truck — where it sits and which Wohler audio monitor outputs are associated with it. On MU-21 the available positions are FEVS1, FEVS2, FEVS3, REVS1, and REVS2 — reflecting the front and rear EVS bays in the truck.

**Why position is selectable:** EVS machines are not always in the same physical position show to show. A machine that was FEVS1 on one show may move to REVS1 on another. Position is a show-level assignment, not a permanent hardware property.

**Wohler output mapping:** Each position has a fixed set of Wohler audio monitor RTR outputs associated with it. When a position is selected for an EVS server, the Wohler output assignments for that server automatically populate based on the position. On MU-21 the mapping is:

| Position | Wohler RTR Outputs | RTR IDs |
|----------|--------------------| --------|
| FEVS1 | FEVS 1-1, FEVS 1-2, FEVS 1-3, FEVS 1-4, FEVS 2-1, FEVS 2-2, FEVS 2-3, FEVS 2-4 | 1037-1044 |
| FEVS2 | FEVS 3-1, FEVS 3-2, FEVS 3-3, FEVS 3-4, FEVS 4-1, FEVS 4-2, FEVS 4-3, FEVS 4-4 | 1045-1052 |
| FEVS3 | FEVS 5-1, FEVS 5-2, FEVS 5-3, FEVS 5-4, FEVS 6-1, FEVS 6-2, FEVS 6-3, FEVS 6-4 | 1053-1060 |
| REVS1 | REVS 1-1, REVS 1-2, REVS 1-3, REVS 1-4, REVS 2-1, REVS 2-2, REVS 2-3, REVS 2-4 | 1061-1068 |
| REVS2 | REVS 3-1, REVS 3-2, REVS 3-3, REVS 3-4, REVS 4-1, REVS 4-2, REVS 4-3, REVS 4-4 | 1069-1076 |

These output names are defined in the RTR I/O Master output library and must exist there to be valid. The RTR I/O Master is the authoritative reference for all output names — the EVS Config page references them, it does not define them.

**Wohler routing from EVS Config:** Each Wohler output row is directly routable from this page via the NV9000 bridge, using the same routing architecture as all other pages. This allows an engineer to confirm and execute Wohler audio monitor assignments for each EVS position without leaving the EVS Config page.

*Note: All position names, Wohler output names, and RTR output mappings documented here are MU-21 specific. Other trucks will have different position names, different Wohler configurations, and different RTR output libraries — but the concept of position-driven Wohler assignment is universal to any facility running EVS with Wohler monitoring.*

---

## CCU/FSY

### Operational Intent

The CCU/FSY page is part of the Physical I/O section — it documents the actual hardware devices that are feeding the show sources defined earlier. Where the Show Sources page establishes production identity, this page tracks the physical reality of how those sources arrive in the truck.

This page has no hardware bridge currently — it is documentation and reference. However the fiber TAC assignments made here do drive bidirectional sync with the FIBER TAC page, which is part of the physical infrastructure documentation.

### CCU Section (12 units)

CCUs are the native cameras that belong to the mobile unit — the cameras that arrive with the truck and connect through its infrastructure. CCUs can connect via fiber or triax. Fiber connections are tracked explicitly through the TAC and FIB-A/FIB-B fields. Triax is not tracked with its own field — if fiber is not assigned for a CCU, triax is implied by elimination. No additional documentation is needed for triax because its absence from the fiber fields is itself the record. Each CCU row tracks:

**Device** — The physical CCU unit identifier.

**TAC** — Which TAC fiber panel this camera's fiber arrives on. When assigned here it populates the corresponding port on the FIBER TAC visual patch panel page. The sync is bidirectional — edit either page and the other updates to match. Different engineers work from different perspectives; a systems engineer works from the patch panel, a camera engineer works from the CCU list. Both are valid workflows producing the same result.

**FIB-A / FIB-B** — The specific fiber strands carrying signal for this camera. Two strands tracked because cameras typically have both a send and return fiber path.

**Show Name** — Computed. Displays the show source name that has this CCU assigned as its engineering source on the Show Sources page. Read only — it confirms which show source this hardware is feeding without requiring the engineer to cross-reference pages.

**Lens Checkboxes** — Tracks what lens configuration this camera is running for this show:
- **B** — Box lens. Large studio-style telephoto lens typically used for main game coverage.
- **S** — Standard ENG lens. General purpose field lens.
- **W** — Wide ENG style lens. Wider angle field lens.
- **DOLLY** — Dolly-mounted camera configuration.

This is documentation only — no hardware control. It gives the engineering team a quick reference for what each camera position is equipped with, useful for troubleshooting and show planning.

**Notes** — Free text for additional information. Commonly used for venue-specific patch points, unusual routing, or position notes.

---

### FSY Section (67 units)

Framesyncs handle every external source entering the truck that is not native to the mobile unit's infrastructure. Any signal not synchronized to the truck's reference needs a framesync to align it. The FSY section tracks all 67 framesync channels available on MU-21.

**Device** — Computed automatically from the unit number based on MU-21's physical framesync hardware layout. Engineers do not assign this — it reflects which physical piece of hardware that framesync channel lives on. On MU-21 this maps to AJA FS4 quad-channel units, an AJA FS2, and EVS Neuron channels. Other trucks will have different framesync hardware mapped to different unit ranges.

**Format** — The video format this framesync channel is processing. Pulls from the Dropdown Options video formats reference list. In most cases this matches the show format — if the show is 1080p/59.94, most framesyncs will be set to match. However individual framesyncs can be assigned different formats because certain sources may need to deliver a specific format regardless of what the show is running. A 720p graphics system or an external feed locked to a specific format in a 1080p production is a common example. The format field exists to document these exceptions clearly.

**TAC** — Which TAC fiber panel this external source arrives on, if it's arriving via fiber. Bidirectional sync with the FIBER TAC page, same as the CCU section.

**FIB-A** — The specific fiber strand for this source.

**Show Name** — Computed from two sources. If a show source has this FS as its engineering source, the show source name displays here. If this FS is assigned as the framesync for a TX feed on the TX/PGM/GFX page, the TX UMD name displays here instead. This ensures the FSY section shows complete framesync usage across the entire show — not just show sources but transmission feeds as well.

**MULT** — Tracks if this signal is arriving via coax mult rather than fiber. When assigned, syncs bidirectionally to the COAX MULTS page.

**COAX** — Documents any coax path associated with this framesync input.

**Notes** — Free text for additional information. Venue patch points, unusual signal paths, or any other reference the engineer needs to document for this specific source.

---

### Why This Page Is In Physical I/O

Show Sources establishes what sources exist and what they're called. CCU/FSY documents where those sources physically come from and how they physically arrive. The distinction matters because the same show source assignment can arrive via completely different physical paths depending on the venue, the show, and what equipment is available. This page captures that physical reality for every show independently.

*Note: No hardware bridge currently exists for framesync control. Format assignments and patch documentation are reference only. Future development could add remote framesync configuration via bridge for hardware that supports IP control.*

---

## VIDEO I/O

### Operational Intent

The VIDEO I/O page documents and controls the physical video paths leaving and existing throughout the truck. These are the router outputs and tie lines that move signals in and out of the mobile unit — to venues, external facilities, I/O panels, and internal truck positions. This page is where an engineer assigns what signal goes where on every routable output path the truck has available.

### Fiber RTR Outputs (16)

MU-21 has 16 ST fiber router outputs available for signals to leave the truck via fiber. Each row represents one physical fiber output path — IO FIB01 through IO FIB16 in the RTR I/O Master. A source is assigned to each row and routed via the NV9000 bridge. These are the primary high-bandwidth paths for sending signals to venues, satellite uplinks, or external facilities over fiber.

### Coax RTR Outputs (16)

16 separate coax router outputs exist alongside the fiber paths — IO BNC 1 through IO BNC 16. These function identically to the fiber outputs in terms of routing control but carry signal over coax rather than fiber. Assigned and routed via the NV9000 bridge the same way. Used for shorter distance outputs or where coax infrastructure is in place at the venue or I/O panel.

### JFS MUX (2 units)

Two individual JFS multiplexer units provide additional routable output paths — MUX 1 with 12 paths and MUX 2 with 6 paths. Unlike the fiber and coax RTR outputs which each have their own dedicated fiber or coax, the MUX units consolidate multiple signals onto a single fiber path. Each MUX unit has one fiber carrying all its multiplexed signals. Assigned and routed via the NV9000 bridge the same as the RTR outputs. Tracked here because they are discrete routable output destinations in the router device library.

### Coax I/O Tie Lines (48) and Coax Truck Tie Lines (48)

These are physical coax tie lines that exist in the I/O panel and throughout the truck. They normal to each other in the patchbay — meaning by default both ends of each tie line are connected to each other without any patching required. They are displayed side by side on this page to reflect that physical relationship.

Tie lines are not router-controlled — they are passive physical connections that can be used for whatever purpose the show requires, as inputs or outputs depending on what is patched at either end. They are documentation only on this page. No routing executes from here for tie lines. The value is having a single place to record what is patched where on any given show, so the engineering team has a complete picture of how signals are moving through the truck's physical infrastructure beyond the router.

### Why This Page Follows CCU/FSY

By the time an engineer reaches VIDEO I/O, the sources are defined and the physical input infrastructure is documented. VIDEO I/O closes the loop on the physical layer by documenting where signals leave the truck. Together CCU/FSY and VIDEO I/O give a complete picture of signal flow — what comes in and how, and what goes out and where.

---

## NETWORK I/O

### Operational Intent

The NETWORK I/O page is a reference map of every RJ45 network port available in the truck — organized by physical location. It is documentation only. No hardware control, no routing execution, no bidirectional sync with any other page. Its sole purpose is giving the engineer a clear picture of what network ports exist, where they are, and what is assigned to them for this show.

All of these ports terminate at the engineering network patchbay where physical patching is done manually. This page tells the engineer what is available and what is in use — the actual patch is made by hand at the bay.

### Why This Matters Operationally

In a mobile production environment, network connectivity is as critical as video routing. Cameras, replay servers, graphics systems, intercom, control surfaces, and engineering tools all require network access. Knowing which ports are available at which physical location — without tracing cables or asking someone — saves time and prevents conflicts. A port documented as in use on this page signals to every engineer that it is spoken for.

### Three Groups on MU-21

**I/O (24 ports)** — Network ports located at the physical I/O panel of the truck. These are the primary paths for getting network connectivity in and out of the truck — connecting to venue infrastructure, external facilities, or outside network sources.

**Truck Bench (24 ports)** — Network ports distributed throughout the work benches inside the truck. Each position in the truck — replay, graphics, audio, engineering — has bench ports available for devices at that position to access the network.

**Above Tape (ports 13-24)** — A smaller set of additional network ports at the engineering tape position. Extra access points for devices at that specific work area that aren't covered by the main bench ports.

### No Hardware Dependency

Unlike every other Physical I/O page, NETWORK I/O has no connection to any bridge or control system. There is no NV9000 equivalent for network patching — it is a physical operation at the patchbay. The value of this page is entirely in the documentation — a single place to record the network topology for this show so any engineer can understand it without physically inspecting the rack.

---

---

## SWR I/O

### Operational Intent

The SWR I/O page documents the inputs and outputs of the production switcher — on MU-21 a Grass Valley K-Frame. It gives the TD (Technical Director) and engineering team a complete view of what sources are feeding the switcher, what the switcher outputs are connected to, and how the physical tally and GPI relay outputs are assigned.

MU-21 is a DA truck — sources hit the switcher and are routed separately, some through distribution amplifiers, some utilizing multiple hardware outputs directly where available to conserve DAs. Knowing exactly what is feeding each switcher input, and what show source it corresponds to, is essential for the TD to build their show without having to cross-reference other pages.

*Note for other trucks: Not all mobile units operate as DA trucks. Router feed trucks use a larger router with more outputs and feed the switcher directly from the router without requiring DAs or multiple hardware outputs for distribution. The SWR I/O page serves both configurations — the input documentation and show name lookup is equally valuable regardless of how signals are distributed to the switcher.*

### Switcher Inputs (120)

120 switcher input rows displayed across three columns. Each row tracks the engineering source assigned to that switcher input position.

**Show Name — live computed display:** The most operationally important feature of this section. Each row automatically displays the show source name that corresponds to the engineering source assigned to that input. This is computed live from the Show Sources page — when a show source has an engineering source that matches an SWR input assignment, the show name appears beside it automatically.

This means a TD building their show can look at the switcher input list and see both the engineering source — what is physically connected — and the show name — what the production calls it — side by side without navigating anywhere else. When a source changes on the Show Sources page, the SWR I/O page reflects it immediately.

### Switcher Outputs (46)

The switcher outputs document every output path from the K-Frame that connects to the router. Each row tracks two names:

**Engineering name** — What the output is called in the router device library. The default name used for routing commands and technical identification. On MU-21 these include PGM A, CLEAN, PRESET, SWPVW, ME buses, AUX 1-12, IS 1-10, and others.

**UMD name** — What this output should be called on monitor displays. Independent from the engineering name for the same reason as elsewhere — display identity and routing identity serve different purposes.

### Tally Group (24) and GPI Group (12)

The K-Frame has physical relay outputs for tally and GPI that land at the engineering network patchbay. Like network ports, these are patched manually at the bay. The default patches are documented here as the book shows — what each relay output is assigned to by default — so the engineering team has a reference without tracing physical wires.

**Tally** — The K-Frame also communicates natively with TSL Tallyman for tally over network. The physical relay outputs documented here are the hardware tally paths that exist alongside the network tally system, used where hardwired tally is required or preferred.

**GPI** — General Purpose Interface relay outputs. Used for triggering external devices or receiving triggers from them. Documented here as reference for what is patched where.

### Why SWR I/O Completes Physical I/O

The Physical I/O category documents how every signal category moves through the truck's infrastructure. CCU/FSY covers camera and external source inputs. VIDEO I/O covers router outputs leaving the truck. NETWORK I/O covers data connectivity. SWR I/O closes the picture by documenting the switcher — the central creative hub of the production where all sources converge and program is created. Without this page the infrastructure picture is incomplete.

---

## CONNECTION — FIBER TAC, COAX MULTS, AUDIO MULTS

### Category Philosophy

The Connection pages are visual representations of physical patch infrastructure. They document what is patched where — fiber panels, coax mult units, and audio distribution panels. All three pages share the same fundamental design: a visual layout that mirrors the physical hardware, with assignable slots for each port or connection point.

**These pages are only as valid as the work actually being done.** They are mechanical. A port marked as assigned in Showbook means nothing if the cable is not physically plugged in at the panel. Unlike router pages where a bridge executes the change in hardware, Connection pages have no bridge and no control capability. They are entirely dependent on a human physically making the patch. The documentation is a communication tool for the crew — it tells everyone what should be patched, but the patch itself is a physical act.

---

### FIBER TAC

The FIBER TAC page displays visual representations of every fiber patch panel in the truck — on MU-21 panels TAC-A through TAC-H plus S09 and S10, each with 24 ports. Each port is clickable and assignable.

**Bidirectional sync:** Fiber port assignments sync bidirectionally with the CCU/FSY page. When a CCU or framesync is assigned to a TAC panel and strand on the CCU/FSY page, that port populates on the FIBER TAC visual panel automatically. Editing the port directly on FIBER TAC updates the CCU/FSY page in return. Neither page owns the data — both are views of the same assignment.

**Free assignment slots:** Not everything patched on a fiber panel is a CCU or framesync tracked elsewhere in the book. Intercom fiber, utility runs, one-off venue connections — these exist and need to be documented. Each port can be freely assigned with any label for anything not covered by the bidirectional sync categories. This ensures the FIBER TAC page can represent the complete physical state of the panel regardless of what is patched there.

---

### COAX MULTS

The COAX MULTS page displays MU-21's 8 coax mult units, each with 15 outputs arranged in a 5x3 grid. Each output is clickable and assignable.

**Bidirectional sync:** Coax mult assignments sync bidirectionally with the FSY MULT field on the CCU/FSY page. When a framesync source is assigned to a mult output on the CCU/FSY page, it appears on the COAX MULTS visual grid. Editing directly on COAX MULTS updates CCU/FSY in return.

**Free assignment slots:** Same as FIBER TAC — any output can be freely assigned for anything not tracked through the bidirectional sync. A mult being used for a purpose outside the show source infrastructure can still be documented here.

---

### AUDIO MULTS

The AUDIO MULTS page displays MU-21's DT-12 audio distribution panels — panels A through F, each with 12 channels in a 6x2 grid.

**Reference only — no bidirectional sync.** This page exists specifically for the audio team — A1 and A2 — to track their DT-12 connections and document what each channel is being used for. Engineering does not drive this page. Audio owns it independently.

The design is consistent with FIBER TAC and COAX MULTS so the interface is immediately familiar, but the behavioral difference is intentional. Audio mult assignments are not tracked anywhere else in the book — they don't feed into routing, they don't sync to other pages. They are purely the audio team's documentation of their physical patch.

---

## MONITOR WALLS

### Category Philosophy

The Monitor Wall pages are all built on the same design by intent — they all do the same thing for their respective areas of the truck. Each page represents the physical monitors in one specific location, the sources feeding them, and the multiviewer layouts displayed on them. The consistent design means anyone who understands one wall page understands all of them.

Every monitor in MU-21 is router fed. Multiviewer inputs are also router fed. This means any source in the router can go to any monitor or any multiviewer input — the wall pages are where those routing decisions are made and executed.

### The Six Wall Areas

Each wall page corresponds to a distinct physical area of the truck with its own crew and monitoring needs:

**PROD Digital** — The main production monitors. This is what the front bench sees — directors, producers, and the TD. The highest-traffic wall in terms of monitoring decisions and the most complex in terms of multiviewer configuration.

**PROD Print** — A supplementary production wall display.

**P2-P3** — Second and third bench positions. Operators sitting further back in the production area with their own monitoring requirements.

**EVS** — The replay room. The replay operators' wall — configured around what the EVS team needs to monitor their record trains, outputs, and program feeds.

**AUD** — The audio room. The A1 and A2 monitoring wall, configured around what the audio team needs to see.

**VIDEO** — The video room. The video shading and engineering monitoring wall.

### Monitors — Direct Sources and Multiviewers

Each monitor in a wall can display either a direct router source or a multiviewer output.

**Monitors without a default multiviewer** are typically used for direct sources — a large program monitor, a clean feed, a transmission output. They can still display a multiviewer if one is routed to them, but their default purpose is a dedicated single-source display.

**Monitors with a default multiviewer** display their assigned MV card output by default. The multiviewer itself is router fed — its inputs can be assigned and routed from the wall page directly.

### Multiviewer Layouts

Monitors displaying multiviewers have layout selection available. 11 pre-built layout options exist covering different split configurations — 9 split, 6 split with VIP variations, 5 split, 4 split, and full screen. Selecting a layout either stages the change for engineering to execute or takes immediately depending on the trigger mode set on the engineer's Kaleido bridge. This is the engineer's decision — during a build environment immediate mode makes sense, during a live show staged mode ensures nothing changes without engineer confirmation.

### Routing to Non-Default Multiviewers

When a monitor is routed to a non-default multiviewer it displays that multiviewer's layout configuration including any sources already routed to it from the Showbook. This enables an important workflow efficiency — if a monitor at one position needs to show the same content as a multiviewer at another position, simply route that MV output to the monitor. There is no need to duplicate source routing to a second MV card. Route MV 1 to PXM 8 and PXM 8 shows exactly what MV 1 shows, with no additional configuration required.

### Source Assignment — Drag and Drop

Below each monitor wall display, sources are organized into categories available for drag and drop assignment to multiviewer inputs (VIPs):

- **SHOW** — Show sources from the Show Sources page
- **EVS** — EVS super channel outputs
- **TX/PGM/CG** — Transmission, program, and graphics feeds
- **Test Signals** — Test patterns
- **SWR Outs** — Switcher outputs

VIPs can also be clicked directly and filtered to find any specific source without using drag and drop. Either way — drag and drop or direct selection — the resulting route either stages or takes immediately based on the bridge trigger mode.

### Why the Wall Pages Come After Physical I/O and Connection

By the time an engineer reaches the Monitor Wall pages, every source is named, every physical path is documented, and the infrastructure is configured. The wall pages are where all of that upstream work pays off — assigning sources to monitors and multiviewers is only meaningful once you know what sources exist and how they arrive. The wall pages are the operational layer on top of the infrastructure layer.

---

---

## CONFIG

### Category Philosophy

The Config pages are positioned at the bottom of the sidebar not because they come last in operational flow but because they are engineer-only territory. Directors, TDs, replay operators, and audio engineers have no need to navigate here. Keeping these pages separated from the operational pages reduces cognitive overhead for non-engineering crew and keeps sensitive configuration controls away from anyone who shouldn't be touching them.

The ENGINEER page in particular may need to be visited before any other page in the book — the NV9000 config section must be completed as soon as show sources are defined and updated any time they change. The sidebar position reflects access hierarchy, not workflow sequence.

---

## ENGINEER

### Engineering QC Monitors

The top section of the ENGINEER page tracks the engineering QC monitors — the monitors at the engineering position used for signal verification and quality control. These monitors can display any source in the router or be fed directly from the engineering video patchbay for sources outside the router infrastructure. This section documents what is assigned to each QC monitor position for the current show.

### NV9000 Bridge Control

A collapsible section housing the bridge connection controls and routing mode settings for the NV9000 router bridge.

**Global mode** — Sets all routing categories simultaneously to the same trigger mode. One control affects everything.

**Per-category mode** — Three routing categories can each be set independently to either Immediate or Staged:

- **Video I/O** — Controls trigger mode for all routing executed from the VIDEO I/O page
- **Monitor Walls** — Controls trigger mode for all source routing and layout changes made from any monitor wall page
- **EVS Config** — Controls trigger mode for Wohler routing executed from the EVS Config page

This allows fine-grained control over which sections take changes live versus which queue them for engineer confirmation. During a show build an engineer might set Monitor Walls to Immediate while keeping Video I/O Staged, for example.

The trigger mode decision is the engineer's to make based on the current operational context. Build environment versus live show demands different behavior and the engineer sets it here.

### NV9000 Config — Show Source Router Programming

This is one of the most critical sections in the entire application for MU-21's workflow.

MU-21 builds show sources into the router at the physical layer manually. The router contains pre-built devices named SHOW 01 through SHOW 80 — empty slots waiting to be programmed with the actual engineering sources for each show. This programming happens in the router's own configuration software at the hardware level, separate from Showbook.

To program a SHOW slot in the router, the engineer needs the exact numerical input numbers for each video level and all 16 audio levels for the engineering source being assigned to that slot. These numbers are specific to the router's internal addressing and are not human-friendly to look up or calculate manually.

The NV9000 Config section computes these numbers automatically from the show source configuration already entered in Showbook. When show sources are assigned engineering sources on the Show Sources page, the router input numbers for those engineering sources are calculated and presented here in a ready-to-use format.

**Copy Names** — Copies the show source names in a format ready to paste directly into the router configuration software.

**Copy Levels** — Copies the numerical input level assignments for each show source in a format ready to paste directly into the router configuration software.

This eliminates manual lookup of router input numbers — a tedious and error-prone process — and makes the transfer from Showbook configuration to physical router configuration fast and accurate.

**Why this must stay current:** Showbook's routing commands reference SHOW slot names. The destination will receive whatever is programmed into that SHOW slot in the physical router. If SHOW 05 is not programmed with the correct engineering source, the destination gets the wrong picture — the right monitor or output receives the wrong feed. The physical router source programming and Showbook's show source assignments must stay in sync. This section must be revisited and the router updated any time show sources are added, changed, or removed.

### Tallyman UMD Updater

The bottom section of the ENGINEER page manages the Tallyman under-monitor display system.

**Bridge control** — Connection settings for the Tallyman bridge, which communicates via TSL 5.0 UDP to the Tallyman system that drives physical UMD hardware throughout the truck.

**UMD reference display** — All engineering sources and their assigned UMD names are displayed here so the engineer can verify every monitor label assignment at a glance — confirming that each engineering source that should have a UMD name assigned does.

**Take Sync All UMDs** — A single button that pushes all current UMD name assignments to the Tallyman system via the bridge simultaneously. When show sources change, operator names are updated, or any UMD text changes, this button propagates every label to the physical hardware in one operation.

---

## MULTIVIEWERS

### Operational Intent

The MULTIVIEWERS page gives the engineer a consolidated view of all 22 Kaleido multiviewer cards without having to navigate through each individual monitor wall page. Every card's current layout and source assignments are visible and controllable from one place.

**Bidirectional sync with all monitor wall pages.** Layout selections and source routing made here reflect immediately on the relevant monitor wall pages. Changes made on any monitor wall page reflect here. Neither the MULTIVIEWERS page nor any individual wall page owns the data — they are all views of the same underlying configuration.

This page exists because during show build and troubleshooting an engineer needs a system-wide view of multiviewer state. Jumping between six wall pages to audit what every MV card is doing is inefficient. The MULTIVIEWERS page collapses that into a single reference and control surface.

### Kaleido Bridge Control

A collapsible section housing the connection settings and trigger mode controls for the Kaleido bridge — the local Node.js server running on the engineering computer at localhost:3001. The bridge communicates via TSL v5.0, sending dedicated tally index numbers to trigger pre-defined layout actions on the Kaleido KMX cards. Layouts and their corresponding actions must be pre-configured in XEdit on the cards before any trigger can fire them. The bridge is the mechanism that sends the trigger — the layout definitions live in the cards themselves.

**Global mode** — Sets all layout changes to the same trigger mode simultaneously.

**Per-category control** — Individual sections can be set to Immediate or Staged independently, giving the engineer precise control over which cards take layout changes live versus which queue them.

This mirrors the NV9000 bridge control pattern on the ENGINEER page by design — consistent controls for consistent behavior across both hardware bridges.

### Staged Layouts Panel

Layout changes queued in staged mode accumulate here before execution. The engineer can review all pending layout changes across all cards and execute them as a coordinated group when ready. This is essential for show transitions where multiple monitor walls need to change simultaneously — queue all the layout changes during preparation, execute once on cue.

---

## RTR I/O MASTER

### Operational Intent

The RTR I/O MASTER is the authoritative mirror of the physical NV9000 router's complete device library. Every input and every output that exists in the router — every device name, every video level, every audio level — must be represented here exactly as it is configured in the actual router hardware. This is not aspirational documentation. It must match the physical router precisely because every routing command Showbook sends is built from this data.

### Two Roles — Reference and Foundation

**Reference** — The RTR I/O MASTER is the single place an engineer can see the complete router I/O library. Inputs and outputs are displayed in sub-tabs for clarity. Device names, video levels, and all 16 audio levels for each device are visible and auditable here.

**Foundation** — Every dropdown throughout Showbook that requires a router device — engineering sources on the Show Sources page, destinations on the VIDEO I/O page, outputs on TX/PGM/GFX, and everywhere else — is populated from this library. If a device doesn't exist in the RTR I/O MASTER it cannot be selected or routed anywhere in Showbook. The master is the data foundation the entire routing system depends on.

### Show Source Computation

Just as the ENGINEER page computes and presents show source router programming for transfer to the physical router, the RTR I/O MASTER reflects show source assignments automatically. As show sources are named and assigned engineering sources on the Show Sources page, the corresponding SHOW 01 through SHOW 80 entries in the master input library update to match. The master always presents what the correctly configured router should look like — making it easy to verify that the physical router and Showbook are in sync.

### Why Accuracy Here Is Critical

A mismatch between the RTR I/O MASTER and the actual router configuration causes routing failures. A device named differently here than in the router means commands referencing that device go nowhere or to the wrong destination. A missing audio level means audio routes don't execute. The RTR I/O MASTER must be established correctly when Showbook is first configured for a truck and maintained accurately through any router configuration changes.

*Note for other trucks: The RTR I/O MASTER will be entirely different for every unit. Device names, ID numbers, input counts, output counts, and audio level assignments are all router-specific. This is one of the primary configuration differences between any two Showbook installations.*

---

## DROPDOWN OPTIONS

### Operational Intent

Previously named Sheet8 — a legacy name that gave no indication of purpose. Renamed to Dropdown Options because that is exactly what it is: the editor for every reference list that populates dropdown menus throughout Showbook that are not sourced from the router library or show data.

Six editable lists maintained here:

**Device Types** — Categories of equipment used throughout the truck. Populates device type selectors where equipment classification is needed.

**Video Formats** — The video format options available for assignment throughout the book. Default formats reflect common broadcast standards — 1080p/59.94, 1080i/59.94, 720p/59.94, 1080p/59.94 HDR. The framesync format field on the CCU/FSY page pulls from this list. Other trucks running different formats add them here.

**Audio Formats** — Audio format options for relevant fields throughout the book.

**Locations** — Physical location descriptors for equipment positioning documentation.

**TAC Panels** — The names of fiber TAC panels available for assignment on the CCU/FSY and FIBER TAC pages. On MU-21 these are TAC-A through TAC-H, S09, and S10. A truck with different panel naming updates this list and every TAC dropdown throughout the book reflects the change.

**Audio Sources** — Audio source options available for assignment in audio source fields throughout the book.

### Why This Page Matters for Other Trucks

Every list on this page is truck-specific. MU-21's TAC panel names, video formats, and device types will differ from another unit. This page is where a new truck installation customizes Showbook's dropdown options to match their actual infrastructure — without touching any code. Change the list here, every relevant dropdown in the book updates automatically.

This is also the page that makes Showbook configurable for different environments without requiring developer intervention for basic option changes.

---

## Document Status

All 20 pages documented across 7 categories. The architecture document is now complete as a first pass — capturing the operational intent, design reasoning, and system philosophy behind every section of Showbook.

This document should be updated any time:
- A new page or feature is added
- An existing page's behavior or intent changes
- A design decision is made that affects how the system works
- Terminology or naming changes

*The why behind every decision is the most valuable thing this document contains. Keep it current.*
