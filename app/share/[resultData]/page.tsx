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
    // Convert URL-safe base64 back to regular base64
    let base64Data = resultData.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64Data.length % 4) {
      base64Data += '=';
    }

    const decoded = Buffer.from(base64Data, 'base64').toString();

    const rawData = JSON.parse(decoded);

    // Handle both old and new data formats
    let grid = rawData.grid; // Old format (full emoji grid)

    // If no old format grid, decode compact format
    if (!grid && rawData.g) {
      // Decode compact grid format: C=correct, P=partial, I=incorrect, |=newline
      grid = rawData.g
        .replace(/C/g, '🟩') // C -> green
        .replace(/P/g, '🟨') // P -> yellow
        .replace(/I/g, '⬜') // I -> gray
        .replace(/\|/g, '\n'); // | -> newlines
    }

    decodedData = {
      attempts: rawData.attempts || rawData.a,
      grid: grid || '🟩🟩🟩🟩🟩', // fallback only if no grid data at all
      puzzleNumber: rawData.puzzleNumber || rawData.p,
      won: rawData.won !== undefined ? rawData.won : rawData.w,
      compactGrid: rawData.g || '', // Store compact grid for OG image
    };
  } catch (e) {
    // Fallback data if decoding fails
    decodedData = {
      attempts: '6',
      grid: '🟩🟨⬜⬜⬜',
      puzzleNumber: '1',
      won: false,
      compactGrid: '', // No compact grid in fallback
    };
  }

  const { attempts, grid, puzzleNumber, won, compactGrid } = decodedData;

  // Build the OG image URL with compact grid data (avoid emoji URL encoding issues)
  const imageUrl = new URL(`${appUrl}/api/og/result`);
  imageUrl.searchParams.set('attempts', attempts.toString());
  imageUrl.searchParams.set('puzzleNumber', puzzleNumber.toString());
  imageUrl.searchParams.set('won', won.toString());
  // Pass compact format instead of emojis to avoid URL encoding corruption
  imageUrl.searchParams.set('compactGrid', compactGrid || '');

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
