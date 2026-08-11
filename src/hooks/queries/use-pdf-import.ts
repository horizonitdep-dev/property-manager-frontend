"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { pdfImportService, type PdfImportCommitPayload } from "@/services/pdf-import-service"

// A PDF batch can touch any of the four modules, so unlike the CSV commit
// (which only invalidates its one target module), this invalidates all four.
const ALL_MODULE_QUERY_PREFIXES = ["buildings", "properties", "tenants", "contracts"]

export function useValidatePdfImport() {
  return useMutation({
    mutationFn: (files: File[]) => pdfImportService.validate(files),
  })
}

export function useCommitPdfImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PdfImportCommitPayload) => pdfImportService.commit(payload),
    onSuccess: () => {
      for (const prefix of ALL_MODULE_QUERY_PREFIXES) {
        queryClient.invalidateQueries({ queryKey: [prefix] })
      }
    },
  })
}

export function usePdfImportSession(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.pdfImportSession(id),
    queryFn: () => pdfImportService.getSession(id),
    enabled: options?.enabled ?? !!id,
  })
}
