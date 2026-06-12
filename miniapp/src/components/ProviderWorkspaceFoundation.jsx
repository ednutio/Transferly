import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Code2,
  CreditCard,
  FileText,
  Gauge,
  Landmark,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  WalletCards
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getPaymentProviderLauncher } from '../lib/paymentProviderLaunchers';
import {
  getProviderLaneDefinition,
  getProviderManifest,
  getProviderWorkspaceRoute,
  getWorkspaceLauncherLaneId,
  isProviderLaneSupported
} from '../lib/providerManifests';
import AdminPaymentsTab from './AdminTabs/PaymentsTab';
import PayPalProviderWorkspace from './PayPalProviderWorkspace';
import ProviderWorkspaceShell from './ProviderWorkspaceShell';

const laneIcons = {
  overview: Gauge,
  'custom-details': ShieldCheck,
  invoices: FileText,
  payouts: Send,
  wallet: WalletCards,
  activity: Activity,
  payments: CreditCard,
  billing: Receipt,
  connect: Users,
  receive: Receipt,
  send: Send,
  balances: WalletCards,
  compliance: ShieldCheck,
  collections: CreditCard,
  customers: Users,
  'virtual-accounts': Landmark,
  subscriptions: RefreshCw,
  transfers: Send,
  settlements: Landmark,
  refunds: RefreshCw,
  confirmations: CheckCircle2,
  security: ShieldCheck,
  developer: Code2
};

const supportLabels = {
  live: 'Live',
  preview: 'Preview',
  setup: 'Setup',
  unavailable: 'Unavailable',
  planned: 'Planned'
};

const supportDetails = {
  live: 'This lane is connected to an existing Transferly workflow where backend support is available.',
  preview: 'This lane is available as a structured workspace while some backend operations are still being completed.',
  setup: 'This lane is intentionally scaffolded and will stay explicit until the provider backend is connected.',
  unavailable: 'This lane is not enabled in Transferly yet.',
  planned: 'This lane is planned for a later provider rollout.'
};

const embeddedLaneViews = {
  stripe: {
    payments: { mode: 'invoice', providerFilter: 'stripe' },
    connect: { mode: 'payout', providerFilter: 'stripe' }
  },
  crypto: {
    receive: { mode: 'invoice', providerFilter: 'crypto' }
  }
};

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function readProviderSlug(provider) {
  return normalizeKey(provider?.slug || provider?.key || provider?.id || provider?.provider);
}

function readHealthSlug(health) {
  return normalizeKey(health?.provider || health?.key || health?.slug || health?.id);
}

function formatEnvironment(manifest, providerRecord) {
  const value = providerRecord?.environment || providerRecord?.mode || providerRecord?.env;
  if (value) {
    return value;
  }

  return manifest.environmentSupport || [];
}

function readConnectionStatus(manifest, providerRecord, health) {
  return health?.status || providerRecord?.status || manifest.status || '';
}

function readBalanceSummary(balance) {
  if (!balance) {
    return 'No balance snapshot loaded';
  }

  if (typeof balance === 'string') {
    return balance;
  }

  const available = balance.available || balance.available_balance || balance.amount || balance.balance;
  const currency = balance.currency || balance.available_currency || balance.default_currency || '';
  if (available !== undefined && available !== null) {
    return `${available}${currency ? ` ${currency}` : ''}`;
  }

  return 'Balance snapshot available';
}

function getLaneSupport(lane, manifest) {
  return lane?.support || manifest.laneSupport?.[lane?.id] || manifest.status || 'planned';
}

function SummaryCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--provider-accent-soft)] text-[var(--tg-text-color)] ring-1 ring-[var(--provider-accent-border)]">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">{label}</p>
          <p className="mt-1 text-lg font-black text-[var(--tg-text-color)]">{value}</p>
          {detail ? <p className="mt-1 text-xs font-bold leading-5 text-[var(--tg-subtitle-text-color)]">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function LaneOverview({ manifest }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--tg-section-bg-color)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">Workspace lanes</p>
          <h2 className="mt-2 text-xl font-black text-[var(--tg-text-color)]">Provider-first service routes</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--tg-subtitle-text-color)]">
            Each lane keeps Transferly as the operating shell while adapting terminology, actions, and readiness checks to the selected provider.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {manifest.lanes.map((lane) => {
          const Icon = laneIcons[lane.id] || Gauge;

          return (
            <Link
              key={lane.id}
              to={getProviderWorkspaceRoute(manifest.slug, lane.id)}
              className="group rounded-[22px] border border-white/10 bg-white/[0.045] p-4 transition hover:border-[var(--provider-accent-border)] hover:bg-[var(--provider-accent-soft)]"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--provider-accent-soft)] text-[var(--tg-text-color)] ring-1 ring-[var(--provider-accent-border)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[var(--tg-text-color)]">{lane.label}</p>
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--tg-hint-color)]">
                      {supportLabels[getLaneSupport(lane, manifest)] || supportLabels.planned}
                    </span>
                    <ArrowRight className="opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" size={15} />
                  </div>
                  <p className="mt-1 text-xs font-bold leading-5 text-[var(--tg-subtitle-text-color)]">{lane.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function LaneDetail({ manifest, lane, launcherLane }) {
  const Icon = laneIcons[lane.id] || Gauge;
  const support = getLaneSupport(lane, manifest);
  const supportLabel = supportLabels[support] || supportLabels.planned;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--tg-section-bg-color)] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--provider-accent-soft)] text-[var(--tg-text-color)] ring-1 ring-[var(--provider-accent-border)]">
          <Icon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--tg-hint-color)]">{manifest.displayName} lane</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-[var(--tg-text-color)]">{launcherLane?.title || lane.label}</h2>
            <span className="rounded-full border border-[var(--provider-accent-border)] bg-[var(--provider-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--tg-text-color)]">
              {supportLabel}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--tg-subtitle-text-color)]">
            {launcherLane?.subtitle || lane.description}
          </p>
        </div>
      </div>

      {launcherLane?.bullets?.length ? (
        <div className="mt-5 grid gap-2">
          {launcherLane.bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--tg-button-color)]" size={16} />
              <p className="text-sm font-bold leading-5 text-[var(--tg-text-color)]">{bullet}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--tg-hint-color)]">Implementation status</p>
        <p className="mt-2 text-sm font-bold leading-6 text-[var(--tg-subtitle-text-color)]">
          {supportDetails[support] || supportDetails.planned}
        </p>
      </div>
    </section>
  );
}

function LaneSetupGrid({ manifest, lane }) {
  const providerName = manifest.displayName;
  const support = getLaneSupport(lane, manifest);
  const items = [
    {
      title: 'Route foundation',
      detail: `${providerName} now has a dedicated ${lane.label.toLowerCase()} lane inside the Transferly provider workspace.`,
      ready: true
    },
    {
      title: 'Backend adapter',
      detail: support === 'live'
        ? 'Existing Transferly backend support is connected where available.'
        : 'Provider API calls remain gated until the adapter, secrets, webhooks, and persistence are wired.',
      ready: support === 'live'
    },
    {
      title: 'Operational safety',
      detail: 'Money movement and externally meaningful state changes must remain auditable before this lane becomes fully active.',
      ready: support === 'live'
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
          <CheckCircle2
            className={item.ready ? 'text-[var(--tg-button-color)]' : 'text-[var(--tg-hint-color)]'}
            size={18}
          />
          <p className="mt-3 text-sm font-black text-[var(--tg-text-color)]">{item.title}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-[var(--tg-subtitle-text-color)]">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

// Generic provider workspaces reuse existing aggregate payment views only where
// backend support already exists; setup lanes stay explicit and non-operational.
function EmbeddedProviderLane({ manifest, lane, launcherLane, view }) {
  return (
    <section className="space-y-4">
      <LaneDetail manifest={manifest} lane={lane} launcherLane={launcherLane} />
      <AdminPaymentsTab
        embedded
        mode={view.mode}
        providerFilter={view.providerFilter}
      />
    </section>
  );
}

function ProviderLaneContent({ manifest, lane, launcherLane }) {
  const view = embeddedLaneViews[manifest.slug]?.[lane.id];

  if (view) {
    return <EmbeddedProviderLane manifest={manifest} lane={lane} launcherLane={launcherLane} view={view} />;
  }

  return (
    <div className="space-y-4">
      <LaneDetail manifest={manifest} lane={lane} launcherLane={launcherLane} />
      <LaneSetupGrid manifest={manifest} lane={lane} />
    </div>
  );
}

export default function ProviderWorkspaceFoundation({ slug, lane = 'overview' }) {
  const manifest = getProviderManifest(slug);
  const {
    paymentProviders = [],
    providerHealth = [],
    providerBalances = {}
  } = useAppContext();

  const workspaceData = useMemo(() => {
    if (!manifest) {
      return null;
    }

    const providerRecord = paymentProviders.find((provider) => readProviderSlug(provider) === manifest.slug) || null;
    const health = providerHealth.find((item) => readHealthSlug(item) === manifest.slug) || null;
    const balance = providerBalances[manifest.slug] || null;

    return {
      providerRecord,
      health,
      balance,
      environment: formatEnvironment(manifest, providerRecord),
      connectionStatus: readConnectionStatus(manifest, providerRecord, health)
    };
  }, [manifest, paymentProviders, providerBalances, providerHealth]);

  if (!manifest) {
    return (
      <ProviderWorkspaceShell
        state="error"
        error="Transferly does not have a provider manifest for this service yet."
      />
    );
  }

  if (manifest.slug === 'paypal') {
    return <PayPalProviderWorkspace lane={lane} />;
  }

  const requestedLane = lane || 'overview';
  const activeLane = isProviderLaneSupported(manifest.slug, requestedLane) ? requestedLane : 'overview';
  const laneDefinition = getProviderLaneDefinition(activeLane);
  const manifestLane = manifest.lanes.find((item) => item.id === activeLane) || laneDefinition;
  const launcher = getPaymentProviderLauncher(manifest.slug);
  const launcherLaneId = getWorkspaceLauncherLaneId(manifest, activeLane);
  const launcherLane = launcher?.lanes?.find((item) => item.id === launcherLaneId) || null;
  const unsupportedLane = requestedLane !== activeLane;

  const quickActions = [
    { label: 'Command center', to: `/miniapp/ops?provider=${manifest.slug}` },
    ...manifest.lanes
      .filter((item) => item.id !== 'overview')
      .slice(0, 3)
      .map((item) => ({
        label: item.shortLabel || item.label,
        to: getProviderWorkspaceRoute(manifest.slug, item.id)
      }))
  ];

  return (
    <ProviderWorkspaceShell
      manifest={manifest}
      activeLane={activeLane}
      lanes={manifest.lanes}
      environment={workspaceData?.environment}
      connectionStatus={workspaceData?.connectionStatus}
      capabilities={manifest.capabilities}
      quickActions={quickActions}
      state={unsupportedLane ? 'error' : 'ready'}
      error={`${manifest.displayName} does not support the ${requestedLane} lane in Transferly yet.`}
    >
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={Gauge}
            label="Readiness"
            value={workspaceData?.connectionStatus || manifest.status || 'planned'}
            detail={manifest.launcherStatusLabel || 'Configured from the Transferly provider manifest.'}
          />
          <SummaryCard
            icon={Activity}
            label="Health"
            value={workspaceData?.health?.status || 'Not loaded'}
            detail={workspaceData?.health ? 'Provider health is available from the operations context.' : 'Health checks stay owned by the existing operations center.'}
          />
          <SummaryCard
            icon={WalletCards}
            label="Balance"
            value={readBalanceSummary(workspaceData?.balance)}
            detail="Balance ownership remains with the existing provider operations APIs."
          />
        </section>

        {activeLane === 'overview' ? (
          <LaneOverview manifest={manifest} />
        ) : (
          <ProviderLaneContent manifest={manifest} lane={manifestLane} launcherLane={launcherLane} />
        )}
      </div>
    </ProviderWorkspaceShell>
  );
}
