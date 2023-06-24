"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Database } from "@/_libs/database.types";
import { useStore } from "@/_store";
import type { Session } from "@supabase/auth-helpers-nextjs";

type ProfileType = Database["public"]["Tables"]["profiles"]["Row"];
export const Navigation = ({ session, profile }: { session: Session | null; profile: ProfileType | null }) => {
  const { setUser } = useStore();

  // 状態管理にユーザー情報を保存
  useEffect(() => {
    setUser({
      id: session ? session.user.id : "",
      email: session ? session.user.email! : "",
      name: session && profile ? profile.name : "",
      introduce: session && profile ? profile.introduce : "",
      avatar_url: session && profile ? profile.avatar_url : "",
      customer_id: session && profile ? profile.customer_id : "",
    });
  }, [session, setUser, profile]);

  return (
    <header className="shadow-lg shadow-gray-100">
      <div className="container mx-auto flex max-w-screen-sm items-center justify-between py-5">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          App
        </Link>

        <div className="text-sm font-bold">
          {session ? (
            <div className="flex items-center space-x-5">
              <Link href="/settings/profile">
                <div className="relative h-10 w-10">
                  <Image
                    src={profile && profile.avatar_url ? profile.avatar_url : "/default.png"}
                    className="rounded-full object-cover"
                    alt="avatar"
                    fill
                  />
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-5">
              <Link href="/auth/login">ログイン</Link>
              <Link href="/auth/signup">サインアップ</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
