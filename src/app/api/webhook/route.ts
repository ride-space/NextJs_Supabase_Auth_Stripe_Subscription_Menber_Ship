import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });
// Stripe Webhook Secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    // Stripeカラのリクエストか動かを確認
    const signature = headers().get("Stripe-Signature") as string;
    // イベント取得
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret!);
    const session = event.data.object as Stripe.Checkout.Session;

    // イベントタイプごとに処理を分ける
    // 最初の支払いが成功したとき
    if (event.type === "checkout.session.completed") {
      console.log("checkout.session.completed");
      // サブスクリプション詳細取得
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      // ユーザーのプロフィールにStripeの顧客IDを追加
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          customer_id: subscription.customer as string,
        })
        .match({
          id: session.metadata!.user_id,
        });

      // エラーがあれば終了
      if (updateError) {
        console.log("updateError", updateError);
        return NextResponse.error();
      }

      // サブスクリプション情報追加
      const { error: insertError } = await supabase.from("subscriptions").insert({
        profile_id: session.metadata!.user_id,
        membership_id: session.metadata!.membership_id,
        subscription_id: subscription.id,
        customer_id: subscription.customer as string,
        price_id: subscription.items.data[0].price.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      // エラーがあれば終了
      if (insertError) {
        console.log("insertError", insertError);
        return NextResponse.error();
      }
    } else if (event.type === "invoice.payment_succeeded") {
      // 定期的な支払いが成功したとき
      console.log("invoice.payment_succeeded");
      // サブスクリプション詳細取得
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      // サブスクリプション情報更新
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          price_id: subscription.items.data[0].price.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .match({
          subscription_id: subscription.id,
        });

      // エラーがあれば終了
      if (updateError) {
        console.log("updateError", updateError);
        return NextResponse.error();
      }
    }

    // 成功
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.error();
  }
}
