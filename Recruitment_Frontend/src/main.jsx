import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import './styles/index.css'
import AuthProvider from './context/AuthProvider'
import NotificationProvider from './context/NotificationProvider'
import ProtectedRoute from './components/layout/ProtectedRoute'


import App from './App'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboarđPage'
// import GoogleLoginTest from './GoogleLoginTest'
import AllJobPage from './pages/jobs/AllJobsPage'
import UsersPage from './pages/users/UserPage'
import CreateJobPage from './pages/jobs/CreateJobPage'
import UpdateJobPage from './pages/jobs/UpdateJobPage'
// import SearchJobPage from './pages/jobs/SearchJobsPage'
// import SavedJobsPage from './pages/jobs/SavedJobsPage'
// import JobDetailPage from './pages/jobs/JobDetailPage'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "users",
        element: (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )
      },
      // {
      //   path: "register",
      //   element: <RegisterPage />
      // },
      // {
      //   path: "test-google",
      //   element: <GoogleLoginTest />
      // },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "jobs",
        element:
          <ProtectedRoute>
            <AllJobPage />
          </ProtectedRoute>
      },
      {
        path: "jobs/create",
        element:
          <ProtectedRoute>
            <CreateJobPage />
          </ProtectedRoute>
      },
      {
        path: "jobs/:id/edit",
        element:
          <ProtectedRoute>
            <UpdateJobPage />
          </ProtectedRoute>
      },
      {
        path: "",
        element: <Navigate to="/dashboard" replace />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
)