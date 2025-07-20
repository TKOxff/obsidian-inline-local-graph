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
}
