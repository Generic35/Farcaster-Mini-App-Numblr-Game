// Copy and paste this into your browser console while on the game page
// to test share generation with the current game state

// Test the share generation functions
function debugShareGeneration() {
  // Get the current game state from the page
  const gameStateElement = document.querySelector('[data-testid="game-board"]');

  if (!gameStateElement) {
    console.log('❌ Game board not found. Make sure you\'re on the game page.');
    return;
  }

  // You'll need to manually create a test game state or use the one from React DevTools
  const testGameState = {
    currentGuess: '',
    guesses: ['12+34', '56-78', '90*12'],
    guessResults: [
      [
        { char: '1', status: 'yellow' },
        { char: '2', status: 'green' },
        { char: '+', status: 'yellow' },
        { char: '3', status: 'green' },
        { char: '4', status: 'yellow' }
      ],
      [
        { char: '5', status: 'yellow' },
        { char: '6', status: 'green' },
        { char: '-', status: 'yellow' },
        { char: '7', status: 'green' },
        { char: '8', status: 'green' }
      ],
      [
        { char: '9', status: 'green' },
        { char: '0', status: 'green' },
        { char: '*', status: 'green' },
        { char: '1', status: 'green' },
        { char: '2', status: 'green' }
      ]
    ],
    gameWon: true,
    gameLost: false,
    currentRow: 3,
    maxGuesses: 6,
    target: 1080,
    targetExpression: '90*12'
  };

  console.log('🧪 Testing share generation...');
  console.log('📊 Test Game State:', testGameState);

  // Test the URL construction manually
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    puzzleNumber: '281', // Current puzzle number
    attempts: '3',
    won: 'true',
    grid: '🟨🟩🟨🟩🟨🟨🟩🟨🟩🟩🟩🟩🟩🟩🟩'
  });

  const testShareUrl = `${baseUrl}/share/${encodeURIComponent(JSON.stringify({
    puzzleNumber: 281,
    attempts: 3,
    won: true,
    grid: '🟨🟩🟨🟩🟨🟨🟩🟨🟩🟩🟩🟩🟩🟩🟩'
  }))}`;

  const ogImageUrl = `${baseUrl}/api/og/result?${params.toString()}`;

  console.log('🔗 Test Share URL:', testShareUrl);
  console.log('🖼️ OG Image URL:', ogImageUrl);
  console.log('📋 URL Parameters:', Object.fromEntries(params.entries()));

  // Open the OG image in a new tab to test it
  window.open(ogImageUrl, '_blank');
}

// Run the debug function
debugShareGeneration();

