"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ⚡ เปลี่ยนมาใช้ตัวแชร์ส่วนกลาง ลดปัญหา Instance ชนกัน

interface StageConfig {
  level_id: number;
  unlock_time: Date;
  is_active: boolean;
}

export default function StageSelectionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [stageConfigs, setStageConfigs] = useState<StageConfig[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async (userId: string) => {
    if (!userId) return;
    try {
      // ดึงข้อมูลความคืบหน้าผู้เล่น
      let { data: progress, error: fetchError } = await supabase
        .from("player_progress")
        .select("current_stage, is_completed")
        .eq("player_id", userId)
        .maybeSingle();

      // 🚨 [FAIL-SAFE] ถ้าหากหน้า Login ทำงานพลาดแล้วไม่ยอมสร้างข้อมูล ให้หน้าจอนี้จัดการสร้างแถวใหม่ให้ทันที กันผู้เล่นติดลูปดีดออก
      if (!progress && !fetchError) {
        console.log("Fail-safe triggered: Generating missing player progress record...");
        const { data: newProgress } = await supabase
          .from("player_progress")
          .insert([{ player_id: userId, current_stage: 1, is_completed: false }])
          .select()
          .maybeSingle();
        
        if (newProgress) progress = newProgress;
      }

      if (progress) {
        setCurrentStage(Number(progress.current_stage));
        setIsGameCompleted(progress.is_completed);
      }

      // ดึงข้อมูลการตั้งค่าด่านจากแอดมิน
      const { data: configs } = await supabase
        .from("game_config")
        .select("level_id, unlock_time, is_active")
        .order("level_id", { ascending: true });

      if (configs) {
        const formattedConfigs = configs.map((c) => ({
          level_id: Number(c.level_id),
          unlock_time: new Date(c.unlock_time),
          is_active: c.is_active !== false
        }));
        setStageConfigs(formattedConfigs);
      }
    } catch (err) {
      console.error("Error loading dashboard telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // เช็ค Session ความปลอดภัยฝั่ง Client
    const storedId = sessionStorage.getItem("game_player_id");
    const storedName = sessionStorage.getItem("game_username");

    if (!storedId || !storedName) {
      console.log("No session found, redirecting to login...");
      router.push("/");
      return;
    }
    
    setPlayerId(storedId);
    setUsername(storedName);
    loadDashboardData(storedId);
  }, [router]);

  // ระบบ Polling อัปเดตสถานะด่านจากแอดมินทุก 4 วินาที
  useEffect(() => {
    if (!playerId) return;
    const interval = setInterval(() => {
      loadDashboardData(playerId);
    }, 4000);
    return () => clearInterval(interval);
  }, [playerId]);

  // นาฬิกานับถอยหลัง
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdownString = (targetTime: Date) => {
    const diffMs = targetTime.getTime() - currentTime.getTime();
    if (diffMs <= 0) return "UNLOCKED";
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStageStatus = (stageNum: number, targetTime: Date | null, isStageActive: boolean) => {
    if (isGameCompleted || currentStage > stageNum) return "COMPLETED";
    if (!isStageActive) return "LOCKED_ADMIN"; 
    if (currentStage < stageNum) return "LOCKED_PREVIOUS"; 
    if (targetTime && currentTime < targetTime) return "LOCKED_TIME"; 
    return "ACTIVE"; 
  };

  const STAGES = [
    { id: 1, title: "STAGE 01: STRING_CONCAT", desc: "กู้คืนชิ้นส่วนไฟล์ ID ระบบเมนเฟรมที่กระจัดกระจายด้วยลอจิก Python" },
    { id: 2, title: "STAGE 02: ARRAY_INDEXING", desc: "แกะรอยตำแหน่งพิกัดอาร์เรย์เพื่อประกอบคำศัพท์สำคัญประจำแผนก" },
    { id: 3, title: "STAGE 03: BINARY_PARSING", desc: "ถอดรหัสแพ็กเก็ตเลขฐานสองเพื่อเผยชื่อโค้ดเนมที่แท้จริงของพี่รหัส" },
  ];

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-[#2CFFB5]">
        <div className="text-sm tracking-widest animate-pulse">INITIALIZING SECURE CHANNELS...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-8 selection:bg-[#2CFFB5] selection:text-black">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-10">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">MISSION<span className="text-[#2CFFB5] animate-pulse">_</span></h1>
          <p className="text-[10px] text-neutral-500 mt-1 uppercase">OPERATOR: {username} | STATUS: CONNECTED</p>
        </div>
        <button
          onClick={() => {
            sessionStorage.clear();
            router.push("/");
          }}
          className="text-xs border border-red-500/50 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-black transition-all uppercase tracking-wider font-bold"
        >
          LOGOUT
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-8 my-auto flex flex-col justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Mission Select</h2>
          <p className="text-[11px] text-neutral-500">เลือกด่านย่อยที่ต้องการปลดล็อก เพื่อรับคำใบ้จากพี่รหัสของคุณ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAGES.map((stage) => {
            const config = stageConfigs.find((c) => c.level_id === stage.id);
            const targetTime = config?.unlock_time || null;
            const isStageActive = config ? config.is_active : true;
            const status = getStageStatus(stage.id, targetTime, isStageActive);

            return (
              <div
                key={stage.id}
                className={`flex flex-col justify-between border rounded-lg p-6 min-h-[280px] transition-all duration-300 ${
                  status === "COMPLETED"
                    ? "border-emerald-500/10 bg-emerald-950/5 text-emerald-400"
                    : status === "ACTIVE"
                    ? "border-[#2CFFB5] bg-[#2CFFB5]/5 shadow-[0_0_15px_rgba(44,255,181,0.05)] text-[#2CFFB5]"
                    : "border-neutral-900 bg-neutral-950/40 text-neutral-600"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                    <span>LEVEL 0{stage.id}</span>
                    {status === "COMPLETED" && <span className="text-emerald-500">✓ COMPLETED</span>}
                    {status === "ACTIVE" && <span className="text-[#2CFFB5] font-bold">READY TO PLAY</span>}
                    {status === "LOCKED_PREVIOUS" && <span className="text-neutral-500">🔒 PREV_REQUIRED</span>}
                    {status === "LOCKED_ADMIN" && <span className="text-red-500 animate-pulse">🔒 OFFLINE</span>}
                    {status === "LOCKED_TIME" && <span className="text-red-500 animate-pulse">⏳ SYSTEM_LOCKED</span>}
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold tracking-wider ${status === "ACTIVE" ? "text-white" : "text-neutral-300"}`}>
                      {stage.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-neutral-900/50 pt-4">
                  {status === "LOCKED_ADMIN" && (
                    <div className="text-center py-4">
                      <div className="text-[10px] text-red-500 uppercase tracking-widest animate-pulse font-bold">ปิดระบบชั่วคราวโดยแอดมิน</div>
                    </div>
                  )}

                  {status === "LOCKED_TIME" && (
                    <div className="text-center">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-widest">ปลดล็อกในอีก</div>
                      <div className="text-xl font-black text-red-500 tracking-wider py-1 animate-pulse">
                        {targetTime ? getCountdownString(targetTime) : "OFFLINE"}
                      </div>
                    </div>
                  )}

                  {status === "LOCKED_PREVIOUS" && (
                    <div className="text-center py-4 text-[10px] text-neutral-600 uppercase">ต้องทำด่านก่อนหน้าให้สำเร็จ</div>
                  )}

                  {status === "COMPLETED" && (
                    <button
                      onClick={() => router.push(`/stage/${stage.id}`)}
                      className="w-full text-center py-2.5 rounded text-[10px] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest font-bold"
                    >
                      ENTER PROTOCOL (REVIEW)
                    </button>
                  )}

                  {status === "ACTIVE" && (
                    <button
                      onClick={() => router.push(`/stage/${stage.id}`)}
                      className="w-full text-center py-2.5 rounded text-[10px] bg-[#2CFFB5] text-black font-black hover:bg-[#2CFFB5]/85 transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(44,255,181,0.2)]"
                    >
                      ENTER PROTOCOL
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <footer className="text-center text-[9px] text-neutral-700 mt-12">School of Information and Communication Technology, University of Phayao</footer>
    </main>
  );
}