"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { TimeEntry } from "../types";
import { roundToNearestQuarterHour } from "../utils/format";



export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  async function loadTimeEntries() {
    const { data, error } = await supabase.from("time_entries").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setTimeEntries(
      (data || []).map((entry) => ({
        id: String(entry.id),
        eventId: String(entry.event_id),
        employeeId: String(entry.employee_id),
        clockIn: entry.clock_in,
        clockOut: entry.clock_out,
      })),
    );
  }

  function getEntry(eventId: string, employeeId: string) {
    return timeEntries.find(
      (entry) => entry.eventId === eventId && entry.employeeId === employeeId,
    );
  }

  async function clockIn(eventId: string, employeeId: string) {
    const { data } = await supabase
      .from("time_entries")
      .select("id")
      .eq("event_id", eventId)
      .eq("employee_id", employeeId)
      .is("clock_out", null)
      .maybeSingle();

    if (data) return;

    const { error } = await supabase.from("time_entries").insert({
      event_id: eventId,
      employee_id: employeeId,
      // clock_in: new Date().toISOString(),
      clock_in: roundToNearestQuarterHour(),
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadTimeEntries();
  }

  async function clockOut(eventId: string, employeeId: string) {
    const entry = getEntry(eventId, employeeId);
    if (!entry) return;

    const { error } = await supabase
      .from("time_entries")
      .update({
        // clock_out: new Date().toISOString(),
        clock_out: roundToNearestQuarterHour(),
      })
      .eq("id", entry.id);

    if (error) {
      console.error(error);
      return;
    }

    await loadTimeEntries();
  }

  async function updateTimeEntry(
  entryId: string,
  clockIn: string | null,
  clockOut: string | null,
) {
  const { error } = await supabase
    .from("time_entries")
    .update({
      clock_in: clockIn,
      clock_out: clockOut,
    })
    .eq("id", entryId);

  if (error) {
    console.error(error);
    alert("Failed to update time entry.");
    return;
  }

  await loadTimeEntries();
}

//   async function updateTimeEntry(
//   entryId: string,
//   clockIn: string | null,
//   clockOut: string | null,
// ) {
//   const { error } = await supabase
//     .from("time_entries")
//     .update({
//       clock_in: clockIn || null,
//       clock_out: clockOut || null,
//     })
//     .eq("id", entryId);

//   if (error) {
//     console.error(error);
//     alert("Failed to update time entry.");
//     return;
//   }

//   await loadTimeEntries();
// }

  return {
  timeEntries,
  loadTimeEntries,
  getEntry,
  clockIn,
  clockOut,
  updateTimeEntry,
};
}