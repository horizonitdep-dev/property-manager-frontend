"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { propertyService } from "@/services/property-service"
import type { CreatePropertyDto, PropertiesQuery, UpdatePropertyDto } from "@/types/property"

export function useProperties(query: PropertiesQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.properties(query),
    queryFn: () => propertyService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useProperty(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.property(id),
    queryFn: () => propertyService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

export function usePropertiesByBuilding(buildingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.propertiesByBuilding(buildingId),
    queryFn: () => propertyService.listByBuilding(buildingId),
    enabled: options?.enabled ?? !!buildingId,
  })
}

function invalidatePropertyQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["properties"] })
  queryClient.invalidateQueries({ queryKey: ["buildings"] })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePropertyDto) => propertyService.create(dto),
    onSuccess: () => invalidatePropertyQueries(queryClient),
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePropertyDto }) => propertyService.update(id, dto),
    onSuccess: () => invalidatePropertyQueries(queryClient),
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => propertyService.remove(id),
    onSuccess: () => invalidatePropertyQueries(queryClient),
  })
}
