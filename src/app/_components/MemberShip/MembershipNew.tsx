"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Database } from "@/_libs/database.types";
import { useStore } from "@/_store";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import Loading from "@/app/loading";

type Schema = z.infer<typeof schema>;

// 入力データの検証ルールを定義
const schema = z.object({
  title: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
  price: z.number().min(300, { message: "価格は300円以上である必要があります。" }),
  content: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
});

export const MembershipNew = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [fileMessage, setFileMessage] = useState("");
  const { user } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // 初期値
    defaultValues: {
      title: "",
      price: 300,
      content: "",
    },
    // 入力値の検証
    resolver: zodResolver(schema),
  });

  const onUploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileMessage("");

    if (!files || files.length === 0) {
      setFileMessage("画像をアップロードしてください");
      return;
    }

    const fileSize = files[0].size / 1024 / 1024;
    const fileType = files[0].type;

    if (fileSize > 2) {
      setFileMessage("画像サイズを2MB以下にする必要があります。");
      return;
    }

    if (fileType !== "image/jpeg" && fileType !== "image/png") {
      setFileMessage("画像はjpgまたはpng形式である必要があります。");
      return;
    }

    setImage(files[0]);
  }, []);

  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // ユーザーIDが取得できない場合、処理を終了
      if (!user.id) {
        return;
      }

      let image_url = "";
      if (image) {
        // supabaseストレージに画像アップロード
        const { data: storageData, error: storageError } = await supabase.storage
          .from("memberships")
          .upload(`${user.id}/${uuidv4()}`, image);
        // エラーチェック
        if (storageError) {
          setMessage("画像アップロードにエラーが発生しました。" + storageError.message);
          return;
        }
        // 画像のURLを取得
        const { data: urlData } = await supabase.storage.from("memberships").getPublicUrl(storageData.path);

        image_url = urlData.publicUrl;
      }

      // Stripeの商品を作成
      const res = await axios.post("/api/create-product", {
        title: data.title,
        price: data.price,
        user_id: user.id,
        name: user.name,
      });
      // price_idを取得
      const price_id = res.data.response;
      // メンバーシップ作成
      const { error: insertError } = await supabase.from("memberships").insert({
        profile_id: user.id,
        title: data.title,
        price: data.price,
        content: data.content,
        price_id,
        image_url,
      });

      // エラーチェック
      if (insertError) {
        setMessage("メンバーシップ作成にエラーが発生しました。" + insertError.message);
        return;
      }

      router.push(`/member/${user.id}`);
    } catch (error) {
      setMessage(`エラーが発生しました。${error}`);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="mb-10 text-center text-xl font-bold">メンバーシップ作成</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 画像 */}
        <div className="mb-5">
          <input type="file" id="image" onChange={onUploadImage} />
          {fileMessage && <div className="my-5 text-center text-red-500">{fileMessage}</div>}
        </div>

        {/* タイトル */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">タイトル</div>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="タイトル"
            id="title"
            {...register("title", { required: true })}
            required
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.title?.message}</div>
        </div>

        {/* 月額 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">月額</div>
          <input
            type="number"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="月額"
            id="price"
            {...register("price", { required: true, setValueAs: (value) => parseInt(value, 10) })}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.price?.message}</div>
        </div>

        {/* 内容 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">内容</div>
          <textarea
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="内容"
            id="content"
            {...register("content", { required: true })}
            rows={5}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.content?.message}</div>
        </div>

        {/* 作成ボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              作成
            </button>
          )}
        </div>
      </form>

      {/* メッセージ */}
      {message && <div className="my-5 text-center text-red-500">{message}</div>}
    </div>
  );
};
