/*
 * SERVER-ONLY: secret key for the public Muta'allim report
 * (/mutaallim-conference/report/<key>). It shows phone numbers, so never
 * import this from a "use client" file. Change the key to revoke the link.
 */
const MUTAALLIM_REPORT_KEY = "ebzSJmZyLg3f5cVFUN83ww";

export const mutaallimReportPath = `/mutaallim-conference/report/${MUTAALLIM_REPORT_KEY}`;

export const isMutaallimReportKey = (key: unknown) => key === MUTAALLIM_REPORT_KEY;
