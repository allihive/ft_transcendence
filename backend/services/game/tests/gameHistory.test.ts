// gameHistory.test.ts
import { describe, it, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';

// 1. MOVE THE MOCK TO THE VERY TOP - before any imports
jest.mock('../src/modules/database/repositories/gameHistory.repository', () => ({
  getPlayerHistory: jest.fn(),
  insertGameResult: jest.fn(),
}));

// 2. ADD DEBUG MOCKS HERE (after the main mock but before imports)
const debugMocks = {
  enableDebugLogging: true,
  logMockCalls: true
};

// Helper function to add debug logging to mocks
function createDebugMock(name: string, originalMock: jest.MockedFunction<any>) {
  return originalMock.mockImplementation((...args: any[]) => {
    if (debugMocks.logMockCalls) {
      console.log(`🔍 Mock called: ${name}`, {
        args,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return a default resolved promise for async functions
    return Promise.resolve();
  });
}

// Now import your modules
import { GameHistoryService } from '../src/modules/game-history/gameHistory.service';
import { GameHistoryController } from '../src/modules/game-history/gameHistory.controller';
import { createApp } from '../src/modules/game-history/gameHistory.modules';
import * as gameHistoryRepo from '../src/modules/database/repositories/gameHistory.repository';
import { FastifyInstance } from 'fastify';

// Get the mocked functions
const mockGetPlayerHistory = gameHistoryRepo.getPlayerHistory as jest.MockedFunction<typeof gameHistoryRepo.getPlayerHistory>;
const mockInsertGameResult = gameHistoryRepo.insertGameResult as jest.MockedFunction<typeof gameHistoryRepo.insertGameResult>;

// 3. SETUP DEBUG MOCKS IN beforeAll
describe('GameHistoryService', () => {
  let gameHistoryService: GameHistoryService;

  beforeAll(() => {
    // Enable debug logging for all tests
    if (debugMocks.enableDebugLogging) {
      console.log('🚀 Setting up debug mocks for GameHistoryService tests');
      
      // Add debug wrapper to existing mocks
      createDebugMock('getPlayerHistory', mockGetPlayerHistory);
      createDebugMock('insertGameResult', mockInsertGameResult);
    }
  });

  beforeEach(() => {
    gameHistoryService = new GameHistoryService();
    jest.clearAllMocks();
    
    // 4. ADD DEBUG INFO IN beforeEach
    if (debugMocks.enableDebugLogging) {
      console.log('🧹 Cleared mocks for new test');
    }
  });

  describe('getPlayerGameHistory', () => {
    // Single database that both tests will use - this is the "first database" you mentioned
    const mockDatabase = [
      {
        matchId: 'match-123',
        winnerId: 1,
        loserId: 2,
        winnerScore: 10,
        loserScore: 5,
        createdAt: '2024-01-15T10:30:00.000Z'
      },
      {
        matchId: 'match-456',
        winnerId: 1,
        loserId: 3,
        winnerScore: 15,
        loserScore: 8,
        createdAt: '2024-01-14T14:20:00.000Z'
      },
      {
        matchId: 'match-777',
        winnerId: 3,
        loserId: 1,
        winnerScore: 15,
        loserScore: 8,
        createdAt: '2024-01-14T17:20:00.000Z'
      },
      {
        matchId: 'match-100',
        winnerId: 5,
        loserId: 3,
        winnerScore: 11,
        loserScore: 3,
        createdAt: '2024-01-15T14:20:00.000Z'
      },
      {
        matchId: 'match-888',
        winnerId: 5,
        loserId: 2,
        winnerScore: 12,
        loserScore: 7,
        createdAt: '2024-01-16T09:15:00.000Z'
      },
      {
        matchId: 'match-999',
        winnerId: 5,
        loserId: 2,
        winnerScore: 13,
        loserScore: 9,
        createdAt: '2024-01-16T15:45:00.000Z'
      },
      {
        matchId: 'match-111',
        winnerId: 1,
        loserId: 7,
        winnerScore: 14,
        loserScore: 6,
        createdAt: '2024-01-17T11:30:00.000Z'
      },
    ];

    beforeEach(() => {
      // THIS IS THE KEY FIX: Make the mock actually filter by playerId like the real database
      mockGetPlayerHistory.mockImplementation((playerId: number, limit?: number) => {
        console.log(`🔍 Mock filtering database for playerId: ${playerId}, limit: ${limit}`);
        
        // Filter to only games where this player participated (either won or lost)
        const playerGames = mockDatabase.filter(game => 
          game.winnerId === playerId || game.loserId === playerId
        );
        
        console.log(`📊 Found ${playerGames.length} games for player ${playerId}:`, playerGames.map(g => g.matchId));
        return Promise.resolve(playerGames.slice(0, limit));
      });
    });

    it('should return formatted game history for player 1', async () => {
      console.log('🧪 Test: should return formatted game history for player 1');

      const result = await gameHistoryService.getPlayerGameHistory(1, 5);
      
      console.log('✅ Test result for player 1:', result);
      
      // Player 1 appears in 3 games from the database:
      // match-123 (won vs player 2), match-456 (won vs player 3), match-777 (lost to player 3), match-111 (won vs player 7)
      expect(result).toHaveLength(4);
      expect(mockGetPlayerHistory).toHaveBeenCalledWith(1, 5);
      
      // Check that we got games where player 1 participated
      const matchIds = result.map(r => r.matchId);
      expect(matchIds).toContain('match-123');
      expect(matchIds).toContain('match-456');
      expect(matchIds).toContain('match-777');
      expect(matchIds).toContain('match-111');
    });

    it('should return formatted game history for player 5', async () => {
      console.log('🧪 Test: should return formatted game history for player 5');

      const result = await gameHistoryService.getPlayerGameHistory(5, 5);
      
      console.log('✅ Test result for player 5:', result);
      
      // Player 5 appears in 3 games from the database:
      // match-100 (won vs player 3), match-888 (won vs player 2), match-999 (won vs player 2)
      expect(result).toHaveLength(3);
      expect(mockGetPlayerHistory).toHaveBeenCalledWith(5, 5);
      
      // Check that we got games where player 5 participated
      const matchIds = result.map(r => r.matchId);
      expect(matchIds).toContain('match-100');
      expect(matchIds).toContain('match-888');
      expect(matchIds).toContain('match-999');
    });

    // 7. ADD A DEDICATED DEBUG TEST
    it('DEBUG: should verify mock behavior', async () => {
      console.log('🔧 DEBUG TEST: Verifying mock setup');
      
      // Check if mocks are properly set up
      console.log('Mock function type:', typeof mockGetPlayerHistory);
      console.log('Is mock function:', jest.isMockFunction(mockGetPlayerHistory));
      
      // Test with simple data
      const simpleData = [{ matchId: 'test', winnerId: 1, loserId: 2, winnerScore: 1, loserScore: 0, createdAt: '2024-01-01T00:00:00.000Z' }];
      mockGetPlayerHistory.mockResolvedValue(simpleData);
      
      const result = await gameHistoryService.getPlayerGameHistory(1, 1);
      
      console.log('Simple test result:', result);
      console.log('Mock calls:', mockGetPlayerHistory.mock.calls);
      console.log('Mock results:', mockGetPlayerHistory.mock.results);
      
      expect(mockGetPlayerHistory).toHaveBeenCalled();
    });

    // Rest of your existing tests...
  });
});

// 8. ADD GLOBAL DEBUG SETUP
if (debugMocks.enableDebugLogging) {
  // Log when tests start
  beforeAll(() => {
    console.log('🎯 Starting GameHistory tests with debug mode enabled');
  });

  // Log when tests end
  afterAll(() => {
    console.log('🏁 Finished GameHistory tests');
  });
}

// 9. HELPER FUNCTION TO VERIFY MOCK SETUP
function verifyMockSetup() {
  console.log('🔍 Verifying mock setup:');
  console.log('- getPlayerHistory is mock:', jest.isMockFunction(mockGetPlayerHistory));
  console.log('- insertGameResult is mock:', jest.isMockFunction(mockInsertGameResult));
  console.log('- Mock implementation count:', mockGetPlayerHistory.mock ? mockGetPlayerHistory.mock.calls.length : 'No mock');
}

// Call this in your tests if needed
// verifyMockSetup();