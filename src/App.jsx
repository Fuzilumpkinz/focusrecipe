import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Import pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MyCookbookPage from './pages/MyCookbookPage'
import FamilyCookbookPage from './pages/FamilyCookbookPage'
import MealPlanPage from './pages/MealPlanPage'
import MealPlansPage from './pages/MealPlansPage'
import ProfilePage from './pages/ProfilePage'
import CreateRecipePage from './pages/CreateRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import PublicRecipePage from './pages/PublicRecipePage'
import FamiliesPage from './pages/FamiliesPage'
import CreateFamilyPage from './pages/CreateFamilyPage'

// Import components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/reset-password" element={<LoginPage resetMode />} />
      <Route path="/recipe/:id" element={<PublicRecipePage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cookbook" element={
        <ProtectedRoute>
          <Layout>
            <MyCookbookPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cookbook/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateRecipePage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cookbook/:id" element={
        <ProtectedRoute>
          <Layout>
            <RecipeDetailPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cookbook/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <EditRecipePage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/families" element={
        <ProtectedRoute>
          <Layout>
            <FamiliesPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/families/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateFamilyPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/family-cookbook/:familyId" element={
        <ProtectedRoute>
          <Layout>
            <FamilyCookbookPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/meal-plan/:familyId" element={
        <ProtectedRoute>
          <Layout>
            <MealPlanPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/meal-plans" element={
        <ProtectedRoute>
          <Layout>
            <MealPlansPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
