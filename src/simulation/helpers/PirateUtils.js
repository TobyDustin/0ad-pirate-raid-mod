var PirateUtils = {
    isMerchantShip(entity)
    {
      let cmpIdentity = Engine.QueryInterface(entity, IID_Identity);
      return cmpIdentity && cmpIdentity.HasClass("Merchant");
    },
  
    isPirateShip(entity)
    {
      let cmpIdentity = Engine.QueryInterface(entity, IID_Identity);
      return cmpIdentity && cmpIdentity.HasClass("Pirate");
    }
  };
  