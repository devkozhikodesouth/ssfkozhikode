import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import GrandConclave from "@/app/models/GrandConclave";
import { CloudCog } from "lucide-react";


/* ----------------------------------------------------
 * GET : Fetch user by mobile
 * -------------------------------------------------- */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const mobile = searchParams.get("mobile");

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return NextResponse.json(
                { success: false, message: "Invalid mobile number" },
                { status: 400 }
            );
        }

        const user = await GrandConclave.findOne({ mobile })
            .populate("divisionId", "divisionName")
            .populate("sectorId", "sectorName")
            .lean();

        console.log(user);
        if (!user) {
            return NextResponse.json({ success: true, user: null });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                mobile: user.mobile,
                ticket: user.ticket,
                division: user.divisionId?.divisionName ?? null,
                sector: user.sectorId?.sectorName ?? null,
            },
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

/* ----------------------------------------------------
 * POST : Register new user
 * -------------------------------------------------- */
export async function POST(req: Request) {
    try {
        await connectDB();

        const {
            name,
            mobile,
            organizationLevel,
            designation,
            division,
            sector,
        } = await req.json();


        /* ---------- Basic Validation ---------- */
        if (!name || !mobile || !organizationLevel || !designation || !division) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return NextResponse.json(
                { success: false, message: "Invalid mobile number" },
                { status: 400 }
            );
        }

        /* ---------- Prevent Duplicate ---------- */
        const exists = await GrandConclave.findOne({ mobile });
        if (exists) {
            return NextResponse.json(
                { success: false, message: "Mobile already registered" },
                { status: 409 }
            );
        }

        /* ---------- Resolve Division ---------- */
        const divisionDoc = await Division.findOne({ divisionName: division });
        if (!divisionDoc) {
            return NextResponse.json(
                { success: false, message: "Invalid division" },
                { status: 400 }
            );
        }

        /* ---------- Resolve Sector (if needed) ---------- */
        let sectorId = null;

        if (organizationLevel === "sector") {
            if (!sector) {
                return NextResponse.json(
                    { success: false, message: "Sector is required" },
                    { status: 400 }
                );
            }

            const sectorDoc = await Sector.findOne({
                sectorName: sector,
                divisionId: divisionDoc._id,
            });

            if (!sectorDoc) {
                return NextResponse.json(
                    { success: false, message: "Invalid sector" },
                    { status: 400 }
                );
            }

            sectorId = sectorDoc._id;
        }

        /* ---------- Create Record ---------- */
        const user = await GrandConclave.create({
            name,
            mobile,
            organizationLevel,
            designation,
            divisionId: divisionDoc._id,
            sectorId,
        });

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                mobile: user.mobile,
                ticket: user.ticket,
            },
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Duplicate mobile number" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
