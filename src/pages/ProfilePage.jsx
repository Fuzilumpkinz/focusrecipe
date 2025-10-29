import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.username || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
