import { PluginSettingTab, App, Setting } from 'obsidian';
import InlineGraphPlugin from './main';
import { t } from './i18n';

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
			containerEl.createEl('p', { text: t('settingsLoadError') });
			return;
		}

		// ── Graph ──
		containerEl.createEl('h6', { text: t('headingGraph') });

		new Setting(containerEl)
			.setName(t('showArrowsName'))
			.setDesc(t('showArrowsDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showArrows)
				.onChange(async (value) => {
					this.plugin.settings.showArrows = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('showBorderName'))
			.setDesc(t('showBorderDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showGraphBorder)
				.onChange(async (value) => {
					this.plugin.settings.showGraphBorder = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('showOutgoingName'))
			.setDesc(t('showOutgoingDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showLinks)
				.onChange(async (value) => {
					this.plugin.settings.showLinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('showIncomingName'))
			.setDesc(t('showIncomingDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showBacklinks)
				.onChange(async (value) => {
					this.plugin.settings.showBacklinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('skipImagesName'))
			.setDesc(t('skipImagesDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.skipImageLinks)
				.onChange(async (value) => {
					this.plugin.settings.skipImageLinks = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('initialZoomName'))
			.setDesc(t('initialZoomDesc'))
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
		containerEl.createEl('h6', { text: t('headingNodeStyle') });

		new Setting(containerEl)
			.setName(t('nodeShapeName'))
			.setDesc(t('nodeShapeDesc'))
			.addDropdown(dropdown => dropdown
				.addOptions({
					ellipse: t('shapeEllipse'),
					box: t('shapeBox'),
					circle: t('shapeCircle'),
					dot: t('shapeDot'),
					text: t('shapeTextOnly')
				})
				.setValue(this.plugin.settings.nodeShape)
				.onChange(async (value) => {
					this.plugin.settings.nodeShape = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('nodeBgColorName'))
			.setDesc(t('nodeBgColorDesc'))
			.addColorPicker(color => color
				.setValue(this.plugin.settings.nodeBgColor)
				.onChange(async (value) => {
					this.plugin.settings.nodeBgColor = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('nodeFontSizeName'))
			.setDesc(t('nodeFontSizeDesc'))
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
			.setName(t('truncateName'))
			.setDesc(t('truncateDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.truncateLabels)
				.onChange(async (value) => {
					this.plugin.settings.truncateLabels = value;
					await this.plugin.saveSettings();
					this.plugin.updateGraphs();
				}));

		new Setting(containerEl)
			.setName(t('maxLenName'))
			.setDesc(t('maxLenDesc'))
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

		new Setting(containerEl)
			.setName(t('maxLenCjkName'))
			.setDesc(t('maxLenCjkDesc'))
			.addSlider(slider => {
				slider
					.setLimits(3, 30, 1)
					.setValue(this.plugin.settings.maxLabelLengthCJK)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLabelLengthCJK = value;
						await this.plugin.saveSettings();
						this.plugin.updateGraphs();
					});
			});
	}
}
