import { Database } from "@/_libs/database.types";
import { create } from "zustand";

type ProfileType = Database["public"]["Tables"]["profiles"]["Row"];
type StateType = {
  user: ProfileType;
  setUser: (payload: ProfileType) => void;
};

export const useStore = create<StateType>((set) => ({
  user: { id: "", email: "", name: "", introduce: "", avatar_url: "" },
  // アップデート
  setUser: (payload) => set({ user: payload }),
}));
