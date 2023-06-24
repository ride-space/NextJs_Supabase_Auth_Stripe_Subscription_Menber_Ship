"use client";

import Image from "next/image";
import Link from "next/link";

import { PostWithProfileType } from "@/_types";
import { formatDistance } from "date-fns";

// 投稿アイテム
const PostItem = ({ post, isSubscriber }: { post: PostWithProfileType; isSubscriber: boolean }) => {
  // 投稿内容を100文字に制限
  const content = post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content;
  const createdAt = new Date(post.created_at);
  const now = new Date();
  // 投稿日時を表示
  const date = formatDistance(createdAt, now, { addSuffix: true });

  return (
    <div className="mb-5">
      <Link href={`/member/${post.profile_id}`}>
        <div className="mb-3 inline-flex items-center space-x-2">
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
            <div className="text-sm text-gray-500">{date}</div>
          </div>
        </div>
      </Link>

      <Link href={`/post/${post.id}`}>
        <div className="rounded-lg border shadow-lg shadow-gray-100">
          <div className="relative h-[350px] w-full">
            <Image
              src={isSubscriber ? (post.image_url ? post.image_url : "/noimage.png") : "/subscribers.png"}
              className="rounded-t-lg object-cover"
              alt="post"
              fill
            />
          </div>

          <div className="m-3">
            <div className="mb-2 flex items-center space-x-1">
              <div className="font-bold">{post.title}</div>
              <div className="text-sm text-gray-500">- {post.memberships ? post.memberships.title : "公開"}</div>
            </div>
            {isSubscriber && <div className="text-sm">{content}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostItem;
