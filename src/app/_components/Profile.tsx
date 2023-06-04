"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { useStore } from "@/_store";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import Loading from "@/app/loading";

type Schema = z.infer<typeof schema>;

// 入力データの検証ルールを定義
const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
  introduce: z.string().min(0),
});

// プロフィール
export const Profile = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [fileMessage, setFileMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/default.png");
  const { user } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // 初期値
    defaultValues: {
      name: user.name ? user.name : "",
      introduce: user.introduce ? user.introduce : "",
    },
    // 入力値の検証
    resolver: zodResolver(schema),
  });

  // アバター画像の取得
  useEffect(() => {
    if (user && user.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  // 画像アップロード
  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileMessage("");

    // ファイルが選択されていない場合
    if (!files || files?.length == 0) {
      setFileMessage("画像をアップロードしてください。");
      return;
    }

    const fileSize = files[0]?.size / 1024 / 1024; // size in MB
    const fileType = files[0]?.type; // MIME type of the file

    // 画像サイズが2MBを超える場合
    if (fileSize > 2) {
      setFileMessage("画像サイズを2MB以下にする必要があります。");
      return;
    }

    // ファイル形式がjpgまたはpngでない場合
    if (fileType !== "image/jpeg" && fileType !== "image/png") {
      setFileMessage("画像はjpgまたはpng形式である必要があります。");
      return;
    }

    // 画像をセット
    setAvatar(files[0]);
  }, []);

  // 送信
  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      let avatar_url = user.avatar_url;

      if (avatar) {
        // supabaseストレージに画像アップロード
        const { data: storageData, error: storageError } = await supabase.storage
          .from("profile")
          .upload(`${user.id}/${uuidv4()}`, avatar);

        // エラーチェック
        if (storageError) {
          setMessage("エラーが発生しました。" + storageError.message);
          return;
        }

        if (avatar_url) {
          const fileName = avatar_url.split("/").slice(-1)[0];

          // 古い画像を削除
          await supabase.storage.from("profile").remove([`${user.id}/${fileName}`]);
        }

        // 画像のURLを取得
        const { data: urlData } = await supabase.storage.from("profile").getPublicUrl(storageData.path);

        avatar_url = urlData.publicUrl;
      }

      // プロフィールアップデート
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          introduce: data.introduce,
          avatar_url,
        })
        .eq("id", user.id);

      // エラーチェック
      if (updateError) {
        setMessage("エラーが発生しました。" + updateError.message);
        return;
      }

      setMessage("プロフィールを更新しました。");
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
      <div className="mb-10 text-center text-xl font-bold">プロフィール</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* アバター画像 */}
        <div className="mb-5">
          <div className="mb-5 flex flex-col items-center justify-center text-sm">
            <div className="relative mb-5 h-24 w-24">
              <Image src={avatarUrl} className="rounded-full object-cover" alt="avatar" fill />
            </div>
            <input type="file" id="avatar" onChange={onUploadImage} />
            {fileMessage && <div className="my-5 text-center text-red-500">{fileMessage}</div>}
          </div>
        </div>

        {/* 名前 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">名前</div>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="名前"
            id="name"
            {...register("name", { required: true })}
            required
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.name?.message}</div>
        </div>

        {/* 自己紹介 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">自己紹介</div>
          <textarea
            className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="自己紹介"
            id="introduce"
            {...register("introduce")}
            rows={5}
          />
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
      </form>

      {/* メッセージ */}
      {message && <div className="my-5 text-center text-red-500">{message}</div>}
    </div>
  );
};
