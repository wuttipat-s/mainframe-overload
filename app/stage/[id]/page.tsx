"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ⚡ ใช้ตัวแชร์ศูนย์กลางเพื่อความเสถียร

// คลังโจทย์ด่านย่อยของพี่รหัส (ปรับแต่งคำถาม-คำตอบตรงนี้ได้เลยครับ)
const STAGE_DATA: Record<string, { title: string; question: string; placeholder: string; answer: string; hint: string }> = {
  "1": {
    title: "STAGE 01: STRING_CONCAT",
    question: "จงต่อสายอักขระ (String) ใน Python เพื่อสร้างข้อความต้อนรับระบบ: กำหนดให้ `a = 'Hello'` และ `b = 'World'` ต้องการผลลัพธ์เป็น `'Hello World'` (มีเว้นวรรคตรงกลาง) ต้องเขียนโค้ดอย่างไร?",
    placeholder: "e.g. a + ' ' + b",
    answer: "a + ' ' + b",
    hint: "ใช้เครื่องหมายบวก (+) และอย่าลืมช่องว่างระหว่างตัวแปร"
  },
  "2": {
    title: "STAGE 02: ARRAY_INDEXING",
    question: "สมมติว่ามีอาร์เรย์คีย์ระบบ `code = ['X', 'M', 'O', 'A', 'T']` ต้องการดึงตัวอักษร 'M' ออกมาจากอาร์เรย์นี้ ต้องระบุตำแหน่ง Index เท่าไหร่? (รูปแบบ: code[?])",
    placeholder: "e.g. code[0]",
    answer: "code[1]",
    hint: "จำไว้ว่า Index ในทางโปรแกรมมิ่งเริ่มต้นนับจาก 0 เสมอ!"
  },
  "3": {
    title: "STAGE 03: BINARY_PARSING",
    question: "ถอดรหัสแพ็กเก็ตเลขฐานสองระบบความปลอดภัย: จงแปลงเลขฐานสอง `1101` ให้กลายเป็นเลขฐานสิบ (Decimal)",
    placeholder: "e.g. 13",
    answer: "13",
    hint: "คิดจากขวาไปซ้าย: (1*1) + (0*2) + (1*4) + (1*8) = ?"
  }
};

export default function GameplayPage() {
  const router = useRouter();
  const params = useParams();
  const stageId = Array.isArray(params?.id) ? params.id[0] : params?.id || "1";

  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentStageInfo = STAGE_DATA[stageId] || STAGE_DATA["1"];

  useEffect(() => {
    // ตรวจสอบเซสชันผู้เล่น (ห้ามใช้ localStorage.clear() ในหน้านี้เด็ดขาด!)
    const storedId = localStorage.getItem("game_player_id");
    const storedName = localStorage.getItem("game_username");

    if (!storedId || !storedName) {
      router.push("/");
      return;
    }

    setPlayerId(storedId);
    setUsername(storedName);
    setIsLoading(false);
  }, [router]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;

    // ตรวจคำตอบแบบไม่สนใจตัวพิมพ์เล็ก-ใหญ่ และตัดช่องว่างส่วนเกิน
    const isAnswerRight = userAnswer.trim().toLowerCase() === currentStageInfo.answer.toLowerCase();
    
    if (isAnswerRight) {
      setIsCorrect(true);
      try {
        const nextStageNum = Number(stageId) + 1;
        const isGameCompleted = nextStageNum > 3;

        // ⚡ อัปเดตความคืบหน้าส่งกลับไปยัง Supabase ตาราง player_progress 
        await supabase
          .from("player_progress")
          .update({
            current_stage: isGameCompleted ? 3 : nextStageNum,
            is_completed: isGameCompleted
          })
          .eq("player_id", playerId);

        console.log("Database progress updated successfully.");
      } catch (err) {
        console.error("Failed to sync progress with mainframe:", err);
      }
    } else {
      setIsCorrect(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono text-[#2CFFB5]">
        <div className="text-sm tracking-widest animate-pulse">LOADING COGNITIVE INTERFACE...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-8 selection:bg-[#2CFFB5] selection:text-black">
      {/* Header สไตล์ Cyberpunk */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-10">
        <div>
          <button 
            onClick={() => router.push("/stage")}
            className="text-xs text-neutral-500 hover:text-[#2CFFB5] transition-all uppercase tracking-widest mb-2 flex items-center gap-1"
          >
            ← BACK TO HUB
          </button>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">{currentStageInfo.title}</h1>
          <p className="text-[10px] text-neutral-500 uppercase mt-1">AGENT: {username} // SESSION_ACTIVE</p>
        </div>
      </div>

      {/* กล่องโจทย์ข้อสอบ */}
      <div className="max-w-2xl w-full mx-auto my-auto space-y-6 border border-neutral-800 bg-neutral-950/40 p-8 rounded-lg shadow-[0_0_30px_rgba(44,255,181,0.02)]">
        <div className="space-y-2">
          <div className="text-[10px] text-neutral-500 tracking-widest uppercase">CORE_MISSION_OBJECTIVE</div>
          <p className="text-sm text-neutral-200 leading-relaxed font-sans">{currentStageInfo.question}</p>
        </div>

        <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-4 border-t border-neutral-900">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-neutral-400 tracking-wider">INPUT SOLUTION CODE</label>
            <input
              type="text"
              required
              disabled={isCorrect === true}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] transition-all font-mono"
              placeholder={currentStageInfo.placeholder}
            />
          </div>

          {/* แจ้งผลลัพธ์การตรวจคำตอบ */}
          {isCorrect === true && (
            <div className="text-[11px] p-4 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider space-y-2">
              <div>✓ ACCESS GRANTED: รหัสผ่านถอดสำเร็จแล้ว! ความคืบหน้าถูกบันทึกลงฐานข้อมูลหลักแล้ว</div>
              <button
                type="button"
                onClick={() => router.push("/stage")}
                className="block text-xs bg-emerald-500 text-black px-4 py-2 rounded font-black mt-2 tracking-widest hover:bg-emerald-400 transition-all"
              >
                RETURN TO HUB
              </button>
            </div>
          )}

          {isCorrect === false && (
            <div className="text-[11px] p-3 rounded border border-red-500/30 bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">
              ❌ ERROR: SOLUTION REJECTED. ลองใหม่อีกครั้ง หรือกดดูคำใบ้ด้านล่าง
            </div>
          )}

          <div className="flex gap-4 pt-2">
            {isCorrect !== true && (
              <button
                type="submit"
                className="flex-1 border-2 border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-black text-xs py-3.5 rounded transition-all uppercase tracking-widest"
              >
                EXECUTE PROTOCOL
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="px-4 border border-neutral-800 text-neutral-500 hover:text-white rounded text-xs transition-all uppercase tracking-widest"
            >
              {showHint ? "HIDE HINT" : "REQUEST HINT"}
            </button>
          </div>
        </form>

        {showHint && (
          <div className="p-4 bg-neutral-950 border border-dashed border-neutral-800 rounded text-xs text-neutral-400 leading-relaxed animate-fadeIn">
            💡 <span className="text-[#2CFFB5] font-bold">DECRYPTED HINT:</span> {currentStageInfo.hint}
          </div>
        )}
      </div>

      <footer className="text-center text-[9px] text-neutral-700 mt-12">School of Information and Communication Technology, University of Phayao</footer>
    </main>
  );
}