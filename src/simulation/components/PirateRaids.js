function PirateRaids() {}

PirateRaids.prototype.Schema =
  "<a:component type='system'/><empty/>";

PirateRaids.prototype.Init = function()
{
};

PirateRaids.prototype.OnGlobalInitGame = function()
{
  if (InitAttributes && InitAttributes.settings && InitAttributes.settings.PirateRaids === false)
    return;

  const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
  if (!cmpTimer)
    return;

  this.timer = cmpTimer.SetInterval(
    SYSTEM_ENTITY,
    IID_PirateRaids,
    "Tick",
    3000,
    3000,
    null
  );
};

PirateRaids.prototype.Tick = function()
{
  const pirateShips   = this.GetPirateShips();
  const merchantShips = this.GetEnemyMerchantShips();

  if (!merchantShips.length)
    return;

  // Spawn up to 3 pirates total, one per tick, near the first merchant ship
  if (pirateShips.length < 3)
    this.SpawnPirate(merchantShips[0]);

  // Command every existing pirate to attack a random merchant
  for (let ship of pirateShips)
  {
    const target = merchantShips[Math.floor(Math.random() * merchantShips.length)];
    const cmpUnitAI = Engine.QueryInterface(ship, IID_UnitAI);
    if (cmpUnitAI)
      cmpUnitAI.Attack(target, false, false);
  }
};

PirateRaids.prototype.GetPirateShips = function()
{
  const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
  if (!cmpRangeManager)
    return [];

  return cmpRangeManager.GetEntitiesByPlayer(0).filter(e => {
    const cmpIdentity = Engine.QueryInterface(e, IID_Identity);
    return cmpIdentity && cmpIdentity.HasClass("Pirate");
  });
};

PirateRaids.prototype.GetEnemyMerchantShips = function()
{
  const cmpRangeManager  = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
  const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
  if (!cmpRangeManager || !cmpPlayerManager)
    return [];

  const numPlayers = cmpPlayerManager.GetNumPlayers();
  let merchants = [];
  for (let i = 1; i < numPlayers; i++)
  {
    const ents = cmpRangeManager.GetEntitiesByPlayer(i);
    for (let e of ents)
      if (Engine.QueryInterface(e, IID_Trader))
        merchants.push(e);
  }
  return merchants;
};

PirateRaids.prototype.SpawnPirate = function(nearEntity)
{
  const cmpRefPos = Engine.QueryInterface(nearEntity, IID_Position);
  if (!cmpRefPos)
    return;

  const pos = cmpRefPos.GetPosition2D();

  const cmpTerrain = Engine.QueryInterface(SYSTEM_ENTITY, IID_Terrain);
  const cmpWaterManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_WaterManager);

  let spawnX, spawnY;
  let found = false;
  for (let attempt = 0; attempt < 10; ++attempt)
  {
    const angle = Math.random() * 2 * Math.PI;
    const distance = 200 + Math.random() * 100; // 200-300 units away
    const tx = pos.x + Math.cos(angle) * distance;
    const ty = pos.y + Math.sin(angle) * distance;

    if (cmpTerrain && cmpWaterManager &&
        cmpTerrain.GetGroundLevel(tx, ty) < cmpWaterManager.GetWaterLevel(tx, ty))
    {
      spawnX = tx;
      spawnY = ty;
      found = true;
      break;
    }
  }

  if (!found)
    return;

  const ent = Engine.AddEntity("units/pirates_ship");
  if (!ent)
    return;

  const cmpPos = Engine.QueryInterface(ent, IID_Position);
  if (cmpPos)
    cmpPos.JumpTo(spawnX, spawnY);

  const cmpOwn = Engine.QueryInterface(ent, IID_Ownership);
  if (cmpOwn)
    cmpOwn.SetOwner(0); // Gaia
};

Engine.RegisterSystemComponentType(IID_PirateRaids, "PirateRaids", PirateRaids);
