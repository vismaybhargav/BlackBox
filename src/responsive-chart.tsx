import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

    const [ mountedOptions, setMountedOptions ] = useState<uPlot.Options>(() => ({
        ...options,
        width: options.width ?? 800,
        height: options.height ?? 600,
    }));

    useEffect(() => {
        setMountedOptions((prevOptions) => ({
            ...prevOptions,
            ...options,
            width: prevOptions.width,
            height: prevOptions.height
        }));
    }, [options]);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const resizeToContainer = rafThrottle(() => {
            const plot = uplotRef.current;
            if (!plot) return;

            const rect = el.getBoundingClientRect();
            const w = Math.max(0, Math.floor(rect.width));
            const h = Math.max(0, Math.floor(rect.height));

            if (w === plot.width && h === plot.height) return;

            plot.setSize({ width: w, height: h });
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
                options={mountedOptions} 
                data={data}
                onCreate={(plot) => {
                    uplotRef.current = plot;
                    const el = containerRef.current;
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        plot.setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
                    }
                }}
                onDelete={() => {
                    uplotRef.current = null;
                }}
            />
        </div>
    ); 
}
