---
name: vertical-slice
description: Guía integral de Vertical Slice Architecture (VSA), organización modular por características (Features), convenciones de nomenclatura UpperCamelCase y snake_case con dominio en español y estándares técnicos en inglés, protocolo de análisis de las 3 alternativas arquitectónicas más factibles cuando VSA no aplique, y directrices para prevenir sobreingeniería mediante consulta guiada.
---

# vertical-slice — Vertical Slice Architecture, Nomenclatura y Prevención de Sobreingeniería

Esta habilidad define las pautas para estructurar soluciones siguiendo **Vertical Slice Architecture** (VSA) como estilo predeterminado, aplicar rigurosamente las convenciones de nombrado del proyecto, evaluar alternativas arquitectónicas cuando VSA no sea viable y evitar sobreingeniería innecesaria.

---

## 1. Principios de Vertical Slice Architecture (VSA)

A diferencia de las arquitecturas por capas horizontales tradicionales (donde cada cambio requiere modificar controladores, servicios, repositorios y entidades en proyectos separados), VSA corta verticalmente a través de todas las capas para cada requerimiento:

```text
src/
├── Caracteristicas/ (Features)
│   ├── Usuarios/
│   │   ├── UsuarioRegistrar/
│   │   │   ├── UsuarioRegistrarEndpoint.cs (o .ts, .go)
│   │   │   ├── UsuarioRegistrarCommand.cs
│   │   │   ├── UsuarioRegistrarValidator.cs
│   │   │   ├── UsuarioRegistrarCommandHandler.cs
│   │   │   └── UsuarioRegistrarDto.cs
│   │   └── UsuarioObtenerPorId/
│   │       ├── UsuarioObtenerPorIdEndpoint.cs
│   │       ├── UsuarioObtenerPorIdQuery.cs
│   │       ├── UsuarioObtenerPorIdQueryHandler.cs
│   │       └── UsuarioDetalleDto.cs
│   └── Facturacion/
│       └── FacturaGenerar/
│           ├── FacturaGenerarEndpoint.cs
│           ├── FacturaGenerarCommand.cs
│           └── FacturaGenerarCommandHandler.cs
└── Compartido/ (Cross-Cutting / Kernel)
    ├── Autenticacion/
    ├── BaseDatos/
    └── Middleware/
```

### Reglas Clave de VSA:
1. **Alta Cohesión Interna**: Todo lo que necesita una característica para ejecutarse (contrato de entrada, validación, lógica de negocio y consulta de datos) reside junto dentro del mismo slice.
2. **Bajo Acoplamiento entre Slices**: Los slices no deben depender entre sí directamente. Si dos slices necesitan compartir lógica, esta se extrae a un servicio de soporte en `Compartido/` solo tras constatar duplicación real.
3. **Optimización Individual**: Cada slice puede optimizar su persistencia según su caso de uso (ej. una Query puede usar un lector SQL plano de alta velocidad, mientras que un Command puede usar un ORM o repositorio con reglas de agregado).

---

## 2. Convenciones de Nomenclatura

El proyecto aplica una regla híbrida balanceada: **claridad de negocio en español nativo, combinada con prefijos, sufijos y acrónimos técnicos universales en inglés**.

### 2.1 Código de Aplicación (`UpperCamelCase` / PascalCase)

- **Dominio**: En español (sustantivos, verbos, entidades de negocio).
- **Prefijos técnicos (Inglés)**:
  - `I` para interfaces (`IUsuarioRepository`, `IUnitOfWork`, `INotificacionService`).
  - `Base` para clases abstractas o genéricas de base (`BaseEntity`, `BaseValidator`).
- **Sufijos técnicos (Inglés)**:
  - Casos de uso / CQRS: `Command`, `CommandHandler`, `Query`, `QueryHandler`.
  - Roles de arquitectura: `Service`, `Repository`, `Controller`, `Endpoint`, `Validator`, `Factory`, `Strategy`, `Adapter`, `Middleware`, `Filter`.
  - Contratos de transferencia: `Dto`, `Request`, `Response`, `Event`, `EventHandler`, `Exception`, `Config`.
- **Acrónimos técnicos (Inglés)**:
  - Respetar en mayúsculas o camel-case técnico: `JWT`, `DTO`, `UUID`, `API`, `CRUD`, `HTTP`, `UTC`, `SQL`, `JSON`.

#### Ejemplos Correctos:
```text
IUsuarioCrearCommandHandler
UsuarioCrearCommand
UsuarioObtenerPorIdQuery
FacturacionService
AutenticacionJwtMiddleware
ProductoInventarioDto
OrdenCompraCreadaEvent
ClienteValidadorValidator
```

### 2.2 Base de Datos (`snake_case`)

- Todas las tablas, vistas, columnas, índices, llaves foráneas y parámetros deben usar **minúsculas separadas por guion bajo** (`snake_case`).
- **Dominio**: En español (`usuario`, `orden_compra`, `producto`).
- **Acrónimos y términos técnicos (Inglés)**: `id`, `uuid`, `jwt`, `url`, `api`, `utc`, `ip`, `fk`, `pk`, `idx`.

#### Ejemplos Correctos:
```sql
CREATE TABLE public.usuario (
    id_usuario          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid_usuario        UUID NOT NULL DEFAULT gen_random_uuid(),
    nombre_completo     VARCHAR(150) NOT NULL,
    correo_electronico  VARCHAR(254) NOT NULL UNIQUE,
    hash_contrasena     VARCHAR(255) NOT NULL,
    token_jwt_reciente  TEXT NULL,
    fecha_creacion_utc  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion  TIMESTAMPTZ NULL,
    activo              BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## 3. Protocolo de Evaluación cuando VSA no es Factible

Aunque Vertical Slice Architecture es excelente para sistemas de información orientados a casos de uso y APIs de negocio, existen escenarios donde otro estilo arquitectónico es técnica u operativamente superior.

### 3.1 Señales de No Factibilidad de VSA:
- Flujos de procesamiento continuo de streams de datos en tiempo real (event stream processors) sin concepto de "features de usuario".
- Sistemas acoplados estrictamente a esquemas heredados indivisibles con transacciones distribuidas complejas de dos fases (2PC).
- Utilidades o componentes de infraestructura de bajo nivel (ej. drivers, proxies de red, brokers de mensajes dedicados).

### 3.2 Protocolo de las 3 Alternativas Contextuales:
Cuando `softeng` determine o el usuario señale que VSA no es conveniente, el agente **debe analizar la solución planteada y proponer las 3 opciones más viables adaptadas al problema**, describiendo pros, contras y recomendación, para que el usuario elija cuál implementar:

1. **Clean Architecture / Hexagonal (Puertos y Adaptadores)**:
   - *Ideal para*: Dominios de negocio extremadamente ricos, independientes de interfaces de usuario o motores de persistencia cambiantes.
2. **Modular Monolith (Monolito Modular)**:
   - *Ideal para*: Sistemas multicomponente con fronteras de dominio (*Bounded Contexts*) que requieren despliegue unificado sin la sobrecarga de red y orquestación de microservicios.
3. **Event-Driven Architecture (EDA / Pipes & Filters)**:
   - *Ideal para*: Ingesta masiva, procesamiento de telemetría, pipelines asíncronos y desacoplamiento temporal de eventos.
4. **Microservicios Distribuidos**:
   - *Ideal para*: Múltiples equipos autónomos con ciclos de despliegue independientes y escalabilidad asimétrica comprobada.
5. **CQRS con Event Sourcing Puro**:
   - *Ideal para*: Sistemas con requerimientos regulatorios de auditoría inmutable, trazabilidad temporal completa de estados y modelos de lectura/escritura radicalmente dispares.

---

## 4. Prevención de Sobreingeniería Guiada por el Usuario

Para evitar la introducción innecesaria de abstracciones complejas (interfaces para una sola implementación, fábricas abstractas para objetos simples, cadenas de responsabilidad o decoradores prematuros):

1. **Regla de Identificación**: `softeng` analiza el problema e identifica qué patrones podrían aplicar de forma natural.
2. **Consulta Obligatoria**: Antes de abstraer cualquier componente o introducir un patrón, `softeng` debe presentar al usuario:
   - El patrón propuesto (ej. `Strategy`, `Factory Method`, `Decorator`, `Specification`).
   - El motivo técnico y problema que pretende resolver.
   - La complejidad adicional introducida (más clases, indirección, carga cognitiva).
   - Preguntar explícitamente: *¿Deseas aplicar este patrón ahora o mantener la lógica directa dentro del slice?*
3. **Resolución**: Si el usuario opta por la simplicidad, se mantiene el código directo e idiomático; si el usuario aprueba la abstracción, se implementa con las debidas interfaces y pruebas.

