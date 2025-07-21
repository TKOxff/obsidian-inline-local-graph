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

		new Setting(containerEl)
			.setName('Show arrows on edges')
			.setDesc('Toggle arrow display on graph edges')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showArrows)
				.onChange(async (value) => {
					this.plugin.settings.showArrows = value;
					await this.plugin.saveSettings();
					this.plugin.showGraphInEditor(); // 즉시 갱신
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
					this.plugin.showGraphInEditor();
				})
			.inputEl.setAttribute('type', 'color'));
	}
} 