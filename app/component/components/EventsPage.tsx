"use client";

import type { Employee, EventItem, TimeEntry } from "../types";
import { Button, Card, SelectInput, TextInput } from "./ui";
import { calculateHours, formatDate, formatTime, getFullName, money } from "../utils/format";

type Props = {
  events: EventItem[];
  employees: Employee[];
  timeEntries: TimeEntry[];
  newEvent: {
    name: string;
    date: string;
    location: string;
    status: "upcoming" | "current" | "past";
  };
  setNewEvent: React.Dispatch<
    React.SetStateAction<{
      name: string;
      date: string;
      location: string;
      status: "upcoming" | "current" | "past";
    }>
  >;
  addEvent: () => Promise<boolean>;
  assignGuard: (eventId: string, employeeId: string | undefined) => Promise<void>;
  removeGuardFromEvent: (eventId: string, employeeId: string) => Promise<void>;
};

export default function EventsPage({
  events,
  employees,
  timeEntries,
  newEvent,
  setNewEvent,
  addEvent,
  assignGuard,
  removeGuardFromEvent,
}: Props) {
  function getEmployee(id: string) {
    return employees.find((employee) => employee.id === id);
  }

  function getEntry(eventId: string, employeeId: string) {
    return timeEntries.find(
      (entry) => entry.eventId === eventId && entry.employeeId === employeeId,
    );
  }

  async function handleAddEvent() {
    const success = await addEvent();

    if (success) {
      setNewEvent({
        name: "",
        date: "",
        location: "",
        status: "upcoming",
      });
    }
  }

  return (
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

          <Button onClick={handleAddEvent}>Add Event</Button>
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

                    <div className="w-full md:w-64">
                      <SelectInput
                        defaultValue=""
                        onChange={(e) =>
                          assignGuard(event.id, e.target.value)
                        }
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
                                {employee ? getFullName(employee) : ""}
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
                                    removeGuardFromEvent(event.id, guardId)
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
  );
}