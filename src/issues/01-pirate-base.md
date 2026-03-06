# Feature: Pirate Base

## Summary
Add a Gaia-owned dock structure that spawns at game start on the water. Pirate ships spawn from it instead of appearing near random merchant ships. Players can destroy the base to stop the raids permanently.

## Motivation
Currently pirates materialize out of thin air near merchants, which feels artificial. A physical pirate base gives players a strategic objective — find and destroy it to end the threat — and makes the mod feel like a proper game mechanic rather than a background effect.

## Implementation

### New file: `simulation/templates/structures/pirates/pirate_base.xml`
A Gaia-owned dock template. Inherits from `template_structure_military_dock`. No `<BuildRestrictions>` block (placed programmatically, not by players). Uses an existing dock actor, e.g. `structures/celts/warship.xml`.

Key overrides:
- `<Identity>` — name it "Pirate Cove"
- `<Position><Floating>true</Floating>` — required for water placement
- Remove `<Trainer>` — spawning is handled by the PirateRaids component, not the production queue
- `<Capturable>` — remove so players must destroy it, not capture it

### Modify: `simulation/components/PirateRaids.js`

**`OnGlobalInitGame`**
After starting the timer, search for a valid water position (reuse existing water check: `IID_Terrain.GetGroundLevel < IID_WaterManager.GetWaterLevel`) and place the dock:
```js
const base = Engine.AddEntity("structures/pirates/pirate_base");
Engine.QueryInterface(base, IID_Position).JumpTo(x, z);
Engine.QueryInterface(base, IID_Ownership).SetOwner(0);
this.pirateBase = base;
```
If no water position is found after N attempts, set `this.pirateBase = null` and disable the mod gracefully.

**`SpawnPirate`**
Change the spawn origin from a random offset near a merchant to a position adjacent to `this.pirateBase`.

**`Tick`**
At the top of Tick, check if the base is still alive:
```js
if (this.pirateBase && !Engine.QueryInterface(this.pirateBase, IID_Health))
{
  Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.timer);
  return;
}
```

## Key APIs
| API | Usage |
|-----|-------|
| `Engine.AddEntity(template)` | Spawn the dock |
| `IID_Position.JumpTo(x, z)` | Place it on the map |
| `IID_Ownership.SetOwner(0)` | Make it Gaia-owned |
| `IID_Terrain.GetGroundLevel(x, z)` | Water check |
| `IID_WaterManager.GetWaterLevel(x, z)` | Water check |
| `IID_Health` | Detect if base has been destroyed (returns null when dead) |
| `IID_Timer.CancelTimer(id)` | Stop spawning when base is gone |

## Acceptance Criteria
- [ ] A dock structure appears on the water at game start
- [ ] All pirate ships spawn adjacent to the dock, not near merchants
- [ ] Destroying the dock stops all further pirate spawns
- [ ] On maps with no water, the mod disables itself gracefully with no errors
- [ ] The base is Gaia-owned and cannot be captured, only destroyed
