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
    // 🐛 DEBUG - Log what we're trying to decode
    console.log('🐛 Share Page Debug - Raw resultData:', resultData);
    console.log('🐛 Share Page Debug - resultData length:', resultData.length);
    console.log('🐛 Share Page Debug - resultData type:', typeof resultData);

    // Convert URL-safe base64 back to regular base64
    let base64Data = resultData.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64Data.length % 4) {
      base64Data += '=';
    }

    console.log(
      '🐛 Share Page Debug - Converted to regular base64:',
      base64Data
    );

    const decoded = Buffer.from(base64Data, 'base64').toString();
    console.log('🐛 Share Page Debug - After base64 decode:', decoded);

    const rawData = JSON.parse(decoded);
    console.log('🐛 Share Page Debug - Raw decoded data:', rawData);

    // Handle both old and new data formats
    decodedData = {
      attempts: rawData.attempts || rawData.a,
      grid: rawData.grid || '🟩🟩🟩🟩🟩', // fallback since we removed grid
      puzzleNumber: rawData.puzzleNumber || rawData.p,
      won: rawData.won !== undefined ? rawData.won : rawData.w,
    };
    console.log('🐛 Share Page Debug - Final decoded data:', decodedData);
  } catch (e) {
    // 🐛 DEBUG - Log the error
    console.error('🐛 Share Page Debug - Decoding failed:', e);
    console.log('🐛 Share Page Debug - Using fallback data');

    // Fallback data if decoding fails
    decodedData = {
      attempts: '6',
      grid: '🟩🟨⬜⬜⬜',
      puzzleNumber: '1',
      won: false,
    };
  }

  const { attempts, grid, puzzleNumber, won } = decodedData;

  // Build the OG image URL with minimal parameters (no grid to avoid URL length limits)
  const imageUrl = new URL(`${appUrl}/api/og/result`);
  imageUrl.searchParams.set('attempts', attempts.toString());
  imageUrl.searchParams.set('puzzleNumber', puzzleNumber.toString());
  imageUrl.searchParams.set('won', won.toString());
  // Grid parameter removed to stay under Farcaster's URL length limit (~350 chars)

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
