import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'
import { formatIngredient, generateShoppingList } from '../utils/ingredientParser'
import {
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ShareIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export default function RecipeDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  // Determine where to navigate back to based on where user came from
  const getBackNavigation = () => {
    // Check if user came from dashboard
    if (location.state?.from === 'dashboard') {
      return '/dashboard'
    }
    // Check if user came from family cookbook
    if (location.state?.from === 'family-cookbook') {
      return location.state.familyId ? `/family-cookbook/${location.state.familyId}` : '/families'
    }
    // Default to cookbook page
    return '/cookbook'
  }

  useEffect(() => {
    loadRecipe()
  }, [id, user])

  const loadRecipe = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      console.log('Loading recipe for user:', user?.id, 'recipe ID:', id)
      
      // If no user, redirect to public recipe page
      if (!user) {
        console.log('No user found, redirecting to public recipe page')
        navigate(`/recipe/${id}`)
        return
      }
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Recipe query timeout after 10 seconds')), 10000)
      })
      
      // Get specific recipe by ID - RLS policies will handle access control
      const foundRecipe = await Promise.race([
        supabaseService.getRecipeById(id),
        timeoutPromise
      ])
      
      if (foundRecipe) {
        setRecipe(foundRecipe)
        setIsPublic(foundRecipe.is_public || false)
      } else {
        // Recipe not found or no access - don't auto-redirect, let user know
        console.log('Recipe not found for user')
        setRecipe(null)
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
      // Don't auto-redirect on error, just set recipe to null
      setRecipe(null)
    } finally {
      setLoading(false)
    }
  }

  const togglePublic = async () => {
    try {
      const newPublicStatus = !isPublic
      await supabaseService.updateRecipe(id, { is_public: newPublicStatus })
      setIsPublic(newPublicStatus)
      setRecipe({ ...recipe, is_public: newPublicStatus })
      alert(newPublicStatus ? 'Recipe is now publicly visible!' : 'Recipe is now private.')
    } catch (error) {
      console.error('Error updating recipe visibility:', error)
      alert('Error updating recipe visibility. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return
    }
    
    try {
      await supabaseService.deleteRecipe(id)
      navigate(getBackNavigation())
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Error deleting recipe. Please try again.')
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite functionality with backend
  }

  const addToMealPlan = () => {
    // TODO: Implement meal plan integration
    alert('Meal plan integration coming soon!')
  }

  const shareRecipe = () => {
    // Check if recipe is public from the recipe object directly
    const recipeIsPublic = recipe?.is_public || false
    console.log('Sharing recipe:', { id, recipeIsPublic, recipe })
    
    // Always use the public URL for sharing if the recipe is public
    const shareUrl = recipeIsPublic 
      ? `${window.location.origin}/recipe/${id}` 
      : `${window.location.origin}/cookbook/${id}`

    console.log('Share URL generated:', shareUrl)

    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: shareUrl
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert(recipeIsPublic 
        ? 'Public recipe link copied to clipboard! Anyone with this link can view recipe.' 
        : 'Recipe link copied to clipboard! Note: Only you can view this recipe.')
    }
  }

  const shoppingList = recipe ? generateShoppingList(recipe.ingredients) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
        <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or you don't have access to it.</p>
        <div className="space-x-4">
          <Link to="/cookbook" className="btn btn-primary">
            Back to Cookbook
          </Link>
          <Link to={`/recipe/${id}`} className="btn btn-secondary">
            Try Public Version
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate(getBackNavigation())}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-600" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={shareRecipe}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share recipe"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={addToMealPlan}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Add to meal plan"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
          
          <Link
            to={`/cookbook/${recipe.id}/edit`}
            state={{ from: 'recipe-detail' }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit recipe"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete recipe"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recipe Image */}
          {recipe.image_url && (
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Description */}
          {recipe.description && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>
          )}

          {/* Ingredients */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="btn btn-secondary text-sm"
              >
                {showShoppingList ? 'Hide' : 'Show'} Shopping List
              </button>
            </div>
            
            <ul className="space-y-3">
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">
                    {typeof ingredient === 'string' ? ingredient : formatIngredient(ingredient)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping List */}
          {showShoppingList && shoppingList.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shopping List</h2>
              <div className="space-y-4">
                {shoppingList.map(category => (
                  <div key={category.category}>
                    <h3 className="text-lg font-medium text-gray-800 mb-2 capitalize">
                      {category.category}
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            defaultChecked={item.checked}
                            onChange={(e) => {
                              item.checked = e.target.checked
                            }}
                          />
                          <span className="text-gray-700">
                            {item.quantity && `${item.quantity} `}
                            {item.unit && `${item.unit} `}
                            {item.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-6">
              {recipe.instructions && recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      {typeof instruction === 'string' ? instruction : instruction.text || instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recipe Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Info</h3>
            
            <div className="space-y-3">
              {recipe.prep_time && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Prep: {recipe.prep_time}</span>
                </div>
              )}
              
              {recipe.cook_time && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Cook: {recipe.cook_time}</span>
                </div>
              )}
              
              {recipe.total_time && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Total: {recipe.total_time}</span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>
          </div>

          {/* Public Sharing Toggle */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Public Sharing</span>
                </div>
                <button
                  onClick={togglePublic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {isPublic 
                  ? 'This recipe is publicly visible and can be shared with anyone.'
                  : 'This recipe is private and only visible to you.'}
              </p>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {recipe.source && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Source</h3>
              <p className="text-sm text-gray-600">{recipe.source}</p>
            </div>
          )}

          {/* Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={addToMealPlan}
                className="btn btn-primary w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add to Meal Plan
              </button>
              
              <Link
                to={`/cookbook/${recipe.id}/edit`}
                state={{ from: 'recipe-detail' }}
                className="btn btn-secondary w-full"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Recipe
              </Link>
              
              <button
                onClick={shareRecipe}
                className="btn btn-secondary w-full"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                {isPublic ? 'Share Public Link' : 'Share Recipe'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
