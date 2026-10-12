import { Plugin, debounce, MarkdownView } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { InlineGraphSettingTab } from './InlineGraphSettingTab';

export type GraphPosition = 'top' | 'bottom';

export interface InlineGraphSettings {
	graphPosition: GraphPosition;
	showArrows: boolean;
	nodeBgColor: string;
	showGraphBorder: boolean;
	showLinks: boolean;
	showBacklinks: boolean;
	skipImageLinks: boolean;
	zoomScale?: number;
	truncateLabels: boolean;
	maxLabelLength: number;
	maxLabelLengthCJK: number;
	maxNodes: number;
	nodeFontSize: number;
	nodeShape: string;
}

const DEFAULT_SETTINGS: InlineGraphSettings = {
	graphPosition: 'bottom',
	showArrows: true,
	nodeBgColor: '#888888',
	showGraphBorder: false,
	showLinks: true,
	showBacklinks: true,
	skipImageLinks: true,
	zoomScale: 1.0,
	truncateLabels: true,
	maxLabelLength: 20,
	maxLabelLengthCJK: 10,
	maxNodes: 30,
	nodeFontSize: 14,
	nodeShape: 'box',
}

// InlineGraph == InlineLocalGraph
export default class InlineGraphPlugin extends Plugin {
	settings: InlineGraphSettings;
	private graphView: InlineGraphView;
	private observer: MutationObserver;
	isGraphVisible: boolean = true; // default: visible

	async onload() {

		await this.loadSettings();
		this.graphView = new InlineGraphView(this.app, () => this.settings, () => this.saveSettings());

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
			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					if (!checking) {
						this.toggleInlineGraphInEditor();
					}
					return true;
				}
				return false;
			}
		});

		// Add settings tab
		this.addSettingTab(new InlineGraphSettingTab(this.app, this));
	}

	showInlineGraphInEditor(view?: MarkdownView | null) {
		if (!view) {
			view = this.app.workspace.getActiveViewOfType(MarkdownView);
		}

		if (!view) {
			return;
		}

		const isTop = this.settings.graphPosition === 'top';
		let scopeEl: Element | null; // where an existing container may be found
		let parentEl: Element | null;
		let anchorEl: Element | null = null; // top only: the container goes right before this

		if (view.getMode() === 'preview') {
			const sizerEl = view.contentEl.querySelector('.markdown-preview-sizer');
			scopeEl = sizerEl?.parentElement ?? null;
			// The reading view virtualizes the sizer's children (the title header included),
			// so a top graph lives outside the sizer to keep its place while scrolling.
			parentEl = isTop ? scopeEl : sizerEl;
			anchorEl = isTop ? sizerEl : null;
		} else { // 'source' or 'live'
			scopeEl = parentEl = view.contentEl.querySelector('.cm-sizer');
		}

		if (!scopeEl || !parentEl) {
			return;
		}

		// Reuse the existing container to avoid duplication; it moves when the position changes
		let graphContainer = scopeEl.querySelector<HTMLElement>('.inline-graph-container');
		const isNew = !graphContainer;
		if (!graphContainer) {
			graphContainer = createDiv();
			graphContainer.className = 'inline-graph-container';
		}

		if (isTop) {
			// Obsidian re-prepends the inline title when a mode is shown, so check the order every time
			if (!anchorEl) anchorEl = Array.from(parentEl.children).find(el => el !== graphContainer) ?? null;
			if (graphContainer.parentElement !== parentEl || graphContainer.nextElementSibling !== anchorEl) {
				parentEl.insertBefore(graphContainer, anchorEl);
			}
		} else if (isNew || graphContainer.hasClass('is-top')) {
			parentEl.appendChild(graphContainer);
		}
		graphContainer.toggleClass('is-top', isTop);
		graphContainer.toggleClass('is-bottom', !isTop);

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
