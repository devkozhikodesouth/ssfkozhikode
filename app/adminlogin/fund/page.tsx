import { redirect } from "next/navigation";

// Old entry point: Executive now lives at /adminlogin/fund/executive (like /council)
export default function FundAdminIndex() {
  redirect("/adminlogin/fund/executive");
}
