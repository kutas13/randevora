export type UserRole = "super_admin" | "owner" | "admin" | "employee";
export type PlanCode = "free" | "pro" | "enterprise";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";

export type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  plan: PlanCode;
  timezone: string;
  status: BusinessStatus;
  owner_id: string;
  approved_at?: string;
  created_at: string;
};

export type AppUser = {
  id: string;
  business_id?: string;
  role: UserRole;
  full_name: string;
  email?: string;
};

export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  color: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  active: boolean;
  appointmentsToday: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  appointmentCount: number;
  totalSpend: number;
  lastVisit: string;
  notes?: string;
};

export type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  price: number;
  color: string;
  notes?: string;
};
