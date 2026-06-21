'use strict';

const { randomUUID } = require('node:crypto');

const ADMIN_AUTH_HEADER = 'Authorization';
const IDEMPOTENCY_HEADER = 'Idempotency-Key';
const REQUEST_ID_HEADER = 'x-request-id';

const adminRoutes = Object.freeze({
  health: '/health',
  invoices: '/api/admin/invoices',
  payouts: '/api/admin/payouts',
  paymentIssues: '/api/admin/payment-issues',
  paymentProviders: '/api/admin/payment-providers',
  providerHealth: '/api/admin/payment-providers/health',
  queues: '/api/admin/queues',
  deadLetters: '/api/admin/dead-letters',
  webhooks: '/api/admin/webhooks',
  reconciliationRun: '/api/admin/reconciliation/run',
});

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') {
      return;
    }
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

function buildApiUrl(baseUrl, path, params = {}) {
  const normalizedBase = String(baseUrl || '').replace(/\/+$/, '');
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}${buildQuery(params)}`;
}

function createMutationIdempotencyKey(path, body = {}) {
  const bodyHint =
    body && typeof body === 'object'
      ? [body.id, body.invoiceId, body.payoutId, body.batchId, body.action].filter(Boolean).join(':')
      : '';
  const safePath = String(path || 'mutation').replace(/[^a-zA-Z0-9:_/-]/g, '-');
  return `bot:${safePath}:${bodyHint || randomUUID()}:${randomUUID()}`;
}

class ApiContractError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiContractError';
    this.code = 'API_CONTRACT_MISMATCH';
    this.details = details;
    this.userMessage = 'API response did not match the bot contract. Please check API deployment compatibility.';
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function formatPath(pathParts = []) {
  if (!pathParts.length) return '$';
  return pathParts
    .map((part, index) => (typeof part === 'number' ? `[${part}]` : index === 0 ? part : `.${part}`))
    .join('');
}

function describeRule(rule = {}) {
  if (typeof rule === 'string') return rule;
  if (Array.isArray(rule.oneOf)) return rule.oneOf.join(' | ');
  return rule.type || 'any';
}

function assertRule(condition, message, context) {
  if (!condition) {
    throw new ApiContractError(message, context);
  }
}

function validateRule(value, rule = {}, pathParts = [], context = {}) {
  const normalizedRule = typeof rule === 'string' ? { type: rule } : rule || {};
  const path = formatPath(pathParts);

  if (value === undefined) {
    if (normalizedRule.optional) return;
    throw new ApiContractError(`Missing API response field: ${path}`, { ...context, path, expected: describeRule(normalizedRule) });
  }

  if (value === null) {
    if (normalizedRule.allowNull) return;
    throw new ApiContractError(`Unexpected null API response field: ${path}`, { ...context, path, expected: describeRule(normalizedRule) });
  }

  if (Array.isArray(normalizedRule.oneOf) && normalizedRule.oneOf.length > 0) {
    assertRule(
      normalizedRule.oneOf.includes(value),
      `Unexpected API response value at ${path}`,
      { ...context, path, expected: normalizedRule.oneOf.join(' | ') },
    );
  }

  const type = normalizedRule.type || (normalizedRule.fields || normalizedRule.required ? 'object' : 'any');
  if (type === 'any') return;
  if (type === 'array') {
    assertRule(Array.isArray(value), `Unexpected API response type at ${path}`, { ...context, path, expected: 'array' });
    if (normalizedRule.items) {
      value.forEach((item, index) => validateRule(item, normalizedRule.items, [...pathParts, index], context));
    }
    return;
  }
  if (type === 'object') {
    assertRule(isPlainObject(value), `Unexpected API response type at ${path}`, { ...context, path, expected: 'object' });
    (normalizedRule.required || []).forEach((key) => {
      validateRule(value[key], { type: 'any' }, [...pathParts, key], context);
    });
    Object.entries(normalizedRule.fields || {}).forEach(([key, fieldRule]) => {
      validateRule(value[key], fieldRule, [...pathParts, key], context);
    });
    return;
  }
  assertRule(typeof value === type, `Unexpected API response type at ${path}`, { ...context, path, expected: type });
}

function validateApiResponseContract(data, contract, context = {}) {
  if (!contract) return data;
  validateRule(data, contract, [], context);
  return data;
}

const contractShapes = Object.freeze({
  okObject: { type: 'object' },
  dataArray: {
    type: 'object',
    fields: {
      data: { type: 'array' },
    },
  },
  paginatedData: {
    type: 'object',
    fields: {
      data: { type: 'array' },
      pagination: { type: 'object', optional: true },
    },
  },
  providerList: {
    type: 'object',
    fields: {
      data: { type: 'array' },
      providers: { type: 'array', optional: true },
    },
  },
  health: {
    type: 'object',
    fields: {
      ok: { type: 'boolean', optional: true },
      status: { type: 'string', optional: true },
    },
  },
});

module.exports = {
  ADMIN_AUTH_HEADER,
  ApiContractError,
  IDEMPOTENCY_HEADER,
  REQUEST_ID_HEADER,
  adminRoutes,
  buildApiUrl,
  buildQuery,
  contractShapes,
  createMutationIdempotencyKey,
  validateApiResponseContract,
};
