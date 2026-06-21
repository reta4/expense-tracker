import { useEffect } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (active, containerRef) => {
  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    const root = containerRef.current;
    const nodes = [...root.querySelectorAll(FOCUSABLE)].filter(
      (node) => !node.disabled && node.offsetParent !== null,
    );

    if (!nodes.length) return undefined;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    first.focus();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
};

export default useFocusTrap;
