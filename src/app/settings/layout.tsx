"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ArrowLeftOnRectangleIcon, ComputerDesktopIcon, CreditCardIcon, EnvelopeIcon, KeyIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useStore } from "@/_store";
import { useEffect, useState } from "react";

// レイアウト
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useStore()
  const [userId, setUserId] = useState('')

  useEffect(()=> {
if(user.id) {
  setUserId(user.id)
}
  },[user.id])

    // ナビゲーション
    const subNavigation = [
      {
        name: 'プロフィール',
        icon: UserCircleIcon,
        href: '/settings/profile',
      },
      {
        name: 'マイページ',
        icon: ComputerDesktopIcon,
        href: userId ? `/member/${userId}` : '/',
      },
      {
        name: 'メールアドレス',
        icon: EnvelopeIcon,
        href: '/settings/email',
      },
      {
        name: 'パスワード',
        icon: KeyIcon,
        href: '/settings/password',
      },
      {
        name: 'カスタマーポータル',
        icon: CreditCardIcon,
        href: '/settings/customer-portal',
      },
      {
        name: 'ログアウト',
        icon: ArrowLeftOnRectangleIcon,
        href: '/settings/logout',
      },
    ]

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-1 flex flex-col space-y-1 text-sm font-bold">
        {subNavigation.map((item, index) => (
          <Link href={item.href} key={index}>
            <div
              className={`${
                item.href == pathname && "bg-sky-100 text-sky-500"
              } rounded-full px-3 py-2 hover:bg-sky-100`}
            >
              <item.icon className="mr-2 inline-block h-5 w-5" />
              {item.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
};

export default SettingsLayout;
