// preview page for newly created UI components

import Navbar from '@/components/Navbar';

export default function PreviewPage() {
  return (
    <>
      {/* Navbar */}
      <section>
        <h2 className="preview-label">Navbar</h2>
        <Navbar />
      </section>

      <div className="page-content flex flex-col gap-12 py-8">
        {/* Typography */}
        <section>
          <h2 className="preview-label">Typography</h2>
          <h1>Heading 1 — Pocket Heist</h1>
          <h2>Heading 2 — Active Heists</h2>
          <h3>Heading 3 — Mission Briefing</h3>
          <h4>Heading 4 — Target Details</h4>
          <p className="mt-2">
            Body text — Steal the snacks, swap the chairs, and rack up points
            before time runs out.
          </p>
          <p className="text-sm mt-1">Small text — Heist expires in 2 hours.</p>
        </section>

        {/* Colours */}
        <section>
          <h2 className="preview-label">Colours</h2>
          <div className="flex flex-wrap gap-4">
            {[
              ['bg-primary', 'primary'],
              ['bg-secondary', 'secondary'],
              ['bg-dark', 'dark'],
              ['bg-light', 'light'],
              ['bg-lighter', 'lighter'],
              ['bg-success', 'success'],
              ['bg-error', 'error']
            ].map(([cls, label]) => (
              <div key={cls} className="flex flex-col items-center gap-1">
                <div className={`${cls} w-12 h-12 rounded`} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="preview-label">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-dark font-semibold px-4 py-2 rounded hover:opacity-90">
              Primary
            </button>
            <button className="bg-secondary text-dark font-semibold px-4 py-2 rounded hover:opacity-90">
              Secondary
            </button>
            <button className="border border-primary text-primary font-semibold px-4 py-2 rounded hover:bg-primary hover:text-dark">
              Outline
            </button>
            <button className="bg-error text-white font-semibold px-4 py-2 rounded hover:opacity-90">
              Danger
            </button>
          </div>
        </section>

        {/* Form elements */}
        <section>
          <h2 className="preview-label">Form Elements</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-heading">
                Heist Title
              </label>
              <input
                type="text"
                placeholder="e.g. Steal the boss's stapler"
                className="bg-light border border-lighter text-heading placeholder:text-body rounded px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-heading">
                Description
              </label>
              <textarea
                placeholder="Describe the mission..."
                rows={3}
                className="bg-light border border-lighter text-heading placeholder:text-body rounded px-3 py-2 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-heading">
                Assign To
              </label>
              <select className="bg-light border border-lighter text-body rounded px-3 py-2 focus:outline-none focus:border-primary">
                <option>Select a colleague…</option>
                <option>Alice</option>
                <option>Bob</option>
              </select>
            </div>
          </div>
        </section>

        {/* Status messages */}
        <section>
          <h2 className="preview-label">Status Messages</h2>
          <div className="flex flex-col gap-3 max-w-md">
            <div className="border border-success text-success rounded px-4 py-3 text-sm">
              Heist completed successfully — 50 points earned!
            </div>
            <div className="border border-error text-error rounded px-4 py-3 text-sm">
              Heist failed — time ran out before the mission was completed.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
