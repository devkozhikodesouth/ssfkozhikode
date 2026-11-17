"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  CatCells,
  CatSortHeads,
  ColumnsMenu,
  DivisionRow,
  EVENT_TITLE,
  Loading,
  MobileSortBar,
  SortTh,
  SummaryCards,
  WhatsAppShareButton,
  catColumns,
  catGetters,
  catKey,
  catLine,
  pct,
  tableWrap,
  today,
  useColumns,
  useSource,
  useSummary,
  useTableSort,
  visibleCats,
} from "../shared";

/* Division name always shows; the rest can be hidden (and leave the share too) */
const COLUMNS = [
  { id: "campuses", label: "Campuses" },
  { id: "total", label: "Total" },
  { id: "attended", label: "Attended" },
  ...catColumns,
];

export default function DivisionsView() {
  const { data, loading, error } = useSummary();
  const { linkBase } = useSource();
  const cols = useColumns("divisions", COLUMNS);
  const { show } = cols;
  const cats = visibleCats(show);

  const { sorted, sort, toggle, setSort } = useTableSort<DivisionRow>(
    data?.divisions ?? [],
    {
      division: (d) => d.divisionName,
      campuses: (d) => d.campusCount,
      total: (d) => d.total,
      attended: (d) => d.attended,
      ...catGetters<DivisionRow>(),
    },
    { key: "total", dir: "desc" }
  );

  if (!data) return <Loading error={loading ? undefined : error} />;

  /* One line per division with only the visible columns */
  const message = () => {
    const rowParts = (d: DivisionRow) =>
      [
        show("total") && `${d.total}`,
        show("attended") && `✅ ${d.attended}`,
        show("campuses") && `${d.campusCount} campuses`,
      ].filter(Boolean);
    return [
      EVENT_TITLE,
      "SSF Kozhikode South",
      `📅 ${today()}`,
      "",
      show("total") && `👥 *Total registrations:* ${data.total}`,
      show("attended") && `✅ *Attended:* ${data.attended} (${pct(data.attended, data.total)}%)`,
      cats.length > 0 && catLine(data.categories, cats),
      "",
      "🏢 *Division-wise*",
      ...sorted.map((d, i) => {
        const parts = rowParts(d);
        const head = `${i + 1}. *${d.divisionName}*${parts.length ? ` — ${parts.join(" · ")}` : ""}`;
        return cats.length ? `${head}\n    ${catLine(d.categories, cats)}` : head;
      }),
    ]
      .filter((l) => l !== false)
      .join("\n");
  };

  return (
    <>
      <SummaryCards data={data} />
      <div className="flex gap-2 sm:justify-end">
        <ColumnsMenu cols={cols} />
        <WhatsAppShareButton title="Division-wise registrations" build={message} disabled={!sorted.length} />
      </div>

      <MobileSortBar
        options={[
          { key: "total", label: "Total registered", numeric: true },
          { key: "attended", label: "Attended", numeric: true },
          { key: "division", label: "Division name" },
          { key: "campuses", label: "Campuses", numeric: true },
          ...cats.map((c) => ({ key: catKey(c), label: c, numeric: true })),
        ]}
        sort={sort}
        onChange={setSort}
      />

      {/* Phone: one card per division */}
      <ul className="space-y-2.5 sm:hidden">
        {sorted.map((d) => (
          <li key={d._id}>
            <Link
              href={`${linkBase}/campuses?divisionId=${d._id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 active:bg-purple-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">{d.divisionName}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate-500">
                    {show("campuses") && <span>{d.campusCount} campuses</span>}
                    {show("attended") && <span className="font-semibold text-emerald-700">{d.attended} attended</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {show("total") && <span className="text-2xl font-extrabold tabular-nums text-purple-700">{d.total}</span>}
                  <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden />
                </div>
              </div>
              {cats.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-sm">
                  {cats.map((c) => (
                    <div key={c} className="flex justify-between gap-2">
                      <dt className="truncate text-slate-500">{c}</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">{d.categories[c] ?? 0}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className={`hidden sm:block ${tableWrap}`}>
        <table className="w-full text-sm" style={{ minWidth: 260 + cols.visible.length * 100 }}>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <SortTh label="Division" k="division" sort={sort} onSort={toggle} />
              {show("campuses") && <SortTh label="Campuses" k="campuses" sort={sort} onSort={toggle} numeric />}
              {show("total") && <SortTh label="Total" k="total" sort={sort} onSort={toggle} numeric />}
              {show("attended") && <SortTh label="Attended" k="attended" sort={sort} onSort={toggle} numeric />}
              <CatSortHeads sort={sort} onSort={toggle} only={cats} />
              <th scope="col" className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((d) => (
              <tr key={d._id} className="hover:bg-purple-50/50">
                <td className="px-3 py-3 font-semibold text-slate-900">
                  <Link href={`${linkBase}/campuses?divisionId=${d._id}`} className="hover:text-purple-700">
                    {d.divisionName}
                  </Link>
                </td>
                {show("campuses") && <td className="px-3 py-3 text-right tabular-nums text-slate-500">{d.campusCount}</td>}
                {show("total") && <td className="px-3 py-3 text-right font-bold tabular-nums text-purple-700">{d.total}</td>}
                {show("attended") && (
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-700">{d.attended}</td>
                )}
                <CatCells cats={d.categories} only={cats} />
                <td className="pr-3 text-slate-400">
                  <Link href={`${linkBase}/campuses?divisionId=${d._id}`} aria-label={`View ${d.divisionName} campuses`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
