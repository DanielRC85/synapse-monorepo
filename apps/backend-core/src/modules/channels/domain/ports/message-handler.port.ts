export interface IncomingMessagePayload {
  sender: string;
  content: string;
  type: string;
  timestamp: number; // Unix timestamp usualmente recibido de APIs externas
  externalId: string;
  tenantId: string;
}

export interface MessageHandlerPort {
  /**
   * Procesa un mensaje entrante de cualquier canal.
   */
  handleInboundMessage(payload: IncomingMessagePayload): Promise<void>;
}

// Token para Inyección de Dependencias
export const MESSAGE_HANDLER_PORT = Symbol('MessageHandlerPort');