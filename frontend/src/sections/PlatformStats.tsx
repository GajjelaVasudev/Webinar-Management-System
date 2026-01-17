import Card from '../components/ui/Card';

const stats = [
	{
		value: '128',
		label: 'Total Events',
		gradient: 'from-brand-accent/70 to-brand-hot/60',
	},
	{
		value: '3,420',
		label: 'Total Registrations',
		gradient: 'from-brand-hot/70 to-brand-secondary/55',
	},
	{
		value: '1,980',
		label: 'Total Participants',
		gradient: 'from-brand-primary/70 to-brand-secondary/55',
	},
	{
		value: '412',
		label: 'Total Recordings',
		gradient: 'from-brand-secondary/60 to-brand-primary/55',
	},
];

export default function PlatformStats() {
	return (
		<section className="py-16 px-4 bg-gray-100">
			<div className="container mx-auto">
				<h2 className="text-3xl font-bold mb-8">Platform Statistics</h2>
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{stats.map((s) => (
						<Card
							key={s.label}
							className="relative overflow-hidden rounded-3xl p-6"
						>
							<div
								className={`absolute inset-0 bg-gradient-to-r ${s.gradient} opacity-25`}
							/>
							<div className="relative">
								<div className="text-3xl font-extrabold">{s.value}</div>
								<div className="mt-1 text-sm text-white/70">
									{s.label}
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
