"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ดึงตัวเชื่อมต่อมาตรฐานกลาง

interface PlayerProgress {
  player_id: string;
  profiles: { username: string } | null;
  current_stage: number;
  is_completed: boolean;
  updated_at: string;
}

interface GameConfig {
  level_id: number;
  is_active: boolean;
  secret_answer: string;
}

export default function AdminDashboard() {
  const [players, setPlayers] = useState<PlayerProgress[]>([]);
  const [configs, setConfigs] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // ดึงสถิติผู้เล่นและคอนฟิกหลังบ้าน
  const fetchData = async () => {
    try {
      // 1. ดึงคะแนนและสถิติผู้เล่นทุกคนรวมกับตารางโปรไฟล์ทีม
      const { data: progressData, error: progressErr } = await supabase
        .from("player_progress")
        .select(`
          player_id,
          current_stage,
          is_completed,
          updated_at,
          profiles:player_id ( username )
        `) as any;

      if (progressErr) throw progressErr;
      setPlayers(progressData || []);

      // 2. ดึงสถานะการล็อกด่านและเฉลยปัจจุบัน (ลบ unlock_time ออกแล้ว)
      const { data: configData, error: configErr } = await supabase
        .from("game_config")
        .select("level_id, is_active, secret_answer")
        .order("level_id", { ascending: true });

      if (configErr) throw configErr;
      setConfigs(configData || []);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); // ซิงก์เรียลไทม์ทุก 4 วินาที
    return () => clearInterval(interval);
  }, []);

  // บันทึกปรับแต่งระดับด่าน (เปิด-ปิด)
  const handleUpdateConfig = async (levelId: number, fields: Partial<GameConfig>) => {
    try {
      const { error } = await supabase
        .from("game_config")
        .update(fields)
        .eq("level_id", levelId);

      if (error) throw error;
      fetchData(); // ดึงข้อมูลอัปเดตใหม่ทันที
    } catch (err: any) {
      alert(`อัปเดตข้อมูลล้มเหลว: ${err.message}`);
    }
  };

  // ดำเนินการรีเซ็ต ล้างประวัติเพื่อเริ่มการซ้อมใหม่ของผู้เล่น
  const handleResetProgress = async (playerId: string) => {
    if (!confirm("คุณต้องการล้างประวัติความคืบหน้าของทีมนี้เพื่อเริ่มเล่นใหม่ใช่หรือไม่?")) return;

    setResettingId(playerId);
    try {
      const { error } = await supabase
        .from("player_progress")
        .delete()
        .eq("player_id", playerId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`ล้างสถานะล้มเหลว: ${err.message}`);
    } finally {
      setResettingId(null);
    }
  };

  // รีเซ็ตล้างประวัติผู้เล่นทั้งหมดพร้อมกัน
  const handleResetAllPlayers = async () => {
    if (!confirm("⚠️ คำเตือน: คุณต้องการล้างสถานะของผู้เล่นทุกคนออกจากตารางเพื่อเคลียร์คะแนนทั้งหมดใช่หรือไม่?")) return;

    try {
      const { error } = await supabase
        .from("player_progress")
        .delete()
        .neq("player_id", ""); // ลบทุกเรคคอร์ด

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`ล้างสถานะทั้งหมดล้มเหลว: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#2CFFB5] font-mono">
        <div className="animate-pulse">LOADING CENTRAL OPERATOR CONSOLE...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-6">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-8">
        <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
          📡 CENTRAL ADMIN COMMAND CONTROL
        </h1>
        <button
          onClick={handleResetAllPlayers}
          className="text-xs bg-red-950/40 border border-red-500/40 text-red-400 px-4 py-2 rounded hover:bg-red-500 hover:text-black transition-all"
        >
          RESET ALL PLAYERS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอนฟิกด่านของแอดมิน */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase border-b border-neutral-900 pb-2">
            ⚙️ STAGE CONFIGURATION
          </h2>
          <div className="space-y-4">
            {configs.map((cfg) => (
              <div key={cfg.level_id} className="border border-neutral-900 bg-[#050505] p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">STAGE 0{cfg.level_id}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.is_active !== false}
                      onChange={(e) => handleUpdateConfig(cfg.level_id, { is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2CFFB5]"></div>
                    <span className="ml-2 text-[10px] text-neutral-400">
                      {cfg.is_active !== false ? "ACTIVE" : "LOCKED"}
                    </span>
                  </label>
                </div>

                <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-900">
                  เฉลยด่าน: <span className="text-[#2CFFB5]">{cfg.secret_answer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* แดชบอร์ดตรวจสอบผู้เล่นแบบเรียลไทม์ */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase border-b border-neutral-900 pb-2">
            📊 REAL-TIME PLAYER TRACKING
          </h2>

          <div className="border border-neutral-900 bg-[#050505] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-900">
                <tr>
                  <th className="p-4">TEAM USERNAME</th>
                  <th className="p-4">CURRENT POSITION</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">LAST RE-SYNC</th>
                  <th className="p-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-600">
                      ไม่มีระบบตรวจพบบันทึกการเล่นย่อยของผู้เล่น ณ ขณะนี้
                    </td>
                  </tr>
                ) : (
                  players.map((p) => (
                    <tr key={p.player_id} className="hover:bg-neutral-950/40">
                      <td className="p-4 text-white font-bold">
                        {p.profiles?.username || p.player_id}
                      </td>
                      <td className="p-4 text-amber-400">
                        {p.is_completed ? "COMPLETED" : `STAGE_0${p.current_stage}`}
                      </td>
                      <td className="p-4">
                        {p.is_completed ? (
                          <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            CRACKED
                          </span>
                        ) : (
                          <span className="text-[#2CFFB5] bg-black px-2 py-0.5 rounded border border-[#2CFFB5]/20 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-neutral-500 text-[10px]">
                        {new Date(p.updated_at).toLocaleString("th-TH")}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleResetProgress(p.player_id)}
                          disabled={resettingId === p.player_id}
                          className="text-[10px] border border-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-black transition-all"
                        >
                          {resettingId === p.player_id ? "RESETTING..." : "RESET"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}