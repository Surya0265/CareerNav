import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

export const MermaidChart = ({ chart }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;

      try {
        // Initialize mermaid with balanced scale
        await mermaid.initialize({ 
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          flowchart: { 
            useMaxWidth: true,
            htmlLabels: true,
            curve: "linear",
            padding: 25
          }
        });

        // Clear previous content
        containerRef.current.innerHTML = "";

        // Create a sanitized ID (only alphanumeric and hyphens, no dots or special patterns)
        const chartId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        
        // Render the chart using the full chart string with ID
        const { svg } = await mermaid.render(chartId, chart);
        
        // Create wrapper div
        const wrapper = document.createElement("div");
        wrapper.className = "flex justify-center";
        wrapper.innerHTML = svg;
        
        containerRef.current.appendChild(wrapper);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to render chart";
        setError(message);
        console.error("Mermaid render error:", err);
        // Retry once after a delay
        setTimeout(() => setKey(prev => prev + 1), 1000);
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
        minHeight: "620px",
        maxHeight: "calc(100vh - 280px)",
        overflow: "hidden"
      }}
    />
  );
};
