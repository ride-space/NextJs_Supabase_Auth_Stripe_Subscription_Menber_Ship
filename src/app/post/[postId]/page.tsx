import { Database } from "@/_libs/database.types"
import { SubscriptionType } from "@/_types"
import { PostDetail } from "@/app/_components/Post/PostDetail"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import {cookies} from "next/headers"

type PageProps = {
  params: {
    postId: string
  }
}


const PostDetailPage = async ({params}: PageProps) => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  })

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 投稿を取得
  const { data: postData } = await supabase
    .from('posts')
    .select('*, profiles(name, avatar_url), memberships(title)')
    .eq('id', params.postId)
    .single()

  // 投稿がない場合
  if (!postData) {
    return <div className="text-center">投稿はありません</div>
  }

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

  // サブスクリプションの判定
  const isSubscriber =
    postData.membership_id === null || session?.user.id === postData.profile_id
      ? true
      : subscriptions!.some(
          (item) =>
            item.membership_id === postData.membership_id &&
            new Date(item.current_period_end!) >= new Date()
        )

  return <PostDetail post={postData} isSubscriber={isSubscriber} />
}

export default  PostDetailPage;
