"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CampusRow,
  CatCells,
  CatSortHeads,
  ColumnsMenu,
  EVENT_TITLE,
  Loading,
  MobileSortBar,
  SortTh,
  WhatsAppShareButton,
  catColumns,
  catGetters,
  catKey,
  catLine,
  tableWrap,
  today,
  useColumns,
  useSource,
  useSummary,
  useTableSort,
  visibleCats,
} from "../shared";

type Row = CampusRow & { division: string };

/* Campus name always shows; the rest can be hidden (and leave the share too) */
const COLUMNS = [
  { id: "division", label: "Division" },
  { id: "total", label: "Total" },
  { id: "attended", label: "Attended" },
  ...catColumns,
];

/* Uses useSearchParams: render inside <Suspense> */
export default function CampusesView() {
  const { data, loading, error } = useSummary();
  const { linkBase } = useSource();
  const router = useRouter();
  const divisionId = useSearchParams().get("divisionId") || "";
  const cols = useColumns("campuses", COLUMNS);
  const { show } = cols;
  const cats = visibleCats(show);

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const nameOf = new Map(data.divisions.map((d) => [d._id, d.divisionName]));
    return data.campuses
      .filter((c) => !divisionId || c.divisionId === divisionId)
      .map((c) => ({ ...c, division: nameOf.get(c.divisionId) || "" }));
  }, [data, divisionId]);

  const { sorted, sort, toggle, setSort } = useTableSort<Row>(
    rows,
    {
      campus: (c) => c.name,
      division: (c) => c.division,
      total: (c) => c.total,
      attended: (c) => c.attended,
      ...catGetters<Row>(),
    },
    { key: "total", dir: "desc" }
  );

  if (!data) return <Loading error={loading ? undefined : error} />;

  const divisionName = data.divisions.find((d) => d._id === divisionId)?.divisionName;
  const totalShown = rows.reduce((a, r) => a + r.total, 0);
  const attendedShown = rows.reduce((a, r) => a + r.attended, 0);

  /* One line per campus with only the visible columns */
  const message = () =>
    [
      EVENT_TITLE,
      "SSF Kozhikode South",
      `📅 ${today()}`,
      "",
      `🏫 *Campus-wise${divisionName ? ` — ${divisionName} division` : ""}* · ${rows.length} campuses`,
      show("total") && `👥 *Registrations:* ${totalShown}`,
      show("attended") && `✅ *Attended:* ${attendedShown}`,
      "",
      ...sorted.map((c, i) => {
        const parts = [
          show("division") && !divisionName && c.division,
          show("total") && `${c.total}`,
          show("attended") && `✅ ${c.attended}`,
        ].filter(Boolean);
        const head = `${i + 1}. *${c.name}*${parts.length ? ` — ${parts.join(" · ")}` : ""}`;
        return cats.length ? `${head}\n    ${catLine(c.categories, cats)}` : head;
      }),
    ]
      .filter((l) => l !== false)
      .join("\n");

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label htmlFor="div" className="sr-only text-sm font-semibold text-slate-700 sm:not-sr-only">Division</label>
        <select
          id="div"
          value={divisionId}
          onChange={(e) =>
            router.replace(e.target.value ? `${linkBase}/campuses?divisionId=${e.target.value}` : `${linkBase}/campuses`)
          }
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base sm:w-auto sm:text-sm"
        >
          <option value="">All divisions</option>
          {[...data.divisions].sort((a, b) => a.divisionName.localeCompare(b.divisionName)).map((d) => (
            <option key={d._id} value={d._id}>{d.divisionName}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500">
          {rows.length} campuses · {totalShown} registrations · {attendedShown} attended
        </span>
        <div className="flex gap-2 sm:ml-auto">
          <ColumnsMenu cols={cols} />
          <WhatsAppShareButton title="Campus-wise registrations" build={message} disabled={!rows.length} />
        </div>
      </div>

      <MobileSortBar
        options={[
          { key: "total", label: "Total registered", numeric: true },
          { key: "attended", label: "Attended", numeric: true },
          { key: "campus", label: "Campus name" },
          { key: "division", label: "Division" },
          ...cats.map((c) => ({ key: catKey(c), label: c, numeric: true })),
        ]}
        sort={sort}
        onChange={setSort}
      />

      {/* Phone: one card per campus */}
      <ul className="space-y-2.5 sm:hidden">
        {sorted.map((c) => (
          <li key={c._id}>
            <Link
              href={`${linkBase}/registrations?campusId=${c._id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 active:bg-purple-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold leading-snug text-slate-900">
                    {c.name}
                    {!c.isActive && (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 align-middle text-xs font-medium text-slate-600">inactive</span>
                    )}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate-500">
                    {show("division") && !divisionId && <span>{c.division}</span>}
                    {show("attended") && <span className="font-semibold text-emerald-700">{c.attended} attended</span>}
                  </p>
                </div>
                {show("total") && <span className="shrink-0 text-2xl font-extrabold tabular-nums text-purple-700">{c.total}</span>}
              </div>
              {cats.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-sm">
                  {cats.map((k) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="truncate text-slate-500">{k}</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">{c.categories[k] ?? 0}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Link>
          </li>
        ))}
        {!rows.length && <li className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">No campuses.</li>}
      </ul>

      <div className={`hidden sm:block ${tableWrap}`}>
        <table className="w-full text-sm" style={{ minWidth: 260 + cols.visible.length * 100 }}>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <SortTh label="Campus" k="campus" sort={sort} onSort={toggle} />
              {show("division") && <SortTh label="Division" k="division" sort={sort} onSort={toggle} />}
              {show("total") && <SortTh label="Total" k="total" sort={sort} onSort={toggle} numeric />}
              {show("attended") && <SortTh label="Attended" k="attended" sort={sort} onSort={toggle} numeric />}
              <CatSortHeads sort={sort} onSort={toggle} only={cats} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((c) => (
              <tr key={c._id} className="hover:bg-purple-50/50">
                <td className="px-3 py-3 font-semibold text-slate-900">
                  <Link href={`${linkBase}/registrations?campusId=${c._id}`} className="hover:text-purple-700">
                    {c.name}
                  </Link>
                  {!c.isActive && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">inactive</span>}
                </td>
                {show("division") && <td className="px-3 py-3 text-slate-600">{c.division}</td>}
                {show("total") && <td className="px-3 py-3 text-right font-bold tabular-nums text-purple-700">{c.total}</td>}
                {show("attended") && (
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-700">{c.attended}</td>
                )}
                <CatCells cats={c.categories} only={cats} />
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={1 + cols.visible.length} className="px-3 py-10 text-center text-slate-500">No campuses.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
