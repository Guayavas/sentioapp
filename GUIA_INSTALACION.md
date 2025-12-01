# Guía Completa de Instalación, Configuración y Ejecución

Esta guía detalla paso a paso cómo poner en marcha la aplicación **Gestor de Materia**, conectando el Frontend (Angular), el Backend (.NET 7) y la Base de Datos (SQL Server).

---

## 1. Requisitos Previos

Antes de empezar, asegúrate de tener instalado en tu máquina:

1.  **Node.js (v18 o superior):** Para ejecutar el Frontend.
    -   *Verificar:* Abre una terminal y escribe `node -v`.
2.  **.NET 7 SDK:** Para ejecutar el Backend.
    -   *Verificar:* Abre una terminal y escribe `dotnet --list-sdks`. Debe aparecer la versión 7.0.
3.  **SQL Server (Express o Developer):** El motor de base de datos.
4.  **SQL Server Management Studio (SSMS):** Para ejecutar los scripts de base de datos.

---

## 2. Configuración de la Base de Datos (SQL Server)

El Backend necesita saber dónde guardar los datos.

1.  Abre **SQL Server Management Studio (SSMS)** y conéctate a tu servidor local (usualmente `localhost` o `.\SQLEXPRESS`).
2.  Crea una **nueva Base de Datos**:
    -   Clic derecho en "Databases" -> "New Database".
    -   Nombre: `ProjectDB` (Puedes usar otro, pero recuérdalo).
3.  **Ejecutar el Script de Inicialización:**
    -   En SSMS, selecciona la base de datos `ProjectDB` que acabas de crear.
    -   Haz clic en "New Query".
    -   Copia y pega el contenido del archivo `Backend/init_db.sql` que está en este proyecto.
    -   Presiona **F5** o "Execute".
    -   *Resultado:* Deberías ver un mensaje "Command(s) completed successfully". Esto creó las tablas `Users`, `Imports`, `Categories`, `Questions` y `Responses`, y un usuario administrador.

---

## 3. Configuración y Ejecución del Backend (.NET 7)

El Backend es el puente entre la web y la base de datos.

1.  **Configurar la Conexión:**
    -   Ve a la carpeta `Backend/WebApi`.
    -   Abre el archivo `appsettings.json`.
    -   Busca la línea: `"DefaultConnection": "Server=localhost;Database=ProjectDB;Trusted_Connection=True;..."`
    -   **Importante:** Si tu SQL Server tiene un nombre específico (ej. `DESKTOP-XYZ\SQLEXPRESS`), cambia `Server=localhost` por ese nombre. Asegúrate que `Database` coincida con el nombre que creaste en el paso 2.

2.  **Ejecutar el Backend:**
    -   Abre una terminal en la carpeta `Backend/WebApi`.
    -   Ejecuta el comando:
        ```bash
        dotnet run
        ```
    -   *Éxito:* Verás un mensaje diciendo `Now listening on: http://localhost:5000`.
    -   **¡No cierres esta terminal!** Debe quedarse abierta para que la app funcione.

---

## 4. Configuración y Ejecución del Frontend (Angular)

La interfaz visual donde interactúa el usuario.

1.  **Instalar Dependencias (Solo la primera vez):**
    -   Abre una **nueva** terminal en la carpeta raíz del proyecto (donde está el `package.json`).
    -   Ejecuta:
        ```bash
        npm install
        ```

2.  **Ejecutar el Frontend:**
    -   En la misma terminal, ejecuta:
        ```bash
        npm start
        ```
    -   *Éxito:* Verás un mensaje `Application bundle generation complete` y te dirá que escuches en `http://localhost:4200`.

---

## 5. Prueba de Conexión (Sincronización)

Ahora que las tres partes (SQL, Backend, Frontend) están corriendo:

1.  Abre tu navegador y ve a `http://localhost:4200`.
2.  Deberías ver la pantalla de **Login**.
3.  **Credenciales por defecto:**
    -   Usuario: `admin@example.com`
    -   Contraseña: `admin`
4.  Si logras entrar al "Home", ¡felicidades! La conexión **Frontend -> Backend -> SQL** funciona correctamente.

### Probar Carga de Excel:
1.  En la barra superior, haz clic en el botón "Importar".
2.  Selecciona tu archivo `.xlsm`.
3.  Si sale un mensaje verde de "Éxito", el archivo viajó desde Angular, pasó por .NET y se guardó en SQL Server.
4.  Ve a la sección "Explorador" para ver tus datos organizados.

---

## 6. Solución de Problemas Comunes

-   **Error de CORS (Bloqueo en el navegador):**
    -   Asegúrate que el Backend esté corriendo **exactamente** en el puerto 5000 (`http://localhost:5000`). Si corre en otro puerto, Angular no podrá encontrarlo.

-   **Error de Conexión SQL (Backend se cierra al intentar login):**
    -   Revisa el `appsettings.json`. Es probable que la cadena de conexión esté mal. Verifica el nombre de tu servidor SQL.

-   **"Connection Refused" en Angular:**
    -   Significa que el Backend no está corriendo. Verifica la terminal del paso 3.
