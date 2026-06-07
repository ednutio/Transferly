import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bitcoin,
  Building2,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  WalletCards
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { useTelegramMiniApp } from '../context/TelegramMiniAppContext';
import { serviceCatalog } from '../lib/servicesCatalog';

const fundingMethods = [
  {
    id: 'bank-transfer',
    title: 'Bank Transfer (P2P)',
    subtitle: 'Nigerian Naira Only',
    description: 'Buy points from verified vendors via direct bank transfer. Best rates for NGN payments.',
    metrics: ['5-30 min', 'P2P'],
    icon: Building2,
    vendorUrl: 'https://t.me/+DhQqLRVqOHpmMmQ0',
    instructions: 'Create the order, send bank transfer proof to the Telegram vendor chat, then wait for points release confirmation.'
  },
  {
    id: 'crypto-payment',
    title: 'Crypto Payment',
    subtitle: 'Automatic & Instant',
    description: 'Pay with Bitcoin, USDT, Ethereum, 70+ cryptocurrencies. Points are credited instantly after confirmation.',
    metrics: ['Instant', 'Secure'],
    icon: Bitcoin,
    vendorUrl: 'https://t.me/+DhQqLRVqOHpmMmQ0',
    instructions: 'Confirm the wallet and amount with support, then share the transaction hash for instant release tracking.'
  }
];

const packOptions = [50, 100, 250, 500];

function statusLabel(status) {
  return String(status || 'pending').replace(/_/g, ' ');
}

function formatDate(value) {
  if (!value) {
    return 'Just now';
  }

  return new Date(value).toLocaleString();
}

function serviceOptions() {
  return [
    { slug: '', title: 'General balance', description: 'Flexible points for any receipt or support workflow.' },
    ...serviceCatalog
      .filter((service) => service.status === 'available')
      .slice(0, 8)
      .map((service) => ({
        slug: service.slug,
        title: service.title,
        description: service.category
      }))
  ];
}

function PillStat({ label, value, tone = 'default' }) {
  const toneClass = tone === 'accent'
    ? 'bg-[color-mix(in_srgb,var(--tg-button-color)_14%,var(--tg-section-bg-color))]'
    : 'bg-[var(--tg-secondary-bg-color)]';

  return (
    <div className={`rounded-[22px] px-4 py-3 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">{label}</p>
      <p className="mt-1 text-xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{value}</p>
    </div>
  );
}

function MethodCard({ method, active, onSelect }) {
  const Icon = method.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-[188px] rounded-[26px] p-5 text-left shadow-sm transition active:scale-[0.99] ${
        active
          ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
          : 'bg-[var(--tg-section-bg-color)] text-[var(--tg-text-color)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${
          active ? 'bg-white/[0.16]' : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-button-color)]'
        }`}>
          <Icon size={24} />
        </div>
        {active ? <CheckCircle2 size={19} /> : <ArrowRight size={18} className="text-[var(--tg-hint-color)]" />}
      </div>
      <h3 className="mt-4 text-lg font-black tracking-[-0.03em]">{method.title}</h3>
      <p className={`mt-1 text-xs font-bold ${active ? 'text-white/[0.72]' : 'text-[var(--tg-hint-color)]'}`}>{method.subtitle}</p>
      <p className={`mt-3 text-sm leading-6 ${active ? 'text-white/[0.78]' : 'text-[var(--tg-subtitle-text-color)]'}`}>
        {method.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {method.metrics.map((metric) => (
          <span
            key={metric}
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              active ? 'bg-white/[0.16] text-white' : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-hint-color)]'
            }`}
          >
            {metric}
          </span>
        ))}
      </div>
    </button>
  );
}

function OrderRow({ order, onMarkPaid, markingPaid }) {
  const isPending = order.status === 'pending';

  return (
    <article className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[var(--tg-text-color)]">{order.order_id || order.id}</p>
          <p className="mt-1 text-xs font-bold capitalize text-[var(--tg-hint-color)]">{statusLabel(order.status)}</p>
        </div>
        <span className="rounded-full bg-[var(--tg-section-bg-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--tg-hint-color)]">
          {order.amount_label || `${Number(order.points || 0).toLocaleString()} pts`}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-xs font-bold text-[var(--tg-subtitle-text-color)] sm:grid-cols-2">
        <span>{order.method_title || 'Funding method'}</span>
        <span>{formatDate(order.created_at)}</span>
      </div>
      {isPending ? (
        <button
          type="button"
          onClick={() => onMarkPaid(order)}
          disabled={markingPaid}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--tg-section-bg-color)] px-4 py-3 text-sm font-black text-[var(--tg-text-color)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BadgeCheck size={16} />
          I have paid
        </button>
      ) : null}
    </article>
  );
}

export default function MiniAppPointsWallet() {
  const {
    config,
    createTopUpOrder,
    profile,
    topUpOrders,
    updateTopUpOrderStatus,
    user
  } = useAppContext();
  const telegram = useTelegramMiniApp();
  const services = useMemo(serviceOptions, []);
  const [selectedMethodId, setSelectedMethodId] = useState(fundingMethods[0].id);
  const [selectedPoints, setSelectedPoints] = useState(100);
  const [customPoints, setCustomPoints] = useState('');
  const [serviceIntent, setServiceIntent] = useState('');
  const [creating, setCreating] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const selectedMethod = fundingMethods.find((method) => method.id === selectedMethodId) || fundingMethods[0];
  const selectedService = services.find((service) => service.slug === serviceIntent) || services[0];
  const activePoints = customPoints ? Number(customPoints) : Number(selectedPoints);
  const authenticated = Boolean(user?.id);
  const pendingOrders = topUpOrders.filter((order) => order.status === 'pending');
  const awaitingOrders = topUpOrders.filter((order) => order.status === 'awaiting_confirmation');
  const completedOrders = topUpOrders.filter((order) => order.status === 'completed');
  const latestOrders = topUpOrders.slice(0, 3);
  const amountLabel = `${Number(activePoints || 0).toLocaleString()} pts`;

  const canCreate = authenticated && !creating && activePoints >= 5;

  const selectPoints = (points) => {
    setSelectedPoints(points);
    setCustomPoints('');
    telegram.impact('light');
  };

  const createOrder = useCallback(async () => {
    if (creating) {
      return;
    }

    if (!authenticated) {
      toast.error('Sign in or open from Telegram to create a funding order');
      telegram.notify('error');
      return;
    }

    if (!activePoints || activePoints < 5) {
      toast.error('Choose at least 5 points');
      telegram.impact('light');
      return;
    }

    setCreating(true);
    telegram.impact('medium');
    telegram.webApp?.MainButton?.showProgress?.();

    try {
      const result = await createTopUpOrder({
        points: activePoints,
        amountLabel,
        methodId: selectedMethod.id,
        methodTitle: selectedMethod.title,
        serviceIntent,
        instructions: selectedMethod.instructions,
        vendorUrl: selectedMethod.vendorUrl,
        notes: selectedService?.title ? `Mini App wallet order for ${selectedService.title}` : 'Mini App wallet order'
      });

      if (!result.success) {
        toast.error(result.message || 'Unable to create order');
        telegram.notify('error');
        return;
      }

      toast.success('Point order created');
      telegram.notify('success');
    } catch (_error) {
      toast.error('Unable to create order');
      telegram.notify('error');
    } finally {
      setCreating(false);
      telegram.webApp?.MainButton?.hideProgress?.();
    }
  }, [activePoints, amountLabel, authenticated, createTopUpOrder, creating, selectedMethod, selectedService?.title, serviceIntent, telegram]);

  const markPaid = async (order) => {
    if (!order?.order_id || markingPaid) {
      return;
    }

    setMarkingPaid(true);
    telegram.impact('medium');

    const result = await updateTopUpOrderStatus(order.order_id, 'awaiting_confirmation');
    setMarkingPaid(false);

    if (!result.success) {
      toast.error(result.message || 'Unable to update order');
      telegram.notify('error');
      return;
    }

    toast.success('Order marked as awaiting confirmation');
    telegram.notify('success');
  };

  useEffect(() => {
    const button = telegram.webApp?.MainButton;
    if (!button) {
      return undefined;
    }

    button.setText?.(creating ? 'Creating Order' : 'Create Point Order');
    if (canCreate) {
      button.enable?.();
    } else {
      button.disable?.();
    }
    button.show?.();
    button.onClick?.(createOrder);

    return () => {
      button.offClick?.(createOrder);
      button.hideProgress?.();
      button.hide?.();
    };
  }, [canCreate, createOrder, creating, telegram.webApp]);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[30px] bg-[var(--tg-section-bg-color)] shadow-sm">
        <div className="relative p-5">
          <div className="absolute right-[-44px] top-[-54px] h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--tg-button-color)_24%,transparent)] blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Buy Points</p>
              <h2 className="mt-3 text-5xl font-black leading-none tracking-[-0.06em] text-[var(--tg-text-color)]">
                {Number(profile?.points || 0).toLocaleString()}
              </h2>
              <p className="mt-2 text-sm font-bold text-[var(--tg-subtitle-text-color)]">points ready to spend</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
              <WalletCards size={34} />
            </div>
          </div>

          <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
            <PillStat label="Pending" value={pendingOrders.length.toLocaleString()} tone="accent" />
            <PillStat label="Awaiting" value={awaitingOrders.length.toLocaleString()} />
            <PillStat label="Completed" value={completedOrders.length.toLocaleString()} />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]">
            <Banknote size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Buy Points</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{amountLabel}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--tg-subtitle-text-color)]">
              Pick a point pack, choose a funding method, then use the Telegram button to create the point order.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {packOptions.map((points) => (
            <button
              key={points}
              type="button"
              onClick={() => selectPoints(points)}
              className={`h-20 rounded-[20px] text-left transition active:scale-[0.99] ${
                !customPoints && activePoints === points
                  ? 'bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]'
                  : 'bg-[var(--tg-secondary-bg-color)] text-[var(--tg-text-color)]'
              }`}
            >
              <span className="block px-4 text-[10px] font-black uppercase tracking-[0.13em] text-current opacity-70">Pack</span>
              <span className="mt-1 block px-4 text-2xl font-black tracking-[-0.04em]">{points.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Custom points</span>
            <input
              type="number"
              min="5"
              value={customPoints}
              onChange={(event) => setCustomPoints(event.target.value)}
              placeholder="Enter amount"
              className="mt-2 w-full rounded-[18px] border border-black/5 bg-[var(--tg-secondary-bg-color)] px-4 py-3 text-sm font-bold text-[var(--tg-text-color)] outline-none transition placeholder:text-[var(--tg-hint-color)] focus:border-[var(--tg-button-color)]"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Service intent</span>
            <select
              value={serviceIntent}
              onChange={(event) => {
                setServiceIntent(event.target.value);
                telegram.impact('light');
              }}
              className="mt-2 w-full rounded-[18px] border border-black/5 bg-[var(--tg-secondary-bg-color)] px-4 py-3 text-sm font-bold text-[var(--tg-text-color)] outline-none transition focus:border-[var(--tg-button-color)]"
            >
              {services.map((service) => (
                <option key={service.slug || 'general'} value={service.slug}>{service.title}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {fundingMethods.map((method) => (
          <MethodCard
            key={method.id}
            method={method}
            active={method.id === selectedMethodId}
            onSelect={() => {
              setSelectedMethodId(method.id);
              telegram.impact('light');
            }}
          />
        ))}
      </div>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Funding handoff</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">{selectedMethod.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--tg-subtitle-text-color)]">{selectedMethod.instructions}</p>
          </div>
          <ShieldCheck className="shrink-0 text-[var(--tg-button-color)]" size={26} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={createOrder}
            disabled={!canCreate}
            className="flex items-center justify-center gap-2 rounded-[20px] bg-[var(--tg-button-color)] px-5 py-3 text-sm font-black text-[var(--tg-button-text-color)] shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Creating order' : 'Create point order'}
            <Sparkles size={16} />
          </button>
          <a
            href={selectedMethod.vendorUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-[20px] bg-[var(--tg-secondary-bg-color)] px-5 py-3 text-sm font-black text-[var(--tg-text-color)] shadow-sm"
          >
            <MessageCircle size={16} />
            Open vendor chat
          </a>
        </div>
        {!authenticated ? (
          <p className="mt-4 rounded-[18px] bg-[color-mix(in_srgb,var(--tg-destructive-text-color)_10%,var(--tg-secondary-bg-color))] p-3 text-xs font-bold leading-5 text-[var(--tg-destructive-text-color)]">
            Sign in on the web or open the app from Telegram before creating a funding order.
          </p>
        ) : null}
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--tg-hint-color)]">Recent funding</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--tg-text-color)]">Order timeline</h3>
          </div>
          <Clock3 size={24} className="text-[var(--tg-button-color)]" />
        </div>

        <div className="mt-5 space-y-3">
          {latestOrders.length ? (
            latestOrders.map((order) => (
              <OrderRow key={order.order_id || order.id} order={order} onMarkPaid={markPaid} markingPaid={markingPaid} />
            ))
          ) : (
            <div className="rounded-[24px] bg-[var(--tg-secondary-bg-color)] p-5 text-center">
              <CheckCircle2 className="mx-auto text-[var(--tg-button-color)]" size={28} />
              <p className="mt-3 text-sm font-black text-[var(--tg-text-color)]">No funding orders yet</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[var(--tg-hint-color)]">
                Your next point order will appear here with status and support context.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to="/miniapp/orders" className="flex items-center justify-center gap-2 rounded-[20px] bg-[var(--tg-secondary-bg-color)] px-5 py-3 text-sm font-black text-[var(--tg-text-color)] shadow-sm">
            Full order history
            <ArrowRight size={16} />
          </Link>
          <Link to="/buy-point" className="flex items-center justify-center gap-2 rounded-[20px] bg-[var(--tg-secondary-bg-color)] px-5 py-3 text-sm font-black text-[var(--tg-text-color)] shadow-sm">
            Advanced web checkout
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="rounded-[30px] bg-[var(--tg-section-bg-color)] p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <PillStat label="Wallet record cost" value={`${Number(config?.bank_slip_cost || 10).toLocaleString()} pts`} tone="accent" />
          <PillStat label="Notification cost" value={`${Number(config?.email_receipt_cost || 5).toLocaleString()} pts`} />
          <PillStat label="Intent" value={selectedService?.title || 'General'} />
        </div>
      </section>
    </div>
  );
}
