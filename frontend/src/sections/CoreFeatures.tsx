import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

type Feature = {
  title: string;
  desc: string;
  accent: 'primary' | 'secondary' | 'accent' | 'hot';
  icon: React.ReactNode;
};

function IconTile({ accent, children }: { accent: Feature['accent']; children: React.ReactNode }) {
  const map: Record<Feature['accent'], string> = {
    primary: 'bg-brand-primary/20 ring-brand-primary/30 text-brand-primary',
    secondary: 'bg-brand-secondary/20 ring-brand-secondary/30 text-brand-secondary',
    accent: 'bg-brand-accent/20 ring-brand-accent/30 text-brand-accent',
    hot: 'bg-brand-hot/20 ring-brand-hot/30 text-brand-hot',
  };

  return (
    <div className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${map[accent]}`}>
      {children}
    </div>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M7 3v3M17 3v3M4.5 9.2h15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 5.5h11c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2v-11c0-1.1.9-2 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 12h3v3H8v-3z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function IconBroadcast() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M6.5 16.5c-1.5-1.3-2.5-3.1-2.5-4.9s1-3.6 2.5-4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.5 7.7c1.5 1.3 2.5 3.1 2.5 4.9s-1 3.6-2.5 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 14.2c-.8-.7-1.3-1.6-1.3-2.6S8.2 9.7 9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 9c.8.7 1.3 1.6 1.3 2.6s-.5 1.9-1.3 2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 14.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 14.5a3.2 3.2 0 0 0 3.2-3.2V6.2A3.2 3.2 0 0 0 12 3a3.2 3.2 0 0 0-3.2 3.2v5.1A3.2 3.2 0 0 0 12 14.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.2 11.5c0 3.2 2.6 5.8 5.8 5.8s5.8-2.6 5.8-5.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 17.3V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 21h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M5.8 7h9.9c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H5.8c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.7 10.4l3-1.8v7l-3-1.8v-3.4z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M9.4 10.2v3.6l3.1-1.8-3.1-1.8z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

const features: Feature[] = [
  {
    title: 'Event Scheduling',
    desc: 'Admins create and publish webinar schedules with dates, time slots, and details.',
    accent: 'primary',
    icon: <IconCalendar />,
  },
  {
    title: 'Online Sessions',
    desc: 'Users join live sessions seamlessly and see upcoming events in one place.',
    accent: 'secondary',
    icon: <IconBroadcast />,
  },
  {
    title: 'Expert Speakers',
    desc: 'Manage speaker lineup, session ownership, and workshop leadership profiles.',
    accent: 'hot',
    icon: <IconMic />,
  },
  {
    title: 'Session Recordings',
    desc: 'Publish recordings after each session so attendees can watch on demand.',
    accent: 'accent',
    icon: <IconVideo />,
  },
];

export default function CoreFeatures() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <IconTile accent={f.accent}>{f.icon}</IconTile>
              <div className="mt-5 text-sm font-extrabold">{f.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
