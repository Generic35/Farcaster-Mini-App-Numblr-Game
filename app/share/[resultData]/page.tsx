import App from '@/components/Home';
import { env } from '@/lib/env';
import { Metadata } from 'next';

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resultData: string }>;
}): Promise<Metadata> {
  const { resultData } = await params;

  // Decode the result data from URL (base64 encoded)
  let decodedData;
  try {
    decodedData = JSON.parse(Buffer.from(resultData, 'base64').toString());
  } catch (e) {
    // Fallback data if decoding fails
    decodedData = {
      attempts: '6',
      grid: '🟩🟨⬜⬜⬜',
      puzzleNumber: '1',
      won: false,
    };
  }

  const { attempts, grid, puzzleNumber, won } = decodedData;

  // Build the OG image URL with parameters
  const imageUrl = new URL(`${appUrl}/api/og/result`);
  imageUrl.searchParams.set('attempts', attempts.toString());
  imageUrl.searchParams.set('grid', grid);
  imageUrl.searchParams.set('puzzleNumber', puzzleNumber.toString());
  imageUrl.searchParams.set('won', won.toString());

  const frame = {
    version: 'next',
    imageUrl: imageUrl.toString(),
    button: {
      title: "Play Today's Puzzle",
      action: {
        type: 'launch_frame',
        name: 'Numbler',
        url: `${appUrl}/game`,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: '#667eea',
      },
    },
  };

  const title = `Numbler #${puzzleNumber} ${won ? attempts : 'X'}/6`;
  const description = won
    ? `🎉 Solved in ${attempts} attempts!`
    : `😅 Better luck tomorrow!`;

  return {
    title,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default async function ShareResult() {
  return <App />;
}
