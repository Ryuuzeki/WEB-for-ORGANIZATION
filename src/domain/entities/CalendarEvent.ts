export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventInput {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string | null;
}
