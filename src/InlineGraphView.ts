import { WorkspaceLeaf, Notice, TFile } from 'obsidian';

export class InlineGraphView {
    private leaf: WorkspaceLeaf | null = null;

    constructor(private app: any) {}

    async show() {
        try {
            if (!this.leaf) {
                new Notice('Creating Local Graph...');
                this.leaf = this.app.workspace.getRightLeaf(true);
                await this.leaf.setViewState({
                    type: 'localgraph',
                    state: {}
                });
                
                this.app.workspace.revealLeaf(this.leaf);
                await this.updateGraph();
                
                new Notice('Local Graph created successfully');
            }
        } catch (error) {
            console.error('Error showing local graph:', error);
            new Notice('Failed to create Local Graph: ' + error.message);
        }
    }

    async updateGraph() {
        if (this.leaf) {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                await this.leaf.setViewState({
                    type: 'localgraph',
                    state: {
                        file: activeFile.path,
                    }
                });
            }
        }
    }

    detach() {
        if (this.leaf) {
            this.leaf.detach();
            this.leaf = null;
        }
    }

    isAttached(): boolean {
        return this.leaf !== null;
    }

    // 새로운 메서드: 임의의 DOM 컨테이너에 그래프 렌더링
    renderTo(container: HTMLElement) {
        // 기존 내용 제거
        container.innerHTML = '';
        // 예시: 실제 그래프 라이브러리로 대체 가능
        const graphDiv = document.createElement('div');
        graphDiv.textContent = '그래프가 여기에 표시됩니다.';
        graphDiv.style.border = '1px solid #888';
        graphDiv.style.padding = '1em';
        graphDiv.style.marginTop = '1em';
        container.appendChild(graphDiv);
    }
}
