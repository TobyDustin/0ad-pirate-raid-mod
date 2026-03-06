GameSettings.prototype.Attributes.PirateRaids = class PirateRaids extends GameSetting
{
	init()
	{
		this.enabled = true;
	}

	toInitAttributes(attribs)
	{
		attribs.settings.PirateRaids = this.enabled;
	}

	fromInitAttributes(attribs)
	{
		const val = this.getLegacySetting(attribs, "PirateRaids");
		if (val !== undefined)
			this.enabled = !!val;
	}

	setEnabled(enabled)
	{
		this.enabled = enabled;
	}
};
