"use client";

import Image from "next/image";
import Link from "next/link";

import { PostWithProfileType } from "@/_types";
import { format } from "date-fns";

export const PostDetail = ({ post, isSubscriber }: { post: PostWithProfileType; isSubscriber: boolean }) => {
  return (
    <div>
      <Link href={`/member/${post.profile_id}`}>
        <div className="mb-5 inline-flex items-center space-x-2">
          <div className="relative h-10 w-10">
            <Image
              src={post.profiles?.avatar_url ? post.profiles.avatar_url : "/default.png"}
              className="rounded-full object-cover"
              alt="avatar"
              fill
            />
          </div>
          <div>
            <div className="font-bold">{post.profiles?.name}</div>
            <div className="text-sm text-gray-500">{format(new Date(post.created_at), "yyyy/MM/dd HH:mm")}</div>
          </div>
        </div>
      </Link>

      <div className="mb-5 flex items-center space-x-1">
        <div className="text-lg font-bold">{post.title}</div>
        <div className="text-sm text-gray-500">- {post.memberships ? post.memberships.title : "公開"}</div>
      </div>

      <div className="relative h-[350px] w-full">
        <Image
          src={isSubscriber ? (post.image_url ? post.image_url : "/noimage.png") : "/subscribers.png"}
          className="rounded-lg object-cover"
          alt="post"
          fill
        />
      </div>

      {isSubscriber ? (
        <div className="my-5 whitespace-pre-wrap break-words leading-relaxed">{post.content}</div>
      ) : (
        <div className="my-5 text-center">メンバーシップ登録をお願いします</div>
      )}
    </div>
  );
};
