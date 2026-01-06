import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EditorLayout } from '@/components/Editor/EditorLayout'

const SESSION_COOKIE = {
  name: 'luxo-session',
  value: 'admin-auth',
}

export default async function Home() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE.name)

  if (session?.value !== SESSION_COOKIE.value) {
    redirect('/login')
  }

  return <EditorLayout />
}
