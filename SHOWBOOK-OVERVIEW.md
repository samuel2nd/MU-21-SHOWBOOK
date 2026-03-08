# MU-21 SHOWBOOK — Complete Application Reference

> **Version:** March 2026
> **Platform:** MU-21 Mobile Production Unit (Sony ELC Broadcast Truck)
> **Technology:** Vanilla JavaScript, CSS3, Supabase Cloud, Node.js Bridge Servers

---

# TABLE OF CONTENTS

1. [What Is This Application?](#what-is-this-application)
2. [Who Uses This Application?](#who-uses-this-application)
3. [How The Application Works](#how-the-application-works)
4. [Complete Tab Reference](#complete-tab-reference)
5. [Integration Systems](#integration-systems)
6. [Data Architecture](#data-architecture)
7. [File Structure](#file-structure)
8. [Building From Scratch](#building-from-scratch)

---

# WHAT IS THIS APPLICATION?

The MU-21 Showbook is a web-based control center for managing a mobile broadcast production truck. Think of it as the "brain" that connects all the pieces of a live TV broadcast:

- **80 video sources** (cameras, graphics, replays, etc.)
- **288+ router devices** (where video signals go)
- **5 EVS replay servers** (instant replay machines)
- **22 Kaleido multiviewers** (the big wall of monitors engineers watch)
- **Hundreds of physical connections** (fiber cables, coax cables, audio cables)

Instead of tracking all this on paper spreadsheets (which is error-prone), this application provides:

1. **A single source of truth** — everyone sees the same data
2. **Automatic calculations** — change a camera assignment, and it updates everywhere
3. **Direct hardware control** — click a button to actually route video signals
4. **Multi-user collaboration** — multiple engineers can edit simultaneously
5. **Cloud backup** — shows are saved online and can be loaded from any device

---

# WHO USES THIS APPLICATION?

## Technical Director (TD)
- Sets up the show's source assignments
- Configures switcher inputs/outputs
- Manages tally and GPI groups

## Video Engineer (VE)
- Assigns cameras to CCU (Camera Control Units)
- Routes video through frame synchronizers
- Manages fiber and coax patch panels
- Controls multiviewer layouts

## Audio Engineer (A1)
- Assigns audio sources and channels
- Manages audio multiplexer panels
- Tracks 16-channel audio mappings per device

## EVS Operator
- Configures EVS replay servers
- Assigns channel names and tape numbers
- Manages playback settings

## EIC (Engineer In Charge)
- Oversees all technical aspects
- Exports router configurations
- Manages cloud show storage

---

# HOW THE APPLICATION WORKS

## Opening The Application

1. Open a web browser (Chrome, Firefox, or Edge)
2. Navigate to the showbook URL (typically `http://localhost:8080` on the truck network)
3. The HOME tab loads with show info and navigation

## Basic Workflow

### Starting a New Show
1. Go to **HOME** tab
2. Enter the **Show Name** (e.g., "Sunday Night Football")
3. Select the **Video Format** (1080p/59.94, 1080i/59.94, or 720p/59.94)
4. This information appears in the header and is included in all exports

### Defining Sources
1. Go to **SOURCE** tab
2. For each of the 80 available sources:
   - Enter a **Show Name** (what appears on monitors, e.g., "MAIN CAM 1")
   - Enter a **UMD Name** (shorter name for under-monitor displays, e.g., "CAM1")
   - Select an **Eng Source** (the physical device, e.g., "CCU 01")
   - Select an **Audio Source** (where audio comes from)
3. Use **Auto-fill** to quickly populate multiple sources at once

### Setting Up Equipment
1. Go to **CCU/FSY** tab to assign cameras and frame syncs
2. Go to **TX/PGM/GFX** tab to configure transmission and graphics
3. Go to **EVS CONFIG** tab to set up replay servers

### Patching Physical Connections
1. Go to **FIBER TAC** tab to assign fiber panel ports
2. Go to **COAX** tab to assign coax multiplexer outputs
3. Go to **AUDIO MULT** tab to assign audio panel ports
4. Go to **NETWORK I/O** tab to document network connections

### Controlling Monitor Walls
1. Go to any **MONITOR** tab (PROD, P2-P3, EVS, AUD, VIDEO)
2. Drag sources onto monitor positions
3. Select multiviewer layouts
4. Routes can be **staged** (queued) or **immediate** (instant)

### Saving and Sharing
- **Auto-save**: Every change is automatically saved to the browser
- **Cloud sync**: If configured, changes sync to Supabase in real-time
- **Share URL**: Copy the URL with `?show=SHOWNAME` to share with others
- **Export**: Download JSON backup or CSV files for router import

---

## Navigation

The sidebar on the left contains all tabs organized by category:

| Category | Color | Purpose |
|----------|-------|---------|
| **HOME** | Blue | Dashboard and navigation |
| **INPUT** | Green | Define sources and input equipment |
| **OUTPUT** | Purple | Configure outputs and UMD text |
| **LOOKUP** | Orange | Reference data and device library |
| **PHYSICAL** | Cyan | Fiber, coax, audio, and network patching |
| **MONITOR** | Red | Monitor wall control and routing |
| **CONFIG** | Yellow | EVS, multiviewer, and router panel setup |

Click any tab to navigate. The current tab is highlighted.

---

# COMPLETE TAB REFERENCE

## HOME Tab

**Purpose:** Landing page with show information and quick navigation

**What You See:**
- **Show Info Box**: Text field for show name, dropdown for video format
- **Equipment Summary**: Live counts of active sources, devices in use, and monitors configured
- **Navigation Grid**: Clickable cards for all 20 tabs organized by category

**What You Do:**
1. Enter the show name
2. Select the video format
3. Click any card to jump to that tab

**Data Saved:**
- `show.name` — The show title
- `show.format` — The video format selection

---

## SOURCE Tab

**Purpose:** Define all 80 broadcast sources with names, devices, and audio assignments

**What You See:**
- Two side-by-side tables (Sources 1-40 and 41-80)
- Each row has: Source #, Show Name, UMD Name, Eng Source, Audio Source, REMI Name, Active checkbox
- Auto-fill form at the top for bulk entry

**What You Do:**
1. Enter **Show Name** for each active source (e.g., "SLASH CAM", "MAIN CAM 1")
2. Enter **UMD Name** (shorter version for monitor displays)
3. Select **Eng Source** from dropdown (the physical device like "CCU 01" or "FS 05")
4. Select **Audio Source** from dropdown (where audio comes from)
5. Check **Active** for sources that are in use
6. Use **Auto-fill** to populate multiple sources:
   - Enter a prefix (e.g., "CAM")
   - Set start number and count
   - Click "Fill" to auto-number (CAM 01, CAM 02, CAM 03...)

**How It Connects:**
- Show names sync to **RTR I/O MASTER** SHOW device names (for router lookups)
- Eng Source selections determine video levels (looked up from RTR I/O MASTER)
- Audio Source selections determine 16-channel audio mappings
- UMD names appear in **ENGINEER** tab for Tallyman sync

**Data Saved:**
- `sources[0-79].showName`
- `sources[0-79].umdName`
- `sources[0-79].engSource`
- `sources[0-79].audioSource`
- `sources[0-79].remiName`
- `sources[0-79].active`

---

## TX/PGM/GFX Tab

**Purpose:** Configure transmission outputs (TX 1-8), program outputs (PGM 1-2), graphics (GFX 1-3), and canvas channels (CANVAS 1-8)

**What You See:**
- Four sections with tables:
  - **TX 1-8**: Transmission DA outputs
  - **PGM 1-2**: Program outputs
  - **GFX 1-3**: Graphics content sources
  - **CANVAS 1-8**: Canvas channel assignments

**What You Do:**
1. Enter **Show Name** for each output
2. Enter **UMD Name** for monitor displays
3. Enter **Destination** information
4. Add notes as needed

**How It Connects:**
- TX DA names are used by **ENGINEER** tab for UMD lookups
- CG and CANVAS names appear in monitor wall drag-and-drop sources

**Data Saved:**
- `txPgmGfx.tx[0-7]` — TX rows
- `txPgmGfx.pgm[0-1]` — PGM rows
- `txPgmGfx.gfx[0-2]` — GFX rows
- `txPgmGfx.canvas[0-7]` — CANVAS rows

---

## CCU/FSY Tab

**Purpose:** Configure Camera Control Units (CCU 1-12) and Frame Synchronizers (FSY 1-67) with fiber and coax routing

**What You See:**
- **CCU Section (1-12)**: Camera control unit assignments
- **FSY Section (1-67)**: Frame synchronizer assignments

**CCU Columns:**
- Unit number
- Device type
- TAC panel assignment (dropdown)
- FIB-A strand (dropdown, 1-24)
- FIB-B strand (dropdown, 1-24)
- Show Name (computed from SOURCE page)
- Lens checkboxes (B, S, W, Dolly, Hand)
- Notes

**FSY Columns:**
- Unit number
- Format (dropdown from reference data)
- TAC panel assignment
- FIB-A strand
- Show Name (computed)
- Source (computed from SOURCE page engSource)
- MULT assignment (dropdown, 1-40)
- COAX output number
- Fixed and JS fields
- Notes

**How It Connects:**
- TAC and FIB-A/B selections **automatically sync to FIBER TAC** page
- MULT selections **automatically sync to COAX MULTS** page
- Changes are bidirectional — editing FIBER TAC updates CCU/FSY

**Data Saved:**
- `ccuFsy.ccu[0-11]` — CCU configurations
- `ccuFsy.fsy[0-66]` — FSY configurations

---

## RTR I/O MASTER Tab

**Purpose:** The master device library containing all router devices with video levels and 16-channel audio mappings

**What You See:**
- Sub-tab toggle: **ROUTER INPUTS** / **ROUTER OUTPUTS**
- Table with columns: Row #, Device Name, Description, Video Level, A1-A16

**ROUTER INPUTS Contains:**
- CCU 01-12 (Camera Control Units)
- FS 01-67 (Frame Synchronizers)
- EVS devices (inputs and outputs)
- CG 1-6 (Character Generators)
- CANVAS 1-8
- De-embedder devices
- SHOW 01-80 (the 80 sources)
- And more (~288 devices total)

**ROUTER OUTPUTS Contains:**
- Transmission outputs
- Monitor destinations
- MV inputs
- And other output-only devices

**Special Behavior:**
- **SHOW devices** (sources 1-80) display **computed** video/audio levels
  - Green background indicates computed values
  - Values come from SOURCE page engSource/audioSource lookups
  - These cells are read-only
- **Duplicate device names** show warnings (breaks router lookups)
- Missing descriptions or video levels trigger validation warnings

**How It Connects:**
- All dropdowns across the app pull device names from this list
- Video/audio levels are used for NV9000 router exports
- Device names must match exactly for routing to work

**Data Saved:**
- `rtrMaster[0-287+]` — Input devices
- `rtrOutputs[0-N]` — Output devices

---

## SHEET8 Tab

**Purpose:** Manage reference dropdown lists used throughout the application

**What You See:**
- Six text areas (one item per line):
  - Device Types
  - Video Formats
  - Audio Formats
  - Locations
  - TAC Panels
  - Audio Sources

**What You Do:**
1. Edit any list by adding/removing lines
2. Changes immediately affect all dropdowns using that list

**Example:**
Adding "TAC-K" to TAC Panels makes it available in CCU/FSY TAC dropdowns.

**Data Saved:**
- `sheet8.deviceTypes`
- `sheet8.videoFormats`
- `sheet8.audioFormats`
- `sheet8.locations`
- `sheet8.tacPanels`
- `sheet8.audioSources`

---

## ENGINEER Tab

**Purpose:** NV9000 router control center and Tallyman UMD text management

**What You See:**

### Section 1: EIC QC Monitors
- Two monitor assignments (EIC QC 1 and EIC QC 2)
- Type-to-filter source dropdowns
- Routes directly to the EIC's quality control monitors

### Section 2: NV9000 Router Bridge (Collapsible)
- Bridge status indicator (Connected/Offline)
- Bridge URL configuration
- Trigger mode selection (Immediate vs Staged)
- Per-page mode overrides (Video I/O, Monitor Walls)
- Test route interface (source → destination)

### Section 3: Staged Routes Panel
- Shows count of staged routes (when in Staged mode)
- "TAKE ALL" button to execute all staged routes at once
- "Clear All" button to discard staged routes
- List of pending routes with remove buttons

### Section 4: NV9000 Show Sources
- Tables showing SHOW 01-80 with RTR IDs, show names, and levels
- Copy Names / Copy Levels buttons for clipboard export

### Section 5: Tallyman UMD Updater
- Bridge status indicator
- "Sync All UMDs" button
- Six UMD position groups displayed in grids:
  - **CCU / FRAMESYNC**: CCU 01-12, FS 01-30
  - **EVS / CG**: EVS outputs/inputs, CG 1-6, CANVAS 1-8
  - **SWITCHER OUTS**: PGM, CLEAN, ME buses, AUX 1-12, IS 1-10
  - **SPARE DE-EMBEDDING**: DEM 87-134
  - **TRANSMISSION DA'S**: TX1-TX8 DA
  - **CCU / FRAMESYNC (continued)**: FS 31-67

**How UMD Lookup Works:**
For each position, the system searches (in order):
1. SWR I/O outputs (for switcher positions)
2. EVS CONFIG (for EVS positions)
3. SOURCE page (for CCU/FS positions)
4. TX/PGM/GFX (for TX DA, CG, CANVAS positions)

**What You Do:**
1. Configure NV9000 bridge URL if different from default
2. Select trigger mode (Staged for complex shows, Immediate for live changes)
3. Test routes using the test interface
4. Review and execute staged routes
5. Sync UMD text to Tallyman system

**Data Saved:**
- `eicQcMonitors` — EIC monitor assignments
- NV9000 settings stored in localStorage

---

## SWR I/O Tab

**Purpose:** Switcher input/output mapping with tally and GPI groups

**What You See:**

### Switcher Inputs (1-120)
- 3-column layout for compact viewing
- Columns: #, Show Source, Eng Source
- Show Source auto-populates from SOURCE page

### Switcher Outputs (1-46)
- Columns: #, Default (read-only), UMD (editable)
- Default shows the standard output name (PGM A, CLEAN, ME buses, etc.)
- UMD field for custom display text

### SWR Tally Group (1-24)
- Columns: #, Default, UMD
- Tally assignments for source indication

### SWR GPI Group (1-12)
- Columns: #, Default, UMD
- GPI trigger assignments

**How It Connects:**
- Switcher output UMD values appear in ENGINEER tab
- Used by Tallyman sync for switcher position text

**Data Saved:**
- `swrIo.inputs[0-119]`
- `swrIo.outputs[0-45]`
- `swrIo.tally[0-23]`
- `swrIo.gpi[0-11]`

---

## VIDEO I/O Tab

**Purpose:** Router output routing configuration for fiber, coax, and tie lines

**What You See:**

### I/O RTR OUTPUT Section
Two side-by-side tables:
- **FIBER (1-16)**: Fiber router outputs with Source, Destination, TAC, FIB columns
- **COAX (1-16)**: Coax router outputs with Source, Destination, MULT, COAX columns

### TIE LINES Section
Two side-by-side tables:
- **COAX I/O TIE LINES (1-48)**: Source, Destination (editable), MULT, COAX columns
- **COAX TRUCK TIE LINES (1-48)**: Position label (P1-1 through REVS-12), Source, Destination (editable)

### FIBER JFS MUX Section
Two multiplexer configurations:
- **JFS MUX 1 (1-12)**: Source, Destination, FXD checkbox, with TAC/FIB-A header
- **JFS MUX 2 (1-6)**: Same layout, smaller

**What You Do:**
1. Select **Source** from dropdown (device names from RTR Master)
2. Enter or select **Destination**
3. Assign TAC panels and fiber strands for fiber outputs
4. Assign MULT and COAX outputs for coax routing
5. Routes can execute immediately or be staged (based on ENGINEER tab settings)

**How It Connects:**
- Routes trigger NV9000Client based on trigger mode
- Fiber assignments sync to FIBER TAC page
- MULT assignments sync to COAX MULTS page

**Data Saved:**
- `videoIo.fiberRtrOut[0-15]`
- `videoIo.coaxRtrOut[0-15]`
- `videoIo.coaxIoTieLines[0-47]`
- `videoIo.coaxTruckTieLines[0-47]`
- `videoIo.jfsMux1`
- `videoIo.jfsMux2`

---

## FIBER TAC Tab

**Purpose:** Visual fiber patch panel management for TAC panels

**What You See:**
- Control bar with panel count and add buttons
- Grid of TAC panels (TAC-A through TAC-H, S09, S10, plus custom)
- Each panel shows a 6×4 grid (24 ports)
- Assigned ports are highlighted blue with white text
- Badge shows "N used" for each panel

**What You Do:**
1. Click "**+ Add TAC Panel**" to add custom panels
2. Click any port to open the assignment editor
3. In the editor, choose quick-assign tabs:
   - **CCU**: Lists CCU 01-12 with A/B sides
   - **FSY**: Lists FS 01-67 with show names
   - **VIDEO I/O**: Lists Fiber RTR outputs
   - **Other**: Manual text entry for source/dest
4. Click to assign or use "Clear" to remove

**How It Connects:**
- Changes sync bidirectionally with CCU/FSY tab
- Assigning CCU 01-A in FIBER TAC updates CCU 01's TAC/FIB-A fields
- Changing CCU 01's TAC/FIB-A in CCU/FSY updates FIBER TAC

**Data Saved:**
- `fiberTac['TAC-A'][0-23]` through `fiberTac['S10'][0-23]`
- Each port: `{ port, source, dest, notes }`

---

## COAX Tab

**Purpose:** Coax multiplexer assignment with visual grid layout

**What You See:**
- 8 MULT units displayed as cards
- Each unit shows a 5×3 grid (15 outputs)
- Assigned outputs are highlighted orange
- Badge shows "N used" for each unit

**What You Do:**
1. Click any output to open the assignment editor
2. Choose quick-assign tabs:
   - **FSY**: Lists FS 01-67 with show names
   - **VIDEO I/O**: Lists Coax RTR and Tie Line rows
   - **Other**: Manual text entry
3. Click to assign or use "Clear Output" to remove

**How It Connects:**
- Changes sync with CCU/FSY MULT selections
- Assigning FSY to a MULT updates the FSY row's mult/coax fields

**Data Saved:**
- `coax.mults[0-7]` — 8 MULT units, 15 outputs each

---

## AUDIO MULT Tab

**Purpose:** DT-12 audio panel assignments

**What You See:**
- 6 panels (A through F) in a 2-column grid
- Each panel shows a 6×2 grid (12 ports)
- Assigned ports are highlighted orange
- Badge shows "N used" for each panel

**What You Do:**
1. Click any port to open the editor
2. Enter **Source** (what's feeding the port)
3. Enter **Destination** (where it goes)
4. Click "Save" or "Clear"

**Data Saved:**
- `audioMult.dtA[0-11]` through `audioMult.dtF[0-11]`
- Each port: `{ port, source, dest }`

---

## NETWORK I/O Tab

**Purpose:** Network patch documentation for three physical areas

**What You See:**
- **I/O Area** (24 ports): 2×12 grid
- **Truck Bench** (24 ports): 2×12 grid
- **Above Tape** (12 ports, numbered 13-24): 1×12 grid

Each port shows:
- Port number
- Device name
- Notes

Assigned ports are highlighted green.

**What You Do:**
1. Click any port to open the editor
2. Enter **Device** name
3. Enter **Notes** for additional info
4. Click "Save" or "Clear"

**Data Saved:**
- `networkIo.io[0-23]`
- `networkIo.truckBench[0-23]`
- `networkIo.aboveTape[0-11]` (ports 13-24)

---

## PROD Digital Tab

**Purpose:** Production digital multiviewer configuration with advanced input mapping

**What You See:**
- Multiple multiviewer cards with layout selectors
- Input assignment grids matching selected layout
- Route trigger buttons (immediate or stage)
- Staged layouts panel (when in staged mode)

**Supported Layouts:**
- 4_SPLIT (4 inputs in 2×2 grid)
- 5_SPLIT (5 inputs: 3 top, 2 bottom)
- 6_SPLIT_L (6 inputs: large VIP left)
- 6_SPLIT_R (6 inputs: large VIP right)
- 9_SPLIT (9 inputs in 3×3 grid)
- 9_SPLIT_L (9 inputs: large VIP left)
- 9_SPLIT_R (9 inputs: large VIP right)

**What You Do:**
1. Select a **layout** for each multiviewer
2. Assign **sources** to input positions
3. Choose **Staged** or **Immediate** mode
4. Execute routes/layouts

**How It Connects:**
- Layout changes trigger Kaleido bridge
- Input routes trigger NV9000 bridge
- Sources come from RTR Master device list

**Data Saved:**
- `prodDigital.multiviewers[0-N]`
- Each MV: `{ id, cardId, side, layout, inputs[0-8] }`

---

## Monitor Wall Tabs (P2-P3, EVS, AUD, VIDEO)

**Purpose:** Control physical monitor walls with source assignment and routing

**What You See:**
- Visual representation of monitor wall layout
- Each monitor position shows:
  - Label (monitor name)
  - Current source or MV assignment
  - Layout selector (for MV assignments)
- Drag-and-drop source sections at bottom

**Drag-and-Drop Source Sections:**
- **SHOW SOURCES**: All 80 sources (toggle 1-40 / 41-80)
- **EVS SOURCES**: EVS inputs + super channels (EVS 1-As, 1-Bs, etc.)
- **TX / PGM / CG**: TX1-TX8 DA, PGM DA, CG 1-6, CANVAS 1-6
- **TEST SIGNALS**: BLACK, BARS, VALID
- **SWR OUTS**: PGM, PVW, CLN, AUX outputs

**What You Do:**
1. Drag a source chip onto a monitor position
2. Select MV layout if applicable
3. Route executes based on trigger mode
4. Or click monitor to open source picker

**How It Connects:**
- Direct source assignments route via NV9000
- MV assignments control Kaleido layouts
- All source names must match RTR Master

**Data Saved:**
- `monitorWallsV2['p2p3'].monitors[0-N]`
- `monitorWallsV2['evs'].monitors[0-N]`
- `monitorWallsV2['aud'].monitors[0-N]`
- `monitorWallsV2['video'].monitors[0-N]`

---

## EVS CONFIG Tab

**Purpose:** Configure EVS replay servers with channel assignments and network settings

**What You See:**
- 5 EVS server panels (collapsible)
- Each server shows 8 channels (6 inputs + 2 outputs typically)
- Network configuration section
- Wohler monitoring assignments

**Per Server:**
- Server ID, operator, serial number
- Module type (XT VIA, Xs VIA)
- Position and configuration

**Per Channel:**
- Channel number
- Show Name (editable)
- Engineering Name (editable)
- Output flag (checkbox)

**Network Settings:**
- PC LAN IP
- 10G IP
- XNET number

**How It Connects:**
- EVS channel show names appear in ENGINEER UMD lookups
- Channel names used for EVS positions in Tallyman sync

**Data Saved:**
- `evsConfig.servers[0-4]`
- Each server: `{ id, channels[0-7], network, wohler[0-7] }`

---

## MULTIVIEWER Tab

**Purpose:** Configure Kaleido multiviewer cards with input assignments

**What You See:**
- Collapsible cards for each multiviewer unit
- Card selector (1-22)
- Layout selector
- Input assignment fields matching layout

**What You Do:**
1. Select **Card** number (corresponds to physical Kaleido card)
2. Select **Layout** (determines number of inputs)
3. Assign **Sources** to each input position
4. Changes trigger immediately or stage based on mode

**How It Connects:**
- Layout changes send TSL 5.0 commands to Kaleido cards
- Input assignments route via NV9000

**Data Saved:**
- `prodDigital.multiviewers[0-N]` (shared with PROD Digital)

---

## ROUTER PANELS Tab

**Purpose:** Document router panel configurations and TD button assignments

**What You See:**
- **Router Panel Form (1-20)**: Panel definitions
- **TD Router Panel Buttons (1-20)**: Button assignments

**Panel Form Columns:**
- Panel Name
- Location (dropdown)
- Type
- Levels
- Notes

**TD Button Columns:**
- Button Label
- Source (dropdown)
- Destination
- Notes

**Data Saved:**
- `routerPanels.form[0-19]`
- `routerPanels.td[0-19]`

---

# INTEGRATION SYSTEMS

## NV9000 Router (via nv9000-client.js)

**What It Does:**
Controls the Evertz NV9000 video router to route sources to destinations.

**Bridge Server:**
- URL: `http://localhost:3003` (configurable)
- Must be running for routing to work

**Two Trigger Modes:**

1. **Immediate Mode**: Routes execute instantly when selected
2. **Staged Mode**: Routes are queued and executed together with "TAKE ALL"

**How Routing Works:**
1. User selects source and destination
2. System looks up device IDs from RTR Master
3. Route command sent to bridge server
4. Bridge communicates with NV9000 router
5. Video signal is physically routed

**Staged Routes Panel:**
- Shows count of pending routes
- "TAKE ALL" executes all at once
- Useful for complex show setups where you want to prepare everything before going live

---

## Kaleido Multiviewer (via kaleido.js)

**What It Does:**
Controls Grass Valley Kaleido multiviewer layouts via TSL 5.0 protocol.

**Bridge Server:**
- URL: `http://localhost:3001` (configurable)
- Sends UDP packets to Kaleido cards

**Card Configuration:**
- 22 cards supported
- IP addresses: 192.168.23.201-222
- Port: 8902 (TSL 5.0)

**Layout Index Mapping:**
```
4_SPLIT     → Index 4
5_SPLIT     → Index 5
6_SPLIT_L   → Index 6
6_SPLIT_R   → Index 7
9_SPLIT     → Index 9
9_SPLIT_L   → Index 10
9_SPLIT_R   → Index 11
5_SPLIT_FLIP → Index 15
6_SPLIT_L_UP → Index 16
6_SPLIT_R_UP → Index 17
```

**Two Trigger Modes:**

1. **Immediate Mode**: Layout changes apply instantly
2. **Staged Mode**: Layouts are queued and applied together

---

## Tallyman UMD (via tallyman-bridge.js)

**What It Does:**
Updates Under Monitor Display (UMD) text on Tallyman system.

**Bridge Server:**
- URL: `http://localhost:3002`
- Sends TSL 5.0 UDP packets to Tallyman

**166 UMD Positions:**
- CCU 01-12 (indices 1-12)
- FS 01-67 (indices 13-158, dispersed)
- EVS outputs/inputs (indices 33-56)
- Switcher outputs (indices 57-102)
- TX DA 1-8 (indices 159-166)
- CG 1-6, CANVAS 1-8 (indices 107-120)

**Sync Process:**
1. User clicks "Sync All UMDs" in ENGINEER tab
2. System builds UMD text for all 166 positions
3. POST request sent to bridge with all UMD data
4. Bridge sends TSL 5.0 packets to Tallyman
5. Monitor labels update

---

## Supabase Cloud (via supabase.js)

**What It Does:**
Provides cloud storage and real-time multi-user synchronization.

**Configuration:**
- Requires `SUPABASE_CONFIG` with URL and API key
- SDK loaded dynamically from CDN

**Database Table:**
```sql
CREATE TABLE shows (
  name TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT
);
```

**Features:**
1. **Auto-save**: Changes save to cloud automatically (500ms debounce)
2. **Real-time sync**: Multiple users see changes instantly
3. **Session filtering**: Your own changes don't trigger re-render
4. **URL sharing**: `?show=SHOWNAME` parameter loads specific show
5. **Cloud show browser**: List, load, and delete cloud shows

**Status Indicator:**
- "LIVE: Show Name" when connected
- "LOCAL" when offline (using localStorage only)

---

# DATA ARCHITECTURE

## State Management (store.js)

All application data lives in a single `Store.data` object. Changes trigger events that update the UI and save to storage.

### Core Store Methods

```javascript
Store.init()              // Load from localStorage
Store.set(path, value)    // Set value and trigger events
Store.get(path)           // Get value by path
Store.save()              // Save to localStorage
Store.on(event, callback) // Subscribe to events
Store.emit(event, data)   // Emit event (internal)
Store.loadShow(data)      // Load complete show data
Store.exportData()        // Get data for export
```

### Events

- `'change'` — Any data change (includes path and value)
- `'change:sources'` — Sources array changed
- `'change:show'` — Show info changed
- `'saved'` — Data saved to localStorage
- `'show-loaded'` — Show loaded from file or cloud

---

## Complete Data Structure

```javascript
Store.data = {
  // Show Information
  show: {
    name: "Sunday Night Football",
    format: "1080p/59.94"
  },

  // 80 Sources
  sources: [
    {
      number: 1,
      showName: "MAIN CAM 1",
      umdName: "CAM1",
      engSource: "CCU 01",
      audioSource: "CCU 01",
      remiName: "",
      active: true
    },
    // ... 79 more
  ],

  // TX/PGM/GFX Configuration
  txPgmGfx: {
    tx: [{ row: 1, showName: "", umdName: "", destination: "", notes: "" }, ...],
    pgm: [...],
    gfx: [...],
    canvas: [...]
  },

  // CCU and Frame Sync Settings
  ccuFsy: {
    ccu: [
      {
        unit: 1,
        device: "GV XCU",
        tac: "TAC-A",
        fibA: "1",
        fibB: "2",
        lensB: false,
        lensS: false,
        lensW: true,
        lensDolly: false,
        lensHand: false,
        notes: ""
      },
      // ... 11 more
    ],
    fsy: [
      {
        unit: 1,
        format: "1080p/59.94",
        tac: "TAC-C",
        fibA: "5",
        mult: "1",
        coax: "1",
        fixed: "",
        js: "",
        notes: ""
      },
      // ... 66 more
    ]
  },

  // Router Device Library
  rtrMaster: [
    {
      row: 1,
      deviceName: "CCU 01",
      deviceDesc: "Camera 1 CCU",
      videoLevel: "101",
      audio: ["1441", "1442", "1443", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    },
    // ... 287+ more devices
  ],
  rtrOutputs: [...],

  // Reference Data
  sheet8: {
    deviceTypes: ["Camera", "EVS", "VTR", "Graphics", ...],
    videoFormats: ["1080p/59.94", "1080i/59.94", "720p/59.94"],
    audioFormats: ["AES", "MADI", "Analog"],
    locations: ["Control Room", "Field", "Truck"],
    tacPanels: ["TAC-A", "TAC-B", "TAC-C", "TAC-D", "TAC-E", "TAC-F", "TAC-G", "TAC-H", "S09", "S10"],
    audioSources: [...]
  },

  // Video I/O Routing
  videoIo: {
    fiberRtrOut: [{ row: 1, source: "", destination: "", tac: "", fibA: "" }, ...],
    coaxRtrOut: [...],
    coaxIoTieLines: [...],
    coaxTruckTieLines: [...],
    jfsMux1: { tac: "", fibA: "", rows: [...] },
    jfsMux2: { tac: "", fibA: "", rows: [...] }
  },

  // Fiber TAC Panels
  fiberTac: {
    "TAC-A": [{ port: 1, source: "", dest: "", notes: "" }, ...],
    "TAC-B": [...],
    // ... all panels
  },

  // Switcher I/O
  swrIo: {
    inputs: [{ row: 1, source: "", sw: "" }, ...],   // 120 inputs
    outputs: [{ row: 1, defaultShow: "PGM A", show: "", umd: "" }, ...],  // 46 outputs
    tally: [...],   // 24 groups
    gpi: [...]      // 12 groups
  },

  // Network Patching
  networkIo: {
    io: [{ port: 1, device: "", notes: "" }, ...],
    truckBench: [...],
    aboveTape: [...]
  },

  // Coax Multiplexers
  coax: {
    mults: [{ unit: 1, outputs: [{}, {}, ...] }, ...]  // 8 units × 15 outputs
  },

  // Audio Multiplexers
  audioMult: {
    dtA: [{ port: 1, source: "", dest: "" }, ...],  // 12 ports
    dtB: [...],
    dtC: [...],
    dtD: [...],
    dtE: [...],
    dtF: [...]
  },

  // EVS Configuration
  evsConfig: {
    servers: [
      {
        id: "2101",
        channels: [
          { channel: 1, engName: "EVS1-Ain", showName: "", isOutput: false },
          // ... 7 more
        ],
        network: { pcLan: "10.5.21.11/16", tenG: "192.168.201.211/24", xnet: 1 }
      },
      // ... 4 more servers
    ]
  },

  // Production Digital Multiviewers
  prodDigital: {
    multiviewers: [
      { id: "1-1", cardId: 1, side: 1, layout: "9_SPLIT", inputs: ["", "", "", "", "", "", "", "", ""] },
      // ... more
    ]
  },

  // Monitor Walls
  monitorWallsV2: {
    p2p3: { monitors: [...] },
    evs: { monitors: [...] },
    aud: { monitors: [...] },
    video: { monitors: [...] }
  },

  // Router Panels
  routerPanels: {
    form: [...],
    td: [...]
  },

  // EIC QC Monitors
  eicQcMonitors: {
    "eic-qc-1": "",
    "eic-qc-2": ""
  }
}
```

---

# FILE STRUCTURE

```
mu21-showbook/
│
├── index.html                 # Main HTML page
├── config.js                  # Supabase configuration
├── SHOWBOOK-OVERVIEW.md       # This documentation
│
├── css/
│   └── styles.css             # All styling (dark theme, CSS variables)
│
├── js/
│   ├── app.js                 # Main app initialization, tab routing
│   ├── store.js               # State management (~25,000 lines)
│   ├── utils.js               # Shared UI components
│   ├── formulas.js            # Computed lookups
│   ├── export.js              # JSON/CSV export/import
│   │
│   ├── supabase.js            # Cloud sync client
│   ├── nv9000-client.js       # Router integration
│   ├── kaleido.js             # Multiviewer integration
│   ├── tallyman-bridge.js     # UMD integration
│   │
│   └── tabs/                  # Tab modules
│       ├── home.js            # HOME tab
│       ├── source.js          # SOURCE tab
│       ├── txpgmgfx.js        # TX/PGM/GFX tab
│       ├── ccufsy.js          # CCU/FSY tab
│       ├── rtrmaster.js       # RTR I/O MASTER tab
│       ├── sheet8.js          # SHEET8 tab
│       ├── engineer.js        # ENGINEER tab
│       ├── swrio.js           # SWR I/O tab
│       ├── videoio.js         # VIDEO I/O tab
│       ├── fibertac.js        # FIBER TAC tab
│       ├── coax.js            # COAX tab
│       ├── audiomult.js       # AUDIO MULT tab
│       ├── networkio.js       # NETWORK I/O tab
│       ├── monitors.js        # Monitor walls (P2-P3, EVS, AUD, VIDEO)
│       ├── proddigital.js     # PROD Digital tab
│       ├── evsconfig.js       # EVS CONFIG tab
│       ├── multiviewer.js     # MULTIVIEWER tab
│       └── routerpanel.js     # ROUTER PANELS tab
│
├── kaleido-bridge/            # Node.js Kaleido server
│   └── index.js
│
├── nv9000-bridge/             # Node.js NV9000 server
├── tallyman-bridge/           # Node.js Tallyman server
├── showbook-server/           # Web server
│
└── start-all-servers.bat      # Launch all bridges
```

---

# BUILDING FROM SCRATCH

If you need to rebuild this application from scratch, follow this order:

## Phase 1: Core Infrastructure

1. **Create index.html** with header, sidebar, and content area
2. **Create css/styles.css** with CSS variables for theming
3. **Create js/store.js** with:
   - Data structure initialization
   - localStorage persistence
   - Event system (on/emit)
   - set/get methods

## Phase 2: Utilities

4. **Create js/utils.js** with:
   - tabPage() container
   - sectionHeader() divider
   - toast() notifications
   - createDarkDropdown() component
   - Device/source option generators
   - Fiber TAC sync functions
   - Coax MULT sync functions

5. **Create js/formulas.js** with:
   - rtrMasterLookup()
   - equipmentSummary()
   - getUmdForSource()

## Phase 3: Tab Modules

Build tabs in this order (dependencies flow downward):

6. **home.js** — Basic landing page
7. **sheet8.js** — Reference data (needed by dropdowns)
8. **rtrmaster.js** — Device library (needed by all tabs)
9. **source.js** — 80 sources (references rtrmaster)
10. **ccufsy.js** — CCU/FSY with sync to fiber/coax
11. **txpgmgfx.js** — TX/PGM/GFX
12. **fibertac.js** — Fiber panels (syncs with ccufsy)
13. **coax.js** — Coax panels (syncs with ccufsy)
14. **audiomult.js** — Audio panels
15. **networkio.js** — Network patches
16. **videoio.js** — Router outputs and tie lines
17. **swrio.js** — Switcher I/O
18. **evsconfig.js** — EVS servers
19. **engineer.js** — UMD management (references many tabs)
20. **multiviewer.js** — MV configuration
21. **proddigital.js** — Production wall
22. **monitors.js** — Other monitor walls
23. **routerpanel.js** — Router panels

## Phase 4: App Shell

24. **Create js/app.js** with:
    - Tab routing registry
    - Navigation handlers
    - Header management
    - Staging system

## Phase 5: Integrations

25. **Create js/nv9000-client.js** for router control
26. **Create js/kaleido.js** for multiviewer control
27. **Create js/tallyman-bridge.js** for UMD sync
28. **Create js/supabase.js** for cloud sync
29. **Create js/export.js** for JSON/CSV

## Phase 6: Bridge Servers

30. **Create kaleido-bridge/index.js** — Express server with TSL 5.0
31. **Create nv9000-bridge/** — NV9000 protocol bridge
32. **Create tallyman-bridge/** — Tallyman TSL bridge
33. **Create start-all-servers.bat**

## Key Architecture Decisions

- **Vanilla JavaScript**: No frameworks for simplicity and performance
- **Single Store**: All data in one reactive object
- **Event-driven**: Changes propagate via events
- **Bidirectional sync**: Related pages stay in sync automatically
- **Bridge pattern**: HTTP servers translate to hardware protocols
- **Staged execution**: Queue changes and execute together

---

# APPENDIX: CSS Variables

```css
:root {
  --bg-primary: #12141a;
  --bg-secondary: #1c1f26;
  --bg-tertiary: #252932;
  --border: #2d333d;
  --text-primary: #eaeef3;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --accent-blue: #5b9aff;
  --accent-green: #34d399;
  --accent-red: #f87171;
  --accent-orange: #fbbf24;
  --accent-yellow: #fde047;
  --accent-purple: #a78bfa;
  --accent-cyan: #22d3ee;
  --header-height: 52px;
  --sidebar-width: 155px;
}
```

---

*Document Version: March 2026*
*Total Lines of Code: ~40,000+*
*Total Tab Modules: 18*
