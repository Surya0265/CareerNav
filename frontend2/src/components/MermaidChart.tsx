import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
  // optional callback to expose the chart container element for exporting
  onExportRef?: (el: HTMLDivElement | null) => void;
}

export const MermaidChart = ({ chart, onExportRef }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const lastChartRef = useRef<string>("");
  const mermaidInitialized = useRef(false);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart || isRendering) return;
      
      // Avoid re-rendering the same chart
      if (lastChartRef.current === chart) return;
      
      setIsRendering(true);
      try {
        // Initialize mermaid only once with larger scale for bigger nodes
        if (!mermaidInitialized.current) {
          await mermaid.initialize({ 
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
              themeVariables: {
                  // Increase base font size to match inline HTML labels
                  fontSize: "150px",
                },
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: "linear",
                // Much larger padding/spacing to accommodate very large nodes
                padding: 200,
                nodeSpacing: 350,
                rankSpacing: 380,
                diagramPadding: 200,
              }
          });
          mermaidInitialized.current = true;
        }

  // Clear previous content
  containerRef.current.innerHTML = "";

        // Create a sanitized ID (only alphanumeric and hyphens, no dots or special patterns)
        const chartId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        // Render the chart using the full chart string with ID
        const { svg } = await mermaid.render(chartId, chart);
        // Directly set the SVG as the container's innerHTML (no wrapper div)
        containerRef.current.innerHTML = svg;

        // Post-process SVG: add a defs/marker for arrowheads sized to work with thick strokes
        try {
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            const existing = svgEl.querySelector('#custom-arrowhead');
            if (!existing) {
              const svgns = 'http://www.w3.org/2000/svg';
              const defs = document.createElementNS(svgns, 'defs');
              const marker = document.createElementNS(svgns, 'marker');
              marker.setAttribute('id', 'custom-arrowhead');
              // Larger viewBox and marker sizes to scale with thick strokes
              marker.setAttribute('viewBox', '0 0 20 20');
              marker.setAttribute('refX', '16');
              marker.setAttribute('refY', '10');
              // Use userSpaceOnUse so marker scales independently and stays visible
              marker.setAttribute('markerUnits', 'userSpaceOnUse');
              marker.setAttribute('markerWidth', '40');
              marker.setAttribute('markerHeight', '40');
              marker.setAttribute('orient', 'auto');
              const path = document.createElementNS(svgns, 'path');
              // white filled triangular arrowhead scaled to the larger marker
              path.setAttribute('d', 'M 0 0 L 30 15 L 0 30 z');
              path.setAttribute('fill', '#ffffff');
              // add a small white stroke to ensure visibility against no-link-stroke backgrounds
              path.setAttribute('stroke', '#ffffff');
              path.setAttribute('stroke-width', '0.5');
              marker.appendChild(path);
              defs.appendChild(marker);
              svgEl.insertBefore(defs, svgEl.firstChild);

              // Apply marker-end to Mermaid edge paths (cover common selectors)
              const edgeSelectors = [
                '.edgePath path',
                '.link path',
                'path.edge',
                'g.edge path',
                'g.edgePaths path',
                'g[class^="edge"] path'
              ];
              // Collect edge paths and leave them in their existing DOM order (so lines stay behind nodes).
              const collectedEdges: SVGPathElement[] = [];
              edgeSelectors.forEach((sel) => {
                const edgePaths = svgEl.querySelectorAll(sel);
                edgePaths.forEach((p) => {
                  try {
                    const el = p as SVGPathElement;
                    // ensure edge stroke is visible (kept behind nodes)
                    if (!el.getAttribute('stroke') || el.getAttribute('stroke') === 'none') {
                      el.setAttribute('stroke', '#ffffff');
                      el.setAttribute('stroke-width', '40');
                    }
                    collectedEdges.push(el);
                  } catch (err) {
                    // ignore
                  }
                });
              });

              // Create (or reuse) a top-level group for arrowheads so they render above nodes
              let topGroup = svgEl.querySelector('#arrowheads-top') as SVGGElement | null;
              if (!topGroup) {
                topGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                topGroup.setAttribute('id', 'arrowheads-top');
                svgEl.appendChild(topGroup);
              } else {
                // clear previous arrowheads
                while (topGroup.firstChild) topGroup.removeChild(topGroup.firstChild);
              }

              // Draw a triangle arrowhead at the end point of each collected edge path
              collectedEdges.forEach((edgePath) => {
                try {
                  const total = (edgePath as any).getTotalLength();
                  if (!total || isNaN(total) || total <= 0) return;
                  const pt = (edgePath as any).getPointAtLength(total);
                  const before = (edgePath as any).getPointAtLength(Math.max(0, total - 8));
                  const angle = Math.atan2(pt.y - before.y, pt.x - before.x) * (180 / Math.PI);

                  const arrowSize = 24; // in SVG units, adjust for your scale
                  const svgns = 'http://www.w3.org/2000/svg';
                  const arrow = document.createElementNS(svgns, 'path');
                  // triangle pointing right at origin; we'll transform to endpoint and rotate
                  const d = `M 0 0 L ${-arrowSize} ${-arrowSize / 2} L ${-arrowSize} ${arrowSize / 2} z`;
                  arrow.setAttribute('d', d);
                  arrow.setAttribute('fill', '#ffffff');
                  arrow.setAttribute('stroke', 'none');
                  arrow.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`);
                  arrow.setAttribute('pointer-events', 'none');
                  topGroup!.appendChild(arrow);
                } catch (err) {
                  // ignore per-path errors
                }
              });
            }
          }
        } catch (e) {
          // non-fatal
          // console.warn('SVG postprocessing failed', e);
        }

        // expose the container to parent for export/download actions
        if (onExportRef) onExportRef(containerRef.current);
        setError(null);
        lastChartRef.current = chart;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to render chart";
        setError(message);
        console.error("Mermaid render error:", err);
        // Retry once after a delay
        setTimeout(() => setKey(prev => prev + 1), 1000);
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [chart, key]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-950/50 border border-red-800 p-4 text-sm text-red-200">
        <p className="font-semibold">Chart Rendering Error</p>
        <p className="text-xs mt-1">{error}</p>
        <button 
          onClick={() => setKey(prev => prev + 1)}
          className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
        >
          Retry
        </button>
        <details className="mt-2 text-xs">
          <summary>Show code</summary>
          <pre className="mt-1 bg-red-950 p-2 rounded overflow-auto text-xs">{chart}</pre>
        </details>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center w-full bg-slate-950"
      style={{ 
        minHeight: "900px",
        maxHeight: "calc(100vh - 100px)",
        overflow: "auto"
      }}
    />
  );
};
