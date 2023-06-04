"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

import Loading from "@/app/loading";

type Schema = z.infer<typeof schema>;

// 入力データの検証ルールを定義
const schema = z.object({
  email: z.string().email({ message: "メールアドレスの形式ではありません。" }),
});

// パスワードリセットページ
export const ResetPassword = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // 初期値
    defaultValues: { email: "" },
    // 入力値の検証
    resolver: zodResolver(schema),
  });

  // 送信
  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // パスワードリセットメールを送信
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${location.origin}/auth/reset-password/confirm`,
      });

      // エラーチェック
      if (error) {
        setMessage("エラーが発生しました。" + error.message);
        return;
      }

      setMessage("パスワードリセットに必要なメールを送信しました。");
    } catch (error) {
      setMessage("エラーが発生しました。" + error);
      return;
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="mb-10 text-center text-xl font-bold">パスワードを忘れた場合</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* メールアドレス */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">メールアドレス</div>
          <input
            type="email"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="メールアドレス"
            id="email"
            {...register("email", { required: true })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.email?.message}</div>
        </div>

        {/* 送信ボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              送信
            </button>
          )}
        </div>
      </form>

      {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}
    </div>
  );
};
