import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class InlineGraphPlugin extends Plugin {
	settings: MyPluginSettings;
	private localGraph: WorkspaceLeaf | null = null;

	async onload() {
        console.log('Loading Inline Graph Plugin');

		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('dice', 'Toggle Local Graph', async (evt: MouseEvent) => {
			console.log('Toggle Local Graph clicked');
			if (this.localGraph) {
				console.log('Detaching existing graph');
				this.localGraph.detach();
				this.localGraph = null;
			} else {
				console.log('Creating new graph');
				await this.showLocalGraph();
			}
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		 // Add command to show local graph
		this.addCommand({
			id: 'show-local-graph',
			name: 'Show Local Graph',
			callback: () => this.showLocalGraph()
		});

		// Add event listener for active leaf change
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.updateLocalGraph();
			})
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async showLocalGraph() {
		try {
			if (!this.localGraph) {
				new Notice('Creating Local Graph...');
				this.localGraph = this.app.workspace.getRightLeaf(true);
				await this.localGraph.setViewState({
					type: 'localgraph',
					state: {}
				});
				
				this.app.workspace.revealLeaf(this.localGraph);
				await this.updateLocalGraph();
				
				new Notice('Local Graph created successfully');
			}
		} catch (error) {
			console.error('Error showing local graph:', error);
			new Notice('Failed to create Local Graph: ' + error.message);
		}
	}

	async updateLocalGraph() {
		if (this.localGraph) {
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				await this.localGraph.setViewState({
					type: 'localgraph',
					state: {
						file: activeFile.path,
					}
				});
			}
		}
	}

	onunload() {
        console.log('Unloading Inline Graph Plugin');
		if (this.localGraph) {
			this.localGraph.detach();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: InlineGraphPlugin;

	constructor(app: App, plugin: InlineGraphPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
