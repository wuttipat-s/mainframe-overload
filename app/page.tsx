"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// กำหนดประเภทสล็อตเพื่อป้องกันการพิมพ์ผิด (Type Safety)
type LoginSlot = "player1" | "player2" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [loginSlot, setLoginSlot] = useState<LoginSlot>("player1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // สถานะการเข้าสู่ระบบของแต่ละสล็อต (เอาไว้โชว์บน UI)
  const [p1Ready, setP1Ready] = useState<string | null>(null);
  const [p2Ready, setP2Ready] = useState<string | null>(null);

  // โหลดสถานะเดิมจาก LocalStorage ตอนเปิดหน้าเว็บ
  useEffect(() => {
    if (typeof window !== "undefined") {
      setP1Ready(localStorage.getItem("p1_game_username"));
      setP2Ready(localStorage.getItem("p2_game_username"));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. ค้นหาผู้ใช้จากตาราง profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.trim())
        .eq("password", password.trim()) // ข้อควรระวัง: ในโปรดักชันจริงควรใช้การ Hash รหัสผ่านนะคร้าบ
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg("ACCESS DENIED: ตรวจสอบ USERNAME และ PASSWORD อีกครั้ง");
        setIsLoading(false);
        return;
      }

      // 2. ตรวจสอบสิทธิ์ให้ตรงกับกติกาของระบบ
      if (loginSlot === "admin" && data.role !== "admin") {
        setErrorMsg("ACCESS DENIED: บัญชีนี้ไม่มีสิทธิ์แอดมิน");
        setIsLoading(false);
        return;
      }

      if ((loginSlot === "player1" || loginSlot === "player2") && data.role === "admin") {
        setErrorMsg("ACCESS DENIED: บัญชีแอดมินไม่สามารถลงทะเบียนในช่องผู้เล่นได้");
        setIsLoading(false);
        return;
      }

      // 3. จัดการบันทึกข้อมูลแยกตาม Slot เพื่อไม่ให้ทับกัน
      if (loginSlot === "admin") {
        localStorage.setItem("admin_id", data.id);
        localStorage.setItem("admin_username", data.username);
        localStorage.setItem("admin_role", data.role);
        
        router.push("/admin/dashboard");
      } else {
        // จัดการฝั่ง Player (Player 1 หรือ Player 2)
        const prefix = loginSlot === "player1" ? "p1_" : "p2_";
        
        localStorage.setItem(`${prefix}game_player_id`, data.id);
        localStorage.setItem(`${prefix}game_username`, data.username);
        localStorage.setItem(`${prefix}game_role`, data.role);

        // อัปเดต State หน้าจอทันที
        if (loginSlot === "player1") setP1Ready(data.username);
        if (loginSlot === "player2") setP2Ready(data.username);

        // ⚡ [AUTO-INSERT SYSTEM]: เช็คและสร้าง Progress ด่าน
        const { data: checkProgress, error: progressError } = await supabase
          .from("player_progress")
          .select("player_id")
          .eq("player_id", data.id)
          .maybeSingle();

        if (progressError) throw progressError;

        if (!checkProgress) {
          const { error: insertError } = await supabase
            .from("player_progress")
            .insert([
              {
                player_id: data.id,
                current_stage: 1,
                is_completed: false,
              },
            ]);
          
          if (insertError) throw insertError;
          console.log("Generated player progress for:", data.username);
        }

        // ล้างฟอร์มเพื่อให้ผู้เล่นอีกคนมาพิมพ์ต่อได้สะดวก
        setUsername("");
        setPassword("");
        setErrorMsg(`SLOT [${loginSlot.toUpperCase()}] AUTHENTICATED!`);
      }
    } catch (err: any) {
      setErrorMsg(`SYSTEM ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันล้างเซสชันทั้งหมดเผื่อต้องการเริ่มล็อกอินใหม่
  const handleResetAll = () => {
    localStorage.clear();
    setP1Ready(null);
    setP2Ready(null);
    setErrorMsg("ALL SESSIONS CLEARED");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 font-mono selection:bg-[#2CFFB5] selection:text-black">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2CFFB5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-md space-y-6 border border-neutral-800 bg-black/80 backdrop-blur-md p-8 rounded-xl shadow-[0_0_40px_rgba(44,255,181,0.05)]">
        
        <div className="text-center space-y-2 border-b border-neutral-900 pb-4">
          <div className="mb-2">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-[#2CFFB5] shadow-[0_0_15px_rgba(44,255,181,0.3)]"
            />
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            software engineer
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            Multi-Agent Verification Status
          </p>
        </div>

        {/* 🟢 ส่วนแสดงสถานะการเตรียมความพร้อมของทีม */}
        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider">
          <div className={`p-3 border rounded text-center ${p1Ready ? "border-[#2CFFB5]/40 bg-[#2CFFB5]/5 text-[#2CFFB5]" : "border-neutral-850 bg-neutral-900/50 text-neutral-500"}`}>
            P1: {p1Ready ? p1Ready : "EMPTY SLOT"}
          </div>
          <div className={`p-3 border rounded text-center ${p2Ready ? "border-[#2CFFB5]/40 bg-[#2CFFB5]/5 text-[#2CFFB5]" : "border-neutral-850 bg-neutral-900/50 text-neutral-500"}`}>
            P2: {p2Ready ? p2Ready : "EMPTY SLOT"}
          </div>
        </div>

        {/* 🕹️ ปุ่มเลือก Slot ที่จะทำภารกิจล็อกอิน */}
        <div className="grid grid-cols-3 gap-1 bg-[#0a0a0a] p-1 rounded border border-neutral-800">
          {(["player1", "player2", "admin"] as LoginSlot[]).map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => { setLoginSlot(slot); setErrorMsg(""); }}
              className={`text-[10px] font-bold uppercase py-2 rounded transition-all tracking-wider ${
                loginSlot === slot 
                  ? "bg-[#2CFFB5] text-black shadow-[0_0_10px_rgba(44,255,181,0.3)]" 
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {slot === "admin" ? "ADMIN" : slot === "player1" ? "PLAYER 1" : "PLAYER 2"}
            </button>
          ))}
        </div>

        {/* ฟอร์มการยืนยันตัวตน */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-neutral-400 tracking-wider">
              Username สำหรับช่อง [{loginSlot.toUpperCase()}]
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2CFFB5] focus:ring-1 focus:ring-[#2CFFB5]/50 transition-all font-mono"
              placeholder="e.g. TEAM_01"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-neutral-400 tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2CFFB5] focus:ring-1 focus:ring-[#2CFFB5]/50 transition-all font-mono tracking-[0.3em]"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className={`text-[9px] p-2.5 rounded text-center border font-bold uppercase tracking-wider ${
              errorMsg.includes("AUTHENTICATED") || errorMsg.includes("CLEARED")
                ? "border-[#2CFFB5]/30 bg-[#2CFFB5]/10 text-[#2CFFB5]" 
                : "border-red-500/30 bg-red-500/10 text-red-500"
            }`}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 border-2 border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-black text-xs py-3 rounded transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? "VERIFYING..." : `AUTHENTICATE ${loginSlot.toUpperCase()}`}
          </button>
        </form>

        {/* 🚀 ปุ่มปล่อยตัวเข้าสู่ด่านเกม (จะเปิดให้กดเมื่อล็อคอินครบทั้ง 2 คนแล้ว) */}
        {p1Ready && p2Ready && (
          <button
            type="button"
            onClick={() => router.push("/stage")}
            className="w-full bg-[#2CFFB5] text-black font-black text-xs py-4 rounded transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(44,255,181,0.4)] animate-pulse"
          >
            ⚡ LAUNCH MISSION (START GAME) ⚡
          </button>
        )}

        {/* ส่วนปุ่ม Reset และ Footer */}
        <div className="flex flex-col items-center space-y-3 pt-2 border-t border-neutral-900">
          <button 
            type="button" 
            onClick={handleResetAll}
            className="text-[9px] text-neutral-500 hover:text-red-400 uppercase tracking-widest underline cursor-pointer"
          >
            Clear All Sessions (Reset)
          </button>
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest text-center">
            School of Information and Communication Technology, University of Phayao
          </p>
        </div>
      </div>
    </main>
  );
}