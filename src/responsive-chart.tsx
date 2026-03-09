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
    const [size, setSize] = useState(() => ({
        width: options.width ?? 800,
        height: options.height ?? 600,
    }));

    const plotOptions = useMemo(
        () => ({
            ...options,
            width: size.width,
            height: size.height,
        }),
        [options, size.height, size.width],
    );

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
            const h = Math.max(0, Math.floor(rect.height) - 50);

            if (w === plot.width && h === plot.height) return;
            
            plot.setSize({ width: w, height: h });
            setSize((currentSize) =>
                currentSize.width === w && currentSize.height === h
                    ? currentSize
                    : { width: w, height: h },
            );
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
                options={plotOptions} 
                data={data}
                onCreate={(plot) => {
                    uplotRef.current = plot;
                    const el = containerRef.current;
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const width = Math.max(0, Math.floor(rect.width));
                        const height = Math.max(0, Math.floor(rect.height) - 50);
                        plot.setSize({ width, height });
                        setSize((currentSize) =>
                            currentSize.width === width && currentSize.height === height
                                ? currentSize
                                : { width, height },
                        );
                    }
                }}
                onDelete={() => {
                    uplotRef.current = null;
                }}
            />
        </div>
    ); 
}
