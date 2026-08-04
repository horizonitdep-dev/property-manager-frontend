"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { contractDocumentService } from "@/services/contract-document-service"
import { contractService } from "@/services/contract-service"
import type {
  ContractDocumentType,
  ContractsQuery,
  CreateContractDto,
  RenewContractDto,
  TerminateContractDto,
  UpdateContractDto,
} from "@/types/contract"

export function useContracts(query: ContractsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.contracts(query),
    queryFn: () => contractService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useContract(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.contract(id),
    queryFn: () => contractService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

export function usePropertyContracts(propertyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.contractsByProperty(propertyId),
    queryFn: () => contractService.listByProperty(propertyId),
    enabled: options?.enabled ?? !!propertyId,
  })
}

export function useTenantContracts(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.contractsByTenant(tenantId),
    queryFn: () => contractService.listByTenant(tenantId),
    enabled: options?.enabled ?? !!tenantId,
  })
}

// Contracts drive property occupancy, so every mutation that can flip a
// property's Occupied/Vacant status invalidates both query families.
function invalidateContractQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["contracts"] })
  queryClient.invalidateQueries({ queryKey: ["properties"] })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateContractDto) => contractService.create(dto),
    onSuccess: () => invalidateContractQueries(queryClient),
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContractDto }) => contractService.update(id, dto),
    onSuccess: () => invalidateContractQueries(queryClient),
  })
}

export function useRenewContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RenewContractDto }) => contractService.renew(id, dto),
    onSuccess: () => invalidateContractQueries(queryClient),
  })
}

export function useTerminateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: TerminateContractDto }) => contractService.terminate(id, dto),
    onSuccess: () => invalidateContractQueries(queryClient),
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractService.remove(id),
    onSuccess: () => invalidateContractQueries(queryClient),
  })
}

export function useContractDocuments(contractId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.contractDocuments(contractId),
    queryFn: () => contractDocumentService.list(contractId),
    enabled: options?.enabled ?? !!contractId,
  })
}

export function useUploadContractDocument(contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentType,
      file,
      onUploadProgress,
    }: {
      documentType: ContractDocumentType
      file: File
      onUploadProgress?: (percent: number) => void
    }) => contractDocumentService.upload(contractId, documentType, file, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contractDocuments(contractId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contract(contractId) })
    },
  })
}

export function useDeleteContractDocument(contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => contractDocumentService.remove(contractId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contractDocuments(contractId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contract(contractId) })
    },
  })
}
