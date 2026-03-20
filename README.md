# PE FA25 - API Project

A Node.js/Express RESTful API for managing users, foods, and nations with JWT-based authentication.

## Features

- **User Authentication**: Login functionality with JWT tokens and secure password hashing
- **User Management**: Create, read, update, and delete user profiles
- **Food Management**: Manage food items in the database
- **Nation Management**: Handle nation-related data
- **Security**: Password encryption using bcrypt, JWT authentication middleware
- **Database**: MongoDB integration with Mongoose ODM
- **Cookie-based Session**: Secure token storage via HTTP-only cookies

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing
- **Template Engine**: Jade/Pug
- **Utilities**: Cookie-parser, Morgan logging, Dotenv for configuration

## Project Structure

```
pe-fa25/
├── bin/
│   └── www                  # Application entry point
├── config/
│   ├── config.js           # Configuration settings
│   ├── database.js         # MongoDB connection
│   ├── jwtConfig.js        # JWT configuration
│   └── seed.js             # Database seeding
├── controllers/            # Controller logic (optional structure)
├── data/
│   ├── foods.json         # Sample food data
│   ├── nations.json       # Sample nation data
│   └── users.json         # Sample user data
├── middlewares/
│   └── authMiddleware.js  # JWT authentication middleware
├── models/
│   ├── user.js            # User schema
│   ├── food.js            # Food schema
│   └── nation.js          # Nation schema
├── public/
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── users.js           # User endpoints
│   ├── food.js            # Food endpoints
│   ├── nation.js          # Nation endpoints
│   └── index.js           # Route aggregator
├── views/
│   ├── layout.jade
│   ├── index.jade
│   └── error.jade
├── app.js                 # Express application setup
├── package.json           # Project dependencies
└── README.md             # This file
```

## Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd pe-fa25
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```
   MONGODB_URI=mongodb://localhost:27017/pe-fa25
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   PORT=3000
   NODE_ENV=development
   ```

4. **Ensure MongoDB is running**

   ```bash
   mongod
   ```

5. **Start the application**

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL

`/api/v1`

### Authentication

- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/me` - Get current user profile (requires authentication)

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Foods

- `GET /foods` - Get all foods
- `GET /foods/:id` - Get food by ID
- `POST /foods` - Create new food
- `PUT /foods/:id` - Update food
- `DELETE /foods/:id` - Delete food

### Nations

- `GET /nations` - Get all nations
- `GET /nations/:id` - Get nation by ID
- `POST /nations` - Create new nation
- `PUT /nations/:id` - Update nation
- `DELETE /nations/:id` - Delete nation

## Authentication

This API uses JWT (JSON Web Tokens) for authentication.

1. **Login** to get a token:

   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name": "username", "key": "password"}'
   ```

2. **Use the token** in protected routes by:
   - Including it in the `Authorization` header: `Bearer <token>`
   - Or as a cookie (automatically handled)

3. **Example authenticated request**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/auth/me \
     -H "Authorization: Bearer <your_token>"
   ```

## Postman Testing Scripts

### Post-response Script (Login)

Add this script in the **Tests** tab of your login request to store the token in environment variable `token`.

```javascript
const response = pm.response.json();

// Check if the token exists in the response
if (response.token) {
  // Save token to Postman environment variable named "token"
  pm.environment.set("token", response.token);
  console.log("Token saved to environment:", response.token);
} else {
  console.warn("Token not found in response");
}
```

### Pre-request Script (All Requests)

Add this script in the **Pre-request Script** tab for requests that need authorization.

```javascript
const path = pm.request.url.getPath(); // e.g., "api/v1/auth/register"

// Check if the path includes "register"
if (!path.includes("register")) {
  // Only add token for requests other than register
  const token = pm.environment.get("token");
  if (token) {
    pm.request.headers.add({
      key: "Authorization",
      value: `Bearer ${token}`,
    });
    console.log("Authorization header added with token");
  } else {
    console.warn("No token found in environment");
  }
} else {
  console.log("Skipping Authorization header for register endpoint");
}
```

## Development

### Running in Development Mode

```bash
npm start
```

The server will restart automatically with nodemon (if configured).

### Database Seeding

To seed the database with sample data, you can use the seed file in `config/seed.js`.

## Dependencies

| Package       | Version | Purpose               |
| ------------- | ------- | --------------------- |
| express       | ~4.16.1 | Web framework         |
| mongoose      | ^9.3.1  | MongoDB ODM           |
| jsonwebtoken  | ^9.0.3  | JWT authentication    |
| bcrypt        | ^6.0.0  | Password hashing      |
| dotenv        | ^17.3.1 | Environment variables |
| jade          | ~1.11.0 | Template engine       |
| morgan        | ~1.9.1  | HTTP logging          |
| cookie-parser | ~1.4.4  | Cookie parsing        |
| http-errors   | ~1.6.3  | Error handling        |

## Error Handling

The API returns standardized error responses in JSON format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Security Best Practices

- Never commit `.env` file to version control
- Passwords are hashed using bcrypt before storage
- JWT tokens are stored in HTTP-only cookies
- Environment variables are used for sensitive data
- Input validation is performed on all requests

## Contributing

This is a course project for SDN302 at FPTU. Follow the coding standards and conventions established in the project.

## License

Private - SDN302 Course Project

---

**Last Updated**: March 2026
**Course**: SDN302
**Semester**: Fall 2025
