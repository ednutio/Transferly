const { handlePublicCallback } = require("./public");
const { handleServiceCallback } = require("./services");
const { handlePaymentCallback } = require("./payments");
const { handleUserCallback } = require("./users");

function recordCallbackAnalytics(deps, ctx, action, status = "ok", details = {}) {
  deps.recordAnalytics?.(ctx, action || "callback", "callback", status, details);
}

async function routeCallback(route, handler, ctx, action, deps, startedAt) {
  const handled = await handler(ctx, action, deps);
  if (handled) {
    recordCallbackAnalytics(deps, ctx, action, "ok", {
      route,
      durationMs: Date.now() - startedAt,
    });
  }
  return handled;
}

function registerCallbackRouter(bot, deps) {
  bot.on("callback_query:data", deps.wrap(async (ctx) => {
    const startedAt = Date.now();
    const validation = deps.validateCallback(ctx, ctx.callbackQuery.data);
    if (validation.status !== "ok") {
      recordCallbackAnalytics(deps, ctx, validation.action || "callback_validation", validation.status || "invalid", {
        reason: validation.reason || validation.status || "validation_failed",
        durationMs: Date.now() - startedAt,
      });
      await ctx.answerCallbackQuery({ text: "This menu expired. Use /menu.", show_alert: false });
      await deps.deleteOrDisableMessage(
        ctx,
        ctx.callbackQuery.message?.chat?.id,
        ctx.callbackQuery.message?.message_id,
      );
      await deps.recoverCallback?.(ctx, validation);
      return;
    }

    const action = validation.action;
    await ctx.answerCallbackQuery();

    try {
      if (action === "BACK") {
        await deps.handlers.handleBack(ctx);
        recordCallbackAnalytics(deps, ctx, action, "ok", {
          route: "navigation",
          durationMs: Date.now() - startedAt,
        });
        return;
      }

      const requiredCapability = deps.getActionCapability(action);
      if (!(await deps.requireCapability(ctx, requiredCapability, action.toLowerCase()))) {
        recordCallbackAnalytics(deps, ctx, action, "blocked", {
          capability: requiredCapability,
          durationMs: Date.now() - startedAt,
        });
        return;
      }

      deps.prepareNavigationAction?.(ctx, action);

      if (await routeCallback("service", handleServiceCallback, ctx, action, deps, startedAt)) return;
      if (await routeCallback("payment", handlePaymentCallback, ctx, action, deps, startedAt)) return;
      if (await routeCallback("user", handleUserCallback, ctx, action, deps, startedAt)) return;
      if (await routeCallback("public", handlePublicCallback, ctx, action, deps, startedAt)) return;

      recordCallbackAnalytics(deps, ctx, action, "unknown", {
        durationMs: Date.now() - startedAt,
      });
      await deps.replyHtml(ctx, "Unknown Transferly action. Use /menu to start again.", deps.buildBackKeyboard(ctx));
    } catch (error) {
      recordCallbackAnalytics(deps, ctx, action, "error", {
        message: error?.message || "callback failed",
        requestId: error?.apiContext?.requestId,
        durationMs: Date.now() - startedAt,
      });
      throw error;
    }
  }, "callback"));
}

module.exports = {
  registerCallbackRouter,
};
