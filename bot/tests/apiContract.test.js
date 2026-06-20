const assert = require("node:assert/strict");
const test = require("node:test");

const {
  IDEMPOTENCY_HEADER,
  adminRoutes,
  buildApiUrl,
  buildQuery,
  createMutationIdempotencyKey,
} = require("../utils/apiContract");

test("API contract exposes the API idempotency header required by Express middleware", () => {
  assert.equal(IDEMPOTENCY_HEADER, "Idempotency-Key");
});

test("buildApiUrl skips empty query values and keeps valid filters", () => {
  const url = buildApiUrl("https://api.transferly.example/", adminRoutes.webhooks, {
    provider: "paypal",
    limit: 10,
    status: "ALL",
    empty: "",
    missing: undefined,
  });

  assert.equal(url, "https://api.transferly.example/api/admin/webhooks?provider=paypal&limit=10");
  assert.equal(buildQuery({ status: "OPEN" }), "?status=OPEN");
});

test("mutation idempotency keys include the bot actor, route, and known entity hint", () => {
  const key = createMutationIdempotencyKey("/api/admin/payouts/payout-1/approve", {
    payoutId: "payout-1",
  });

  assert.match(key, /^bot:\/api\/admin\/payouts\/payout-1\/approve:payout-1:/);
});
