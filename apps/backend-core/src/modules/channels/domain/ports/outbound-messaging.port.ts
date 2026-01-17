export interface OutboundMessagePayload {
  recipient: string;
  content: string;
  type: 'text';
}

export interface OutboundMessageResponse {
  providerMessageId: string;
}

export interface OutboundMessagingPort {
  send(payload: OutboundMessagePayload): Promise<OutboundMessageResponse>;
}

export const OUTBOUND_MESSAGING_PORT = Symbol('OutboundMessagingPort');