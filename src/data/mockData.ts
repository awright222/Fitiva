// Mock data for dashboard components
// This will be replaced with real Supabase queries later

export const mockClientData = {
  welcomeMessage: "Welcome back, John!",
  trainerName: "Sarah Mitchell",
  currentProgram: {
    name: "Strength & Conditioning",
    progress: 65,
    nextSession: "Tomorrow at 3:00 PM",
  },
  upcomingSessions: [
    {
      id: "1",
      title: "Upper Body Strength",
      date: "Tomorrow",
      time: "3:00 PM",
      trainer: "Sarah Mitchell",
    },
    {
      id: "2",
      title: "Cardio & Core",
      date: "Friday",
      time: "10:00 AM",
      trainer: "Sarah Mitchell",
    },
  ],
  unreadMessages: 2,
  recentProgress: {
    workoutsCompleted: 12,
    totalWeeks: 8,
    currentWeek: 3,
  },
};

export const mockTrainerData = {
  profile: {
    name: "Sarah Mitchell",
    specialties: ["Strength Training", "Nutrition", "Rehabilitation"],
    rating: 4.9,
    totalClients: 24,
  },
  // Enhanced client data matching Supabase schema
  clients: [
    {
      id: "client1-uuid",
      full_name: "John Doe",
      email: "johndoe@example.com",
      profile_image: null,
      last_active: "2025-10-15T14:30:00Z",
      current_program: {
        id: "prog1",
        title: "Strength & Conditioning",
        start_date: "2025-10-01",
        progress: 65,
      },
      session_stats: {
        total_sessions: 12,
        completed_sessions: 10,
        last_session: "2025-10-15T15:00:00Z",
        next_session: "2025-10-18T15:00:00Z",
      },
      engagement: {
        streak_days: 4,
        total_logins: 28,
        missed_sessions: 2,
        completion_rate: 83,
        last_login: "2025-10-16T09:15:00Z",
      },
      status: "active",
    },
    {
      id: "client2-uuid",
      full_name: "Jane Smith", 
      email: "janesmith@example.com",
      profile_image: null,
      last_active: "2025-10-16T10:15:00Z",
      current_program: {
        id: "prog2", 
        title: "Cardio & Core",
        start_date: "2025-09-15",
        progress: 80,
      },
      session_stats: {
        total_sessions: 16,
        completed_sessions: 15,
        last_session: "2025-10-16T10:00:00Z",
        next_session: "2025-10-18T10:00:00Z",
      },
      engagement: {
        streak_days: 12,
        total_logins: 45,
        missed_sessions: 1,
        completion_rate: 94,
        last_login: "2025-10-16T08:30:00Z",
      },
      status: "active",
    },
    {
      id: "client3-uuid",
      full_name: "Mike Johnson",
      email: "mikejohnson@example.com", 
      profile_image: null,
      last_active: "2025-10-16T16:45:00Z",
      current_program: {
        id: "prog3",
        title: "Weight Loss & Mobility",
        start_date: "2025-10-10",
        progress: 25,
      },
      session_stats: {
        total_sessions: 4,
        completed_sessions: 2,
        last_session: "2025-10-16T14:00:00Z",
        next_session: "2025-10-19T14:00:00Z",
      },
      engagement: {
        streak_days: 0,
        total_logins: 8,
        missed_sessions: 2,
        completion_rate: 50,
        last_login: "2025-10-14T16:45:00Z",
      },
      status: "active",
    },
    {
      id: "client4-uuid",
      full_name: "Emma Wilson",
      email: "emmawilson@example.com",
      profile_image: null,
      last_active: "2025-10-12T09:30:00Z", 
      current_program: null,
      session_stats: {
        total_sessions: 1,
        completed_sessions: 1,
        last_session: "2025-10-12T16:00:00Z",
        next_session: null,
      },
      engagement: {
        streak_days: 0,
        total_logins: 3,
        missed_sessions: 0,
        completion_rate: 100,
        last_login: "2025-10-12T09:30:00Z",
      },
      status: "inactive",
    },
  ],
  // Available programs for assignment
  availablePrograms: [
    {
      id: "prog1",
      title: "Strength & Conditioning",
      description: "Build muscle and improve functional strength",
      duration_weeks: 12,
      difficulty: "Intermediate",
      created_by: "trainer-uuid",
    },
    {
      id: "prog2", 
      title: "Cardio & Core",
      description: "Improve cardiovascular health and core stability",
      duration_weeks: 8,
      difficulty: "Beginner",
      created_by: "trainer-uuid",
    },
    {
      id: "prog3",
      title: "Weight Loss & Mobility",
      description: "Lose weight while improving flexibility and movement",
      duration_weeks: 16,
      difficulty: "Beginner",
      created_by: "trainer-uuid",
    },
    {
      id: "prog4",
      title: "Athletic Performance",
      description: "Advanced training for competitive athletes",
      duration_weeks: 20,
      difficulty: "Advanced",
      created_by: "trainer-uuid",
    },
    {
      id: "prog5",
      title: "Senior Fitness",
      description: "Safe, effective exercise for older adults",
      duration_weeks: 10,
      difficulty: "Beginner",
      created_by: "trainer-uuid",
    },
  ],
  // Enhanced session data matching Supabase sessions table
  sessions: [
    {
      id: "session1",
      client_id: "client1-uuid",
      client_name: "John Doe",
      scheduled_at: "2025-10-18T15:00:00Z",
      status: "scheduled",
      session_type: "Strength Training",
      duration_minutes: 60,
      notes: null,
    },
    {
      id: "session2", 
      client_id: "client2-uuid",
      client_name: "Jane Smith",
      scheduled_at: "2025-10-18T10:00:00Z",
      status: "scheduled",
      session_type: "Cardio & Core",
      duration_minutes: 45,
      notes: null,
    },
    {
      id: "session3",
      client_id: "client3-uuid", 
      client_name: "Mike Johnson",
      scheduled_at: "2025-10-19T14:00:00Z",
      status: "scheduled",
      session_type: "Weight Loss",
      duration_minutes: 60,
      notes: null,
    },
    {
      id: "session4",
      client_id: "client1-uuid",
      client_name: "John Doe", 
      scheduled_at: "2025-10-16T15:00:00Z",
      status: "completed",
      session_type: "Strength Training",
      duration_minutes: 60,
      notes: "Great progress on deadlifts!",
    },
    {
      id: "session5",
      client_id: "client5-uuid",
      client_name: "Lisa Park",
      scheduled_at: "2025-10-20T11:00:00Z",
      status: "requested", 
      session_type: "Consultation",
      duration_minutes: 30,
      notes: "New client intake",
    },
  ],
  // Trainer availability data (for Schedule tab)
  availability: {
    weekly_schedule: [
      { day: "Monday", start_time: "08:00", end_time: "18:00", available: true },
      { day: "Tuesday", start_time: "08:00", end_time: "18:00", available: true },
      { day: "Wednesday", start_time: "08:00", end_time: "18:00", available: true },
      { day: "Thursday", start_time: "08:00", end_time: "18:00", available: true },
      { day: "Friday", start_time: "08:00", end_time: "16:00", available: true },
      { day: "Saturday", start_time: "09:00", end_time: "14:00", available: true },
      { day: "Sunday", start_time: null, end_time: null, available: false },
    ],
    blocked_dates: ["2025-10-25", "2025-11-15"], // Vacation/unavailable dates
  },
  // Trainer profile/stats data
  stats: {
    total_clients: 24,
    active_clients: 20,
    completed_sessions_this_month: 85,
    total_completed_sessions: 450,
    average_rating: 4.9,
    total_reviews: 47,
    years_experience: 5,
    certifications: ["NASM-CPT", "Nutrition Specialist", "Injury Prevention"],
  },
  todaySessions: [
    {
      id: "1",
      clientName: "Mike Johnson",
      time: "2:00 PM",
      type: "Strength Training",
      status: "completed",
    },
    {
      id: "2",
      clientName: "Emma Wilson",
      time: "4:00 PM",
      type: "Cardio Session",
      status: "upcoming",
    },
  ],
  recentMessages: [
    {
      id: "1",
      clientName: "John Doe",
      message: "Thanks for the great session!",
      time: "2 hours ago",
    },
    {
      id: "2",
      clientName: "Jane Smith",
      message: "Can we reschedule Friday?",
      time: "1 day ago",
    },
  ],
  earnings: {
    thisWeek: 1250,
    thisMonth: 4800,
    totalClients: 24,
  },
};

export const mockOrgData = {
  organization: {
    name: "FitLife Wellness Center",
    logo: "🏋️‍♀️",
    location: "San Francisco, CA",
  },
  trainers: {
    total: 15,
    active: 12,
    newThisMonth: 2,
  },
  clients: {
    total: 240,
    active: 180,
    churnRate: 8.5,
    newThisMonth: 35,
  },
  sessions: {
    today: 45,
    thisWeek: 320,
    completionRate: 94,
  },
  revenue: {
    thisMonth: 85000,
    lastMonth: 78000,
    growth: 9.0,
  },
  topTrainers: [
    {
      id: "1",
      name: "Sarah Mitchell",
      clients: 24,
      rating: 4.9,
      revenue: 4800,
    },
    {
      id: "2",
      name: "David Chen",
      clients: 22,
      rating: 4.8,
      revenue: 4200,
    },
  ],
};

export const mockAdminData = {
  systemOverview: {
    totalOrganizations: 45,
    totalUsers: 12500,
    activeSubscriptions: 42,
    monthlyRevenue: 125000,
  },
  organizations: [
    {
      id: "1",
      name: "FitLife Wellness Center",
      location: "San Francisco, CA",
      trainers: 15,
      clients: 240,
      subscription: "Premium",
      revenue: 85000,
    },
    {
      id: "2",
      name: "PowerGym Studios",
      location: "Los Angeles, CA",
      trainers: 8,
      clients: 120,
      subscription: "Standard",
      revenue: 42000,
    },
    {
      id: "3",
      name: "Elite Fitness Hub",
      location: "New York, NY",
      trainers: 25,
      clients: 450,
      subscription: "Enterprise",
      revenue: 180000,
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "new_org",
      message: "New organization 'Flex Fitness' signed up",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "subscription_upgrade",
      message: "FitLife upgraded to Premium plan",
      time: "1 day ago",
    },
    {
      id: "3",
      type: "payment_received",
      message: "Payment received from PowerGym Studios",
      time: "2 days ago",
    },
  ],
  integrations: [
    {
      name: "Stripe",
      status: "connected",
      description: "Payment processing",
    },
    {
      name: "SendGrid",
      status: "pending",
      description: "Email notifications",
    },
    {
      name: "Analytics",
      status: "not_connected",
      description: "Advanced reporting",
    },
  ],
};