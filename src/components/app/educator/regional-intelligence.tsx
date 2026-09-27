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
import { Globe2, Sparkles, TrendingDown, Users } from "lucide-react";
import {
  PageHeader,
  Panel,
  PanelTitle,
  StatTile,
} from "@/components/app/ui-bits";
import {
  cohortProgress,
  countryDemand,
  gapTrend,
  modeSplit,
  skillGapData,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const axisStyle = { fontSize: 11, fill: "#5c7288" };

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8ef",
  fontSize: 12,
  boxShadow: "0 10px 30px -18px rgba(13,33,55,0.4)",
};

type SortKey = "gap" | "openRoles" | "learners";

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 5 · Regional Intelligence"
        title="Where the gaps actually are"
        description="Every verification and employer match feeds this anonymously. It is the argument for changing a curriculum, and the reason the platform collects evidence rather than attendance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Learners on the platform"
          value={totals.learners.toLocaleString()}
          sub="Across 12 ECOWAS countries"
          icon={Users}
        />
        <StatTile
          label="Open roles tracked"
          value={totals.roles.toLocaleString()}
          sub="Posted by partner employers"
          icon={Globe2}
          tone="navy"
        />
        <StatTile
          label="Widest single gap"
          value={`${widest.roles - widest.verified}`}
          sub={`${widest.skill} — ${widest.roles} roles, ${widest.verified} verified`}
          icon={TrendingDown}
          tone="gold"
        />
        <StatTile
          label="Gap closing"
          value={`${gapTrend[0].gap - gapTrend[gapTrend.length - 1].gap} pts`}
          sub="April to September, unmet-role share"
          icon={Sparkles}
          tone="teal"
        />
      </div>

      <Panel>
        <PanelTitle
          title="Verified learners against open roles, by skill"
          hint="Where the amber bar runs past the green one, employers are hiring for something almost nobody can prove yet."
        />
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillGapData}
              margin={{ top: 8, right: 8, bottom: 56, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis
                dataKey="skill"
                tick={axisStyle}
                angle={-32}
                textAnchor="end"
                interval={0}
                height={70}
                stroke="#dbe3ec"
              />
              <YAxis tick={axisStyle} stroke="#dbe3ec" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                verticalAlign="top"
              />
              <Bar
                dataKey="verified"
                name="Verified learners"
                fill="#178a7a"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
                isAnimationActive={false}
              />
              <Bar
                dataKey="roles"
                name="Open roles"
                fill="#e9ae37"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle
            title="Unmet-role share, six months"
            hint="The percentage of open roles with no verified learner matched to the screening competency."
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={gapTrend}
                margin={{ top: 8, right: 12, bottom: 4, left: -12 }}
              >
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="month" tick={axisStyle} stroke="#dbe3ec" />
                <YAxis
                  tick={axisStyle}
                  stroke="#dbe3ec"
                  domain={[30, 70]}
                  unit="%"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="gap"
                  name="Unmet roles"
                  stroke="#142f4d"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#142f4d" }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-navy-500">
            Down 18 points since April, as verified passports grew from 540 to
            1,024.
          </p>
        </Panel>

        <Panel>
          <PanelTitle
            title="How learners choose to study"
            hint="Delivery mode across every active cohort. Live tutor-led overtook onsite in July."
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modeSplit}
                  dataKey="learners"
                  nameKey="mode"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {modeSplit.map((entry) => (
                    <Cell key={entry.mode} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelTitle
          title="Mastery progress by delivery mode"
          hint="Onsite cohorts stay ahead, but self-paced learners are the ones holding a job while they study."
        />
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cohortProgress}
              margin={{ top: 8, right: 12, bottom: 4, left: -12 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="week" tick={axisStyle} stroke="#dbe3ec" />
              <YAxis tick={axisStyle} stroke="#dbe3ec" unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="onsite"
                name="Onsite"
                stroke="#142f4d"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="live"
                name="Live tutor-led"
                stroke="#5b8bbc"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="self"
                name="Self-paced"
                stroke="#e9ae37"
                strokeWidth={2.5}
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
          hint="Sort to find where a curriculum change would do the most good."
          action={
            <div className="flex gap-1.5">
              {(
                [
                  { key: "gap", label: "Gap" },
                  { key: "openRoles", label: "Roles" },
                  { key: "learners", label: "Learners" },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  aria-pressed={sort === option.key}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[0.76rem] font-medium transition-colors",
                    sort === option.key
                      ? "bg-navy-900 text-white"
                      : "bg-navy-50 text-navy-600 hover:bg-navy-100",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[40rem] text-left">
            <thead>
              <tr className="border-y border-navy-100 bg-navy-50/60">
                {[
                  "Country",
                  "Learners",
                  "Open roles",
                  "Most-demanded skill",
                  "Unmet-role share",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-5 py-3 text-[0.72rem] font-bold tracking-wide text-navy-500 uppercase sm:px-6"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((country) => (
                <tr
                  key={country.code}
                  className="border-b border-navy-100 last:border-0 hover:bg-navy-50/40"
                >
                  <td className="px-5 py-3.5 sm:px-6">
                    <span className="flex items-center gap-2.5">
                      <span className="rounded bg-navy-100 px-1.5 py-0.5 font-mono text-[0.7rem] font-bold text-navy-600">
                        {country.code}
                      </span>
                      <span className="text-[0.87rem] font-semibold text-navy-900">
                        {country.country}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.85rem] text-navy-600 tabular-nums sm:px-6">
                    {country.learners.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-[0.85rem] text-navy-600 tabular-nums sm:px-6">
                    {country.openRoles.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-[0.85rem] text-navy-600 sm:px-6">
                    {country.topSkill}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-navy-100">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            country.gap >= 55
                              ? "bg-destructive"
                              : country.gap >= 38
                                ? "bg-gold-400"
                                : "bg-teal-500",
                          )}
                          style={{ width: `${country.gap}%` }}
                        />
                      </span>
                      <span className="font-heading text-[0.82rem] font-bold text-navy-900 tabular-nums">
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

      <Panel className="bg-navy-50/50">
        <p className="text-[0.87rem] leading-relaxed text-navy-600">
          <span className="font-semibold text-navy-900">
            What an ECOWAS ministry would take from this page.
          </span>{" "}
          Nigeria and Ghana have the widest gaps in absolute terms, but Cabo
          Verde&rsquo;s 44% sits on only 145 learners — a small intervention
          moves it. The Gambia is the one country where verified supply is
          within reach of demand, which is the case for the hybrid model rather
          than a claim about the region.
        </p>
        <p className="mt-3 text-[0.78rem] text-navy-400">
          Prototype — all figures on this page are illustrative demo data, not
          real ECOWAS statistics.
        </p>
      </Panel>
    </div>
  );
}
