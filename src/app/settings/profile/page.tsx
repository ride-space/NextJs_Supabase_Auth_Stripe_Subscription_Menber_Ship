import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Database } from "@/_libs/database.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { Profile } from "@/app/_components/Profile";

const ProfilePage = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 未認証の場合、リダイレクト
  if (!session) {
    redirect("/auth/login");
  }

  return <Profile />;
};

export default ProfilePage;
