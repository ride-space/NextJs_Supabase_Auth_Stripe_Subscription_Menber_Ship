"use client";

import Image from "next/image";

import { useStore } from "@/_store";
import { MembershipType } from "@/_types";

import Loading from "@/app/loading";

export const MembershipItem = ({
  loading,
  handleJoin,
  membership,
}: {
  loading: string;
  handleJoin: (membership_id: string, price_id: string) => void;
  membership: MembershipType;
}) => {
  const { user } = useStore();
  return (
    <div className="rounded-lg border shadow-lg shadow-gray-100">
      <div className="relative mb-5 h-[150px] w-full">
        <Image
          src={membership.image_url ? membership.image_url : "/noimage.png"}
          className="rounded-t-lg object-cover"
          alt="post"
          fill
        />
      </div>

      <div className="m-2">
        <div className="mb-3 text-center font-bold">{membership.title}</div>
        <div className="mb-3 text-center font-bold">{`月${membership.price}円`}</div>

        <div className="mb-5 text-center">
          {loading === membership.id ? (
            <Loading />
          ) : user.id ? (
            <div
              className="inline-block w-32 cursor-pointer rounded-full bg-red-500 py-1 text-white"
              onClick={() => handleJoin(membership.id, membership.price_id)}
            >
              参加
            </div>
          ) : (
            <div className="inline-block w-32 rounded-full bg-gray-500 py-1 text-white">参加</div>
          )}
        </div>

        <div className="whitespace-pre-wrap break-words">{membership.content}</div>
      </div>
    </div>
  );
};
