import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../lib/axios";
import { convertTimeStringInMinutes } from "../../../utils/convert-time-string-in-minutes";
import { getWeekDays } from "../../../utils/get-week-days";
import { Container, Header } from "../styles";
import { FormError, IntervalBox, IntervalContainer, IntervalDay, IntervalInputs, IntervalItem } from "./styles";

const timeIntervalsFormSchema = z.object({
  intervals: z.array(z.object({
    weekDay: z.number().min(0).max(6),
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string()
  }))
    .length(7)
    .transform(intervals => intervals.filter(interval => interval.enabled))
    .refine(intervals => intervals.length > 0, 'Você precisa selecionar pelo menos um dia da semana.')
    .transform(intervals => {
      return intervals.map(interval => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringInMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringInMinutes(interval.endTime)
        }
      })
    })
    .refine(intervals => {
      return intervals.every(interval => interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes)
    }, 'O horário de término deve ser pelo menos 1h após o início.')
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const { 
    register, 
    handleSubmit, 
    watch, 
    control, 
    formState: { isSubmitting, errors } 
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ]
    }
  })
  const weekDays = getWeekDays();
  const { fields } = useFieldArray({
    control,
    name: 'intervals'
  })
  const intervals = watch('intervals')

  const router = useRouter()

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput
    await api.post('/users/time-intervals', {
      intervals
    })
    await router.push('/register/update-profile')
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">
          Conecte sua agenda!
        </Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas ocupadas e os novos eventos à medida em que são agendados.
        </Text>
        <MultiStep size={4} currentStep={3}/>
      </Header>
      
      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalContainer>
        {
          fields.map((field, index) => {
            return (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller 
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Checkbox 
                          onCheckedChange={checked => field.onChange(checked === true)}
                          checked={field.value}
                        />
                      )
                    }}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput 
                    size="sm"
                    type="time"
                    step={60}
                    {...register(`intervals.${index}.startTime`)}
                    disabled={intervals[index].enabled === false}
                  />
                  <TextInput 
                    size="sm" 
                    type="time" 
                    step={60}
                    {...register(`intervals.${index}.endTime`)}
                    disabled={intervals[index].enabled === false}
                   />
                </IntervalInputs>
              </IntervalItem>
            )
          })
        }
        </IntervalContainer>
        {
          errors.intervals && (
            <FormError size="sm">
              {errors.intervals.message}
            </FormError>
          )
        }
        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  )
}