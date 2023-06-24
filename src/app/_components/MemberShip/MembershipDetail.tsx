"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/_store";
import { MembershipType } from "@/_types";
import axios from "axios";

import { MembershipItem } from "@/app/_components/MemberShip/MembershipItem";

export const MembershipDetail = ({
  memberships,
  memberId,
}: {
  memberships: MembershipType[] | null;
  memberId: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const { user } = useStore();

  // メンバーシップに参加する

  const handleJoin = async (membership_id: string, price_id: string) => {
    setLoading(membership_id);

    try {
      if (!user.id) {
        return;
      }

      // チェックアウトを作成するAPIをコール
      const res = await axios.post("/api/create-checkout", {
        user_id: user.id,
        name: user.name,
        member_id: memberId,
        membership_id,
        customer: user.customer_id ? user.customer_id : "new",
        email: user.email,
        price_id,
      });

      // チェックアウトのURLを取得
      const url = res.data.response;

      // チェックアウトを開く
      if (url) {
        router.push(url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("");
    }
  };

  return (
    <div>
      {memberships && memberships.length !== 0 ? (
        <div>
          <div className="mb-5 text-center text-xl font-bold">メンバーシップを選択</div>
          <div className="grid grid-cols-2 gap-5">
            {memberships.map((membership, index) => (
              <MembershipItem key={index} loading={loading} handleJoin={handleJoin} membership={membership} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">メンバーシップはありません</div>
      )}
    </div>
  );
};
