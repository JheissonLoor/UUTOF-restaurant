import { useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { tabs } from '@/components/navigation';

interface UnderlineState {
  left: number;
  width: number;
}

export function TabNav(): JSX.Element {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [underline, setUnderline] = useState<UnderlineState>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeTab = tabs.find((tab) => location.pathname.startsWith(tab.path)) ?? tabs[0];

    function updateUnderline(): void {
      const activeElement = tabRefs.current[activeTab.path];
      const containerElement = containerRef.current;

      if (!activeElement || !containerElement) return;

      setUnderline({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [location.pathname]);

  return (
    <nav
      ref={containerRef}
      className="scrollbar-none sticky top-16 z-10 flex h-[52px] items-center gap-1 overflow-x-auto border-b border-[rgba(42,30,20,0.08)] bg-white px-7"
      aria-label="Secciones del panel"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            ref={(element) => {
              tabRefs.current[tab.path] = element;
            }}
            to={tab.path}
            className={({ isActive }) =>
              [
                'relative inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium transition',
                isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700',
              ].join(' ')
            }
          >
            <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
            {tab.label}
          </NavLink>
        );
      })}
      <span
        className="absolute bottom-[-1px] h-0.5 rounded-full bg-terracotta-500 transition-[left,width] duration-300 ease-out"
        style={{ left: underline.left, width: underline.width }}
        aria-hidden="true"
      />
    </nav>
  );
}
