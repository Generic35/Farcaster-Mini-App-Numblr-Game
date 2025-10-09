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

    // Create simple test grid - no emoji parsing for now
    const testGrid = [
      ['gray', 'green', 'gray', 'green', 'yellow'],
      ['green', 'green', 'green', 'green', 'green'],
    ];

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
              {/* Row 1 */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#d1d5db',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
              </div>
              {/* Row 2 */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#d1d5db',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
              </div>
              {/* Row 3 */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                  }}
                />
              </div>
              {/* Row 4 - Empty */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>
              {/* Row 5 - Empty */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>
              {/* Row 6 - Empty */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>
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
              2025-10-09
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#16a34a',
                marginBottom: '16px',
              }}
            >
              Solved in 2 attempts! 🏆
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
