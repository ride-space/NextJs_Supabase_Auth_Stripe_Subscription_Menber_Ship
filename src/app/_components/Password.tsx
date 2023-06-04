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
const schema = z
  .object({
    password: z.string().min(6, { message: "6文字以上入力する必要があります。" }),
    confirmation: z.string().min(6, { message: "6文字以上入力する必要があります。" }),
  })
  .refine((data) => data.password === data.confirmation, {
    message: "新しいパスワードと確認用パスワードが一致しません。",
    path: ["confirmation"], // エラーメッセージが適用されるフィールド
  });

// パスワード変更
export const Password = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    // 初期値
    defaultValues: { password: "", confirmation: "" },
    // 入力値の検証
    resolver: zodResolver(schema),
  });

  // 送信
  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // パスワードの更新
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setMessage("エラーが発生しました。" + error.message);
        return;
      }

      reset();
      setMessage("パスワードは正常に更新されました。");
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
      <div className="mb-10 text-center text-xl font-bold">パスワード変更</div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 新しいパスワード */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">新しいパスワード</div>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="新しいパスワード"
            id="password"
            {...register("password", { required: true })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.password?.message}</div>
        </div>

        {/* 確認用パスワード */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">確認用パスワード</div>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="確認用パスワード"
            id="confirmation"
            {...register("confirmation", { required: true })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.confirmation?.message}</div>
        </div>

        {/* 変更ボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              変更
            </button>
          )}
        </div>

        {/* メッセージ */}
        {message && <div className="text-center text-sm text-red-500">{message}</div>}
      </form>
    </div>
  );
};
