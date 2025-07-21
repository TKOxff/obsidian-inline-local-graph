import { App, Plugin, WorkspaceLeaf } from 'obsidian';
import { InlineGraphView } from './InlineGraphView';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class InlineGraphPlugin extends Plugin {
	settings: MyPluginSettings;
	private graphView: InlineGraphView;

	async onload() {
		console.log('Loading Inline Graph Plugin');
		await this.loadSettings();
		this.graphView = new InlineGraphView(this.app);

		const ribbonIconEl = this.addRibbonIcon('dice', 'Toggle Inline local graph', async (evt: MouseEvent) => {
			console.log('Toggle Local Graph clicked');
			if (this.graphView.isAttached()) {
				console.log('Detaching existing graph');
				this.graphView.detach();
			} else {
				console.log('Creating new graph');
				await this.graphView.show();
			}
		});
		ribbonIconEl.addClass('inline-graph-ribbon-class');

		// 로컬 그래프 표시 커맨드만 남김
		this.addCommand({
			id: 'show-local-graph',
			name: 'Show Local Graph',
			callback: () => this.graphView.show()
		});

		// 활성 리프 변경 시 그래프 업데이트
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.graphView.updateGraph();
			})
		);
	}

	onunload() {
		console.log('Unloading Inline Graph Plugin');
		this.graphView.detach();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
