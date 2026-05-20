export type UserRole = "super_admin" | "owner" | "employee";
export type PlanCode = "free" | "pro" | "enterprise";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  plan: PlanCode;
  timezone: string;
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
