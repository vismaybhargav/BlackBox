import { useLayoutEffect, useMemo, useRef, useState } from "react";
import UplotReact from "uplot-react";

// Small helper to avoid calling setSize too frequently while dragging panes
function rafThrottle<T extends (...args: any[]) => void>(fn: T): T {
  let raf = 0;
  let lastArgs: any[] | null = null;

  const wrapped = ((...args: any[]) => {
    lastArgs = args;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      fn(...(lastArgs as any[]));
      lastArgs = null;
    });
  }) as T;

  return wrapped;
}

export default function ResponsivePlot(
  { options, data }: { options: uPlot.Options, data: uPlot.AlignedData }
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const uplotRef = useRef<uPlot>(null);
    const [plotSize, setPlotSize] = useState(() => ({
        width: options.width ?? 800,
        height: options.height ?? 600,
    }));

    const mountedOptions = useMemo<uPlot.Options>(() => ({
        ...options,
        width: plotSize.width,
        height: plotSize.height,
    }), [options, plotSize.height, plotSize.width]);

    const plotKey = useMemo(() => JSON.stringify({
        series: options.series?.map((series) => ({
            label: series.label,
            scale: series.scale,
            show: series.show,
        })),
        axes: options.axes?.map((axis) => axis.label ?? axis.scale ?? null),
        dataLength: data.length,
    }), [data.length, options.axes, options.series]);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const resizeToContainer = rafThrottle(() => {
            const plot = uplotRef.current;
            if (!plot) return;

            const rect = el.getBoundingClientRect();
            const w = Math.max(0, Math.floor(rect.width));
            const h = Math.max(0, Math.floor(rect.height));

            if (w === plot.width && h - 50 === plot.height) return;
             
            setPlotSize((currentSize) => {
                const nextSize = { width: w, height: Math.max(0, h - 50) };

                if (
                    currentSize.width === nextSize.width &&
                    currentSize.height === nextSize.height
                ) {
                    return currentSize;
                }

                plot.setSize(nextSize);
                return nextSize;
            });
        });

        resizeToContainer();

        const ro = new ResizeObserver(() => resizeToContainer());
        ro.observe(el);

        window.addEventListener("resize", resizeToContainer);

        return () => {
            window.removeEventListener("resize", resizeToContainer);
            ro.disconnect();
        }
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-0">
            <UplotReact 
                key={plotKey}
                options={mountedOptions} 
                data={data}
                onCreate={(plot) => {
                    uplotRef.current = plot;
                    const el = containerRef.current;
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const nextSize = {
                            width: Math.floor(rect.width),
                            height: Math.max(0, Math.floor(rect.height) - 50),
                        };
                        setPlotSize(nextSize);
                        plot.setSize(nextSize);
                    }
                }}
                onDelete={() => {
                    uplotRef.current = null;
                }}
            />
        </div>
    ); 
}
