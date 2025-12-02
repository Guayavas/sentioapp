# Backend - Instrucciones de Ejecución

Este backend está desarrollado en **.NET 7** y utiliza **SQL Server** como base de datos.

## 1. Requisitos Previos

- .NET 7 SDK instalado.
- SQL Server instalado y en ejecución.

## 2. Configuración de Base de Datos

1. Abra SQL Server Management Studio (SSMS) o su herramienta preferida.
2. Cree una nueva base de datos llamada `ProjectDB` (o el nombre que prefiera).
3. Abra el archivo `init_db.sql` ubicado en la carpeta `Backend`.
4. Ejecute todo el script en la nueva base de datos.
   - Esto creará las tablas `Users`, `Categories`, `Questions`, `Imports`, `Responses`.
   - Creará un usuario Admin: `admin@example.com` / `admin`.

## 3. Configuración de la Aplicación

1. Abra el archivo `Backend/WebApi/appsettings.json`.
2. Modifique la cadena de conexión `DefaultConnection` para que apunte a su servidor SQL local.
   - Ejemplo: `"Server=DESKTOP-XYZ;Database=ProjectDB;Trusted_Connection=True;TrustServerCertificate=True;"`

## 4. Ejecución

Desde la terminal, navegue a la carpeta `Backend/WebApi` y ejecute:

```bash
dotnet run
```

La API estará disponible en `http://localhost:5000` (o el puerto que asigne).
Puede ver la documentación Swagger en `http://localhost:5000/swagger`.

## 5. Endpoints Principales

- **POST /api/auth/login**: Login (user: `admin@example.com`, pass: `admin`).
- **POST /api/import/upload**: Subir archivo `.xlsm`.
- **GET /api/data/hierarchy**: Obtener árbol de Categorías -> Preguntas.
