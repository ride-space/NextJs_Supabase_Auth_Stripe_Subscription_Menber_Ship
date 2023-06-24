import { cookies } from "next/headers"
import { Database } from "@/_libs/database.types"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { MemberDetail } from "@/app/_components/Member/MemberDetail"
import { SubscriptionType } from "@/_types"

type PageProps = {
  params: {
    memberId: string
  }
}


const MemberDetailPage = async ({params}: PageProps) => {
const supabase = createServerComponentClient<Database>({
  cookies,
})

const { data: {session}} = await supabase.auth.getSession()
const {data: profileData} = await supabase.from('profiles').select('id, name,introduce, avatar_url').eq('id', params.memberId).single()

if(!profileData) {
  return <div className="text-center">プロフィールがありません。</div>
}

  // 投稿を取得
  const { data: postData } = await supabase
    .from('posts')
    .select('*, profiles(name, avatar_url), memberships(title)')
    .eq('profile_id', params.memberId)
    .order('created_at', { ascending: false })

  // メンバーシップを取得
  const { data: membershipData } = await supabase
    .from('memberships')
    .select('*')
    .eq('profile_id', params.memberId)
    .order('created_at', { ascending: false })


      // サブスクリプションを取得
  let subscriptions: SubscriptionType[] | null = []
  // ログインしていない場合は空配列
  if (session) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('membership_id, current_period_end')
      .eq('profile_id', session.user.id)
    subscriptions = subscriptionData
  }


  return (
    <MemberDetail
      posts={postData}
      memberId={params.memberId}
      memberships={membershipData}
      profile={profileData}
      subscriptions={subscriptions}
    />
  )
}

export default MemberDetailPage;
