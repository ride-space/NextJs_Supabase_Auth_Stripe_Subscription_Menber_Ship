"use client";

import { useState } from "react";
import Link from "next/link";
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
  password: z.string().min(6, { message: "6文字以上入力する必要があります。" }),
});

export const Login = () => {
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
    defaultValues: { email: "", password: "" },
    // 入力値の検証
    resolver: zodResolver(schema),
  });

  // 送信
  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);

    try {
      // ログイン
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      // エラーチェック
      if (error) {
        setMessage("エラーが発生しました。" + error.message);
        return;
      }

      // トップページに遷移
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
    <div className="mx-auto max-w-[400px]">
      <div className="mb-10 text-center text-xl font-bold">ログイン</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* メールアドレス */}
        <div className="mb-3">
          <input
            type="email"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="メールアドレス"
            id="email"
            {...register("email", { required: true })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.email?.message}</div>
        </div>

        {/* パスワード */}
        <div className="mb-5">
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="パスワード"
            id="password"
            {...register("password", { required: true })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.password?.message}</div>
        </div>

        {/* ログインボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              ログイン
            </button>
          )}
        </div>
      </form>

      {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}

      <div className="mb-5 text-center text-sm">
        <Link href="/auth/reset-password" className="font-bold text-gray-500">
          パスワードを忘れた方はこちら
        </Link>
      </div>

      <div className="text-center text-sm">
        <Link href="/auth/signup" className="font-bold text-gray-500">
          アカウントを作成する
        </Link>
      </div>
    </div>
  );
};
