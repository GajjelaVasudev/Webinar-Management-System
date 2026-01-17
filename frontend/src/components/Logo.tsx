export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-9 w-9">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-accent via-brand-secondary to-brand-primary opacity-90" />
        <div className="absolute inset-[2px] rounded-[0.7rem] bg-black/30 ring-1 ring-white/10" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-sm font-extrabold tracking-wide text-white">PS</span>
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-extrabold tracking-wide">PS24</div>
        <div className="text-[11px] text-text-muted">Webinar Platform</div>
      </div>
    </div>
  );
}
