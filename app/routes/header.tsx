import { Outlet } from "react-router"
import { useAuthStore } from "~/lib/auth-store"
import { supabase } from '../lib/supabase'
import type { Route } from "./+types/header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "방학 위시리스트" },
    { name: "description", content: "방학 때 하고 싶은 일" },
  ]
}

export async function clientLoader() {
  const store = useAuthStore.getState()

  if (store.status === "authenticated") return
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    store.setSession(session)
  } else {
    // 세션이 없다면 .env.local 에 적어 둔 테스트 계정으로 로그인
    try {
      await store.signIn(
        import.meta.env.VITE_TEST_EMAIL,
        import.meta.env.VITE_TEST_PASSWORD
      )
    } catch (error) {
      console.error("로그인 실패:", error)
    }
  }
}

// 첫 화면에서도 clientLoader가 실행되도록 설정
clientLoader.hydrate = true as const

export function HydrateFallback() {
  return <div className="p-4">로그인 확인 중...</div>
}

export default function Header() {
  const user = useAuthStore(s => s.user)

  return (
    <div>
      <header className="header bg-violet-900 text-white p-4">
        <h1>방학 때 하고 싶은 일 {user?.email}</h1>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
