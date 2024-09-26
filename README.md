# Organization Tree Backend API

This is a Node.js backend API for managing an organizational structure, allowing the creation, update, and deletion of nodes (such as departments, locations, and employees) in a tree hierarchy. The API implements **rate limiting**, **Redis-based caching**, and optimized performance for scalable usage.

### Deployed URL
```text
https://organization-tree-task.vercel.app/api/v1
```

## Features
- **CRUD Operations** for nodes in an organization tree.
- **Rate Limiting** using Redis to protect against abusive traffic.
- **Caching** of frequently requested data to improve performance.
- **Color Assignment** in a round-robin fashion for `LOCATION` and `DEPARTMENT` nodes, propagated to their children.
- **Parent-Child Management** with options to move a node and its children or shift children up one level.

## Technology Stack
- **Node.js** with **Express**
- **TypeORM** for MySQL ORM
- **Redis** for caching and rate limiting
- **Zod** for request validation
- **Vercel** for serverless deployment

---

## Prerequisites

- **Node.js** (v14+)
- **Redis** (Local or hosted)
- **MySQL** (Local or hosted)
- **Vercel CLI** (for deployment to Vercel)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/vishalp-65/Organization-Tree-Task.git
cd organization tree api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

- Create a MySQL database locally or use a cloud provider like Amazon RDS or Heroku.
- Update the database connection in `src/ormconfig.ts`.

```ts
module.exports = {
  type: "mysql",
  host: process.env.DB_URL || "localhost",
  port: 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "organization_tree",
  synchronize: true,
  entities: ["src/entities/**/*.ts"],
};
```

### 4. Set up Redis

- Make sure Redis is installed and running on your machine, or use a hosted Redis provider (like Upstash).
- Update Redis configuration in `src/config/redis.ts` with your Redis host and port.

```ts
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined, // If your Redis requires a password
});

export default redis;
```

### 5. Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
PORT=8082
DB_URI=your database url
REDIS_URL=your redis url 
```

### 6. Running the Project

To run the project locally:

```bash
npm run dev
```

The server will start on `http://localhost:8082`.

---

## API Endpoints

### Base URL
```text
http://localhost:3000/api/v1
```

### Routes and Parameters

---

### **1. Create Node**
Creates a new node in the organization tree.

**Endpoint**: `POST /api/v1/node`

**Request Body**:
```json
{
  "name": "Node Name",
  "type": "LOCATION",  // or "DEPARTMENT", "EMPLOYEE"
  "parentId": 1        // Optional, the parent node's ID
}
```

- `name` (required): The name of the node.
- `type` (required): The type of node (`LOCATION`, `DEPARTMENT`, or `EMPLOYEE`).
- `parentId` (optional): The ID of the parent node. If not provided, the node will be created as a root node.

---

### **2. Get All Nodes**
Retrieves the entire organization tree.

**Endpoint**: `GET /api/v1/nodes`

**Response**:
```json
{
  "status": "success",
  "data": {
    "nodes": [
      {
        "id": 1,
        "name": "Sales",
        "type": "LOCATION",
        "children": [...]
      }
    ]
  }
}
```

---

### **3. Update Node**
Updates a node's parent with options to move its children or shift them to the parent.

**Endpoint**: `PUT /api/v1/node/:id`

**Request Body**:
```json
{
  "parentId": 3  // New parent node's ID
}
```

**Query Parameter**:
- `option=move`: Move the node and its children to the new parent.
- `option=shift`: Move only the node, shifting its children to the old parent.

---

### **4. Delete Node**
Deletes a node with two options:
- Remove the node and all its children.
- Shift the children up to the node's parent.

**Endpoint**: `DELETE /api/v1/node/:id`

**Query Parameter**:
- `option=remove-all`: Delete the node and all its children.
- `option=shift-children`: Delete only the node and move its children up one level to the parent.

---

## Rate Limiting

We use **Redis** to implement rate limiting. Each user is allowed a maximum of **100 requests** per **10 minutes**. If a user exceeds this limit, they will receive a `429 Too Many Requests` response.

---

## Deployment on Vercel

### 1. Create `vercel.json`

Make sure you have the following `vercel.json` configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### 2. Push to GitHub

Ensure your project is tracked by Git:

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Deploy to Vercel

- Go to [Vercel](https://vercel.com/), sign in, and create a new project by importing your repository.
- Set environment variables in the **Vercel Project Settings** for your Redis and MySQL connections.
- Deploy the project.

---

## Redis and Cache Optimization

- **Rate Limiting**: Redis is used to track the number of requests per user in a 15-minute window. If the limit is exceeded, the user will receive a `429` response.
- **Cache Optimization**: Frequently requested data, such as the organization tree, is cached in Redis for 1 hour to reduce database load.

---
