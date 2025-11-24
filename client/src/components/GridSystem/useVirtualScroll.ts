import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Options {
  rowCount: number;
  colCount: number;
  rowHeight: number;
  colWidth: number;
  baseOverscan?: number;
  fastOverscan?: number;
  maxRenderCells?: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualScroll({
  rowCount,
  colCount,
  rowHeight,
  colWidth,
  baseOverscan = 10,
  fastOverscan = 3,
  maxRenderCells = 5000,
  containerRef
}: Options) {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScroll = useRef({ left: 0, top: 0 });
  const timer = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  const updateViewport = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewport({ width: el.clientWidth, height: el.clientHeight });
  }, [containerRef]);

  useEffect(() => {
    updateViewport();
    const handleResize = () => updateViewport();
    window.addEventListener('resize', handleResize);

    const el = containerRef.current;
    if (el && 'ResizeObserver' in window) {
      const observer = new ResizeObserver(() => updateViewport());
      observer.observe(el);
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewport]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const next = { left: el.scrollLeft, top: el.scrollTop };
    lastScroll.current = next;
    if (!isScrolling) setIsScrolling(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsScrolling(false), 150);

    if (rafId.current) window.cancelAnimationFrame(rafId.current);
    rafId.current = window.requestAnimationFrame(() => setScroll(next));
  }, [containerRef, isScrolling]);

  const ranges = useMemo(() => {
    const overscan = isScrolling ? fastOverscan : baseOverscan;
    const startRow = Math.floor(scroll.top / rowHeight);
    const endRow = Math.ceil((scroll.top + viewport.height) / rowHeight);
    const startCol = Math.floor(scroll.left / colWidth);
    const endCol = Math.ceil((scroll.left + viewport.width) / colWidth);

    const baseRowSpan = Math.max(1, endRow - startRow);
    const baseColSpan = Math.max(1, endCol - startCol);

    const allowedCells = Math.max(maxRenderCells, baseRowSpan * baseColSpan);
    const allowedRows = Math.max(baseRowSpan, Math.floor(allowedCells / Math.max(baseColSpan, 1)));
    const allowedCols = Math.max(baseColSpan, Math.floor(allowedCells / Math.max(allowedRows, 1)));

    const rowOverscan = Math.min(overscan, Math.floor((allowedRows - baseRowSpan) / 2));
    const colOverscan = Math.min(overscan, Math.floor((allowedCols - baseColSpan) / 2));

    const renderStartRow = Math.max(0, startRow - rowOverscan);
    const renderEndRow = Math.min(rowCount, endRow + rowOverscan);
    const renderStartCol = Math.max(0, startCol - colOverscan);
    const renderEndCol = Math.min(colCount, endCol + colOverscan);

    return {
      rows: { start: renderStartRow, end: renderEndRow },
      cols: { start: renderStartCol, end: renderEndCol }
    };
  }, [
    scroll,
    viewport,
    rowHeight,
    colWidth,
    baseOverscan,
    fastOverscan,
    maxRenderCells,
    rowCount,
    colCount,
    isScrolling
  ]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (rafId.current) window.cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    scroll,
    viewport,
    ranges,
    onScroll,
    isScrolling
  };
}

