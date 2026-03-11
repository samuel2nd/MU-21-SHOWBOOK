# MU-21 SHOWBOOK - Technical Overview

Single-page web application for broadcast engineering show configuration. Tab-based interface for managing video sources, routing, multiviewer layouts, and equipment assignments.

---

## File Structure

### HTML Entry Point
- **index.html** (114 lines) - Main page with sidebar navigation defining 20 tabs in 6 categories:
  - Home
  - Input: SOURCE, TX/PGM/GFX, CCU/FSY INPUT
  - Output/Computed: ENGINEER, SWR I/O
  - Physical I/O: VIDEO I/O, FIBER TAC, COAX MULTS, AUDIO MULT, NETWORK I/O
  - Monitor Walls: PROD Digital, PROD Print, P2-P3, EVS, AUD, VIDEO
  - Config: EVS CONFIG, MULTIVIEWER, ROUTER PANELS
  - Lookup: RTR I/O MASTER, Sheet8

### Core JavaScript (11 files)

| File | Lines | Purpose |
|------|-------|---------|
| js/app.js | 440 | Tab routing, header management, `stageAllFromShowData()`, `showStagingPrompt()` |
| js/store.js | 1430+ | Central data store, `defaultRtrMaster()`, `defaultRtrOutputs()`, `defaultEvsConfig()`, `emptyShow()` |
| js/utils.js | 775 | Dark dropdowns, table rendering, `syncToFiberTac()`, `syncToCoaxMult()` |
| js/formulas.js | 221 | INDEX/MATCH lookups, `rtrMasterLookup()`, `equipmentSummary()`, `getTxRoutingInfo()` |
| js/export.js | 301 | JSON/CSV export/import with validation, `sanitizeStrings()` |
| js/supabase.js | 400 | Real-time cloud sync, session-based filtering, triggers RouteQueue on remote updates |
| js/route-queue.js | 250 | Route queue system - remote devices queue routes, engineering computer executes |
| js/kaleido.js | 325 | Multiviewer layout control, uses RouteQueue when bridges not reachable |
| js/nv9000-client.js | 420 | Router control, uses RouteQueue when bridges not reachable |
| js/tallyman-bridge.js | 290 | Tallyman UMD sync via TSL 5.0 UDP |

### Tab JavaScript (18 files)

| File | Lines | Tab Name | Key Features |
|------|-------|----------|--------------|
| js/tabs/home.js | 135 | HOME | Show info, equipment summary, quick navigation grid |
| js/tabs/source.js | 576 | SOURCE | 80 sources split 1-40/41-80, quick fill controls, syncs to RTR Master |
| js/tabs/txpgmgfx.js | 401 | TX/PGM/GFX | TX 1-8, CG 1-6, Canvas 1-8, Program outputs, FS 01-67 dropdown |
| js/tabs/ccufsy.js | 324 | CCU/FSY INPUT | CCU 1-12, FS 1-67, syncs to FIBER TAC and COAX MULTS |
| js/tabs/engineer.js | 1126 | ENGINEER | UMD groups (CCU/FS, EVS/CG, Switcher Outs, Spare De-Embed, TX DAs), NV9000 controls |
| js/tabs/swrio.js | 273 | SWR I/O | Switcher Inputs 1-120 (3 columns), Outputs 1-46, Tally Group 1-24, GPI 1-12 |
| js/tabs/videoio.js | 559 | VIDEO I/O | Fiber RTR Out 1-16, Coax RTR Out 1-16, I/O Tie Lines 1-48, Truck Tie Lines 1-48, JFS MUX 1 (12), JFS MUX 2 (6) |
| js/tabs/fibertac.js | 615 | FIBER TAC | Visual patch panels (TAC-A through TAC-H, S09, S10), 24 ports each, click-to-assign modal |
| js/tabs/coax.js | 375 | COAX MULTS | 8 mult units, 15 outputs each (5x3 grid), click-to-assign modal |
| js/tabs/audiomult.js | 180 | AUDIO MULT | DT-12 panels A-F, 12 channels each (6x2 grid) |
| js/tabs/networkio.js | 188 | NETWORK I/O | I/O (24 ports), Truck Bench (24 ports), Above Tape (ports 13-24) |
| js/tabs/proddigital.js | 1500+ | PROD Digital | PXM 1-8, 10-12 monitor wall with MV assignments, layouts, drag-drop |
| js/tabs/monitors.js | 1234 | P2-P3, EVS, AUD, VIDEO | 4 monitor wall pages with drag-drop sources, layouts |
| js/tabs/evsconfig.js | 531 | EVS CONFIG | 4 EVS servers (2101, 2102, 2103, 2105), XFILE gateway, Wohler config, Show Sources reference |
| js/tabs/multiviewer.js | 887 | MULTIVIEWER | 22 Kaleido cards configuration, staged layout changes panel |
| js/tabs/routerpanel.js | 34 | ROUTER PANELS | Panel Form 1-20, TD Panel Buttons 1-20 |
| js/tabs/rtrmaster.js | 276 | RTR I/O MASTER | Device library with video + 16 audio levels, sub-tabs for Inputs/Outputs |
| js/tabs/sheet8.js | 46 | Sheet8 | Reference data editor: Device Types, Video/Audio Formats, Locations, TAC Panels, Audio Sources |

---

## Router Device Library (RTR I/O Master)

### Router Inputs (from `defaultRtrMaster()` in store.js)

**Standard Device IDs 1-288:**
- CCU 01-12 (IDs 1-12)
- FS 01-62 (IDs 13-74)
- Additional devices through ID 288

**Extended SHOW Source IDs:**
- SHOW 01-20: IDs 865-884
- SHOW 21-40: IDs 1171-1190
- SHOW 41-60: IDs 1202-1221
- SHOW 61-80: IDs 1222-1241

### Router Outputs (from `defaultRtrOutputs()` in store.js)
- Destination IDs starting at 289
- Output devices through 637+

---

## EVS Server Configuration

4 EVS servers defined in `getDefaultEvsConfig()` (evsconfig.js):

| Server | S/N | Model | Position | Config | XNET |
|--------|-----|-------|----------|--------|------|
| 2101 | 310160 | XT VIA | REVS 1 | 6X2 | 1 |
| 2102 | 310170 | XT VIA | FEVS 2 | 6X2 | 2 |
| 2103 | 310140 | XT VIA | FEVS 1 | 6X2 | 3 |
| 2105 | 310110 | Xs VIA | TD | 0X4 | 20 |

### EVS Channel Names (per 6X2 server)
Each server has 8 channels defined in `channelDefaults`:
- Channels 1-6: Inputs (e.g., `EVS1-Ain`, `EVS1-Bin`, `EVS1-Cin`, `EVS1-Din`, `EVS1-Ein`, `EVS1-Fin`)
- Channels 7-8: Outputs/Super channels (e.g., `EVS 1-As`, `EVS 1-Bs`)

### EVS Super Channels (RTR Master names with 's' suffix)
```
EVS 1-As, EVS 1-Bs
EVS 2-As, EVS 2-Bs
EVS 3-As, EVS 3-Bs
```

### XFILE Gateway
- Name: XFILE 1
- PC LAN: 10.5.21.10/16
- 10G: 192.168.201.230/24
- INET: DHCP

---

## Multiviewer Layouts

Defined in proddigital.js and multiviewer.js `LAYOUTS` object:

| Layout | Name | Positions | Description |
|--------|------|-----------|-------------|
| 9_SPLIT | 9 SPLIT | 9 | 3x3 equal grid |
| 9_SPLIT_R | 9 SPLIT R | 9 | 6 small top, VIP large right (p9) |
| 9_SPLIT_L | 9 SPLIT L | 9 | 6 small top, VIP large left (p9) |
| 6_SPLIT_R | 6 SPLIT R | 6 | 3 top, 2 stacked left, VIP right (p5) |
| 6_SPLIT_L | 6 SPLIT L | 6 | 3 top, VIP left (p4), 2 stacked right |
| 6_SPLIT_R_UP | 6 SPLIT R UP | 6 | VIP upper right (p2) |
| 6_SPLIT_L_UP | 6 SPLIT L UP | 6 | VIP upper left (p1) |
| 5_SPLIT | 5 SPLIT | 5 | 3 small top, 2 VIP bottom (p4, p5) |
| 5_SPLIT_FLIP | 5 SPLIT FLIP | 5 | 2 VIP top (p1, p2), 3 small bottom |
| 4_SPLIT | 4 SPLIT | 4 | 2x2 equal grid |
| FULL_SCREEN | FULL SCREEN | 1 | Single full-size VIP |

---

## Monitor Walls

### PROD Digital (PXM Configuration from proddigital.js)
`PXM_CONFIG` defines physical monitor positions:
- PXM 1-8: Large monitors (defaultMv: 1-1 through 8-1)
- PXM 10: Small monitor (defaultMv: 5-2)
- PXM 11: Small monitor (defaultMv: 9-1)
- PXM 12: Small monitor (defaultMv: 9-2)

MV Card Count: 22 cards (each with 2 sides, sharing 9 inputs)

### Other Walls (from monitors.js)
4 wall configurations in `Store.data.monitorWallsV2`:
- p2p3: P2-P3 wall
- evs: EVS wall
- aud: AUD wall
- video: VIDEO wall

### Drag-Drop Source Sections (from monitors.js)
Source categories available for drag-drop:
- SHOW: Show sources from SOURCE page
- EVS: EVS super channels (`EVS 1-As`, `EVS 1-Bs`, `EVS 2-As`, `EVS 2-Bs`, `EVS 3-As`, `EVS 3-Bs`)
- TX/PGM/CG: Transmission and graphics
- Test Signals: Test patterns
- SWR Outs: Switcher outputs

---

## VIDEO I/O Tab Structure

From videoio.js:

| Section | Rows | RTR I/O Master Output | Purpose |
|---------|------|----------------------|---------|
| Fiber RTR Outputs | 16 | IO FIB01-16 | Router fiber outputs |
| Coax RTR Outputs | 16 | IO BNC 1-16 | Router coax outputs |
| Coax I/O Tie Lines | 48 | — | Internal coax tie lines |
| Coax Truck Tie Lines | 48 | — | Truck coax tie lines |
| JFS MUX 1 | 12 | MUX 1-1 through 1-12 | JFS multiplexer 1 |
| JFS MUX 2 | 6 | MUX 2-1 through 2-6 | JFS multiplexer 2 |

### VIDEO I/O Routing

When a source is selected for Fiber RTR Out, Coax RTR Out, or JFS MUX rows, the routing is executed automatically using computed RTR I/O Master output names:

```javascript
// getRtrOutputName(section, rowNum)
fiberRtrOut row 1  → IO FIB01
fiberRtrOut row 16 → IO FIB16
coaxRtrOut row 1   → IO BNC 1
coaxRtrOut row 16  → IO BNC 16

// getMuxRtrOutputName(storePath, rowNum)
jfsMux1 row 1  → MUX 1-1
jfsMux1 row 12 → MUX 1-12
jfsMux2 row 1  → MUX 2-1
jfsMux2 row 6  → MUX 2-6
```

### Truck Tie Line Positions
From `TRUCK_TIE_POSITIONS` in videoio.js:
```
P1-1 through P1-8
P2-1 through P2-8
P3-1 through P3-8
FEVS-1 through FEVS-12
REVS-1 through REVS-12
```

---

## Tallyman UMD Position Mapping

From tallyman-bridge.js `POSITION_INDEX_MAP` (166 positions total):

| Position Range | Index Range |
|----------------|-------------|
| CCU 01-12 | 1-12 |
| FS 01-20 | 13-32 |
| EVS 1-1 OUT, EVS 1-2 OUT | 33-34 |
| EVS 1-1 IN through EVS 1-6 IN | 35-40 |
| EVS 2-1 OUT, EVS 2-2 OUT | 41-42 |
| EVS 2-1 IN through EVS 2-6 IN | 43-48 |
| EVS 3-1 OUT, EVS 3-2 OUT | 49-50 |
| EVS 3-1 IN through EVS 3-6 IN | 51-56 |
| PGM A, CLEAN, PRESET, SWPVW | 57-60 |
| ME1 PVW, ME1 A-D | 61-65 |
| ME2 PVW, ME2 A-D | 66-70 |
| ME3 PVW, ME3 A-D | 71-75 |
| ME4 PVW, ME4 A-D | 76-80 |
| AUX 1-12 | 81-92 |
| IS 1-10 | 93-102 |
| FS 21-24 | 103-106 |
| CG 1-6 | 107-112 |
| CANVAS 1-8 | 113-120 |
| FS 25-28 | 121-124 |
| FS 29-44 | 125-140 |
| FS 45-62 | 141-158 |
| TX1 DA through TX8 DA | 159-166 |

---

## External Bridge Servers

Site hosted on Netlify (mu-21showbook.netlify.app). Bridge servers run on engineering computer.

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Kaleido Bridge | 3001 | HTTP | Multiviewer layouts |
| Tallyman Bridge | 3002 | HTTP→TSL 5.0 UDP (port 8901) | UMD text sync |
| NV9000 Bridge | 3003 | HTTP | Router control |

**Architecture:**
- All devices access showbook via Netlify
- Engineering computer runs bridge servers on localhost
- Engineering computer browser connects to `localhost:3001/3002/3003`
- Remote devices (iPad) cannot reach bridges directly — use RouteQueue instead

### Route Queue System (route-queue.js)

Remote devices (iPads, laptops) cannot directly access bridges on the engineering computer. The RouteQueue system solves this:

**Architecture:**
1. Any device adds routes to `Store.data.routeQueue` (synced via Supabase)
2. Engineering computer detects it can reach bridges (localhost check)
3. When queue changes sync to engineering computer, it processes and clears the queue

**Queue Structure:**
```javascript
{
  nv9000: [{ source, destination, sourceId, destId, timestamp }],
  kaleido: [{ cardId, ip, port, index, layoutName, timestamp }],
  tallyman: [{ position, text, timestamp }]
}
```

**API:**
```javascript
RouteQueue.queueRoute(sourceName, destName)  // Queue NV9000 route
RouteQueue.queueLayout(cardId, layoutName)   // Queue Kaleido layout
RouteQueue.queueUmd(position, text)          // Queue Tallyman UMD
RouteQueue.processQueue()                     // Execute queued items (eng computer only)
RouteQueue.getStatus()                        // Check queue status
RouteQueue.bridgesReachable                   // true on engineering computer
```

**Flow:**
- iPad changes monitor assignment → triggers `NV9000Client.handleRoute()`
- handleRoute detects `!RouteQueue.bridgesReachable` → calls `RouteQueue.queueRoute()`
- Queue saved to Store → syncs via Supabase to engineering computer
- Engineering computer's `handleRemoteChange()` calls `RouteQueue.processQueue()`
- Routes execute via localhost bridges → queue cleared → syncs back

---

## Data Storage

### Local Storage
- Show data persisted via `Store.save()` to localStorage
- Bridge URLs stored per-computer in localStorage (not synced)

### Cloud Sync (Supabase)
- Real-time sync via PostgreSQL changes subscription
- Session ID filtering to prevent own-update echoes
- URL-based show loading: `?show=SHOWNAME`
- Debounced save (500ms) via `debouncedSave()`
- Required table schema:
  ```sql
  CREATE TABLE shows (
    name TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT
  );
  ```

---

## Routing Modes

Two modes supported (configured per bridge):
1. **Staged** - Changes queued, executed on trigger
2. **Immediate** - Changes executed instantly

Staging functions in app.js:
- `stageAllFromShowData()` - Stage all routes and MV layouts from show data
- `showStagingPrompt()` - Prompt engineer after cloud load

---

## Key Data Structures (from store.js emptyShow())

```javascript
{
  show: { name, format },
  sources: [80 entries with number, showName, umdName, engSource, audioSource],
  rtrMaster: [device library with row, deviceName, deviceDesc, videoLevel, audio[16]],
  rtrOutputs: [output device library],
  txPgmGfx: { tx: [8], cg: [6], canvas: [8], pgm: [...] },
  ccuFsy: { ccu: [12], fsy: [67] },
  swrIo: { inputs: [120], outputs: [46], tally: [24], gpi: [12] },
  videoIo: {
    fiberRtrOut: [16],
    coaxRtrOut: [16],
    coaxIoTieLines: [48],
    coaxTruckTieLines: [48],
    jfsMux1: {rows: [12]},
    jfsMux2: {rows: [6]}
  },
  fiberTac: { 'TAC-A': [24 ports], 'TAC-B': [24], ..., 'S10': [24] },
  coax: { multUnits: [8 units with 15 outputs each] },
  audioMult: { dtA: [12], dtB: [12], dtC: [12], dtD: [12], dtE: [12], dtF: [12] },
  networkIo: { io: [24], truckBench: [24], aboveTape: [12] },
  monitorWalls: { ... },
  monitorWallsV2: { p2p3, evs, aud, video },
  prodDigital: { pxms: [...], multiviewers: [...] },
  evsConfig: { servers: [4], xfile, showSources: [5 columns] },
  kaleidoConfig: { bridgeUrl, triggerMode, cards: [22], stagedLayouts },
  routerPanels: { form: [20], td: [20] },
  sheet8: { deviceTypes, videoFormats, audioFormats, locations, tacPanels, audioSources }
}
```

---

## CCU/FSY Tab Details

From ccufsy.js:

### CCU Section (12 units)
Columns: #, Device, TAC, FIB-A, FIB-B, Show Name (computed), Lens checkboxes (B, S, W, DOLLY, HAND), Notes

### FSY Section (67 units)
Columns: #, Format, TAC, FIB-A, Show Name (computed), Source (computed), MULT, COAX, Fixed, JS, Notes

### Bidirectional Sync
- TAC/FIB assignments sync to FIBER TAC page via `Utils.syncToFiberTac()`
- MULT assignments sync to COAX MULTS page via `Utils.syncToCoaxMult()`

---

## TX/PGM/GFX Tab Details

From txpgmgfx.js:

### Transmission Section (TX 1-8)
Columns: TX, DA INPUT, UMD NAME, ENG SOURCE, AUDIO SRC, FRAMESYNC (dropdown FS 01-67), OUTPUT, I/O COAX 1-4 (checkboxes), I/O RTR OUT (computed)

### Graphics Section
- CG 1-6: DA INPUT, UMD, ENG SRC, KEY IN
- CANVAS 1-8: RTR IN, UMD, ENG SRC

### Program Section
- DA INPUT, UMD, ENG SRC, AUDIO SRC

---

## SWR I/O Tab Details

From swrio.js:

### Switcher Inputs (120)
Displayed in 3 columns (1-48, 49-96, 97-120)
Show Source computed from SOURCE page via `lookupShowName(engSource)`

### Switcher Outputs (46)
Default positions include: PGM A, CLEAN, PRESET, SWPVW, ME buses, AUX 1-12, IS 1-10

### Tally Group (24)
### GPI Group (12)

---

## Sheet8 Reference Data

From sheet8.js - 6 editable lists (one item per line):
1. Device Types
2. Video Formats
3. Audio Formats
4. Locations
5. TAC Panels (default: TAC-A through TAC-H, S09, S10)
6. Audio Sources

---

## Kaleido Configuration (from multiviewer.js)

Default configuration in `ensureKaleidoConfig()`:
- Bridge URL: http://localhost:3001
- Trigger Mode: staged
- 22 cards with IPs: 192.168.23.201-222
- Port: 8902

---

## File Count Summary

- **HTML**: 1 file (index.html)
- **Core JS**: 11 files in js/
- **Tab JS**: 18 files in js/tabs/
- **Total JS**: 29 files in js/ directory

---

## Source RTR ID Mapping (from source.js and rtrmaster.js)

```javascript
// getShowRtrId() function
SHOW 01-20: RTR IDs 865-884   (864 + showNum)
SHOW 21-40: RTR IDs 1171-1190 (1150 + showNum)
SHOW 41-60: RTR IDs 1202-1221 (1161 + showNum)
SHOW 61-80: RTR IDs 1222-1241 (1161 + showNum)
```

SHOW device names in rtrMaster sync bidirectionally with SOURCE page showName.
