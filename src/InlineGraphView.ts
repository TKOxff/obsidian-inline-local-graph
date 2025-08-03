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
        wrapperDiv.className = 'inline-graph-wrapper';

        // Controls container (zoom only, top row)
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'inline-graph-controls';

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'inline-graph-zoom-btn';
        zoomOutBtn.textContent = '-';
        zoomOutBtn.title = 'Zoom Out';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'inline-graph-zoom-btn';
        zoomInBtn.textContent = '+';
        zoomInBtn.title = 'Zoom In';

        controlsDiv.appendChild(zoomOutBtn);
        controlsDiv.appendChild(zoomInBtn);

        // Backlink switch (bottom row)
        const backlinkRowDiv = document.createElement('div');
        backlinkRowDiv.className = 'inline-graph-backlink-row';

        const switchLabel = document.createElement('label');
        switchLabel.className = 'inline-graph-switch-label';

        const labelText = document.createElement('span');
        labelText.textContent = 'backlinks';

        const switchSlider = document.createElement('span');
        switchSlider.className = 'inline-graph-switch-slider';
        // 상태에 따라 배경색/슬라이더 위치를 토글
        const updateSwitchUI = () => {
            if (this.getSettings().showBacklinks) {
                switchSlider.classList.add('active');
            } else {
                switchSlider.classList.remove('active');
            }
        };
        updateSwitchUI();

        switchSlider.onclick = () => {
            const settings = this.getSettings();
            settings.showBacklinks = !settings.showBacklinks;
            updateSwitchUI();
            this.renderTo(container);
        };

        switchLabel.appendChild(labelText);
        switchLabel.appendChild(switchSlider);
        backlinkRowDiv.appendChild(switchLabel);

        const graphDiv = document.createElement('div');
        graphDiv.className = 'inline-graph-vis';

        // Hover logic: show controls only when mouse is over wrapperDiv
        wrapperDiv.onmouseenter = () => {
            controlsDiv.classList.add('show');
            backlinkRowDiv.classList.add('show');
        };
        wrapperDiv.onmouseleave = () => {
            controlsDiv.classList.remove('show');
            backlinkRowDiv.classList.remove('show');
        };

        wrapperDiv.appendChild(controlsDiv);
        wrapperDiv.appendChild(backlinkRowDiv);
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
