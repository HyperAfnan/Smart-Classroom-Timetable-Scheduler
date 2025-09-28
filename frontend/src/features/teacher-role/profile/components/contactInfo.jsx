import React from "react"
import { Mail, Phone, MapPin } from "lucide-react"

/**
 * ContactInfo Component
 *
 * Displays the teacher's primary contact & location details.
 * Keeps layout + semantics simple and accessible.
 *
 * Props:
 *  - profileData: {
 *      email: string,
 *      phone: string,
 *      office: string
 *    }
 *
 * Future enhancements:
 *  - Add copy-to-clipboard buttons
 *  - Add mailto: / tel: / maps links
 *  - Add skeleton/loading state if data becomes async
 *  - Make fields editable (integrate with isEditing & updateField)
 */
const ContactInfo = ({ profileData }) => {
  if (!profileData) return null

  const { email, phone, office } = profileData

  const items = [
    {
      key: "email",
      icon: Mail,
      value: email,
      render: v => (
        <a
          href={`mailto:${v}`}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors break-all"
        >
          {v}
        </a>
      ),
    },
    {
      key: "phone",
      icon: Phone,
      value: phone,
      render: v => (
        <a
          href={`tel:${v.replace(/\D/g, "")}`}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          {v}
        </a>
      ),
    },
    {
      key: "office",
      icon: MapPin,
      value: office,
      render: v => <span className="text-sm text-gray-600">{v}</span>,
    },
  ].filter(item => !!item.value)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Contact Information
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No contact details available.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ key, icon: Icon, value, render }) => (
            <li key={key} className="flex items-center space-x-3">
              <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {render(value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ContactInfo
