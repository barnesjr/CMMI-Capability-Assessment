import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  FileOutput,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from 'lucide-react';
import { useStore } from '@/store';
import type { PracticeArea, CategoryGroup } from '@/types';

// ─── Sidebar state persistence ────────────────────────────────────────────────
const STORAGE_KEY = 'cmmi-sidebar';
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 350;
const COLLAPSED_WIDTH = 56;

interface SidebarState {
  width: number;
  collapsed: boolean;
}

function loadSidebarState(): SidebarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SidebarState;
      return {
        width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed.width ?? DEFAULT_WIDTH)),
        collapsed: parsed.collapsed ?? false,
      };
    }
  } catch { /* ignore */ }
  return { width: DEFAULT_WIDTH, collapsed: false };
}

function saveSidebarState(state: SidebarState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Group labels ─────────────────────────────────────────────────────────────
const GROUP_LABELS: Record<string, string> = {
  doing: 'DOING',
  managing: 'MANAGING',
  enabling: 'ENABLING',
  improving: 'IMPROVING',
};

// ─── Score colour helper ──────────────────────────────────────────────────────
function scoreColor(score: number | null): string {
  if (score === null) return '#8A8A8E';
  if (score < 1.5) return '#ef4444';
  if (score < 2.5) return '#f97316';
  if (score < 3.5) return '#eab308';
  if (score < 4.5) return '#84cc16';
  return '#22c55e';
}

// ─── Inline scoring helpers ───────────────────────────────────────────────────
function computePAScore(pa: PracticeArea): number | null {
  const items = pa.capability_areas.flatMap(ca => ca.items);
  const scored = items.filter(i => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

function computePACompletion(pa: PracticeArea): number {
  const items = pa.capability_areas.flatMap(ca => ca.items);
  if (items.length === 0) return 0;
  return items.filter(i => i.score !== null || i.na).length / items.length;
}

function computeGroupScore(group: CategoryGroup): number | null {
  const scores = group.practice_areas
    .map(pa => computePAScore(pa))
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function computeGroupCompletion(group: CategoryGroup): number {
  const allItems = group.practice_areas.flatMap(pa =>
    pa.capability_areas.flatMap(ca => ca.items)
  );
  if (allItems.length === 0) return 0;
  return allItems.filter(i => i.score !== null || i.na).length / allItems.length;
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────
function ProgressRing({
  completion,
  score,
  size = 28,
}: {
  completion: number;
  score: number | null;
  size?: number;
}) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * completion;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2A2E" strokeWidth={2} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── ScoreBadge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  return (
    <span
      className="text-[10px] font-bold tabular-nums ml-auto shrink-0"
      style={{ color: scoreColor(score) }}
    >
      {score.toFixed(1)}
    </span>
  );
}

// ─── NavLink class helpers ────────────────────────────────────────────────────
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-2 px-3 py-1.5 mx-1 rounded text-[13px] transition-colors',
    isActive
      ? 'bg-accent/15 text-accent-bright font-medium'
      : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary',
  ].join(' ');

const collapsedNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center justify-center w-full py-2 transition-colors',
    isActive ? 'text-accent-bright' : 'text-text-tertiary hover:text-text-secondary',
  ].join(' ');

// ─── PracticeAreaSection (expandable to capability areas) ─────────────────────
function PracticeAreaSection({
  pa,
  collapsed: sidebarCollapsed,
}: {
  pa: PracticeArea;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const score = computePAScore(pa);
  const completion = computePACompletion(pa);

  if (sidebarCollapsed) {
    return (
      <NavLink
        to={`/practice-areas/${pa.id}`}
        className={collapsedNavLinkClass}
        title={pa.name}
      >
        <Layers size={16} />
      </NavLink>
    );
  }

  return (
    <div>
      {/* Practice area header row */}
      <div className="flex items-center gap-1.5 mx-1">
        <NavLink
          to={`/practice-areas/${pa.id}`}
          className={({ isActive }) =>
            [
              'flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors min-w-0',
              isActive
                ? 'bg-accent/15 text-accent-bright font-medium'
                : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary',
            ].join(' ')
          }
        >
          <ProgressRing completion={completion} score={score} size={22} />
          <span className="truncate flex-1">{pa.name}</span>
          <ScoreBadge score={score} />
        </NavLink>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1 rounded text-text-tertiary hover:text-text-secondary hover:bg-sidebar-hover transition-colors shrink-0"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Capability areas */}
      {open && (
        <div className="ml-4 mt-0.5 mb-1 border-l border-border-subtle pl-2">
          {pa.capability_areas.map((ca) => (
            <NavLink
              key={ca.id}
              to={`/practice-areas/${pa.id}/${ca.id}`}
              className={({ isActive }) =>
                [
                  'block py-1 px-2 text-[12px] rounded transition-colors truncate',
                  isActive
                    ? 'text-accent-bright font-medium'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-sidebar-hover',
                ].join(' ')
              }
            >
              {ca.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GroupSection ─────────────────────────────────────────────────────────────
function GroupSection({
  group,
  collapsed: sidebarCollapsed,
  open,
  onToggle,
}: {
  group: CategoryGroup;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const score = computeGroupScore(group);
  const completion = computeGroupCompletion(group);
  const label = GROUP_LABELS[group.id] ?? group.name.toUpperCase();

  if (sidebarCollapsed) {
    return (
      <div className="py-1">
        {group.practice_areas.map((pa) => (
          <PracticeAreaSection key={pa.id} pa={pa} collapsed={sidebarCollapsed} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      {/* Group eyebrow row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-sidebar-hover transition-colors group"
      >
        <span className="text-[10px] font-semibold text-accent-bright tracking-widest flex-1 text-left">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <ProgressRing completion={completion} score={score} size={18} />
          <ScoreBadge score={score} />
          {open ? (
            <ChevronDown size={11} className="text-text-tertiary group-hover:text-text-secondary" />
          ) : (
            <ChevronRight size={11} className="text-text-tertiary group-hover:text-text-secondary" />
          )}
        </div>
      </button>

      {/* Practice areas */}
      {open && (
        <div className="pb-1">
          {group.practice_areas.map((pa) => (
            <PracticeAreaSection key={pa.id} pa={pa} collapsed={sidebarCollapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { data, saveStatus, updateData } = useStore();

  // Sidebar width + collapsed state
  const [sidebarState, setSidebarState] = useState<SidebarState>(loadSidebarState);
  const { width, collapsed } = sidebarState;

  // Persist to localStorage on change
  useEffect(() => {
    saveSidebarState(sidebarState);
  }, [sidebarState]);

  const toggleCollapse = useCallback(() => {
    setSidebarState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
  }, []);

  // ─── Resize drag handling ──────────────────────────────────────────────────
  const resizing = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;

    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + ev.clientX - startX));
      setSidebarState((prev) => ({ ...prev, width: newWidth }));
    };

    const onMouseUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width]);

  // Each group can be independently collapsed; default all open
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (data) {
      for (const g of data.category_groups) map[g.id] = true;
    } else {
      for (const id of Object.keys(GROUP_LABELS)) map[id] = true;
    }
    return map;
  });

  const toggleGroup = (id: string) =>
    setGroupOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving\u2026'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Error'
          : null;

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  return (
    <nav
      style={{ width: effectiveWidth }}
      className="h-screen bg-sidebar shrink-0 border-r border-border flex flex-col overflow-hidden relative"
    >
      {/* ── Header ── */}
      <div className="flex flex-col border-b border-border shrink-0">
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <img src="/logo.png" alt="Peraton" className="w-[140px]" />
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-primary truncate">
                CMMI Assessment
              </div>
              {saveLabel && (
                <div
                  className={`text-[10px] mt-0.5 ${saveStatus === 'error' ? 'text-red-400' : 'text-text-tertiary'}`}
                >
                  {saveLabel}
                </div>
              )}
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1 rounded text-text-tertiary hover:text-text-secondary hover:bg-sidebar-hover transition-colors shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Top nav */}
        <NavLink to="/" className={collapsed ? collapsedNavLinkClass : navLinkClass} title="Client Info" end>
          <User size={15} className="shrink-0 opacity-70" />
          {!collapsed && 'Client Info'}
        </NavLink>
        <NavLink to="/dashboard" className={collapsed ? collapsedNavLinkClass : navLinkClass} title="Dashboard">
          <LayoutDashboard size={15} className="shrink-0 opacity-70" />
          {!collapsed && 'Dashboard'}
        </NavLink>

        {/* Separator */}
        <div className="my-2 mx-3 border-t border-border-subtle" />

        {/* Category groups */}
        {data?.category_groups.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            open={groupOpen[group.id] ?? true}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}

        {/* Separator */}
        <div className="my-2 mx-3 border-t border-border-subtle" />

        {/* CMMI-SVC Toggle */}
        {!collapsed && (
          <div className="px-3 py-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest">
                CMMI-SVC Module
              </span>
              <button
                onClick={() =>
                  updateData((d) => {
                    d.svc_enabled = !d.svc_enabled;
                  })
                }
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  data?.svc_enabled ? 'bg-accent' : 'bg-surface-muted'
                }`}
                aria-label="Toggle CMMI-SVC module"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    data?.svc_enabled ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* CMMI-SVC link when enabled */}
        {data?.svc_enabled && (
          <NavLink
            to="/svc"
            className={collapsed ? collapsedNavLinkClass : navLinkClass}
            title="CMMI-SVC Assessment"
          >
            <Layers size={15} className="shrink-0 opacity-70" />
            {!collapsed && 'CMMI-SVC Assessment'}
          </NavLink>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="shrink-0 border-t border-border py-2">
        <NavLink
          to="/export"
          className={collapsed ? collapsedNavLinkClass : navLinkClass}
          title="Export"
        >
          <FileOutput size={15} className="shrink-0 opacity-70" />
          {!collapsed && 'Export'}
        </NavLink>
        <NavLink
          to="/settings"
          className={collapsed ? collapsedNavLinkClass : navLinkClass}
          title="Settings"
        >
          <Settings size={15} className="shrink-0 opacity-70" />
          {!collapsed && 'Settings'}
        </NavLink>
        <NavLink
          to="/help"
          className={collapsed ? collapsedNavLinkClass : navLinkClass}
          title="Help"
        >
          <HelpCircle size={15} className="shrink-0 opacity-70" />
          {!collapsed && 'Help'}
        </NavLink>
      </div>

      {/* ── Resize handle ── */}
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/30 transition-colors"
        />
      )}
    </nav>
  );
}
