import { useForm } from 'react-hook-form'

import { Button, Text, TextArea, TextInput } from "@ignite-ui/react";
import { CalendarBlank, Clock } from "phosphor-react";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

import { ConfirmForm, FormAction, FormError, FormHeader } from "./styles";
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { api } from '../../../../../lib/axios';

const confirmFormSchema = z.object({
  name: z.string().min(5, { message: 'O nome deve ter perlo menos 5 caracteres.' }),
  email: z.string().email({ message: 'Informe um e-mail válido.' }),
  observations: z.string().nullable()
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>

interface ConfirmStepProps {
  schedulingDate: Date,
  onCancelConfirmation: () => void
}

export function ConfirmStep({ schedulingDate, onCancelConfirmation }: ConfirmStepProps) {
  const { register, handleSubmit, formState: { isSubmitting, errors }} = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema)
  })

  const router = useRouter()
  const username = String(router.query.username)
  async function handleConfirmScheduling(formData: ConfirmFormData) {
    const { name, email, observations } = formData
    await api.post(`/users/${username}/schedule`, {
      name,
      email,
      observations,
      date: schedulingDate
    })
    onCancelConfirmation()
  }

  const describedDate = dayjs(schedulingDate).format('DD[ de ]MMMM[ de ]YYYY')
  const describedTime = dayjs(schedulingDate).format('HH:mm[h]')

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank/>
          {describedDate}
        </Text>
        <Text>
          <Clock/>{describedTime}
        </Text>
      </FormHeader>
      <label>
        <Text size="sm">Nome Completo</Text>
        <TextInput placeholder="Seu nome completo" {...register('name')}/>
        { errors.name && <FormError size="sm">{errors.name.message}</FormError> }
      </label>
      <label>
        <Text size="sm">Endereço de E-mail</Text>
        <TextInput type="email" placeholder="johndoe@email.com" {...register('email')}/>
        { errors.email && <FormError size="sm">{errors.email.message}</FormError> }
      </label>
      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register('observations')}/>
      </label>
      <FormAction>
        <Button type="button" variant="tertiary" onClick={onCancelConfirmation}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>Confirmar</Button>
      </FormAction>
    </ConfirmForm>
  )
}