export interface ScheduleField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface ScheduleTemplate {
  commonFields: string[];
  specificFields: ScheduleField[];
}

export const scheduleTemplates: Record<string, ScheduleTemplate> = {
  workshop: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'instructor', label: 'Instructor', type: 'text', required: true },
      { name: 'skill_level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
      { name: 'materials_required', label: 'Materials Required', type: 'textarea', placeholder: 'List any materials participants should bring' },
      { name: 'max_participants', label: 'Max Participants', type: 'number' },
    ]
  },
  training: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'trainer', label: 'Trainer/Facilitator', type: 'text', required: true },
      { name: 'training_module', label: 'Training Module', type: 'text' },
      { name: 'certification', label: 'Certification Offered', type: 'select', options: ['Yes', 'No'] },
      { name: 'prerequisites', label: 'Prerequisites', type: 'textarea' },
    ]
  },
  panel_discussion: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'moderator', label: 'Moderator', type: 'text', required: true },
      { name: 'panelists', label: 'Panelists', type: 'textarea', required: true, placeholder: 'Enter panelist names (one per line)', helpText: 'List each panelist on a new line' },
      { name: 'discussion_topics', label: 'Discussion Topics', type: 'textarea', placeholder: 'Key topics to be discussed' },
      { name: 'qa_session', label: 'Q&A Session', type: 'select', options: ['Yes', 'No'], required: true },
    ]
  },
  seminar: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'speaker', label: 'Speaker', type: 'text', required: true },
      { name: 'speaker_bio', label: 'Speaker Bio', type: 'textarea' },
      { name: 'presentation_title', label: 'Presentation Title', type: 'text' },
      { name: 'handouts_available', label: 'Handouts Available', type: 'select', options: ['Yes', 'No'] },
    ]
  },
  conference: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'speaker', label: 'Speaker', type: 'text', required: true },
      { name: 'track', label: 'Conference Track', type: 'select', options: ['Technical', 'Business', 'Design', 'Leadership', 'Other'] },
      { name: 'session_format', label: 'Session Format', type: 'select', options: ['Presentation', 'Workshop', 'Panel', 'Keynote', 'Lightning Talk'] },
      { name: 'room', label: 'Room/Venue', type: 'text' },
    ]
  },
  networking: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'activity_type', label: 'Activity Type', type: 'select', options: ['Structured Networking', 'Open Networking', 'Speed Networking', 'Roundtable Discussion'] },
      { name: 'facilitator', label: 'Facilitator', type: 'text' },
      { name: 'icebreaker_topic', label: 'Icebreaker/Topic', type: 'text' },
      { name: 'expected_attendees', label: 'Expected Attendees', type: 'number' },
    ]
  },
  fundraiser: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'activity_name', label: 'Fundraising Activity', type: 'text', required: true },
      { name: 'target_amount', label: 'Target Amount ($)', type: 'number' },
      { name: 'sponsor', label: 'Sponsor/Partner', type: 'text' },
      { name: 'payment_methods', label: 'Payment Methods', type: 'textarea', placeholder: 'Cash, Card, Online, etc.' },
    ]
  },
  community_service: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'activity', label: 'Service Activity', type: 'text', required: true },
      { name: 'coordinator', label: 'Coordinator', type: 'text', required: true },
      { name: 'required_equipment', label: 'Required Equipment', type: 'textarea', placeholder: 'Tools, supplies, protective gear, etc.' },
      { name: 'volunteer_count', label: 'Number of Volunteers Needed', type: 'number' },
    ]
  },
  volunteer: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'activity', label: 'Volunteer Activity', type: 'text', required: true },
      { name: 'supervisor', label: 'Supervisor/Lead', type: 'text', required: true },
      { name: 'requirements', label: 'Requirements', type: 'textarea', placeholder: 'Age requirements, skills needed, etc.' },
      { name: 'volunteer_positions', label: 'Available Positions', type: 'number' },
    ]
  },
  webinar: {
    commonFields: ['session_title', 'start_time', 'end_time', 'description'],
    specificFields: [
      { name: 'presenter', label: 'Presenter', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['Zoom', 'Google Meet', 'Microsoft Teams', 'Webex', 'Other'], required: true },
      { name: 'meeting_link', label: 'Meeting Link', type: 'text', placeholder: 'https://...' },
      { name: 'recording_available', label: 'Recording Available', type: 'select', options: ['Yes', 'No'] },
    ]
  },
  hackathon: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'challenge_theme', label: 'Challenge/Theme', type: 'text', required: true },
      { name: 'judges', label: 'Judges', type: 'textarea', placeholder: 'List judges (one per line)' },
      { name: 'prizes', label: 'Prizes', type: 'textarea', placeholder: 'List prize categories and amounts' },
      { name: 'tech_stack', label: 'Allowed Technologies', type: 'textarea', placeholder: 'List allowed frameworks, languages, etc.' },
    ]
  },
  sports_event: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'sport_type', label: 'Sport/Activity', type: 'text', required: true },
      { name: 'teams_participants', label: 'Teams/Participants', type: 'textarea', placeholder: 'List teams or participant names' },
      { name: 'referee_official', label: 'Referee/Official', type: 'text' },
      { name: 'equipment_needed', label: 'Equipment Needed', type: 'textarea' },
    ]
  },
  health_screening: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'medical_professional', label: 'Medical Professional', type: 'text', required: true },
      { name: 'screening_type', label: 'Screening Type', type: 'select', options: ['Blood Pressure', 'Glucose', 'Cholesterol', 'Vision', 'Dental', 'General Health', 'Other'], required: true },
      { name: 'prerequisites', label: 'Prerequisites/Instructions', type: 'textarea', placeholder: 'Fasting requirements, forms to bring, etc.' },
      { name: 'capacity', label: 'Capacity', type: 'number' },
    ]
  },
  cultural_event: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'performer_artist', label: 'Performer/Artist', type: 'text', required: true },
      { name: 'performance_type', label: 'Performance Type', type: 'select', options: ['Music', 'Dance', 'Theater', 'Poetry', 'Art Exhibition', 'Other'] },
      { name: 'cultural_context', label: 'Cultural Context', type: 'textarea', placeholder: 'Background information about the performance' },
      { name: 'special_requirements', label: 'Special Requirements', type: 'textarea', placeholder: 'Seating, audio/visual, etc.' },
    ]
  },
  default: {
    commonFields: ['session_title', 'start_time', 'end_time', 'location', 'description'],
    specificFields: [
      { name: 'speaker', label: 'Speaker/Lead', type: 'text' },
      { name: 'notes', label: 'Additional Notes', type: 'textarea' },
    ]
  }
};

export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    workshop: 'Workshop',
    training: 'Training',
    panel_discussion: 'Panel Discussion',
    seminar: 'Seminar',
    conference: 'Conference',
    networking: 'Networking',
    fundraiser: 'Fundraiser',
    community_service: 'Community Service',
    volunteer: 'Volunteer',
    webinar: 'Webinar',
    hackathon: 'Hackathon',
    sports_event: 'Sports Event',
    health_screening: 'Health Screening',
    cultural_event: 'Cultural Event',
  };
  return labels[type] || formatFieldName(type);
};
