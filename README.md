# 🐾 PurrfectHub Server

> A comprehensive backend API for the PurrfectHub Cat Adoption & Care Management Platform.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Express](https://img.shields.io/badge/express-4.x-lightgrey.svg)

## 📖 Overview

**PurrfectHub** bridges the gap between cat shelters, adopters, and veterinarians. This backend server powers the platform, managing user authentication, cat profiles, adoption workflows, medical records, donation processing (Stripe), and real-time chat.

Built with **Express.js**, **Prisma ORM**, and **PostgreSQL**, it offers a robust, scalable, and type-safe API.

### 🚀 Key Features

*   **🔐 Authentication & RBAC**: Secure JWT-based auth with distinct roles (Admin, Shelter, Adopter).
*   **🐱 Cat Management**: Comprehensive CRUD for cat profiles with filterable search (Breed, Age, Location).
*   **📸 Image Uploads**: Integrated with **ImageKit** for seamless photo management.
*   **🏠 Adoption Workflow**: End-to-end management of adoption applications (Submit -> Review -> Approve -> Complete).
*   **💉 Medical Records**: Track vaccinations, vet visits, and automated health reminders.
*   **💳 Donations**: Secure payment processing via **Stripe** for direct shelter support.
*   **💬 Real-time Chat**: WebSocket-powered messaging between Shelters and Adopters.
*   **🔔 Notifications**: Email and in-app notifications for important updates.

---

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: JWT (JSON Web Tokens)
*   **File Storage**: ImageKit
*   **Payments**: Stripe
*   **Real-time**: Socket.io
*   **Email**: Nodemailer

---

## ⚡ Getting Started

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Start-Up-Pulse/purrfecthub_server.git
    cd purrfecthub_server
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and configure the following:

    ```env
    # Server
    PORT=5001
    NODE_ENV=development

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/purrfecthub?schema=public"

    # JWT Authentication
    JWT_SECRET="your-super-secret-key"
    JWT_EXPIRES_IN="1d"
    JWT_REFRESH_SECRET="your-refresh-secret"
    JWT_REFRESH_EXPIRES_IN="365d"

    # ImageKit (File Storage)
    IMAGEKIT_PUBLIC_KEY="your_public_key"
    IMAGEKIT_PRIVATE_KEY="your_private_key"
    IMAGEKIT_URL_ENDPOINT="your_url_endpoint"

    # Stripe (Payments)
    STRIPE_SECRET_KEY="sk_test_..."

    # Email (SMTP)
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT=587
    SMTP_USER="your-email@gmail.com"
    SMTP_PASS="your-app-password"
    ```

4.  **Database Migration**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Server**
    ```bash
    npm run dev
    ```

---

## 📡 API Documentation

### Base URL
`http://localhost:5001/api/v1`

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new user (Adopter) |
| `POST` | `/login` | Login and receive access/refresh tokens |
| `POST` | `/change-password` | Change current user password |
| `POST` | `/refresh-token` | Generate new access token |

### 👤 Users (`/users`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/me` | Get current user profile |
| `PATCH` | `/me` | Update profile information |

### 🏠 Shelters (`/shelters`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new shelter |
| `GET` | `/:id` | Get shelter details |

### 🐱 Cats (`/cats`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List all cats (Supports filters: age, breed, etc.) |
| `POST` | `/` | **(Shelter)** Create cat profile (Multipart/Form-Data for images) |
| `PATCH` | `/:id` | **(Shelter)** Update cat profile |
| `DELETE` | `/:id` | **(Shelter)** Delete cat profile |

### 📝 Adoptions (`/adoptions`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Submit adoption application |
| `GET` | `/my-adoptions` | **(Adopter)** View my applications |
| `PATCH` | `/:id/review` | **(Shelter)** Approve/Reject application |
| `POST` | `/:id/complete` | **(Shelter)** Mark adoption as completed |

### 💳 Donations (`/donations`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Initiate donation (Returns Stripe Payment URL) |
| `POST` | `/verify-payment` | Verify Stripe session and complete donation |
| `GET` | `/stats` | Get donation statistics |

### 💉 Medical Records (`/medical-records`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Add a new medical record | Shelter |
| `GET` | `/cat/:catId` | Get records for a specific cat | Public |
| `GET` | `/reminders` | Get upcoming vaccination reminders | Shelter |

### 💬 Chat (`/conversations`)
*   **WebSockets**: Connect to `ws://localhost:5001` with `Authorization` header.
*   **Events**: `send-message`, `new-message`, `join-conversation`.

---

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
