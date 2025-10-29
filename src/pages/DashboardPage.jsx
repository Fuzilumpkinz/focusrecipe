import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'
import {
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    totalRecipes: 0,
    familyRecipes: 0,
    familiesCount: 0,
    recentRecipes: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user?.id]) // Only depend on user ID, not the entire user object

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Loading dashboard data for user:', user.id)

      // Get user's recipes
      const userRecipes = await supabaseService.getRecipes(user.id).catch(err => {
        console.error('Error fetching user recipes:', err)
        return []
      })
      
      // Get user's families
      const userFamilies = await supabaseService.getUserFamilies(user.id).catch(err => {
        console.error('Error fetching user families:', err)
        return []
      })
      
      // Get family recipes if user has families
      let familyRecipes = []
      if (userFamilies.length > 0) {
        for (const familyMember of userFamilies) {
          try {
            const recipes = await supabaseService.getRecipes(user.id, familyMember.family_id)
            familyRecipes = [...familyRecipes, ...recipes]
          } catch (error) {
            console.error('Error fetching family recipes:', error)
          }
        }
      }

      // Get recent recipes (last 5)
      const recentRecipes = userRecipes.slice(0, 5)

      console.log('Dashboard data loaded:', {
        totalRecipes: userRecipes.length,
        familyRecipes: familyRecipes.length,
        familiesCount: userFamilies.length
      })

      setStats({
        totalRecipes: userRecipes.length,
        familyRecipes: familyRecipes.length,
        familiesCount: userFamilies.length,
        recentRecipes
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set default values on error
      setStats({
        totalRecipes: 0,
        familyRecipes: 0,
        familiesCount: 0,
        recentRecipes: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.username || user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your recipes and meal planning.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">My Recipes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalRecipes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/cookbook" className="font-medium text-primary-700 hover:text-primary-600">
                View all recipes
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Family Recipes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.familyRecipes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/families" className="font-medium text-primary-700 hover:text-primary-600">
                View families
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Family Groups</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.familiesCount}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/families" className="font-medium text-primary-700 hover:text-primary-600">
                Manage families
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Meal Plans</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.familiesCount > 0 ? 'Active' : 'Setup'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              {stats.familiesCount > 0 ? (
                <Link to="/families" className="font-medium text-primary-700 hover:text-primary-600">
                  View meal plans
                </Link>
              ) : (
                <Link to="/families/create" className="font-medium text-primary-700 hover:text-primary-600">
                  Create family
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/cookbook/create"
            state={{ from: 'dashboard' }}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <PlusIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-medium text-gray-900">Create New Recipe</h3>
              <p className="text-sm text-gray-500">Add a new recipe to your cookbook</p>
            </div>
          </Link>

          <Link
            to="/families/create"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-medium text-gray-900">Create Family Group</h3>
              <p className="text-sm text-gray-500">Invite family members to share recipes</p>
            </div>
          </Link>

          <Link
            to="/families"
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-medium text-gray-900">Plan Meals</h3>
              <p className="text-sm text-gray-500">Create a meal plan for your family</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Recipes</h2>
          <Link
            to="/cookbook"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>

        {stats.recentRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentRecipes.map((recipe) => (
              <div key={recipe.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {recipe.title}
                    </h3>
                    {recipe.cook_time && (
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {recipe.cook_time}
                      </div>
                    )}
                    <div className="flex items-center mt-2 space-x-2">
                      <Link
                        to={`/cookbook/${recipe.id}`}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        View
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link
                        to={`/cookbook/${recipe.id}/edit`}
                        state={{ from: 'dashboard' }}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recipes yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first recipe.
            </p>
            <div className="mt-6">
              <Link
                to="/cookbook/create"
                state={{ from: 'dashboard' }}
                className="btn btn-primary"
              >
  +++++++ REPLACE
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Recipe
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
