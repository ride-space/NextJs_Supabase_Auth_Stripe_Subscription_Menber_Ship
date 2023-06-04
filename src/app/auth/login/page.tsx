import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { Login } from "@/app/_components/Login";

// ログインページ
const LoginPage = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証している場合、リダイレクト
  if (session) {
    redirect("/");
  }

  return <Login />;
};

export default LoginPage;
