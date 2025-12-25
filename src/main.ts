import { Plugin, debounce, MarkdownView } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { InlineGraphSettingTab } from './InlineGraphSettingTab';

export interface InlineGraphSettings {
	mySetting: string;
	showArrows: boolean;
	nodeBgColor: string;
	showGraphBorder: boolean;
	showBacklinks: boolean; // Option to toggle backlinks
	skipImageLinks: boolean; // New option to toggle image link skipping
	zoomScale?: number;
}

const DEFAULT_SETTINGS: InlineGraphSettings = {
	mySetting: 'default',
	showArrows: true,
	nodeBgColor: '#888888',
	showGraphBorder: true,
	showBacklinks: true, // Default: show backlinks
	skipImageLinks: true, // Default: skip image links
	zoomScale: 1.0,
}

// InlineGraph == InlineLocalGraph
export default class InlineGraphPlugin extends Plugin {
	settings: InlineGraphSettings;
	private graphView: InlineGraphView;
	private observer: MutationObserver;
	isGraphVisible: boolean = true; // default: visible

	async onload() {
		console.debug('Loading Inline Graph Plugin');

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

		const ribbonIconEl = this.addRibbonIcon('waypoints', 'Toggle inline local graph', () => {
			this.toggleInlineGraphInEditor();
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// Only the local graph display command remains
		this.addCommand({
			id: 'toggle-inline-graph',
			name: 'Toggle the graph',
			callback: () => this.toggleInlineGraphInEditor()
		});

		// Add settings tab
		this.addSettingTab(new InlineGraphSettingTab(this.app, this));
	}

	// Add .inline-graph-container div to show the inline graph
	showInlineGraphInEditor(view?: MarkdownView | null) {
		console.debug("showInlineGraphInEditor Begin");

		if (!view) {
			view = this.app.workspace.getActiveViewOfType(MarkdownView);
		}

		if (!view) {
			console.debug("showInlineGraphInEditor - Not a markdown view");
			return; // Not a markdown view
		}

		let parentEl: Element | null = null;
		const mode = view.getMode();

		if (mode === 'preview') {
			parentEl = view.contentEl.querySelector('.markdown-preview-sizer');
		} else { // 'source' or 'live'
			parentEl = view.contentEl.querySelector('.cm-sizer');
		}

		if (!parentEl) {
			console.debug("showInlineGraphInEditor Not found parentEl");
			return;
		}

		// Check if graph container already exists to avoid duplication
		let graphContainer = parentEl.querySelector<HTMLElement>('.inline-graph-container');
		if (!graphContainer) {
			graphContainer = document.createElement('div');
			graphContainer.className = 'inline-graph-container';
			parentEl.appendChild(graphContainer);
		}

		// Apply styles based on settings
		if (this.settings.showGraphBorder) {
			graphContainer.classList.add('show-border');
			graphContainer.classList.remove('no-border');
		} else {
			graphContainer.classList.add('no-border');
			graphContainer.classList.remove('show-border');
		}

		if (graphContainer) this.graphView.renderTo(graphContainer);
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
				this.showInlineGraphInEditor(leaf.view);
			}
		});
	}

	onunload() {
		console.debug('Unloading Inline Graph Plugin');
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
