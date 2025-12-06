import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
    try {
        const [cpu, mem, battery] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.battery()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                cpu: cpu.currentLoad,
                ram: {
                    total: mem.total,
                    used: mem.used,
                    free: mem.free,
                    active: mem.active
                },
                battery: {
                    percent: battery.percent,
                    isCharging: battery.isCharging,
                    cycles: battery.cycleCount
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
