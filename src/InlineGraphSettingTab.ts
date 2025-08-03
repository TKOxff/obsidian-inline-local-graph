import { PluginSettingTab, App, Setting } from 'obsidian';
import InlineGraphPlugin from './main';

export class InlineGraphSettingTab extends PluginSettingTab {
	plugin: InlineGraphPlugin;
	nodeBgColor: string;

	constructor(app: App, plugin: InlineGraphPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		console.log("Displaying settings tab. Plugin instance:", this.plugin);
		console.log("Plugin settings:", this.plugin.settings);

		if (!this.plugin.settings) {
			console.error("Plugin settings are not loaded!");
			containerEl.createEl('p', { text: 'Error: Plugin settings could not be loaded. Please try reloading the plugin.' });
			return;
		}

		new Setting(containerEl)
			.setName('Show arrows on edges')
			.setDesc('Toggle arrow display on graph edges')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showArrows)
				.onChange(async (value) => {
					this.plugin.settings.showArrows = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs(); // Update immediately
				}));
                
        new Setting(containerEl)
            .setName('Show graph border')
            .setDesc('Toggle the border around the graph container')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showGraphBorder)
                .onChange(async (value) => {
                    this.plugin.settings.showGraphBorder = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateGraphs();
                }));

		new Setting(containerEl)
			.setName('Node background color')
			.setDesc('Set the background color of graph nodes')
			.addText(text => text
				.setValue(this.plugin.settings.nodeBgColor)
				.setPlaceholder('#888888')
				.onChange(async (value) => {
					this.plugin.settings.nodeBgColor = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				})
			.inputEl.setAttribute('type', 'color'));

		new Setting(containerEl)
			.setName('Show Backlinks')
			.setDesc('Toggle whether to display backlinks in the graph.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showBacklinks)
				.onChange(async (value) => {
					this.plugin.settings.showBacklinks = value;
					await this.plugin.saveSettings();
                    this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Skip Image Links')
			.setDesc('Toggle whether to exclude image files from the graph.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.skipImageLinks)
				.onChange(async (value) => {
					this.plugin.settings.skipImageLinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs(); // Update immediately
				}));

		new Setting(containerEl)
			.setName('Initial Zoom')
			.setDesc('Set the initial zoom scale for the inline graph (default: 1.0)')
			.addSlider(slider => {
				slider
					.setLimits(0.5, 5.0, 0.01)
					.setValue(this.plugin.settings.zoomScale ?? 1.0)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.zoomScale = value;
						await this.plugin.saveSettings();
						this.plugin.updateGraphs();
					});
			});
	}
}