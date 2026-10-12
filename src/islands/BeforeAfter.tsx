import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  /** Rendered as the accessible name of the slider. */
  label: string;
}

/**
 * Draggable before/after comparison.
 *
 * Pointer Events cover mouse, touch and pen in one path, and the handle is a
 * real ARIA slider so it works from the keyboard with arrows/Home/End.
 */
export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  label,
}: Props) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setFromClientX(event.clientX);
    },
    [dragging, setFromClientX],
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const moves: Record<string, number> = {
      ArrowLeft: -step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowUp: step,
    };
    if (event.key in moves) {
      event.preventDefault();
      setPosition((p) => Math.max(0, Math.min(100, p + (moves[event.key] ?? 0))));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setPosition(100);
    }
  }, []);

  /* Dragging over images would otherwise start a native image drag. */
  useEffect(() => {
    if (!dragging) return;
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('dragstart', prevent);
    return () => document.removeEventListener('dragstart', prevent);
  }, [dragging]);

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="group relative aspect-[4/5] w-full cursor-ew-resize select-none overflow-hidden rounded-sm bg-ink-2 touch-none"
    >
      {/* AFTER sits underneath and is fully painted. */}
      <img
        src={afterSrc}
        alt={afterAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />

      {/* BEFORE is clipped to the handle position. */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/25 mix-blend-multiply" />
      </div>

      {/* Corner labels */}
      <span
        className={`pointer-events-none absolute left-3 top-3 rounded-[2px] bg-ink/85 px-2 py-1 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-chalk-dim backdrop-blur-sm transition-opacity duration-200 ${
          position < 14 ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Before
      </span>
      <span
        className={`pointer-events-none absolute right-3 top-3 rounded-[2px] bg-brass/90 px-2 py-1 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur-sm transition-opacity duration-200 ${
          position > 86 ? 'opacity-0' : 'opacity-100'
        }`}
      >
        After
      </span>

      {/* --- The handle: a tape-measure slider --- */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-brass-lift"
        style={{ left: `${position}%` }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% revealing the after photograph`}
          aria-describedby={`${uid}-hint`}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex h-11 w-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize flex-col items-center justify-center gap-[3px] rounded-[3px] border border-brass bg-ink-2 shadow-[0_2px_14px_rgba(0,0,0,0.6)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        >
          {/* tick marks, like the face of a tape */}
          <span className="h-px w-3.5 bg-brass" />
          <span className="h-px w-2 bg-brass/70" />
          <span className="h-px w-3.5 bg-brass" />
          <span className="h-px w-2 bg-brass/70" />
          <span className="h-px w-3.5 bg-brass" />
        </div>
      </div>

      <p id={`${uid}-hint`} className="sr-only">
        Drag, or use the arrow keys, to compare the before and after photographs.
      </p>
    </div>
  );
}
