import { redirect } from "next/navigation";

export default function AdminHome() {
  redirect("/adminlogin/legacy/totaldelegates");
}
