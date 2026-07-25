# 🚀 ViewTube Backend API

A complete, production-ready backend REST API for a video-hosting platform (like YouTube). This project demonstrates advanced backend concepts including multi-stage MongoDB aggregation pipelines, secure JWT-based authentication, and efficient third-party cloud media management.

## 🌟 Key Features

* **Advanced Database Queries:** Extensive use of MongoDB Aggregation pipelines (`$lookup`, `$group`, `$unwind`, `$addFields`) for complex data retrieval like creator analytics, watch history, and paginated feeds.
* **Robust Media Management:** Seamless integration with Cloudinary and Multer for uploading, processing, and safely deleting large video files and image thumbnails (preventing ghost-file memory leaks).
* **Bulletproof Security:** Custom middleware for route protection, utilizing industry-standard JWT (Access & Refresh tokens) and Bcrypt password hashing.
* **Pagination & Search:** Dynamic search APIs with text-indexing (`$regex`) and server-side pagination using `mongoose-aggregate-paginate-v2` to optimize bandwidth and memory usage.
* **Standardized Responses:** A custom `ApiResponse` and `ApiError` class architecture ensuring consistent and predictable JSON responses across all endpoints.

## 🛠 Tech Stack

* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Media Storage:** Cloudinary
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt

## 🗄️ Database Models & Architecture

The architecture consists of interconnected models representing real-world entities:
* **User:** Manages authentication, profiles, watch history, and tokens.
* **Video:** Stores video metadata, Cloudinary URLs (video & thumbnail), duration, and publish status.
* **Subscription:** Tracks channel subscribers and subscriptions.
* **Like:** Manages likes across Videos, Comments, and Tweets.
* **Comment & Tweet:** Handles user engagement and community posts.
* **Playlist:** Allows users to group videos into custom collections.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js installed (v18 or higher recommended)
* MongoDB URI (Local or MongoDB Atlas)
* Cloudinary Account (for media uploads)

### 1. Clone the repository
```bash
git clone [https://github.com/Ashutoshporwal-ashu/backend-project.git](https://github.com/Ashutoshporwal-ashu/backend-project.git)
cd fully-backend-project