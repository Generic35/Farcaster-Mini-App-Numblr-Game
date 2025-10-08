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
    
    // Try decoding with URL decoding first
    const urlDecoded = decodeURIComponent(resultData);
    console.log('🐛 Share Page Debug - After decodeURIComponent:', urlDecoded);
    
    const decoded = Buffer.from(urlDecoded, 'base64').toString();
    console.log('🐛 Share Page Debug - After base64 decode:', decoded);
    
    decodedData = JSON.parse(decoded);
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
