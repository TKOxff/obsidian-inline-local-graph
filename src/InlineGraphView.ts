import { WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { Network } from 'vis-network/standalone';

export class InlineGraphView {
    private leaf: WorkspaceLeaf | null = null;

    constructor(private app: any, private getSettings: () => any) {}

    private createZoomControls(networkRef: { current: Network | null }, container: HTMLElement): HTMLDivElement {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'inline-graph-controls';

        // Title (leftmost, semi-transparent)
        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'Inline local graph';
        titleSpan.className = 'inline-graph-title';
        controlsDiv.appendChild(titleSpan);

        // Refresh button (유니코드 리프레시 기호)
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'inline-graph-refresh-btn';
        refreshBtn.title = 'Refresh inline graph';
        refreshBtn.textContent = '⟳';
        refreshBtn.onclick = () => {
            this.renderTo(container);
        };
        controlsDiv.appendChild(refreshBtn);

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'inline-graph-zoom-btn';
        zoomOutBtn.textContent = '-';
        zoomOutBtn.title = 'Zoom Out';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'inline-graph-zoom-btn';
        zoomInBtn.textContent = '+';
        zoomInBtn.title = 'Zoom In';

        const getNodeDistance = (scale: number) => Math.max(1, 80 / scale);
        const getSpringLength = (scale: number) => Math.max(1, 80 / scale);

        zoomInBtn.onclick = async () => {
            if (networkRef.current) {
                const scale = networkRef.current.getScale();
                const newScale = Math.min(scale * 1.2, 5);
                this.getSettings().zoomScale = newScale;

                networkRef.current.moveTo({ scale: newScale });
                networkRef.current.setOptions({
                    physics: {
                        enabled: true, // physics 활성화(unstabilized)
                        repulsion: {
                            nodeDistance: getNodeDistance(newScale),
                            springLength: getSpringLength(newScale)
                        }
                    }
                });
                // networkRef.current.stabilize();

                if (typeof this.app.plugins?.plugins?.["inline-local-graph"]?.saveSettings === "function") {
                    await this.app.plugins.plugins["inline-local-graph"].saveSettings();
                }
            }
        };
        zoomOutBtn.onclick = async () => {
            if (networkRef.current) {
                const scale = networkRef.current.getScale();
                const newScale = Math.max(scale / 1.2, 0.2);
                this.getSettings().zoomScale = newScale;

                networkRef.current.moveTo({ scale: newScale });
                networkRef.current.setOptions({
                    physics: {
                        enabled: true, // physics 활성화(unstabilized)
                        repulsion: {
                            nodeDistance: getNodeDistance(newScale),
                            springLength: getSpringLength(newScale)
                        }
                    }
                });
                // networkRef.current.stabilize();

                if (typeof this.app.plugins?.plugins?.["inline-local-graph"]?.saveSettings === "function") {
                    await this.app.plugins.plugins["inline-local-graph"].saveSettings();
                }
            }
        };

        controlsDiv.appendChild(zoomOutBtn);
        controlsDiv.appendChild(zoomInBtn);

        return controlsDiv;
    }

    private createBacklinkSwitch(container: HTMLElement): HTMLDivElement {
        const backlinkRowDiv = document.createElement('div');
        backlinkRowDiv.className = 'inline-graph-backlink-row';

        const switchLabel = document.createElement('label');
        switchLabel.className = 'inline-graph-switch-label';

        const labelText = document.createElement('span');
        labelText.textContent = 'backlinks';

        const switchSlider = document.createElement('span');
        switchSlider.className = 'inline-graph-switch-slider';

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

        return backlinkRowDiv;
    }

    private renderGraph(graphDiv: HTMLElement, networkRef: { current: Network | null }) {
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
        const nodes = [{ id: activeId, label: activeId, font: { color: '#fff' } }];
        nodeSet.add(activeId);
        const edges = [];
        const idToPath: Record<string, string> = {};
        idToPath[activeId] = activeFile.path;

        // Outgoing links (conditionally skip image files)
        for (const target in links) {
            if (this.getSettings().skipImageLinks && /\.(png|jpg|jpeg|gif|svg)$/i.test(target)) {
                continue;
            }
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: targetName, font: { color: '#fff' } });
                nodeSet.add(targetName);
            }
            edges.push({
                from: activeId,
                to: targetName,
                color: { opacity: 1.0 },
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
                        font: { color: 'rgba(255, 255, 255, 0.6)' }
                    });
                    nodeSet.add(sourceName);
                }
                edges.push({
                    from: sourceName,
                    to: activeId,
                    color: { opacity: 0.3 },
                });
                idToPath[sourceName] = source;
            }
        }

        // Get plugin settings
        const showArrows = this.getSettings().showArrows ?? true;
        const nodeBgColor = this.getSettings().nodeBgColor ?? '#888888';

        // 줌스케일에 따라 노드 간 거리 계산
        const zoomScale = this.getSettings().zoomScale ?? 1.0;
        const getNodeDistance = (scale: number) => Math.max(1, 80 / scale);
        const getSpringLength = (scale: number) => Math.max(1, 80 / scale);

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
            physics: {
                enabled: true,
                stabilization: { enabled: true, iterations: 100 },
                solver: 'repulsion',
                repulsion: {
                    nodeDistance: getNodeDistance(zoomScale),
                    springLength: getSpringLength(zoomScale),
                    springConstant: 0.05,
                    damping: 0.3
                },
                minVelocity: 0.75
            },
            interaction: { zoomView: false }
        };
        const network = new Network(graphDiv, data, options);
        networkRef.current = network;

        network.moveTo({ scale: zoomScale });
        network.once('afterDrawing', () => {
            network.moveTo({ scale: zoomScale });
        });

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

    renderTo(container: HTMLElement) {
        // Remove all children safely (no innerHTML)
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Wrapper for graph and controls
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'inline-graph-wrapper';

        // Prepare a reference object for the network instance
        const networkRef = { current: null as Network | null };

        // Controls container (zoom only, top row)
        const controlsDiv = this.createZoomControls(networkRef, container);

        // Backlink switch (bottom row)
        const backlinkRowDiv = this.createBacklinkSwitch(container);

        // Graph container
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

        // 실제 그래프 렌더링
        this.renderGraph(graphDiv, networkRef);
    }
}
