import { useState } from "react"
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from "~/lib/auth-store"

export default function List() {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")

  const { data: myList = [], isPending, isError, error } = useQuery({
    queryKey: ['vacation-wishes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })

  const mutate = useMutation({
    mutationFn: async (newTitle: string) => {
      const { data, error } = await supabase
        .from('wishes')
        .insert([{ title: newTitle }])
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      // 추가 성공 후, 캐시를 무효화하여 목록을 다시 가져옴
      queryClient.invalidateQueries({ queryKey: ['vacation-wishes'] })

      // 입력 필드 초기화
      setTitle("")
    },
    onError: (err: any) => {
      alert(`추가 실패: ${err.message}`)
    }
  })

  if (isPending) return <div className="p-4">로딩 중...</div>

  if (isError) return <div className="p-4">에러: {error.message}</div>

  return (
    <>
      <form className="m-2 p-4 border flex justify-between"
        onSubmit={e => {
          e.preventDefault() // 버튼 눌렸을 때 새로고침 되는 것 금지 명령
          mutate.mutate(title)
        }}>
        <input
          type="text"
          value={title}
          placeholder="방학에 하고 싶은 일 (*)"
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full"/>
        <button
          type="submit"
          disabled={mutate.isPending}
          className="shrink-0 p-2 bg-violet-600 text-white">
          추가
        </button>
      </form>
      <div className="p-4 space-y-2">
        {myList.length === 0
          ? <div>아직 적어 둔 위시가 없습니다.</div>
          : myList.map((p: any) => (
              <div key={p.id}>{p.title}</div>
            ))}
      </div>
    </>
  )
}
