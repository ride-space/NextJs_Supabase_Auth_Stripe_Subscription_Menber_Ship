import { Database } from "@/_libs/database.types";


export type PostType = Database['public']['Tables']['posts']['Row']
export type MembershipType = Database['public']['Tables']['memberships']['Row']

type PostProfileType = {
  profiles: {
    name: string | null
    avatar_url : string | null
  } | null
}


type PostMembershipType = {
  memberships: {
    title: string
  } | null
}

export type PostWithProfileType = PostType & PostProfileType & PostMembershipType

export type ProfileType = {
  id: string
  name: string | null
  introduce: string | null
  avatar_url: string | null
}

export type SubscriptionType = {
  membership_id: string
  current_period_end: string | null
}
