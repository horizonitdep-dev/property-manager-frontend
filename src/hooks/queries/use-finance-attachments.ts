"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { financeAttachmentService, type FinanceParent } from "@/services/finance-attachment-service"
import type { FinanceAttachmentType } from "@/types/finance"

function attachmentsKey(parent: FinanceParent, parentId: string) {
  return QUERY_KEYS.finance[parent].attachments(parentId)
}

function detailKey(parent: FinanceParent, parentId: string) {
  return QUERY_KEYS.finance[parent].detail(parentId)
}

export function useFinanceAttachments(
  parent: FinanceParent,
  parentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attachmentsKey(parent, parentId),
    queryFn: () => financeAttachmentService.list(parent, parentId),
    enabled: options?.enabled ?? !!parentId,
  })
}

export function useUploadFinanceAttachment(parent: FinanceParent, parentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      type,
      onUploadProgress,
    }: {
      file: File
      type?: FinanceAttachmentType
      onUploadProgress?: (percent: number) => void
    }) => financeAttachmentService.upload(parent, parentId, file, type, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(parent, parentId) })
      queryClient.invalidateQueries({ queryKey: detailKey(parent, parentId) })
    },
  })
}

export function useDeleteFinanceAttachment(parent: FinanceParent, parentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => financeAttachmentService.remove(parent, parentId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(parent, parentId) })
      queryClient.invalidateQueries({ queryKey: detailKey(parent, parentId) })
    },
  })
}
