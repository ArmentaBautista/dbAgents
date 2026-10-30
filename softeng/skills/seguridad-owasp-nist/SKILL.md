---
name: seguridad-owasp-nist
description: Gobierno de seguridad integral en arquitectura y código. Mapeo de OWASP API Security Top 10, niveles OWASP ASVS (L1 a L3), controles de seguridad NIST SP 800-53 (familias AC, IA, SC, AU, SI), y generación formal de reportes de pruebas de seguridad SAST, DAST y SCA bajo la guía NIST SP 800-115 con enfoque dual (ejecución CLI o pipeline CI/CD).
---

# seguridad-owasp-nist — Seguridad Arquitectónica y Pruebas NIST SP 800-115

Esta habilidad proporciona el marco normativo, los controles defensivos y las directrices de prueba para garantizar que todo diseño e implementación producido por `softeng` cumpla con los estándares internacionales más rigurosos de la industria: **OWASP API Security Top 10**, **OWASP ASVS**, **NIST SP 800-53** y **NIST SP 800-115**.

---

## 1. Capítulo Global de Seguridad Arquitectónica

Toda solución diseñada debe incluir en `docs/seguridad/arquitectura-seguridad-global.md` un capítulo transversal que defina la postura defensiva del sistema.

### 1.1 Matriz OWASP API Security Top 10 (2023)

| ID OWASP | Vulnerabilidad | Estrategia de Mitigación Obligatoria en Diseño |
|---|---|---|
| **API1:2023** | Broken Object Level Authorization (BOLA) | Validación de pertenencia del recurso a nivel de datos (`WHERE id_usuario = @usuario_actual`) en cada slice; no confiar únicamente en identificadores en URLs. |
| **API2:2023** | Broken Authentication | Autenticación robusta con tokens JWT firmados asimétricamente (RS256/EdDSA), expiración corta (15 min), rotación segura de refresh tokens y protección contra fuerza bruta. |
| **API3:2023** | Broken Object Property Level Authorization (BOPLA) | Uso estricto de DTOs de entrada/salida (Command/Response DTOs) para evitar *Mass Assignment* y exposición excesiva de datos de persistencia. |
| **API4:2023** | Unrestricted Resource Consumption | Limitación de tasa de peticiones (*Rate Limiting* por IP y usuario), paginación obligatoria en colecciones y límites de tamaño en payloads JSON/multipart. |
| **API5:2023** | Broken Function Level Authorization (BFLA) | Control de acceso basado en roles o atributos (RBAC/ABAC) validado en middleware y en la entrada de cada handler/endpoint. |
| **API6:2023** | Unrestricted Access to Sensitive Flows | Mecanismos de protección (CAPTCHA, step-up auth, verificación en dos pasos) en flujos de compra, cambio de credenciales y registros. |
| **API7:2023** | Server-Side Request Forgery (SSRF) | Validación con lista blanca estricta de dominios permitidos y bloqueo de accesos a redes privadas (`127.0.0.1`, `10.0.0.0/8`, metadata cloud `169.254.169.254`). |
| **API8:2023** | Security Misconfiguration | Desactivación de depuración en producción, deshabilitación de cabeceras informativas (`X-Powered-By`), uso de cabeceras HTTP defensivas (`HSTS`, `CSP`, `X-Frame-Options`). |
| **API9:2023** | Improper Inventory Management | Versionado explícito de endpoints (`/api/v1/`), inventario OpenAPI actualizado y retiro documentado de versiones obsoletas. |
| **API10:2023** | Unsafe Consumption of APIs | Validación rigurosa de entradas recibidas de APIs externas de terceros y configuración de tiempos de espera (*timeouts*) estrictos. |

---

### 1.2 Niveles OWASP ASVS (Application Security Verification Standard v4.0)

El diseño debe declarar el nivel objetivo:
- **Nivel 1 (Oportunista / Básico)**: Para aplicaciones públicas sin datos sensibles. Verificable mediante análisis automatizado y pruebas de penetración de caja negra.
- **Nivel 2 (Estándar / Recomendado)**: Para aplicaciones de negocio que procesan transacciones comerciales, datos personales (PII) o información corporativa sensible. Exige autenticación multifactor, control de acceso riguroso, criptografía moderna y registro de eventos.
- **Nivel 3 (Avanzado / Crítico)**: Para infraestructuras críticas, sistemas bancarios/financieros o salud. Exige verificación formal de límites de seguridad, separación de privilegios y resistencia a manipulaciones avanzadas.

---

### 1.3 Controles Críticos NIST SP 800-53 (Rev. 5)

El diseño arquitectónico debe mapear explícitamente los controles de las siguientes familias:

```text
+-------------------------------------------------------------------------+
|                  NIST SP 800-53 CONTROLES DE SEGURIDAD                  |
+--------------------+----------------------------------------------------+
| Familia            | Controles Clave Implementados                      |
+--------------------+----------------------------------------------------+
| AC (Access Control)| AC-2: Gestión de cuentas de usuario                |
|                    | AC-3: Cumplimiento de autorización en recursos     |
|                    | AC-6: Principio de mínimo privilegio               |
+--------------------+----------------------------------------------------+
| IA (Ident. & Auth) | IA-2: Autenticación fuerte de usuarios             |
|                    | IA-5: Gestión segura de contraseñas y tokens       |
+--------------------+----------------------------------------------------+
| SC (System & Comms)| SC-8: Cifrado en tránsito (TLS 1.3 estricto)       |
|                    | SC-13: Protección criptográfica estándar (AES-256) |
|                    | SC-28: Cifrado de datos en reposo                  |
+--------------------+----------------------------------------------------+
| AU (Audit & Acc.)  | AU-2: Registro de eventos de seguridad             |
|                    | AU-3: Contenido de traza (timestamp UTC, usuario)  |
|                    | AU-9: Protección de logs contra alteración         |
+--------------------+----------------------------------------------------+
| SI (System Integrity)| SI-2: Remediación y actualización de parches     |
|                    | SI-10: Validación estricta de entradas y encoding  |
+--------------------+----------------------------------------------------+
```

---

## 2. Metodología de Pruebas de Seguridad NIST SP 800-115

NIST SP 800-115 (*Technical Guide to Information Security Testing and Assessment*) divide la evaluación en cuatro fases:
1. **Planificación (Planning)**: Alcance, reglas de compromiso y objetivos de seguridad.
2. **Descubrimiento e Identificación de Objetivos (Target Identification)**: Mapeo de superficie de ataque, puertos, rutas API y dependencias externas.
3. **Ejecución y Análisis de Vulnerabilidades (Vulnerability Assessment & Execution)**:
   - **SAST (Static Application Security Testing)**: Escaneo de código fuente sin ejecución para detectar fallas lógicas, inyecciones SQL/NoSQL, buffers o credenciales quemadas.
   - **SCA (Software Composition Analysis)**: Escaneo de paquetes y bibliotecas de terceros frente a bases de datos de vulnerabilidades conocidas (CVE / NVD).
   - **DAST (Dynamic Application Security Testing)**: Análisis interactivo y pruebas dinámicas sobre la aplicación en tiempo de ejecución (validación de cabeceras, fuzzing de payloads y comportamiento ante respuestas anómalas).
4. **Post-Evaluación y Reporte (Post-Assessment & Reporting)**: Documentación de hallazgos con severidad CVSS v3, análisis de causa raíz y planes de acción con plazos de remediación.

---

## 3. Enfoque Dual de Evaluación (Ejecución Real o Pipeline)

### Caso A: El código existe en el workspace
`softeng` busca herramientas instaladas o disponibles en el entorno para ejecutar las pruebas y consolidar hallazgos:
- **SCA**: Ejecutar `npm audit --json`, `dotnet list package --vulnerable` o `pip audit`.
- **SAST**: Invocar analizadores nativos (`dotnet format analyzers`, `eslint-plugin-security`, `gosec`, `semgrep`).
- **DAST**: Si el servicio está levantado, ejecutar pruebas de cabeceras HTTP defensivas y escaneo con `zap-baseline.py` o scripts de verificación automatizada.

### Caso B: Es un proyecto nuevo o diseño en curso
`softeng` genera:
1. El archivo de pipeline CI/CD en `.github/workflows/seguridad-sast-dast-sca.yml` (o GitLab CI equivalente).
2. El reporte formal inicial de postura de seguridad y baseline en `docs/seguridad/reporte-seguridad-nist-800-115.md`.

---

## 4. Plantilla de Pipeline CI/CD Automatizado para Seguridad

```yaml
name: Evaluacion de Seguridad (SAST, DAST, SCA) - NIST SP 800-115

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  analisis-sca:
    name: SCA - Analisis de Dependencias
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Escaneo de vulnerabilidades con Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'table'
          severity: 'CRITICAL,HIGH'

  analisis-sast:
    name: SAST - Seguridad Estatica de Codigo
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep OSS
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten

  analisis-dast:
    name: DAST - Escaneo Dinamico de API
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OWASP ZAP API Scan
        uses: zaproxy/action-api-scan@v0.8.0
        with:
          target: 'docs/arquitectura/openapi.json'
          rules_file_name: '.zap/rules.tsv'
          fail_action: false
```

---

## 5. Estructura del Reporte NIST SP 800-115

El reporte generado en `docs/seguridad/reporte-seguridad-nist-800-115.md` debe seguir obligatoriamente este formato:

```markdown
# Reporte de Evaluación de Seguridad Técnica (NIST SP 800-115)

## 1. Información General y Alcance
- **Fecha de Evaluación**: AAAA-MM-DD
- **Evaluador**: softeng (Software Engineering & Architecture Agent)
- **Sistema Objetivo**: [Nombre del Sistema]
- **Alcance**: Código fuente de aplicación, dependencias de terceros y endpoints API.

## 2. Resumen Ejecutivo de Hallazgos
| Severidad | SAST | SCA | DAST | Total |
|---|---|---|---|---|
| Crítica (CVSS 9.0 - 10.0) | 0 | 0 | 0 | 0 |
| Alta (CVSS 7.0 - 8.9) | 0 | 0 | 0 | 0 |
| Media (CVSS 4.0 - 6.9) | 0 | 0 | 0 | 0 |
| Baja / Info (CVSS 0.1 - 3.9) | 0 | 0 | 0 | 0 |

## 3. Análisis de Composición de Software (SCA)
- **Herramienta Utilizada**: Trivy / npm audit / dotnet list
- **Inventario de Dependencias Analizadas**: X paquetes
- **Vulnerabilidades Detectadas**: [Detalle de CVEs, paquete afectado, versión corregida y CVSS]

## 4. Análisis de Seguridad Estática (SAST)
- **Herramienta Utilizada**: Semgrep / Analizadores estáticos de lenguaje
- **Hallazgos**: [Archivo, línea, regla OWASP/CWE vulnerada y fragmento de código]

## 5. Evaluación de Seguridad Dinámica (DAST)
- **Herramienta Utilizada**: OWASP ZAP / Verificación HTTP
- **Hallazgos de Runtime**: [Validación de cabeceras defensivas, BOLA, control de acceso y rate limiting]

## 6. Plan de Remediación y Acciones Correctivas
| ID Hallazgo | Vulnerabilidad | Severidad | Acción Requerida | Plazo Máximo | Responsable |
|---|---|---|---|---|---|
| SEC-001 | ... | Alta | ... | 7 días | Equipo Backend |
```

