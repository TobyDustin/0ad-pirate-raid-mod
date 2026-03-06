# Feature: Patrol Behavior

## Summary
Newly spawned pirate ships patrol near their target merchant ship for a configurable duration before switching to attack mode. This makes encounters feel more natural — pirates stalk their prey before striking.

## Motivation
Currently pirates immediately attack the moment they spawn, which feels abrupt and gives players no reaction time. A patrol phase creates tension, gives alert players a window to respond, and makes the pirates feel like actual raiders scouting before they attack.

## Implementation

### Modify: `simulation/components/PirateRaids.js`

**Add a constant at the top of the file:**
```js
const PATROL_DURATION = 30; // seconds to patrol before attacking
```

**`Init()`** — initialise the phase tracker:
```js
PirateRaids.prototype.Init = function()
{
  this.shipPhases = {};
};
```

**`SpawnPirate(nearEntity)`** — record the ship's phase when spawned:
```js
// After creating the ship entity:
const cmpTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Time);
this.shipPhases[ent] = {
  phase: "patrol",
  targetMerchant: nearEntity,
  spawnTime: cmpTime ? cmpTime.GetCurrentTime() : 0
};
```

**`Tick()`** — replace the existing attack loop with phase-aware logic:
```js
const cmpTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Time);
const now = cmpTime ? cmpTime.GetCurrentTime() : 0;

// Clean up phases for ships that no longer exist
for (let id in this.shipPhases)
  if (!Engine.QueryInterface(+id, IID_Position))
    delete this.shipPhases[id];

for (let ship of pirateShips)
{
  const state = this.shipPhases[ship];
  const cmpUnitAI = Engine.QueryInterface(ship, IID_UnitAI);
  if (!cmpUnitAI || !state)
    continue;

  const target = state.targetMerchant;
  const cmpTargetPos = Engine.QueryInterface(target, IID_Position);
  if (!cmpTargetPos)
    continue;

  if (state.phase === "patrol" && (now - state.spawnTime) < PATROL_DURATION)
  {
    // Circle near the merchant without attacking
    const pos = cmpTargetPos.GetPosition2D();
    cmpUnitAI.SetStance("passive");
    cmpUnitAI.Patrol(pos.x, pos.y);
  }
  else
  {
    // Transition to attack
    state.phase = "attack";
    cmpUnitAI.SetStance("violent");
    cmpUnitAI.Attack(target, false, false);
  }
}
```

## Key APIs
| API | Usage |
|-----|-------|
| `IID_Time.GetCurrentTime()` | Returns current game time in seconds |
| `IID_UnitAI.SetStance("passive")` | Stops auto-attacking during patrol |
| `IID_UnitAI.Patrol(x, z)` | Issues a patrol order to a position; falls back to Walk if unsupported |
| `IID_UnitAI.SetStance("violent")` | Full aggression — chases targets beyond vision |
| `IID_UnitAI.Attack(target, false, false)` | Direct attack order |
| `IID_Position.GetPosition2D()` | Gets merchant's current position each tick (merchant moves) |

## Notes
- `Patrol(x, z)` takes coordinates, not an entity target. The merchant's position is queried fresh each tick so the patrol point tracks the moving ship.
- Stance is re-set every tick during patrol to guard against UnitAI overriding it autonomously.
- The `shipPhases` cleanup uses `IID_Position` as a proxy for "entity still exists" — a destroyed entity returns null.
- `PATROL_DURATION` at the top of the file makes it easy to tune without reading the logic.

## Acceptance Criteria
- [ ] Newly spawned pirate ships patrol near the target merchant for ~30 seconds before attacking
- [ ] Pirates do not attack during the patrol phase (passive stance)
- [ ] After the patrol phase, pirates attack with full aggression (violent stance)
- [ ] Dead ships are removed from the `shipPhases` map each tick (no memory leak)
- [ ] Patrol duration is a named constant at the top of `PirateRaids.js`
- [ ] No errors if the target merchant is destroyed during a pirate's patrol phase
