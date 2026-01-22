export interface OutboundMessagePayload {
  recipient: string;
  content: string;
  type: 'text';
}

export interface OutboundMessageResponse {
  providerMessageId: string;
}

// Este Symbol es vital para que NestJS sepa qué inyectar
export const OUTBOUND_MESSAGING_PORT = Symbol('OUTBOUND_MESSAGING_PORT');

export interface OutboundMessagingPort {
  send(payload: OutboundMessagePayload): Promise<OutboundMessageResponse>;
}