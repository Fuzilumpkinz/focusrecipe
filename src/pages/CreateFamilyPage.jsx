import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'

export default function CreateFamilyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // First, check if user already has a family, if not create one for them
      const userFamilies = await supabaseService.getUserFamilies(user.id)
      
      let familyId
      if (userFamilies.length === 0) {
        // Create a family for this user
        const familyData = {
          name: `${user.email?.split('@')[0] || 'My'}'s Family`,
          description: 'Personal family group for sharing recipes',
          created_by: user.id
        }
        const family = await supabaseService.createFamily(familyData)
        familyId = family.id
      } else {
        familyId = userFamilies[0].family_id
      }

      // Now invite the person
      await supabaseService.inviteFamilyMember(familyId, user.id, formData.email.trim())
      setSuccess(`Invitation sent to ${formData.email.trim()}!`)
      
      // Clear form
      setFormData({ email: '' })
      
      // Redirect to families page after a short delay
      setTimeout(() => {
        navigate('/families')
      }, 1500)

    } catch (error) {
      console.error('Error sending invitation:', error)
      setError(error.message || 'Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invite to Family</h1>
        <p className="mt-2 text-gray-600">
          Invite someone to join your family group to start sharing recipes and planning meals together.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="familymember@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the email address of the person you want to invite to your family.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !formData.email.trim()}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/families')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Families
          </button>
        </div>
      </div>
    </div>
  )
}
