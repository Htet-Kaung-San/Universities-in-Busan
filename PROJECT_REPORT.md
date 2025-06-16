# Universities in Busan

**Live Demo:** [https://studyinbusan.me](https://studyinbusan.me)

## Project Overview

**Universities in Busan** is a responsive web application accessible from both desktop and mobile devices. It helps users explore, register, and manage information about universities in Busan, South Korea. The platform allows users to view university details, register new universities, manage user accounts, and mark favourites. It is built with Node.js, Express, MongoDB, and AWS S3 for handling images.

---

## User Types and Permissions

The website supports three user types, each with different permissions:

### 1. Normal User
- Can register and log in.
- Can browse universities.
- Can add or remove universities from their favourites tab by starring or unstarring them.

### 2. University Personnel
- Has all the permissions of a Normal User.
- Can register new universities (university submissions require admin approval).

### 3. Admin
- Has all the permissions of University Personnel.
- Universities registered by Admin are auto-approved.
- Can access the Admin Dashboard to:
  - View website activities (such as who logged in, logged out, user type, and actions performed).
  - Approve or decline university registrations on the universities page.
  - View all registered users in the users tab.

---

## Admin Credentials

To access the admin dashboard, use the following credentials:

- **Email:** hksan18mech@ytu.edu.mm  
- **Password:** 11111111

---

## Features

- **User Registration & Login:**  
  Users can create accounts, log in, and manage their profiles.

- **University Registration:**  
  Authorized users can register new universities, including uploading logos and campus photos.

- **University Listing & Search:**  
  All users can browse and search for universities, view details, and see campus images.

- **Favourites:**  
  Users can mark universities as favourites for quick access.

- **Admin Dashboard:**  
  Admin users can approve or decline university submissions, view user activity, and manage users.

- **File Uploads with AWS S3:**  
  University logos and campus photos are uploaded and stored securely on AWS S3.

---

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **File Storage:** AWS S3 (via `multer-s3`)
- **Authentication:** Express-session
- **Deployment:** Render.com

---

## Website Pages

- [Home](https://studyinbusan.me/)
- [Login](https://studyinbusan.me/login.html)
- [Register](https://studyinbusan.me/register.html)
- [Universities List](https://studyinbusan.me/universities.html)
- [Register University](https://studyinbusan.me/register_university.html)
- [Favourites](https://studyinbusan.me/favourites.html)
- [Admin Dashboard](https://studyinbusan.me/admin_dashboard.html)
- [Users Management](https://studyinbusan.me/users.html)
- [Profile](https://studyinbusan.me/profile.html)

---

## How File Uploads Work

- When a user registers a university, logo and campus photos are uploaded via a form.
- The backend uses `multer-s3` to upload files directly to AWS S3.
- The S3 URLs are saved in the MongoDB database and used to display images in the frontend.

---

## Folder Structure

```
Universities-in-Busan/

├── css/
│   - styling files
│
├── html/
│   - page structures
│
├── img/
│   ├── static/         (For logos, icons, general site images)
│   ├── universities/   (For specific university-related photos)
│   └── user_profiles/  (For user-specific avatars)
│
├── js/
│   - client-side JavaScript files for interactivity
│
├── routes/
│   - backend API routes
│
├── PROJECT_REPORT.md
|   - documentation
│
└── server.js
    - entry point
```

---

## How the website handles Users' images uploads

- When a user registers a university, logo and campus photos are uploaded via a form.
- The backend uses `multer-s3` to upload files directly to AWS S3.
- The S3 URLs are saved in the MongoDB database and used to display images in the frontend.

---

## How to Run Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Htet-Kaung-San/Universities-in-Busan.git
   cd Universities-in-Busan
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the `server` directory.
   - Add your MongoDB URI, AWS credentials, and other config variables.

4. **Run the application:**
   ```sh
   npm run dev
   ```
5. **Access the app:**
   - Server: `http://localhost:3000`

---

## Deployment

The application is deployed on Render.com. The latest changes are automatically deployed from the `main` branch of the GitHub repository.

---

## Acknowledgements

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [AWS S3](https://aws.amazon.com/s3/) - Object storage service
- [Render.com](https://render.com/) - Cloud platform for deployment
- [Namecheap](https://namecheap.com/) — Domain provider of https://studyinbusan.me

---

## Bugs and Incomplete Features

- There are 3 different user types, but **access control is not implemented**.
- Users can access restricted pages even if they are not logged in or do not have the required permissions.
    - **Example:** When not logged in, users can access the admin dashboard directly via [https://studyinbusan.me/admin_dashboard.html](https://studyinbusan.me/admin_dashboard.html).
    - **Example:** When logged in as a normal user, users can access the university registration page via [https://studyinbusan.me/register_university.html](https://studyinbusan.me/register_university.html).
- Proper authentication and authorization checks are needed to restrict access based on user roles.
- On the favourites page, the search universities function only searches from the approved universities, so it does not work as expected for all favourites.
- After starring a university, going to the favourites page, clicking on a starred university, and then unstarring it, if you use the back button (`window.history.back()`), the unstarred university still appears. This happens because the browser shows the cached previous page. If you refresh the page, the unstarred university will be gone.

---
