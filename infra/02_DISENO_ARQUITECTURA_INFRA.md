# 🏗️ Diseño de Arquitectura: Infraestructura Base (Fase 5)

**Fecha:** 2026-01-09
**Versión:** 1.0
**Estado:** Implementado

## 1. Diagrama de Despliegue (Docker)

Esta arquitectura utiliza contenedores aislados en una red privada para garantizar seguridad y escalabilidad.

```mermaid
graph TD
    subgraph Docker Host [Servidor / PC Local]
        direction TB
        
        subgraph Network [Red Privada: synapse-net]
            PG[(PostgreSQL 16)]
            RD[(Redis 7)]
            N8N{{n8n Automation}}
        end
        
        %% Puertos Expuestos
        PG ---|:5432| P1[Puerto Local]
        RD ---|:6379| P2[Puerto Local]
        N8N ---|:5678| P3[Navegador Web]
        
        %% Conexiones Internas
        N8N -.->|Persistencia| PG
        N8N -.->|Colas/Cache| RD
    end
    
    style PG fill:#336791,stroke:#fff,color:#fff
    style RD fill:#d82c20,stroke:#fff,color:#fff
    style N8N fill:#ff6d5a,stroke:#fff,color:#fff