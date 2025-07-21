// Re-export shared types for consistency between frontend and backend
// 
// Benefits of this approach:
// ✅ Single source of truth for types
// ✅ Automatic synchronization between frontend and backend
// ✅ Type safety and compile-time error detection
// ✅ Easier maintenance and refactoring
// ✅ Consistent API contracts
//
// Alternative: You could define types directly here, but that would require
// manual synchronization with backend DTOs and increase maintenance burden.
export * from '../../../shared-types/index'; 