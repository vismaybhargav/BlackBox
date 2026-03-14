import { useLayoutEffect, useMemo, useRef, useState } from "react";
import UplotReact from "uplot-react";
import uPlot from "uplot";

type ResponsivePlotProps = {
  options: uPlot.Options;
  data: uPlot.AlignedData;
  className?: string;
  onCreate?: (plot: uPlot) => void;
  onDelete?: () => void;
};

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

export default function ResponsivePlot({
  options,
  data,
  className,
  onCreate,
  onDelete,
}: ResponsivePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);
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

  const plotKey = useMemo(
    () =>
      JSON.stringify({
        series: options.series?.map((series) => ({
          label: series.label,
          scale: series.scale,
          show: series.show,
        })),
        axes: options.axes?.map((axis) => axis.label ?? axis.scale ?? null),
        dataLength: data.length,
      }),
    [data.length, options.axes, options.series],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeToContainer = rafThrottle(() => {
      const plot = uplotRef.current;
      if (!plot) return;

      const rect = el.getBoundingClientRect();
      const width = Math.max(0, Math.floor(rect.width));
      const height = Math.max(0, Math.floor(rect.height));

      if (width === plot.width && height === plot.height) return;

      plot.setSize({ width, height });
      setSize((currentSize) =>
        currentSize.width === width && currentSize.height === height
          ? currentSize
          : { width, height },
      );
    });

    resizeToContainer();

    const ro = new ResizeObserver(() => resizeToContainer());
    ro.observe(el);

    window.addEventListener("resize", resizeToContainer);

    return () => {
      window.removeEventListener("resize", resizeToContainer);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className ?? "h-full min-h-0 w-full"}>
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
            const height = Math.max(0, Math.floor(rect.height));
            plot.setSize({ width, height });
            setSize((currentSize) =>
              currentSize.width === width && currentSize.height === height
                ? currentSize
                : { width, height },
            );
          }
          onCreate?.(plot);
        }}
        onDelete={() => {
          uplotRef.current = null;
          onDelete?.();
        }}
      />
    </div>
  );
}
