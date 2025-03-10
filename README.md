# Povery Test

This is a test repository for the Povery framework.

## Overview

This repository contains test cases for the [Povery](https://github.com/sickOscar/povery) framework, which is a serverless framework for building APIs with decorators for routing, validation, and access control.

## Getting Started

1. Make sure you have the Povery framework installed locally (referenced in package.json as `"povery": "file:../povery"`)
2. Install dependencies:
   ```
   npm install
   ```

## Running the Server

To start the Povery server:

```
npm start
```

This will start the server at http://localhost:3000.

## Testing the API

The repository includes a test script that tests various features of the Povery framework:

1. First, make sure the server is running in one terminal:
   ```
   npm start
   ```

2. Then, in another terminal, run the API tests:
   ```
   npm run test:api
   ```

## Features Tested

The test script tests the following Povery features:

1. Basic routing
2. Path parameters
3. Query parameters
4. Body validation
5. Middleware functionality
6. Error handling
7. Different HTTP methods (GET, POST, PUT, DELETE, PATCH)
8. Nested routes
9. ACL (Access Control List)

## API Endpoints

The following endpoints are available for testing:

- `GET /test` - Basic route with ACL
- `GET /test/:id` - Route with path parameter
- `GET /test/validation/:validated` - Route with validated path parameter
- `POST /test` - Basic POST route
- `GET /error` - Error route (500)
- `PUT /error` - Custom error route (403)
- `GET /test-query` - Query parameters test
- `GET /test-all-query` - All query parameters test
- `POST /test-body` - Body validation test
- `GET /test-middleware` - Middleware test
- `PUT /test-methods` - PUT method test
- `DELETE /test-methods/:id` - DELETE method test
- `PATCH /test-methods/:id` - PATCH method test
- `GET /nested/routes/test` - Nested routes test
- `GET /test-errors/:code` - Error codes test