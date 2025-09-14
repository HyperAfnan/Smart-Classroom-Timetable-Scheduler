import React, { useState } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Book,
  Clock,
  Save,
  Edit,
  Camera
} from "lucide-react"

const TeacherProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "Jane",
    lastName: "Doe",
    title: "Dr.",
    email: "jane.doe@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Mathematics",
    office: "Room 12B, Building A",
    specialization: "Applied Mathematics, Statistics",
    experience: "8 years",
    education: "Ph.D. in Mathematics, Stanford University",
    bio:
      "Passionate educator with expertise in calculus, statistics, and applied mathematics. Dedicated to making complex mathematical concepts accessible to students.",
    officeHours: "Monday & Thursday: 11:00 AM - 1:00 PM",
    researchInterests:
      "Optimization Theory, Statistical Modeling, Educational Technology"
  })

  const [tempData, setTempData] = useState(profileData)

  const handleSave = () => {
    setProfileData(tempData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData(profileData)
    setIsEditing(false)
  }

  const subjects = [
    { name: "Calculus I", students: 42, semester: "Fall 2024" },
    { name: "Statistics", students: 35, semester: "Fall 2024" },
    { name: "Algebra II", students: 28, semester: "Fall 2024" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {profileData.title} {profileData.firstName}{" "}
                {profileData.lastName}
              </h2>
              <p className="text-gray-600 mt-1">
                {profileData.department} Department
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{profileData.experience}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Book className="h-4 w-4" />
                  <span>{subjects.length} Subjects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profileData.email}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profileData.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {profileData.office}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.firstName}
                    onChange={e =>
                      setTempData({ ...tempData, firstName: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.lastName}
                    onChange={e =>
                      setTempData({ ...tempData, lastName: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                {isEditing ? (
                  <select
                    value={tempData.title}
                    onChange={e =>
                      setTempData({ ...tempData, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{profileData.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.department}
                    onChange={e =>
                      setTempData({ ...tempData, department: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.department}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={tempData.bio}
                  onChange={e =>
                    setTempData({ ...tempData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Academic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.education}
                    onChange={e =>
                      setTempData({ ...tempData, education: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.education}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.specialization}
                    onChange={e =>
                      setTempData({
                        ...tempData,
                        specialization: e.target.value
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.specialization}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Interests
                </label>
                {isEditing ? (
                  <textarea
                    value={tempData.researchInterests}
                    onChange={e =>
                      setTempData({
                        ...tempData,
                        researchInterests: e.target.value
                      })
                    }
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">
                    {profileData.researchInterests}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Subjects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Current Subjects
            </h3>
            <div className="grid gap-4">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{subject.name}</p>
                    <p className="text-sm text-gray-600">{subject.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {subject.students} students
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile
