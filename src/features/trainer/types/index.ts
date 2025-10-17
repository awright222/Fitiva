// Types for trainer features
// TODO: These will be synced with Supabase schema later

export interface TrainerClient {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  status: 'active' | 'inactive' | 'needs_checkin';
  lastSession?: string | null;
  nextSession?: string | null;
  programProgress: number;
  currentProgram: string;
  joinDate: string;
  unreadMessages: number;
  totalSessions: number;
  completedSessions: number;
  notes?: string;
}

export interface TrainerSession {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'pending_approval' | 'completed' | 'cancelled';
  type: 'personal_training' | 'check_in' | 'consultation';
  notes?: string;
  location?: string;
}

export interface TrainerAvailability {
  [key: string]: {
    available: boolean;
    slots: string[]; // Time slots like "09:00", "10:00"
  };
}

export interface TrainerCertification {
  name: string;
  year: number;
  organization?: string;
  expiryDate?: string;
}

export interface TrainerProfile {
  name: string;
  bio: string;
  specialties: string[];
  rating: number;
  totalClients: number;
  certifications: TrainerCertification[];
  experience: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
}

export interface TrainerConversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: {
    text: string;
    timestamp: string;
    from: 'client' | 'trainer';
  };
  unreadCount: number;
}

// TODO: Future Supabase table schemas
/*
Table trainer_assignments {
  id int [pk, increment]
  trainer_id uuid [ref: > users.id]
  client_id uuid [ref: > users.id]
  org_id int [ref: > organizations.id]
  status enum('pending', 'active', 'inactive')
  assigned_date timestamp
  created_at timestamp
  updated_at timestamp
}

Table trainer_availability {
  id int [pk, increment]
  trainer_id uuid [ref: > users.id]
  day_of_week int // 0-6 (Sunday-Saturday)
  start_time time
  end_time time
  is_available boolean
  created_at timestamp
  updated_at timestamp
}

Table trainer_certifications {
  id int [pk, increment]
  trainer_id uuid [ref: > users.id]
  name varchar
  issuing_organization varchar
  issue_date date
  expiry_date date
  verification_url varchar
  created_at timestamp
  updated_at timestamp
}
*/