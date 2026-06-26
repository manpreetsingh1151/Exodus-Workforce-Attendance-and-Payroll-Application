export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeType: string;
  employer: string;
  gender: string;
  license: string;
  licenseExpiration: string;
  phone: string;
  email: string;
  hourlyRate: number;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  location: string;
  status: "upcoming" | "current" | "past";
  scheduledGuardIds: string[];
}

export interface TimeEntry {
  id: string;
  eventId: string;
  employeeId: string;
  clockIn: string | null;
  clockOut: string | null;
}

export type PayrollRow = {
  entryId: string;
  employeeName: string;
  license: string;
  eventName: string;
  eventDate: string;
  clockIn: string | null;
  clockOut: string | null;
  hours: number;
  rate: number;
  payout: number;
};