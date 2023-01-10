import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ArrowRight } from 'phosphor-react'
import { Button, Text, TextInput } from '@ignite-ui/react'

import { z } from 'zod'

import { Form, FormAnnotation } from './styles'
import { useRouter } from 'next/router'

const claimUsernameFormSchema = z.object({
  username: z.string()
    .min(3, { message: 'O nome de usuário precisa ter pelo menos 3 letras'})
    .regex(/^([a-z\\-]+)$/i, { message: 'O nome de usuário deve conter apenas letras.'})
    .transform(value => value.toLowerCase())
})

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export default function ClaimUsernameForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema)
  });
  const router = useRouter();
  async function handleClaimUsername(data: ClaimUsernameFormData) {
    const {username} = data;

    await router.push(`/register?username=${username}`)
  }

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuario"
          {...register('username')}
        />
        <Button
          size="sm"
          type="submit"
          disabled={isSubmitting}
        >
          Reservar usuário
          <ArrowRight/>
        </Button>
      </Form>
      <FormAnnotation>
        <Text size="sm">
          { errors.username ? errors.username.message : 'Digite o nome de usuário.'}
        </Text>
      </FormAnnotation>
    </>
  )
}