'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { createVolunteerApplication } from '@/lib/firebase/firestore'

const commonSkills = [
  'Event Planning',
  'Social Media Management',
  'Content Writing',
  'Graphic Design',
  'Photography',
  'Videography',
  'Web Development',
  'Community Outreach',
  'Fundraising',
  'Administrative Support',
  'Legal Research',
  'Public Speaking',
  'Translation',
  'Data Entry',
  'Other',
]

export default function VolunteerApplicationForm() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    availability: '',
    skills: [] as string[],
    experience: '',
    motivation: '',
    references: '',
  })
  const [customSkill, setCustomSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: userProfile?.name || user.displayName || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user, userProfile])

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }))
      setCustomSkill('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!formData.availability.trim()) {
      setError('Please describe your availability')
      setLoading(false)
      return
    }
    if (formData.skills.length === 0) {
      setError('Please select at least one skill')
      setLoading(false)
      return
    }
    if (!formData.experience.trim()) {
      setError('Please describe your experience')
      setLoading(false)
      return
    }
    if (!formData.motivation.trim()) {
      setError('Please explain your motivation for volunteering')
      setLoading(false)
      return
    }

    try {
      // Build application object, only including fields that have values
      const applicationData: any = {
        userId: user?.uid || '',
        name: formData.name.trim(),
        email: formData.email.trim(),
        availability: formData.availability.trim(),
        skills: formData.skills,
        experience: formData.experience.trim(),
        motivation: formData.motivation.trim(),
      }

      // Add optional fields only if they have values
      if (formData.phone.trim()) applicationData.phone = formData.phone.trim()
      if (formData.address.trim()) applicationData.address = formData.address.trim()
      if (formData.city.trim()) applicationData.city = formData.city.trim()
      if (formData.state.trim()) applicationData.state = formData.state.trim()
      if (formData.zipCode.trim()) applicationData.zipCode = formData.zipCode.trim()
      if (formData.dateOfBirth) applicationData.dateOfBirth = formData.dateOfBirth
      if (formData.gender.trim()) applicationData.gender = formData.gender.trim()
      if (formData.references.trim()) applicationData.references = formData.references.trim()

      await createVolunteerApplication(applicationData)

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/volunteer')
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting volunteer application:', err)
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
          Thank you! Your volunteer application has been submitted successfully. Redirecting...
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="mb-3 text-lg font-bold">Personal Information</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Street Address"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="State"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="12345"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-lg font-bold">Availability</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-900">
            When are you available to volunteer? <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="e.g., Weekends, Evenings, Flexible schedule..."
            required
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="mb-3 text-lg font-bold">Skills & Experience</h3>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Select your skills <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {commonSkills.map((skill) => (
              <label
                key={skill}
                className="flex items-center space-x-2 cursor-pointer rounded-lg border border-slate-300 p-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">{skill}</span>
              </label>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomSkill()
                }
              }}
              placeholder="Add custom skill"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-900">
          Relevant Experience <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Describe your relevant experience, education, or background..."
          required
        />
      </div>

      {/* Motivation */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-900">
          Why do you want to volunteer with us? <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Tell us about your motivation and what you hope to contribute..."
          required
        />
      </div>

      {/* References */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-900">
          References (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.references}
          onChange={(e) => setFormData({ ...formData, references: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Name, relationship, and contact information for references..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Application'}
      </button>
    </form>
  )
}

