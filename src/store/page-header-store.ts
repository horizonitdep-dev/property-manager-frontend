import { create } from "zustand"
import type { ReactNode } from "react"

interface PageHeaderContent {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

interface PageHeaderState {
  header: PageHeaderContent | null
  setHeader: (header: PageHeaderContent) => void
  clear: () => void
}

// Lets a page inject its own title/subtitle/actions into the persistent
// shell's page-title slot, which always sits between the header and the
// module nav row — see ClaudeCode_Rebuild_Prompt.md.
export const usePageHeaderStore = create<PageHeaderState>((set) => ({
  header: null,
  setHeader: (header) => set({ header }),
  clear: () => set({ header: null }),
}))
