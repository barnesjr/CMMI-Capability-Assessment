import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function ClientInfo() {
  const navigate = useNavigate();
  const { data, updateData } = useStore();
  if (!data) return null;

  const { client_info } = data;

  function update(field: keyof typeof client_info, value: string) {
    updateData((d) => {
      d.client_info[field] = value;
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-2">CMMI Assessment — Client Information</h2>
      <p className="text-sm text-text-tertiary mb-8">Enter the details for this assessment engagement.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Client Name</label>
          <input
            type="text"
            value={client_info.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-medium border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
            placeholder="e.g., Acme Corp"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Industry</label>
          <input
            type="text"
            value={client_info.industry}
            onChange={(e) => update('industry', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-medium border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
            placeholder="e.g., Financial Services"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Assessment Date</label>
          <input
            type="date"
            value={client_info.assessment_date}
            onChange={(e) => update('assessment_date', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-medium border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Assessor Name</label>
          <input
            type="text"
            value={client_info.assessor}
            onChange={(e) => update('assessor', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-medium border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
            placeholder="e.g., Jane Smith"
          />
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 px-6 py-2.5 bg-accent hover:bg-accent-bright text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        Continue to Dashboard &rarr;
      </button>
    </div>
  );
}
