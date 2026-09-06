# Control Dental

Proyecto desarrollado para la asignatura **Diseño y Programación de Software Multiplataforma (DPS941)**.

## Etapa 2 - Desarrollo Web

Esta etapa corresponde al desarrollo de la plataforma web administrativa de **Control Dental**, una solución para apoyar la gestión de citas y tratamientos de la Clínica Dental Sonrisas.

## Tecnologías utilizadas

- React
- Next.js
- TypeScript
- Node.js
- npm
- JSON Server
- db.json
- Git
- GitHub

## Requisitos previos

Antes de ejecutar el proyecto se debe tener instalado:

- Node.js
- npm
- Git
- Visual Studio Code

## Instalación

Después de clonar el repositorio, ingresar a la carpeta del proyecto y ejecutar:

```bash
npm install
```

Este comando instalará las dependencias necesarias definidas en `package.json`.

## Ejecutar la aplicación web

Para iniciar Next.js:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

La terminal donde se ejecuta este comando debe permanecer abierta mientras se trabaja con la aplicación.

## Ejecutar la API REST

Para iniciar JSON Server, abrir una terminal adicional y ejecutar:

```bash
npm run api
```

La API estará disponible en:

```text
http://localhost:3001
```

Endpoints principales:

```text
http://localhost:3001/usuarios
http://localhost:3001/tratamientos
http://localhost:3001/citas
```

Para trabajar con la aplicación y la API al mismo tiempo deben permanecer activos:

```text
npm run dev   → Next.js / puerto 3000
npm run api   → JSON Server / puerto 3001
```

## Estructura principal del proyecto

```text
src/
├── app/
├── components/
├── context/
├── features/
│   ├── autenticacion/
│   ├── tratamientos/
│   ├── solicitudes/
│   ├── agenda/
│   └── dashboard-perfil/
├── hooks/
├── services/
└── utils/
```

### Función de las carpetas

- `app`: páginas, rutas y estructura principal de Next.js.
- `components`: componentes reutilizables de la interfaz.
- `context`: manejo de estado global mediante Context API.
- `features`: módulos funcionales asignados a cada integrante.
- `hooks`: hooks personalizados de React.
- `services`: funciones relacionadas con la comunicación con la API REST.
- `utils`: funciones auxiliares y validaciones reutilizables.

## División del equipo

| Integrante | Módulo | Rama |
|---|---|---|
| Sara | Autenticación y control de acceso | `feature/autenticacion` |
| Andrés | Gestión de tratamientos | `feature/tratamientos` |
| Jehudi | Solicitudes de citas | `feature/solicitudes` |
| Francisco | Agenda administrativa | `feature/agenda` |
| Silvia | Dashboard y perfil | `feature/dashboard-perfil` |

## Flujo de trabajo con Git

Todos los integrantes trabajarán sobre el mismo repositorio.

Después de aceptar la invitación como colaborador, cada integrante debe clonar el repositorio:

```bash
git clone https://github.com/michellec91/controldental-dps.git
```

Después debe ingresar a la carpeta del proyecto:

```bash
cd controldental-dps
```

Instalar las dependencias:

```bash
npm install
```

### Crear la rama asignada

Cada integrante debe crear únicamente la rama correspondiente a su módulo.

Ejemplo para autenticación:

```bash
git checkout -b feature/autenticacion
```

Las ramas asignadas son:

```text
feature/autenticacion
feature/tratamientos
feature/solicitudes
feature/agenda
feature/dashboard-perfil
```

Para comprobar en qué rama se está trabajando:

```bash
git branch
```

La rama activa aparecerá marcada con `*`.

## Guardar y subir cambios

Después de realizar cambios:

```bash
git add .
```

Crear un commit descriptivo:

```bash
git commit -m "Descripción del cambio realizado"
```

La primera vez que se suba una rama a GitHub:

```bash
git push -u origin nombre-de-la-rama
```

Ejemplo:

```bash
git push -u origin feature/autenticacion
```

Después de establecer la conexión de la rama, los siguientes cambios podrán subirse con:

```bash
git push
```

## Importante

No se debe desarrollar directamente sobre la rama:

```text
main
```

Cada integrante debe trabajar únicamente en su rama asignada.

Los cambios serán integrados posteriormente a `main` después de ser revisados y probados.

## Base de datos de prueba

Durante la Etapa 2 se utilizará `db.json` como base de datos de prueba y JSON Server como API REST.

Actualmente contiene las colecciones:

```json
{
  "usuarios": [],
  "tratamientos": [],
  "citas": []
}
```

### Uso de las colecciones

- `usuarios`: autenticación, roles y perfiles.
- `tratamientos`: información de los tratamientos odontológicos.
- `citas`: solicitudes, agenda y estados de las citas.

Las solicitudes de citas se manejarán dentro de `citas` mediante estados como:

```text
pendiente
confirmada
rechazada
cancelada
```

## Puertos utilizados

| Servicio | Puerto |
|---|---:|
| Next.js | 3000 |
| JSON Server | 3001 |

## Proyecto académico

**Universidad Don Bosco**  
Diseño y Programación de Software Multiplataforma - DPS941  
Grupo C - Nova Tech  
Proyecto: **Control Dental**