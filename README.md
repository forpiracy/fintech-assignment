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
   git clone https://github.com/your-repo/fintech-platform.git
   cd fintech-platform

2. **npm install**  

3. **Replace environment variables**
    ```sh
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    HASURA_GRAPHQL_ENDPOINT=https://loving-insect-62.hasura.app/v1/graphql
    HASURA_ADMIN_SECRET=your_hasura_admin_secret

4. **Start the server**
    ```sh
    npm run devStart