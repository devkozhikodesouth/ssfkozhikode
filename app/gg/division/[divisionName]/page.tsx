import DivisionTabs from "./DivisionTabs";

export default async function DivisionPage(
  context: { params: { divisionName: string } } | { params: Promise<{ divisionName: string }> }
) {
  const params =
    typeof (context.params as any).then === "function"
      ? await (context.params as Promise<{ divisionName: string }>)
      : (context.params as { divisionName: string });

  const rawParam = params?.divisionName;
  const divisionName = rawParam ? decodeURIComponent(String(rawParam)).trim() : "";

  // Division code → human-readable mapping
  const divisions: Record<string, string> = {
    Feroke: "fer-a3f9",
    Koduvally: "kod-b7x2",
    Kozhikode: "koz-c8m4",
    Kunnamangalam: "kun-d6r1",
    Mavoor: "mav-e2k9",
    Mukkam: "muk-f5n7",
    Narikkuni: "nar-g3q8",
    Omassery: "oma-h9t6",
    Poonoor: "poo-j1v4",
    Thamarassery: "tha-k8p2",
  };

  // Reverse lookup (find key whose value matches route code or matches division name)
  const matchedDivisionName = divisionName
    ? Object.keys(divisions).find(
        (key) =>
          divisions[key].toLowerCase() === divisionName.toLowerCase() ||
          key.toLowerCase() === divisionName.toLowerCase()
      )
    : undefined;

  return (
    <main className="min-h-screen py-10 px-4 flex justify-center text-slate-900">
      {matchedDivisionName ? (
        <div className="w-full max-w-5xl mt-14 md:mt-10">
          <div className="text-center mb-8">
            <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium uppercase tracking-widest border border-purple-200 shadow-sm">
              Grand Conclave 26
            </span>
            <h1 className="text-3xl md:text-4xl font-medium text-slate-900 mt-3">
              {matchedDivisionName} Division
            </h1>
          </div>
          <DivisionTabs divisionName={matchedDivisionName} />
        </div>
      ) : (
        <div className="text-center mt-20 text-slate-300">
          <h1 className="text-2xl font-bold mb-2">Invalid Division</h1>
          <p>
            The division code{" "}
            <span className="font-semibold text-red-400">
              {divisionName || "(empty)"}
            </span>{" "}
            was not found.
          </p>
        </div>
      )}
    </main>
  );
}
