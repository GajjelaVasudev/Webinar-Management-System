import Logo from '../components/Logo';
import { IconSocialFb, IconSocialIn, IconSocialX } from '../components/ui/Icon';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Logo />

          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-white/70">
            <a className="transition hover:text-white" href="#about">
              About
            </a>
            <a className="transition hover:text-white" href="#schedule">
              Events
            </a>
            <a className="transition hover:text-white" href="#speakers">
              Speakers
            </a>
            <a className="transition hover:text-white" href="#tickets">
              Register
            </a>
          </div>

          <div className="flex items-center gap-3 text-white/65">
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              <IconSocialFb className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="X"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              <IconSocialX className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              <IconSocialIn className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 text-sm text-white/50 text-center">
          © 2026 PFSD Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
