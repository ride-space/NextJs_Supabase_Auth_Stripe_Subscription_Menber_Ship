import { Password } from "@/app/_components/Password";

// パスワード再設定ページ
const ResetPasswordConfirmPage = () => {
  return (
    <div className="mx-auto max-w-[400px]">
      {/* パスワード変更 */}
      <Password />
    </div>
  );
};

export default ResetPasswordConfirmPage;
