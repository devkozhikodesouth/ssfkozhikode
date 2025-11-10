import DivisionTable from "./DivisionTable";

export default async function DivisionPage({ params }: { params: Promise<{ divisionName: string }> }) {
  // 👇 Unwrap the params promise
  const { divisionName } = await params;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <DivisionTable divisionName={divisionName} />
    </main>
  );
}
