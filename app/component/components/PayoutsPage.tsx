"use client";

import { Download } from "lucide-react";
import type { Employee, EventItem, PayrollRow, TimeEntry } from "../types";
import { calculateHours, formatDate, formatDateTime, money } from "../utils/format";
import { downloadCSV } from "../utils/csv";
import { Button, Card, TextInput } from "./ui";

type PayWindow = {
  start: string;
  end: string;
};

type Props = {
  employees: Employee[];
  events: EventItem[];
  timeEntries: TimeEntry[];
  payWindow: PayWindow;
  setPayWindow: React.Dispatch<React.SetStateAction<PayWindow>>;
  updateTimeEntry: (
  entryId: string,
  clockIn: string | null,
  clockOut: string | null,
) => Promise<void>;
};

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export default function PayoutsPage({
  employees,
  events,
  timeEntries,
  payWindow,
  setPayWindow,
  updateTimeEntry,
}: Props) {
  const payrollRows: PayrollRow[] = timeEntries
    .filter((entry) => {
      const start = new Date(payWindow.start + "T00:00:00");
      const end = new Date(payWindow.end + "T23:59:59");
      const evt = events.find((event) => event.id === entry.eventId);

      if (!evt) return false;

      const eventDate = new Date(evt.date + "T12:00:00");

      return eventDate >= start && eventDate <= end;
    })
    .map((entry) => {
      const employee = employees.find((employee) => employee.id === entry.employeeId);
      const event = events.find((event) => event.id === entry.eventId);
      const hours = calculateHours(entry.clockIn, entry.clockOut);
      const rate = employee?.hourlyRate || 0;

      return {
        entryId: entry.id,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`.trim()
          : "Unknown",
        license: employee?.license || "",
        eventName: event?.name || "Unknown Event",
        eventDate: event?.date || "",
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        hours,
        rate,
        payout: hours * rate,
      };
    });

  const payrollTotalsByGuard = Object.values(
    payrollRows.reduce(
      (map, row) => {
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

        return map;
      },
      {} as Record<
        string,
        {
          employeeName: string;
          license: string;
          totalHours: number;
          totalPayout: number;
        }
      >,
    ),
  );

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

  return (
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
              {money(payrollRows.reduce((sum, row) => sum + row.payout, 0))}
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
                <tr
                  key={`${row.employeeName}-${row.eventName}-${index}`}
                  className="border-t"
                >
                  <td className="p-3 font-medium">{row.employeeName}</td>
                  <td className="p-3">{row.eventName}</td>
                  <td className="p-3">{formatDate(row.eventDate)}</td>

                  {/* <td className="p-3">{formatDateTime(row.clockIn)}</td>
                  <td className="p-3">{formatDateTime(row.clockOut)}</td> */}

                  <td className="p-3">
  <input
    type="datetime-local"
    value={toDateTimeLocalValue(row.clockIn)}
    onChange={(e) =>
      updateTimeEntry(
        row.entryId,
        fromDateTimeLocalValue(e.target.value),
        row.clockOut,
      )
    }
    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
  />
</td>

<td className="p-3">
  <input
    type="datetime-local"
    value={toDateTimeLocalValue(row.clockOut)}
    onChange={(e) =>
      updateTimeEntry(
        row.entryId,
        row.clockIn,
        fromDateTimeLocalValue(e.target.value),
      )
    }
    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
  />
</td>

                  <td className="p-3">{row.hours.toFixed(2)}</td>
                  <td className="p-3">{money(row.rate)}</td>
                  <td className="p-3 font-semibold">{money(row.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}