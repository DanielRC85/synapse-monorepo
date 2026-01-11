export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface TokenServicePort {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE_PORT = Symbol('TokenServicePort');