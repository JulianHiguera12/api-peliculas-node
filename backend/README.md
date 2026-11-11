# API REST de Películas y Series

API REST desarrollada con Node.js, Express y MySQL para la gestión de películas y series.

## Descripción

Este proyecto implementa una API REST para administrar información relacionada con contenido audiovisual.

La aplicación permite realizar operaciones CRUD sobre los siguientes módulos:

- Géneros
- Directores
- Productoras
- Tipos
- Media

El módulo Media permite relacionar una película o serie con su género, director, productora y tipo.

## Tecnologías utilizadas

- Node.js
- Express.js
- MySQL
- MySQL2
- Dotenv
- CORS
- Postman
- Git y GitHub

## Estructura del proyecto

```text
api-peliculas-node/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── generoController.js
│   ├── directorController.js
│   ├── productoraController.js
│   ├── tipoController.js
│   └── mediaController.js
│
├── routes/
│   ├── generoRoutes.js
│   ├── directorRoutes.js
│   ├── productoraRoutes.js
│   ├── tipoRoutes.js
│   └── mediaRoutes.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js