"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useStore } from "@/_store";
import { MembershipType, PostWithProfileType, ProfileType, SubscriptionType } from "@/_types";
import { DocumentTextIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { MembershipDetail } from "@/app/_components/MemberShip/MembershipDetail";
import PostItem from "@/app/_components/Post/PostItem";

// メンバー詳細
export const MemberDetail = ({
  posts,
  memberId,
  memberships,
  profile,
  subscriptions,
}: {
  posts: PostWithProfileType[] | null;
  memberId: string;
  memberships: MembershipType[] | null;
  profile: ProfileType;
  subscriptions: SubscriptionType[] | null;
}) => {
  const [tab, setTab] = useState("post");
  const [userId, setUserId] = useState("");
  const { user } = useStore();

  // ユーザーIDをセット
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className="relative h-20 w-20">
            <Image
              src={profile.avatar_url ? profile.avatar_url : "/default.png"}
              className="rounded-full object-cover"
              alt="avatar"
              fill
            />
          </div>
          <div>
            <div className="text-xl font-bold">{profile.name}</div>
          </div>
        </div>
        <div>
          <div
            className="cursor-pointer rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white"
            onClick={() => setTab("membership")}
          >
            メンバーになる
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div>{profile.introduce}</div>
      </div>

      <div className="mb-5 flex items-center justify-between border-b">
        {/* タブ */}
        <div className="flex text-center text-sm">
          <div className="mr-2">
            <div
              className={`${
                tab === "post" && "font-bold text-sky-500"
              } flex cursor-pointer border-b-2 border-transparent p-4 hover:border-sky-500`}
              onClick={() => setTab("post")}
            >
              <DocumentTextIcon className="mr-2 h-5 w-5" />
              投稿
            </div>
          </div>
          <div className="mr-2">
            <div
              className={`${
                tab === "membership" && "font-bold text-sky-500"
              } flex cursor-pointer border-b-2 border-transparent p-4 hover:border-sky-500`}
              onClick={() => setTab("membership")}
            >
              <UserGroupIcon className="mr-2 h-5 w-5" />
              メンバーシップ
            </div>
          </div>
        </div>

        {userId === profile.id && (
          <div className="rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white">
            {tab === "post" ? (
              <Link href="post/new">新規投稿</Link>
            ) : tab === "membership" ? (
              <Link href="membership/new">新規メンバーシップ</Link>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>

      {/* TODO: 投稿情報とメンバーシップ情報を表示 */}
      {tab === 'post' ? (
        <div>
          {posts && posts.length !== 0 ? (
            <div>
              {posts.map((post, index) => {
                const isSubscriber =
                  post.membership_id === null || userId === post.profile_id
                    ? true
                    : subscriptions!.some(
                        (item) =>
                          item.membership_id === post.membership_id &&
                          new Date(item.current_period_end!) >= new Date()
                      )

                return <PostItem key={index} post={post} isSubscriber={isSubscriber} />
              })}
            </div>
          ) : (
            <div className="text-center">投稿はありません</div>
          )}
        </div>
      ) : tab === 'membership' ? (
        <MembershipDetail memberships={memberships} memberId={memberId} />
      ) : (
        <></>
      )}
    </div>
  );
};
