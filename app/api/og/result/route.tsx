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
    const attempts = searchParams.get('attempts') || '2';
    const puzzleNumber = searchParams.get('puzzleNumber') || '282';
    const won = searchParams.get('won') === 'true';

    // Parse the actual grid from URL parameters
    const gridParam = searchParams.get('grid') || '🟩🟩🟩🟩🟩';
    const gridRows = gridParam.split('\n').filter((row) => row.length > 0);

    // Convert emoji grid to color grid
    const colorGrid = gridRows.map((row) =>
      Array.from(row).map((char) => {
        if (char === '🟩') return 'green';
        if (char === '🟨') return 'yellow';
        if (char === '⬜') return 'gray';
        return 'empty';
      })
    );

    // Pad to 6 rows for display
    while (colorGrid.length < 6) {
      colorGrid.push(['empty', 'empty', 'empty', 'empty', 'empty']);
    }

    // Generate and return the image response
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: 'white',
            padding: '40px',
          }}
        >
          {/* Left side - Simple grid placeholder */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              {colorGrid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{ display: 'flex', gap: '3px' }}
                >
                  {row.map((color, colIndex) => {
                    let backgroundColor = '#f3f4f6';
                    let border = 'none';

                    if (color === 'green') {
                      backgroundColor = '#22c55e';
                    } else if (color === 'yellow') {
                      backgroundColor = '#eab308';
                    } else if (color === 'gray') {
                      backgroundColor = '#d1d5db';
                    } else if (color === 'empty') {
                      backgroundColor = 'white';
                      border = '1px solid #d1d5db';
                    }

                    return (
                      <div
                        key={colIndex}
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor,
                          borderRadius: '3px',
                          border,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Stats */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              paddingLeft: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#000000',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Numbler</span>
              <span style={{ color: '#16a34a' }}>PRO</span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#6b7280',
                marginBottom: '16px',
              }}
            >
              {new Date().toISOString().split('T')[0]}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#16a34a',
                marginBottom: '16px',
              }}
            >
              {won
                ? `Solved in ${attempts} attempt${
                    attempts === '1' ? '' : 's'
                  }! 🏆`
                : `Better luck next time! 😔`}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              Can YOU beat this?
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 400,
      }
    );
  } catch (e) {
    console.error('Failed to generate result image:', e);
    return new Response(`Failed to generate result image`, {
      status: 500,
    });
  }
}
