import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'

export default function MealPlansPage() {
  const { user } = useAuth()
  const [families, setFamilies] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadFamilies()
  }, [user])

  const loadFamilies = async () => {
    if (!user) return
    
    try {
      const userFamilies = await supabaseService.getUserFamilies(user.id)
      setFamilies(userFamilies)
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meal Plans</h1>
      </div>

      {families.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No families yet</h3>
          <p className="text-gray-500 mb-6">
            Join or create a family to start planning meals together.
          </p>
          <Link
            to="/families"
            className="btn btn-primary"
          >
            Manage Families
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((familyData) => (
            <div key={familyData.family_id} className="card">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {familyData.families.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Role: {familyData.role}
                </p>
                <Link
                  to={`/meal-plan/${familyData.family_id}`}
                  className="btn btn-primary w-full"
                >
                  View Meal Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
