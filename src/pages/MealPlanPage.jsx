import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'
import {
  CalendarIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function MealPlanPage() {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [families, setFamilies] = useState([])
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [mealPlan, setMealPlan] = useState(null)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedMealType, setSelectedMealType] = useState('')
  const [userRecipes, setUserRecipes] = useState([])

  // Meal types configuration
  const mealTypes = [
    { key: 'meal_1', label: 'Breakfast', time: '8:00 AM' },
    { key: 'meal_2', label: 'Lunch', time: '12:00 PM' },
    { key: 'meal_3', label: 'Dinner', time: '6:00 PM' },
    { key: 'snack_1', label: 'Morning Snack', time: '10:00 AM' },
    { key: 'snack_2', label: 'Afternoon Snack', time: '3:00 PM' }
  ]

  useEffect(() => {
    loadInitialData()
  }, [user])

  useEffect(() => {
    if (selectedFamily) {
      loadMealPlan()
      loadUserRecipes()
    }
  }, [selectedFamily, currentWeek])

  const loadInitialData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Load user's families
      const userFamilies = await supabaseService.getUserFamilies(user.id)
      setFamilies(userFamilies)
      
      if (userFamilies.length > 0) {
        setSelectedFamily(userFamilies[0].families)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMealPlan = async () => {
    if (!selectedFamily) return
    
    try {
      const startOfWeek = getStartOfWeek(currentWeek)
      const endOfWeek = getEndOfWeek(currentWeek)
      
      const plan = await supabaseService.getMealPlan(
        selectedFamily.id,
        startOfWeek,
        endOfWeek
      )
      
      setMealPlan(plan)
    } catch (error) {
      console.error('Error loading meal plan:', error)
    }
  }

  const loadUserRecipes = async () => {
    try {
      const recipes = await supabaseService.getRecipes(user.id)
      setUserRecipes(recipes)
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  }

  const getWeekDates = () => {
    const start = getStartOfWeek(currentWeek)
    const dates = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const changeWeek = (direction) => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newWeek)
  }

  const handleAddMeal = (date, mealType) => {
    setSelectedDate(date)
    setSelectedMealType(mealType)
    setShowAddMeal(true)
  }

  const handleRecipeSelect = async (recipe) => {
    if (!selectedFamily || !selectedDate || !selectedMealType) return
    
    try {
      const startOfWeek = getStartOfWeek(currentWeek)
      const endOfWeek = getEndOfWeek(currentWeek)
      
      let plan = mealPlan
      
      // Create meal plan if it doesn't exist
      if (!plan) {
        plan = await supabaseService.createMealPlan({
          family_id: selectedFamily.id,
          start_date: startOfWeek,
          end_date: endOfWeek
        })
      }
      
      // Add meal to plan
      await supabaseService.createMealPlanEntry({
        plan_id: plan.id,
        recipe_id: recipe.id,
        date: selectedDate,
        meal_type: selectedMealType
      })
      
      // Reload meal plan
      await loadMealPlan()
      
      // Close modal
      setShowAddMeal(false)
      setSelectedDate(null)
      setSelectedMealType('')
    } catch (error) {
      console.error('Error adding meal to plan:', error)
      alert('Error adding meal to plan. Please try again.')
    }
  }

  const handleRemoveMeal = async (entry) => {
    if (!confirm('Are you sure you want to remove this meal from the plan?')) return
    
    try {
      await supabaseService.deleteMealPlanEntry(entry.id)
      await loadMealPlan()
    } catch (error) {
      console.error('Error removing meal:', error)
      alert('Error removing meal. Please try again.')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMealForDateAndType = (date, mealType) => {
    if (!mealPlan?.meal_plan_entries) return null
    
    return mealPlan.meal_plan_entries.find(entry => {
      const entryDate = new Date(entry.date).toDateString()
      const currentDate = new Date(date).toDateString()
      return entryDate === currentDate && entry.meal_type === mealType
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (families.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Families Found</h2>
        <p className="text-gray-600 mb-6">You need to join or create a family to use the meal planner.</p>
        <button
          onClick={() => {/* Navigate to families page */}}
          className="btn btn-primary"
        >
          Create or Join Family
        </button>
      </div>
    )
  }

  const weekDates = getWeekDates()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meal Plan</h1>
        
        {/* Family Selector */}
        {families.length > 1 && (
          <select
            value={selectedFamily?.id || ''}
            onChange={(e) => setSelectedFamily(families.find(f => f.families.id === e.target.value)?.families)}
            className="input min-w-[200px]"
          >
            {families.map(family => (
              <option key={family.families.id} value={family.families.id}>
                {family.families.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeWeek(-1)}
          className="btn btn-secondary"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous Week
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </h2>
          <p className="text-sm text-gray-600">
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <button
          onClick={() => changeWeek(1)}
          className="btn btn-secondary"
        >
          Next Week
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </button>
      </div>

      {/* Meal Plan Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="p-4 text-sm font-medium text-gray-700">
            Meal
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-4 text-center text-sm font-medium text-gray-900 border-l border-gray-200">
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Meal Rows */}
        {mealTypes.map(mealType => (
          <div key={mealType.key} className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 text-sm font-medium text-gray-700 bg-gray-50">
              <div className="flex items-center">
                <span>{mealType.label}</span>
                <span className="ml-2 text-xs text-gray-500">{mealType.time}</span>
              </div>
            </div>
            
            {weekDates.map((date, dateIndex) => {
              const meal = getMealForDateAndType(date, mealType.key)
              
              return (
                <div key={dateIndex} className="p-4 border-l border-gray-200 min-h-[80px]">
                  {meal ? (
                    <div className="group relative">
                      <div className="bg-primary-100 rounded-lg p-3 cursor-pointer hover:bg-primary-200 transition-colors">
                        <h4 className="font-medium text-primary-900 text-sm mb-1 line-clamp-1">
                          {meal.recipes?.title || 'Recipe'}
                        </h4>
                        
                        {meal.recipes?.prep_time && (
                          <div className="flex items-center text-xs text-gray-600">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {meal.recipes.prep_time}
                          </div>
                        )}
                        
                        {meal.recipes?.servings && (
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <UserGroupIcon className="h-3 w-3 mr-1" />
                            {meal.recipes.servings} servings
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleRemoveMeal(meal)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Remove meal"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddMeal(date, mealType.key)}
                      className="w-full h-full bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Meal - {formatDate(selectedDate)} - {mealTypes.find(mt => mt.key === selectedMealType)?.label}
              </h3>
              <button
                onClick={() => setShowAddMeal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeSelect(recipe)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all text-left"
                  >
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-24 object-cover rounded mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{recipe.title}</h4>
                    {recipe.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{recipe.description}</p>
                    )}
                    {recipe.prep_time && (
                      <div className="flex items-center text-xs text-gray-600 mt-2">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {recipe.prep_time}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
