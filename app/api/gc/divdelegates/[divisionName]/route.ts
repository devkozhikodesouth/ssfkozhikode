import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandConclave from "@/app/models/GrandConclave";
import Division from "@/app/models/Division";
import mongoose from "mongoose";

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

export async function GET(
    req: Request,
    { params }: { params: Promise<{ divisionName: string }> }
) {
    try {
        await connectDB();

        const { divisionName: rawDivisionName } = await params;
        const divisionParam = rawDivisionName ? decodeURIComponent(String(rawDivisionName)).trim() : "";

        if (!divisionParam) {
            return NextResponse.json(
                { success: false, message: "Invalid division name" },
                { status: 400 }
            );
        }

        // Resolve human-readable name from code or direct name
        const resolvedName =
            Object.keys(divisions).find(
                (key) =>
                    divisions[key].toLowerCase() === divisionParam.toLowerCase() ||
                    key.toLowerCase() === divisionParam.toLowerCase()
            ) || divisionParam;

        // 1️⃣ Find Division (case-insensitive)
        const division = await Division.findOne({
            divisionName: { $regex: new RegExp(`^${resolvedName}$`, "i") },
        }).lean();

        if (!division) {
            return NextResponse.json(
                { success: false, message: "Division not found" },
                { status: 404 }
            );
        }

        // 2️⃣ Fetch division-level delegates (sectorId = null)
        const delegates = await GrandConclave.find({
            divisionId: new mongoose.Types.ObjectId(division._id),
            sectorId: null,
        })
            .select("name mobile designation ticket createdAt attendance")
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            divisionName: division.divisionName,
            totalDelegates: delegates.length,
            delegates,
        });
    } catch (error) {
        console.error("Division delegates fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}