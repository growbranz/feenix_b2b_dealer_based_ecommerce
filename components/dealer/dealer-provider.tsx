"use client"

import * as React from "react"
import type { Profile } from "@/types"

type DealerContextValue = Profile | null

const DealerContext = React.createContext<DealerContextValue>(null)

export function DealerProvider({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  return (
    <DealerContext.Provider value={profile}>{children}</DealerContext.Provider>
  )
}

export function useDealer() {
  return React.useContext(DealerContext)
}
