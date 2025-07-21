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
					this.plugin.updateGraphs(); // 즉시 갱신
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
	}
} 