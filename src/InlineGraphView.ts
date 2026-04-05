import { App, TFile } from 'obsidian';
import { InlineGraphSettings } from "./main";
import { Network } from 'vis-network/standalone';

export class InlineGraphView {
    constructor(private app: App, private getSettings: () => InlineGraphSettings, private saveSettings: () => Promise<void>) { }

    private static getNodeDistance(scale: number) { return Math.max(1, 80 / scale); }
    private static getSpringLength(scale: number) { return Math.max(1, 80 / scale); }
    private static truncateLabel(label: string, max: number) { return label.length > max ? label.slice(0, max) + '...' : label; }

    private createZoomControls(networkRef: { current: Network | null }, container: HTMLElement): HTMLDivElement {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'inline-graph-controls';

        // Links toggle
        const linksLabel = document.createElement('label');
        linksLabel.className = 'inline-graph-switch-label';

        const linksText = document.createElement('span');
        linksText.textContent = 'Outgoing';

        const linksSlider = document.createElement('span');
        linksSlider.className = 'inline-graph-switch-slider';

        const updateLinksUI = () => {
            if (this.getSettings().showLinks) {
                linksSlider.classList.add('active');
            } else {
                linksSlider.classList.remove('active');
            }
        };
        updateLinksUI();

        linksSlider.onclick = () => {
            const settings = this.getSettings();
            settings.showLinks = !settings.showLinks;
            updateLinksUI();
            this.renderTo(container);
        };

        linksLabel.appendChild(linksText);
        linksLabel.appendChild(linksSlider);
        controlsDiv.appendChild(linksLabel);

        // Backlinks toggle
        const backlinksLabel = document.createElement('label');
        backlinksLabel.className = 'inline-graph-switch-label';

        const backlinksText = document.createElement('span');
        backlinksText.textContent = 'Incoming';

        const backlinksSlider = document.createElement('span');
        backlinksSlider.className = 'inline-graph-switch-slider';

        const updateBacklinksUI = () => {
            if (this.getSettings().showBacklinks) {
                backlinksSlider.classList.add('active');
            } else {
                backlinksSlider.classList.remove('active');
            }
        };
        updateBacklinksUI();

        backlinksSlider.onclick = () => {
            const settings = this.getSettings();
            settings.showBacklinks = !settings.showBacklinks;
            updateBacklinksUI();
            this.renderTo(container);
        };

        backlinksLabel.appendChild(backlinksText);
        backlinksLabel.appendChild(backlinksSlider);
        controlsDiv.appendChild(backlinksLabel);

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'inline-graph-zoom-btn';
        zoomOutBtn.style.marginLeft = '8px';
        zoomOutBtn.textContent = '-';
        zoomOutBtn.title = 'Zoom out';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'inline-graph-zoom-btn';
        zoomInBtn.textContent = '+';
        zoomInBtn.title = 'Zoom in';

        zoomInBtn.onclick = async () => {
            if (networkRef.current) {
                const scale = networkRef.current.getScale();
                const newScale = Math.min(scale * 1.2, 5);
                this.getSettings().zoomScale = newScale;

                networkRef.current.moveTo({ scale: newScale });
                networkRef.current.setOptions({
                    physics: {
                        enabled: true,
                        repulsion: {
                            nodeDistance: InlineGraphView.getNodeDistance(newScale),
                            springLength: InlineGraphView.getSpringLength(newScale)
                        }
                    }
                });

                await this.saveSettings();
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
                        enabled: true,
                        repulsion: {
                            nodeDistance: InlineGraphView.getNodeDistance(newScale),
                            springLength: InlineGraphView.getSpringLength(newScale)
                        }
                    }
                });

                await this.saveSettings();
            }
        };

        controlsDiv.appendChild(zoomOutBtn);
        controlsDiv.appendChild(zoomInBtn);

        return controlsDiv;
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
        const backlinks = (this.app.metadataCache as unknown as {
            getBacklinksForFile(file: TFile): { data: Map<string, unknown> }
        }).getBacklinksForFile(activeFile);

        // Get plugin settings
        const settings = this.getSettings();
        const truncate = settings.truncateLabels ?? true;
        const maxLen = settings.maxLabelLength ?? 20;
        const toLabel = (name: string) => truncate ? InlineGraphView.truncateLabel(name, maxLen) : name;
        const nodeFontSize = settings.nodeFontSize ?? 14;
        const nodeShape = settings.nodeShape ?? 'ellipse';
        const showArrows = settings.showArrows ?? true;
        const nodeBgColor = settings.nodeBgColor ?? '#888888';
        const zoomScale = settings.zoomScale ?? 1.0;

        // Node/edge data generation
        const nodeSet = new Set<string>();
        const nodes = [{ id: activeId, label: toLabel(activeId), font: { color: '#fff' } }];
        nodeSet.add(activeId);
        const edges = [];
        const idToPath: Record<string, string> = {};
        idToPath[activeId] = activeFile.path;

        // Outgoing links (conditionally render based on settings)
        if (settings.showLinks) for (const target in links) {
            if (settings.skipImageLinks && /\.(png|jpg|jpeg|gif|svg)$/i.test(target)) {
                continue;
            }
            const targetName = target.split('/').pop()?.replace('.md', '') || target;
            if (!nodeSet.has(targetName)) {
                nodes.push({ id: targetName, label: toLabel(targetName), font: { color: '#fff' } });
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
        if (settings.showBacklinks) {
            for (const source of backlinks.data.keys()) {
                const sourceName = source.split('/').pop()?.replace('.md', '') || source;
                if (!nodeSet.has(sourceName)) {
                    nodes.push({
                        id: sourceName,
                        label: toLabel(sourceName),
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

        const data = { nodes, edges };
        const options = {
            nodes: { shape: nodeShape, size: 5, color: nodeBgColor, font: { color: '#fff', size: nodeFontSize } },
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
                stabilization: { enabled: true, iterations: 200 },
                solver: 'repulsion',
                repulsion: {
                    nodeDistance: InlineGraphView.getNodeDistance(zoomScale),
                    springLength: InlineGraphView.getSpringLength(zoomScale),
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
                const activeFile = this.app.workspace.getActiveFile();
                const filePath = idToPath[nodeId];
                if (filePath && activeFile) {
                    void this.app.workspace.openLinkText(filePath, activeFile.path, false);
                }
            }
        });
    }

    renderTo(container: HTMLElement) {
        // Remove all children safely
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

        // Graph container
        const graphDiv = document.createElement('div');
        graphDiv.className = 'inline-graph-vis';

        // Hover logic: show controls only when mouse is over wrapperDiv
        wrapperDiv.onmouseenter = () => {
            controlsDiv.classList.add('show');
        };
        wrapperDiv.onmouseleave = () => {
            controlsDiv.classList.remove('show');
        };

        wrapperDiv.appendChild(controlsDiv);
        wrapperDiv.appendChild(graphDiv);
        container.appendChild(wrapperDiv);

        // Actual graph rendering
        this.renderGraph(graphDiv, networkRef);
    }
}
