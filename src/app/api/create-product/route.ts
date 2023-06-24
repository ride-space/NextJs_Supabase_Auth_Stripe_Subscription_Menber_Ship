import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });

export async function POST(req: NextRequest) {
  try {
    const { title, price, user_id, name } = await req.json();
    // 商品作成
    const res_product = await stripe.products.create({
      name: title,
      metadata: {
        user_id,
        name,
      },
    });
    // 価格作成
    const res_price = await stripe.prices.create({
      unit_amount: price,
      currency: "jpy",
      recurring: { interval: "month" },// サブスクリプションの場合は設定
      product: res_product.id,
    });

    // price_idを返す
    return NextResponse.json({ response: res_price.id });
  } catch (error) {
    console.log("error", error);
    return NextResponse.error();
  }
}
