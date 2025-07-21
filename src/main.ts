import { App, Plugin, WorkspaceLeaf } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';
import { MarkdownView } from 'obsidian';
import { Notice } from 'obsidian';
import { PluginSettingTab } from 'obsidian';
import { Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
    showArrows: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
    showArrows: true
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
			this.showGraphInEditor();
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// 로컬 그래프 표시 커맨드만 남김
		this.addCommand({
			id: 'show-local-graph',
			name: 'Show Local Graph',
			callback: () => this.showGraphInEditor()
		});

		// 활성 리프 변경 시 그래프 업데이트
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.showGraphInEditor();
			})
		);

		this.registerMarkdownPostProcessor((el, ctx) => {
			// 이미 그래프 컨테이너가 있으면 중복 삽입 방지
			if (el.querySelector('.inline-graph-container')) return;

			// 본문 마지막에 그래프 컨테이너 추가
			const graphContainer = document.createElement('div');
			graphContainer.className = 'inline-graph-container';
			graphContainer.style.marginTop = '2em';
			el.appendChild(graphContainer);

			this.graphView.renderTo(graphContainer);
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	// 노트 본문 하단에 그래프 표시
	showGraphInEditor() {
		new Notice('Trying to show graph in editor');

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('마크다운 뷰가 활성화되어 있지 않습니다.');
			return;
		}
		new Notice('view is Valid');

		// 읽기 모드(프리뷰) 본문 내부를 찾음
		const previewSection = view.contentEl.querySelector('.markdown-preview-section') as HTMLElement | null;
		let graphContainer: HTMLElement | null = null;

		if (previewSection) {
			graphContainer = previewSection.querySelector('.inline-graph-container') as HTMLElement | null;
			if (!graphContainer) {
				graphContainer = document.createElement('div');
				graphContainer.className = 'inline-graph-container';
				graphContainer.style.marginTop = '2em';
				previewSection.appendChild(graphContainer);
				console.log('Graph container created in preview section');
			} else {
				console.log('Graph container already exists in preview section');
			}
		} else {
			// fallback: 기존 방식
			graphContainer = view.contentEl.querySelector('.inline-graph-container') as HTMLElement | null;
			if (!graphContainer) {
				graphContainer = document.createElement('div');
				graphContainer.className = 'inline-graph-container';
				graphContainer.style.marginTop = '2em';
				view.contentEl.appendChild(graphContainer);
				console.log('Graph container created in contentEl');
			} else {
				console.log('Graph container already exists in contentEl');
			}
		}

		this.graphView.renderTo(graphContainer as HTMLElement);
		console.log('renderTo called')
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
	}
}
