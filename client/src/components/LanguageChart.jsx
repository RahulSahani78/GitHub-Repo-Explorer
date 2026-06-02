import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { colorForLanguage } from '../lib/languageColors';

const MAX_SLICES = 6;

/**
 * Donut chart of the languages used across a user's public repos. Languages
 * beyond the top few are grouped into "Other" to keep the chart legible.
 */
export function LanguageChart({ languages }) {
  if (languages.length === 0) return null;

  const top = languages.slice(0, MAX_SLICES);
  const otherCount = languages.slice(MAX_SLICES).reduce((sum, l) => sum + l.count, 0);
  const data = otherCount > 0 ? [...top, { name: 'Other', count: otherCount }] : top;
  const total = data.reduce((sum, l) => sum + l.count, 0);

  return (
    <section
      aria-label="Languages used across repositories"
      className="animate-in rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
    >
      <h3 className="text-sm font-semibold text-text">Top languages</h3>

      <div className="mt-2 flex items-center gap-5">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={colorForLanguage(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} repos`, name]}
                contentStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  color: 'var(--color-text)',
                  fontSize: 12,
                  boxShadow: 'var(--shadow-pop)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex-1 space-y-2">
          {data.map((lang) => (
            <li key={lang.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-muted">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: colorForLanguage(lang.name) }}
                  aria-hidden
                />
                {lang.name}
              </span>
              <span className="tabular-nums text-faint">
                {Math.round((lang.count / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
