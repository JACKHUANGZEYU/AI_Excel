import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Options {
  rowCount: number;
  colCount: number;
  rowHeight: number;
  colWidth: number;
  baseOverscan?: number;
  fastOverscan?: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualScroll({
  rowCount,
  colCount,
  rowHeight,
  colWidth,
  baseOverscan = 10,
  fastOverscan = 3,
  containerRef
}: Options) {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScroll = useRef({ left: 0, top: 0 });
  const timer = useRef<number | null>(null);

  const updateViewport = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewport({ width: el.clientWidth, height: el.clientHeight });
  }, [containerRef]);

  useEffect(() => {
    updateViewport();
    const handleResize = () => updateViewport();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewport]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const next = { left: el.scrollLeft, top: el.scrollTop };
    const dy = Math.abs(next.top - lastScroll.current.top);
    const dx = Math.abs(next.left - lastScroll.current.left);
    lastScroll.current = next;
    if (dy > 200 || dx > 200) {
      setIsScrolling(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIsScrolling(false), 150);
    } else {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIsScrolling(false), 150);
    }
    setScroll(next);
  }, [containerRef]);

  const ranges = useMemo(() => {
    const overscan = isScrolling ? fastOverscan : baseOverscan;
    const startRow = Math.floor(scroll.top / rowHeight);
    const endRow = Math.ceil((scroll.top + viewport.height) / rowHeight);
    const startCol = Math.floor(scroll.left / colWidth);
    const endCol = Math.ceil((scroll.left + viewport.width) / colWidth);

    const renderStartRow = Math.max(0, startRow - overscan);
    const renderEndRow = Math.min(rowCount, endRow + overscan);
    const renderStartCol = Math.max(0, startCol - overscan);
    const renderEndCol = Math.min(colCount, endCol + overscan);

    return {
      rows: { start: renderStartRow, end: renderEndRow },
      cols: { start: renderStartCol, end: renderEndCol }
    };
  }, [scroll, viewport, rowHeight, colWidth, baseOverscan, fastOverscan, rowCount, colCount, isScrolling]);

  return {
    scroll,
    viewport,
    ranges,
    onScroll,
    isScrolling
  };
}

