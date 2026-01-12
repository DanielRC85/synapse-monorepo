Análisis Técnico Channels
# 📘 Análisis Técnico: Módulo Channels (Integración WhatsApp/n8n)

**Estado:** Fase 1 (Aprobado)
**Fecha:** 2026-01-12
**Contexto:** Expansión hacia el Canal de Usuario (WhatsApp) mediante arquitectura Event-Driven.

---

## 1. Objetivo del Módulo
Transformar el backend en un receptor de eventos capaz de procesar interacciones de WhatsApp orquestadas por n8n.
* **Enfoque:** Event-Driven y Multi-tenant.
* **Restricción:** Segregación estricta por `tenantId` y deduplicación por `externalId`.

## 2. Estructura de Archivos (Hexagonal Estricta)
Ubicación: `apps/backend-core/src/modules/channels/`

* **Domain (Núcleo):** Entidades puras y Puertos (Interfaces).
* **Application (Orquestación):** Casos de uso y DTOs de entrada.
* **Infrastructure (Implementación):** Controladores HTTP, Guardas y Repositorios TypeORM.

## 3. Especificaciones Técnicas

### A. Adaptador de Entrada (Webhook)
* **Endpoint:** `POST /webhooks/whatsapp`
* **Seguridad:** `WebhookSecretGuard`. Valida el header `x-synapse-secret` contra las variables de entorno.
* **Respuesta:** `202 Accepted` (Inmediata, para no bloquear a n8n).

### B. Contrato de Datos (DTO)
El payload esperado de n8n (`WhatsAppWebhookDto`):
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `sender` | string | Número E.164 (ej: +57300...) |
| `content` | string | Texto o URL del media |
| `type` | enum | text, image, document, audio |
| `timestamp` | number | Unix timestamp origen |
| `externalId` | string | **ID único de WhatsApp** (Vital para Idempotencia) |
| `tenantId` | string | ID de la organización (inyectado por n8n) |

### C. Estrategia de Persistencia
* **Tabla:** `messages`
* **Índice Único:** `[tenantId, externalId]` para prevenir duplicados a nivel de base de datos.
* **Flujo:** Ingesta -> Validación -> Persistencia (Estado RECEIVED).

### D. Escalabilidad Futura (Roadmap)
1.  **Fase Actual:** Persistencia síncrona en Postgres.
2.  **Fase 2:** Desacoplamiento con BullMQ (Redis) para procesamiento de IA en segundo plano.

---
# 1. Crear toda la estructura de directorios profunda (Hexagonal)
mkdir -p apps/backend-core/src/modules/channels/domain/entities
mkdir -p apps/backend-core/src/modules/channels/domain/ports
mkdir -p apps/backend-core/src/modules/channels/domain/value-objects
mkdir -p apps/backend-core/src/modules/channels/application/use-cases
mkdir -p apps/backend-core/src/modules/channels/application/dtos
mkdir -p apps/backend-core/src/modules/channels/infrastructure/http/controllers
mkdir -p apps/backend-core/src/modules/channels/infrastructure/http/guards
mkdir -p apps/backend-core/src/modules/channels/infrastructure/persistence/entities
mkdir -p apps/backend-core/src/modules/channels/infrastructure/persistence/repositories

# 2. Crear los archivos vacíos (Placeholders) según el Plan
# Capa de Dominio
touch apps/backend-core/src/modules/channels/domain/entities/message.entity.ts
touch apps/backend-core/src/modules/channels/domain/ports/message-handler.port.ts
touch apps/backend-core/src/modules/channels/domain/ports/message.repository.port.ts

# Capa de Aplicación
touch apps/backend-core/src/modules/channels/application/use-cases/process-inbound-message.use-case.ts
touch apps/backend-core/src/modules/channels/application/dtos/whatsapp-webhook.dto.ts

# Capa de Infraestructura
touch apps/backend-core/src/modules/channels/infrastructure/http/controllers/webhook.controller.ts
touch apps/backend-core/src/modules/channels/infrastructure/http/guards/webhook-secret.guard.ts
touch apps/backend-core/src/modules/channels/infrastructure/persistence/entities/message.orm-entity.ts
touch apps/backend-core/src/modules/channels/infrastructure/persistence/repositories/typeorm-message.repository.ts

# Archivo principal del módulo
touch apps/backend-core/src/modules/channels/channels.module.ts