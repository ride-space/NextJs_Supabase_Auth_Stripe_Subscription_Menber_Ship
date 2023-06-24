import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json()

    // セッションIDがcs_から始まらない場合はエラー
    if (!session_id.startsWith('cs_')) {
      return NextResponse.error()
    }

    // チェックアウトセッション詳細取得
    const res_checkout = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer'],
    })

    // チェックアウトセッション詳細を返す
    return NextResponse.json({ response: res_checkout })
  } catch (error) {
    console.log('error', error)
    return NextResponse.error()
  }
}
