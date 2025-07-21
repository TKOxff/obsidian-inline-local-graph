import { WorkspaceLeaf, Notice, TFile } from 'obsidian';
// vis-network import 추가
import { Network } from 'vis-network/standalone';

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
        container.innerHTML = '';
        const graphDiv = document.createElement('div');
        graphDiv.style.width = '100%';
        graphDiv.style.height = '300px';
        container.appendChild(graphDiv);

        // 현재 노트 정보
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            graphDiv.textContent = '노트가 없습니다.';
            return;
        }
        const activeId = activeFile.basename;

        // 링크 정보
        const links = this.app.metadataCache.resolvedLinks[activeFile.path] || {};
        // 역링크 정보
        const backlinks = this.app.metadataCache.getBacklinksForFile(activeFile);

        // 노드/엣지 데이터 생성
        const nodeSet = new Set<string>();
        const nodes = [{ id: activeId, label: activeId }];
        nodeSet.add(activeId);
        const edges = [];

        // 링크(아웃고잉)
        for (const target in links) {
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: targetName });
                nodeSet.add(targetName);
            }
            edges.push({ from: activeId, to: targetName });
        }
        // 역링크(인커밍)
        for (const source in backlinks.data) {
            const sourceName = source.split('/').pop()?.replace('.md', '') || source;
            if (!nodeSet.has(sourceName)) {
                nodes.push({ id: sourceName, label: sourceName });
                nodeSet.add(sourceName);
            }
            edges.push({ from: sourceName, to: activeId });
        }

        // vis-network로 그래프 렌더링
        const data = { nodes, edges };
        const options = {
            nodes: { shape: 'ellipse', color: '#888', font: { color: '#fff' } },
            edges: { color: '#aaa', arrows: 'to' },
            layout: { improvedLayout: true },
            physics: { enabled: true }
        };
        new Network(graphDiv, data, options);
    }
}
