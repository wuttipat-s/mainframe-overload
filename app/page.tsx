"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// เชื่อมต่อ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // 🔥 บรรทัดป้องกันบั๊ก: ล้างค่าความจำค้างทั้งหมด (เช่น MXMO ที่เคยค้างอยู่) ก่อนเริ่มชงเซสชันใหม่
    localStorage.clear();

    try {
      // 1. ค้นหาผู้ใช้จากตาราง profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.trim()) // ใช้ .trim() ป้องกันการก๊อปปี้เว้นวรรคเกินมา
        .eq("password", password.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // 2. บันทึกข้อมูลใหม่เอี่ยมลงเครื่องผู้ใช้ (LocalStorage)
        localStorage.setItem("game_player_id", data.id);
        localStorage.setItem("game_username", data.username);
        localStorage.setItem("game_role", data.role);

        // 3. แยกเส้นทาง (แอดมินไปหน้าควบคุม, ผู้เล่นไปหน้า MISSION_HUB)
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/stage"); // วิ่งตรงเข้าสู่หน้าหลักของเกมทันทีด้วยชื่อผู้เล่นใหม่
        }
      } else {
        setErrorMsg("ACCESS DENIED: ตรวจสอบ AGENT LOG และ AUTH_KEY อีกครั้ง");
      }
    } catch (err: any) {
      setErrorMsg(`SYSTEM ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 font-mono selection:bg-[#2CFFB5] selection:text-black">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2CFFB5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-md space-y-8 border border-neutral-800 bg-black/80 backdrop-blur-md p-10 rounded-xl shadow-[0_0_40px_rgba(44,255,181,0.05)]">
        
        <div className="text-center space-y-2 border-b border-neutral-900 pb-6">
          <div className="text-[#2CFFB5] text-4xl mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 11c0 3.532-2.122 6.55-5 7.822a10.057 10.057 0 010-15.644C9.878 4.45 12 7.468 12 11zM21 11c0 3.532-2.122 6.55-5 7.822a10.057 10.057 0 010-15.644C18.878 4.45 21 7.468 21 11z"></path>
            </svg>
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
              Username (คือ TEAM_01)
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
              Password (คือ 123456)
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
            className="w-full mt-4 border-2 border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-black text-xs py-4 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.15)] hover:shadow-[0_0_25px_rgba(44,255,181,0.4)] disabled:opacity-50"
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