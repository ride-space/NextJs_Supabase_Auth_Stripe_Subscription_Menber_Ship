"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import axios from "axios";
import Stripe from "stripe";

import Loading from "@/app/loading";

// 支払い完了
export const MembershipResult = () => {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [checkoutSession, setCheckoutSession] = useState<Stripe.Checkout.Session | null>(null);
  const [loading, setLoading] = useState(false);

  // チェックアウトセッション詳細の取得
  useEffect(() => {
    const fn = async () => {
      setLoading(true);

      try {
        // チェックアウトセッション詳細の取得APIをコール
        const res = await axios.post("/api/retrieve-checkout", {
          session_id,
        });

        // チェックアウトセッションを取得
        setCheckoutSession(res.data.response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (session_id) {
      fn();
    }
  }, [session_id]);

  return (
    <div className="mx-auto max-w-[400px]">
      {loading ? (
        <Loading />
      ) : checkoutSession ? (
        <div className="text-center">
          <div className="mb-5 text-2xl">お支払いが完了しました</div>
          <div className="mb-5 text-2xl font-bold">{checkoutSession.amount_total}円/月</div>
          <div className="mb-5">領収書は、カスタマーポータルから発行できます。</div>
          <Link href="/settings/customer-portal">
            <div className="w-full rounded-full bg-sky-500 p-2 text-sm font-bold text-white hover:brightness-95">
              カスタマーポータル
            </div>
          </Link>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
