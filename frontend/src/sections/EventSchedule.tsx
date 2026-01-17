import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const items = [
	{
		day: '15',
		month: 'Feb',
		year: '2026',
		title: 'PS24: Webinar Operations Masterclass',
		meta: 'Virtual • 10:00 AM • 60 min',
	},
	{
		day: '18',
		month: 'Feb',
		year: '2026',
		title: 'Registration Management for Scale',
		meta: 'Virtual • 02:00 PM • 45 min',
	},
	{
		day: '22',
		month: 'Feb',
		year: '2026',
		title: 'Publishing Session Recordings (Best Practices)',
		meta: 'Virtual • 11:00 AM • 30 min',
	},
	{
		day: '28',
		month: 'Feb',
		year: '2026',
		title: 'Admin Workshop: Speaker & Session Setup',
		meta: 'Virtual • 04:00 PM • 75 min',
	},
	{
		day: '06',
		month: 'Mar',
		year: '2026',
		title: 'Community Session: Q&A + Live Demo',
		meta: 'Virtual • 01:00 PM • 50 min',
	},
];

export default function EventSchedule() {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto">
				<h2 className="text-3xl font-bold mb-8">Event Schedule</h2>
				{/* Add schedule content */}
			</div>
		</section>
	);
}
