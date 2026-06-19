import { getCalendarEvents } from "@/lib/actions/calendar";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Interviews and follow-ups at a glance
        </p>
      </div>
      <CalendarView events={JSON.parse(JSON.stringify(events))} />
    </div>
  );
}
