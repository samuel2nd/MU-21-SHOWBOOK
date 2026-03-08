# MU-21 SHOWBOOK - Complete Application Reference

> **Version:** March 2026
> **Platform:** MU-21 Mobile Production Unit
> **Stack:** Vanilla JavaScript, CSS3, Supabase, Node.js Bridges

---

# PART 1: USER OVERVIEW

## What is the MU-21 Showbook?

The MU-21 Showbook is a web-based broadcast engineering application for managing live production equipment, signal routing, and monitor wall configurations. It serves as the central hub for technical directors, video engineers, and broadcast crews to document and control all aspects of a mobile production unit.

---

## Quick Start

1. **Open the application** in a modern browser (Chrome, Firefox, Edge)
2. **Enter show info** on the HOME tab (show name, format)
3. **Configure sources** on the SOURCE tab (80 sources available)
4. **Assign equipment** on CCU/FSY and TX/PGM/GFX tabs
5. **Set up routing** on VIDEO I/O and monitor wall tabs
6. **Export data** via header buttons (JSON, CSV, NV9000)

---

## Navigation Structure

### Tab Categories

| Category | Color | Tabs | Purpose |
|----------|-------|------|---------|
| **HOME** | Blue | Dashboard | Show info, equipment summary, quick navigation |
| **INPUT** | Green | SOURCE, TX/PGM/GFX, CCU/FSY | Define sources and input equipment |
| **LOOKUP** | Orange | RTR I/O MASTER, SHEET8 | Reference tables and device library |
| **OUTPUT** | Purple | ENGINEER, SWR I/O | UMD management, switcher routing |
| **PHYSICAL** | Cyan | VIDEO I/O, FIBER TAC, COAX, AUDIO, NETWORK | Physical patch panels |
| **MONITOR** | Red | PROD, P2-P3, EVS, AUD, VIDEO | Monitor wall control |
| **CONFIG** | Yellow | EVS CONFIG, MULTIVIEWER, ROUTER PANELS | System configuration |

---

## Core Features by Tab

### HOME Tab
- Show name and format selection
- Equipment usage summary (active sources, devices in use)
- Quick navigation grid to all tabs
- Real-time connection status

### SOURCE Tab (80 Sources)
- **Show Name:** Display name for the source (e.g., "MAIN CAM 1")
- **UMD Name:** Under Monitor Display text
- **Eng Source:** Engineering device (CCU 01, FS 01, EVS 1-A, etc.)
- **Audio Source:** Audio channel assignment
- **Autofill Wizard:** Bulk fill with prefix, start number, increment mode

### TX/PGM/GFX Tab
- **TX 1-8:** Transmission DA inputs with routing
- **CG 1-6:** Character generator sources
- **CANVAS 1-8:** Canvas channel assignments
- **PGM 1-4:** Program output configurations

### CCU/FSY INPUT Tab
- **CCU 1-12:** Camera control units with TAC panel and fiber assignments
- **FSY 1-67:** Frame synchronizers with format, multiplier, and routing
- Lens control options (B-head, S-head, W-head, Dolly, Handheld)

### RTR I/O MASTER Tab
- Device library with 288+ entries
- Video level assignment per device
- 16 audio channel mappings per device
- Sub-tabs: ROUTER INPUTS / ROUTER OUTPUTS
- Used for INDEX/MATCH lookups across the application

### ENGINEER Tab
- Tallyman UMD text management
- 6 device position groups (CCU, FS, EVS, SWR, TX, CG)
- Push UMD text to Tallyman system
- SWR output integration

### SWR I/O Tab
- 64 switcher inputs
- 46 switcher outputs with show assignment
- 24 tally groups
- 12 GPI groups

### VIDEO I/O Tab
- **Fiber RTR Output (1-16):** Source, destination, TAC panel, fiber strand
- **Coax RTR Output (1-16):** Source, destination, multiplier, coax port
- **Coax I/O Tie Lines (48):** Position-based tie line routing
- **Coax Truck Tie Lines (48):** Truck tie line routing
- **JFS MUX 1 & 2:** JFS multiplexer configurations

### FIBER TAC Tab
- 10 TAC panels (TAC-A through TAC-H, S09, S10)
- 24 ports per panel (240 total fiber ports)
- Visual grid interface for click-to-assign
- Auto-sync from VIDEO I/O assignments

### COAX Tab
- 8 multiplexer units (15 outputs each)
- Visual grid layout matching physical hardware
- MUX routing configuration

### AUDIO MULT Tab
- Legacy DT panels (DT1-DT6, 24 channels each)
- New DT-12 panels (A-F, 12 channels each)
- Source and destination assignment

### NETWORK I/O Tab
- I/O area patching (24 ports)
- Truck bench patching (24 ports)
- Above-tape area patching (12 ports)
- IP address validation and duplicate detection

### Monitor Wall Tabs (PROD, P2-P3, EVS, AUD, VIDEO)
- Visual monitor wall representation
- Drag-and-drop source assignment
- Multiviewer layout selection (4-SPLIT, 6-SPLIT, 9-SPLIT variants)
- Kaleido integration for live layout changes
- Staged or immediate trigger modes

### EVS CONFIG Tab
- 4 EVS server definitions (XT VIA, Xs VIA)
- 6-8 channels per server
- Network configuration (PC LAN, 10G, XNET)
- Wohler monitoring setup
- XFILE gateway configuration

### MULTIVIEWER Tab
- 25 multiviewer heads
- 16 windows per head
- Source and label assignment per window

---

## Drag-and-Drop Sources (Monitor Walls)

### Available Source Categories

| Section | Sources | Color |
|---------|---------|-------|
| **SHOW SOURCES** | All 80 sources (toggle 1-40 / 41-80) | Blue |
| **EVS SOURCES** | EVS inputs (Ain-Fin) + super channels (As, Bs) | Purple |
| **TX / PGM / CG** | TX1-TX8 DA, PGM DA, CG 1-6, CANVAS 1-6 | Orange/Purple |
| **TEST SIGNALS** | BLACK, BARS, VALID | Teal |
| **SWR OUTS** | PGM, PVW, CLN, AUX1-3 | Green |

---

## Data Management

### Save/Load
- **Auto-save:** All changes saved to localStorage automatically
- **Cloud Sync:** Optional Supabase integration for multi-user collaboration
- **URL Sharing:** Share shows via `?show=SHOWNAME` parameter

### Export Options
- **JSON Export:** Complete show backup (timestamped filename)
- **JSON Import:** Restore shows with validation
- **CSV Export:** Per-tab data export
- **NV9000 Export:** Router configuration files

### Cloud Features (Supabase)
- Real-time multi-user editing
- Show browser for saved cloud shows
- Automatic conflict resolution via session IDs
- Offline fallback to localStorage

---

## Routing & Integration

### NV9000 Router
- **Immediate Mode:** Routes apply instantly when source selected
- **Staged Mode:** Queue routes, trigger all at once
- Routes automatically staged from VIDEO I/O tab assignments

### Kaleido Multiviewer
- Layout changes sent via TSL 5.0 protocol
- Supports 22 Kaleido cards (192.168.23.201-222)
- Batch triggering for simultaneous layout changes
- Staged or immediate trigger modes per page

### Tallyman UMD
- 166 UMD positions mapped
- Push text from ENGINEER tab
- TSL 5.0 UDP protocol via bridge

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save (redundant - auto-saves) |
| `Ctrl+E` | Export JSON |
| `Ctrl+I` | Import JSON |
| `Escape` | Close popups/modals |

---

# PART 2: BUILD OVERVIEW (Developer Reference)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    index.html                         │    │
│  │  ┌───────────┐ ┌──────────────┐ ┌──────────────┐    │    │
│  │  │  Header   │ │   Sidebar    │ │  Tab Content │    │    │
│  │  └───────────┘ └──────────────┘ └──────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │                     JavaScript                          │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐   │  │
│  │  │  Store  │ │  Utils  │ │ Formulas │ │   Export  │   │  │
│  │  └────┬────┘ └─────────┘ └──────────┘ └───────────┘   │  │
│  │       │                                                 │  │
│  │  ┌────┴────────────────────────────────────────────┐   │  │
│  │  │              Tab Modules (18 files)              │   │  │
│  │  │  home, source, txpgmgfx, ccufsy, rtrmaster...   │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │       │                                                 │  │
│  │  ┌────┴────────────────────────────────────────────┐   │  │
│  │  │            Integration Clients                    │   │  │
│  │  │  NV9000Client │ KaleidoClient │ SupabaseSync    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
   ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Kaleido Bridge  │ │ NV9000 Bridge │ │ Tallyman Bridge│
   │   :3001         │ │    :3003      │ │    :3002       │
   └────────┬────────┘ └───────┬───────┘ └───────┬────────┘
            │                  │                  │
            ▼                  ▼                  ▼
   ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Kaleido Cards   │ │ NV9000 Router │ │ Tallyman UMD  │
   │ (TSL 5.0 UDP)   │ │   (TCP)       │ │ (TSL 5.0 UDP) │
   └─────────────────┘ └───────────────┘ └───────────────┘
```

---

## File Structure

```
mu21-showbook/
├── index.html                 # Main HTML (header, sidebar, content area)
├── config.js                  # Supabase & Kaleido configuration
├── SHOWBOOK-OVERVIEW.md       # This documentation
│
├── css/
│   └── styles.css             # Dark theme, CSS variables, responsive layout
│
├── js/
│   ├── app.js                 # Main app: init, tab routing, header, staging
│   ├── store.js               # Reactive state management (25k+ lines)
│   ├── utils.js               # Shared UI components & helpers
│   ├── formulas.js            # Computed fields & lookups
│   ├── export.js              # JSON/CSV import/export
│   │
│   ├── supabase.js            # Cloud sync & real-time collaboration
│   ├── nv9000-client.js       # NV9000 router integration
│   ├── kaleido.js             # Kaleido multiviewer control
│   ├── tallyman-bridge.js     # Tallyman UMD integration
│   │
│   └── tabs/                  # Tab modules (18 files)
│       ├── home.js            # Dashboard (134 lines)
│       ├── source.js          # 80 sources (575 lines)
│       ├── txpgmgfx.js        # TX/PGM/GFX (400 lines)
│       ├── ccufsy.js          # CCU/FSY inputs (323 lines)
│       ├── rtrmaster.js       # RTR I/O Master (275 lines)
│       ├── sheet8.js          # Reference data (45 lines)
│       ├── engineer.js        # Tallyman UMD (1,125 lines)
│       ├── swrio.js           # Switcher I/O (272 lines)
│       ├── videoio.js         # Video I/O (558 lines)
│       ├── fibertac.js        # Fiber TAC panels (614 lines)
│       ├── coax.js            # Coax multiplexers (374 lines)
│       ├── audiomult.js       # Audio multiplexers (179 lines)
│       ├── networkio.js       # Network patching (187 lines)
│       ├── monitors.js        # Monitor walls (1,233 lines)
│       ├── proddigital.js     # PROD Digital wall (2,441 lines)
│       ├── evsconfig.js       # EVS configuration (530 lines)
│       ├── multiviewer.js     # 25 MV heads (886 lines)
│       └── routerpanel.js     # Router panels (33 lines)
│
├── kaleido-bridge/            # Node.js Kaleido bridge server
│   └── index.js               # Express server, TSL 5.0 UDP
│
├── nv9000-bridge/             # Node.js NV9000 bridge server
├── tallyman-bridge/           # Node.js Tallyman bridge server
├── showbook-server/           # Support server
│
└── start-all-servers.bat      # Launch all bridges
```

---

## Core Data Model (`Store.data`)

The entire application state is stored in a single reactive object. Here is the complete schema:

```javascript
Store.data = {
  // ═══════════════════════════════════════════════════════════
  // SHOW INFO
  // ═══════════════════════════════════════════════════════════
  show: {
    name: string,              // "Sunday Night Football"
    format: string             // "1080p/59.94" | "1080i/59.94" | "720p/59.94"
  },

  // ═══════════════════════════════════════════════════════════
  // SOURCE TAB - 80 Sources
  // ═══════════════════════════════════════════════════════════
  sources: Array(80).fill({
    number: number,            // 1-80
    showName: string,          // "MAIN CAM 1"
    umdName: string,           // "CAM1" (UMD display)
    engSource: string,         // "CCU 01" | "FS 01" | "EVS 1-A"
    audioSource: string,       // Audio device assignment
    active: boolean            // Is source active
  }),

  // ═══════════════════════════════════════════════════════════
  // TX/PGM/GFX TAB
  // ═══════════════════════════════════════════════════════════
  txPgmGfx: {
    tx: Array(8).fill({
      row: number,             // 1-8
      daInput: string,         // "DA 2-2B"
      umdName: string,         // "TX1 DA"
      engSource: string,
      audioSource: string,
      framesync: string,
      output: string,
      ioCoax1: boolean,        // I/O coax tie line flags
      ioCoax2: boolean,
      ioCoax3: boolean,
      ioCoax4: boolean
    }),
    cg: Array(6).fill({
      row: number,             // 1-6
      daInput: string,
      umdName: string,
      engSource: string,
      keyIn: string
    }),
    canvas: Array(8).fill({
      row: number,             // 1-8
      rtrIn: string,
      umdName: string,
      engSource: string
    }),
    pgm: Array(4).fill({
      row: number,             // 1-4
      daInput: string,
      umdName: string,
      engSource: string,
      audioSource: string
    })
  },

  // ═══════════════════════════════════════════════════════════
  // CCU/FSY TAB
  // ═══════════════════════════════════════════════════════════
  ccuFsy: {
    ccu: Array(12).fill({
      unit: number,            // 1-12
      device: string,          // "GV XCU"
      coax: boolean,
      tac: string,             // "TAC-A" | "TAC-B" | ...
      fibA: string,            // Fiber strand A
      fibB: string,            // Fiber strand B
      lensB: boolean,          // B-head lens
      lensS: boolean,          // S-head lens
      lensW: boolean,          // W-head lens
      lensDolly: boolean,
      lensHand: boolean,
      notes: string
    }),
    fsy: Array(67).fill({
      unit: number,            // 1-67
      format: string,          // Video format
      tac: string,
      fibA: string,
      mult: string,
      coax: string,
      fixed: string,
      js: string,              // Joystick
      notes: string
    })
  },

  // ═══════════════════════════════════════════════════════════
  // RTR I/O MASTER - Device Library
  // ═══════════════════════════════════════════════════════════
  rtrMaster: Array(288+).fill({
    row: number,               // Device ID (1-288, extended for SHOW devices)
    deviceName: string,        // "CCU 01" | "SHOW 01" | "EVS 1-A"
    deviceDesc: string,        // Description
    videoLevel: string,        // Video router output number
    audio: Array(16).fill(string)  // 16 audio channel assignments
  }),

  rtrOutputs: Array().fill({   // Router outputs only
    row: number,
    deviceName: string,
    deviceDesc: string,
    videoLevel: string,
    audio: Array(16)
  }),

  // ═══════════════════════════════════════════════════════════
  // SHEET8 - Reference Data
  // ═══════════════════════════════════════════════════════════
  sheet8: {
    deviceTypes: string[],     // ["Camera", "EVS", "VTR", "Graphics", ...]
    videoFormats: string[],    // ["1080p/59.94", "1080i/59.94", ...]
    audioFormats: string[],    // ["AES", "MADI", "Analog", ...]
    locations: string[],       // ["Control Room", "Field", "Truck", ...]
    tacPanels: string[],       // ["TAC-A", "TAC-B", ..., "S09", "S10"]
    audioSources: string[],
    customDropdowns: Object    // User-defined dropdown options
  },

  // ═══════════════════════════════════════════════════════════
  // VIDEO I/O TAB
  // ═══════════════════════════════════════════════════════════
  videoIo: {
    fiberRtrOut: Array(16).fill({
      row: number,             // 1-16
      source: string,
      destination: string,
      tac: string,
      fibA: string
    }),
    coaxRtrOut: Array(16).fill({
      row: number,
      source: string,
      destination: string,
      mult: string,
      coax: string
    }),
    coaxIoTieLines: Array(48).fill({
      row: number,             // 1-48
      source: string,
      destination: string,     // Editable
      mult: string,
      coax: string
    }),
    coaxTruckTieLines: Array(48).fill({
      row: number,
      source: string,
      destination: string      // Editable
    }),
    jfsMux1: {
      tac: string,
      fibA: string,
      rows: Array(12).fill({
        row: number,
        source: string,
        destination: string,
        faxed: boolean
      })
    },
    jfsMux2: {
      tac: string,
      fibA: string,
      rows: Array(6).fill({ ... })
    }
  },

  // ═══════════════════════════════════════════════════════════
  // FIBER TAC - 10 Panels x 24 Ports
  // ═══════════════════════════════════════════════════════════
  fiberTac: {
    "TAC-A": Array(24).fill({
      port: number,            // 1-24
      source: string,
      dest: string,
      notes: string
    }),
    "TAC-B": Array(24),
    "TAC-C": Array(24),
    "TAC-D": Array(24),
    "TAC-E": Array(24),
    "TAC-F": Array(24),
    "TAC-G": Array(24),
    "TAC-H": Array(24),
    "S09": Array(24),
    "S10": Array(24)
  },

  // ═══════════════════════════════════════════════════════════
  // SWITCHER I/O TAB
  // ═══════════════════════════════════════════════════════════
  swrIo: {
    inputs: Array(64).fill({
      row: number,             // 1-64
      source: string,
      sw: string               // Show assignment
    }),
    outputs: Array(46).fill({
      row: number,             // 1-46
      defaultShow: string,     // Default device name
      show: string,            // Assigned show
      umd: string              // Optional UMD override
    }),
    tally: Array(24).fill({
      row: number,             // 1-24
      default: string,
      show: string
    }),
    gpi: Array(12).fill({
      row: number,             // 1-12
      default: string,
      show: string
    })
  },

  // ═══════════════════════════════════════════════════════════
  // NETWORK I/O TAB
  // ═══════════════════════════════════════════════════════════
  networkIo: {
    patchA: Array(24).fill({
      port: number,
      device: string,
      ip: string,
      vlan: string,
      notes: string
    }),
    patchB: Array(24),
    io: Array(24).fill({
      port: number,
      device: string,
      notes: string
    }),
    truckBench: Array(24),
    aboveTape: Array(12).fill({
      port: number,            // 13-24
      device: string,
      notes: string
    })
  },

  // ═══════════════════════════════════════════════════════════
  // EVS CONFIG TAB
  // ═══════════════════════════════════════════════════════════
  evsConfig: {
    servers: Array(4).fill({
      id: string,              // "2101" | "2102" | "2103" | "2105"
      op: string,
      sn: string,
      mod: string,             // "XT VIA" | "Xs VIA"
      pos: string,
      config: string,
      showName: string,
      engName: string,
      channels: Array(6-8).fill({
        channel: number,
        engName: string,
        showName: string,
        isOutput: boolean
      }),
      network: {
        pcLan: string,         // "10.5.21.11/16"
        tenG: string,          // "192.168.201.211/24"
        xnet: number
      },
      wohler: Array(8).fill({
        channel: number,
        description: string,
        rtrOut: string,
        isAnalog: boolean
      })
    }),
    xfile: {
      name: string,
      pcLan: string,
      tenG: string,
      inet: string,
      gateways: Object
    }
  },

  // ═══════════════════════════════════════════════════════════
  // MONITOR WALLS
  // ═══════════════════════════════════════════════════════════
  monitorWallsV2: {
    "p2p3": {
      monitors: Array().fill({
        id: string,
        label: string,
        assignmentType: "mv" | "source",
        mvId: string,          // "18-1" (card-side)
        directSource: string,
        layout: string         // "9_SPLIT" | "6_SPLIT_L" | ...
      })
    },
    "evs": { monitors: Array() },
    "aud": { monitors: Array() },
    "video": { monitors: Array() }
  },

  // ═══════════════════════════════════════════════════════════
  // PROD DIGITAL MONITOR WALL
  // ═══════════════════════════════════════════════════════════
  prodDigital: {
    multiviewers: Array().fill({
      id: string,              // "1-1" (cardId-side)
      cardId: number,
      side: number,            // 1 or 2
      layout: string,          // Layout name
      inputs: Array(9).fill(string)  // Source assignments
    })
  },

  // ═══════════════════════════════════════════════════════════
  // MULTIVIEWER CONFIG
  // ═══════════════════════════════════════════════════════════
  multiviewer: Array(25).fill({
    mv: number,                // 1-25
    windows: Array(16).fill({
      window: number,          // 1-16
      source: string,
      label: string
    })
  }),

  // ═══════════════════════════════════════════════════════════
  // COAX TAB
  // ═══════════════════════════════════════════════════════════
  coax: {
    mults: Array(40).fill({
      row: number,
      source: string,
      dest1: string,
      dest2: string,
      dest3: string,
      dest4: string,
      notes: string
    }),
    mux: Array(20).fill({
      row: number,
      unit: string,
      input: string,
      output: string,
      notes: string
    })
  },

  // ═══════════════════════════════════════════════════════════
  // AUDIO MULT TAB
  // ═══════════════════════════════════════════════════════════
  audioMult: {
    dt1: Array(24),            // Legacy DT panels
    dt2: Array(24),
    dt3: Array(24),
    dt4: Array(24),
    dt5: Array(24),
    dt6: Array(24),
    dtA: Array(12).fill({      // New DT-12 panels
      port: number,
      source: string,
      dest: string
    }),
    dtB: Array(12),
    dtC: Array(12),
    dtD: Array(12),
    dtE: Array(12),
    dtF: Array(12)
  },

  // ═══════════════════════════════════════════════════════════
  // ROUTER PANELS
  // ═══════════════════════════════════════════════════════════
  routerPanels: {
    form: Array(20).fill({
      row: number,
      panelName: string,
      location: string,
      type: string,
      levels: string,
      notes: string
    }),
    td: Array(20).fill({
      row: number,
      button: string,
      source: string,
      dest: string,
      notes: string
    })
  }
}
```

---

## Store API (`js/store.js`)

### Initialization
```javascript
Store.init()                   // Load from localStorage, set defaults
Store.loadFromStorage()        // Load data from localStorage
Store.save()                   // Save to localStorage (auto-called)
```

### Data Access
```javascript
Store.data                     // Direct access to data object
Store.get(path)                // Get value by dot-notation path
Store.set(path, value)         // Set value, triggers events & save
```

### Events
```javascript
Store.on(event, callback)      // Subscribe to events
Store.off(event, callback)     // Unsubscribe
Store.emit(event, payload)     // Emit event (internal use)

// Events:
'change'                       // Any data change { path, value }
'change:FIELD'                 // Field-specific (e.g., 'change:sources')
'saved'                        // Data saved (timestamp)
'show-loaded'                  // Show loaded from file/cloud
```

### Show Management
```javascript
Store.newShow(name, format)    // Create new show
Store.loadShow(data)           // Load show data object
Store.exportData()             // Get data for export
```

### Sync Functions
```javascript
// Sync SHOW names to RTR Master device names
syncShowNamesToRtrMaster()     // Called on show load
```

---

## Formulas API (`js/formulas.js`)

### Device Lookups
```javascript
Formulas.rtrMasterLookup(deviceName)
// Returns: { deviceName, deviceDesc, videoLevel, audio: [...16] }

Formulas.getVideoLevel(deviceName)
// Returns: string (video router output number)

Formulas.getAudioLevels(deviceName)
// Returns: Array(16) of audio channel assignments
```

### Aggregations
```javascript
Formulas.getUmdNames(deviceName)
// Returns: "CAM 1, CAM 2, CAM 3" (comma-joined show names)

Formulas.getSourceNamesForDevice(deviceName)
// Returns: Array of show names using this device

Formulas.activeSourceCount()
// Returns: number of active sources

Formulas.equipmentSummary()
// Returns: { totalSources, activeSources, usedDevices, ... }
```

---

## Utils API (`js/utils.js`)

### UI Components
```javascript
Utils.tabPage(title, subtitle)
// Returns: DOM element for tab page container

Utils.sectionHeader(title)
// Returns: DOM element for section header

Utils.createDarkDropdown(options, value, onChange, config)
// Returns: Styled dropdown component

Utils.toast(message, type)
// Shows notification (type: 'success' | 'error' | 'info' | 'warn')
```

### Device Options
```javascript
Utils.getDeviceOptions()       // All devices from rtrMaster
Utils.getSourceOptions()       // All 80 sources
Utils.getTacOptions()          // TAC panel options
Utils.getFiberStrandOptions()  // Fiber strand options
Utils.getMultOptions()         // Multiplier options
Utils.getCoaxOptions()         // Coax port options
```

### Cell Warnings
```javascript
Utils.showCellWarning(td, message)   // Show warning on cell
Utils.clearCellWarning(td)           // Clear warning
```

---

## Integration Clients

### NV9000Client (`js/nv9000-client.js`)

```javascript
// Configuration
NV9000Client.getBridgeUrl()           // Default: 'http://localhost:3003'
NV9000Client.setBridgeUrl(url)
NV9000Client.getTriggerMode()         // 'immediate' | 'staged'
NV9000Client.setTriggerMode(mode)
NV9000Client.getPageMode(page)        // Per-page mode override
NV9000Client.setPageMode(page, mode)

// Routing
NV9000Client.handleRoute(source, dest, page)  // Route based on mode
NV9000Client.route(source, dest)              // Immediate route
NV9000Client.stageRoute(source, dest)         // Stage for later

// Staged Routes
NV9000Client.getStagedRoutes()                // Get all staged
NV9000Client.clearStagedRoutes()              // Clear staged
NV9000Client.triggerStagedRoutes()            // Execute all staged
```

### KaleidoClient (`js/kaleido.js`)

```javascript
// Configuration
KaleidoClient.getBridgeUrl()          // Default: 'http://localhost:3001'
KaleidoClient.setBridgeUrl(url)
KaleidoClient.checkConnection()       // Test bridge connectivity

// Layout Control
KaleidoClient.handleLayoutChange(mvId, from, to, cardId)
KaleidoClient.triggerLayout(ip, layoutIndex, port)

// Staged Layouts
KaleidoClient.stageLayoutChange(mvId, from, to, cardId)
KaleidoClient.getStagedLayouts()
KaleidoClient.clearStagedLayouts()
KaleidoClient.triggerAllStaged()
```

### SupabaseSync (`js/supabase.js`)

```javascript
// Initialization
SupabaseSync.init()                   // Connect to Supabase
SupabaseSync.isConfigured()           // Check if config exists

// Show Management
SupabaseSync.loadShow(showName)       // Load from cloud
SupabaseSync.createCloudShow(name, format)
SupabaseSync.listCloudShows()         // Get all cloud shows
SupabaseSync.deleteCloudShow(name)

// URL & Sharing
SupabaseSync.getShareUrl()            // Get shareable URL
SupabaseSync.copyShareUrl()           // Copy to clipboard

// Properties
SupabaseSync.connected                // Connection status
SupabaseSync.currentShowName          // Current show name
```

---

## CSS Variables (`css/styles.css`)

```css
:root {
  /* Backgrounds */
  --bg-primary: #12141a;
  --bg-secondary: #1c1f26;
  --bg-tertiary: #252932;
  --bg-input: #2a2f3a;
  --bg-hover: #323844;

  /* Borders */
  --border: #2d333d;
  --border-light: #3d4450;
  --border-focus: #5b9aff;

  /* Text */
  --text-primary: #eaeef3;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Accents */
  --accent-blue: #5b9aff;
  --accent-green: #34d399;
  --accent-red: #f87171;
  --accent-orange: #fbbf24;
  --accent-yellow: #fde047;
  --accent-purple: #a78bfa;
  --accent-cyan: #22d3ee;

  /* Category Colors */
  --cat-home: #5b9aff;
  --cat-input: #34d399;
  --cat-lookup: #fbbf24;
  --cat-output: #a78bfa;
  --cat-physical: #22d3ee;
  --cat-monitor: #f87171;
  --cat-config: #fde047;

  /* Layout */
  --header-height: 52px;
  --sidebar-width: 155px;

  /* Typography */
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
  --font-sans: 'Inter', -apple-system, sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

---

## Bridge Servers

### Kaleido Bridge (`:3001`)
**Location:** `kaleido-bridge/index.js`

```javascript
// Endpoints
GET  /health              // Health check
POST /test                // Test card connection
POST /trigger             // Single layout trigger
POST /trigger-batch       // Multiple simultaneous triggers

// TSL 5.0 Protocol
// Sends Left Tally ON (layout index) then OFF to trigger
```

### NV9000 Bridge (`:3003`)
**Location:** `nv9000-bridge/`

```javascript
// Endpoints
GET  /health              // Health check
POST /route               // Execute single route
POST /route-batch         // Execute multiple routes
```

### Tallyman Bridge (`:3002`)
**Location:** `tallyman-bridge/`

```javascript
// Endpoints
GET  /health              // Health check
POST /umd                 // Update single UMD
POST /umd-batch           // Update multiple UMDs

// 166 UMD positions mapped
```

### Startup
```batch
start-all-servers.bat     # Launches all bridges
```

---

## Tab Module Pattern

Each tab follows this pattern:

```javascript
const TabNameTab = (() => {
  // Private state (if needed)
  let localState = {};

  // Main render function
  function render(container) {
    const page = Utils.tabPage('TAB TITLE', 'Description text');

    // Build UI components
    page.appendChild(Utils.sectionHeader('SECTION NAME'));
    page.appendChild(renderTable());

    container.appendChild(page);
  }

  // Helper functions
  function renderTable() {
    // Build table UI
  }

  // Public API
  return { render };
})();
```

**Registration in `app.js`:**
```javascript
const TABS = {
  'home': { render: HomeTab.render, category: 'home' },
  'source': { render: SourceTab.render, category: 'input' },
  // ...
};
```

---

## RTR ID Mapping (SHOW Devices)

SHOW devices (1-80) map to specific RTR IDs:

```javascript
// SHOW 01-20: RTR IDs 865-884
if (showNum >= 1 && showNum <= 20) return 864 + showNum;

// SHOW 21-40: RTR IDs 1171-1190
if (showNum >= 21 && showNum <= 40) return 1150 + showNum;

// SHOW 41-60: RTR IDs 1202-1221
if (showNum >= 41 && showNum <= 60) return 1161 + showNum;

// SHOW 61-80: RTR IDs 1222-1241
if (showNum >= 61 && showNum <= 80) return 1161 + showNum;
```

---

## Kaleido Layout Indices

```javascript
const LAYOUT_INDICES = {
  '4_SPLIT': 4,
  '5_SPLIT': 5,
  '5_SPLIT_FLIP': 15,
  '6_SPLIT_L': 6,
  '6_SPLIT_R': 7,
  '6_SPLIT_L_UP': 16,
  '6_SPLIT_R_UP': 17,
  '9_SPLIT': 9,
  '9_SPLIT_L': 10,
  '9_SPLIT_R': 11,
  'FULL_SCREEN': 1
};
```

---

## Network Configuration

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Web Server | 8080 | HTTP | Serve application |
| Kaleido Bridge | 3001 | HTTP→UDP | Layout control |
| Tallyman Bridge | 3002 | HTTP→UDP | UMD text |
| NV9000 Bridge | 3003 | HTTP→TCP | Router control |
| Supabase | 443 | HTTPS | Cloud sync |
| Kaleido Cards | 8902 | UDP | TSL 5.0 protocol |

---

## Rebuilding Guide

To rebuild this application from scratch:

1. **Create HTML structure** with header, sidebar, and tab content area
2. **Implement Store** with reactive data and event system
3. **Build Utils** for UI components (dropdowns, tables, toasts)
4. **Create Formulas** for computed lookups
5. **Build each tab module** following the render pattern
6. **Implement integration clients** for NV9000, Kaleido, Supabase
7. **Create bridge servers** for protocol translation
8. **Style with CSS variables** for consistent theming
9. **Add export/import** for JSON and CSV
10. **Test all data flows** and cross-tab synchronization

---

*Document Version: March 2026*
*Application: MU-21 Showbook v2.0*
