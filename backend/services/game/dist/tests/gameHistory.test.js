"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// gameHistory.test.ts
const globals_1 = require("@jest/globals");
// 1. MOVE THE MOCK TO THE VERY TOP - before any imports
globals_1.jest.mock('../src/modules/database/repositories/gameHistory.repository', () => ({
    getPlayerHistory: globals_1.jest.fn(),
    insertGameResult: globals_1.jest.fn(),
}));
// 2. ADD DEBUG MOCKS HERE (after the main mock but before imports)
const debugMocks = {
    enableDebugLogging: true,
    logMockCalls: true
};
// Helper function to add debug logging to mocks
function createDebugMock(name, originalMock) {
    return originalMock.mockImplementation((...args) => {
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
const gameHistory_service_1 = require("../src/modules/game-history/gameHistory.service");
const gameHistoryRepo = __importStar(require("../src/modules/database/repositories/gameHistory.repository"));
// Get the mocked functions
const mockGetPlayerHistory = gameHistoryRepo.getPlayerHistory;
const mockInsertGameResult = gameHistoryRepo.insertGameResult;
// 3. SETUP DEBUG MOCKS IN beforeAll
(0, globals_1.describe)('GameHistoryService', () => {
    let gameHistoryService;
    (0, globals_1.beforeAll)(() => {
        // Enable debug logging for all tests
        if (debugMocks.enableDebugLogging) {
            console.log('🚀 Setting up debug mocks for GameHistoryService tests');
            // Add debug wrapper to existing mocks
            createDebugMock('getPlayerHistory', mockGetPlayerHistory);
            createDebugMock('insertGameResult', mockInsertGameResult);
        }
    });
    (0, globals_1.beforeEach)(() => {
        gameHistoryService = new gameHistory_service_1.GameHistoryService();
        globals_1.jest.clearAllMocks();
        // 4. ADD DEBUG INFO IN beforeEach
        if (debugMocks.enableDebugLogging) {
            console.log('🧹 Cleared mocks for new test');
        }
    });
    (0, globals_1.describe)('getPlayerGameHistory', () => {
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
        (0, globals_1.beforeEach)(() => {
            // THIS IS THE KEY FIX: Make the mock actually filter by playerId like the real database
            mockGetPlayerHistory.mockImplementation((playerId, limit) => {
                console.log(`🔍 Mock filtering database for playerId: ${playerId}, limit: ${limit}`);
                // Filter to only games where this player participated (either won or lost)
                const playerGames = mockDatabase.filter(game => game.winnerId === playerId || game.loserId === playerId);
                console.log(`📊 Found ${playerGames.length} games for player ${playerId}:`, playerGames.map(g => g.matchId));
                return Promise.resolve(playerGames.slice(0, limit));
            });
        });
        (0, globals_1.it)('should return formatted game history for player 1', async () => {
            console.log('🧪 Test: should return formatted game history for player 1');
            const result = await gameHistoryService.getPlayerGameHistory(1, 5);
            console.log('✅ Test result for player 1:', result);
            // Player 1 appears in 3 games from the database:
            // match-123 (won vs player 2), match-456 (won vs player 3), match-777 (lost to player 3), match-111 (won vs player 7)
            (0, globals_1.expect)(result).toHaveLength(4);
            (0, globals_1.expect)(mockGetPlayerHistory).toHaveBeenCalledWith(1, 5);
            // Check that we got games where player 1 participated
            const matchIds = result.map(r => r.matchId);
            (0, globals_1.expect)(matchIds).toContain('match-123');
            (0, globals_1.expect)(matchIds).toContain('match-456');
            (0, globals_1.expect)(matchIds).toContain('match-777');
            (0, globals_1.expect)(matchIds).toContain('match-111');
        });
        (0, globals_1.it)('should return formatted game history for player 5', async () => {
            console.log('🧪 Test: should return formatted game history for player 5');
            const result = await gameHistoryService.getPlayerGameHistory(5, 5);
            console.log('✅ Test result for player 5:', result);
            // Player 5 appears in 3 games from the database:
            // match-100 (won vs player 3), match-888 (won vs player 2), match-999 (won vs player 2)
            (0, globals_1.expect)(result).toHaveLength(3);
            (0, globals_1.expect)(mockGetPlayerHistory).toHaveBeenCalledWith(5, 5);
            // Check that we got games where player 5 participated
            const matchIds = result.map(r => r.matchId);
            (0, globals_1.expect)(matchIds).toContain('match-100');
            (0, globals_1.expect)(matchIds).toContain('match-888');
            (0, globals_1.expect)(matchIds).toContain('match-999');
        });
        // 7. ADD A DEDICATED DEBUG TEST
        (0, globals_1.it)('DEBUG: should verify mock behavior', async () => {
            console.log('🔧 DEBUG TEST: Verifying mock setup');
            // Check if mocks are properly set up
            console.log('Mock function type:', typeof mockGetPlayerHistory);
            console.log('Is mock function:', globals_1.jest.isMockFunction(mockGetPlayerHistory));
            // Test with simple data
            const simpleData = [{ matchId: 'test', winnerId: 1, loserId: 2, winnerScore: 1, loserScore: 0, createdAt: '2024-01-01T00:00:00.000Z' }];
            mockGetPlayerHistory.mockResolvedValue(simpleData);
            const result = await gameHistoryService.getPlayerGameHistory(1, 1);
            console.log('Simple test result:', result);
            console.log('Mock calls:', mockGetPlayerHistory.mock.calls);
            console.log('Mock results:', mockGetPlayerHistory.mock.results);
            (0, globals_1.expect)(mockGetPlayerHistory).toHaveBeenCalled();
        });
        // Rest of your existing tests...
    });
});
// 8. ADD GLOBAL DEBUG SETUP
if (debugMocks.enableDebugLogging) {
    // Log when tests start
    (0, globals_1.beforeAll)(() => {
        console.log('🎯 Starting GameHistory tests with debug mode enabled');
    });
    // Log when tests end
    (0, globals_1.afterAll)(() => {
        console.log('🏁 Finished GameHistory tests');
    });
}
// 9. HELPER FUNCTION TO VERIFY MOCK SETUP
function verifyMockSetup() {
    console.log('🔍 Verifying mock setup:');
    console.log('- getPlayerHistory is mock:', globals_1.jest.isMockFunction(mockGetPlayerHistory));
    console.log('- insertGameResult is mock:', globals_1.jest.isMockFunction(mockInsertGameResult));
    console.log('- Mock implementation count:', mockGetPlayerHistory.mock ? mockGetPlayerHistory.mock.calls.length : 'No mock');
}
// Call this in your tests if needed
// verifyMockSetup();
//# sourceMappingURL=gameHistory.test.js.map