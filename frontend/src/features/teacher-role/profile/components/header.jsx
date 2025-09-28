/**
 * ProfileHeader Component
 * Displays the page title and subtitle for the Teacher Profile section.
 * Kept intentionally simple; expand with breadcrumbs or actions if needed.
 */

const ProfileHeader = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
    <p className="text-gray-600 mt-1">
      Manage your personal information and preferences
    </p>
  </div>
)

export default ProfileHeader
