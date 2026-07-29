"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { tenantDocumentService } from "@/services/tenant-document-service"
import { tenantService } from "@/services/tenant-service"
import type { CreateTenantDto, DocumentType, TenantsQuery, UpdateTenantDto } from "@/types/tenant"

export function useTenants(query: TenantsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.tenants(query),
    queryFn: () => tenantService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useTenant(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.tenant(id),
    queryFn: () => tenantService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

function invalidateTenantQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["tenants"] })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTenantDto) => tenantService.create(dto),
    onSuccess: () => invalidateTenantQueries(queryClient),
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTenantDto }) => tenantService.update(id, dto),
    onSuccess: () => invalidateTenantQueries(queryClient),
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantService.remove(id),
    onSuccess: () => invalidateTenantQueries(queryClient),
  })
}

export function useTenantDocuments(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantDocuments(tenantId),
    queryFn: () => tenantDocumentService.list(tenantId),
    enabled: options?.enabled ?? !!tenantId,
  })
}

export function useUploadDocument(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentType,
      file,
      onUploadProgress,
    }: {
      documentType: DocumentType
      file: File
      onUploadProgress?: (percent: number) => void
    }) => tenantDocumentService.upload(tenantId, documentType, file, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantDocuments(tenantId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenant(tenantId) })
    },
  })
}

export function useDeleteDocument(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => tenantDocumentService.remove(tenantId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantDocuments(tenantId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenant(tenantId) })
    },
  })
}
