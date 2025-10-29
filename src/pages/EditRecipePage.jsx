import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'
import { parseIngredients, formatIngredient, ingredientsToStrings } from '../utils/ingredientParser'
import { 
  PhotoIcon, 
  XMarkIcon,
  PlusIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'

export default function EditRecipePage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [originalRecipe, setOriginalRecipe] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    total_time: '',
    servings: '',
    ingredients: [''],
    instructions: [''],
    tags: [],
    source: ''
  })
  
  const [newTag, setNewTag] = useState('')

  // Determine where to navigate back to based on where user came from
  const getBackNavigation = () => {
    // Check if user came from recipe detail page
    if (location.state?.from === 'recipe-detail') {
      return `/cookbook/${id}`
    }
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
    if (!id || !user) return
    
    try {
      setLoading(true)
      const allRecipes = await supabaseService.getRecipes(user.id)
      const foundRecipe = allRecipes.find(r => r.id === id)
      
      if (foundRecipe) {
        setOriginalRecipe(foundRecipe)
        
        // Convert ingredients from structured format back to strings
        const ingredientStrings = ingredientsToStrings(foundRecipe.ingredients || [])
        
        setFormData({
          title: foundRecipe.title || '',
          description: foundRecipe.description || '',
          prep_time: foundRecipe.prep_time || '',
          cook_time: foundRecipe.cook_time || '',
          total_time: foundRecipe.total_time || '',
          servings: foundRecipe.servings || '',
          ingredients: ingredientStrings.length > 0 ? ingredientStrings : [''],
          instructions: foundRecipe.instructions || [''],
          tags: foundRecipe.tags || [],
          source: foundRecipe.source || ''
        })
        
        if (foundRecipe.image_url) {
          setImagePreview(foundRecipe.image_url)
          setImageUrl(foundRecipe.image_url)
        }
      } else {
        navigate('/cookbook')
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
      navigate('/cookbook')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredientField = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredientField = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients.length ? newIngredients : ['']
    }))
  }

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }))
  }

  const addInstructionField = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstructionField = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions.length ? newInstructions : ['']
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setImageUrl(reader.result) // In production, upload to storage service
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (formData.prep_time && !/^\d+\s*(min|hr|hour|hours?|mins?|minutes?)$/i.test(formData.prep_time)) {
      newErrors.prep_time = 'Please enter a valid time (e.g., "30 min", "1 hr")'
    }
    
    if (formData.cook_time && !/^\d+\s*(min|hr|hour|hours?|mins?|minutes?)$/i.test(formData.cook_time)) {
      newErrors.cook_time = 'Please enter a valid time (e.g., "30 min", "1 hr")'
    }
    
    if (formData.servings && !/^\d+$/.test(formData.servings)) {
      newErrors.servings = 'Servings must be a number'
    }
    
    const validIngredients = formData.ingredients.filter(ing => ing.trim())
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }
    
    const validInstructions = formData.instructions.filter(inst => inst.trim())
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    
    try {
      // Parse ingredients for structured storage
      const parsedIngredients = parseIngredients(
        formData.ingredients.filter(ing => ing.trim())
      )
      
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: imageUrl,
        prep_time: formData.prep_time.trim(),
        cook_time: formData.cook_time.trim(),
        total_time: formData.total_time.trim(),
        servings: formData.servings.trim(),
        ingredients: parsedIngredients,
        instructions: formData.instructions.filter(inst => inst.trim()),
        tags: formData.tags,
        source: formData.source.trim(),
        created_by_profile_id: user.id
      }
      
      await supabaseService.updateRecipe(id, recipeData)
      navigate(getBackNavigation())
    } catch (error) {
      console.error('Error updating recipe:', error)
      alert('Error updating recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.ingredients.some(ing => ing.trim()) && 
           formData.instructions.some(inst => inst.trim())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!originalRecipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
        <p className="text-gray-600 mb-6">The recipe you're trying to edit doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/cookbook')}
          className="btn btn-primary"
        >
          Back to Cookbook
        </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`input ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input"
                    placeholder="A brief description of your recipe..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time
                    </label>
                    <input
                      type="text"
                      id="prep_time"
                      name="prep_time"
                      value={formData.prep_time}
                      onChange={handleInputChange}
                      className={`input ${errors.prep_time ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="e.g., 30 min"
                    />
                    {errors.prep_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.prep_time}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cook_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Cook Time
                    </label>
                    <input
                      type="text"
                      id="cook_time"
                      name="cook_time"
                      value={formData.cook_time}
                      onChange={handleInputChange}
                      className={`input ${errors.cook_time ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="e.g., 45 min"
                    />
                    {errors.cook_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.cook_time}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="total_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Time
                    </label>
                    <input
                      type="text"
                      id="total_time"
                      name="total_time"
                      value={formData.total_time}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g., 1 hr 15 min"
                    />
                  </div>

                  <div>
                    <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                      Servings
                    </label>
                    <input
                      type="text"
                      id="servings"
                      name="servings"
                      value={formData.servings}
                      onChange={handleInputChange}
                      className={`input ${errors.servings ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="e.g., 4"
                    />
                    {errors.servings && (
                      <p className="mt-1 text-sm text-red-600">{errors.servings}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Family Recipe, The Joy of Cooking"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
                <button
                  type="button"
                  onClick={addIngredientField}
                  className="btn btn-secondary text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Ingredient
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      className="input flex-1"
                      placeholder="e.g., 2 cups all-purpose flour"
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredientField(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {errors.ingredients && (
                <p className="mt-2 text-sm text-red-600">{errors.ingredients}</p>
              )}
              
              <p className="mt-3 text-sm text-gray-500">
                Enter ingredients one per line. The system will automatically parse quantities, units, and separate them for shopping lists.
              </p>
            </div>

            {/* Instructions */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
                <button
                  type="button"
                  onClick={addInstructionField}
                  className="btn btn-secondary text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Step
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="input flex-1 min-h-[60px]"
                      placeholder={`Step ${index + 1}: ...`}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstructionField(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {errors.instructions && (
                <p className="mt-2 text-sm text-red-600">{errors.instructions}</p>
              )}
            </div>

            {/* Tags */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="input flex-1"
                    placeholder="Add a tag (e.g., vegetarian, dessert, quick)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Image Upload */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recipe Image</h2>
              
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving || !isFormValid()}
                  className="btn btn-primary w-full"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(getBackNavigation())}
                  className="btn btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
