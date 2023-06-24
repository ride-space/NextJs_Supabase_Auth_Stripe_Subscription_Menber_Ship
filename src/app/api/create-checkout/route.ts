import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });

export async function POST(req: NextRequest) {

  try {
    const { user_id, name, member_id, membership_id, customer, email, price_id } = await req.json()
    const requestUrl = new URL(req.url)

        // パラメータ設定
        let params: Stripe.Checkout.SessionCreateParams = {
          mode: 'subscription',
          payment_method_types: ['card'],
          billing_address_collection: 'auto',
          line_items: [
            {
              price: price_id,
              quantity: 1,
            },
          ],
          metadata: {
            user_id,
            name,
            membership_id,
          },
          success_url: `${requestUrl.origin}/membership/result?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${requestUrl.origin}/member/${member_id}`,
        }

        if (customer === 'new') {
          // 新規顧客
          params['customer_email'] = email
        } else {
          // 既存顧客
          params['customer'] = customer
        }

        // チェックアウトセッション作成
        const checkoutSession = await stripe.checkout.sessions.create(params)

    // チェックアウトセッションURLを返す
    return NextResponse.json({ response: checkoutSession.url })
  } catch (error) {
    console.log("error", error);
    return NextResponse.error();
  }
}
