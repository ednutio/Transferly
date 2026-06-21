const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ApiContractError,
  IDEMPOTENCY_HEADER,
  adminRoutes,
  buildApiUrl,
  buildQuery,
  contractShapes,
  createMutationIdempotencyKey,
  validateApiResponseContract,
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

test("API response contracts accept expected shapes", () => {
  assert.doesNotThrow(() =>
    validateApiResponseContract(
      { data: [], pagination: { page: 1, total: 0 } },
      contractShapes.paginatedData,
      { method: "GET", url: "/api/admin/invoices", requestId: "req-contract" },
    ),
  );

  assert.doesNotThrow(() =>
    validateApiResponseContract(
      { ok: true, status: "healthy" },
      contractShapes.health,
      { method: "GET", url: "/health" },
    ),
  );
});

test("API response contracts fail with safe operator diagnostics", () => {
  assert.throws(
    () =>
      validateApiResponseContract(
        { pagination: {} },
        contractShapes.paginatedData,
        { method: "GET", url: "/api/admin/invoices", requestId: "req-bad" },
      ),
    (error) => {
      assert.ok(error instanceof ApiContractError);
      assert.equal(error.code, "API_CONTRACT_MISMATCH");
      assert.equal(error.details.path, "data");
      assert.equal(error.details.method, "GET");
      assert.equal(error.details.requestId, "req-bad");
      assert.match(error.userMessage, /bot contract/i);
      return true;
    },
  );
});
