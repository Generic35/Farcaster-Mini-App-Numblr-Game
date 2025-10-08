'use client';

import { useState } from 'react';
import {
  generateShareResultData,
  generateShareUrl,
  getCurrentPuzzleNumber,
} from '@/lib/game-logic';
import type { GameState } from '@/lib/game-logic';

export default function DebugSharePage() {
  const [debugOutput, setDebugOutput] = useState<any>(null);

  // Mock game state - you can modify these values to test different scenarios
  const mockGameState: GameState = {
    currentGuess: '',
    guesses: [
      '12+34', // First guess
      '56-78', // Second guess
      '90*12', // Third guess (winning)
    ],
    currentRow: 3,
    gameWon: true,
    gameLost: false,
    tileStates: [
      // Row 1: 12+34 (partial match)
      ['incorrect', 'correct', 'partial', 'correct', 'partial'],
      // Row 2: 56-78 (closer)
      ['partial', 'correct', 'partial', 'correct', 'correct'],
      // Row 3: 90*12 (winning row)
      ['correct', 'correct', 'correct', 'correct', 'correct'],
      // Empty rows
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
  };

  const testShareGeneration = () => {
    const puzzleNumber = getCurrentPuzzleNumber();
    const resultData = generateShareResultData(mockGameState, puzzleNumber);
    const shareUrl = generateShareUrl(resultData);

    // Extract the base64 data from the share URL
    const base64Data = shareUrl.split('/share/')[1];
    let decodedData = null;
    try {
      decodedData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
    } catch (e) {
      console.error('Failed to decode share data:', e);
    }

    // Build the OG image URL with the correct parameters
    const ogImageParams = new URLSearchParams();
    if (decodedData) {
      ogImageParams.set('attempts', decodedData.attempts.toString());
      ogImageParams.set('grid', decodedData.grid);
      ogImageParams.set('puzzleNumber', decodedData.puzzleNumber.toString());
      ogImageParams.set('won', decodedData.won.toString());
    }

    const output = {
      gameState: mockGameState,
      puzzleNumber,
      resultData,
      shareUrl,
      base64Data,
      decodedData,
      ogImageUrl: `/api/og/result?${ogImageParams.toString()}`,
      ogImageParams,
    };

    setDebugOutput(output);
    console.log('🐛 DEBUG - Complete Share Analysis:', output);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          🐛 Share Debug Tool
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Share Generation
          </h2>
          <button
            onClick={testShareGeneration}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🧪 Generate Share Data
          </button>
        </div>

        {debugOutput && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                📊 Game State
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-100">
                {JSON.stringify(debugOutput.gameState, null, 2)}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                🎯 Generated Data
              </h3>
              <div className="space-y-3">
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Puzzle Number:</strong> {debugOutput.puzzleNumber}
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Result Text:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm mt-1 text-gray-900 dark:text-gray-100">
                    {debugOutput.resultData.text}
                  </pre>
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Share URL:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm mt-1 break-all text-gray-900 dark:text-gray-100">
                    {debugOutput.shareUrl}
                  </pre>
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Base64 Data:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm mt-1 break-all text-gray-900 dark:text-gray-100">
                    {debugOutput.base64Data}
                  </pre>
                </div>
                <div className="text-gray-900 dark:text-gray-100">
                  <strong>Decoded Data:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm mt-1 text-gray-900 dark:text-gray-100">
                    {JSON.stringify(debugOutput.decodedData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                🔍 OG Image Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(debugOutput.ogImageParams.entries()).map(
                  ([key, value]: [string, string]) => (
                    <div
                      key={key}
                      className="bg-gray-100 dark:bg-gray-700 p-3 rounded"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {key}:
                      </div>
                      <div className="text-sm break-all text-gray-700 dark:text-gray-300">
                        {value}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                🖼️ Test OG Image
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the link below to test the OG image generation with
                  these parameters:
                </p>
                <a
                  href={debugOutput.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  🔗 Open Share URL
                </a>
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Direct OG Image URL:
                  </p>
                  <a
                    href={debugOutput.ogImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                  >
                    {debugOutput.ogImageUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
