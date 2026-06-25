import { CalendarDays, Clock, DollarSign, Users } from "lucide-react";
import { Card } from "./ui";
import type { Employee, EventItem, TimeEntry } from "../types";
import { calculateHours } from "../utils/format";

type Props = {
  events: EventItem[];
  employees: Employee[];
  timeEntries: TimeEntry[];
};

export default function StatsCards({ events, employees, timeEntries }: Props) {
  const activeEntries = timeEntries.filter((entry) => entry.clockIn && !entry.clockOut);
  const completedEntries = timeEntries.filter((entry) => entry.clockIn && entry.clockOut);

  const totalCompletedHours = completedEntries.reduce(
    (sum, entry) => sum + calculateHours(entry.clockIn, entry.clockOut),
    0,
  );

  return (
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
            <p className="text-2xl font-bold">{totalCompletedHours.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}