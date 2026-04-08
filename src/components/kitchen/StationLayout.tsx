import type { ReactNode } from 'react';

interface StationLayoutProps {
  stationName: string;
  stationCode: string;
  icon: string;
  children: ReactNode;
}

export function StationLayout({ stationName, stationCode, icon, children }: StationLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-midnight">
      {}
      <aside className="w-24 bg-charcoal border-r border-white/5 flex flex-col items-center py-8 shrink-0">
        <div className="size-12 gold-gradient rounded-xl flex items-center justify-center text-midnight shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined font-bold text-3xl">{icon}</span>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col overflow-hidden">
        {}
        <header className="h-24 border-b border-white/5 px-10 flex items-center justify-between shrink-0 bg-charcoal">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-white-text">{stationName}</h1>
              <p className="text-xs text-primary font-medium">{stationCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-primary text-sm">schedule</span>
              <span className="text-xs font-bold tabular-nums tracking-wider text-white-text uppercase">
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
