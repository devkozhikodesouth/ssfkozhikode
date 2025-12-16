import DivisionTabs from "./DivisionTabs";


export default async function DivisionPage(
  context: { params: { divisionName: string } } | { params: Promise<{ divisionName: string }> }
) {
  // ✅ Handle both object and Promise cases
  const params =
    typeof (context.params as any).then === "function"
      ? await (context.params as Promise<{ divisionName: string }>)
      : (context.params as { divisionName: string });

  const rawParam = params?.divisionName;
  const divisionName = rawParam ? decodeURIComponent(String(rawParam)).trim() : "";

  // ✅ Division code → human-readable mapping
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

  // ✅ Reverse lookup (find key whose value matches route code)
  const matchedDivisionName = divisionName
    ? Object.keys(divisions).find(
        (key) => divisions[key].toLowerCase() === divisionName.toLowerCase()
      )
    : undefined;

  console.log("Matched Division:", matchedDivisionName || "No match found");

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      {matchedDivisionName ? (
        <div className="w-full max-w-5xl mt-14 md:mt-10">
          <DivisionTabs divisionName={matchedDivisionName} />
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-700 dark:text-gray-300">
          <h1 className="text-2xl font-bold mb-2">Invalid Division</h1>
          <p>
            The division code{" "}
            <span className="font-semibold text-red-500">
              {divisionName || "(empty)"}
            </span>{" "}
            was not found.
          </p>
        </div>
      )}
    </main>
  );
}
