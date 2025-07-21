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

		// 활성 리프 변경 시 그래프 업데이트
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				// 활성 파일이 변경될 때 그래프를 즉시 렌더링/업데이트합니다.
				this.showInlineGraphInEditor();
			})
		);

		// MarkdownPostProcessor는 add/update 로직이 showGraphInEditor로 통합되면서 제거합니다.
	}

	showInlineGraphInEditor() {
		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
			// 현재 활성 뷰가 마크다운 뷰가 아니면 조용히 종료
			return;
		}

		const view = activeLeaf.view;
		// 읽기 모드(preview)일 때만 그래프를 추가/갱신합니다.
		if (view.getMode() !== 'preview') {
			return;
		}

		const previewView = view.contentEl.querySelector('.markdown-preview-view');
		if (!previewView) return; // 미리보기 DOM이 아직 준비되지 않음

		let graphContainer = previewView.querySelector('.inline-graph-container') as HTMLElement;

		// 그래프 컨테이너가 없으면 새로 생성하여 본문 하단에 추가합니다.
		if (!graphContainer) {
			graphContainer = document.createElement('div');
			graphContainer.className = 'inline-graph-container';
			graphContainer.style.marginTop = '2em';
			previewView.appendChild(graphContainer);
		}

		// 그래프를 렌더링합니다.
		this.graphView.renderTo(graphContainer);
	}

	updateGraphs() {
		// 모든 열린 마크다운 뷰에 대해 그래프를 업데이트합니다.
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
