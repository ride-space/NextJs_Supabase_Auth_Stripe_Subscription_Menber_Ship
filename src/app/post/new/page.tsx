import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {PostNew} from '@/app/_components/Post/PostNew'
import { Database } from '@/_libs/database.types'

// 新規投稿ページ
const PostNewPage = async () => {
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

  // メンバーシップを取得
  const { data: membershipData } = await supabase
    .from('memberships')
    .select('*')
    .eq('profile_id', session.user.id)

  return <PostNew memberships={membershipData} />
}

export default PostNewPage
