import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// import dayjs from "dayjs";
import { prisma } from "../../../../lib/prisma";

const periodSchema = z.object({
  month: z.string().min(1).max(2),
  year: z.string().min(4).max(4)
})

export default async function handle(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  const username = String(req.query.username)
  const { year, month } = periodSchema.parse(req.query)

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month not provided.' })
  }
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })
  if (!user) {
    return res.status(400).json({ message: 'User not found.'})
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      weekDay: true
    },
    where: {
      user_id: user.id
    }
  })
  const unavailableWeekDays = [0, 1, 2, 3, 4, 5, 6].filter(weekDay => {
    return !availableWeekDays.some(availableWeekDay => availableWeekDay.weekDay === weekDay)
  })

  const unaivalableDatesRaw: Array<{ day_date: number }> = await prisma.$queryRaw`
    SELECT 
      day_date,
      reserved_amount,
      available_amount
    FROM (
      SELECT
          extract(day from S."date") as day_date,
          count(S."date") as reserved_amount,
          ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60) as available_amount
      FROM schedulings S
      LEFT JOIN user_time_intervals uti 
        on uti."weekDay" = extract(dow FROM S."date")
      WHERE S.user_id = ${user.id}
        AND TO_CHAR(s."date", 'yyyy-mm') = ${`${year}-${month.padStart(2, "0")}`}
      GROUP BY 
        extract(day from S."date"),
        ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60)
    ) AS t
    WHERE reserved_amount >= available_amount
  `
  const unavailableDates = unaivalableDatesRaw.map(item => item.day_date)

  return res.json({ unavailableWeekDays, unavailableDates })
}