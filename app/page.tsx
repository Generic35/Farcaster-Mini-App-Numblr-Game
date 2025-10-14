import HomePage from '@/components/pages/home';
import { env } from '@/lib/env';
import { Metadata } from 'next';

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: 'Launch App',
    action: {
      type: 'launch_frame',
      name: 'Numbler',
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#ffffff',
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Numbler',
    openGraph: {
      title: 'Numbler',
      description: 'Solve daily math equations like Wordle but with numbers!',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <HomePage />;
}
