"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { useStore } from "@/_store";
import { MembershipType } from "@/_types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fi } from "date-fns/locale";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import Loading from "@/app/loading";

type Schema = z.infer<typeof schema>;

const schema = z.object({
  title: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
  content: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
  membership: z.string(),
});

export const PostNew = ({ memberships }: { memberships: MembershipType[] | null }) => {
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
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      membership: "",
    },
    resolver: zodResolver(schema),
  });

  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileMessage("");

    if (!files || files?.length == 0) {
      setFileMessage("画像アップロード");
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
          .from("posts")
          .upload(`${user.id}/${uuidv4()}`, image);
        // エラーチェック
        if (storageError) {
          setMessage("画像アップロードにエラーが発生しました。" + storageError.message);
          return;
        }

        // 画像のURLを取得
        const { data: urlData } = await supabase.storage.from("posts").getPublicUrl(storageData.path);

        image_url = urlData.publicUrl;
      }

      // 新規投稿
      const { error: insertError } = await supabase.from("posts").insert({
        profile_id: user.id,
        title: data.title,
        content: data.content,
        membership_id: data.membership ? data.membership : null,
        image_url,
      });

      // エラーチェック
      if (insertError) {
        setMessage("新規投稿にエラーが発生しました。" + insertError.message);
        return;
      }

      router.push(`/member/${user.id}`);
    } catch (error) {
      setMessage("エラーが発生しました。" + error);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="mb-10 text-center text-xl font-bold">新規投稿</div>
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

        {/* 公開設定 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">公開設定</div>
          <Controller
            name="membership"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full rounded-md border px-3 py-2 focus:border-sky-500 focus:outline-none">
                <option value="">公開</option>
                {memberships &&
                  memberships.map((membership, index) => (
                    <option value={membership.id} key={index}>
                      {membership.title}
                    </option>
                  ))}
              </select>
            )}
          />
          <div className="my-3 text-center text-sm text-red-500">{errors.membership?.message}</div>
        </div>

        {/* 投稿ボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95"
            >
              投稿
            </button>
          )}
        </div>
      </form>

      {/* メッセージ */}
      {message && <div className="my-5 text-center text-red-500">{message}</div>}
    </div>
  );
};
