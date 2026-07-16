import { USER_ROLES } from "../config/navigation";

export const currentUser = {
  id: "USR-1001",
  name: "Mayowa Oyeniran",
  email: "mayowa.oyeniran@novabank.ng",
  role: USER_ROLES.SUPER_ADMIN,
  branch: "Head Office",
};

export const kpis = [
  { label: "Visitors Today", value: "184", delta: "+12.8%", tone: "positive" },
  { label: "Currently Onsite", value: "37", delta: "-4.2%", tone: "neutral" },
  { label: "Appointments", value: "92", delta: "+8.1%", tone: "positive" },
  { label: "Overdue Check-Outs", value: "6", delta: "+2", tone: "warning" },
];

export const visitorTrend = [
  { day: "Mon", visitors: 142, appointments: 84 },
  { day: "Tue", visitors: 156, appointments: 91 },
  { day: "Wed", visitors: 184, appointments: 92 },
  { day: "Thu", visitors: 168, appointments: 87 },
  { day: "Fri", visitors: 211, appointments: 106 },
  { day: "Sat", visitors: 68, appointments: 24 },
  { day: "Sun", visitors: 33, appointments: 11 },
];

export const branchStats = [
  { branch: "Head Office", visitors: 54, active: 11 },
  { branch: "Victoria Island", visitors: 38, active: 8 },
  { branch: "Ikeja", visitors: 31, active: 6 },
  { branch: "Abuja Central", visitors: 29, active: 5 },
  { branch: "Port Harcourt", visitors: 21, active: 4 },
];

export const activeVisitors = [
  { id: "VIS-24071", name: "Chidinma Okafor", company: "BlueWave Consulting", host: "Retail Banking", branch: "Head Office", checkIn: "09:18", status: "Onsite" },
  { id: "VIS-24072", name: "Ibrahim Musa", company: "SecureTech Ltd", host: "IT Security", branch: "Victoria Island", checkIn: "09:44", status: "Onsite" },
  { id: "VIS-24073", name: "Tara Williams", company: "RegCom Advisory", host: "Compliance", branch: "Ikeja", checkIn: "10:02", status: "Escorted" },
  { id: "VIS-24074", name: "Daniel Eze", company: "Courier Partner", host: "Operations", branch: "Abuja Central", checkIn: "10:15", status: "Pending Host" },
  { id: "VIS-24075", name: "Amina Bello", company: "NIBSS", host: "Digital Channels", branch: "Head Office", checkIn: "10:28", status: "Onsite" },
  { id: "VIS-24076", name: "Kelechi Nwosu", company: "FinEdge", host: "Treasury", branch: "Port Harcourt", checkIn: "11:05", status: "Onsite" },
];

export const recentActivities = [
  { id: 1, actor: "Front Desk", action: "checked in Chidinma Okafor", time: "4 min ago" },
  { id: 2, actor: "Security Desk", action: "flagged overdue badge VIS-24065", time: "12 min ago" },
  { id: 3, actor: "Branch Manager", action: "approved 8 appointments for tomorrow", time: "25 min ago" },
  { id: 4, actor: "System", action: "sent host arrival notifications", time: "31 min ago" },
];

export const moduleRows = [
  { id: "APT-4201", visitor: "Aisha Lawal", branch: "Head Office", department: "Corporate Banking", host: "Tunde Adeyemi", status: "Approved", date: "2026-07-01" },
  { id: "APT-4202", visitor: "Emeka Obi", branch: "Ikeja", department: "Legal", host: "Nkechi Eze", status: "Pending", date: "2026-07-01" },
  { id: "APT-4203", visitor: "Fatima Umar", branch: "Abuja Central", department: "Risk", host: "Hassan Aliyu", status: "Checked In", date: "2026-07-01" },
  { id: "APT-4204", visitor: "Samuel Peters", branch: "Victoria Island", department: "Treasury", host: "Sade Cole", status: "Checked Out", date: "2026-06-30" },
  { id: "APT-4205", visitor: "Grace Johnson", branch: "Port Harcourt", department: "Operations", host: "Boma Green", status: "Blacklisted", date: "2026-06-29" },
  { id: "APT-4206", visitor: "Yusuf Garba", branch: "Head Office", department: "Digital Channels", host: "Ada Nwankwo", status: "Approved", date: "2026-07-02" },
  { id: "APT-4207", visitor: "Maryam Sani", branch: "Kano", department: "Retail Banking", host: "Ife Ajayi", status: "Pending", date: "2026-07-03" },
  { id: "APT-4208", visitor: "Victor James", branch: "Lekki", department: "Internal Control", host: "Bisi Martins", status: "Escalated", date: "2026-07-01" },
];

export const quickActions = [
  "Register Visitor",
  "Check In",
  "Check Out",
  "Create Appointment",
  "Print Badge",
  "View Reports",
];

export const systemUsers = [
  { id: "USR-1001", name: "Mayowa Oyeniran", email: "mayowa.oyeniran@novabank.ng", role: "Super Administrator", branch: "Head Office", status: "Active" },
  { id: "USR-1002", name: "Ada Nwankwo", email: "ada.nwankwo@novabank.ng", role: "Branch Administrator", branch: "Victoria Island", status: "Active" },
  { id: "USR-1003", name: "Ife Ajayi", email: "ife.ajayi@novabank.ng", role: "Frontdesk", branch: "Ikeja", status: "Active" },
  { id: "USR-1004", name: "Bisi Martins", email: "bisi.martins@novabank.ng", role: "Security Officer", branch: "Head Office", status: "Inactive" },
];

export const systemBranches = [
  { id: "BR-001", name: "Head Office", city: "Lagos", administrator: "Mayowa Oyeniran", Frontdesks: 6, status: "Active" },
  { id: "BR-002", name: "Victoria Island", city: "Lagos", administrator: "Ada Nwankwo", Frontdesks: 4, status: "Active" },
  { id: "BR-003", name: "Ikeja", city: "Lagos", administrator: "Ife Ajayi", Frontdesks: 3, status: "Active" },
  { id: "BR-004", name: "Abuja Central", city: "Abuja", administrator: "Hassan Aliyu", Frontdesks: 4, status: "Active" },
];

export const reportSummaries = [
  { title: "Application Users", value: "128", detail: "22 admins, 61 hosts, 31 Frontdesks, 14 security officers" },
  { title: "Active Users", value: "113", detail: "Users with successful login in the last 30 days" },
  { title: "Branch Coverage", value: "27", detail: "Branches with assigned reception and security desks" },
  { title: "Audit Events", value: "8,492", detail: "User, visitor, report, and configuration actions captured" },
];

export const configurationItems = [
  { key: "Visitor pass validity", value: "8 hours", owner: "Security Operations" },
  { key: "Host approval SLA", value: "30 minutes", owner: "Branch Operations" },
  { key: "Photo capture required", value: "Enabled", owner: "Compliance" },
  { key: "Audit log retention", value: "7 years", owner: "Internal Audit" },
];
