// Utility functions for testing JWT tokens

export function createTestToken(expiresInSeconds: number = 3600): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    sub: '1234567890',
    name: 'Test User',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  // Encode header and payload (not cryptographically secure, just for testing)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Fake signature for testing
  const signature = 'fake-signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function createExpiredToken(): string {
  return createTestToken(-3600); // Expired 1 hour ago
}

export function createValidToken(): string {
  return createTestToken(3600); // Valid for 1 hour
}

export function createSoonToExpireToken(): string {
  return createTestToken(30); // Expires in 30 seconds
}
