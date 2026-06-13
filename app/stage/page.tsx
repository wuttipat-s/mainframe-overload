"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [inputName, setInputName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // เช็คว่าเคยล็อกอินไว้หรือยัง ถ้าเคยแล้วให้ดีดไปหน้าตาม Role ทันที
  useEffect(() => {
    const storedRole = localStorage.getItem("game_role");
    if (storedRole === "admin") {
      router.push("/admin/dashboard"); // เปลี่ยนพาธตามที่คุณตั้งไว้จริง
    } else if (storedRole === "player") {
      router.push("/stage");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // ตัดช่องว่างและบังคับเป็นตัวพิมพ์ใหญ่หมดเพื่อลดปัญหาการพิมพ์ผิด (เช่น team_01 -> TEAM_01)
    const formattedName = inputName.trim().toUpperCase();

    if (!formattedName) {
      setErrorMsg("ACCESS DENIED: กรุณากรอกรหัสประจำทีม");
      return;
    }

    setIsLoading(true);

    // ⚡ 1. ลอจิกสำหรับ Admin: ถ้าพิมพ์คำว่า ADMIN หรือโค้ดเนมแอดมิน
    if (formattedName === "ADMIN" || formattedName === "MXMO") {
      localStorage.setItem("game_player_id", "admin_system");
      localStorage.setItem("game_username", formattedName);
      localStorage.setItem("game_role", "admin"); // เซ็ต Role เป็นแอดมิน
      
      setTimeout(() => {
        router.push("/admin"); // เปลี่ยนเป็น /admin/dashboard หากพาธคุณชื่อนี้
      }, 500);
      return;
    }

    // ⚡ 2. ลอจิกสำหรับผู้เล่น (น้องๆ): 
    // จุดสำคัญ: ใช้ชื่อทีม (formattedName) เป็น game_player_id ไปเลย เพื่อไม่ให้ข้อมูลซ้ำกัน
    localStorage.setItem("game_player_id", formattedName); 
    localStorage.setItem("game_username", formattedName);
    localStorage.setItem("game_role", "player"); // เซ็ต Role เป็นผู้เล่น

    setTimeout(() => {
      router.push("/stage");
    }, 500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono p-6 selection:bg-[#2CFFB5] selection:text-black relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex flex-col justify-center items-center">
        <div className="w-[500px] h-[500px] border-[1px] border-[#2CFFB5] rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="text-[10px] text-[#2CFFB5] uppercase tracking-[0.3em] animate-pulse">
            Secure Terminal System
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">
            ICT<span className="text-[#2CFFB5]">_</span>HACK
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wider pt-2">
            Enter operator credentials to proceed
          </p>
        </div>

        <div className="bg-[#050505] border border-neutral-900 rounded-lg p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2CFFB5]/50 to-transparent"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase text-neutral-400 tracking-widest">
                OPERATOR ID / TEAM NAME
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. TEAM_01"
                className="w-full bg-black border border-neutral-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] transition-colors font-mono tracking-widest disabled:opacity-50 uppercase text-center"
                autoComplete="off"
              />
            </div>

            {errorMsg && (
              <div className="text-[10px] text-red-500 bg-red-950/20 border border-red-500/20 p-2 rounded text-center tracking-wider">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2CFFB5] text-black hover:bg-[#2CFFB5]/80 font-black text-xs py-3.5 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "AUTHENTICATING..." : "INITIATE CONNECTION"}
            </button>
          </form>
        </div>
        
        <footer className="text-center text-[9px] text-neutral-700">
          School of Information and Communication Technology
          <br/>University of Phayao
        </footer>
      </div>
    </main>
  );
}