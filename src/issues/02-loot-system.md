# Feature: Loot System

## Summary
When a pirate ship is sunk, it drops a collectible treasure at its location. Any player's unit can walk up and collect it, receiving a small resource reward.

## Motivation
Fighting back against pirates currently offers no reward — players lose units attacking them for nothing. Loot drops create an incentive to engage pirates rather than ignore them, and adds a satisfying payoff when you successfully defend your merchant fleet.

## Implementation
This feature requires no JavaScript changes. It is entirely declarative XML.

### New file: `simulation/templates/gaia/treasure/pirate_loot.xml`
A treasure template that floats on water. Inherits from `template_gaia_treasure`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<Entity parent="template_gaia_treasure">
  <Treasure>
    <CollectTime>2000</CollectTime>
    <Resources>
      <food>0</food>
      <wood>30</wood>
      <stone>0</stone>
      <metal>50</metal>
    </Resources>
  </Treasure>
  <Position>
    <Floating>true</Floating>
  </Position>
  <Footprint>
    <Circle radius="2.0"/>
  </Footprint>
  <VisualActor>
    <Actor>props/special/eyecandy/barrel_a.xml</Actor>
  </VisualActor>
</Entity>
```

Resource amounts and collection time are tunable. A barrel visual suits the pirate theme.

### Modify: `simulation/templates/units/pirates_ship.xml`
Add one line inside the existing `<Health>` block:

```xml
<Health>
  <Max>900</Max>
  <SpawnEntityOnDeath>gaia/treasure/pirate_loot</SpawnEntityOnDeath>
</Health>
```

The `Health` component already handles `SpawnEntityOnDeath` internally — it spawns the entity at the ship's death position and copies ownership to Gaia.

## Key APIs
| Component | Usage |
|-----------|-------|
| `Health.SpawnEntityOnDeath` | Spawns the loot entity automatically on death — no JS needed |
| `Treasure` component | Makes the entity collectible; `CollectTime` sets gather duration |
| `TreasureCollector` (on player units) | Auto-handles collection when a unit walks near — already in the game |
| `Position.Floating` | Keeps the loot on the water surface |

## Reference Files
- Parent template: `simulation/templates/template_gaia_treasure.xml`
- Water treasure example: `simulation/templates/gaia/treasure/shipwreck.xml`
- Death spawn logic: `simulation/components/Health.js` → `CreateDeathSpawnedEntity()`

## Acceptance Criteria
- [ ] A loot bundle appears at the position of every sunk pirate ship
- [ ] The loot floats on the water surface (does not clip into terrain)
- [ ] Any player's unit walking near the loot collects it and receives resources
- [ ] Resource amounts are clearly defined as constants and easy to tune
- [ ] No errors when a pirate ship dies on land (edge case — `Floating` should handle it)
