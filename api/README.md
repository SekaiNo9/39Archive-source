# Hatsune Miku Music App - Backend

This is the backend for the Hatsune Miku themed music web application built using the MERN stack (MongoDB, Express, React, Node.js). The backend is responsible for handling all the data management and API requests related to composers, performers, and songs.

## Features

- **Composer Management**: CRUD operations for composers, including adding, updating, and deleting composer information.
- **Performer Management**: CRUD operations for performers, including adding, updating, and deleting performer information.
- **Song Management**: CRUD operations for songs, including adding new songs, updating song details (excluding lyrics), and managing song lyrics.
- **CORS Enabled**: The backend is configured to allow requests from the frontend running on port 3000.
- **Database Connection**: Connects to MongoDB using Mongoose for data persistence.

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hatsune-miku-music-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory and add your MongoDB connection string and any other necessary environment variables.

### Running the Application

To start the server, run:
```
npm start
```
The server will run on `http://localhost:8080`.

### API Endpoints

- **Composer Routes**:
  - `GET /composer/all`: Get all composers
  - `GET /composer/:id`: Get composer by ID
  - `POST /composer/add`: Add a new composer
  - `PUT /composer/:id/update`: Update composer information
  - `DELETE /composer/delete`: Delete a composer

- **Performer Routes**:
  - Similar structure to composer routes.

- **Song Routes**:
  - Similar structure to composer routes, with additional endpoints for managing lyrics.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.