# pirate_raids

A mod for [0 A.D.](https://play0ad.com/) that adds roaming Gaia pirate ships that hunt merchant vessels on the water.

## What it does

Once a game begins, pirate galleys spawn near merchant ships and actively pursue and attack them. Pirates are neutral Gaia units — they belong to no player and will attack any trader they can find. Up to 3 pirate galleys roam the map at any time.

## Installation

1. Copy the `pirate_raids` folder into your 0 A.D. mods directory:
   - **macOS:** `~/Library/Application Support/0ad/mods/`
   - **Linux:** `~/.local/share/0ad/mods/`
   - **Windows:** `%appdata%\0ad\mods\`
2. Launch 0 A.D. and open **Settings > Mod Selection**.
3. Select `pirate_raids` and click **Enable**, then **Save Configuration and Restart**.

## Game Setup

In the game lobby or single-player setup, a **Pirate Raids** checkbox appears under the Game Type settings. It is enabled by default. Uncheck it to play without pirates.

## How it works

- **Spawn:** Every 3 seconds, the mod checks how many pirate galleys are alive. If fewer than 3 exist and at least one merchant ship is present, a new Pirate Galley spawns at a random water position 200-300 units from a merchant.
- **Water check:** Spawn points are validated using terrain height vs. water level to ensure pirates only appear on navigable water.
- **Targeting:** Each tick, all living pirates are ordered to attack a randomly selected merchant ship.
- **Detection:** Merchants are identified by the presence of the `Trader` component (`IID_Trader`). Pirates are identified by the `Pirate` identity class.
- **Unit:** The Pirate Galley inherits from `template_unit_ship_warship_arrow` with the `pirate` mixin applied (Gaia civilization, double damage vs. Traders, prefers Trader targets). It uses the Roman trireme visual, has 900 HP, speed 12, violent stance, and zero cost.

## Planned features

See the `issues/` folder for planned enhancements:

- **Pirate Base** — a capturable Gaia structure that acts as a spawn anchor and escalates raids
- **Loot System** — pirates drop resources when killed; players can collect them
- **Patrol Behavior** — idle pirates patrol trade routes rather than standing still

## Compatibility

- **0 A.D. version:** Alpha 27 (0.0.27)
- **Dependencies:** `public` mod only (included with the game)
- No conflicts with other mods unless they also override `Player.js` (see `0ad-survivors-mod`)

## File structure

```
pirate_raids/
  mod.json
  gamesettings/
    attributes/PirateRaids.js          # Game setting data model (checkbox state)
  gui/
    gamesetup/.../Checkboxes/
      PirateRaids.js                   # Game setup UI checkbox
  simulation/
    components/
      interfaces/PirateRaids.js        # Interface registration
      PirateRaids.js                   # System component: spawn & targeting logic
    helpers/
      PirateUtils.js                   # Utility helpers
    templates/
      units/pirates_ship.xml           # Pirate Galley unit template
  art/
    actors/units/pirates/
      pirate_galley.xml                # Actor definition
  issues/                              # Design docs for planned features
```
