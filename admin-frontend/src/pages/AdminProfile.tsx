import React, { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminAuthService } from '../services/admin'
import { AdminLayout } from '../components/AdminLayout'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { FormField } from '../components/shared/FormField'
import { Textarea } from '../components/shared/Textarea'
import { Spinner } from '../components/shared/Spinner'
import { AlertCircle, CheckCircle, Mail, Shield } from 'lucide-react'

export const AdminProfile: React.FC = () => {
  const { admin, token, setAdmin } = useAdminAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    notes: admin?.notes || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const updated = await adminAuthService.updateProfile({
        name: profileData.name,
        notes: profileData.notes,
      })

      setAdmin(updated)
      setSuccess('Profile updated successfully')
      setIsEditing(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      await adminAuthService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setSuccess('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!admin) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-600 mt-1">Manage your admin account information</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Admin Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{admin.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{admin.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-600">{admin.email}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full capitalize">
                    {admin.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Account Created</p>
              <p className="text-sm font-medium text-slate-900">{new Date(admin.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${admin.verified ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <p className="text-sm text-slate-600">
                {admin.verified ? 'Email verified' : 'Email not verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'outline' : 'default'}
              size="sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <FormField label="Full Name">
                <Input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                />
              </FormField>

              <FormField label="Notes">
                <Textarea
                  name="notes"
                  value={profileData.notes}
                  onChange={handleProfileChange}
                  placeholder="Additional notes (optional)"
                  rows={4}
                />
              </FormField>

              <div className="flex gap-3">
                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-slate-900">{profileData.name}</p>
              </div>
              {profileData.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{profileData.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Security</h3>
            <Button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              variant={isChangingPassword ? 'outline' : 'default'}
              size="sm"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </Button>
          </div>

          {isChangingPassword ? (
            <div className="space-y-6">
              <FormField label="Current Password">
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                />
              </FormField>

              <FormField label="New Password">
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min. 6 characters)"
                />
              </FormField>

              <FormField
                label="Confirm New Password"
                error={
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              >
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </FormField>

              <div className="flex gap-3">
                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
                <Button onClick={() => setIsChangingPassword(false)} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-sm">
              Click the "Change Password" button to update your password for this account.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
