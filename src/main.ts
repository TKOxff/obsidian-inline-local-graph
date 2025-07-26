import { App, Plugin, debounce, MarkdownView } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { InlineGraphSettingTab } from './InlineGraphSettingTab';

interface MyPluginSettings {
	mySetting: string;
    showArrows: boolean;
    nodeBgColor: string;
    showGraphBorder: boolean;
    showBacklinks: boolean; // New option to toggle backlinks
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
    showArrows: true,
    nodeBgColor: '#888888',
    showGraphBorder: true,
    showBacklinks: true, // Default: show backlinks
}

// InlineGraph == InlineLocalGraph
export default class InlineGraphPlugin extends Plugin {
	settings: MyPluginSettings;
	private graphView: InlineGraphView;
	private observer: MutationObserver;
    isGraphVisible: boolean = true; // default: visible

	async onload() {
		console.log('Loading Inline Graph Plugin');

		await this.loadSettings();
		this.graphView = new InlineGraphView(this.app, () => this.settings);

		// Use MutationObserver to reliably detect all UI changes.
		const debouncedUpdate = debounce(() => {
			this.observer.disconnect(); // Stop observing to prevent infinite loop
			if (this.isGraphVisible) {
				this.showInlineGraphInEditor();
			} else {
				this.removeInlineGraphInEditor();
			}
			this.observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true }); // Resume observing
		}, 300);

		this.observer = new MutationObserver(debouncedUpdate);
		this.observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
		
		const ribbonIconEl = this.addRibbonIcon('waypoints', 'Toggle Inline local graph', () => {
			this.toggleInlineGraphInEditor();
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// Only the local graph display command remains
		this.addCommand({
			id: 'toggle-inline-local-graph',
			name: 'Toggle the graph',
			callback: () => this.toggleInlineGraphInEditor()
		});

		// Add settings tab
		this.addSettingTab(new InlineGraphSettingTab(this.app, this));
	}

	// Add .inline-graph-container div to show the inline graph
	showInlineGraphInEditor() {
		console.log("showInlineGraphInEditor Begin");

		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
			console.log("showInlineGraphInEditor - Not a markdown view");
			return; // Not a markdown view
		}
		const view = activeLeaf.view;

		let parentEl: Element | null = null;
		const mode = view.getMode();

		if (mode === 'preview') {
			parentEl = view.contentEl.querySelector('.markdown-preview-sizer');
		} else { // 'source' or 'live'
			parentEl = view.contentEl.querySelector('.cm-sizer');
		}

		if (!parentEl) {
			console.log("showInlineGraphInEditor Not found parentEl");
			return;
		}

		// Check if graph container already exists to avoid duplication
		let graphContainer = parentEl.querySelector('.inline-graph-container') as HTMLElement | null;
		if (!graphContainer) {
			graphContainer = document.createElement('div');
			graphContainer.className = 'inline-graph-container';
			parentEl.appendChild(graphContainer);
		}

		// Apply styles based on settings
		graphContainer.style.marginTop = '2em';
		if (this.settings.showGraphBorder) {
			graphContainer.style.border = '1px solid #888';
			graphContainer.style.padding = '1em';
		} else {
			graphContainer.style.border = 'none';
			graphContainer.style.padding = '0';
		}

		this.graphView.renderTo(graphContainer as HTMLElement);
	}

	removeInlineGraphInEditor() {
		// Remove the inline graph container from the note
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const graphContainer = view.contentEl.querySelector('.inline-graph-container');
			if (graphContainer) graphContainer.remove();
		}
	}

	toggleInlineGraphInEditor() {
		this.isGraphVisible = !this.isGraphVisible;
		if (this.isGraphVisible) {
			this.showInlineGraphInEditor();
		} else {
			this.removeInlineGraphInEditor();
		}
	}

	updateGraphs() {
		this.app.workspace.getLeavesOfType('markdown').forEach(leaf => {
			if (leaf.view instanceof MarkdownView) {
				const activeLeaf = this.app.workspace.activeLeaf;
				this.app.workspace.activeLeaf = leaf;
				this.showInlineGraphInEditor();
				this.app.workspace.activeLeaf = activeLeaf;
			}
		});
	}

	onunload() {
		console.log('Unloading Inline Graph Plugin');
		this.observer.disconnect();
		// Remove all graphs when the plugin is deactivated
		this.app.workspace.getLeavesOfType('markdown').forEach(leaf => {
			if (leaf.view instanceof MarkdownView) {
				const container = leaf.view.contentEl.querySelector('.inline-graph-container');
				if (container) {
					container.remove();
				}
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
