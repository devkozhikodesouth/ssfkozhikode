import DivisionTable from "./DivisionTable";

export default async function DivisionPage({
  params,
}: {
  params: Promise<{ divisionName: string }>;
}) {
  // ✅ Await params to unwrap the promise
  const { divisionName } = await params;

  // Division name → code mapping
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

  // ✅ Reverse lookup: find the division name that matches the given code
  const matchedDivisionName = Object.keys(divisions).find(
    (key) => divisions[key].toLowerCase() === divisionName.toLowerCase()
  );

  console.log("Matched Division:", matchedDivisionName || "No match found");

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      {matchedDivisionName ? (
        // ✅ Pass the division name to DivisionTable
        <DivisionTable divisionName={matchedDivisionName} />
      ) : (
        // ❌ Fallback for invalid or unmatched division code
        <div className="text-center mt-20 text-gray-700">
          <h1 className="text-2xl font-bold mb-2">Invalid Division</h1>
          <p>
            The division code{" "}
            <span className="font-semibold">{divisionName}</span> was not found.
          </p>
        </div>
      )}
    </main>
  );
}
