import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'expense-fab-position';
const FAB_SIZE = 52;
const DRAG_THRESHOLD = 8;
const EDGE_MARGIN = 12;
const TOP_RESERVE = 56;
const DEFAULT_BOTTOM_GAP = 8;

const getBottomReserve = () => {
  const bottomNav = document.querySelector('.app-bottom-nav');
  const navHeight = bottomNav?.getBoundingClientRect().height ?? 72;
  return navHeight + DEFAULT_BOTTOM_GAP;
};

const getViewportSize = () => {
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    offsetTop: vv?.offsetTop ?? 0,
  };
};

const getDefaultPosition = () => {
  const { width, height, offsetTop } = getViewportSize();
  const bottomReserve = getBottomReserve();
  return {
    x: width - FAB_SIZE - EDGE_MARGIN,
    y: offsetTop + height - FAB_SIZE - bottomReserve,
  };
};

const clampPosition = (x, y) => {
  const { width, height, offsetTop } = getViewportSize();
  const bottomReserve = getBottomReserve();
  const maxX = width - FAB_SIZE - EDGE_MARGIN;
  const minX = EDGE_MARGIN;
  const minY = offsetTop + EDGE_MARGIN + TOP_RESERVE;
  const maxY = offsetTop + height - FAB_SIZE - bottomReserve;

  return {
    x: Math.min(Math.max(x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(y, minY), Math.max(minY, maxY)),
  };
};

const readStoredPosition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultPosition();
    const parsed = JSON.parse(saved);
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
      return getDefaultPosition();
    }
    return clampPosition(parsed.x, parsed.y);
  } catch {
    return getDefaultPosition();
  }
};

const FabButton = ({ onClick, label = 'Add expense', hideOnDesktop = true }) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    setMounted(true);
    setPosition(readStoredPosition());

    const handleViewportChange = () => {
      setPosition((prev) => clampPosition(prev?.x ?? 0, prev?.y ?? 0));
    };

    window.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('app-fab-dragging', isDragging);
    return () => document.body.classList.remove('app-fab-dragging');
  }, [isDragging]);

  const persist = useCallback((pos) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, []);

  const handlePointerDown = (event) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragRef.current.moved = true;
    }

    setPosition(clampPosition(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  const finishDrag = (event, target) => {
    if (!dragRef.current.active) return;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    setIsDragging(false);

    setPosition((current) => {
      if (current) persist(current);
      return current;
    });

    if (!wasDrag) {
      onClick?.();
    }
  };

  if (!mounted || !position) return null;

  return createPortal(
    <button
      type="button"
      className={`app-fab${hideOnDesktop ? ' app-fab--mobile-only' : ''}${isDragging ? ' app-fab--dragging' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishDrag(event, event.currentTarget)}
      onPointerCancel={(event) => finishDrag(event, event.currentTarget)}
      aria-label={label}
      title={`${label}. Drag to reposition.`}
    >
      +
    </button>,
    document.body,
  );
};

export default FabButton;
