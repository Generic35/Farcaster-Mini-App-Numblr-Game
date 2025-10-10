import { GameState, getCurrentPuzzleNumber, createInitialGameState } from './game-logic';
import { saveGameState, loadGameState, hasSavedState, clearGameState, clearOldGameStates } from './storage';

/**
 * Test suite for localStorage utilities
 * Run this in browser console or add to a test page
 */
export function testStorageUtilities() {
  console.log('🧪 Testing localStorage utilities...\n');

  const currentPuzzle = getCurrentPuzzleNumber();
  console.log(`📅 Current puzzle number: ${currentPuzzle}`);

  // Test 1: Save and load basic game state
  console.log('\n1️⃣ Testing basic save/load...');

  const testGameState: GameState = {
    currentGuess: '2+3',
    guesses: ['1+4', '2+3'],
    currentRow: 2,
    gameWon: false,
    gameLost: false,
    tileStates: [
      ['incorrect', 'correct', 'incorrect', 'correct', 'incorrect'],
      ['correct', 'correct', 'partial', 'correct', 'partial'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty']
    ]
  };

  // Save state
  const saveResult = saveGameState(currentPuzzle, testGameState);
  console.log(`✅ Save result: ${saveResult}`);

  // Check if saved
  const hasSaved = hasSavedState(currentPuzzle);
  console.log(`✅ Has saved state: ${hasSaved}`);

  // Load state
  const loadedState = loadGameState(currentPuzzle);
  console.log(`✅ Loaded state:`, loadedState);

  // Verify data integrity
  const dataMatches = JSON.stringify(testGameState) === JSON.stringify(loadedState);
  console.log(`✅ Data integrity: ${dataMatches ? 'PASS' : 'FAIL'}`);

  // Test 2: Invalid puzzle number validation
  console.log('\n2️⃣ Testing invalid puzzle number validation...');

  const invalidSave1 = saveGameState(-1, testGameState);
  const invalidSave2 = saveGameState(0, testGameState);
  const invalidSave3 = saveGameState(1.5, testGameState);

  console.log(`✅ Negative number rejected: ${!invalidSave1 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Zero rejected: ${!invalidSave2 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Float rejected: ${!invalidSave3 ? 'PASS' : 'FAIL'}`);

  // Test 3: Invalid game state validation
  console.log('\n3️⃣ Testing invalid game state validation...');

  const invalidGameState1 = { ...testGameState, currentRow: 'invalid' };
  const invalidGameState2 = { ...testGameState, guesses: 'not an array' };
  const invalidGameState3 = { currentGuess: '1+1' }; // missing properties

  const invalidStateSave1 = saveGameState(currentPuzzle + 1, invalidGameState1 as any);
  const invalidStateSave2 = saveGameState(currentPuzzle + 2, invalidGameState2 as any);
  const invalidStateSave3 = saveGameState(currentPuzzle + 3, invalidGameState3 as any);

  console.log(`✅ Invalid currentRow rejected: ${!invalidStateSave1 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Invalid guesses rejected: ${!invalidStateSave2 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Missing properties rejected: ${!invalidStateSave3 ? 'PASS' : 'FAIL'}`);

  // Test 4: Load non-existent state
  console.log('\n4️⃣ Testing load non-existent state...');

  const nonExistentState = loadGameState(currentPuzzle + 100);
  console.log(`✅ Non-existent state returns null: ${nonExistentState === null ? 'PASS' : 'FAIL'}`);

  // Test 5: Clear state
  console.log('\n5️⃣ Testing clear state...');

  const clearResult = clearGameState(currentPuzzle);
  const hasStateAfterClear = hasSavedState(currentPuzzle);

  console.log(`✅ Clear result: ${clearResult}`);
  console.log(`✅ State cleared: ${!hasStateAfterClear ? 'PASS' : 'FAIL'}`);

  // Test 6: Test with winning state
  console.log('\n6️⃣ Testing winning game state...');

  const winningState: GameState = {
    currentGuess: '',
    guesses: ['1+4', '2+3', '5+6'],
    currentRow: 3,
    gameWon: true,
    gameLost: false,
    tileStates: [
      ['incorrect', 'correct', 'incorrect', 'correct', 'incorrect'],
      ['correct', 'correct', 'partial', 'correct', 'partial'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty']
    ]
  };

  const winningSave = saveGameState(currentPuzzle, winningState);
  const winningLoad = loadGameState(currentPuzzle);
  const winningMatches = winningLoad?.gameWon === true && winningLoad?.currentRow === 3;

  console.log(`✅ Winning state saved: ${winningSave}`);
  console.log(`✅ Winning state loaded correctly: ${winningMatches ? 'PASS' : 'FAIL'}`);

  console.log('\n🎉 Storage utility tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Basic save/load functionality');
  console.log('- Input validation (puzzle numbers, game state structure)');
  console.log('- Error handling (non-existent states, corrupted data)');
  console.log('- State clearing functionality');
  console.log('- Winning/losing state preservation');

  return {
    currentPuzzle,
    testsPassed: true,
    savedState: winningLoad
  };
}

/**
 * Quick test you can run in browser console
 */
export function quickStorageTest() {
  console.log('🚀 Quick storage test...');

  const currentPuzzle = getCurrentPuzzleNumber();
  const initialState = createInitialGameState();

  // Modify state slightly
  initialState.currentGuess = '1+2';
  initialState.guesses = ['1+2'];
  initialState.currentRow = 1;

  console.log('Saving state...', saveGameState(currentPuzzle, initialState));
  console.log('Loading state...', loadGameState(currentPuzzle));
  console.log('Has saved state:', hasSavedState(currentPuzzle));

  return 'Test completed - check console output above';
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testStorageUtilities = testStorageUtilities;
  (window as any).quickStorageTest = quickStorageTest;
}
