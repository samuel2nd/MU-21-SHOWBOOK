# MU-21 Showbook

Web application for the MU-21 mobile production truck, managing router I/O, monitor walls, and show configuration.

## Quick Start

1. Open `index.html` in any modern browser
2. Enter a show name on the HOME tab
3. Start filling in your source and device data

All data saves to localStorage automatically.

## Multi-User Sync (Optional)

To enable real-time multi-user editing and cloud storage:

1. Create a free project at [supabase.com](https://supabase.com)
2. Edit `config.js` and fill in your Supabase URL and anon key
3. Open the app in multiple browsers — changes sync in real-time
4. Use "Cloud Shows" to browse and load shows from the cloud

## Features

- **24 tabs** covering all showbook sections (Input, Lookup, Output, Physical I/O, Monitor Walls, Config)
- **Real-time sync** via Supabase broadcast (falls back to localStorage)
- **Cloud show storage** — save/load shows from Supabase
- **JSON export/import** — save and restore complete show files
- **CSV export** per tab
- **Computed fields** — ENGINEER tab auto-derives UMD names and router levels from SOURCE + RTR Master
- **Monitor wall visual layouts** — PROD Digital, P2-P3, EVS, AUD, VIDEO walls with drag-and-drop source assignment
- **Light/dark mode toggle** — switch themes for indoor/outdoor use
- **Print functionality** — print any page with clean headers, automatic orientation (portrait/landscape)
- **NV9000 router integration** — route changes via bridge server
- **Tallyman UMD integration** — send UMD updates via TSL 5.0 UDP
- **Kaleido multiviewer control** — layout changes via bridge server
- **WebSocket remote trigger** — sync UMDs from Bitfocus Companion

## Bridge Servers

Optional Node.js servers for hardware integration:

- **tallyman-bridge/** — TSL 5.0 UDP bridge for Tallyman UMD updates
- **nv9000-bridge/** — HTTP bridge for NV9000 router control
- **kaleido-bridge/** — HTTP bridge for Kaleido multiviewer layout changes

## Project Structure

```
mu21-showbook/
├── index.html              Single-page app shell
├── config.js               Supabase + bridge server config
├── css/styles.css          Light/dark broadcast themes
├── js/
│   ├── app.js              App init, tab routing, print, theme toggle
│   ├── store.js            Central data store + localStorage
│   ├── supabase.js         Real-time sync + cloud storage
│   ├── formulas.js         Computed field logic
│   ├── export.js           JSON/CSV export + import
│   ├── utils.js            Shared table/dropdown helpers
│   ├── tallyman-bridge.js  Tallyman UMD client
│   ├── nv9000-client.js    NV9000 router client
│   ├── kaleido.js          Kaleido multiviewer client
│   ├── route-queue.js      Staged route management
│   ├── activity-log.js     Activity logging
│   └── tabs/               One file per tab module
├── tallyman-bridge/        TSL 5.0 UDP bridge server
├── nv9000-bridge/          NV9000 router bridge server
├── kaleido-bridge/         Kaleido multiviewer bridge server
└── README.md
```
