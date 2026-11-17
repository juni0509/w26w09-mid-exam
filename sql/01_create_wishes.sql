-- 방학 위시리스트 테이블
CREATE TABLE public.wishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    title TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS(Row Level Security, 행 단위 보안)
-- Enable automatic RLS에 체크했다면 아래 한 줄은 없어도 됨
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 자신이 등록한 행만 조회(SELECT) 가능
CREATE POLICY "사용자는 자신의 위시만 조회할 수 있다."
ON public.wishes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 인증된 사용자는 자신의 user_id로만 삽입(INSERT) 가능
CREATE POLICY "사용자는 새로운 위시를 등록할 수 있다."
ON public.wishes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 인증된 사용자는 자신이 삽입한 행만 삭제(DELETE) 가능
CREATE POLICY "사용자는 자신의 위시만 삭제할 수 있다."
ON public.wishes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 인증된 사용자는 자신이 삽입한 행만 수정(UPDATE) 가능
CREATE POLICY "사용자는 자신의 위시만 수정할 수 있다."
ON public.wishes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
