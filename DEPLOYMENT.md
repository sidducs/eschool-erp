# ESchool-MERN Deployment Guide

This guide covers the step-by-step process for deploying the ESchool ERP application completely for free using Vercel (Frontend) and Render (Backend).

## 1. Database (MongoDB Atlas)
Ensure your MongoDB Atlas cluster is configured to accept remote connections.
1. Go to your MongoDB Atlas dashboard.
2. Navigate to **Security** -> **Network Access**.
3. Add a new IP Address: `0.0.0.0/0` (This allows access from anywhere, required because Render's IP changes).

## 2. Backend Deployment (Render.com)

Render provides a free Web Service tier perfect for hosting the Node.js/Express backend.

1. Create a free account on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Name**: `eschool-erp-backend` (or similar)
   - **Root Directory**: `backend` *(⚠️ Extremely Important: Render needs to know where the backend code is)*
   - **Environment**: `Node`
   - **Region**: `Singapore (Southeast Asia)` *(Best for low latency in India)*
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. **Environment Variables**: Add all the keys from your local `backend/.env` file.
   - `PORT`: (Render will assign this, but you can leave it off or set it to `5000`)
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Your secure secret.
   - `EMAIL_USER` / `EMAIL_PASS`: For notifications.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image/PDF uploads.
   - `FRONTEND_URL`: **Leave this blank for now.** (We will come back to update this after deploying Vercel).
6. Click **Deploy Web Service**.

Wait for the deployment to finish, and copy your backend URL (e.g., `https://eschool-erp-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel.com)

Vercel provides the fastest and easiest hosting for React frontend applications.

1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend` *(⚠️ Extremely Important)*
4. Open the **Environment Variables** section (before hitting Deploy):
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Paste the Render backend URL you copied earlier *(e.g., `https://eschool-erp-backend.onrender.com`)*
5. Click **Deploy**.

Vercel will successfully build the app (we added a `vercel.json` to handle React routing automatically).
Once it's done, copy your live frontend URL (e.g., `https://eschool-erp.vercel.app`).

---

## 4. Final Connection Step (Crucial)

Now that both are live, you need to tell the backend to accept traffic from your new live frontend.

1. Go back to your **Render** dashboard.
2. Select your Backend web service.
3. Go to the **Environment** tab.
4. Find the `FRONTEND_URL` variable you created earlier.
5. Set its value to your Vercel URL *(e.g., `https://eschool-erp.vercel.app`)*. **Make sure there is no trailing slash.**
6. Save the changes. Render will automatically restart the server.

You are finished! Your ESchool ERP application is now live on the internet for free.
