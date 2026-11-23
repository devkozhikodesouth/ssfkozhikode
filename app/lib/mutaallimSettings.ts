import { connectDB } from "@/app/lib/mongodb";
import Setting from "@/app/models/Setting";

const REG_OPEN_KEY = "mutaallim.registrationOpen";

/* Registration is open unless an admin has closed it */
export async function isMutaallimRegistrationOpen(): Promise<boolean> {
  await connectDB();
  const s: any = await Setting.findOne({ key: REG_OPEN_KEY }).lean();
  return s?.value !== false;
}

export async function setMutaallimRegistrationOpen(open: boolean): Promise<boolean> {
  await connectDB();
  await Setting.findOneAndUpdate({ key: REG_OPEN_KEY }, { key: REG_OPEN_KEY, value: open }, { upsert: true });
  return open;
}

export const REGISTRATION_CLOSED_MESSAGE =
  "Registration has closed. New registrations are no longer accepted. If you registered earlier, enter that mobile number to get your pass.";
