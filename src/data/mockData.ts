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
  clients: [
    {
      id: "1",
      name: "John Doe",
      lastSession: "2 days ago",
      nextSession: "Tomorrow 3:00 PM",
      progress: "On track",
    },
    {
      id: "2",
      name: "Jane Smith",
      lastSession: "1 day ago",
      nextSession: "Friday 10:00 AM",
      progress: "Excellent",
    },
    {
      id: "3",
      name: "Mike Johnson",
      lastSession: "Today",
      nextSession: "Monday 2:00 PM",
      progress: "Needs attention",
    },
  ],
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