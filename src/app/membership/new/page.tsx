import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/_libs/database.types'
import { MembershipNew } from '@/app/_components/MemberShip/MembershipNew'

// 新規メンバーシップページ
const MembershipNewPage = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  })

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 未認証の場合、リダイレクト
  if (!session) {
    redirect('/auth/login')
  }

  return <MembershipNew />
}

export default MembershipNewPage
