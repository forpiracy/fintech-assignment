# Fintech Platform

This project is a basic fintech platform built using Node.js, Express, Hasura, and EJS for the frontend.

## Prerequisites

- Node.js and npm installed on your machine.
- A Hasura Cloud account with a GraphQL endpoint and a Neon Cloud database.
- `dotenv` package for loading environment variables.

## Setup Instructions

### Backend Setup

1. **Clone the Repository**

   ```sh
   git clone https://github.com/forpiracy/fintech-assignment.git
   cd fintech-platform

2. **Install dependencies**  
    ```sh
    npm install

3. **Replace environment variables**
    ```sh
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    HASURA_GRAPHQL_ENDPOINT=your_hashura_graphql_endpoint
    HASURA_ADMIN_SECRET=your_hasura_admin_secret

4. **Start the server**
    ```sh
    npm run devStart

# API Documentation

## 1. Sign Up
**Endpoint:** `POST /signup`  
**Description:** Registers a new user.  
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Responses:**
- `200 OK`: User created successfully.
- `400 Bad Request`: Validation error or user already exists.

## 2. Sign In
**Endpoint:** `POST /signin`  
**Description:** Authenticates a user and returns a JWT token.  
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Responses:**
- `200 OK`: Returns a JWT token.
- `400 Bad Request`: User not found or invalid password.

## 3. Create Account
**Endpoint:** `POST /create-account`  
**Description:** Creates a new account for the authenticated user.  
**Request Headers:**
```http
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "account_name": "string"
}
```
**Responses:**
- `200 OK`: Account created successfully.
- `400 Bad Request`: Validation error.

## 4. Manage Accounts
**Endpoint:** `GET /accounts`  
**Description:** Retrieves a list of accounts for the authenticated user.  
**Request Headers:**
```http
Authorization: Bearer <token>
```
**Responses:**
- `200 OK`: Returns a list of accounts.
- `403 Forbidden`: Invalid or missing token.

## 5. Deposit Money
**Endpoint:** `POST /deposit`  
**Description:** Deposits money into an account.  
**Request Headers:**
```http
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "account_id": "integer",
  "amount": "number"
}
```
**Responses:**
- `200 OK`: Money deposited successfully.
- `400 Bad Request`: Validation error or insufficient funds.

## 6. Withdraw Money
**Endpoint:** `POST /withdraw`  
**Description:** Withdraws money from an account.  
**Request Headers:**
```http
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "account_id": "integer",
  "amount": "number"
}
```
**Responses:**
- `200 OK`: Money withdrawn successfully.
- `400 Bad Request`: Validation error or insufficient funds.

## 7. Delete Account
**Endpoint:** `POST /delete-account`  
**Description:** Deletes an account.  
**Request Headers:**
```http
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "account_id": "integer"
}
```
**Responses:**
- `200 OK`: Account deleted successfully.
- `400 Bad Request`: Validation error or account not found.
```

