# MU-21 Showbook

Web application replicating the 24-tab MU-21 Showbook Google Sheet for the MU-21 Router I/O system.

## Quick Start

1. Open `index.html` in any modern browser
2. Enter a show name on the HOME tab
3. Start filling in your source and device data

All data saves to localStorage automatically.

## Multi-User Sync (Optional)

To enable real-time multi-user editing:

1. Create a free project at [supabase.com](https://supabase.com)
2. Edit `config.js` and fill in your Supabase URL and anon key
3. Open the app in multiple browsers — changes sync in real-time

## Features

- **24 tabs** covering all showbook sections (Input, Lookup, Output, Physical I/O, Monitor Walls, Config)
- **Real-time sync** via Supabase broadcast (falls back to localStorage)
- **JSON export/import** — save and restore complete show files
- **CSV export** per tab
- **Computed fields** — ENGINEER tab auto-derives UMD names and router levels from SOURCE + RTR Master
- **Monitor wall visual layouts** — clickable grid displays
- **NV9000 export** — ready for router configuration import
- **Print-friendly** monitor wall layouts
- **Dark broadcast theme** — designed for production control room environments

## Project Structure

```
mu21-showbook/
├── index.html          Single-page app shell
├── config.js           Supabase credentials (optional)
├── css/styles.css      Dark broadcast theme
├── js/
│   ├── app.js          App init, tab routing
│   ├── store.js        Central data store + localStorage
│   ├── supabase.js     Real-time sync client
│   ├── formulas.js     Computed field logic
│   ├── export.js       JSON/CSV export + import
│   ├── utils.js        Shared table/dropdown helpers
│   └── tabs/           One file per tab module
└── README.md
```
