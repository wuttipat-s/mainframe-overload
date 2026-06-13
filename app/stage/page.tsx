"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        .eq("password", password.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // ⚡ [CLEAN UP]: เคลียร์ค่าเก่าก่อน เพื่อให้มั่นใจว่าเครื่องนี้จะเป็นของไอดีใหม่แกะกล่อง
        localStorage.clear();

        // 2. บันทึกข้อมูลลงเครื่องนั้นๆ (เครื่องใครเครื่องมัน)
        localStorage.setItem("game_player_id", data.id);
        localStorage.setItem("game_username", data.username);
        localStorage.setItem("game_role", data.role);

        // 3. แยกเส้นทางตามบทบาท
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          
          // ⚡ [AUTO-INSERT SYSTEM]: เช็คความคืบหน้าในตาราง player_progress ของผู้เล่นคนนี้
          const { data: checkProgress, error: progressError } = await supabase
            .from("player_progress")
            .select("player_id")
            .eq("player_id", data.id)
            .maybeSingle();

          if (progressError) throw progressError;

          // ถ้าล็อกอินเข้ามาครั้งแรกแล้วยังไม่มีแถว progress ในเบส หน้าจอนี้จะสร้างให้ทันที
          if (!checkProgress) {
            const { error: insertError } = await supabase
              .from("player_progress")
              .insert([
                {
                  player_id: data.id,
                  current_stage: 1,     // เริ่มต้นด่าน 1
                  is_completed: false,   // ยังเล่นไม่จบ
                },
              ]);
            
            if (insertError) throw insertError;
            console.log("Successfully generated player progress for:", data.username);
          }

          // พุ่งตรงเข้าสู่หน้าเลือกด่านของตัวเองเลย!
          router.push("/stage"); 
        }
      } else {
        setErrorMsg("ACCESS DENIED: ตรวจสอบ USERNAME และ PASSWORD อีกครั้ง");
      }
    } catch (err: any) {
      setErrorMsg(`SYSTEM ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 font-mono selection:bg-[#2CFFB5] selection:text-black">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2CFFB5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-md space-y-8 border border-neutral-800 bg-black/80 backdrop-blur-md p-10 rounded-xl shadow-[0_0_40px_rgba(44,255,181,0.05)]">
        
        <div className="text-center space-y-2 border-b border-neutral-900 pb-6">
          <div className="mb-4">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-[#2CFFB5] shadow-[0_0_15px_rgba(44,255,181,0.5)]"
            />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-white uppercase">
            software engineer
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">
            Identity Verification Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-neutral-400 tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] focus:ring-1 focus:ring-[#2CFFB5]/50 transition-all font-mono"
              placeholder="e.g. TEAM_01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-neutral-400 tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] focus:ring-1 focus:ring-[#2CFFB5]/50 transition-all font-mono tracking-[0.3em]"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="text-[10px] p-3 rounded text-center border border-red-500/30 bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 border-2 border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-black text-xs py-4 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.15)] disabled:opacity-50"
          >
            {isLoading ? "AUTHENTICATING..." : "INITIALIZE ACCESS"}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-[9px] text-neutral-600 uppercase tracking-widest">
            School of Information and Communication Technology, University of Phayao
          </p>
        </div>
      </div>
    </main>
  );
}