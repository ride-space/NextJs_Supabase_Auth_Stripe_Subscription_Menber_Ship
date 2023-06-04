"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Loading from "@/app/loading";

// ログアウト
export const Logout = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ログアウト
      const { error } = await supabase.auth.signOut();

      // エラーチェック
      if (error) {
        setMessage("エラーが発生しました。" + error.message);
        return;
      }

      router.push("/");
    } catch (error) {
      setMessage("エラーが発生しました。" + error);
      return;
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="mb-5 text-center">ログアウトしますか？</div>
      {/* ログアウトボタン */}
      <form onSubmit={onSubmit}>
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-red-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              ログアウト
            </button>
          )}
        </div>
      </form>

      {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}
    </div>
  );
};
