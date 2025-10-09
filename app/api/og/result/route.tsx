import { env } from '@/lib/env';
import { loadGoogleFont, loadImage } from '@/lib/og-utils';
import { ImageResponse } from 'next/og';

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = 'force-dynamic';

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

/**
 * GET handler for generating Numbler result OpenGraph images
 * @param request - The incoming HTTP request with query params
 * @returns ImageResponse - A dynamically generated result image
 */
export async function GET(request: Request) {
  try {
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const attempts = searchParams.get('attempts') || '6';
    const grid = searchParams.get('grid') || '🟩🟨⬜⬜⬜';
    const puzzleNumber = searchParams.get('puzzleNumber') || '1';
    const won = searchParams.get('won') === 'true';

    // Get the application's base URL from environment variables
    const appUrl = env.NEXT_PUBLIC_URL;

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // Prepare text for font loading
    const displayText = `Numbler #${puzzleNumber} ${won ? attempts : 'X'}/6`;
    const fontData = await loadGoogleFont(
      'Inter:wght@400;600;700',
      displayText
    );

    // Split grid into rows (assuming newlines separate rows)
    const gridRows = grid.split('\n').filter((row) => row.length > 0);

    // Generate and return the image response
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
          }}
        >
          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              gap: '20px',
            }}
          >
            {/* Logo */}
            <img
              src={`data:image/png;base64,${Buffer.from(logoImage).toString(
                'base64'
              )}`}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '10px',
              }}
            />

            {/* Title */}
            <div
              style={{
                color: '#1a1a1a',
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {displayText}
            </div>

            {/* Result status */}
            <div
              style={{
                color: won ? '#22c55e' : '#ef4444',
                fontSize: 18,
                fontFamily: 'Inter',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {won ? '🎉 Solved!' : '😅 Better luck tomorrow!'}
            </div>

            {/* Grid display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {gridRows.map((row, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '2px',
                    fontSize: '20px',
                    letterSpacing: '2px',
                    lineHeight: '1',
                  }}
                >
                  {row}
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div
              style={{
                color: '#6b7280',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
                textAlign: 'center',
                marginTop: '10px',
              }}
            >
              Can you solve today&apos;s puzzle?
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e) {
    console.error('Failed to generate result image:', e);
    return new Response(`Failed to generate result image`, {
      status: 500,
    });
  }
}
