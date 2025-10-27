export const outreachEventTypes = [
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "community_service", label: "Community Service" },
  { value: "awareness_campaign", label: "Awareness Campaign" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "networking", label: "Networking Event" },
  { value: "training", label: "Training Session" },
  { value: "volunteer", label: "Volunteer Activity" },
  { value: "conference", label: "Conference" },
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "meetup", label: "Meetup" },
  { value: "exhibition", label: "Exhibition" },
  { value: "panel_discussion", label: "Panel Discussion" },
  { value: "town_hall", label: "Town Hall" },
  { value: "open_house", label: "Open House" },
  { value: "career_fair", label: "Career Fair" },
  { value: "health_screening", label: "Health Screening" },
  { value: "blood_donation", label: "Blood Donation" },
  { value: "food_drive", label: "Food Drive" },
  { value: "mentorship_program", label: "Mentorship Program" },
  { value: "educational_tour", label: "Educational Tour" },
  { value: "sports_event", label: "Sports Event" },
  { value: "cultural_event", label: "Cultural Event" },
  { value: "charity_auction", label: "Charity Auction" },
  { value: "other", label: "Other/Custom Event" },
];

export const getEventTypeLabel = (value: string): string => {
  const type = outreachEventTypes.find(t => t.value === value);
  return type?.label || value;
};
