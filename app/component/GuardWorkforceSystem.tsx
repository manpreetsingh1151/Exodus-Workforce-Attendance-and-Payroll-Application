
"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import EventsPage from "./components/EventsPage";
import EmployeesPage from "./components/EmployeesPage";
import ClockPage from "./components/ClockPage";
import PayoutsPage from "./components/PayoutsPage";
import { Button } from "./components/ui";
import { useEmployees } from "./hooks/useEmployees";
import { useEvents } from "./hooks/useEvents";
import { useTimeEntries } from "./hooks/useTimeEntries";
import type { EventItem } from "./types";

type Page = "events" | "employees" | "clock" | "payouts";

export default function GuardWorkforceSystem() {
  const [page, setPage] = useState<Page>("events");
  const [search, setSearch] = useState("");

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
    status: EventItem["status"];
  }>({
    name: "",
    date: "",
    location: "",
    status: "upcoming",
  });

  const [payWindow, setPayWindow] = useState({
    start: "2026-06-01",
    end: "2026-06-30",
  });

  const {
    employees,
    loadEmployees,
    addEmployee,
    updateEmployee,
    importEmployeesFromFile,
  } = useEmployees();

  const {
    events,
    selectedEventId,
    setSelectedEventId,
    loadEvents,
    addEvent,
    assignGuard,
    removeGuardFromEvent,
  } = useEvents();

  const {
    timeEntries,
    loadTimeEntries,
    clockIn,
    clockOut,
  } = useTimeEntries();

  useEffect(() => {
    async function init() {
      await loadEmployees();
      await loadEvents();
      await loadTimeEntries();
    }

    init();
  }, []);

  const tabs: { key: Page; label: string }[] = [
    { key: "events", label: "Events" },
    { key: "employees", label: "Employee Information" },
    { key: "clock", label: "Clock-In" },
    { key: "payouts", label: "Payouts" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header />

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={page === tab.key ? "primary" : "outline"}
              onClick={() => setPage(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <StatsCards
          events={events}
          employees={employees}
          timeEntries={timeEntries}
        />

        {page === "events" && (
          <EventsPage
            events={events}
            employees={employees}
            timeEntries={timeEntries}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            addEvent={() => addEvent(newEvent)}
            assignGuard={assignGuard}
            removeGuardFromEvent={removeGuardFromEvent}
          />
        )}

        {page === "employees" && (
          <EmployeesPage
            employees={employees}
            search={search}
            setSearch={setSearch}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            addEmployee={addEmployee}
            updateEmployee={updateEmployee}
            importEmployeesFromFile={importEmployeesFromFile}
          />
        )}

        {page === "clock" && (
          <ClockPage
            events={events}
            employees={employees}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            timeEntries={timeEntries}
            clockIn={clockIn}
            clockOut={clockOut}
          />
        )}

        {page === "payouts" && (
          <PayoutsPage
            employees={employees}
            events={events}
            timeEntries={timeEntries}
            payWindow={payWindow}
            setPayWindow={setPayWindow}
          />
        )}
      </div>
    </div>
  );
}



// "use client";
// import React, { useEffect, useMemo, useState } from "react";
// import { supabase } from "@/lib/supabase/client";
// // import * as XLSX from "xlsx";
// import { useRouter } from "next/navigation";
// import {
//   CalendarDays,
//   Clock,
//   DollarSign,
//   Download,
//   Search,
//   UserPlus,
//   Users,
// } from "lucide-react";

// import { Employee, EventItem, TimeEntry, PayrollRow } from "./types";
// import { getFullName, formatDate, calculateHours, money, formatDateTime, formatTime } from "./utils/format";
// import {Button, Card, TextInput, SelectInput } from "./components/ui";
// import { downloadCSV } from "./utils/csv"; 
// import {importEmployeesFromFile} from "./hooks/useEmployees"


// export default function GuardWorkforceSystem(): React.ReactElement {
//   const [page, setPage] = useState<string>("events");

//   const router = useRouter();

//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [events, setEvents] = useState<EventItem[]>([]);
//   const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

//   async function logout() {
//     await supabase.auth.signOut();
//     router.push("/login");
//   }

//   async function loadEmployees() {
//     const { data, error } = await supabase
//       .from("employees")
//       .select("*")
//       .order("first_name");

//     if (error) {
//       console.error(error);
//       return;
//     }

//     setEmployees(
//       (data || []).map((e: Record<string, unknown>) => ({
//         id: String(e["id"] ?? ""),
//         firstName: String(e["first_name"] ?? ""),
//         lastName: String(e["last_name"] ?? ""),
//         employeeType: String(e["employee_type"] ?? ""),
//         employer: String(e["employer"] ?? ""),
//         gender: String(e["gender"] ?? ""),
//         license: String(e["license"] ?? ""),
//         licenseExpiration: String(e["license_expiration"] ?? ""),
//         phone: String(e["phone"] ?? ""),
//         email: String(e["email"] ?? ""),
//         hourlyRate: Number(e["hourly_rate"] ?? 0),
//       })),
//     );
//   }

//   const [selectedEventId, setSelectedEventId] = useState<string>("");
//   const [search, setSearch] = useState<string>("");

//   const [newEmployee, setNewEmployee] = useState({
//     firstName: "",
//     lastName: "",
//     license: "",
//     phone: "",
//     email: "",
//     hourlyRate: "",
//   });

//   const [newEvent, setNewEvent] = useState<{
//     name: string;
//     date: string;
//     location: string;
//     status: "upcoming" | "current" | "past";
//   }>({
//     name: "",
//     date: "",
//     location: "",
//     status: "upcoming",
//   });

//   const [payWindow, setPayWindow] = useState<{ start: string; end: string }>({
//     start: "2026-06-01",
//     end: "2026-06-30",
//   });

//   const selectedEvent = events.find((event) => event.id === selectedEventId);

//   useEffect(() => {
//     async function init() {
//       await loadEmployees();
//       await loadEvents();
//       await loadTimeEntries();
//     }

//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   function getEmployee(id: number | string): Employee | undefined {
//     return employees.find((employee) => employee.id === String(id));
//   }

//   // getEvent removed; use events array directly where needed

//   // removed unused helper: eventEntries

//   function getEntry(
//     eventId: number | string,
//     employeeId: number | string,
//   ): TimeEntry | undefined {
//     return timeEntries.find(
//       (entry) =>
//         entry.eventId === String(eventId) &&
//         entry.employeeId === String(employeeId),
//     );
//   }

//   // async function importEmployeesFromFile(file: File) {
//   //   const buffer = await file.arrayBuffer();
//   //   const workbook = XLSX.read(buffer);

//   //   const rows: Record<string, unknown>[] = [];

//   //   workbook.SheetNames.forEach((sheetName) => {
//   //     if (sheetName.toUpperCase() === "INACTIVE") return;

//   //     const sheet = workbook.Sheets[sheetName];
//   //     const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
//   //       sheet,
//   //       {
//   //         defval: "",
//   //       },
//   //     );

//   //     rows.push(...sheetRows);
//   //   });

//   //   const employeesToInsert = rows
//   //     .map((row) => ({
//   //       employee_type: String(row["EMPLOYEE TYPE"] || "").trim(),
//   //       employer: String(row["EMPLOYER"] || "").trim(),
//   //       gender: String(row["GENDER"] || "").trim(),
//   //       first_name: String(row["FIRST NAME"] || "").trim(),
//   //       last_name: String(row["LAST NAME"] || "").trim(),
//   //       email: String(row["EMAIL ADDRESS"] || "").trim(),
//   //       phone: String(row["PHONE NUMBER"] || "").trim(),
//   //       license: String(row["LICENSE #"] || "").trim(),
//   //       license_expiration: String(row["LICENSE EXPIRATION"] || "").trim(),
//   //       hourly_rate: Number(row["PAYRATE"] || 0),
//   //     }))
//   //     .filter((employee) => employee.first_name || employee.last_name);

//   //   const { error } = await supabase
//   //     .from("employees")
//   //     .insert(employeesToInsert);

//   //   if (error) {
//   //     console.error(error);
//   //     alert("Import failed.");
//   //     return;
//   //   }

//   //   await loadEmployees();
//   //   alert(`${employeesToInsert.length} employees imported successfully.`);
//   // }

//   async function addEmployee() {
//     const { error } = await supabase.from("employees").insert({
//       first_name: newEmployee.firstName,
//       last_name: newEmployee.lastName,
//       license: newEmployee.license,
//       phone: newEmployee.phone,
//       email: newEmployee.email,
//       hourly_rate: Number(newEmployee.hourlyRate),
//     });

//     if (error) {
//       console.error(error);
//       return;
//     }

//     await loadEmployees();

//     setNewEmployee({
//       firstName: "",
//       lastName: "",
//       license: "",
//       phone: "",
//       email: "",
//       hourlyRate: "",
//     });
//   }

//   async function updateEmployee(
//     id: string,
//     field: keyof Employee,
//     value: string | number,
//   ) {
//     const dbField: Record<string, string> = {
//       firstName: "first_name",
//       lastName: "last_name",
//       employeeType: "employee_type",
//       employer: "employer",
//       gender: "gender",
//       license: "license",
//       licenseExpiration: "license_expiration",
//       phone: "phone",
//       email: "email",
//       hourlyRate: "hourly_rate",
//     };

//     await supabase
//       .from("employees")
//       .update({
//         [dbField[field]]: field === "hourlyRate" ? Number(value) : value,
//       })
//       .eq("id", id);

//     await loadEmployees();
//   }

//   // function addEvent(): void {
//   //   if (!newEvent.name.trim() || !newEvent.date) return;
//   //   setEvents((prev) => [
//   //     ...prev,
//   //     {
//   //       id: Date.now(),
//   //       ...newEvent,
//   //       scheduledGuardIds: [],
//   //     },
//   //   ]);
//   //   setNewEvent({ name: "", date: "", location: "", status: "upcoming" });
//   // }

//   async function loadEvents() {
//     const { data, error } = await supabase
//       .from("events")
//       .select(
//         `
//       *,
//       event_guards (
//         employee_id
//       )
//     `,
//       )
//       .order("event_date", { ascending: true });

//     if (error) {
//       console.error(error);
//       return;
//     }

//     const mappedEvents: EventItem[] = (data || []).map((event) => ({
//       id: String(event.id),
//       name: event.name || "",
//       date: event.event_date || "",
//       location: event.location || "",
//       status: event.status || "upcoming",
//       scheduledGuardIds: (event.event_guards || []).map(
//         (row: { employee_id: string }) => row.employee_id,
//       ),
//     }));

//     setEvents(mappedEvents);

//     if (!selectedEventId && mappedEvents.length > 0) {
//       setSelectedEventId(mappedEvents[0].id);
//     }
//   }

//   async function addEvent() {
//     if (!newEvent.name.trim() || !newEvent.date) return;

//     const { error } = await supabase.from("events").insert({
//       name: newEvent.name,
//       event_date: newEvent.date,
//       location: newEvent.location,
//       status: newEvent.status,
//     });

//     if (error) {
//       console.error(error);
//       alert("Failed to add event.");
//       return;
//     }

//     await loadEvents();

//     setNewEvent({
//       name: "",
//       date: "",
//       location: "",
//       status: "upcoming",
//     });
//   }

//   async function assignGuard(eventId: string, employeeId: string | undefined) {
//     if (!employeeId) return;

//     const { data: existingData, error: existsError } = await supabase
//       .from("event_guards")
//       .select("id")
//       .eq("event_id", eventId)
//       .eq("employee_id", employeeId)
//       .maybeSingle();

//     if (existsError) {
//       console.error(existsError);
//       return;
//     }

//     if (existingData) return;

//     const { error } = await supabase.from("event_guards").insert({
//       event_id: eventId,
//       employee_id: employeeId,
//     });

//     if (error) {
//       console.error(error);
//       return;
//     }

//     await loadEvents();
//   }

//   async function removeGuardFromEvent(eventId: string, employeeId: string) {
//     const { error } = await supabase
//       .from("event_guards")
//       .delete()
//       .eq("event_id", eventId)
//       .eq("employee_id", employeeId);

//     if (error) {
//       console.error(error);
//       return;
//     }

//     await loadEvents();
//   }

//   async function clockIn(eventId: string, employeeId: string) {
//     // const existing = getEntry(eventId, employeeId);
//     // if (existing?.clockIn && !existing?.clockOut) return;
//     const { data } = await supabase
//       .from("time_entries")
//       .select("id")
//       .eq("event_id", eventId)
//       .eq("employee_id", employeeId)
//       .is("clock_out", null)
//       .maybeSingle();

//     if (data) return;

//     const { error } = await supabase.from("time_entries").insert({
//       event_id: eventId,
//       employee_id: employeeId,
//       clock_in: new Date().toISOString(),
//     });

//     if (error) {
//       console.error(error);
//       return;
//     }

//     await loadTimeEntries();
//   }
//   async function clockOut(eventId: string, employeeId: string) {
//     const entry = getEntry(eventId, employeeId);
//     if (!entry) return;

//     const { error } = await supabase
//       .from("time_entries")
//       .update({
//         clock_out: new Date().toISOString(),
//       })
//       .eq("id", entry.id);

//     if (error) {
//       console.error(error);
//       return;
//     }

//     await loadTimeEntries();
//   }
//   async function loadTimeEntries() {
//     const { data, error } = await supabase.from("time_entries").select("*");

//     if (error) {
//       console.error(error);
//       return;
//     }

//     setTimeEntries(
//       (data || []).map((entry) => ({
//         id: String(entry.id),
//         eventId: String(entry.event_id),
//         employeeId: String(entry.employee_id),
//         clockIn: entry.clock_in,
//         clockOut: entry.clock_out,
//       })),
//     );
//   }

//   //   setTimeEntries(
//   //     (data || []).map((entry) => ({
//   //       id: String(entry.id),
//   //       eventId: String(entry.event_id),
//   //       employeeId: String(entry.employee_id),
//   //       clockIn: entry.clock_in,
//   //       clockOut: entry.clock_out,
//   //     }))
//   //   );
//   // }

//   const payrollRows = useMemo<PayrollRow[]>(() => {
//     const start = new Date(payWindow.start + "T00:00:00");
//     const end = new Date(payWindow.end + "T23:59:59");

//     return timeEntries
//       .filter((entry) => {
//         const evt = events.find((e) => e.id === entry.eventId);
//         if (!evt) return false;
//         const eventDate = new Date(evt.date + "T12:00:00");
//         return eventDate >= start && eventDate <= end;
//       })
//       .map((entry) => {
//         const employee = employees.find((e) => e.id === entry.employeeId);
//         const evt = events.find((e) => e.id === entry.eventId);
//         const hours = calculateHours(entry.clockIn, entry.clockOut);
//         const rate = employee?.hourlyRate || 0;
//         return {
//           employeeName: employee
//             ? `${employee.firstName} ${employee.lastName}`.trim()
//             : "Unknown",
//           license: employee?.license || "",
//           eventName: evt?.name || "Unknown Event",
//           eventDate: evt?.date || "",
//           clockIn: entry.clockIn,
//           clockOut: entry.clockOut,
//           hours,
//           rate,
//           payout: hours * rate,
//         };
//       });
//   }, [timeEntries, payWindow, employees, events]);

//   const payrollTotalsByGuard = useMemo<
//     {
//       employeeName: string;
//       license: string;
//       totalHours: number;
//       totalPayout: number;
//     }[]
//   >(() => {
//     type TotalsMap = Record<
//       string,
//       {
//         employeeName: string;
//         license: string;
//         totalHours: number;
//         totalPayout: number;
//       }
//     >;
//     const map: TotalsMap = {};
//     payrollRows.forEach((row) => {
//       if (!map[row.employeeName]) {
//         map[row.employeeName] = {
//           employeeName: row.employeeName,
//           license: row.license,
//           totalHours: 0,
//           totalPayout: 0,
//         };
//       }
//       map[row.employeeName].totalHours += row.hours;
//       map[row.employeeName].totalPayout += row.payout;
//     });
//     return Object.values(map);
//   }, [payrollRows]);

//   function exportPayroll() {
//     downloadCSV("event-payroll-report.csv", [
//       [
//         "Guard",
//         "License",
//         "Event",
//         "Event Date",
//         "Clock In",
//         "Clock Out",
//         "Hours",
//         "Hourly Rate",
//         "Payout",
//       ],
//       ...payrollRows.map((row) => [
//         row.employeeName,
//         row.license,
//         row.eventName,
//         formatDate(row.eventDate),
//         formatDateTime(row.clockIn),
//         formatDateTime(row.clockOut),
//         row.hours,
//         money(row.rate),
//         money(row.payout),
//       ]),
//     ]);
//   }

//   const activeEntries = timeEntries.filter(
//     (entry) => entry.clockIn && !entry.clockOut,
//   );
//   const completedEntries = timeEntries.filter(
//     (entry) => entry.clockIn && entry.clockOut,
//   );
//   const totalCompletedHours = completedEntries.reduce(
//     (sum, entry) => sum + calculateHours(entry.clockIn, entry.clockOut),
//     0,
//   );

//   return (
//     <div className="min-h-screen bg-slate-100 p-4 md:p-8">
//       <div className="mx-auto max-w-7xl space-y-6">
//         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-slate-950">
//               Exodus Event Workforce System
//             </h1>
//             <p className="text-slate-600">
//               Events, employee rates, guard clock-in/out, and automatic payout
//               reports.
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={logout}>
//               Logout
//             </Button>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {[
//             ["events", "Events"],
//             ["employees", "Employee Information"],
//             ["clock", "Clock-In"],
//             ["payouts", "Payouts"],
//           ].map(([key, label]) => (
//             <Button
//               key={key}
//               variant={page === key ? "primary" : "outline"}
//               onClick={() => setPage(key)}
//             >
//               {label}
//             </Button>
//           ))}
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card>
//             <div className="flex items-center gap-3">
//               <CalendarDays />
//               <div>
//                 <p className="text-sm text-slate-500">Events</p>
//                 <p className="text-2xl font-bold">{events.length}</p>
//               </div>
//             </div>
//           </Card>
//           <Card>
//             <div className="flex items-center gap-3">
//               <Users />
//               <div>
//                 <p className="text-sm text-slate-500">Employees</p>
//                 <p className="text-2xl font-bold">{employees.length}</p>
//               </div>
//             </div>
//           </Card>
//           <Card>
//             <div className="flex items-center gap-3">
//               <Clock />
//               <div>
//                 <p className="text-sm text-slate-500">Clocked In Now</p>
//                 <p className="text-2xl font-bold">{activeEntries.length}</p>
//               </div>
//             </div>
//           </Card>
//           <Card>
//             <div className="flex items-center gap-3">
//               <DollarSign />
//               <div>
//                 <p className="text-sm text-slate-500">Completed Hours</p>
//                 <p className="text-2xl font-bold">
//                   {totalCompletedHours.toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {page === "events" && (
//           <div className="space-y-5">
//             <Card>
//               <h2 className="mb-4 text-xl font-semibold">Add Event</h2>
//               <div className="grid gap-3 md:grid-cols-5">
//                 <TextInput
//                   placeholder="Event name"
//                   value={newEvent.name}
//                   onChange={(e) =>
//                     setNewEvent({ ...newEvent, name: e.target.value })
//                   }
//                 />
//                 <TextInput
//                   type="date"
//                   value={newEvent.date}
//                   onChange={(e) =>
//                     setNewEvent({ ...newEvent, date: e.target.value })
//                   }
//                 />
//                 <TextInput
//                   placeholder="Location"
//                   value={newEvent.location}
//                   onChange={(e) =>
//                     setNewEvent({ ...newEvent, location: e.target.value })
//                   }
//                 />
//                 <SelectInput
//                   value={newEvent.status}
//                   onChange={(e) =>
//                     setNewEvent({
//                       ...newEvent,
//                       status: e.target.value as EventItem["status"],
//                     })
//                   }
//                 >
//                   <option value="past">Past</option>
//                   <option value="current">Current</option>
//                   <option value="upcoming">Upcoming</option>
//                 </SelectInput>
//                 <Button onClick={addEvent}>Add Event</Button>
//               </div>
//             </Card>

//             {["current", "upcoming", "past"].map((status) => (
//               <Card key={status}>
//                 <h2 className="mb-4 text-xl font-semibold capitalize">
//                   {status} Events
//                 </h2>
//                 <div className="space-y-4">
//                   {events
//                     .filter((event) => event.status === status)
//                     .map((event) => (
//                       <div key={event.id} className="rounded-xl border p-4">
//                         <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//                           <div>
//                             <h3 className="font-bold">{event.name}</h3>
//                             <p className="text-sm text-slate-500">
//                               {formatDate(event.date)} • {event.location}
//                             </p>
//                           </div>
//                           <div className="flex gap-2">
//                             <SelectInput
//                               onChange={(e) =>
//                                 assignGuard(event.id, e.target.value)
//                               }
//                               defaultValue=""
//                             >
//                               <option value="" disabled>
//                                 Add scheduled guard
//                               </option>
//                               {employees.map((employee) => (
//                                 <option key={employee.id} value={employee.id}>
//                                   {getFullName(employee)}
//                                 </option>
//                               ))}
//                             </SelectInput>
//                           </div>
//                         </div>

//                         <div className="overflow-x-auto rounded-xl border">
//                           <table className="w-full min-w-[700px] text-left text-sm">
//                             <thead className="bg-slate-50 text-slate-600">
//                               <tr>
//                                 <th className="p-3">Scheduled Guard</th>
//                                 <th className="p-3">License</th>
//                                 <th className="p-3">Rate</th>
//                                 <th className="p-3">Clock In</th>
//                                 <th className="p-3">Clock Out</th>
//                                 <th className="p-3">Hours</th>
//                                 <th className="p-3">Remove</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {event.scheduledGuardIds.map((guardId) => {
//                                 const employee = getEmployee(guardId);
//                                 const entry = getEntry(event.id, guardId);
//                                 return (
//                                   <tr key={guardId} className="border-t">
//                                     <td className="p-3 font-medium">
//                                       {employee
//                                         ? `${employee.firstName} ${employee.lastName}`.trim()
//                                         : ""}
//                                     </td>
//                                     <td className="p-3">{employee?.license}</td>
//                                     <td className="p-3">
//                                       {money(employee?.hourlyRate)}
//                                     </td>
//                                     <td className="p-3">
//                                       {formatTime(entry?.clockIn)}
//                                     </td>
//                                     <td className="p-3">
//                                       {formatTime(entry?.clockOut)}
//                                     </td>
//                                     <td className="p-3">
//                                       {calculateHours(
//                                         entry?.clockIn,
//                                         entry?.clockOut,
//                                       ).toFixed(2)}
//                                     </td>
//                                     <td className="p-3">
//                                       <Button
//                                         variant="outline"
//                                         onClick={() =>
//                                           removeGuardFromEvent(
//                                             event.id,
//                                             guardId,
//                                           )
//                                         }
//                                       >
//                                         Remove
//                                       </Button>
//                                     </td>
//                                   </tr>
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {page === "employees" && (
//           <div className="space-y-5">
//             <Card>
//               <div className="mb-4">
//                 <label className="mb-2 block text-sm font-medium">
//                   Import Employee CSV / Excel File
//                 </label>

//                 <input
//                   type="file"
//                   accept=".csv,.xlsx,.xls"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) importEmployeesFromFile(file);
//                   }}
//                   className="rounded-xl border border-slate-300 bg-white p-2 text-sm"
//                 />
//               </div>
//             </Card>
//             <Card>
//               <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
//                 <UserPlus size={20} /> Add Employee / Guard Information
//               </h2>
//               <div className="grid gap-3 md:grid-cols-6">
//                 <TextInput
//                   placeholder="First Name"
//                   value={newEmployee.firstName}
//                   onChange={(e) =>
//                     setNewEmployee({
//                       ...newEmployee,
//                       firstName: e.target.value,
//                     })
//                   }
//                 />

//                 <TextInput
//                   placeholder="Last Name"
//                   value={newEmployee.lastName}
//                   onChange={(e) =>
//                     setNewEmployee({
//                       ...newEmployee,
//                       lastName: e.target.value,
//                     })
//                   }
//                 />

//                 <TextInput
//                   placeholder="License #"
//                   value={newEmployee.license}
//                   onChange={(e) =>
//                     setNewEmployee({ ...newEmployee, license: e.target.value })
//                   }
//                 />
//                 <TextInput
//                   placeholder="Phone"
//                   value={newEmployee.phone}
//                   onChange={(e) =>
//                     setNewEmployee({ ...newEmployee, phone: e.target.value })
//                   }
//                 />
//                 <TextInput
//                   placeholder="Email"
//                   value={newEmployee.email}
//                   onChange={(e) =>
//                     setNewEmployee({ ...newEmployee, email: e.target.value })
//                   }
//                 />
//                 <TextInput
//                   type="number"
//                   placeholder="Hourly rate"
//                   value={newEmployee.hourlyRate}
//                   onChange={(e) =>
//                     setNewEmployee({
//                       ...newEmployee,
//                       hourlyRate: e.target.value,
//                     })
//                   }
//                 />
//                 <Button onClick={addEmployee}>Add Guard</Button>
//               </div>
//             </Card>

//             <Card>
//               <div className="mb-4 flex items-center gap-2">
//                 <Search size={18} />
//                 <TextInput
//                   placeholder="Search employees"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div>

//               <div className="overflow-x-auto rounded-xl border">
//                 <table className="w-full min-w-[900px] text-left text-sm">
//                   <thead className="bg-slate-50 text-slate-600">
//                     <tr>
//                       <th className="p-3">Name</th>
//                       <th className="p-3">License</th>
//                       <th className="p-3">Phone</th>
//                       <th className="p-3">Email</th>
//                       <th className="p-3">Hourly Rate</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {employees
//                       .filter((employee) =>
//                         `${getFullName(employee)} ${employee.license} ${employee.email}`
//                           .toLowerCase()
//                           .includes(search.toLowerCase()),
//                       )
//                       .map((employee) => (
//                         <tr key={employee.id} className="border-t">
//                           <td className="p-3">
//                             <TextInput
//                               value={employee.firstName}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "firstName",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>

//                           <td className="p-3">
//                             <TextInput
//                               value={employee.lastName}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "lastName",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                           <td className="p-3">
//                             <TextInput
//                               value={employee.license}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "license",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                           <td className="p-3">
//                             <TextInput
//                               value={employee.phone}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "phone",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                           <td className="p-3">
//                             <TextInput
//                               value={employee.email}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "email",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                           <td className="p-3">
//                             <TextInput
//                               type="number"
//                               value={employee.hourlyRate}
//                               onChange={(e) =>
//                                 updateEmployee(
//                                   employee.id,
//                                   "hourlyRate",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             </Card>
//           </div>
//         )}

//         {page === "clock" && (
//           <Card>
//             <div className="mb-4 grid gap-3 md:grid-cols-2">
//               <div>
//                 <h2 className="text-xl font-semibold">Clock-In / Clock-Out</h2>
//                 <p className="text-sm text-slate-500">
//                   Select an event and clock guards in or out.
//                 </p>
//               </div>
//               <SelectInput
//                 value={selectedEventId}
//                 onChange={(e) => setSelectedEventId(e.target.value)}
//               >
//                 {events.map((event) => (
//                   <option key={event.id} value={event.id}>
//                     {event.name} — {formatDate(event.date)}
//                   </option>
//                 ))}
//               </SelectInput>
//             </div>

//             <div className="overflow-x-auto rounded-xl border">
//               <table className="w-full min-w-[850px] text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-600">
//                   <tr>
//                     <th className="p-3">Guard</th>
//                     <th className="p-3">License</th>
//                     <th className="p-3">Rate</th>
//                     <th className="p-3">Clock In</th>
//                     <th className="p-3">Clock Out</th>
//                     <th className="p-3">Hours</th>
//                     <th className="p-3">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(selectedEvent?.scheduledGuardIds || []).map((guardId) => {
//                     const employee = getEmployee(guardId);
//                     const entry = getEntry(selectedEventId, guardId);
//                     const hours = calculateHours(
//                       entry?.clockIn,
//                       entry?.clockOut,
//                     );
//                     return (
//                       <tr key={guardId} className="border-t">
//                         <td className="p-3 font-medium">
//                           {employee
//                             ? `${employee.firstName} ${employee.lastName}`
//                             : ""}
//                         </td>
//                         <td className="p-3">{employee?.license}</td>
//                         <td className="p-3">{money(employee?.hourlyRate)}</td>
//                         <td className="p-3">
//                           {formatDateTime(entry?.clockIn)}
//                         </td>
//                         <td className="p-3">
//                           {formatDateTime(entry?.clockOut)}
//                         </td>
//                         <td className="p-3 font-semibold">
//                           {hours.toFixed(2)}
//                         </td>
//                         <td className="p-3">
//                           {!entry?.clockIn && (
//                             <Button
//                               onClick={() => clockIn(selectedEventId, guardId)}
//                             >
//                               Clock In
//                             </Button>
//                           )}
//                           {entry?.clockIn && !entry?.clockOut && (
//                             <Button
//                               variant="outline"
//                               onClick={() => clockOut(selectedEventId, guardId)}
//                             >
//                               Clock Out
//                             </Button>
//                           )}
//                           {entry?.clockOut && (
//                             <span className="text-slate-500">Completed</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card>
//         )}

//         {page === "payouts" && (
//           <div className="space-y-5">
//             <Card>
//               <div className="grid gap-3 md:grid-cols-4 md:items-end">
//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     Start Date
//                   </label>
//                   <TextInput
//                     type="date"
//                     value={payWindow.start}
//                     onChange={(e) =>
//                       setPayWindow({ ...payWindow, start: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     End Date
//                   </label>
//                   <TextInput
//                     type="date"
//                     value={payWindow.end}
//                     onChange={(e) =>
//                       setPayWindow({ ...payWindow, end: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-500">Payroll Total</p>
//                   <p className="text-2xl font-bold">
//                     {money(
//                       payrollRows.reduce((sum, row) => sum + row.payout, 0),
//                     )}
//                   </p>
//                 </div>
//                 <Button onClick={exportPayroll}>
//                   <span className="inline-flex items-center gap-2">
//                     <Download size={18} /> Export Payroll
//                   </span>
//                 </Button>
//               </div>
//             </Card>

//             <Card>
//               <h2 className="mb-4 text-xl font-semibold">
//                 Payroll Summary by Guard
//               </h2>
//               <div className="overflow-x-auto rounded-xl border">
//                 <table className="w-full min-w-[650px] text-left text-sm">
//                   <thead className="bg-slate-50 text-slate-600">
//                     <tr>
//                       <th className="p-3">Guard</th>
//                       <th className="p-3">License</th>
//                       <th className="p-3">Total Hours</th>
//                       <th className="p-3">Total Payout</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {payrollTotalsByGuard.map((row) => (
//                       <tr key={row.employeeName} className="border-t">
//                         <td className="p-3 font-medium">{row.employeeName}</td>
//                         <td className="p-3">{row.license}</td>
//                         <td className="p-3">{row.totalHours.toFixed(2)}</td>
//                         <td className="p-3 font-semibold">
//                           {money(row.totalPayout)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </Card>

//             <Card>
//               <h2 className="mb-4 text-xl font-semibold">Payroll Detail</h2>
//               <div className="overflow-x-auto rounded-xl border">
//                 <table className="w-full min-w-[1000px] text-left text-sm">
//                   <thead className="bg-slate-50 text-slate-600">
//                     <tr>
//                       <th className="p-3">Guard</th>
//                       <th className="p-3">Event</th>
//                       <th className="p-3">Event Date</th>
//                       <th className="p-3">Clock In</th>
//                       <th className="p-3">Clock Out</th>
//                       <th className="p-3">Hours</th>
//                       <th className="p-3">Rate</th>
//                       <th className="p-3">Payout</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {payrollRows.map((row, index) => (
//                       <tr key={index} className="border-t">
//                         <td className="p-3 font-medium">{row.employeeName}</td>
//                         <td className="p-3">{row.eventName}</td>
//                         <td className="p-3">{formatDate(row.eventDate)}</td>
//                         <td className="p-3">{formatDateTime(row.clockIn)}</td>
//                         <td className="p-3">{formatDateTime(row.clockOut)}</td>
//                         <td className="p-3">{row.hours.toFixed(2)}</td>
//                         <td className="p-3">{money(row.rate)}</td>
//                         <td className="p-3 font-semibold">
//                           {money(row.payout)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
