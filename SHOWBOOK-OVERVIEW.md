# MU-21 Showbook Application Overview

## What is the MU-21 Showbook?

The MU-21 Showbook is a comprehensive web-based broadcast engineering application designed for managing live production equipment, signal routing, and monitor wall configurations. Built as a single-page application using vanilla JavaScript, it provides a centralized hub for technical directors, video engineers, and broadcast crews to document and control all aspects of a mobile production unit.

---

## Core Capabilities

### Source Management (80 Sources)
- Document show names, UMD names, engineering sources, and audio assignments
- Autofill functionality with configurable prefixes and increment modes
- Automatic validation for missing or duplicate entries
- Real-time synchronization across all dependent tabs

### Equipment Tracking
- **Camera Control Units (CCU 1-12):** Device assignments, TAC panel locations, fiber routing, lens control options
- **Frame Synchronizers (FSY 1-67):** Format selection, multiplier settings, fixed/joystick modes
- **Transmission (TX 1-8):** DA inputs with fiber panel/port assignments
- **Character Generators (CG 1-6):** Graphics source configuration
- **EVS Replay Servers (4 units):** IP configuration, playback settings, XFILE gateway integration

### Router Configuration
- **RTR I/O Master Sheet:** Device library mapping video levels and 16 audio channels per device
- **NV9000 Export:** Generate router configuration CSV files ready for import
- **Switcher I/O (120 inputs, 46 outputs):** Complete switcher source mapping
- **Tally Groups (24) and GPI Groups (12):** Signal routing for tally and control systems

### Physical I/O Documentation
- **Fiber TAC Panels:** Visual 24-port grid for 10 TAC panels with click-to-assign interface
- **Coax Multiplexers:** 8 units with 15 outputs each in visual grid layout
- **Audio Distribution:** 6 units with 24 channels each
- **Network Patchbays:** Dual 24-port configurations with IP validation and duplicate detection
- **Video I/O:** Fiber outputs, coax outputs, and tie line management

---

## Monitor Wall Control

### Kaleido Multiviewer Integration
The showbook provides direct control of Grass Valley Kaleido multiviewer systems through an integrated bridge service.

**Supported Layouts:**
| Layout | Description | Index |
|--------|-------------|-------|
| 4 SPLIT | 2x2 quad view | 4 |
| 5 SPLIT | 3 top, 2 bottom | 5 |
| 6 SPLIT L | Large VIP left, 5 small | 6 |
| 6 SPLIT R | Large VIP right, 5 small | 7 |
| 9 SPLIT | 3x3 equal grid | 9 |
| 9 SPLIT L | Large VIP left, 6 small | 10 |
| 9 SPLIT R | Large VIP right, 6 small | 11 |
| 5 SPLIT FLIP | 2 top, 3 bottom | 15 |
| 6 SPLIT L UP | Large VIP top-left | 16 |
| 6 SPLIT R UP | Large VIP top-right | 17 |

**Trigger Modes:**
- **Staged Mode:** Queue layout changes and trigger all at once
- **Immediate Mode:** Apply layout changes instantly when selected

**Technical Implementation:**
- TSL 5.0 protocol over UDP (port 8902)
- Kaleido Bridge service runs on port 3001
- Supports batch triggering for multiple cards simultaneously
- 22 Kaleido card configurations (IPs 192.168.23.201-222)

### Monitor Wall Pages
- **PROD Digital:** Main production monitor wall with full layout control
- **P2-P3:** Secondary monitor walls
- **EVS:** Dedicated replay server monitoring
- **AUD:** Audio department displays

---

## Data Management

### Cloud Synchronization (Supabase)
- Real-time multi-user collaboration
- Automatic cloud backup
- Share shows via URL parameters
- Fallback to localStorage when offline

### Export Options
- **JSON Export:** Complete show backup with timestamp
- **JSON Import:** Restore shows with validation
- **CSV Export:** Per-tab data in standard format
- **NV9000 Export:** Router-ready configuration files

### Auto-Computation
- Device lookups from master sheet
- UMD name derivation from show names
- 16-channel audio assignments
- Equipment usage summaries
- Cross-tab field synchronization

---

## Backend Services

### Showbook Server (Port 8080)
- Local network web server
- Accessible from any device on the truck network
- Auto-discovery of local IP addresses

### Kaleido Bridge (Port 3001)
- HTTP REST API for layout triggers
- TSL 5.0 UDP packet generation
- Runs as Windows service (auto-start)
- Endpoints:
  - `GET /health` - Status check
  - `POST /test` - Test card connection
  - `POST /trigger` - Single layout change
  - `POST /trigger-batch` - Multiple simultaneous changes

---

## User Interface

### Design
- Dark broadcast theme optimized for control room environments
- Category-based color coding for easy navigation
- 24 tabs organized into 6 categories

### Navigation Categories
| Category | Color | Tabs |
|----------|-------|------|
| Home | Blue | Dashboard, equipment summary |
| Input | Green | Sources, TX/PGM/GFX, CCU/FSY |
| Lookup | Orange | RTR I/O Master, Reference Lists |
| Output | Purple | Engineer, Switcher I/O |
| Physical | Cyan | Video I/O, Fiber TAC, Coax, Audio, Network |
| Monitor | Red | PROD, P2-P3, EVS, AUD walls |
| Config | Yellow | EVS, Multiviewer, Router Panels |

### Interactive Features
- Inline table editing
- Click-to-assign port grids
- Dropdown menus populated from data
- Real-time save indicator
- Toast notifications
- Connection status badges

---

## Technical Specifications

### Browser Requirements
- Modern web browser (Chrome, Firefox, Edge)
- JavaScript enabled
- localStorage support

### Network Requirements
- Local network access for multi-device viewing
- UDP port 8902 open for Kaleido communication
- Port 3001 for Kaleido Bridge API
- Port 8080 for web server

### Integration Points
- Grass Valley Kaleido multiviewers (TSL 5.0)
- NV9000 router system (CSV export)
- Bitfocus Companion (compatible TSL protocol)
- Supabase cloud platform (optional)

---

## Summary

The MU-21 Showbook transforms broadcast engineering documentation from static spreadsheets into a dynamic, interconnected application. By centralizing source management, equipment tracking, router configuration, and monitor wall control, it enables production crews to efficiently manage complex live broadcasts while maintaining accurate technical documentation throughout the show.

Key differentiators:
- **Real-time Kaleido control** matching Bitfocus Companion capabilities
- **Cross-tab synchronization** eliminates duplicate data entry
- **Cloud collaboration** for multi-user environments
- **Export flexibility** for router and documentation systems
- **Visual interfaces** for fiber, coax, and monitor wall management

---

*Version: February 2026*
*Platform: MU-21 Mobile Production Unit*
