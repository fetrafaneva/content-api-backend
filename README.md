# Social-API REST

A RESTful backend API built with Node.js, Express, and MongoDB. This API powers a social media application with users, posts, comments, replies, and private messaging.

[![Node.js Version](https://img.shields.io/node/v/express.svg?color=brightgreen)](https://nodejs.org/en/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)


## Overview

Social-API REST is a scalable and secure REST API designed to handle the core features of a social platform. It follows best practices in API design, authentication, data modeling, and middleware usage.

The API is frontend-agnostic and can be consumed by any client (React, Flutter, mobile apps, etc.).

## Key Features

- User authentication with JWT
- Secure password hashing
- User management
- Posts CRUD
- Comments on posts
- Replies to comments (threaded discussions)
- Private messaging between users
- Protected routes with middleware
- Clean and modular architecture

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Tokens)**
- **bcrypt**
- **dotenv**
- **cors**

## Project Structure

```text
backend/
├── config/
│   └── db.js                         # MongoDB connection
│
├── controllers/
│   ├── auth.controller.js            # Authentication logic
│   ├── user.controller.js            # User-related actions
│   ├── post.controller.js            # Posts logic
│   ├── notification.controller.js    # Notification logic
│   ├── message.controller.js         # Messaging logic
│
├── middleware/
│   ├── auth.middleware.js            # JWT authentication
│   ├── upload.middleware.js          # Config upload file
│
├── models/
│   ├── user.model.js                 # user shema
│   ├── notification.model.js         # notification shema
│   ├── message.model.js              # message shema
│
├── routes/
│   ├── auth.routes.js
│   ├── notification.routes.js
│   ├── post.routes.js
│
├── utils/
│   └──createNotification.js
│
├── server.js                         # App entry point
├── package.json
└── .env
```


## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or MongoDB Atlas)

### Steps
1. Clone the repository:
    ```text
    git clone https://github.com/fetrafanevacontent-api-backend.git
    cd backend
    ```
2. Install dependencies:
    ```text
    cd backend
    npm install
    ```
3. Configure environment variables:
- Create `.env` in `/server`:
    ```text
    PORT=your_port

    MONGO_URI=your_mongodb_URI

    JWT_SECRET=your_secure_jwt_secret
    ```
4. Start the application:
    ```text
    npm run server (with nodemon)
    ```

## API Endpoints

### Authentication
| Method | Endpoint                    | Description                                | Authentication Required |
|--------|-----------------------------|--------------------------------------------|-------------------------|
| POST   | `/api/auth/register`        | Register a new user                        | No                      |
| POST   | `/api/auth/login`           | User login                                 | No                      |
| GET    | `/api/auth/logout`          | User logout                                | yes                     |

### Posts
| Method | Endpoint                    | Description                                | Authentication Required |
|--------|-----------------------------|--------------------------------------------|-------------------------|
| POST   | `/api/post`                 | Create post                                | yes                     |
| GET    | `/api/post`                 | Get all post                               | yes                     |
| PUT    | `/api/post/:id`             | Update post                                | yes                     |
| DELETE | `/api/auth/:id`             | Delete post                                | yes                     |

### Comments & Replies
| Method | Endpoint                                                  | Description                                | Authentication Required |
|--------|-----------------------------------------------------------|--------------------------------------------|-------------------------|
| POST   | `/api/post/:id/comment`                                   | Get message                                | yes                     |
| POST   | `/api/post/:postId/comment/:commentId/reply`              | Reply to comment                           | yes                     |
| PATCH  | `/api/post/:postId/comment/:commentId/reply/:replyId`     | Uptdate reply                              | yes                     |
| DELETE | `/api/post/:postId/comment/:commentId/reply/:replyId`     | Delete reply                               | yes                     |

### Messages
| Method | Endpoint                                                  | Description                                | Authentication Required |
|--------|-----------------------------------------------------------|--------------------------------------------|-------------------------|
| POST   | `/api/message/`                                           | Send message                               | yes                     |
| GET    | `/api/message/inbox`                                      | Comment a post                             | yes                     |
| GET    | `/api/message/unread/count`                               | Count unread message                       | yes                     |
| GET    | `/api/message/conversations`                              | GET all conversations                      | yes                     |
| GET    | `/api/message/conversation/:userId`                       | Get users conversation                     | yes                     |
| PATCH  | `/api/message/conversations/:userId/read`                 | Mark conversation as read                  | yes                     |
| PATCH  | `/api/message/:id/read`                                   | Mark message as read                       | yes                     |
| PUT    | `/api/message/:id`                                        | Update message                             | yes                     |
| DELETE | `/api/message/:id`                                        | Delete message                             | yes                     |

### Notification
| Method | Endpoint                                                  | Description                                | Authentication Required |
|--------|-----------------------------------------------------------|--------------------------------------------|-------------------------|
| GET    | `/api/notification/`                                      | Get notification                           | yes                     |
| PATCH  | `/api/notification/:id/read`                              | Mark notiication as read                   | yes                     |

## Security Practices

- **Password Hashing**: Utilizes bcrypt for secure storage.
- **Token Management**: JWT-based authentication.
- Protected routes via middleware.
- Environment variables for sensitive data
- CORS configuration

## Demo

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

If this project helps you, consider starring the repository!

