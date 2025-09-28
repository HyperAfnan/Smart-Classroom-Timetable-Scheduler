import React from "react";
import ProfileHeader from "./components/header.jsx";
import ActionsBar from "./components/actionsBar.jsx";
import ProfileCard from "./components/profileCard.jsx";
import ContactInfo from "./components/contactInfo.jsx";
import PersonalInfo from "./components/personalInfo.jsx";
import AcademicInfo from "./components/academicInfo.jsx";
import SubjectsList from "./components/subjectsList.jsx";
import { useTeacherProfile } from "./hooks/useTeacherProfile";

/**
 * TeacherProfile Page
 *
 * High-level composition layer that wires together:
 *  - Data / state via useTeacherProfile hook
 *  - Presentation components (header, actions, sections)
 *
 * Responsibilities:
 *  - Arrange layout
 *  - Pass necessary props down
 *  - Keep business + mutation logic inside the hook
 *
 * Future enhancements:
 *  - Breadcrumbs / navigation header
 *  - Loading / skeleton states (when data becomes async)
 *  - Toast notifications on save
 *  - Error banners for failed save attempts
 */
const TeacherProfile = () => {
  const {
    isEditing,
    profileData,
    tempData,
    subjects,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    isDirty,
  } = useTeacherProfile();

  // Placeholder for async saving logic (extend later)
  const saving = false;

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex justify-between items-center">
        <ProfileHeader />
        <ActionsBar
          isEditing={isEditing}
          onEdit={startEditing}
          onCancel={cancelEditing}
          onSave={saveChanges}
          disableSave={!isDirty || saving}
          saving={saving}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <ProfileCard
            profileData={profileData}
            subjects={subjects}
            isEditing={isEditing}
          />
          <ContactInfo profileData={profileData} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfo
            isEditing={isEditing}
            profileData={profileData}
            tempData={tempData}
            updateField={updateField}
          />
          <AcademicInfo
            isEditing={isEditing}
            profileData={profileData}
            tempData={tempData}
            updateField={updateField}
          />
          <SubjectsList subjects={subjects} />
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
