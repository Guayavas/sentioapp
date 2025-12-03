# Documentación Técnica del Proyecto SentioApp

## 1. Estructura del Proyecto Front-end (Angular)

El proyecto Frontend está construido con **Angular 19** y sigue una arquitectura modular basada en componentes. La estructura principal dentro de `src/app` es la siguiente:

- **`src/app/components/`**: Contiene todos los componentes de la interfaz de usuario.
    - **`login/`**: Componente de inicio de sesión (`LoginComponent`). Es una página independiente fuera del layout principal.
    - **`layout/`**: Componentes estructurales.
        - **`main-layout/`**: Contenedor principal para rutas autenticadas. Integra Sidebar y Header.
        - **`header/`**: Barra superior con el título "SentioApp", botón de perfil y cerrar sesión.
        - **`sidebar/`**: Barra lateral de navegación.
    - **`home/`**: Página de bienvenida o tablero principal.
    - **`explorer/`**: Herramienta "Explorador de Datos". Permite buscar preguntas, ver respuestas detalladas (con demografía) y eliminar registros.
    - **`classifier/`**: Herramienta "Clasificador de Información". Gestiona la carga de archivos Excel, previsualización de datos (solo lectura) y confirmación de importación.
    - **`profile/`**: Página de gestión de perfil de usuario (ver datos y cambiar contraseña).

- **`src/app/services/`**: Servicios para la lógica de negocio y comunicación HTTP.
    - **`auth.service.ts`**: Maneja autenticación (Login), almacenamiento de tokens JWT y gestión del perfil de usuario (`getProfile`, `updateProfile`).
    - **`data.service.ts`**: Gestiona la obtención de preguntas, respuestas y el proceso de importación de archivos.

- **`src/app/models/`**: Definiciones de interfaces TypeScript (DTOs) para tipado estricto (ej. `Question`, `Response`, `LoginResponse`).

- **`src/app/app.routes.ts`**: Configuración de rutas. Define el acceso público (`/login`) y privado (`/app/*`) usando `MainLayoutComponent`.

## 2. Componentes de PrimeNG Usados

El proyecto utiliza **PrimeNG (v19)** para la interfaz de usuario y **PrimeFlex** para el sistema de rejilla y utilidades CSS. Los módulos principales importados son:

| Módulo PrimeNG | Uso Principal | Ubicación (Ejemplo) |
| :--- | :--- | :--- |
| **ButtonModule** | Botones de acción (Guardar, Eliminar, Login). | Casi todos los componentes. |
| **InputTextModule** | Campos de texto estándar. | Login, Explorer (Búsqueda), Profile. |
| **CardModule** | Contenedores con sombra para agrupar contenido. | Login, Explorer, Profile, Home. |
| **TableModule** | Tablas de datos con paginación y ordenamiento. | Explorer, Classifier. |
| **ToastModule** | Notificaciones emergentes (Éxito/Error). | App global, Profile, Explorer. |
| **ConfirmDialogModule** | Diálogos de confirmación (ej. al eliminar). | Explorer. |
| **ListboxModule** | Lista seleccionable de preguntas. | Explorer (Sidebar). |
| **TabViewModule** | Pestañas para categorizar respuestas. | Explorer. |
| **FileUploadModule** | Componente para subir archivos Excel. | Classifier. |
| **PasswordModule** | Campo de contraseña con toggle de visibilidad. | Login, Profile. |
| **AvatarModule** | Visualización de iniciales de usuario. | Profile. |
| **IconField / InputIcon** | Iconos dentro de inputs (Búsqueda). | Explorer. |

## 3. Descripción de los Métodos del API (Backend)

El Backend está desarrollado en **.NET 7 (ASP.NET Core Web API)**.

### AuthController (`/api/auth`)
- **`POST /login`**: Recibe credenciales (`username`, `password`), valida contra la base de datos (hash BCrypt) y retorna un token JWT.
- **`GET /profile`**: Obtiene los datos del usuario autenticado (basado en el token JWT).
- **`PUT /profile`**: Actualiza la información del usuario (Nombre, ID) y opcionalmente cambia la contraseña verificando la actual.

### DataController (`/api/data`)
- **`GET /questions`**: Retorna la lista de todas las preguntas únicas disponibles en el sistema.
- **`GET /responses/{questionId}`**: Retorna todas las respuestas asociadas a una pregunta específica, incluyendo datos demográficos (Universidad, Programa, Sexo, etc.).
- **`DELETE /responses/{id}`**: Elimina una respuesta específica por su ID.
- **`DELETE /questions/{id}`**: Elimina una pregunta y **todas** sus respuestas asociadas (operación en transacción).

### ImportController (`/api/import`)
- **`POST /preview`**: Recibe un archivo Excel (`.xlsx`, `.xlsm`), lo procesa en memoria y retorna una lista JSON preliminar de los datos para revisión. No guarda en BD.
- **`POST /confirm`**: Recibe la lista JSON confirmada y la guarda definitivamente en la base de datos (tablas `Questions`, `Responses`, `Categories`).

## 4. Descripción de la Base de Datos

El sistema utiliza **SQL Server**. El esquema relacional consta de las siguientes tablas:

### Tablas Principales
1.  **Users**: Usuarios del sistema.
    - `Id`: PK.
    - `Username`: Correo/Usuario único.
    - `PasswordHash`: Contraseña encriptada.
    - `Role`: Rol del usuario (ej. Admin).
    - `Identifier`: Cédula o identificación.

2.  **Questions**: Preguntas extraídas de los archivos Excel (Celda F1).
    - `Id`: PK.
    - `Text`: Texto de la pregunta.

3.  **Categories**: Categorías derivadas de los nombres de las hojas del Excel.
    - `Id`: PK.
    - `Name`: Nombre de la categoría (ej. Familia, Académica).

4.  **Responses**: Almacena las respuestas de los estudiantes.
    - `Id`: PK.
    - `ResponseText`: El texto de la respuesta.
    - `QuestionId`: FK -> Questions.
    - `CategoryId`: FK -> Categories.
    - `ImportId`: FK -> Imports.
    - **Datos Demográficos**: `Universidad`, `Programa`, `SexoBiologico`, `OrientacionSexual`, `GrupoEtnico`.

5.  **Imports**: Historial de cargas de archivos.
    - `Id`: PK.
    - `FileName`: Nombre del archivo original.
    - `ImportDate`: Fecha de carga.

### Relaciones Clave
- Una **Pregunta** tiene muchas **Respuestas**.
- Una **Respuesta** pertenece a una **Categoría** y proviene de una **Importación**.
