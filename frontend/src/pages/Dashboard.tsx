import { useStore } from '../store';
import {
  weightedCompositeScore,
  overallCompletion,
  groupScore,
  groupCompletion,
  practiceAreaScore,
  practiceAreaCompletion,
} from '../scoring';
import { getMaturityBand, MATURITY_BANDS } from '../types';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-medium border border-border-gray/30 rounded-xl p-6 transition-colors hover:border-border-gray/60 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}

export default function Dashboard() {
  const { data } = useStore();
  if (!data) return null;

  const composite = weightedCompositeScore(data);
  const band = composite !== null ? getMaturityBand(composite) : null;
  const { scored: scoredCount, total: totalCount } = overallCompletion(data);
  const completionPct = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  // Collect all practice areas for radar and bar charts
  const allPracticeAreas = data.category_groups.flatMap((g) => g.practice_areas);

  const radarData = allPracticeAreas.map((pa) => ({
    subject: pa.name.length > 14 ? pa.name.slice(0, 14) + '\u2026' : pa.name,
    score: practiceAreaScore(pa) ?? 0,
    target: data.target_scores[pa.id] ?? 0,
    fullMark: 5,
  }));

  const barData = allPracticeAreas.map((pa) => {
    const score = practiceAreaScore(pa) ?? 0;
    const paBand = score > 0 ? getMaturityBand(score) : null;
    return {
      name: pa.name.length > 16 ? pa.name.slice(0, 16) + '\u2026' : pa.name,
      score,
      color: paBand?.color ?? '#6B6B6B',
    };
  });

  // Top gaps: practice areas with largest current-vs-target gap
  const gapList = allPracticeAreas
    .map((pa) => {
      const current = practiceAreaScore(pa) ?? 0;
      const target = data.target_scores[pa.id] ?? 0;
      return { name: pa.name, current, target, gap: target - current };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <div className="text-xs text-text-secondary font-mono">
          {data.client_info.name || 'Assessment'} — {data.client_info.assessment_date || 'In Progress'}
        </div>
      </div>

      {/* Top row: composite score, maturity bands, progress */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Composite score */}
        <Card>
          <SectionLabel>Overall Maturity Score</SectionLabel>
          {composite !== null ? (
            <>
              <div className="text-5xl font-bold mt-1" style={{ color: band!.color }}>
                {composite.toFixed(2)}
              </div>
              <div className="text-sm font-semibold mt-2" style={{ color: band!.color }}>
                {band!.label}
              </div>
            </>
          ) : (
            <div className="text-4xl text-border-gray mt-1">--</div>
          )}
          <div className="text-xs text-text-secondary mt-3">
            Weighted composite across {allPracticeAreas.length} practice areas
          </div>
        </Card>

        {/* Maturity band legend */}
        <Card>
          <SectionLabel>Maturity Bands</SectionLabel>
          <div className="space-y-2 mt-1">
            {MATURITY_BANDS.map((b) => {
              const isActive = band && b.label === band.label;
              return (
                <div key={b.label} className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: b.color,
                      opacity: isActive ? 1 : 0.25,
                      transform: isActive ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-xs ${isActive ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                    {b.label}
                  </span>
                  <span className="text-[10px] text-border-gray ml-auto font-mono">
                    {b.min.toFixed(1)}&ndash;{b.max.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Assessment progress */}
        <Card>
          <SectionLabel>Assessment Progress</SectionLabel>
          <div className="text-4xl font-bold text-accent mt-1">{completionPct}%</div>
          <div className="text-sm text-text-secondary mt-2">
            {scoredCount} / {totalCount} items scored
          </div>
          <div className="mt-4 space-y-2">
            {data.category_groups.map((g) => {
              const gPct = Math.round(groupCompletion(g) * 100);
              return (
                <div key={g.id} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-text-secondary w-36 truncate">{g.name}</span>
                  <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${gPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-border-gray w-8 text-right font-mono">{gPct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Radar chart */}
        <Card>
          <SectionLabel>Practice Area Maturity Profile</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A2E" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#D0D0D0' }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: '#6B6B6B' }} tickCount={6} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#1BA1E2"
                  fill="#1BA1E2"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#6B6B6B"
                  fill="#6B6B6B"
                  fillOpacity={0.05}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#D0D0D0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar chart */}
        <Card>
          <SectionLabel>Practice Area Scores</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  tick={{ fontSize: 11, fill: '#6B6B6B' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 9, fill: '#D0D0D0' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1E',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#D0D0D0' }}
                  formatter={(value: number) => [value.toFixed(2), 'Score']}
                />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} barSize={10}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category group summary cards */}
      <SectionLabel>Category Groups</SectionLabel>
      <div className="grid grid-cols-4 gap-5 mb-6">
        {data.category_groups.map((g) => {
          const gScore = groupScore(g);
          const gBand = gScore !== null ? getMaturityBand(gScore) : null;
          const gPct = Math.round(groupCompletion(g) * 100);
          const gItems = g.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items));
          const gScored = gItems.filter((i) => i.score !== null || i.na).length;
          return (
            <Card key={g.id}>
              <SectionLabel>{g.name}</SectionLabel>
              {gScore !== null ? (
                <div className="text-2xl font-bold mt-1" style={{ color: gBand!.color }}>
                  {gScore.toFixed(2)}
                </div>
              ) : (
                <div className="text-2xl text-border-gray mt-1">--</div>
              )}
              {gScore !== null && (
                <div className="text-xs mt-1" style={{ color: gBand!.color }}>{gBand!.label}</div>
              )}
              <div className="text-xs text-border-gray mt-2">
                {gScored}/{gItems.length} items ({gPct}%)
              </div>
              <div className="mt-3 h-1 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${gPct}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Top gaps */}
      {gapList.length > 0 && (
        <>
          <SectionLabel>Top Improvement Opportunities</SectionLabel>
          <Card>
            <div className="space-y-3">
              {gapList.map((g, i) => {
                const currentBand = g.current > 0 ? getMaturityBand(g.current) : null;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-border-gray w-4 text-right">{i + 1}</span>
                    <span className="text-sm text-text-secondary flex-1 truncate">{g.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: currentBand?.color ?? '#6B6B6B' }}>
                        {g.current.toFixed(2)}
                      </span>
                      <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                        <path d="M1 5h14M10 1l5 4-5 4" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs font-semibold text-accent">{g.target.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-border-gray w-12 text-right">
                      gap: {g.gap.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Practice area completion summary */}
      <div className="mt-6">
        <SectionLabel>Practice Area Completion</SectionLabel>
        <div className="grid grid-cols-2 gap-5">
          {data.category_groups.map((g) => (
            <Card key={g.id}>
              <div className="text-xs font-semibold text-text-secondary mb-3">{g.name}</div>
              <div className="space-y-2">
                {g.practice_areas.map((pa) => {
                  const paScore = practiceAreaScore(pa);
                  const paBand = paScore !== null ? getMaturityBand(paScore) : null;
                  const paPct = Math.round(practiceAreaCompletion(pa) * 100);
                  return (
                    <div key={pa.id} className="flex items-center gap-2.5">
                      <span className="text-[11px] text-text-secondary w-40 truncate">{pa.name}</span>
                      <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${paPct}%`,
                            backgroundColor: paBand?.color ?? '#1BA1E2',
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-mono w-8 text-right"
                        style={{ color: paBand?.color ?? '#6B6B6B' }}
                      >
                        {paScore !== null ? paScore.toFixed(1) : '--'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
