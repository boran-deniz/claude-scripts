# claude-scripts

This repository contains personal automation scripts managed and executed by Claude Code.

## How to run a script

1. Make sure dependencies are installed for the script's folder:
   ```bash
   cd scripts/<name> && npm install
   ```
2. Run the script:
   ```bash
   node scripts/<name>/index.js
   ```

Or use the shortcut defined per script (see below).

---

## Available Scripts

### 🪒 duke — Friseur Termin-Checker
**Folder:** `scripts/duke/`
**Run:** `node scripts/duke/index.js`
**What it does:** Checks the next available appointment at Duke of Haircuts (Salonkee) for the service "MEN → Cut & Finish → Haare ab Schulter". Outputs the date, available times, and booking URL.
**Salon:** Duke of Haircuts, Katharinengasse 24, 90403 Nürnberg — Tel. 0911448838

---

## Adding new scripts

Create a new folder under `scripts/` with:
- `index.js` — the main script
- `package.json` — dependencies
- `README.md` — what the script does and how to use it
