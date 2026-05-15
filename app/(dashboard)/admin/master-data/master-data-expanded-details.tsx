"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw } from 'lucide-react';

/** Built-in master types with dedicated API routes and custom UI. */
export const STATIC_MASTER_TYPE_CODES = [
  'CATEGORY',
  'SUBCATEGORY',
  'HOLIDAY',
  'DEPARTMENT',
  'PRIORITY',
  'SEVERITY',
  'SOURCE',
  'EMAIL_CONFIG',
  'SLA_CONFIG',
] as const;

export type StaticMasterTypeCode = (typeof STATIC_MASTER_TYPE_CODES)[number];

export function isDynamicMasterType(code: string | undefined | null): boolean {
  return !!code && !STATIC_MASTER_TYPE_CODES.includes(code as StaticMasterTypeCode);
}

/** API endpoint for fetching a single item's full details when a row is expanded. */
export function getMasterDataDetailEndpoint(
  masterTypeCode: string | undefined,
  itemId: string
): string {
  switch (masterTypeCode) {
    case 'DEPARTMENT':
      return `/api/departments/${itemId}`;
    case 'CATEGORY':
      return `/api/categories/${itemId}`;
    case 'SUBCATEGORY':
      return `/api/subcategories/${itemId}`;
    case 'HOLIDAY':
      return `/api/holidays/${itemId}`;
    default:
      return `/api/masterdata/${itemId}`;
  }
}

/**
 * Fields returned by POST/GET masterdata API — only these are shown for dynamic types.
 * @see app/api/masterdata/route.ts
 */
/** Display order matches masterdata API payload — nothing extra. */
export const MASTERDATA_API_FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  code: 'Code',
  sortOrder: 'Sort Order',
  isActive: 'Is Active',
  departmentId: 'Department',
};

export interface DetailFieldRow {
  key: string;
  label: string;
  value: React.ReactNode;
}

/** Unwrap backend `elements` wrapper without mixing in nested masterType fields. */
export function unwrapApiPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  let obj = data as Record<string, unknown>;
  if (obj.elements && typeof obj.elements === 'object' && !Array.isArray(obj.elements)) {
    obj = obj.elements as Record<string, unknown>;
  }
  return obj;
}

const getToken = () =>
  typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchDepartmentName(departmentId: string): Promise<string> {
  const res = await fetch(`/api/departments/${departmentId}`, { headers: authHeaders() });
  const result = await res.json();
  if (!res.ok || !result.success) return '-';
  const dept = unwrapApiPayload(result.data);
  return dept.name ? String(dept.name) : '-';
}

async function fetchDetailPayload(
  itemId: string,
  masterTypeCode: string | undefined
): Promise<Record<string, unknown>> {
  const endpoint = getMasterDataDetailEndpoint(masterTypeCode, itemId);
  const res = await fetch(endpoint, { headers: authHeaders() });
  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.error || 'Failed to load details');
  }

  return unwrapApiPayload(result.data);
}

/** Single label/value row — shared styling for every expanded master-data item. */
export function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1 text-base">{value}</div>
    </div>
  );
}

function formatFieldValue(
  apiKey: string,
  value: unknown,
  departmentName?: string
): React.ReactNode {
  if (apiKey === 'departmentId') {
    return departmentName || '-';
  }
  if (apiKey === 'isActive') {
    const active = value === true;
    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Active' : 'Inactive'}
      </Badge>
    );
  }
  if (apiKey === 'id') {
    return <span className="font-mono">{String(value)}</span>;
  }
  return String(value);
}

/**
 * Renders only fields present in the API payload (masterdata POST/GET shape).
 * Department shows name fetched from /api/departments/{id}, not the raw UUID.
 */
export function buildFieldsFromPayload(
  raw: Record<string, unknown>,
  departmentName?: string
): DetailFieldRow[] {
  const fields: DetailFieldRow[] = [];

  for (const [apiKey, label] of Object.entries(MASTERDATA_API_FIELD_LABELS)) {
    if (!(apiKey in raw)) continue;
    const value = raw[apiKey];
    if (value === undefined || value === null) continue;

    fields.push({
      key: apiKey,
      label,
      value: formatFieldValue(apiKey, value, departmentName),
    });
  }

  return fields;
}

export function MasterDataExpandedDetails({
  itemId,
  masterTypeCode,
}: {
  itemId: string;
  masterTypeCode?: string;
}) {
  const [fields, setFields] = useState<DetailFieldRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const raw = await fetchDetailPayload(itemId, masterTypeCode);

        let departmentName: string | undefined;
        if (raw.departmentId != null && String(raw.departmentId)) {
          departmentName = await fetchDepartmentName(String(raw.departmentId));
        }

        const rows = buildFieldsFromPayload(raw, departmentName);

        if (!cancelled) setFields(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load details');
          setFields([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [itemId, masterTypeCode]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading details…</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">No details returned from API.</p>;
  }

  return (
    <div className="flex flex-col gap-4 text-base">
      {fields.map((field) => (
        <DetailField key={field.key} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
