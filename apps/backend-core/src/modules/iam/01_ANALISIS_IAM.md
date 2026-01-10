# Análisis Técnico IAM
📄 ENTREGABLE TÉCNICO
Arquitecto, iniciamos el diseño del módulo más crítico del sistema. Si el IAM falla, todo el sistema es inseguro. Aquí tienes el Documento de Análisis Técnico para el módulo iam.

apps/backend-core/src/modules/iam/01_ANALISIS_IAM.md
1. Alcance del Módulo (Scope)
El módulo IAM (Identity and Access Management) será responsable de la gestión del ciclo de vida de los usuarios, la autenticación (verificación de identidad) y la autorización (verificación de permisos) dentro de la plataforma SaaS.

Límites del Contexto (Bounded Context):

Incluye: Registro de usuarios, Login (emisión de Tokens), Hash de contraseñas, Roles básicos.

No Incluye: Gestión detallada de la organización/tenant (eso va en módulo tenants), ni facturación.

2. Definición de Entidades de Dominio (Core)
A. Aggregate Root: User
Es la entidad central. Representa a una persona con acceso al sistema.

Identidad: id (UUID - heredado de Entity).

Atributos de Estado:

email: (Value Object). Único en el sistema. Debe validarse formato.

password: (Value Object). Almacena SOLO el hash, nunca texto plano.

roles: (Array de Enums). ADMIN, MANAGER, USER.

tenantId: (UUID). Referencia a la organización a la que pertenece (SaaS).

isActive: (Boolean). Para "Soft Delete" o bloqueo de acceso.

Comportamiento (Métodos del Dominio):

create(): Factory method.

changePassword(): Lógica de negocio para actualización segura.

updateRole(): Gestión de privilegios.

B. Value Objects
Email: Encapsula la validación de regex y normalización (lowercase).

HashedPassword: Encapsula la lógica de comparación (match).

3. Casos de Uso (Application Services)
Definimos las operaciones que el sistema expondrá al mundo exterior (Controladores):

RegisterUserUseCase:

Input: DTO con email, password (raw), tenantId opcional.

Lógica: Verificar unicidad del email -> Hashear password -> Persistir.

LoginUseCase:

Input: Email, Password.

Lógica: Buscar usuario -> Comparar Hash -> Generar JWT (Access Token).

GetUserProfileUseCase:

Input: User ID (extraído del Token).

Lógica: Retornar datos del usuario (sin password).

4. Restricciones Técnicas y de Seguridad
Algoritmo de Hashing: Se usará Bcrypt (o Argon2 si la librería lo permite fácilmente). Salting automático.

Estrategia JWT:

Expiración corta (ej: 1 hora).

Payload mínimo: sub (userId), email, role, tenantId.

Persistencia: Índice UNIQUE en la columna email de la base de datos.

5. Criterios de Aceptación Técnicos
Las contraseñas NUNCA deben viajar en texto plano en las respuestas de la API.

Un usuario no puede registrarse dos veces con el mismo email (Idempotencia).

El sistema debe rechazar contraseñas débiles (mínimo 8 caracteres, validación en Value Object).