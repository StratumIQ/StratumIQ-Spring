"use client";

import { createContext, useContext } from "react";
import type { DashUser } from "@/types";

const UserCtx = createContext<DashUser | null>(null);
export const useDashUser = () => useContext(UserCtx);

const SidebarCtx = createContext({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarCtx);

export { UserCtx, SidebarCtx };
