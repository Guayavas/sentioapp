# Uso de Componentes PrimeNG en SentioApp

Este documento detalla los módulos y componentes de PrimeNG utilizados en cada sección de la aplicación.

## 1. Login (`LoginComponent`)
- **Card (`p-card`)**: Contenedor principal del formulario de inicio de sesión.
- **InputText (`pInputText`)**: Campo para ingresar el nombre de usuario.
- **Password (`p-password`)**: Campo para ingresar la contraseña con opción de ocultar/mostrar.
- **Button (`p-button`)**: Botón para enviar el formulario.

## 2. Layout Principal (`MainLayout`, `Header`, `Sidebar`)
- **Button (`p-button`)**: Utilizado en el Header para la navegación (Inicio, Perfil, Cerrar Sesión) y en el Sidebar para los enlaces a las herramientas.
- **Iconos (PrimeIcons)**: Utilizados extensivamente (`pi-home`, `pi-user`, `pi-sign-out`, `pi-verified`, etc.).

## 3. Home / Dashboard (`HomeComponent`)
- **Card (`p-card`)**: Tarjetas de bienvenida para "Explorador de Datos" y "Clasificador de Información".
- **Button (`p-button`)**: Botones de "Acceder" en el pie de las tarjetas.

## 4. Explorador de Datos (`ExplorerComponent`)
- **Card (`p-card`)**: Contenedor principal de la herramienta.
- **AutoComplete (`p-autoComplete`)**: Buscador de preguntas con sugerencias.
- **Dropdown (`p-dropdown`)**: Filtros para Sede y Género.
- **Table (`p-table`)**: Visualización tabular de las respuestas filtradas.
- **Tag (`p-tag`)**: Etiquetas para mostrar categorías y estados con colores semánticos.
- **Badge (`p-badge`)**: Indicador numérico en los botones de categorías.
- **Button (`p-button`)**: Navegación de categorías.

## 5. Clasificador de Información (`ClassifierComponent`)
- **Card (`p-card`)**: Contenedor principal.
- **FileUpload (`p-fileUpload`)**: Componente para cargar archivos (.csv, .pdf, .txt).
- **Table (`p-table`)**: Lista de preguntas/respuestas extraídas pendientes de revisión.
- **Dialog (`p-dialog`)**: Ventana modal para editar la clasificación de una respuesta.
- **Tag (`p-tag`)**: Visualización de estado "Pendiente" o categorías.
- **InputTextarea (`pInputTextarea`)**: Edición de texto de respuestas largas.
- **Dropdown (`p-dropdown`)**: Selectores para cambiar categoría, sede o género en edición.
- **Toast (`p-toast`)**: Notificaciones emergentes de éxito/error.

## 6. Perfil (`ProfileComponent`)
- **Card (`p-card`)**: Contenedores para cabecera de perfil e información personal.
- **Avatar (`p-avatar`)**: Visualización de las iniciales del usuario.
- **InputText (`pInputText`)**: Campos editables de información personal.
- **Password (`p-password`)**: Campos para cambio de contraseña.
- **Button (`p-button`)**: Acciones de Editar, Guardar, Cancelar.
- **Toast (`p-toast`)**: Feedback al guardar cambios.
