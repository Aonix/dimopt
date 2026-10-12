import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  intake: string;
  spacesLeft: number;
}

/**
 * Glassmorphic bottom bar. Appears once the hero is behind you and retreats
 * again when the application section is on screen — no point competing with
 * the form it points at.
 */
export default function StickyApplyBar({ intake, spacesLeft }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const apply = document.getElementById('apply');
    if (!hero || !apply) return;

    let pastHero = false;
    let atApply = false;

    const sync = () => setVisible(pastHero && !atApply);

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        pastHero = !entry?.isIntersecting;
        sync();
      },
      { threshold: 0, rootMargin: '-120px 0px 0px 0px' },
    );

    const applyObserver = new IntersectionObserver(
      ([entry]) => {
        atApply = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.18 },
    );

    heroObserver.observe(hero);
    applyObserver.observe(apply);

    return () => {
      heroObserver.disconnect();
      applyObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 rounded-sm border border-seam/90 bg-ink-2/95 p-2.5 pl-4 shadow-[0_-8px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-semibold leading-tight text-chalk">
            Apply for 1:1 coaching
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-brass">
            <span className="inline-block size-1 rounded-full bg-brass" />
            {intake} · {spacesLeft} left
          </p>
        </div>

        <a
          href="#apply"
          tabIndex={visible ? 0 : -1}
          className="btn btn-primary shrink-0 px-4 py-2.5 text-[0.8125rem]"
        >
          Apply
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
