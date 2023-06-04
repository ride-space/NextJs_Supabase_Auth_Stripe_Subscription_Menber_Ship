import { cookies } from "next/headers";

import { Database } from "@/_libs/database.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const Home = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <div className="text-center text-xl">{session ? <div>ログイン済</div> : <div>未ログイン</div>}</div>;
};

export default Home;
