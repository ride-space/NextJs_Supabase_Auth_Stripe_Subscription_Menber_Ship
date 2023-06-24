"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/_store";
import axios from "axios";

import Loading from "@/app/loading";

// カスタマーポータル
export const CustomerPortal = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useStore();

  // カスタマーポータルを開く
  const openCustomerPortal = async () => {
    setLoading(true);

    try {
      // 顧客IDがない場合は処理を終了
      if (!user.customer_id) {
        return;
      }

      // カスタマーポータルを開くAPIをコール
      const res = await axios.post("/api/customer-portal", {
        customer_id: user.customer_id,
      });

      // カスタマーポータルのURLを取得
      const url = res.data.response;

      // カスタマーポータルを開く
      if (url) {
        router.push(url);
      }
    } catch (error) {
      setMessage("エラーが発生しました。" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center text-xl font-bold">カスタマーポータル</div>
      <div className="mb-5">カスタマーポータルでは、下記のことができます。</div>
      <ul className="mb-5 list-inside list-disc">
        <li>ご請求を確認する</li>
        <li>お支払い方法を変更する</li>
        <li>定期支払いをキャンセルする</li>
        <li>請求履歴を確認する</li>
        <li>領収書をダウンロードする</li>
        <li>インボイスをダウンロードする</li>
      </ul>

      <div className="mb-5">
        {loading ? (
          <Loading />
        ) : (
          <div
            className="w-full cursor-pointer rounded-full bg-sky-500 p-2 text-center text-sm font-bold text-white hover:brightness-95"
            onClick={openCustomerPortal}
          >
            カスタマーポータルを開く
          </div>
        )}
      </div>

      {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}
    </div>
  );
};
