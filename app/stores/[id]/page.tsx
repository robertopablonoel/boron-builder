'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { InviteMemberModal } from '@/components/stores/invite-member-modal'

interface Store {
  id: string
  name: string
  role: 'owner' | 'admin' | 'member'
  member_count: number
  created_at: string
}

interface Member {
  user_id: string
  email: string
  full_name: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'member'
  created_at: string
}

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [store, setStore] = useState<Store | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members')

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data.store)
      } else {
        router.push('/stores')
      }
    } catch (error) {
      console.error('Error fetching store:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchInvites = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/invites`)
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStore(), fetchMembers(), fetchInvites()])
      setLoading(false)
    }
    loadData()
  }, [storeId])

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(
        `/api/stores/${storeId}/members/${userId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setMembers(members.filter((m) => m.user_id !== userId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(
        `/api/stores/${storeId}/invites/${inviteId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setInvites(invites.filter((i) => i.id !== inviteId))
      }
    } catch (error) {
      console.error('Error canceling invite:', error)
    }
  }

  const handleInviteSent = (invite: any) => {
    setInvites([invite.invite, ...invites])
    setShowInviteModal(false)
    setActiveTab('invites')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!store) {
    return null
  }

  const canInvite = store.role === 'owner' || store.role === 'admin'
  const canManage = store.role === 'owner' || store.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/stores')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {store.member_count} {store.member_count === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/stores/${storeId}/funnels`)}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                View Funnels
              </button>
              <button
                onClick={() => router.push(`/stores/${storeId}/settings`)}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'members'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('invites')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'invites'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Invites ({invites.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Team Members
                  </h3>
                  {canInvite && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Invite Member
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">
                            {member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.full_name || member.email}
                          </p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {member.role}
                        </span>
                        {canManage && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'invites' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Pending Invitations
                </h3>

                {invites.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No pending invitations</p>
                    {canInvite && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Invite a member
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {invite.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            Invited as {invite.role} •{' '}
                            {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {canManage && (
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          storeId={storeId}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={handleInviteSent}
        />
      )}
    </div>
  )
}
