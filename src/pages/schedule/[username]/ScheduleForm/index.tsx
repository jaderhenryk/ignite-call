import { useState } from "react";
import { CalendarStep } from "./CalendarStep";
import { ConfirmStep } from "./ConfirmStep";

export function ScheduleForm() {
  const [ selectedDateTime, setSelectedDateTime ] = useState<Date | null>()

  function handleCancelSelectDate() {
    setSelectedDateTime(null)
  }

  if (selectedDateTime) {
    return <ConfirmStep 
      schedulingDate={selectedDateTime}
      onCancelConfirmation={handleCancelSelectDate}
    />
  }

  return (
    <CalendarStep 
      onSelecteDateTime={setSelectedDateTime}
    />
  )
}