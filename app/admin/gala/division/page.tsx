import DivisionStudentTable from "@/app/components/DivisionStudentTable";

export default function DivisionPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-indigo-600">
        Division Wise Data
      </h1>
      <DivisionStudentTable />
    </div>
  );
}
