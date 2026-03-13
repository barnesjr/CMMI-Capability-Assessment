import { useStore } from '../store';
import { WEIGHTING_MODELS } from '../types';

export function SettingsPage() {
  const { data, updateData } = useStore();
  if (!data) return null;

  const allPAs = data.category_groups.flatMap((g) => g.practice_areas);

  return (
    <div className="max-w-2xl p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
      <p className="text-sm text-text-tertiary mb-8">Configure scoring weights, targets, and extensions.</p>

      {/* Weighting Model */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Scoring Weight Model</h3>
        <select
          value={data.scoring_config.weighting_model}
          onChange={(e) => {
            const model = e.target.value;
            const weights = WEIGHTING_MODELS[model]?.weights;
            if (!weights) return;
            updateData((d) => {
              d.scoring_config.weighting_model = model;
              d.scoring_config.practice_area_weights = { ...weights };
              for (const group of d.category_groups) {
                for (const pa of group.practice_areas) {
                  pa.weight = weights[pa.id] ?? pa.weight;
                }
              }
            });
          }}
          className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        >
          {Object.entries(WEIGHTING_MODELS).map(([key, model]) => (
            <option key={key} value={key}>{model.label}</option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-4 gap-2.5 max-h-64 overflow-y-auto">
          {allPAs.map((pa) => (
            <div key={pa.id} className="text-center p-3 bg-surface-elevated rounded-lg">
              <div className="text-[10px] text-text-tertiary mb-1 truncate">{pa.name}</div>
              <div className="text-sm font-semibold text-text-primary">{(pa.weight * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Weight Sliders */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Custom Weights</h3>
          <button
            onClick={() => {
              const model = data.scoring_config.weighting_model;
              const weights = WEIGHTING_MODELS[model]?.weights;
              if (!weights) return;
              updateData((d) => {
                d.scoring_config.practice_area_weights = { ...weights };
                for (const group of d.category_groups) {
                  for (const pa of group.practice_areas) {
                    pa.weight = weights[pa.id] ?? pa.weight;
                  }
                }
              });
            }}
            className="text-xs text-accent hover:text-accent-bright transition-colors"
          >
            Reset to preset
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allPAs.map((pa) => {
            const currentWeight = data.scoring_config.practice_area_weights[pa.id] ?? pa.weight;
            return (
              <div key={pa.id} className="flex items-center gap-3">
                <label className="text-xs text-text-secondary w-40 truncate shrink-0">{pa.name}</label>
                <input
                  type="range"
                  min={0.01}
                  max={0.20}
                  step={0.01}
                  value={currentWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateData((d) => {
                      d.scoring_config.practice_area_weights[pa.id] = val;
                      // Normalize so sum = 1.0
                      const rawWeights = d.scoring_config.practice_area_weights;
                      const sum = Object.values(rawWeights).reduce((a, b) => a + b, 0);
                      if (sum > 0) {
                        for (const key of Object.keys(rawWeights)) {
                          rawWeights[key] = rawWeights[key] / sum;
                        }
                      }
                      for (const group of d.category_groups) {
                        for (const p of group.practice_areas) {
                          p.weight = rawWeights[p.id] ?? p.weight;
                        }
                      }
                      d.scoring_config.weighting_model = 'custom';
                    });
                  }}
                  className="flex-1"
                />
                <span className="text-xs font-mono text-text-tertiary w-12 text-right">
                  {(currentWeight * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Scores */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Target Scores (for Gap Analysis)</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allPAs.map((pa) => (
            <div key={pa.id} className="flex items-center gap-4">
              <label className="text-sm text-text-secondary w-48 truncate">{pa.name}</label>
              <input
                type="number"
                min={1}
                max={5}
                step={0.5}
                value={data.target_scores[pa.id] ?? 3.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateData((d) => {
                    d.target_scores[pa.id] = isNaN(val) ? 3.0 : Math.min(5, Math.max(1, val));
                  });
                }}
                className="w-24 px-4 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CMMI-SVC Toggle */}
      <div className="bg-surface-medium border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">CMMI-SVC Extension Module</h3>
            <p className="text-xs text-text-tertiary mt-1">
              Enable CMMI for Services extension with additional service-oriented assessment items
            </p>
          </div>
          <button
            onClick={() => updateData((d) => { d.svc_enabled = !d.svc_enabled; })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              data.svc_enabled ? 'bg-accent' : 'bg-surface-elevated'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                data.svc_enabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
