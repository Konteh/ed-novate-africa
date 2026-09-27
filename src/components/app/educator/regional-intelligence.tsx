"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, PanelTitle, StatRow } from "@/components/app/ui-bits";
import {
  cohortProgress,
  countryDemand,
  gapTrend,
  modeSplit,
  skillGapData,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const axisStyle = { fontSize: 11, fill: "#6d7787" };
const gridStroke = "#eff1f5";
const axisStroke = "#e2e6ec";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e6ec",
  fontSize: 12,
  boxShadow: "0 10px 28px -18px rgba(16,24,40,0.35)",
};

const legendStyle = { fontSize: 12 };

type SortKey = "gap" | "openRoles" | "learners";

const sortOptions = [
  { key: "gap", label: "Gap" },
  { key: "openRoles", label: "Roles" },
  { key: "learners", label: "Learners" },
] as const;

export function RegionalIntelligence() {
  const [sort, setSort] = useState<SortKey>("gap");

  const totals = countryDemand.reduce(
    (acc, c) => ({
      learners: acc.learners + c.learners,
      roles: acc.roles + c.openRoles,
    }),
    { learners: 0, roles: 0 },
  );

  const sorted = [...countryDemand].sort((a, b) => b[sort] - a[sort]);
  const widest = [...skillGapData].sort(
    (a, b) => b.roles - b.verified - (a.roles - a.verified),
  )[0];

  return (
    <div className="space-y-5">
      <PageHeader title="Regional intelligence" />

      <StatRow
        items={[
          { label: "Learners", value: totals.learners.toLocaleString() },
          { label: "Open roles", value: totals.roles.toLocaleString() },
          { label: "Widest skill gap", value: widest.roles - widest.verified },
          {
            label: "Gap closed since April",
            value: `${gapTrend[0].gap - gapTrend[gapTrend.length - 1].gap} pts`,
          },
        ]}
      />

      <Panel>
        <PanelTitle title="Verified learners against open roles" />
        <div className="h-80 w-full p-5 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillGapData} margin={{ top: 8, right: 8, bottom: 56, left: 8 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="skill"
                tick={axisStyle}
                angle={-32}
                textAnchor="end"
                interval={0}
                height={70}
                stroke={axisStroke}
              />
              <YAxis tick={axisStyle} stroke={axisStroke} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f7f8fa" }} />
              <Legend wrapperStyle={{ ...legendStyle, paddingTop: 8 }} verticalAlign="top" />
              <Bar
                dataKey="verified"
                name="Verified learners"
                fill="#12684c"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              />
              <Bar
                dataKey="roles"
                name="Open roles"
                fill="#e5ad35"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle title="Unmet-role share" />
          <div className="h-64 w-full p-5 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gapTrend} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisStyle} stroke={axisStroke} />
                <YAxis tick={axisStyle} stroke={axisStroke} domain={[30, 70]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="gap"
                  name="Unmet roles"
                  stroke="#142d4a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#142d4a" }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelTitle title="How learners study" />
          <div className="h-64 w-full p-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modeSplit}
                  dataKey="learners"
                  nameKey="mode"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {modeSplit.map((entry) => (
                    <Cell key={entry.mode} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelTitle title="Mastery progress by mode" />
        <div className="h-72 w-full p-5 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cohortProgress} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="week" tick={axisStyle} stroke={axisStroke} />
              <YAxis tick={axisStyle} stroke={axisStroke} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="onsite"
                name="Onsite"
                stroke="#142d4a"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="live"
                name="Live tutor-led"
                stroke="#5a88b9"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="self"
                name="Self-paced"
                stroke="#e5ad35"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <PanelTitle
          title="Country by country"
          action={
            <div className="flex gap-1.5">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  aria-pressed={sort === option.key}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-navy-500/45",
                    sort === option.key
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left">
            <thead>
              <tr className="border-b border-ink-200">
                {["Country", "Learners", "Open roles", "Top skill", "Unmet share"].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-5 py-2.5 text-xs font-medium text-ink-500"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {sorted.map((country) => (
                <tr key={country.code} className="transition-colors hover:bg-ink-50">
                  <td className="px-5 py-3 text-sm font-medium">{country.country}</td>
                  <td className="px-5 py-3 text-sm text-ink-600 tabular-nums">
                    {country.learners.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-600 tabular-nums">
                    {country.openRoles.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-600">{country.topSkill}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-200">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            country.gap >= 55
                              ? "bg-destructive"
                              : country.gap >= 38
                                ? "bg-gold-400"
                                : "bg-ok-600",
                          )}
                          style={{ width: `${country.gap}%` }}
                        />
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {country.gap}%
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-xs text-ink-400">
        Prototype — all figures are illustrative demo data, not real ECOWAS statistics.
      </p>
    </div>
  );
}
