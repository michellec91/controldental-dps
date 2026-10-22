# Control Dental

**Control Dental** es una aplicación web administrativa desarrollada para apoyar la gestión de una clínica dental.

El sistema permite administrar citas, solicitudes, tratamientos, agenda, horarios y perfil del administrador, además de consultar información general de la clínica mediante un dashboard dinámico.

Proyecto desarrollado para la asignatura **DPS941 – Universidad Don Bosco, Ciclo II 2026**.

---

## Aplicación

Control Dental está compuesto actualmente por:

- Frontend administrativo desarrollado con Next.js y React.
- API REST desarrollada con Node.js y Express.
- Base de datos MySQL.
- Gestión de imágenes mediante UploadThing.

Durante el desarrollo local:

```text
Frontend:
http://localhost:3000

API REST:
http://localhost:3001
```

---

## Tecnologías

### Frontend

- Next.js
- React
- TypeScript
- JavaScript
- CSS Modules
- React Icons

### Backend

- Node.js
- Express
- MySQL
- mysql2
- bcrypt
- CORS
- dotenv

### Servicios adicionales

- UploadThing para almacenamiento de imágenes.
- Git y GitHub para control de versiones.

---

## Funcionalidades

- Autenticación de administrador.
- Contraseñas protegidas mediante bcrypt.
- Rutas administrativas protegidas.
- Dashboard administrativo dinámico.
- Consulta de citas por fecha.
- Gestión de tratamientos.
- Gestión de solicitudes de citas.
- Confirmación y cancelación de citas.
- Reprogramación de citas.
- Agenda administrativa semanal.
- Gestión de horarios de atención.
- Gestión del perfil del administrador.
- Cambio de contraseña.
- Fotografía de perfil mediante UploadThing.
- Consumo de API REST.
- Persistencia de información en MySQL.

---

## Arquitectura

La aplicación utiliza una arquitectura cliente-servidor.

```text
Usuario administrador
        │
        ▼
Next.js + React
Frontend administrativo
        │
        │ HTTP / API REST
        ▼
Node.js + Express
Backend
        │
        ▼
MySQL
Base de datos
```

Para las imágenes:

```text
Frontend
   │
   ▼
UploadThing
   │
   ▼
URL de imagen
   │
   ▼
MySQL
```

La base de datos no almacena directamente los archivos de imagen, sino la URL generada por UploadThing.

---

## Base de datos

La aplicación utiliza una base de datos MySQL llamada:

```text
control_dental
```

Entre sus tablas principales se encuentran:

```text
usuarios
tratamientos
citas
horarios
```

### Usuarios

La tabla `usuarios` almacena los administradores y pacientes del sistema.

Roles utilizados:

```text
Administrador
Paciente
```

Estados principales:

```text
Activo
Inactivo
```

### Tratamientos

Los tratamientos incluyen:

```text
id_tratamiento
nombre
descripcion
precio
duracion
estado
imagen
```

### Citas

Las citas incluyen:

```text
id_cita
id_usuario
id_tratamiento
fecha
hora
estado
fecha_creacion
```

Estados utilizados:

```text
Pendiente
Confirmada
Cancelada
Completada
```

Las citas canceladas se conservan en la base de datos para mantener el historial.

### Horarios

Los horarios incluyen:

```text
id_horario
dia_semana
hora_inicio
hora_fin
estado
```

La clínica trabaja de lunes a sábado.

Los domingos no están habilitados para atención.

---

## API REST

La API se ejecuta localmente en:

```text
http://localhost:3001
```

Recursos principales:

```text
/usuarios
/tratamientos
/citas
/horarios
```

Ejemplos:

```text
GET    /usuarios
POST   /usuarios/login
POST   /usuarios/register

GET    /tratamientos
POST   /tratamientos
PUT    /tratamientos/:id

GET    /citas
POST   /citas
PUT    /citas/:id
PATCH  /citas/:id/estado
DELETE /citas/:id

GET    /horarios
POST   /horarios
PUT    /horarios/:id
DELETE /horarios/:id
```

En el caso de las citas, `DELETE /citas/:id` realiza una cancelación lógica, por lo que el registro permanece almacenado con estado `Cancelada`.

---

## Variables de entorno

### Backend

Crear un archivo:

```text
.env
```

con una configuración similar a:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=control_dental
DB_PORT=3306
PORT=3001
```

### Frontend

Crear:

```text
.env.local
```

con:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Las credenciales y tokens privados no deben subirse al repositorio.

---

## Ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/michellec91/controldental-dps.git
cd controldental-dps
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar MySQL

Iniciar MySQL mediante XAMPP o el servidor MySQL utilizado durante el desarrollo.

La base de datos utilizada es:

```text
control_dental
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Ejecutar seeders

```bash
npm run db:seed
```

Los seeders permiten cargar información inicial necesaria para el desarrollo.

Entre estos datos se encuentra el administrador de prueba.

### 6. Iniciar la API

En una terminal:

```bash
npm run api
```

La API estará disponible en:

```text
http://localhost:3001
```

Para verificar su funcionamiento se puede acceder desde el navegador a:

```text
http://localhost:3001
```

### 7. Iniciar el frontend

En otra terminal:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

---

## Seeders

El proyecto utiliza seeders en JavaScript para cargar información inicial de forma controlada.

Entre ellos:

```text
001_seed_admin.js
002_seed_tratamientos.js
003_seed_horarios.js
```

Los seeders verifican la existencia de los registros antes de insertarlos para evitar duplicados.

---

## Autenticación

El inicio de sesión se realiza mediante:

```text
POST /usuarios/login
```

Las contraseñas se almacenan utilizando bcrypt.

El frontend conserva la información básica de la sesión del administrador y utiliza rutas protegidas para evitar el acceso no autorizado al panel administrativo.

---

## Gestión de imágenes

Las imágenes se almacenan mediante UploadThing.

Actualmente se utiliza para:

- Fotografías de perfil.
- Imágenes de tratamientos.

Después de subir una imagen, la URL correspondiente se almacena en MySQL.

---

## Control de versiones

El proyecto utilizó ramas independientes para el desarrollo de diferentes módulos.

```text
feature/autenticacion
feature/tratamientos
feature/solicitudes
feature/agenda
feature/dashboard-perfil
```

Los cambios fueron integrados inicialmente en:

```text
testing
```

y posteriormente en:

```text
main
```

La rama `main` contiene la versión integrada del proyecto.

---

## Estructura general

```text
controldental-dps/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── seeders/
│   └── server.js
│
├── src/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── features/
│   ├── lib/
│   └── services/
│
├── public/
├── .env
├── .env.local
└── package.json
```

---

## Credenciales de administrador de desarrollo

Para acceder al panel administrativo después de ejecutar los seeders:

```text
Correo:
admin@controldental.com

Contraseña:
Admin1234
```

Estas credenciales son únicamente para desarrollo y pruebas.

**No deben utilizarse como credenciales de producción.**

---

## Repositorio

```text
https://github.com/michellec91/controldental-dps
```

---

## Proyecto académico

**Control Dental**  
**DPS941**  
**Universidad Don Bosco**  
**Ciclo II – 2026**.