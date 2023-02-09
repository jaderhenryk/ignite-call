import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Calendar } from "../../../../../components/Calendar";
import { api } from "../../../../../lib/axios";
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from "./styles";

interface Availability {
  possibleHours: number[]
  availableHours: number[]
}

interface CalendarStepProps {
  onSelecteDateTime: (date: Date) => void
}

export function CalendarStep({ onSelecteDateTime }: CalendarStepProps) {
  const [ selectedDate, setSelectedDate ] = useState<Date | null>(null)
  // const [ availability, setAvailability ] = useState<Availability | null>(null)

  const router = useRouter()

  const isDateSelected = !!selectedDate

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  const dayAndMonth = selectedDate ? dayjs(selectedDate).format('DD[ de ]MMMM') : null
  const selectedDateWithoutTime = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null
  const username = String(router.query.username)

  const { data: availability } = useQuery<Availability>(['availability', selectedDateWithoutTime], async () => {
    const response = await api.get(`/users/${username}/availability`, {
      params: {
        date: selectedDateWithoutTime
      }
    })
    return response.data
  }, {
    enabled: !!selectedDate
  })

  function handleSelectTime(time: number) {
    const dateTimeSelected = dayjs(selectedDate).set('hour', time).startOf('hour').toDate()
    onSelecteDateTime(dateTimeSelected)
  }

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar
        selectedDate={selectedDate}
        onDateSelected={setSelectedDate}
      />
      { isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{dayAndMonth}</span>
          </TimePickerHeader>

          <TimePickerList>
          {
            availability?.possibleHours.map(hour => {
              return (
                <TimePickerItem 
                  key={hour}
                  disabled={!availability.availableHours.includes(hour)}
                  onClick={() => handleSelectTime(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              )
            })
          }
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}