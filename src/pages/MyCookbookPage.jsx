import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline'

export default function MyCookbookPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [allTags, setAllTags] = useState([])

  // Load recipes
  useEffect(() => {
    loadRecipes()
  }, [user])

  const loadRecipes = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userRecipes = await supabaseService.getRecipes(user.id)
      setRecipes(userRecipes)
      
      // Extract all unique tags
      const tags = new Set()
      userRecipes.forEach(recipe => {
        if (recipe.tags && Array.isArray(recipe.tags)) {
          recipe.tags.forEach(tag => tags.add(tag))
        }
      })
      setAllTags(Array.from(tags).sort())
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter recipes based on search and tag
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchTerm || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTag = !selectedTag || 
      (recipe.tags && recipe.tags.includes(selectedTag))
    
    return matchesSearch && matchesTag
  })

  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      await supabaseService.deleteRecipe(recipeId)
      loadRecipes() // Reload recipes
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Error deleting recipe. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Cookbook</h1>
        <Link
          to="/cookbook/create"
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Recipe
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TagIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="input pl-10 appearance-none"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-end">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredRecipes.length} of {recipes.length} recipes
          {searchTerm && ` for "${searchTerm}"`}
          {selectedTag && ` tagged "${selectedTag}"`}
        </p>
      </div>

      {/* Recipes Grid/List */}
      {filteredRecipes.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253v13C19.832 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {recipes.length === 0 ? 'No recipes yet' : 'No recipes found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {recipes.length === 0 
              ? 'Get started by creating your first recipe.'
              : 'Try adjusting your search or filters.'
            }
          </p>
          {recipes.length === 0 && (
            <Link
              to="/cookbook/create"
              className="btn btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Recipe
            </Link>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              viewMode={viewMode}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Recipe Card Component
function RecipeCard({ recipe, viewMode, onDelete }) {
  // Don't use placeholder images to avoid infinite loading
  const hasImage = recipe.image_url && recipe.image_url.trim() !== ''

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Recipe Image */}
            <div className="flex-shrink-0">
              {hasImage ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="h-24 w-24 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500 text-center">No image available</span>
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                    <Link to={`/cookbook/${recipe.id}`} state={{ from: 'cookbook' }}>
                      {recipe.title}
                    </Link>
                  </h3>
                  {recipe.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{recipe.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/cookbook/${recipe.id}/edit`}
                    state={{ from: 'cookbook' }}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => onDelete(recipe.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Recipe Meta */}
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                {recipe.prep_time && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {recipe.prep_time}
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {recipe.servings} servings
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View with enhanced title overlay
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
      {/* Recipe Image with Title Overlay */}
      <div className="relative aspect-w-16 aspect-h-9 h-64">
        {hasImage ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-center">No image available</span>
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-sm text-gray-200 line-clamp-2 drop-shadow">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions - Hover Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onDelete(recipe.id)}
              className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title="Delete recipe"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <Link
              to={`/cookbook/${recipe.id}/edit`}
              state={{ from: 'cookbook' }}
              className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Edit recipe"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={() => {}}
              className="p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
              title="Add to meal plan"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="bg-white p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          {recipe.prep_time && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {recipe.prep_time}
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {recipe.servings} servings
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link
            to={`/cookbook/${recipe.id}`}
            state={{ from: 'cookbook' }}
            className="btn btn-primary text-sm flex-1 mr-2"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  )
}
