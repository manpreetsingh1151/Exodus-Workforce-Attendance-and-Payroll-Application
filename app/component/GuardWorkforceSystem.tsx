"use client";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
// import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

function getFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

import {
  CalendarDays,
  Clock,
  DollarSign,
  Download,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateHours(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return 0;
  return Number((diffMs / 1000 / 60 / 60).toFixed(2));
}

function money(value?: number | string | null): string {
  return `$${Number(value || 0).toString() ? Number(value || 0).toFixed(2) : "0.00"}`;
}

function downloadCSV(
  filename: string,
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const csv = rows
    .map((row) =>
      row
        .map(
          (cell: string | number | null | undefined) =>
            `"${String(cell ?? "").replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface Employee {
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

interface EventItem {
  id: number;
  name: string;
  date: string;
  location: string;
  status: "upcoming" | "current" | "past";
  scheduledGuardIds: string[];
}

interface TimeEntry {
  id: number;
  eventId: number;
  employeeId: string;
  clockIn: string | null;
  clockOut: string | null;
}

type PayrollRow = {
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

// const initialEmployees: Employee[] = [
//   {
//     id: 1,
//     name: "Varun Bhanot",
//     license: "11151199",
//     phone: "416-555-0101",
//     email: "varun@example.com",
//     hourlyRate: 25,
//   },
//   {
//     id: 2,
//     name: "Kyle Johnson",
//     license: "11153510",
//     phone: "647-555-0155",
//     email: "kyle@example.com",
//     hourlyRate: 27,
//   },
//   {
//     id: 3,
//     name: "Saurav Whalla",
//     license: "11468460",
//     phone: "905-555-0198",
//     email: "saurav@example.com",
//     hourlyRate: 25,
//   },
// ];

const initialEvents: EventItem[] = [
  {
    id: 101,
    name: "Rogers Stadium Event",
    date: "2026-06-28",
    location: "105 Carl Hall Rd, North York",
    status: "upcoming",
    scheduledGuardIds: ["1", "2", "3"],
  },
  {
    id: 102,
    name: "FIFA Fan Fest",
    date: "2026-06-24",
    location: "660 Fleet Street, Toronto",
    status: "current",
    scheduledGuardIds: ["1", "3"],
  },
  {
    id: 103,
    name: "Electric Island",
    date: "2026-06-21",
    location: "Toronto, ON",
    status: "past",
    scheduledGuardIds: ["2"],
  },
];

// sample initial time entries removed (not used)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-slate-950 text-white hover:bg-slate-800";
  return (
    <button {...rest} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
    />
  );
}

export default function GuardWorkforceSystem(): React.ReactElement {
  const [page, setPage] = useState<string>("events");

  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  //   <Button variant="outline" onClick={logout}>
  //     Logout
  //   </Button>;

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("first_name");

    if (error) {
      console.error(error);
      return;
    }

    setEmployees(
      (data || []).map((e: Record<string, unknown>) => ({
        id: String(e["id"] ?? ""),
        firstName: String(e["first_name"] ?? ""),
        lastName: String(e["last_name"] ?? ""),
        employeeType: String(e["employee_type"] ?? ""),
        employer: String(e["employer"] ?? ""),
        gender: String(e["gender"] ?? ""),
        license: String(e["license"] ?? ""),
        licenseExpiration: String(e["license_expiration"] ?? ""),
        phone: String(e["phone"] ?? ""),
        email: String(e["email"] ?? ""),
        hourlyRate: Number(e["hourly_rate"] ?? 0),
      })),
    );
  }

  const [selectedEventId, setSelectedEventId] = useState<number>(
    initialEvents[0].id,
  );
  const [search, setSearch] = useState<string>("");

  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    license: "",
    phone: "",
    email: "",
    hourlyRate: "",
  });

  const [newEvent, setNewEvent] = useState<{
    name: string;
    date: string;
    location: string;
    status: "upcoming" | "current" | "past";
  }>({
    name: "",
    date: "",
    location: "",
    status: "upcoming",
  });

  const [payWindow, setPayWindow] = useState<{ start: string; end: string }>({
    start: "2026-06-01",
    end: "2026-06-30",
  });

  const selectedEvent = events.find(
    (event) => event.id === Number(selectedEventId),
  );

  function getEmployee(id: number | string): Employee | undefined {
    return employees.find((employee) => employee.id === String(id));
  }

  // getEvent removed; use events array directly where needed

  // removed unused helper: eventEntries

  function getEntry(
    eventId: number | string,
    employeeId: number | string,
  ): TimeEntry | undefined {
    return timeEntries.find(
      (entry) =>
        entry.eventId === Number(eventId) &&
        entry.employeeId === String(employeeId),
    );
  }

  async function importEmployeesFromFile(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    const rows: Record<string, unknown>[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      if (sheetName.toUpperCase() === "INACTIVE") return;

      const sheet = workbook.Sheets[sheetName];
      const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        sheet,
        {
          defval: "",
        },
      );

      rows.push(...sheetRows);
    });

    const employeesToInsert = rows
      .map((row) => ({
        employee_type: String(row["EMPLOYEE TYPE"] || "").trim(),
        employer: String(row["EMPLOYER"] || "").trim(),
        gender: String(row["GENDER"] || "").trim(),
        first_name: String(row["FIRST NAME"] || "").trim(),
        last_name: String(row["LAST NAME"] || "").trim(),
        email: String(row["EMAIL ADDRESS"] || "").trim(),
        phone: String(row["PHONE NUMBER"] || "").trim(),
        license: String(row["LICENSE #"] || "").trim(),
        license_expiration: String(row["LICENSE EXPIRATION"] || "").trim(),
        hourly_rate: Number(row["PAYRATE"] || 0),
      }))
      .filter((employee) => employee.first_name || employee.last_name);

    const { error } = await supabase
      .from("employees")
      .insert(employeesToInsert);

    if (error) {
      console.error(error);
      alert("Import failed.");
      return;
    }

    await loadEmployees();
    alert(`${employeesToInsert.length} employees imported successfully.`);
  }

  async function addEmployee() {
    const { error } = await supabase.from("employees").insert({
      first_name: newEmployee.firstName,
      last_name: newEmployee.lastName,
      license: newEmployee.license,
      phone: newEmployee.phone,
      email: newEmployee.email,
      hourly_rate: Number(newEmployee.hourlyRate),
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadEmployees();

    setNewEmployee({
      firstName: "",
      lastName: "",
      license: "",
      phone: "",
      email: "",
      hourlyRate: "",
    });
  }

  function updateEmployee(
    id: string,
    field: keyof Employee | "hourlyRate",
    value: string | number,
  ): void {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              [field]: field === "hourlyRate" ? Number(value || 0) : value,
            }
          : employee,
      ),
    );
  }

  function addEvent(): void {
    if (!newEvent.name.trim() || !newEvent.date) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newEvent,
        scheduledGuardIds: [],
      },
    ]);
    setNewEvent({ name: "", date: "", location: "", status: "upcoming" });
  }

  function assignGuard(
    eventId: number | string,
    employeeId: number | string | undefined,
  ): void {
    if (!employeeId) return;
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== Number(eventId)) return event;
        if (event.scheduledGuardIds.includes(String(employeeId))) return event;
        return {
          ...event,
          scheduledGuardIds: [...event.scheduledGuardIds, String(employeeId)],
        };
      }),
    );
  }

  function removeGuardFromEvent(
    eventId: number | string,
    employeeId: number | string,
  ): void {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === Number(eventId)
          ? {
              ...event,
              scheduledGuardIds: event.scheduledGuardIds.filter(
                (id) => id !== String(employeeId),
              ),
            }
          : event,
      ),
    );
  }

  function clockIn(
    eventId: number | string,
    employeeId: number | string,
  ): void {
    const existing = getEntry(eventId, employeeId);
    if (existing?.clockIn) return;

    setTimeEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        eventId: Number(eventId),
        employeeId: String(employeeId),
        clockIn: new Date().toISOString(),
        clockOut: null,
      },
    ]);
  }

  function clockOut(
    eventId: number | string,
    employeeId: number | string,
  ): void {
    setTimeEntries((prev) =>
      prev.map((entry) =>
        entry.eventId === Number(eventId) &&
        entry.employeeId === String(employeeId) &&
        entry.clockIn &&
        !entry.clockOut
          ? { ...entry, clockOut: new Date().toISOString() }
          : entry,
      ),
    );
  }

  const payrollRows = useMemo<PayrollRow[]>(() => {
    const start = new Date(payWindow.start + "T00:00:00");
    const end = new Date(payWindow.end + "T23:59:59");

    return timeEntries
      .filter((entry) => {
        const evt = events.find((e) => e.id === entry.eventId);
        if (!evt) return false;
        const eventDate = new Date(evt.date + "T12:00:00");
        return eventDate >= start && eventDate <= end;
      })
      .map((entry) => {
        const employee = employees.find((e) => e.id === entry.employeeId);
        const evt = events.find((e) => e.id === entry.eventId);
        const hours = calculateHours(entry.clockIn, entry.clockOut);
        const rate = employee?.hourlyRate || 0;
        return {
          employeeName: employee
            ? `${employee.firstName} ${employee.lastName}`.trim()
            : "Unknown",
          license: employee?.license || "",
          eventName: evt?.name || "Unknown Event",
          eventDate: evt?.date || "",
          clockIn: entry.clockIn,
          clockOut: entry.clockOut,
          hours,
          rate,
          payout: hours * rate,
        };
      });
  }, [timeEntries, payWindow, employees, events]);

  const payrollTotalsByGuard = useMemo<
    {
      employeeName: string;
      license: string;
      totalHours: number;
      totalPayout: number;
    }[]
  >(() => {
    type TotalsMap = Record<
      string,
      {
        employeeName: string;
        license: string;
        totalHours: number;
        totalPayout: number;
      }
    >;
    const map: TotalsMap = {};
    payrollRows.forEach((row) => {
      if (!map[row.employeeName]) {
        map[row.employeeName] = {
          employeeName: row.employeeName,
          license: row.license,
          totalHours: 0,
          totalPayout: 0,
        };
      }
      map[row.employeeName].totalHours += row.hours;
      map[row.employeeName].totalPayout += row.payout;
    });
    return Object.values(map);
  }, [payrollRows]);

  function exportPayroll() {
    downloadCSV("event-payroll-report.csv", [
      [
        "Guard",
        "License",
        "Event",
        "Event Date",
        "Clock In",
        "Clock Out",
        "Hours",
        "Hourly Rate",
        "Payout",
      ],
      ...payrollRows.map((row) => [
        row.employeeName,
        row.license,
        row.eventName,
        formatDate(row.eventDate),
        formatDateTime(row.clockIn),
        formatDateTime(row.clockOut),
        row.hours,
        money(row.rate),
        money(row.payout),
      ]),
    ]);
  }

  const activeEntries = timeEntries.filter(
    (entry) => entry.clockIn && !entry.clockOut,
  );
  const completedEntries = timeEntries.filter(
    (entry) => entry.clockIn && entry.clockOut,
  );
  const totalCompletedHours = completedEntries.reduce(
    (sum, entry) => sum + calculateHours(entry.clockIn, entry.clockOut),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Exodus Event Workforce System
            </h1>
            <p className="text-slate-600">
              Events, employee rates, guard clock-in/out, and automatic payout
              reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["events", "Events"],
            ["employees", "Employee Information"],
            ["clock", "Clock-In"],
            ["payouts", "Payouts"],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={page === key ? "primary" : "outline"}
              onClick={() => setPage(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <CalendarDays />
              <div>
                <p className="text-sm text-slate-500">Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Users />
              <div>
                <p className="text-sm text-slate-500">Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Clock />
              <div>
                <p className="text-sm text-slate-500">Clocked In Now</p>
                <p className="text-2xl font-bold">{activeEntries.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <DollarSign />
              <div>
                <p className="text-sm text-slate-500">Completed Hours</p>
                <p className="text-2xl font-bold">
                  {totalCompletedHours.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {page === "events" && (
          <div className="space-y-5">
            <Card>
              <h2 className="mb-4 text-xl font-semibold">Add Event</h2>
              <div className="grid gap-3 md:grid-cols-5">
                <TextInput
                  placeholder="Event name"
                  value={newEvent.name}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, name: e.target.value })
                  }
                />
                <TextInput
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
                <TextInput
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
                <SelectInput
                  value={newEvent.status}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      status: e.target.value as EventItem["status"],
                    })
                  }
                >
                  <option value="past">Past</option>
                  <option value="current">Current</option>
                  <option value="upcoming">Upcoming</option>
                </SelectInput>
                <Button onClick={addEvent}>Add Event</Button>
              </div>
            </Card>

            {["current", "upcoming", "past"].map((status) => (
              <Card key={status}>
                <h2 className="mb-4 text-xl font-semibold capitalize">
                  {status} Events
                </h2>
                <div className="space-y-4">
                  {events
                    .filter((event) => event.status === status)
                    .map((event) => (
                      <div key={event.id} className="rounded-xl border p-4">
                        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-bold">{event.name}</h3>
                            <p className="text-sm text-slate-500">
                              {formatDate(event.date)} • {event.location}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <SelectInput
                              onChange={(e) =>
                                assignGuard(event.id, e.target.value)
                              }
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Add scheduled guard
                              </option>
                              {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {getFullName(employee)}
                                </option>
                              ))}
                            </SelectInput>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border">
                          <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                <th className="p-3">Scheduled Guard</th>
                                <th className="p-3">License</th>
                                <th className="p-3">Rate</th>
                                <th className="p-3">Clock In</th>
                                <th className="p-3">Clock Out</th>
                                <th className="p-3">Hours</th>
                                <th className="p-3">Remove</th>
                              </tr>
                            </thead>
                            <tbody>
                              {event.scheduledGuardIds.map((guardId) => {
                                const employee = getEmployee(guardId);
                                const entry = getEntry(event.id, guardId);
                                return (
                                  <tr key={guardId} className="border-t">
                                    <td className="p-3 font-medium">
                                      {employee
                                        ? `${employee.firstName} ${employee.lastName}`.trim()
                                        : ""}
                                    </td>
                                    <td className="p-3">{employee?.license}</td>
                                    <td className="p-3">
                                      {money(employee?.hourlyRate)}
                                    </td>
                                    <td className="p-3">
                                      {formatTime(entry?.clockIn)}
                                    </td>
                                    <td className="p-3">
                                      {formatTime(entry?.clockOut)}
                                    </td>
                                    <td className="p-3">
                                      {calculateHours(
                                        entry?.clockIn,
                                        entry?.clockOut,
                                      ).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          removeGuardFromEvent(
                                            event.id,
                                            guardId,
                                          )
                                        }
                                      >
                                        Remove
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {page === "employees" && (
          <div className="space-y-5">
            <Card>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Import Employee CSV / Excel File
                </label>

                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importEmployeesFromFile(file);
                  }}
                  className="rounded-xl border border-slate-300 bg-white p-2 text-sm"
                />
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <UserPlus size={20} /> Add Employee / Guard Information
              </h2>
              <div className="grid gap-3 md:grid-cols-6">
                <TextInput
                  placeholder="First Name"
                  value={newEmployee.firstName}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      firstName: e.target.value,
                    })
                  }
                />

                <TextInput
                  placeholder="Last Name"
                  value={newEmployee.lastName}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      lastName: e.target.value,
                    })
                  }
                />

                <TextInput
                  placeholder="License #"
                  value={newEmployee.license}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, license: e.target.value })
                  }
                />
                <TextInput
                  placeholder="Phone"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                />
                <TextInput
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                />
                <TextInput
                  type="number"
                  placeholder="Hourly rate"
                  value={newEmployee.hourlyRate}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      hourlyRate: e.target.value,
                    })
                  }
                />
                <Button onClick={addEmployee}>Add Guard</Button>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Search size={18} />
                <TextInput
                  placeholder="Search employees"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">License</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Hourly Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees
                      .filter((employee) =>
                        `${getFullName(employee)} ${employee.license} ${employee.email}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((employee) => (
                        <tr key={employee.id} className="border-t">
                          <td className="p-3">
                            <TextInput
                              value={employee.firstName}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "firstName",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="p-3">
                            <TextInput
                              value={employee.lastName}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "lastName",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <TextInput
                              value={employee.license}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "license",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <TextInput
                              value={employee.phone}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "phone",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <TextInput
                              value={employee.email}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "email",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <TextInput
                              type="number"
                              value={employee.hourlyRate}
                              onChange={(e) =>
                                updateEmployee(
                                  employee.id,
                                  "hourlyRate",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {page === "clock" && (
          <Card>
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold">Clock-In / Clock-Out</h2>
                <p className="text-sm text-slate-500">
                  Select an event and clock guards in or out.
                </p>
              </div>
              <SelectInput
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} — {formatDate(event.date)}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Guard</th>
                    <th className="p-3">License</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Hours</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedEvent?.scheduledGuardIds || []).map((guardId) => {
                    const employee = getEmployee(guardId);
                    const entry = getEntry(selectedEventId, guardId);
                    const hours = calculateHours(
                      entry?.clockIn,
                      entry?.clockOut,
                    );
                    return (
                      <tr key={guardId} className="border-t">
                        <td className="p-3 font-medium">
                          {employee
                            ? `${employee.firstName} ${employee.lastName}`
                            : ""}
                        </td>
                        <td className="p-3">{employee?.license}</td>
                        <td className="p-3">{money(employee?.hourlyRate)}</td>
                        <td className="p-3">
                          {formatDateTime(entry?.clockIn)}
                        </td>
                        <td className="p-3">
                          {formatDateTime(entry?.clockOut)}
                        </td>
                        <td className="p-3 font-semibold">
                          {hours.toFixed(2)}
                        </td>
                        <td className="p-3">
                          {!entry?.clockIn && (
                            <Button
                              onClick={() => clockIn(selectedEventId, guardId)}
                            >
                              Clock In
                            </Button>
                          )}
                          {entry?.clockIn && !entry?.clockOut && (
                            <Button
                              variant="outline"
                              onClick={() => clockOut(selectedEventId, guardId)}
                            >
                              Clock Out
                            </Button>
                          )}
                          {entry?.clockOut && (
                            <span className="text-slate-500">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {page === "payouts" && (
          <div className="space-y-5">
            <Card>
              <div className="grid gap-3 md:grid-cols-4 md:items-end">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start Date
                  </label>
                  <TextInput
                    type="date"
                    value={payWindow.start}
                    onChange={(e) =>
                      setPayWindow({ ...payWindow, start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    End Date
                  </label>
                  <TextInput
                    type="date"
                    value={payWindow.end}
                    onChange={(e) =>
                      setPayWindow({ ...payWindow, end: e.target.value })
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payroll Total</p>
                  <p className="text-2xl font-bold">
                    {money(
                      payrollRows.reduce((sum, row) => sum + row.payout, 0),
                    )}
                  </p>
                </div>
                <Button onClick={exportPayroll}>
                  <span className="inline-flex items-center gap-2">
                    <Download size={18} /> Export Payroll
                  </span>
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold">
                Payroll Summary by Guard
              </h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Guard</th>
                      <th className="p-3">License</th>
                      <th className="p-3">Total Hours</th>
                      <th className="p-3">Total Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollTotalsByGuard.map((row) => (
                      <tr key={row.employeeName} className="border-t">
                        <td className="p-3 font-medium">{row.employeeName}</td>
                        <td className="p-3">{row.license}</td>
                        <td className="p-3">{row.totalHours.toFixed(2)}</td>
                        <td className="p-3 font-semibold">
                          {money(row.totalPayout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold">Payroll Detail</h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Guard</th>
                      <th className="p-3">Event</th>
                      <th className="p-3">Event Date</th>
                      <th className="p-3">Clock In</th>
                      <th className="p-3">Clock Out</th>
                      <th className="p-3">Hours</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRows.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 font-medium">{row.employeeName}</td>
                        <td className="p-3">{row.eventName}</td>
                        <td className="p-3">{formatDate(row.eventDate)}</td>
                        <td className="p-3">{formatDateTime(row.clockIn)}</td>
                        <td className="p-3">{formatDateTime(row.clockOut)}</td>
                        <td className="p-3">{row.hours.toFixed(2)}</td>
                        <td className="p-3">{money(row.rate)}</td>
                        <td className="p-3 font-semibold">
                          {money(row.payout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
