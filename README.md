# Control Dental

**Control Dental** es una aplicación web administrativa desarrollada para apoyar la gestión de una clínica dental.

El sistema permite administrar citas, solicitudes, tratamientos, agenda y perfil de usuario, además de consultar información de la clínica mediante un dashboard dinámico.

Proyecto desarrollado para la asignatura **DPS941 – Universidad Don Bosco, Ciclo II 2026**.

---

## Aplicación

### Frontend – Vercel

**Aplicación web:**  
PEGAR_AQUÍ_LA_URL_DE_VERCEL

### API REST – Render

**API:**  
https://controldental-dps.onrender.com

Recursos principales:

- `/usuarios`
- `/tratamientos`
- `/citas`

---

## Tecnologías

- Next.js
- React
- TypeScript
- JavaScript
- CSS Modules
- JSON Server
- Node.js
- Git y GitHub
- Vercel
- Render

---

## Funcionalidades

- Autenticación y control de acceso.
- Rutas protegidas.
- Dashboard administrativo dinámico.
- Consulta de información por fecha.
- Gestión de tratamientos.
- Gestión de solicitudes de citas.
- Agenda administrativa.
- Gestión de perfil.
- Consumo de API REST.

---

## Arquitectura

```text
Usuario
   │
   ▼
Vercel
Next.js + React
   │
   ▼
Render
API REST - JSON Server
   │
   ▼
db.json
```

El frontend utiliza la variable de entorno:

```env
NEXT_PUBLIC_API_URL=https://controldental-dps.onrender.com
```

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

### 3. Iniciar la API local

```bash
npx json-server db.json --port 3001
```

### 4. Iniciar la aplicación

En otra terminal:

```bash
npm run dev
```

Aplicación:

```text
http://localhost:3000
```

API:

```text
http://localhost:3001
```

---

## Control de versiones

El proyecto utilizó ramas independientes para el desarrollo de los diferentes módulos.

```text
feature/autenticacion
feature/tratamientos
feature/solicitudes
feature/agenda
feature/dashboard-perfil
```

Los cambios fueron integrados primero en:

```text
testing
```

y posteriormente en:

```text
main
```

La rama `main` contiene la versión utilizada actualmente para producción.

---

## Despliegue

- **Frontend:** Vercel
- **API REST:** Render
- **Repositorio:** GitHub

La aplicación desplegada puede utilizarse sin necesidad de ejecutar el proyecto localmente.

---

## Repositorio

https://github.com/michellec91/controldental-dps

---

## Proyecto académico

**Control Dental**  
**DPS941**  
**Universidad Don Bosco**  
**Ciclo II – 2026**
