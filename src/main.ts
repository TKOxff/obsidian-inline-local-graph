import { App, Plugin, debounce, MarkdownView } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { Notice } from 'obsidian';
import { InlineGraphSettingTab } from './InlineGraphSettingTab';

interface MyPluginSettings {
	mySetting: string;
    showArrows: boolean;
    nodeBgColor: string;
    showGraphBorder: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
    showArrows: true,
    nodeBgColor: '#888888',
    showGraphBorder: true,
}

export default class InlineGraphPlugin extends Plugin {
	settings: MyPluginSettings;
	private graphView: InlineGraphView;
	private observer: MutationObserver;

	async onload() {
		console.log('Loading Inline Graph Plugin');

		await this.loadSettings();
		this.graphView = new InlineGraphView(this.app, () => this.settings);

		// 모든 UI 변경을 안정적으로 감지하기 위해 MutationObserver를 사용합니다.
		const debouncedUpdate = debounce(() => {
			this.observer.disconnect(); // 루프 방지를 위해 감시 중단
			this.showInlineGraphInEditor();
			this.observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true }); // 감시 재시작
		}, 300);

		this.observer = new MutationObserver(debouncedUpdate);
		this.observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
		
		const ribbonIconEl = this.addRibbonIcon('dice', 'Toggle Inline local graph', async (evt: MouseEvent) => {
			console.log('Toggle Local Graph clicked');
			this.toggleInlineGraphInEditor();
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// 로컬 그래프 표시 커맨드만 남김
		this.addCommand({
			id: 'show-local-graph',
			name: 'Show Local Graph',
			callback: () => this.showInlineGraphInEditor()
		});

		// 설정 탭 추가
		this.addSettingTab(new InlineGraphSettingTab(this.app, this));
	}

	// .inline-graph-container div를 추가해 인라인그래프를 표시한다.
	showInlineGraphInEditor() {
		console.log("showInlineGraphInEditor Begin")

		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
			console.log("showInlineGraphInEditor - Not a markdown view")
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
		// 본문 그래프 컨테이너 제거
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const graphContainer = view.contentEl.querySelector('.inline-graph-container');
			if (graphContainer) graphContainer.remove();
		}
	}

	toggleInlineGraphInEditor() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const container = view.contentEl.querySelector('.inline-graph-container');
			if (container) {
				// 그래프가 이미 있으면 제거
				this.removeInlineGraphInEditor();
			} else {
				// 그래프가 없으면 표시
				this.showInlineGraphInEditor();
			}
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
		this.observer.disconnect(); // 감시자 정리
		// 플러그인 비활성화 시 모든 그래프 제거
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
