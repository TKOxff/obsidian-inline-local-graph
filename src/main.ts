import { App, Plugin, WorkspaceLeaf } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { MarkdownView } from 'obsidian';
import { Notice } from 'obsidian';
import { InlineGraphSettingTab } from './InlineGraphSettingTab';

interface MyPluginSettings {
	mySetting: string;
    showArrows: boolean;
    nodeBgColor: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
    showArrows: true,
    nodeBgColor: '#888888'
}

export default class InlineGraphPlugin extends Plugin {
	settings: MyPluginSettings;
	private graphView: InlineGraphView;

	async onload() {
		console.log('Loading Inline Graph Plugin');

		await this.loadSettings();
		// 생성 시점에 getSettings 함수 전달
		this.graphView = new InlineGraphView(this.app, () => this.settings);

		// 다른 노트를 클릭할 때마다 그래프를 자동으로 표시/업데이트합니다.
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				// 뷰의 상태가 완전히 업데이트될 시간을 주기 위해 약간의 지연을 둡니다.
				setTimeout(() => {
					this.showInlineGraphInEditor();
				}, 100);
			})
		);

		// 모드 변경(편집/읽기 토글) 시에도 그래프를 다시 그리도록 합니다.
		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				// 뷰의 상태가 완전히 업데이트될 시간을 주기 위해 약간의 지연을 둡니다.
				setTimeout(() => {
					this.showInlineGraphInEditor();
				}, 100);
			})
		);

		const ribbonIconEl = this.addRibbonIcon('dice', 'Toggle Inline local graph', async (evt: MouseEvent) => {
			console.log('Toggle Local Graph clicked');
			this.showInlineGraphInEditor();
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
			return;
		}

		// Check if graph container already exists to avoid duplication
		let graphContainer = parentEl.querySelector('.inline-graph-container');
		if (!graphContainer) {
			graphContainer = document.createElement('div');
			graphContainer.className = 'inline-graph-container';
			graphContainer.style.marginTop = '2em';
			parentEl.appendChild(graphContainer);
		}

		this.graphView.renderTo(graphContainer as HTMLElement);
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
		// 본문 그래프 컨테이너 제거
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const graphContainer = view.contentEl.querySelector('.inline-graph-container');
			if (graphContainer) graphContainer.remove();
		}
		console.log('Unloading Inline Graph Plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
