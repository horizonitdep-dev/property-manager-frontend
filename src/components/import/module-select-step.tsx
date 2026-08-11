"use client"

import { IMPORT_MODULES } from "@/lib/import-labels"
import { cn } from "@/lib/utils"
import type { ImportModuleKey } from "@/types/import"

export function ModuleSelectStep({ onSelect }: { onSelect: (module: ImportModuleKey) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {IMPORT_MODULES.map((module) => {
        const Icon = module.icon
        return (
          <button
            key={module.key}
            type="button"
            onClick={() => onSelect(module.key)}
            className="flex flex-col items-start gap-3 rounded-xl border border-outline-variant bg-surface p-5 text-left transition-colors hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-high",
                module.accentClassName
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-body-lg font-semibold text-on-surface">{module.label}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{module.description}</p>
              {module.dependencyNote && (
                <p className="mt-1 text-xs text-warning">{module.dependencyNote}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
