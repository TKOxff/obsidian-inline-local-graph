import { WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { Network } from 'vis-network/standalone';

export class InlineGraphView {
    private leaf: WorkspaceLeaf | null = null;

    constructor(private app: any, private getSettings: () => any) {}

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
        // id와 파일 경로 매핑
        const idToPath: Record<string, string> = {};
        idToPath[activeId] = activeFile.path;

        // 링크(아웃고잉)
        for (const target in links) {
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: targetName });
                nodeSet.add(targetName);
            }
            edges.push({ from: activeId, to: targetName });
            idToPath[targetName] = target;
        }
        // 역링크(인커밍)
        for (const source in backlinks.data) {
            const sourceName = source.split('/').pop()?.replace('.md', '') || source;
            if (!nodeSet.has(sourceName)) {
                nodes.push({ id: sourceName, label: sourceName });
                nodeSet.add(sourceName);
            }
            edges.push({ from: sourceName, to: activeId });
            idToPath[sourceName] = source;
        }

        // 플러그인 설정에서 showArrows 값 가져오기
        const showArrows = this.getSettings().showArrows ?? true;
        const nodeBgColor = this.getSettings().nodeBgColor ?? '#888888';
        console.log('showArrows:', showArrows);

        // vis-network로 그래프 렌더링
        const data = { nodes, edges };
        const options = {
            nodes: { shape: 'ellipse', color: nodeBgColor, font: { color: '#fff' } },
            edges: { color: '#aaa', arrows: showArrows ? { to: { enabled: true } } : { to: { enabled: false } } },
            layout: { improvedLayout: true },
            physics: { enabled: true }
        };
        const network = new Network(graphDiv, data, options);

        // 노드 클릭 시 해당 md 파일로 이동
        network.on('click', (params) => {
            if (params.nodes && params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const filePath = idToPath[nodeId];
                if (filePath) {
                    this.app.workspace.openLinkText(filePath, '', false);
                }
            }
        });
    }
}
