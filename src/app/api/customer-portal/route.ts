import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()
    const requestUrl = new URL(req.url)

    // カスタマーポータルセッション作成
    const res_billing_portal = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${requestUrl.origin}/settings/customer-portal`,
    })

    // カスタマーポータルセッションURLを返す
    return NextResponse.json({ response: res_billing_portal.url })
  } catch (error) {
    console.log('error', error)
    return NextResponse.error()
  }
}
