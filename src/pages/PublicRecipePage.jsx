import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseService } from '../services/supabase'
import { formatIngredient, generateShoppingList } from '../utils/ingredientParser'
import {
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import FocusRecipeLogo from '../components/FocusRecipeLogo'

export default function PublicRecipePage() {
  const { id } = useParams()
  
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)

  useEffect(() => {
    loadPublicRecipe()
  }, [id])

  const loadPublicRecipe = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      console.log('Loading public recipe with ID:', id)
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      })
      
      const foundRecipe = await Promise.race([
        supabaseService.getPublicRecipeById(id),
        timeoutPromise
      ])
      
      console.log('Found public recipe:', foundRecipe)
      
      if (foundRecipe && foundRecipe.is_public) {
        setRecipe(foundRecipe)
      } else {
        // Recipe not found or not public
        console.log('Recipe not found or not public:', foundRecipe)
        setRecipe(null)
      }
    } catch (error) {
      console.error('Error loading public recipe:', error)
      // Always set recipe to null on any error to prevent infinite loading
      setRecipe(null)
    } finally {
      setLoading(false)
    }
  }

  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Recipe link copied to clipboard!')
    }
  }

  const shoppingList = recipe ? generateShoppingList(recipe.ingredients) : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 max-w-md mx-auto px-4">
          <FocusRecipeLogo className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">This recipe doesn't exist or isn't available for public viewing.</p>
          <Link to="/" className="btn btn-primary">
            Back to FocusRecipe
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <FocusRecipeLogo className="h-8 w-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">FocusRecipe</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={shareRecipe}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              <Link
                to="/register"
                className="btn btn-primary text-sm"
              >
                Sign up to save recipes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-600">
              Shared publicly by the recipe creator
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-600" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
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

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Source</h3>
                <p className="text-sm text-gray-600">{recipe.source}</p>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Love this recipe?</h3>
              <p className="text-gray-700 mb-4">
                Create your free FocusRecipe account to save this recipe and build your own digital cookbook.
              </p>
              <Link to="/register" className="btn btn-primary w-full">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
