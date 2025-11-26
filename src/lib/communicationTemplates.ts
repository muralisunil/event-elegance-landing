import { Calendar, MapPin, ClipboardList, Megaphone, Bell, FileText } from "lucide-react";

export interface CommunicationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'datetime' | 'select' | 'richtext' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface CommunicationTemplate {
  name: string;
  icon: any;
  defaultSubject: string;
  fields: CommunicationField[];
}

export const communicationTemplates: Record<string, CommunicationTemplate> = {
  event_schedule: {
    name: 'Event Schedule',
    icon: Calendar,
    defaultSubject: 'Event Schedule - {eventName}',
    fields: [
      { name: 'event_date', label: 'Event Date', type: 'datetime', required: true },
      { name: 'venue', label: 'Venue', type: 'text', required: true, placeholder: 'Enter venue name' },
      { name: 'agenda', label: 'Agenda/Schedule', type: 'textarea', required: true, placeholder: 'Detailed event schedule' },
      { name: 'dress_code', label: 'Dress Code', type: 'select', options: ['Formal', 'Business Casual', 'Casual', 'Traditional'] },
      { name: 'additional_notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any other important information' }
    ]
  },
  venue_details: {
    name: 'Venue Details',
    icon: MapPin,
    defaultSubject: 'Venue Information - {eventName}',
    fields: [
      { name: 'venue_name', label: 'Venue Name', type: 'text', required: true, placeholder: 'Name of the venue' },
      { name: 'full_address', label: 'Full Address', type: 'textarea', required: true, placeholder: 'Complete address with landmarks' },
      { name: 'parking_info', label: 'Parking Information', type: 'textarea', placeholder: 'Parking availability and instructions' },
      { name: 'directions', label: 'Directions', type: 'textarea', placeholder: 'How to reach the venue' },
      { name: 'accessibility', label: 'Accessibility Info', type: 'textarea', placeholder: 'Wheelchair access, elevators, etc.' },
      { name: 'map_link', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/...' }
    ]
  },
  registration: {
    name: 'Registration Info',
    icon: ClipboardList,
    defaultSubject: 'Registration Details - {eventName}',
    fields: [
      { name: 'registration_link', label: 'Registration Link', type: 'url', required: true, placeholder: 'https://...' },
      { name: 'deadline', label: 'Registration Deadline', type: 'datetime', required: true },
      { name: 'requirements', label: 'Requirements', type: 'textarea', placeholder: 'Documents or information needed' },
      { name: 'fees', label: 'Registration Fees', type: 'text', placeholder: 'Cost details' },
      { name: 'contact_info', label: 'Contact for Queries', type: 'text', placeholder: 'Email or phone number' }
    ]
  },
  announcement: {
    name: 'Announcement',
    icon: Megaphone,
    defaultSubject: 'Announcement - {eventName}',
    fields: [
      { name: 'announcement_title', label: 'Announcement Title', type: 'text', required: true, placeholder: 'Brief title' },
      { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Detailed announcement message' },
      { name: 'action_required', label: 'Action Required', type: 'select', options: ['Yes', 'No'] },
      { name: 'action_deadline', label: 'Action Deadline', type: 'datetime' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] }
    ]
  },
  reminder: {
    name: 'Reminder',
    icon: Bell,
    defaultSubject: 'Reminder - {eventName}',
    fields: [
      { name: 'reminder_type', label: 'Reminder Type', type: 'select', required: true, options: ['Event Date', 'Registration', 'Payment', 'Document Submission', 'Other'] },
      { name: 'key_details', label: 'Key Details', type: 'textarea', required: true, placeholder: 'What needs to be done' },
      { name: 'deadline', label: 'Deadline/Date', type: 'datetime' },
      { name: 'action_link', label: 'Action Link (if any)', type: 'url', placeholder: 'https://...' }
    ]
  },
  other: {
    name: 'Custom Message',
    icon: FileText,
    defaultSubject: '{eventName}',
    fields: [
      { name: 'content', label: 'Message Content', type: 'richtext', required: true }
    ]
  }
};
