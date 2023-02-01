import { useForm } from 'react-hook-form'

import { Button, Text, TextArea, TextInput } from "@ignite-ui/react";
import { CalendarBlank, Clock } from "phosphor-react";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

import { ConfirmForm, FormAction, FormError, FormHeader } from "./styles";

const confirmFormSchema = z.object({
  name: z.string().min(5, { message: 'O nome deve ter perlo menos 5 caracteres.' }),
  email: z.string().email({ message: 'Informe um e-mail válido.' }),
  observations: z.string().nullable()
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>

export function ConfirmStep() {
  const { register, handleSubmit, formState: { isSubmitting, errors }} = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema)
  })

  function handleConfirmScheduling(formData: ConfirmFormData) {

  }

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank/>
          22 de Setembro
        </Text>
        <Text>
          <Clock/>18:00
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
        <Button type="button" variant="tertiary">Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>Confirmar</Button>
      </FormAction>
    </ConfirmForm>
  )
}