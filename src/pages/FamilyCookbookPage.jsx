import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PlusIcon, UserIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'

export default function FamilyCookbookPage() {
  const { familyId } = useParams()
  const { user } = useAuth()
  const [family, setFamily] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (familyId && user) {
      loadFamilyData()
    }
  }, [familyId, user])

  const loadFamilyData = async () => {
    try {
      // Load family info
      const familyData = await supabaseService.getFamilyById(familyId)
      setFamily(familyData)

      // Load family recipes
      const familyRecipes = await supabaseService.getFamilyRecipes(familyId)
      setRecipes(familyRecipes)

      // Load family members
      const familyMembers = await supabaseService.getFamilyMembers(familyId)
      setMembers(familyMembers)

    } catch (error) {
      console.error('Error loading family data:', error)
      setError('Failed to load family cookbook. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      await supabaseService.inviteFamilyMember(familyId, user.id, inviteEmail.trim())
      setInviteEmail('')
      setShowInviteModal(false)
      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  const getUserRole = () => {
    const member = members.find(m => m.profiles.id === user.id)
    return member ? member.role : null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Link to="/families" className="btn btn-primary">
          Back to Families
        </Link>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Family not found</h3>
        <p className="text-gray-500 mb-6">
          The family group you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/families" className="btn btn-primary">
          Back to Families
        </Link>
      </div>
    )
  }

  const userRole = getUserRole()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{family.name} Cookbook</h1>
          <p className="mt-2 text-gray-600">
            {family.description || 'Shared recipes for your family'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {userRole === 'admin' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-secondary"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Invite Member
            </button>
          )}
          <Link to="/cookbook/create" className="btn btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Recipe
          </Link>
        </div>
      </div>

      {/* Family Members */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Members</h2>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <div
              key={member.profiles.id}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                member.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <UserIcon className="h-4 w-4 mr-1" />
              {member.profiles.email}
              {member.role === 'admin' && <span className="ml-1 font-medium">(Admin)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Shared Recipes ({recipes.length})
        </h2>
        
        {recipes.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared recipes yet</h3>
            <p className="text-gray-500 mb-6">
              Start sharing recipes with your family by adding your first recipe to the cookbook.
            </p>
            <Link to="/cookbook/create" className="btn btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  {/* Recipe attribution */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Added by {recipe.profiles?.email || user.email}
                    <span className="mx-2">•</span>
                    <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>⏱️ {recipe.cook_time || 'N/A'} mins</span>
                    <span>🍽️ {recipe.servings || 'N/A'} servings</span>
                  </div>

                  <Link
                    to={`/cookbook/${recipe.id}`}
                    className="btn btn-primary w-full"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invite Family Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleInviteMember}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="input w-full"
                  placeholder="friend@example.com"
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  An invitation will be sent to this email address. They can accept the invitation to join your family group.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="btn btn-primary"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
