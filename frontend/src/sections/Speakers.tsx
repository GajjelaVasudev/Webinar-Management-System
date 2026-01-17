import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { IconSocialFb, IconSocialIn, IconSocialX } from '../components/ui/Icon';

const speakers = [
	{ name: 'Thomas', role: 'Keynote Speaker' },
	{ name: 'Thomas', role: 'Workshop Mentor' },
	{ name: 'Thomas', role: 'Session Host' },
	{ name: 'Thomas', role: 'Panel Speaker' },
];

function Social() {
	return (
		<div className="mt-3 flex items-center justify-center gap-3 text-white/60">
			<a
				href="#"
				aria-label="Facebook"
				className="transition hover:text-white"
				onClick={(e) => e.preventDefault()}
			>
				<IconSocialFb className="h-4 w-4" />
			</a>
			<a
				href="#"
				aria-label="X"
				className="transition hover:text-white"
				onClick={(e) => e.preventDefault()}
			>
				<IconSocialX className="h-4 w-4" />
			</a>
			<a
				href="#"
				aria-label="LinkedIn"
				className="transition hover:text-white"
				onClick={(e) => e.preventDefault()}
			>
				<IconSocialIn className="h-4 w-4" />
			</a>
		</div>
	);
}

export default function Speakers() {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto">
				<h2 className="text-3xl font-bold mb-8">Featured Speakers</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{speakers.map((s, idx) => (
						<Card key={idx} className="p-6 text-center">
							<div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-white/5 ring-1 ring-white/15">
								<div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-brand-accent/35 via-brand-secondary/25 to-brand-primary/30 ring-1 ring-white/15">
									<div className="h-20 w-20 rounded-full bg-white/10" />
								</div>
							</div>

							<div className="mt-5 text-sm font-extrabold">{s.name}</div>
							<div className="mt-1 text-xs text-white/60">{s.role}</div>
							<Social />
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
