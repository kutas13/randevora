import type { Appointment, Business, Customer, Employee, Service } from "./types";

export const demoBusiness: Business = {
  id: "biz_1",
  name: "Nova Studio",
  slug: "nova-studio",
  category: "Güzellik ve bakım",
  plan: "pro",
  timezone: "Europe/Istanbul",
};

export const services: Service[] = [
  { id: "srv_1", name: "Saç Kesimi", duration: 45, price: 700, active: true, color: "#0f766e" },
  { id: "srv_2", name: "Sakal Tasarım", duration: 20, price: 300, active: true, color: "#f97316" },
  { id: "srv_3", name: "Nail Art", duration: 75, price: 1200, active: true, color: "#7c3aed" },
  { id: "srv_4", name: "Danışmanlık", duration: 60, price: 1800, active: false, color: "#2563eb" },
];

export const employees: Employee[] = [
  { id: "emp_1", name: "Ece Arslan", role: "Uzman stilist", active: true, appointmentsToday: 7 },
  { id: "emp_2", name: "Mert Kaya", role: "Barber", active: true, appointmentsToday: 5 },
  { id: "emp_3", name: "Duru Sen", role: "Nail artist", active: true, appointmentsToday: 4 },
];

export const customers: Customer[] = [
  { id: "cus_1", name: "Ayşe Demir", phone: "+90 532 111 22 33", appointmentCount: 14, totalSpend: 9800, lastVisit: "Bugün", notes: "Sessiz saat tercih ediyor." },
  { id: "cus_2", name: "Can Yılmaz", phone: "+90 555 222 33 44", appointmentCount: 8, totalSpend: 4300, lastVisit: "Dün" },
  { id: "cus_3", name: "Selin Ak", phone: "+90 542 333 44 55", appointmentCount: 3, totalSpend: 3600, lastVisit: "12 Mayıs" },
];

export const appointments: Appointment[] = [
  {
    id: "apt_1",
    customerName: "Ayşe Demir",
    customerPhone: "+90 532 111 22 33",
    serviceName: "Saç Kesimi",
    employeeName: "Ece Arslan",
    startsAt: "09:30",
    endsAt: "10:15",
    status: "confirmed",
    price: 700,
    color: "#0f766e",
  },
  {
    id: "apt_2",
    customerName: "Can Yılmaz",
    customerPhone: "+90 555 222 33 44",
    serviceName: "Sakal Tasarım",
    employeeName: "Mert Kaya",
    startsAt: "10:30",
    endsAt: "10:50",
    status: "confirmed",
    price: 300,
    color: "#f97316",
  },
  {
    id: "apt_3",
    customerName: "Selin Ak",
    customerPhone: "+90 542 333 44 55",
    serviceName: "Nail Art",
    employeeName: "Duru Sen",
    startsAt: "13:00",
    endsAt: "14:15",
    status: "pending",
    price: 1200,
    color: "#7c3aed",
  },
];

export const weeklyRevenue = [
  { day: "Pzt", appointments: 18, revenue: 14200 },
  { day: "Sal", appointments: 21, revenue: 18100 },
  { day: "Çar", appointments: 16, revenue: 12800 },
  { day: "Per", appointments: 25, revenue: 23200 },
  { day: "Cum", appointments: 29, revenue: 27600 },
  { day: "Cmt", appointments: 34, revenue: 31900 },
  { day: "Paz", appointments: 11, revenue: 8900 },
];
