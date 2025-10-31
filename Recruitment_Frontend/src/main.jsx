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
// // import DashboardPage from './pages/DashboardPage'
// import GoogleLoginTest from './GoogleLoginTest'
import AllJobPage from './pages/jobs/AllJobsPage'
import UsersPage from './pages/users/UserPage'
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
      // {
      //   path: "dashboard",
      //   element: (
      //     <ProtectedRoute>
      //       <DashboardPage />
      //     </ProtectedRoute>
      //   )
      // },
      {
        path: "jobs",
        element:
          <ProtectedRoute>
            <AllJobPage />
          </ProtectedRoute>
      },
      // {
      //   path: "search",
      //   element: <SearchJobPage />
      // },
      // {
      //   path: "saved-jobs",
      //   element: <SavedJobsPage />
      // },
      // {
      //   path: "",
      //   element: <Navigate to="/dashboard" replace />
      // },
      // {
      //   path: "/jobs/:id",
      //   element: <JobDetailPage />
      // }
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