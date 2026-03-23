# MU-21 Showbook
## A Digital Command Center for Live Broadcast Production

---

### The Challenge

Live broadcast production is one of the most technically demanding environments in media. A single football game involves coordinating 
dozens of cameras, replay servers, graphics systems, audio feeds, and transmission paths — all flowing through a mobile production truck 
smaller than a school bus. Every signal must arrive at the right place at the right time, and every monitor must display exactly what 
the director expects to see.

For decades, this coordination happened on paper. Engineers maintained massive spreadsheets — sometimes called "showbooks" — that tracked 
every cable, every device assignment, and every routing decision. These spreadsheets worked, but they had fundamental limitations: only 
one person could edit at a time, changes didn't propagate automatically, and there was no connection between the documentation and the actual 
hardware.

The MU-21 Showbook changes that.

---

### What It Is

The MU-21 Showbook is a web-based application that serves as the central nervous system for a mobile broadcast production unit. It replaces 
paper spreadsheets with a live, interactive interface that multiple engineers can access simultaneously. More importantly, it connects 
directly to the broadcast infrastructure — when an engineer makes a change in the software, it can execute on the actual hardware.

The application manages:

**80 Video Sources** — Every camera, replay channel, graphics output, and external feed gets a name, a technical identifier, and audio routing. 
When the director calls for "Camera 1," everyone in the truck sees the same information about what that means technically.

**1100+ Router Devices** — The video router is the heart of any broadcast facility. It connects any input to any output on command. 
The Showbook maintains the complete device library with video levels and 16-channel audio mappings for each device, including 160 audio-only 
destinations for Wohler monitoring and MDI outputs.

**4 EVS Replay Servers** — Instant replay is essential to sports broadcasting. The application tracks all four replay servers with their channel 
assignments, network configurations, position-based Wohler audio routing, and operator assignments.

**22 Multiviewer Outputs** — Engineers monitor dozens of video feeds simultaneously on large monitor walls. Each multiviewer can display multiple 
sources in 11 configurable layouts. The Showbook controls these layouts and tracks what appears where.

**67 Framesync Channels** — Every external source entering the truck requires timing synchronization. The application tracks all framesync 
channels across AJA FS4 units, AJA FS2, and EVS Neuron hardware with automatic device mapping.

**Hundreds of Physical Connections** — Fiber cables, coax cables, audio cables — every physical connection in the truck is documented and 
cross-referenced. Change an assignment in one place, and related pages update automatically.

---

### How It Works

The application is organized into 20 tabs across seven categories, each serving a specific engineering function:

**Home** provides orientation — show identity, equipment summary with live resource counts (CCUs, framesyncs, sources in use), and quick 
navigation to all pages.

**Input** handles source and transmission configuration. TX/PGM/GFX establishes transmission feeds, program outputs, and graphics channels 
with framesync assignments. SHOW SOURCES names each of the 80 available sources, assigns them to physical devices, and configures audio routing. 
EVS CONFIG manages replay server settings with position-based Wohler audio routing that executes directly through the router.

**Physical I/O** documents the actual hardware. CCU/FSY tracks camera control units and all 67 framesync channels with automatic device mapping. 
VIDEO I/O manages router outputs — 16 fiber, 16 coax, and two JFS multiplexers. NETWORK I/O maps all RJ45 ports throughout the truck. 
SWR I/O documents the 120 switcher inputs, 46 outputs, tally assignments, and GPI connections.

**Connection** shows visual representations of patch infrastructure. FIBER TAC displays fiber patch panels with 24 clickable ports each. 
COAX MULTS shows 8 mult units with 15 outputs each. AUDIO MULTS tracks DT-12 audio distribution panels. Changes sync bidirectionally with 
the Physical I/O pages.

**Monitor Walls** provide drag-and-drop control of six distinct monitor areas — PROD Digital, PROD Print, P2-P3, EVS, AUD, and VIDEO. 
Engineers can drag source chips onto monitor positions, select from 11 multiviewer layouts, and execute routing changes.

**Config** houses the engineering control center. ENGINEER provides NV9000 router bridge controls with per-page routing modes, UMD management, 
and staged routes panel. MULTIVIEWERS gives a consolidated view of all 22 Kaleido cards. ROUTER PANELS configures panel button assignments.

**Lookup** maintains master reference data. RTR I/O MASTER contains the complete router device library — every input and output the system can 
route. DROPDOWN OPTIONS provides editable lists that populate menus throughout the application.

---

### The Technology

The Showbook runs entirely in a web browser with no installation required. Engineers access it from any computer on the truck network — 
including tablets and phones. The application is hosted on Netlify and accessible from anywhere with internet access.

The architecture separates what everyone can see from what only the engineering station executes. When a replay operator makes a routing 
change from an iPad, that change queues in the cloud via Supabase real-time sync. The engineering computer detects the queued change and 
executes the actual hardware command through the local bridge servers. This means anyone with access can control the infrastructure, while 
the engineering station handles all hardware communication automatically.

Three bridge servers translate software commands into hardware actions:

The **NV9000 Bridge** communicates with the Grass Valley NV9000 video router. When an engineer assigns a source to a monitor or Wohler output, 
the software sends a routing command that physically switches the signal.

The **Kaleido Bridge** controls the Grass Valley multiviewer system via TSL 5.0 triggers. Layout changes — switching from a 9-split view to a 
4-split view — execute through pre-configured layout actions on the cards.

The **Tallyman Bridge** updates monitor labels throughout the facility via TSL 5.0 UDP. When a source name changes, the new text propagates to 
every display showing that source.

The interface uses a dark theme optimized for the low-light environment of a production control room. Color-coded categories help engineers 
quickly identify different types of information.

---

### Routing Modes

The application provides fine-grained control over how routing commands execute. Engineers can set routing behavior globally or per-page:

**Immediate Mode** — Changes execute instantly when selected. Useful during show build when rapid iteration is needed.

**Staged Mode** — Changes queue in the Staged Routes panel without executing. The engineer reviews all pending changes and triggers them 
with a single "Take All" command. Essential during live production when changes must be coordinated.

**Per-Page Control** — Three routing categories can be set independently:
- Video I/O routing
- Monitor Wall assignments
- EVS Config Wohler routing

This means an engineer can configure monitor walls in immediate mode for quick setup while keeping Video I/O in staged mode to prevent 
accidental transmission changes.

---

### Staged Execution

One of the application's most powerful features is staged execution. In live broadcasting, engineers often need to prepare complex 
setups before a show without disrupting the current configuration. The Showbook allows changes to be "staged" — queued but not executed — 
until the engineer triggers them all at once.

This means an engineer can:
- Configure all 80 sources for tomorrow's show
- Set up monitor layouts for the new production
- Prepare routing changes for different camera positions
- Stage Wohler audio routing for EVS positions

All without affecting the current live broadcast. When the time comes, a single "TAKE ALL" command executes every staged change simultaneously.

---

### Bidirectional Synchronization

The application maintains relationships between related data across different pages. When an engineer assigns a camera to a fiber port on the 
CCU/FSY page, that assignment automatically appears on the Fiber TAC visual patch panel. Edit either page, and the other updates to match.

Similarly, framesync assignments on the TX/PGM/GFX page appear in the CCU/FSY Show Name column, ensuring engineers see complete framesync usage 
from any perspective.

This bidirectional synchronization eliminates a common source of errors in broadcast engineering: documentation that falls out of sync with 
reality. In the Showbook, there is one source of truth, viewed from multiple perspectives.

---

### Remote Device Support

The RouteQueue system enables any device on the network to control the broadcast infrastructure:

1. A replay operator on an iPad changes a monitor assignment
2. The change saves to cloud storage via Supabase real-time sync
3. The engineering computer detects the queued route
4. The bridge server executes the hardware command
5. The queue clears and syncs back to all devices

Remote devices never need direct access to the bridge servers. They interact with the show data, and the engineering station handles all 
hardware communication automatically. This preserves operational hierarchy — anyone can see and request changes, the engineer's station 
executes them.

---

### Why It Matters

Live broadcasting operates under intense time pressure with zero tolerance for technical failures. Millions of viewers are watching. 
Advertisers are paying premium rates. The production team has one chance to get it right.

The MU-21 Showbook reduces errors by:
- Eliminating duplicate data entry
- Providing immediate visual feedback
- Connecting documentation to actual hardware
- Enabling real-time collaboration
- Maintaining automatic cross-references
- Tracking resource constraints (framesyncs, sources) in real-time

It saves time by:
- Auto-filling repetitive data with quick-fill controls
- Providing quick-access dropdowns populated from master lists
- Enabling drag-and-drop monitor assignments
- Batching changes for coordinated execution
- Auto-populating Wohler outputs based on EVS position

It improves communication by:
- Giving everyone access to the same current information
- Updating monitor labels automatically via Tallyman
- Providing clear visual representations of complex systems
- Showing equipment usage on the Home page dashboard

---

### The User Experience

Engineers interact with the Showbook through a consistent, intuitive interface. The sidebar provides navigation to all 20 tabs organized by 
category. Each page follows the same design patterns: section headers organize content, tables display data with inline editing, and dropdowns 
pull options from centralized reference lists.

Visual patch panels represent physical hardware with clickable ports. Assigned ports highlight in color. Hover effects provide feedback. 
Modal dialogs allow quick selection from categorized options.

Monitor walls display actual monitor layouts with drag-and-drop source assignment. Layout selectors show all 11 available configurations with 
visual previews. VIP positions highlight for quick identification.

The dark color scheme reduces eye strain during long production days. Color-coded accents — cyan for show names, orange for staging indicators 
— help engineers quickly parse complex information. Status indicators show bridge connection states.

---

### Conclusion

The MU-21 Showbook represents a fundamental shift in how broadcast engineers manage production infrastructure. By replacing static spreadsheets 
with a dynamic, connected application, it transforms documentation from a record of what should be into a control system for what is.

Every source assignment, every cable patch, every monitor layout, every Wohler route lives in one place, accessible to everyone who needs it, 
synchronized in real-time, and connected to the hardware that makes live broadcasting possible.

This is modern broadcast engineering: collaborative, automated, and precise.

---

*MU-21 Showbook — Built for the engineers who make live television happen.*
