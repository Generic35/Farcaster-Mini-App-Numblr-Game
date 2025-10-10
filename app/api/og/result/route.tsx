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
    console.log('🐛 OG Debug - Full request URL:', request.url);

    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const attempts = searchParams.get('attempts') || '2';
    const puzzleNumber = searchParams.get('puzzleNumber') || '282';
    const won = searchParams.get('won') === 'true';

    // Parse real grid data or generate fallback
    const colorGrid = [];
    const compactGrid = searchParams.get('compactGrid') || '';

    console.log('🐛 OG Debug - Compact grid received:', compactGrid);

    if (compactGrid) {
      console.log('🐛 OG Debug - Using real compact grid data');
      // Work directly with compact format - don't convert to emojis
      const gridRows = compactGrid.split('|');
      console.log('🐛 OG Debug - Compact grid rows:', gridRows);

      for (let row = 0; row < 6; row++) {
        const rowColors = [];
        if (row < gridRows.length && gridRows[row]) {
          // Parse compact format directly
          const compactRow = gridRows[row];
          for (let col = 0; col < 5; col++) {
            const compactChar = compactRow[col] || '';
            console.log(
              `🐛 OG Debug - Row ${row}, Col ${col}, Compact: "${compactChar}"`
            );
            if (compactChar === 'C') {
              rowColors.push('green');
              console.log(`🐛 OG Debug - Mapped to green`);
            } else if (compactChar === 'P') {
              rowColors.push('yellow');
              console.log(`🐛 OG Debug - Mapped to yellow`);
            } else if (compactChar === 'I') {
              rowColors.push('gray');
              console.log(`🐛 OG Debug - Mapped to gray`);
            } else {
              rowColors.push('empty');
              console.log(
                `🐛 OG Debug - Mapped to empty (unknown char: "${compactChar}")`
              );
            }
          }
        } else {
          // Empty rows
          for (let col = 0; col < 5; col++) {
            rowColors.push('empty');
          }
        }
        console.log(`🐛 OG Debug - Row ${row} final colors:`, rowColors);
        colorGrid.push(rowColors);
      }
      console.log('🐛 OG Debug - Final color grid:', colorGrid);
    } else {
      console.log('🐛 OG Debug - No grid param, using fallback');
      // Fallback: Generate sample grid (for backwards compatibility)
      for (let row = 0; row < 6; row++) {
        const rowColors = [];
        for (let col = 0; col < 5; col++) {
          if (row < parseInt(attempts) - 1) {
            // Previous attempts - pattern matching your game (gray-green-gray-green-gray)
            rowColors.push(col % 2 === 0 ? 'gray' : 'green');
          } else if (row === parseInt(attempts) - 1 && won) {
            // Winning row - all green
            rowColors.push('green');
          } else if (row === parseInt(attempts) - 1 && !won) {
            // Last attempt but didn't win - mix of colors
            rowColors.push(
              col % 3 === 0 ? 'green' : col % 3 === 1 ? 'yellow' : 'gray'
            );
          } else {
            // Empty rows
            rowColors.push('empty');
          }
        }
        colorGrid.push(rowColors);
      }
    }

    // Generate and return the Framedl-style image response
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: '32px',
            gap: '32px',
          }}
        >
          {/* Left side - Grid */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
              }}
            >
              {colorGrid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{ display: 'flex', gap: '4px' }}
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
                      border = '2px solid #e5e7eb';
                    }

                    return (
                      <div
                        key={colIndex}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor,
                          borderRadius: '4px',
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
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#000000',
                marginBottom: '12px',
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
                fontSize: 12,
                color: '#6b7280',
                marginBottom: '20px',
              }}
            >
              {new Date().toISOString().split('T')[0]}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: won ? '#16a34a' : '#dc2626',
                marginBottom: '20px',
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
                fontSize: 18,
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
