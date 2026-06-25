"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { EventItem } from "../types";

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_guards (
          employee_id
        )
      `)
      .order("event_date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const mappedEvents: EventItem[] = (data || []).map((event) => ({
      id: String(event.id),
      name: event.name || "",
      date: event.event_date || "",
      location: event.location || "",
      status: event.status || "upcoming",
      scheduledGuardIds: (event.event_guards || []).map(
        (row: { employee_id: string }) => row.employee_id,
      ),
    }));

    setEvents(mappedEvents);

    if (!selectedEventId && mappedEvents.length > 0) {
      setSelectedEventId(mappedEvents[0].id);
    }
  }

  async function addEvent(newEvent: {
    name: string;
    date: string;
    location: string;
    status: "upcoming" | "current" | "past";
  }) {
    if (!newEvent.name.trim() || !newEvent.date) return false;

    const { error } = await supabase.from("events").insert({
      name: newEvent.name,
      event_date: newEvent.date,
      location: newEvent.location,
      status: newEvent.status,
    });

    if (error) {
      console.error(error);
      alert("Failed to add event.");
      return false;
    }

    await loadEvents();
    return true;
  }

  async function assignGuard(eventId: string, employeeId: string | undefined) {
    if (!employeeId) return;

    const { data: existingData, error: existsError } = await supabase
      .from("event_guards")
      .select("id")
      .eq("event_id", eventId)
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (existsError) {
      console.error(existsError);
      return;
    }

    if (existingData) return;

    const { error } = await supabase.from("event_guards").insert({
      event_id: eventId,
      employee_id: employeeId,
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadEvents();
  }

  async function removeGuardFromEvent(eventId: string, employeeId: string) {
    const { error } = await supabase
      .from("event_guards")
      .delete()
      .eq("event_id", eventId)
      .eq("employee_id", employeeId);

    if (error) {
      console.error(error);
      return;
    }

    await loadEvents();
  }

  return {
    events,
    selectedEventId,
    setSelectedEventId,
    loadEvents,
    addEvent,
    assignGuard,
    removeGuardFromEvent,
  };
}