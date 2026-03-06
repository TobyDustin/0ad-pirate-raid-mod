// Add to the "Game Type" tab (identified by its "GameSpeed" entry)
g_GameSettingsLayout.find(cat => cat.settings.includes("GameSpeed"))
	?.settings.push("PirateRaids");

GameSettingControls.PirateRaids = class PirateRaids extends GameSettingControlCheckbox
{
	constructor(...args)
	{
		super(...args);
		g_GameSettings.pirateRaids.watch(() => this.render(), ["enabled"]);
	}

	onLoad()
	{
		this.render();
	}

	render()
	{
		this.setChecked(g_GameSettings.pirateRaids.enabled);
	}

	onPress(checked)
	{
		g_GameSettings.pirateRaids.setEnabled(checked);
		this.gameSettingsController.setNetworkInitAttributes();
	}
};

GameSettingControls.PirateRaids.prototype.TitleCaption =
	translate("Pirate Raids");

GameSettingControls.PirateRaids.prototype.Tooltip =
	translate("Enable Gaia pirate ships that spawn near and attack merchant ships.");
