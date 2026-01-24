# Synapse Core Architecture Documentation

## 1. Project Overview
Synapse is a specialized SaaS platform for portfolio recovery and business management. It utilizes a **Multi-Tenant** architecture to ensure strict data isolation between clients (Gyms, Schools, Businesses).

## 2. Architectural Pattern
The backend (`apps/backend-core`) follows **Hexagonal Architecture (Ports and Adapters)** to decouple business logic from infrastructure concerns.
- **Domain Layer**: Contains core business rules (Entities: `Message`, `User`).
- **Application Layer**: Use Cases that orchestrate flow (e.g., `ProcessInboundMessageUseCase`).
- **Infrastructure Layer**: Implementation of adapters (TypeORM Repositories, Meta Webhooks Controller).

## 3. Database Strategy: Schema-Based Multi-Tenancy
To guarantee data privacy and scalability, Synapse uses a **Shared Database, Separate Schema** approach (logically enforced).

* **Database Engine**: PostgreSQL 16 (via Docker).
* **Primary Schema**: `app_core` (Not `public`).
* **ORM Sync**:
    * **TypeORM**: configured to write strictly to `schema: 'app_core'`.
    * **Prisma**: configured to read/migrate strictly from `schema=app_core`.

### Data Isolation
Every persistent entity (Message, User) includes a mandatory `tenantId` (UUID v4). Queries are filtered at the Repository level to ensure no cross-tenant data leakage.

## 4. Key Workflows
### Inbound Messaging (WhatsApp)
1.  **Source**: Meta WhatsApp Cloud API.
2.  **Gateway**: n8n (Self-hosted) handles webhook reception and tenant identification.
3.  **Core**: NestJS receives the payload + `tenantId` via internal webhook.
4.  **Persistence**: Data is stored in `app_core.messages` linked to the specific Tenant.
5.  **Presentation**: React Admin polls the backend to display real-time updates.

## 5. Deployment Infrastructure
* **Docker Compose**: Orchestrates PostgreSQL, Redis, n8n, and the Backend API.
* **Environment**: Managed via strict `.env` variables for database credentials and Meta API keys.