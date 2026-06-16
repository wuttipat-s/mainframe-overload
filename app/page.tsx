"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // แสดงสถานะผู้ใช้งานปัจจุบันของเครื่องนี้
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveUser(sessionStorage.getItem("game_username"));
      setActiveSlot(sessionStorage.getItem("game_slot"));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. ค้นหาผู้ใช้จากตาราง profiles โดยตรงจาก Username และ Password
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.trim())
        .eq("password", password.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg("ACCESS DENIED: ตรวจสอบ USERNAME และ PASSWORD อีกครั้ง");
        setIsLoading(false);
        return;
      }

      // ⚡ [CRITICAL FIX]: เคลียร์ค่าเก่าทั้งหมดในเครื่องทิ้งก่อน เพื่อป้องกันสิทธิ์เดิมค้าง
      sessionStorage.clear();

      // 2. ตรวจสอบสิทธิ์และดึงบทบาทจาก Database โดยตรง (Auto-Detect)
      // สมมติว่า data.role ใน DB เก็บค่าเป็น 'admin', 'player1', 'player2'
      const userRole = data.role; 

      // 3. บันทึกข้อมูลลง sessionStorage
      sessionStorage.setItem("game_player_id", data.id);
      sessionStorage.setItem("game_username", data.username);
      sessionStorage.setItem("game_role", userRole);
      sessionStorage.setItem("game_slot", userRole); // ใช้ role เป็นตัวแยก slot ไปเลย (player1 / player2 / admin)

      // 4. แยกเส้นทางตามบทบาทภารกิจเด็ดขาด
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "player1" || userRole === "player2") {
        
        // ⚡ [AUTO-INSERT SYSTEM]: ตรวจสอบและสร้างแถว Progress ในฐานข้อมูลก้อนกลาง
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
                current_stage: 1, // เริ่มต้นที่ด่าน 1
                is_completed: false,
              },
            ]);
          
          if (insertError) throw insertError;
          console.log("Generated player progress for:", data.username);
        }

        // ล็อกอินผ่านแล้ว พุ่งตรงเข้าสู่หน้าเล่นเกมของเครื่องนั้นๆ ทันที
        router.push("/stage");
      } else {
        setErrorMsg("ACCESS DENIED: ไม่พบสิทธิ์การใช้งานที่ถูกต้อง");
      }
    } catch (err: any) {
      setErrorMsg(`SYSTEM ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAll = () => {
    sessionStorage.clear();
    setActiveUser(null);
    setActiveSlot(null);
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
            RECON SYSTEM
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            Identity Verification Node
          </p>
        </div>

        {/* ส่วนแสดงสถานะผู้ใช้งานปัจจุบันของเครื่องนี้ */}
        <div className="text-[10px] uppercase font-bold tracking-wider">
          <div className={`p-3 border rounded text-center ${activeUser ? "border-[#2CFFB5]/40 bg-[#2CFFB5]/5 text-[#2CFFB5]" : "border-neutral-850 bg-neutral-900/50 text-neutral-500"}`}>
            CURRENT TERMINAL ACTIVE: {activeUser ? `${activeSlot?.toUpperCase()} (${activeUser})` : "NO ACTIVE SESSION"}
          </div>
        </div>

        {/* ฟอร์มการยืนยันตัวตน (ช่องเดียวรวมกันหมด) */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-neutral-400 tracking-wider">
              น้องรหัสพี่เป็น ผู้ชาย หรือ ผู้หญิง <br />
              ผู้ชาย Username = MAN <br />
              ผู็หญิง Username = WOMAN <br />
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2CFFB5] focus:ring-1 focus:ring-[#2CFFB5]/50 transition-all font-mono"
              placeholder="Enter your credential"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-neutral-400 tracking-wider">
              Password = 123456
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
            <div className={`text-[9px] p-2.5 rounded text-center border border-red-500/30 bg-red-500/10 text-red-500 font-bold uppercase tracking-wider`}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 border-2 border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-black text-xs py-3 rounded transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? "VERIFYING..." : "ENTER SYSTEM"}
          </button>
        </form>

        {/* ส่วนปุ่ม Reset และ Footer */}
        <div className="flex flex-col items-center space-y-3 pt-2 border-t border-neutral-900">
          <button 
            type="button" 
            onClick={handleResetAll}
            className="text-[9px] text-neutral-500 hover:text-red-400 uppercase tracking-widest underline cursor-pointer"
          >
            Clear Terminal Session (Reset)
          </button>
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest text-center">
            School of Information and Communication Technology, University of Phayao
          </p>
        </div>
      </div>
    </main>
  );
}