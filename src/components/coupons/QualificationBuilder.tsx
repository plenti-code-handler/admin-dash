'use client';

import { useEffect, useMemo, useState } from 'react';
import { QueryBuilder, type Field, type RuleGroupType, type RuleType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import type {
  QualificationField,
  QualificationGroup,
  QualificationOperator,
  QualificationRule,
} from '@/types/coupon';

export const EMPTY_QUALIFICATION_QUERY: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

type LocationOption = { name: string; label: string };

let cachedServiceLocations: LocationOption[] | null = null;

function getQualificationFields(serviceLocations: LocationOption[]): Field[] {
  return [
    {
      name: 'new_user',
      label: 'New user',
      valueEditorType: 'checkbox',
      defaultValue: true,
      operators: [{ name: '=', value: '=', label: 'is' }],
    },
    {
      name: 'order_count',
      label: 'Order count',
      inputType: 'number',
      defaultValue: 0,
      operators: [
        { name: '<', value: '<', label: '<' },
        { name: '<=', value: '<=', label: '<=' },
        { name: '=', value: '=', label: '=' },
        { name: '>=', value: '>=', label: '>=' },
        { name: '>', value: '>', label: '>' },
      ],
    },
    {
      name: 'service_location',
      label: 'Service location',
      valueEditorType: 'select',
      values: serviceLocations,
      defaultOperator: 'in',
      defaultValue: serviceLocations[0]?.name ?? '',
      operators: [
        { name: 'in', value: 'in', label: 'in' },
        { name: 'notIn', value: 'notIn', label: 'not in' },
      ],
    },
  ];
}

function isGroup(node: RuleType | RuleGroupType): node is RuleGroupType {
  return Array.isArray((node as RuleGroupType).rules);
}

export function isEmptyQualification(
  query: RuleGroupType | QualificationGroup | null | undefined
): boolean {
  return !query || !Array.isArray(query.rules) || query.rules.length === 0;
}

function normalizeNode(node: RuleType | RuleGroupType): QualificationRule | QualificationGroup | null {
  if (isGroup(node)) {
    const rules = (node.rules || [])
      .map((rule: RuleType | RuleGroupType | string) => {
        if (typeof rule === 'string') return null;
        return normalizeNode(rule);
      })
      .filter((rule): rule is QualificationRule | QualificationGroup => rule != null);
    if (!rules.length) return null;
    return {
      combinator: node.combinator === 'or' ? 'or' : 'and',
      rules,
    };
  }

  const field = node.field as QualificationField;
  const operator = node.operator as QualificationOperator;
  const rawValue = node.value as unknown;
  let value: QualificationRule['value'] = rawValue as QualificationRule['value'];

  if (field === 'new_user') {
    value = rawValue === true || rawValue === 'true' || rawValue === 1 || rawValue === '1';
  } else if (field === 'order_count') {
    const parsed = Number(rawValue);
    value = Number.isFinite(parsed) ? parsed : 0;
  } else if (field === 'service_location') {
    if (typeof rawValue === 'string') {
      value = rawValue.trim() ? [rawValue.trim()] : [];
    } else if (Array.isArray(rawValue)) {
      value = rawValue.map((part) => String(part).trim()).filter(Boolean);
    } else {
      value = rawValue == null ? [] : [String(rawValue)];
    }
    if (!value.length) return null;
  }

  return { field, operator, value };
}

export function toStoredQualification(
  query: RuleGroupType | QualificationGroup | null | undefined
): QualificationGroup | null {
  if (isEmptyQualification(query)) return null;
  const stored = normalizeNode(query as RuleGroupType);
  if (!stored || !('rules' in stored) || !stored.rules.length) return null;
  return stored;
}

export function fromStoredQualification(
  qualification: QualificationGroup | null | undefined
): RuleGroupType {
  if (!qualification) {
    return { combinator: 'and', rules: [] };
  }
  if (isEmptyQualification(qualification)) {
    return { combinator: 'and', rules: [] };
  }

  const hydrate = (node: QualificationRule | QualificationGroup): RuleType | RuleGroupType => {
    if ('rules' in node) {
      return {
        combinator: node.combinator,
        rules: node.rules.map(hydrate),
      };
    }
    if (node.field === 'service_location' && Array.isArray(node.value)) {
      return { ...node, value: node.value[0] ?? '' };
    }
    return node as RuleType;
  };

  return hydrate(qualification) as RuleGroupType;
}

interface QualificationBuilderProps {
  query: RuleGroupType;
  onChange: (query: RuleGroupType) => void;
  hint?: string;
}

export default function QualificationBuilder({
  query,
  onChange,
  hint = 'Leave empty for no extra rules.',
}: QualificationBuilderProps) {
  const [serviceLocations, setServiceLocations] = useState<LocationOption[]>(
    cachedServiceLocations ?? []
  );
  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedServiceLocations) {
      setServiceLocations(cachedServiceLocations);
      return;
    }

    let cancelled = false;
    const loadLocations = async () => {
      try {
        const locations = await api.get<{ id: string; location: string }[]>(
          '/v1/superuser/location/serviceable'
        );
        const options = (locations || []).map((location) => ({
          name: location.location,
          label: location.location,
        }));
        cachedServiceLocations = options;
        if (!cancelled) {
          setServiceLocations(options);
          setLocationsError(null);
        }
      } catch (error) {
        logger.error('Error loading serviceable locations:', error);
        if (!cancelled) {
          setLocationsError('Could not load service locations');
        }
      }
    };

    loadLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const fields = useMemo(() => getQualificationFields(serviceLocations), [serviceLocations]);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
        <span>Qualification</span>
        <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
      </label>
      <p className="mb-2 text-xs text-gray-500">{hint}</p>
      {locationsError ? (
        <p className="mb-2 text-xs text-red-600">{locationsError}</p>
      ) : null}
      <div className="qualification-query-builder overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-3">
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={onChange}
          listsAsArrays
          controlClassnames={{
            queryBuilder: 'queryBuilder-branches',
          }}
        />
      </div>
    </div>
  );
}
