import type { TicketData } from "@/app/utils/mutaallim";

/* Shape a (populated) registration into the minimal public ticket */
export function toTicket(r: any): TicketData {
  return {
    registrationCode: r.registrationCode,
    name: r.name,
    division: r.divisionId?.divisionName ?? "",
    campus: r.campusId?.name ?? "",
    category: r.category,
  };
}
