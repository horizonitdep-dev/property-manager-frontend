"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { greenContractImportService } from "@/services/green-contract-import-service"

// A Green Contract batch can create rows in any of the four modules.
const ALL_MODULE_QUERY_PREFIXES = ["buildings", "properties", "tenants", "contracts"]

export function useValidateGreenContractImport() {
  return useMutation({
    mutationFn: (files: File[]) => greenContractImportService.validate(files),
  })
}

export function useCommitGreenContractImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => greenContractImportService.commit(sessionId),
    onSuccess: () => {
      for (const prefix of ALL_MODULE_QUERY_PREFIXES) {
        queryClient.invalidateQueries({ queryKey: [prefix] })
      }
    },
  })
}

export function useGreenContractImportSession(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.greenContractImportSession(id),
    queryFn: () => greenContractImportService.getSession(id),
    enabled: options?.enabled ?? !!id,
  })
}
