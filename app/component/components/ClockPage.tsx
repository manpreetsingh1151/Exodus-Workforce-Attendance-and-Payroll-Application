"use client";

import type { Employee, EventItem, TimeEntry } from "../types";
import { calculateHours, formatDate, formatDateTime, getFullName, money } from "../utils/format";
import { Button, Card, SelectInput } from "./ui";

type Props = {
  events: EventItem[];
  employees: Employee[];
  selectedEventId: string;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string>>;
  timeEntries: TimeEntry[];
  clockIn: (eventId: string, employeeId: string) => Promise<void>;
  clockOut: (eventId: string, employeeId: string) => Promise<void>;
};

export default function ClockPage({
  events,
  employees,
  selectedEventId,
  setSelectedEventId,
  timeEntries,
  clockIn,
  clockOut,
}: Props) {
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  function getEmployee(id: string) {
    return employees.find((employee) => employee.id === id);
  }

  function getEntry(eventId: string, employeeId: string) {
    return timeEntries.find(
      (entry) => entry.eventId === eventId && entry.employeeId === employeeId,
    );
  }

  return (
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
          onChange={(e) => setSelectedEventId(e.target.value)}
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
              const hours = calculateHours(entry?.clockIn, entry?.clockOut);

              return (
                <tr key={guardId} className="border-t">
                  <td className="p-3 font-medium">
                    {employee ? getFullName(employee) : ""}
                  </td>
                  <td className="p-3">{employee?.license}</td>
                  <td className="p-3">{money(employee?.hourlyRate)}</td>
                  <td className="p-3">{formatDateTime(entry?.clockIn)}</td>
                  <td className="p-3">{formatDateTime(entry?.clockOut)}</td>
                  <td className="p-3 font-semibold">{hours.toFixed(2)}</td>
                  <td className="p-3">
                    {!entry?.clockIn && (
                      <Button onClick={() => clockIn(selectedEventId, guardId)}>
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
  );
}