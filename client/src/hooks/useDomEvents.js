// Small hooks that work directly with the browser DOM and its events.
import { useEffect, useRef, useState } from 'react';

// Sets document.title for the current page.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CampusConnect` : 'CampusConnect';
  }, [title]);
}

// Listens for a keyboard shortcut on the whole document.
// Ignored while the user is typing in a form field (except Escape).
export function useKeyboardShortcut(key, handler, { enabled = true } = {}) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing && key !== 'Escape') return;
      if (event.key === key && !event.metaKey && !event.ctrlKey && !event.altKey) {
        handlerRef.current(event);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key, enabled]);
}

// Tracks the browser's online/offline status via window events.
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return online;
}

// Calls `handler` when a click/tap happens outside the referenced element.
export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handler(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, handler, enabled]);
}
