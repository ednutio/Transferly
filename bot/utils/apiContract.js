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

module.exports = {
  ADMIN_AUTH_HEADER,
  IDEMPOTENCY_HEADER,
  REQUEST_ID_HEADER,
  adminRoutes,
  buildApiUrl,
  buildQuery,
  createMutationIdempotencyKey,
};
