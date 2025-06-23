Red Social Backend API

Introducción

Este proyecto es una API REST para una red social desarrollada con Node.js, Express y MongoDB (usando Mongoose). Permite la gestión de usuarios, posts y comentarios, incluyendo funcionalidades de autenticación segura, interacción con posts mediante likes y seguimiento entre usuarios.


Descripción
La API permite:

Registro y autenticación de usuarios con bcrypt para el hashing de contraseñas y JWT para la gestión de tokens.

Operaciones CRUD completas para posts y comentarios.

Funcionalidades de interacción social como dar y quitar likes a posts y comentarios.

Seguimiento (followers) entre usuarios.

Middleware para validar la autoría en modificaciones y eliminaciones de posts y comentarios.

Soporte para la subida de imágenes mediante multer.

Paginación de resultados para los listados.


Tecnologías utilizadas

Node.js + Express - Framework para el backend y creación de la API.

MongoDB + Mongoose - Base de datos NoSQL y ODM.

bcrypt - Para cifrar las contraseñas de usuario.

JWT (JSON Web Tokens) - Para la autenticación y autorización.

multer - Middleware para la gestión de subida de archivos (imágenes).

Git - Control de versiones con ramas main, develop y commits descriptivos.


Endpoints principales

Usuarios
POST - Registro de usuario con validación y hash de contraseña.

POST - Login con JWT.

GET - Obtener datos del usuario autenticado, incluyendo posts y seguidores.

POST - Cierre de sesión.

POST - Seguir a un usuario.

POST - Dejar de seguir a un usuario.

GET - Buscar usuario por nombre o id.

Posts
POST - Crear un post (autenticado).

GET - Listar posts con paginación, usuarios y comentarios asociados.

GET - Obtener un post por ID.

GET - Buscar posts por nombre.

PUT - Actualizar post (solo autor).

DELETE - Eliminar post (solo autor).

POST - Dar like a un post.

POST - Quitar like a un post.

Comentarios
POST - Crear comentario en post.

PUT - Actualizar comentario (solo autor).

DELETE - Eliminar comentario (solo autor).

POST - Dar like a comentario.

POST - Quitar like a comentario.


Middleware
Autenticación JWT para proteger rutas.

Validación de autoría para editar/eliminar posts y comentarios.

Multer para subida de imágenes en usuarios, posts y comentarios.
