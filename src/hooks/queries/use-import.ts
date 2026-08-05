"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { importService } from "@/services/import-service"
import type { ImportModuleKey } from "@/types/import"

// Query key prefix each module's list pages already use — invalidating this
// makes new records show up immediately after a successful commit.
const MODULE_QUERY_PREFIX: Record<ImportModuleKey, string> = {
  buildings: "buildings",
  properties: "properties",
  tenants: "tenants",
  contracts: "contracts",
}

export function useValidateImport(module: ImportModuleKey) {
  return useMutation({
    mutationFn: (file: File) => importService.validate(module, file),
  })
}

export function useCommitImport(module: ImportModuleKey) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => importService.commit(module, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODULE_QUERY_PREFIX[module]] })
    },
  })
}

export function useImportSession(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.importSession(id),
    queryFn: () => importService.getSession(id),
    enabled: options?.enabled ?? !!id,
  })
}
