# 📦 SISTEMA DE GESTIÓN Y PUNTO DE VENTA PARA FARMACIAS BRASIL

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente en tu sistema:

#### Requisitos generales:
- **Git** (para clonar el repositorio) → [Descargar Git](https://git-scm.com/)
- **Un editor de código** (recomendado: [Visual Studio Code](https://code.visualstudio.com/))

####  Backend (ASP.NET Core)
- **.NET SDK 7.0 o superior** → [Descargar .NET SDK](https://dotnet.microsoft.com/en-us/download/dotnet)
- **SQL Server** (para la base de datos) → [Descargar SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Entity Framework Core** 

#### Frontend (React + Next.js)
- **Node.js 18 LTS o superior** → [Descargar Node.js](https://nodejs.org/es)


## 🚀 Configuración del Proyecto

Este proyecto consta de dos partes: **backend** (ASP.NET Core Web API) y **frontend** (React con Next.js). A continuación, se detallan los comandos para ejecutar, reconstruir y limpiar cada parte del proyecto.

### 🔧 Backend (ASP.NET Core)

Para administrar el backend, usa los siguientes comandos:

- **Ejecutar el servidor:**  

```bash
dotnet run
```
- **Reconstruir el proyecto:**

```bash
dotnet build
```
- **Limpiar archivos generados:**

```bash
dotnet clean
```

### 🎨 Frontend (React + Next)

Para administrar el frontend, usa los siguientes comandos:

- **Ejecutar el entorno de desarrollo:**

```bash
npm run dev
```
- **Construir el proyecto para producción:**

```bash
npm run build
```
- **Iniciar el servidor en modo producción:**
```bash
npm start
```

## Arquitectura del Proyecto

![App Screenshot](architecture/diagram-project.png)



## Reglas de Colaboración en el Repositorio

Este repositorio sigue un flujo de trabajo organizado para asegurar un desarrollo eficiente. A continuación se detallan las reglas para trabajar con las ramas principales: `main` y `DevOps`, y el flujo de trabajo a seguir.

### Ramas Principales

1. **`main`**:
   - Esta es la **rama de producción**.
   - Siempre debe estar en un estado funcional y libre de errores.
   - Los cambios directos en `main` están **prohibidos**. Los cambios deben ser primero integrados en la rama `DevOps` y luego fusionados con `main` a través de un proceso controlado.
   - Los despliegues a producción se realizan directamente desde `main`.

2. **`DevOps`**:
   - Esta rama se utiliza como **pre-producción**. En ella se concentran los cambios de código, nuevas características y correcciones antes de ser fusionados a `main`.
   - Las ramas de desarrollo deben fusionarse a `DevOps` para su revisión y pruebas antes de hacer el merge final a `main`.


### Flujo de Trabajo

#### **Creación de Ramas de Desarrollo**

- **Ramas de características (Feature Branches)**:
   
   Antes de comenzar a trabajar en una nueva funcionalidad, crea una rama a partir de `DevOps`.
   El nombre de la rama debe ser claro y descriptivo, por ejemplo:

     ```
     feature/nueva-funcionalidad
     ```
   Desarrolla tus cambios y realiza commits frecuentemente en tu rama local.

- **Ramas de corrección de errores (Bugfix Branches)**:
   
   Si encuentras un error en el código, crea una rama desde `DevOps` con el siguiente formato:
     ```
     bugfix/correccion-error
     ```

#### **Fusionar Cambios a `DevOps`**

- Una vez que hayas terminado de desarrollar la funcionalidad o corregir el error, fusiona tu rama temporal a `DevOps` mediante un **Pull Request (PR)**.
- **PR a `DevOps`**: Antes de hacer el merge, asegúrate de que el código haya sido revisado.
  - **Revisión de código**: El PR debe ser revisado y aprobado por al menos un miembro del equipo antes de fusionarse.
  - **Pruebas en DevOps**: Se recomienda realizar pruebas en `DevOps` antes de fusionar a `main`.

#### **Fusión de `DevOps` a `main`**

- Una vez que los cambios en `DevOps` estén listos para producción y se haya verificado que todo funciona correctamente, se procederá a fusionar `DevOps` a `main`.


#### **Eliminación de Ramas Temporales**

- Después de fusionar tu rama temporal (feature o bugfix) a `DevOps`, **puedes eliminarla** si ya no la necesitas. Esto mantiene el repositorio limpio y organizado.


## Autores

- [Jonatan Elías Guevara](https://github.com/jonatanegcPM)
- [Keyri Daniela Chávez]()
- [Rodrigo Alexander Mejía]()
- [Adonys de Jesús Amaya]()
- [José Carlos López](https://github.com/Jos3C190)

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)