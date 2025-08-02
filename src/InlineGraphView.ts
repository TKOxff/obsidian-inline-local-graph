import { WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { Network } from 'vis-network/standalone';

export class InlineGraphView {
    private leaf: WorkspaceLeaf | null = null;

    constructor(private app: any, private getSettings: () => any) {}

    // New method: Render the graph into an arbitrary DOM container
    renderTo(container: HTMLElement) {
        // Remove all children safely (no innerHTML)
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Wrapper for graph and controls
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.position = 'relative';

        // Zoom control UI
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.justifyContent = 'flex-end';
        controlsDiv.style.gap = '8px';
        controlsDiv.style.marginBottom = '4px';
        controlsDiv.style.opacity = '0';
        controlsDiv.style.transition = 'opacity 0.2s';

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.textContent = '-';
        zoomOutBtn.title = 'Zoom Out';
        zoomOutBtn.style.width = '32px';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.textContent = '+';
        zoomInBtn.title = 'Zoom In';
        zoomInBtn.style.width = '32px';

        controlsDiv.appendChild(zoomOutBtn);
        controlsDiv.appendChild(zoomInBtn);

        const graphDiv = document.createElement('div');
        graphDiv.style.width = '100%';
        graphDiv.style.height = '500px';
        graphDiv.style.position = 'relative';

        // Hover logic: show controls only when mouse is over wrapperDiv
        wrapperDiv.onmouseenter = () => { controlsDiv.style.opacity = '1'; };
        wrapperDiv.onmouseleave = () => { controlsDiv.style.opacity = '0'; };

        wrapperDiv.appendChild(controlsDiv);
        wrapperDiv.appendChild(graphDiv);
        container.appendChild(wrapperDiv);

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
        const nodes = [{ id: activeId, label: activeId, font: { color: '#fff' } }]; // Main node with full opacity
        nodeSet.add(activeId);
        const edges = [];
        const idToPath: Record<string, string> = {};
        idToPath[activeId] = activeFile.path;

        // Outgoing links (conditionally skip image files)
        for (const target in links) {
            if (this.getSettings().skipImageLinks && /\.(png|jpg|jpeg|gif|svg)$/i.test(target)) {
                continue; // Skip image files if the setting is enabled
            }
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: targetName, font: { color: '#fff' } }); // Full opacity for outgoing nodes
                nodeSet.add(targetName);
            }
            edges.push({
                from: activeId,
                to: targetName,
                color: { opacity: 1.0 }, // Full opacity for outgoing links
            });
            idToPath[targetName] = target;
        }

        // Incoming backlinks (conditionally render based on settings)
        if (this.getSettings().showBacklinks) {
            for (const source of backlinks.data.keys()) {
                const sourceName = source.split('/').pop()?.replace('.md', '') || source;
                if (!nodeSet.has(sourceName)) {
                    nodes.push({ 
                        id: sourceName, 
                        label: sourceName, 
                        font: { color: 'rgba(255, 255, 255, 0.6)' } // Reduced opacity for backlink text
                    });
                    nodeSet.add(sourceName);
                }
                edges.push({
                    from: sourceName,
                    to: activeId,
                    color: { opacity: 0.3 }, // Reduced opacity for backlinks
                });
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
            physics: { enabled: true },
            interaction: { zoomView: false } // Disable mouse scroll zoom
        };
        const network = new Network(graphDiv, data, options);

        // Manual zoom control
        zoomInBtn.onclick = () => {
            const scale = network.getScale();
            network.moveTo({ scale: Math.min(scale * 1.2, 5) });
        };
        zoomOutBtn.onclick = () => {
            const scale = network.getScale();
            network.moveTo({ scale: Math.max(scale / 1.2, 0.2) });
        };

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
