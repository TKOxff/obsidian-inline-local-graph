import { PluginSettingTab, App, Setting } from 'obsidian';
import InlineGraphPlugin from './main';

export class InlineGraphSettingTab extends PluginSettingTab {
	plugin: InlineGraphPlugin;

	constructor(app: App, plugin: InlineGraphPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		if (!this.plugin.settings) {
			containerEl.createEl('p', { text: 'Error: plugin settings could not be loaded. Please try reloading the plugin.' });
			return;
		}

		// ── Graph ──
		containerEl.createEl('h6', { text: 'Graph' });

		new Setting(containerEl)
			.setName('Show arrows on edges')
			.setDesc('Toggle arrow display on graph edges.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showArrows)
				.onChange(async (value) => {
					this.plugin.settings.showArrows = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Show graph border')
			.setDesc('Toggle the border around the graph container.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showGraphBorder)
				.onChange(async (value) => {
					this.plugin.settings.showGraphBorder = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Show outgoing links')
			.setDesc('Toggle whether to display outgoing links in the graph.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showLinks)
				.onChange(async (value) => {
					this.plugin.settings.showLinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Show incoming links')
			.setDesc('Toggle whether to display backlinks in the graph.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showBacklinks)
				.onChange(async (value) => {
					this.plugin.settings.showBacklinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Skip image links')
			.setDesc('Toggle whether to exclude image files from the graph.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.skipImageLinks)
				.onChange(async (value) => {
					this.plugin.settings.skipImageLinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Initial zoom')
			.setDesc('Set the initial zoom scale for the inline graph (default: 1.0).')
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

		// ── Node Style ──
		containerEl.createEl('h6', { text: 'Node Style' });

		new Setting(containerEl)
			.setName('Node shape')
			.setDesc('Set the shape of graph nodes.')
			.addDropdown(dropdown => dropdown
				.addOptions({
					ellipse: 'Ellipse',
					box: 'Box',
					circle: 'Circle',
					dot: 'Dot',
					text: 'Text only'
				})
				.setValue(this.plugin.settings.nodeShape)
				.onChange(async (value) => {
					this.plugin.settings.nodeShape = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Node background color')
			.setDesc('Set the background color of graph nodes.')
			.addColorPicker(color => color
				.setValue(this.plugin.settings.nodeBgColor)
				.onChange(async (value) => {
					this.plugin.settings.nodeBgColor = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Node font size')
			.setDesc('Set the font size of node labels (default: 14).')
			.addSlider(slider => {
				slider
					.setLimits(8, 28, 1)
					.setValue(this.plugin.settings.nodeFontSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.nodeFontSize = value;
						await this.plugin.saveSettings();
						this.plugin.updateGraphs();
					});
			});

		new Setting(containerEl)
			.setName('Truncate labels')
			.setDesc('Shorten long node labels with ellipsis (...).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.truncateLabels)
				.onChange(async (value) => {
					this.plugin.settings.truncateLabels = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName('Max label length')
			.setDesc('Maximum characters before truncation (default: 20).')
			.addSlider(slider => {
				slider
					.setLimits(5, 50, 1)
					.setValue(this.plugin.settings.maxLabelLength)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLabelLength = value;
						await this.plugin.saveSettings();
						this.plugin.updateGraphs();
					});
			});
	}
}
