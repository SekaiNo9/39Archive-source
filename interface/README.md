# Hatsune Miku Music App

## Overview
This project is a music web application themed around Hatsune Miku, built using the MERN stack (MongoDB, Express, React, Node.js). The application allows users to explore composers, performers, and songs, providing a rich interface for music lovers.

## Project Structure
The project is divided into two main parts: the backend and the frontend.

### Backend
- **Port**: 8080
- **Technologies**: Node.js, Express, MongoDB
- **Features**:
  - RESTful API for managing composers, performers, and songs.
  - CORS enabled for frontend access.
  - Authentication middleware for secure routes.
  
### Frontend
- **Port**: 3000
- **Technologies**: React
- **Features**:
  - Components for displaying lists of composers, performers, and songs.
  - Pages for detailed views of composers, performers, and songs.
  - A song player component for playing music.

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.
- MongoDB account and connection string.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hatsune-miku-music-app
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Configuration
- Create a `.env` file in the `backend` directory and add your MongoDB connection string and any other necessary environment variables.

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

### API Endpoints
- **Composers**:
  - `GET /composer/all`: Get all composers.
  - `GET /composer/:id`: Get a composer by ID.
  - `POST /composer/add`: Add a new composer.
  - `PUT /composer/:id/update`: Update a composer by ID.
  - `DELETE /composer/delete`: Delete a composer.

- **Performers**:
  - Similar endpoints as composers.

- **Songs**:
  - Similar endpoints as composers, with additional endpoints for updating lyrics.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.