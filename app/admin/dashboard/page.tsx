"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TeamProgress {
  id: string;
  username: string;
  current_stage: number;
  is_completed: boolean;
  updated_at: string;
}

interface StageConfig {
  level_id: number;
  unlock_time: string;
  secret_answer: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [configs, setConfigs] = useState<StageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "single" | "all";
    playerId?: string;
    teamName?: string;
  }>({
    isOpen: false,
    type: "single",
    playerId: "",
    teamName: ""
  });

  const fetchDashboardData = async () => {
    try {
      setDbError(null);
      // 1. ดึงข้อมูลลีดเดอร์บอร์ดผู้เล่น
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("role", "player");

      if (pError) throw pError;

      const { data: progress, error: prError } = await supabase
        .from("player_progress")
        .select("*");

      if (prError) throw prError;

      const combinedData: TeamProgress[] = (profiles || []).map((p) => {
        const prog = (progress || []).find((prog) => prog.player_id === p.id);
        return {
          id: p.id,
          username: p.username,
          current_stage: prog?.current_stage || 1, 
          is_completed: prog?.is_completed || false,
          updated_at: prog?.updated_at ? new Date(prog.updated_at).toLocaleTimeString("th-TH") : "ยังไม่เริ่ม",
        };
      });

      combinedData.sort((a, b) => b.current_stage - a.current_stage);
      setTeams(combinedData);

      const { data: gameConfigs, error: gcError } = await supabase
        .from("game_config")
        .select("*")
        .order("level_id", { ascending: true });

      if (gcError) throw gcError;

      // ระบบ Auto-Seed
      if (!gameConfigs || gameConfigs.length === 0) {
        const defaultConfigs = [
          { level_id: 1, unlock_time: new Date().toISOString(), secret_answer: "540026894", is_active: true },
          { level_id: 2, unlock_time: new Date(Date.now() + 300000).toISOString(), secret_answer: "ซอฟต์แวร์", is_active: true },
          { level_id: 3, unlock_time: new Date(Date.now() + 600000).toISOString(), secret_answer: "MXMO", is_active: true }
        ];

        const { error: seedError } = await supabase
          .from("game_config")
          .upsert(defaultConfigs);

        if (seedError) throw seedError;
        fetchDashboardData();
        return;
      }

      const formatted = gameConfigs.map((c) => {
        const d = new Date(c.unlock_time);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const localISOTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        return {
          level_id: Number(c.level_id),
          unlock_time: localISOTime,
          secret_answer: c.secret_answer || "",
          is_active: c.is_active !== false
        };
      });
      setConfigs(formatted);

    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setDbError(err.message || "ตาราง game_config หรือคอลัมน์ไม่สมบูรณ์ โปรดเปิด SQL Editor เพื่อสร้างตารางใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("game_role");
    if (role !== "admin") {
      router.push("/");
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleUpdateConfig = async (levelId: number, unlockTimeStr: string, secretAnswer: string, isActive: boolean) => {
    setIsActionLoading(true);
    setStatusMsg("");
    try {
      const dateObj = new Date(unlockTimeStr);
      const utcTimeIso = dateObj.toISOString();

      const { error } = await supabase
        .from("game_config")
        .upsert({
          level_id: levelId,
          unlock_time: utcTimeIso,
          secret_answer: secretAnswer.trim(),
          is_active: isActive
        }, { onConflict: "level_id" });

      if (error) throw error;
      
      setStatusMsg(`⚡ SUCCESS: ซิงค์ข้อมูล STAGE 0${levelId} ไปยังผู้เล่นเรียบร้อย!`);
      setTimeout(() => setStatusMsg(""), 3000);
      fetchDashboardData();
    } catch (err: any) {
      setStatusMsg(`❌ ERROR: ไม่สามารถอัปเดตข้อมูลด่านได้ (${err.message})`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeResetTeam = async (playerId: string, teamName: string) => {
    setIsActionLoading(true);
    setStatusMsg("");
    try {
      const { error } = await supabase
        .from("player_progress")
        .delete()
        .eq("player_id", playerId);

      if (error) throw error;

      setStatusMsg(`🧹 รีเซ็ตทีม ${teamName} เรียบร้อย!`);
      setTimeout(() => setStatusMsg(""), 3000);
      fetchDashboardData();
    } catch (err: any) {
      setStatusMsg(`❌ RESET ERROR: ${err.message}`);
    } finally {
      setIsActionLoading(false);
      setConfirmModal({ isOpen: false, type: "single" });
    }
  };

  const executeResetAllTeams = async () => {
    setIsActionLoading(true);
    setStatusMsg("");
    try {
      const { error } = await supabase
        .from("player_progress")
        .delete()
        .neq("player_id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      setStatusMsg("🚨 ล้างความคืบหน้าของทุกทีมในระบบเป็นศูนย์สำเร็จ!");
      setTimeout(() => setStatusMsg(""), 4000);
      fetchDashboardData();
    } catch (err: any) {
      setStatusMsg(`❌ RESET ALL ERROR: ${err.message}`);
    } finally {
      setIsActionLoading(false);
      setConfirmModal({ isOpen: false, type: "all" });
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-8 selection:bg-[#2CFFB5] selection:text-black">
      
      <div className="flex justify-between items-center border-b border-neutral-900 pb-6 mb-8">
        <div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            MAINFRAME_COMMAND_CENTER<span className="animate-ping text-red-500 font-bold">.</span>
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase mt-1">Live tracking, timing override and progress management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setConfirmModal({ isOpen: true, type: "all" })}
            disabled={isActionLoading}
            className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-black text-xs px-4 py-2 rounded transition-all font-bold uppercase tracking-wide disabled:opacity-50"
          >
            ☣️ Reset All Progress
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="border border-neutral-700 text-neutral-400 hover:border-white hover:text-white text-xs px-4 py-2 rounded transition-all font-bold uppercase"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-6 text-xs text-center border border-[#2CFFB5]/30 bg-[#2CFFB5]/5 text-[#2CFFB5] p-3 rounded tracking-wider animate-pulse font-bold">
          {statusMsg}
        </div>
      )}

      {dbError && (
        <div className="mb-6 text-xs text-center border border-red-500/30 bg-red-500/5 text-red-500 p-4 rounded tracking-wider font-bold space-y-2">
          <div>⚠️ {dbError}</div>
          <div className="text-[10px] text-neutral-500">กรุณาตรวจสอบว่าคุณได้คัดลอก SQL สร้างตารางตัวเต็มและรันใน Supabase เรียบร้อยแล้ว</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-neutral-900 bg-[#050505] p-6 rounded-lg">
          <div className="text-neutral-500 text-[10px] uppercase tracking-widest">Total Teams registered</div>
          <div className="text-3xl font-black text-white mt-1">{teams.length}</div>
        </div>
        <div className="border border-neutral-900 bg-[#050505] p-6 rounded-lg">
          <div className="text-neutral-500 text-[10px] uppercase tracking-widest">Global Security Policy</div>
          <div className="text-3xl font-black text-[#2CFFB5] mt-1">OVERRIDE</div>
        </div>
        <div className="border border-neutral-900 bg-[#050505] p-6 rounded-lg">
          <div className="text-neutral-500 text-[10px] uppercase tracking-widest">Leaderboard Refresh Rate</div>
          <div className="text-3xl font-black text-neutral-400 mt-1">5 SECONDS</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Table: Leaderboard */}
        <div className="lg:col-span-2 border border-neutral-900 bg-[#050505] rounded-lg overflow-hidden shadow-2xl h-fit">
          <div className="bg-[#0c0c0c] border-b border-neutral-900 px-6 py-4">
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Team Live Leaderboard</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-xs text-neutral-500 animate-pulse">
              CONNECTING TO REPOSITORY AND FETCHING TELEMETRY...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-900 bg-[#080808] text-[10px] text-neutral-400 uppercase tracking-widest">
                    <th className="px-6 py-4 font-normal">Team Name</th>
                    <th className="px-6 py-4 font-normal">Current Stage</th>
                    <th className="px-6 py-4 font-normal">Game Status</th>
                    <th className="px-6 py-4 font-normal">Last Submission</th>
                    <th className="px-6 py-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-xs">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-neutral-950/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white tracking-wide">
                        {team.username}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded text-[10px] font-bold text-neutral-300">
                          STAGE {team.current_stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {team.is_completed ? (
                          <span className="text-black bg-[#2CFFB5] text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-wider">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold text-[10px] tracking-wide flex items-center gap-1.5 animate-pulse">
                            ▶ IN_PROGRESS
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {team.updated_at}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, type: "single", playerId: team.id, teamName: team.username })}
                          disabled={isActionLoading}
                          className="border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black font-bold text-[9px] px-3 py-1.5 rounded transition-all uppercase tracking-wider disabled:opacity-30"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel: Stage Configuration & Timing Control */}
        <div className="border border-neutral-900 bg-[#050505] rounded-lg overflow-hidden shadow-2xl h-fit">
          <div className="bg-[#0c0c0c] border-b border-neutral-900 px-6 py-4">
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Stage Configuration & Timing</h2>
          </div>

          <div className="p-6 space-y-6">
            {configs.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500 animate-pulse">
                {dbError ? "FAILED TO INITIALIZE LINKS" : "LOADING CONFIGURATION LINKS..."}
              </div>
            ) : (
              configs.map((config) => (
                <div key={config.level_id} className="border border-neutral-900 bg-black p-4 rounded-lg space-y-3">
                  <div className="text-[10px] font-black text-white tracking-widest uppercase flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span>STAGE 0{config.level_id} CONTROL</span>
                    
                    {/* Manual Open/Close Checkbox Toggle Switch (Auto-Save) */}
                    <div className="flex items-center gap-2 bg-neutral-950 px-2 py-1 rounded border border-neutral-900">
                      <span className="text-[8px] text-neutral-400 uppercase">ACTIVE</span>
                      <input
                        type="checkbox"
                        checked={config.is_active}
                        onChange={(e) => {
                          const newActive = e.target.checked;
                          const updated = configs.map((c) =>
                            c.level_id === config.level_id ? { ...c, is_active: newActive } : c
                          );
                          setConfigs(updated);
                          // สั่ง Save ลงฐานข้อมูลและลิ้งก์ฝั่งผู้เล่นทันทีที่กดสวิตช์
                          handleUpdateConfig(config.level_id, config.unlock_time, config.secret_answer, newActive);
                        }}
                        className="accent-[#2CFFB5] cursor-pointer w-3.5 h-3.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider text-neutral-500">คำตอบที่ถูกต้อง (Secret Key)</label>
                    <input
                      type="text"
                      value={config.secret_answer}
                      onChange={(e) => {
                        const updated = configs.map((c) =>
                          c.level_id === config.level_id ? { ...c, secret_answer: e.target.value } : c
                        );
                        setConfigs(updated);
                      }}
                      className="w-full bg-[#0d0d0d] border border-neutral-900 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CFFB5] font-mono tracking-wider"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider text-neutral-500">วันที่เวลาสำหรับการปลดล็อกด่าน</label>
                    <input
                      type="datetime-local"
                      value={config.unlock_time}
                      onChange={(e) => {
                        const updated = configs.map((c) =>
                          c.level_id === config.level_id ? { ...c, unlock_time: e.target.value } : c
                        );
                        setConfigs(updated);
                      }}
                      className="w-full bg-[#0d0d0d] border border-neutral-900 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2CFFB5] font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdateConfig(config.level_id, config.unlock_time, config.secret_answer, config.is_active)}
                    disabled={isActionLoading}
                    className="w-full text-center border border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-bold text-[9px] py-2 rounded transition-all uppercase tracking-widest disabled:opacity-30"
                  >
                    Apply Time & Key Override
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="border border-red-500/50 bg-[#0a0505] p-6 rounded-lg max-w-sm w-full space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] font-mono">
            <h3 className="text-xs font-black text-red-500 tracking-widest uppercase">
              ⚠️ OVERRIDE AUTHENTICATION REQUIRED
            </h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {confirmModal.type === "all" 
                ? "คำเตือน: คุณกำลังจะรีเซ็ตความคืบหน้าของทุกทีมทั้งหมด ระบบจะล้างค่าสเตตัสในฐานข้อมูลให้กลายเป็นศูนย์!" 
                : `คุณต้องการล้างความคืบหน้าและประวัติทั้งหมดของทีม "${confirmModal.teamName}" ใช่หรือไม่?`
              }
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: "single" })}
                className="flex-1 border border-neutral-800 text-neutral-500 hover:border-white hover:text-white text-[10px] font-black py-2 rounded uppercase"
              >
                ABORT
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "all") {
                    executeResetAllTeams();
                  } else if (confirmModal.playerId && confirmModal.teamName) {
                    executeResetTeam(confirmModal.playerId, confirmModal.teamName);
                  }
                }}
                className="flex-1 bg-red-500 text-black hover:bg-red-600 text-[10px] font-black py-2 rounded uppercase"
              >
                CONFIRM BYPASS
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-[9px] text-neutral-700 mt-12">
        COMMAND CONSOLE INTEGRATION v2.0.0 - REALTIME SYNC ENABLED
      </footer>
    </main>
  );
}