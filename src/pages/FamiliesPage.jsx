import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../services/supabase'

export default function FamiliesPage() {
  const { user } = useAuth()
  const [families, setFamilies] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingInvitation, setProcessingInvitation] = useState(null)

  useEffect(() => {
    if (user) {
      loadFamilies()
      loadInvitations()
    }
  }, [user])

  const loadFamilies = async () => {
    try {
      const userFamilies = await supabaseService.getUserFamilies(user.id)
      setFamilies(userFamilies)
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const userInvitations = await supabaseService.getFamilyInvitations(user.id)
      setInvitations(userInvitations)
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const handleAcceptInvitation = async (invitationId) => {
    setProcessingInvitation(invitationId)
    try {
      await supabaseService.acceptInvitation(invitationId, user.id)
      // Refresh both families and invitations
      await loadFamilies()
      await loadInvitations()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Failed to accept invitation. Please try again.')
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleDeclineInvitation = async (invitationId) => {
    setProcessingInvitation(invitationId)
    try {
      await supabaseService.declineInvitation(invitationId)
      await loadInvitations()
    } catch (error) {
      console.error('Error declining invitation:', error)
      alert('Failed to decline invitation. Please try again.')
    } finally {
      setProcessingInvitation(null)
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
        <h1 className="text-3xl font-bold text-gray-900">Family Groups</h1>
        <Link
          to="/families/create"
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Invite to Family
        </Link>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Invitations</h2>
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="card bg-blue-50 border-blue-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {invitation.families.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Invited by {invitation.inviter.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        disabled={processingInvitation === invitation.id}
                        className="btn btn-primary btn-sm"
                      >
                        {processingInvitation === invitation.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        disabled={processingInvitation === invitation.id}
                        className="btn btn-secondary btn-sm"
                      >
                        {processingInvitation === invitation.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Decline
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Families */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Families</h2>
        
        {families.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No family groups yet</h3>
            <p className="text-gray-500 mb-6">
              Invite someone to your family to start sharing recipes and planning meals together. Your family group will be created automatically when you send your first invitation.
            </p>
            <Link
              to="/families/create"
              className="btn btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Invite to Family
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
                    Role: <span className="font-medium capitalize">{familyData.role}</span>
                  </p>
                  

                  <div className="space-y-2">
                    <Link
                      to={`/family-cookbook/${familyData.family_id}`}
                      className="btn btn-primary w-full"
                    >
                      View Cookbook
                    </Link>
                    {familyData.role === 'admin' && (
                      <Link
                        to={`/meal-plan/${familyData.family_id}`}
                        className="btn btn-secondary w-full"
                      >
                        Meal Plan
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
