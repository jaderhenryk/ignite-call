import { useMemo, useState } from "react";

import { useQuery } from '@tanstack/react-query'

import dayjs from "dayjs";

import { CaretLeft, CaretRight } from "phosphor-react";
import { getWeekDays } from "../../utils/get-week-days";
import { CalendarActions, CalendarBody, CalendarContainer, CalendarDay, CalendarHeader, CalendarTitle } from "./styles";
import { api } from "../../lib/axios";
import { useRouter } from "next/router";

interface CalendarWeek {
  week: number,
  days: {
    date: dayjs.Dayjs
    disabled: boolean
  }[]
}

interface UnavailableDates {
  unavailableWeekDays: number[],
  unavailableDates: string[]
}

type CalendarWeeks = CalendarWeek[]

interface CalendarProps {
  selectedDate: Date | null,
  onDateSelected: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
  const [ currentDate, setCurrentDate ] = useState(() => {
    return dayjs().set('date', 1)
  })
  const router = useRouter()

  function handlePreviousMonth() {
    const previousMonth = currentDate.subtract(1, 'month')
    setCurrentDate(previousMonth)
  }
  
  function handleNextMonth() {
    const nextMonth = currentDate.add(1, 'month')
    setCurrentDate(nextMonth)
  }

  const shortWeekDays = getWeekDays({ short: true })
  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')

  const username = String(router.query.username)

  const { data: unavailableDates } = useQuery<UnavailableDates>(['unavailable-dates', currentDate.get('year'), currentDate.get('month')], async () => {
    const response = await api.get(`/users/${username}/unavailable-dates`, {
      params: {
        year: currentDate.get('year'),
        month: currentDate.get('month') + 1
      }
    })
    return response.data
  })

  const calendarWeeks = useMemo(() => {
    if (!unavailableDates) {
      return []
    }

    const daysInMonth = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, index) => {
      return currentDate.set('date', index + 1)
    }).map(date => {
      return { 
        date,
        disabled: date.endOf('day').isBefore(new Date())
          || unavailableDates.unavailableWeekDays.includes(date.get('day'))
          || unavailableDates.unavailableDates.includes(date.get('date').toString())
      }
    })

    const firstWeekDay = currentDate.get('day')
    const previousMonthFillArray = Array.from({
      length: firstWeekDay
    }).map((_, index) => {
      return currentDate.subtract(index + 1, 'day')
    }).map(date => {
      return { date, disabled: true }
    }).reverse()

    const lastDayInMonth = currentDate.set('date', currentDate.daysInMonth())
    const lastWeekDay = lastDayInMonth.get('day')
    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, index) => {
      return lastDayInMonth.add(index + 1, 'day')
    }).map(date => {
      return { date, disabled: true }
    })

    const calendarDays = [
      ...previousMonthFillArray,
      ...daysInMonth,
      ...nextMonthFillArray
    ]

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>((weeks, _, index, original) => {
      const isNewWeek = index % 7 === 0
      if (isNewWeek) {
        weeks.push({
          week: index / 7 + 1,
          days: original.slice(index, index + 7)
        })
      }
      return weeks
    }, [])

    return calendarWeeks
  }, [currentDate, unavailableDates])

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>
        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft/>
          </button>
          <button onClick={handleNextMonth} title="Next month">
            <CaretRight/>
          </button>
        </CalendarActions>
      </CalendarHeader>
      <CalendarBody>
        <thead>
          <tr>
          {
            shortWeekDays.map(weekDay => <th key={weekDay}>{weekDay}.</th>)
          }
          </tr>
        </thead>
        <tbody>
        {
          calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
              {
                days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        disabled={disabled}
                        onClick={() => onDateSelected(date.toDate())}
                      >
                        {date.get('date')
                      }</CalendarDay>
                    </td>
                  )
                })
              }
              </tr>
            )
          })
        }
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}