import { WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { Network } from 'vis-network/standalone';

export class InlineGraphView {
    private leaf: WorkspaceLeaf | null = null;

    constructor(private app: any, private getSettings: () => any) {}

    // New method: Render the graph into an arbitrary DOM container
    renderTo(container: HTMLElement) {
        container.innerHTML = '';
        const graphDiv = document.createElement('div');
        graphDiv.style.width = '100%';
        graphDiv.style.height = '500px'; // Explicit height for better visibility
        container.appendChild(graphDiv);

        // Current note info
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            graphDiv.textContent = 'No note found.';
            return;
        }
        const activeId = activeFile.basename;

        // Link info (outgoing)
        const links = this.app.metadataCache.resolvedLinks[activeFile.path] || {};
        const backlinks = this.app.metadataCache.getBacklinksForFile(activeFile);

        // Node/edge data generation
        const nodeSet = new Set<string>();
        const nodes = [{ id: activeId, label: activeId }];
        nodeSet.add(activeId);
        const edges = [];
        const idToPath: Record<string, string> = {};
        idToPath[activeId] = activeFile.path;

        // Outgoing links
        for (const target in links) {
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: targetName });
                nodeSet.add(targetName);
            }
            edges.push({ from: activeId, to: targetName });
            idToPath[targetName] = target;
        }

        // Incoming backlinks (conditionally render based on settings)
        if (this.getSettings().showBacklinks) {
            for (const source of backlinks.data.keys()) {
                const sourceName = source.split('/').pop()?.replace('.md', '') || source;
                if (!nodeSet.has(sourceName)) {
                    nodes.push({ id: sourceName, label: sourceName });
                    nodeSet.add(sourceName);
                }
                edges.push({ from: sourceName, to: activeId });
                idToPath[sourceName] = source;
            }
        }

        // Get plugin settings
        const showArrows = this.getSettings().showArrows ?? true;
        const nodeBgColor = this.getSettings().nodeBgColor ?? '#888888';
        console.log('showArrows:', showArrows);

        // Render the graph with vis-network
        const data = { nodes, edges };
        const options = {
            nodes: { shape: 'ellipse', color: nodeBgColor, font: { color: '#fff' } },
            edges: { 
                color: '#aaa', 
                arrows: {
                    to: { 
                        enabled: showArrows,
                        scaleFactor: 0.5 
                    }
                }
            },
            layout: { improvedLayout: true },
            physics: { enabled: true }
        };
        const network = new Network(graphDiv, data, options);

        // Open the corresponding md file when a node is clicked
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
