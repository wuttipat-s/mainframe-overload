"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Mission {
  title: string;
  story: string;
  hint: string;
  label: string;
  placeholder: string;
}

const STAGE_MISSIONS: Record<string, Mission> = {
  "1": {
    title: "STAGE_01: ประกอบชิ้นส่วนเมนเฟรม (The String Concatenation)",
    story: "ภารกิจ: บล็อกข้อมูลในฮาร์ดดิสก์เกิดความเสียหายจนแตกออกเป็นเสี่ยงๆ น้องๆ ต้องสวมบทบาทเป็นหน่วยประมวลผลกลาง ไล่รันโค้ดภาษา Python ด้านล่างนี้ เพื่อดูว่าระบบจะเอาเศษข้อมูลมาต่อกันแล้วคืนค่า (return) ออกมาเป็น \"ตัวเลข ID ระบบ\" อะไร?\n\n---------------------------------------\ndef restore_mainframe_id():\n    data_chunks = [54, 0, 0, 2, 68, 94]\n    mainframe_id = \"\".join(str(chunk) for chunk in data_chunks)\n    return int(mainframe_id)\n---------------------------------------",
    hint: "คำใบ้จากระบบ: ฟังก์ชัน str(chunk) เปลี่ยนตัวเลขเป็นข้อความ แล้วใช้ .join() มาต่อกันแบบตรงๆ ตัวเลยนะกัปตัน!",
    label: "ENTER MAINFRAME ID (ตัวเลขยาวๆ ชุดนี้คือพิกัดชี้เป้า)",
    placeholder: "กรอกตัวเลขผลลัพธ์..."
  },
  "2": {
    title: "STAGE_02: เจาะรหัสพิกัดหน่วยความจำ (The Array Indexing)",
    story: "ภารกิจ: นำ \"ตัวเลขคำตอบยาวๆ จากด่านที่ 1\" มาแยกออกเป็นตัวเลขทีละหลัก (เรียงจากซ้ายไปขวา) เพื่อใช้เป็น Index (ตำแหน่งพิกัด) ในการดึงตัวอักษรออกจากกล่องข้อมูลทั้ง 9 กล่องตามลำดับ แล้วนำมาต่อกันเป็นคำศัพท์สำคัญ\n\n⚠️ แจ้งเตือนจากระบบ: ในโลก of Software Engineer อาร์เรย์ตำแหน่งแรกสุดเราเริ่มนับจาก Index 0 เสมอ!\n\n• ตัวอักษรที่ 1 (เลขหลักที่ 1): [\"ก\", \"ข\", \"ค\", \"ง\", \"จ\", \"ซ\", \"ช\"]\n• ตัวอักษรที่ 2 (เลขหลักที่ 2): [\"ก\", \"ข\", \"ค\", \"ง\", \"อ\", \"จ\"]\n• ตัวอักษรที่ 3 (เลขหลักที่ 3): [\"ฟ\", \"ป\", \"ผ\", \"ฝ\"]\n• ตัวอักษรที่ 4 (เลขหลักที่ 4): [\"ต\", \"ถ\", \"ท\", \"ธ\"]\n• ตัวอักษรที่ 5 (เลขหลักที่ 5): [\"ะ\", \"า\", \"์\", \"ิ\"]\n• ตัวอักษรที่ 6 (เลขหลักที่ 6): [\"เ\", \"โ\", \"ใ\", \"ไ\", \"า\", \"ะ\", \"แ\"]\n• ตัวอักษรที่ 7 (เลขหลักที่ 7): [\"ก\", \"ข\", \"ค\", \"ง\", \"จ\", \"ฉ\", \"ช\", \"ซ\", \"ว\"]\n• ตัวอักษรที่ 8 (เลขหลักที่ 8): [\"ก\", \"ข\", \"ค\", \"ง\", \"จ\", \"ฉ\", \"ช\", \"ซ\", \"ฌ\", \"ร\"]\n• ตัวอักษรที่ 9 (เลขหลักที่ 9): [\"ะ\", \"า\", \"ิ\", \"ี\", \"์\"]",
    hint: "คำใบ้จากระบบ: ลองนำผลลัพธ์ด่าน 1 มาจิ้มทีละตัว เช่น ตัวแรกคือเลข 5 ลองไปนับตัวอักษรในวงเล็บแรกเริ่มจาก 0 ดูสิ!",
    label: "ENTER CORE SYSTEM WORD (คำศัพท์ภาษาไทยที่เป็นหัวใจของภาคเรา)",
    placeholder: "กรอกคำศัพท์ภาษาไทย..."
  },
  "3": {
    title: "STAGE_03: ถอดรหัสแพ็กเก็ตสุดท้าย (The JSON Binary Parser)",
    story: "ภารกิจสุดท้าย: นำ \"คำศัพท์ภาษาไทยที่ได้จากด่านที่ 2\" มาใช้เป็น Key ในการค้นหาข้อมูลในระบบฐานข้อมูลจำลอง (JSON Database) ด้านล่างนี้\n\nเมื่อเจอคู่ข้อมูลที่ถูกต้องแล้ว ให้นำชุด เลขฐานสอง (Binary Code) ในฟิลด์นั้น ไปแปลงกลับเป็นตัวอักษรภาษาอังกฤษ (ASCII) เพื่อเปิดเผยชื่อโค้ดเนมที่แท้จริงของพี่รหัส!\n\n{\n  \"ฮาร์ดแวร์\": \"01001000 01000001 01010010 01000100\",\n  \"เน็ตเวิร์ก\": \"01001110 01000101 01010100\",\n  \"ซอฟต์แวร์\": \"01001101 01011000 01001101 01001111\",\n  \"ดาต้าเบส\": \"01000100 01000001 01010100 01000001\"\n}",
    hint: "คำใบ้จากระบบ: แปลงเลขฐานสอง 8 หลักแต่ละกลุ่มให้กลายเป็นอักษรภาษาอังกฤษ A-Z โค้ดเนมยาว 4 ตัวอักษรพิมพ์ใหญ่",
    label: "DECRYPTED CODENAME (ชื่อโค้ดเนมที่แท้จริงของพี่รหัส)",
    placeholder: "กรอกชื่อโค้ดเนมภาษาอังกฤษพิมพ์ใหญ่..."
  }
};

export default function StagePage() {
  const router = useRouter();
  const rawParams = useParams();
  const stageId = (rawParams?.id as string) || "1";

  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbCorrectAnswer, setDbCorrectAnswer] = useState("");

  const [isLockedByAdmin, setIsLockedByAdmin] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [isCleared, setIsCleared] = useState(false);

  const checkAccessAndLockState = async (currentPlayerId: string) => {
    if (!currentPlayerId || !stageId) return;

    try {
      const { data: progress } = await supabase
        .from("player_progress")
        .select("current_stage, is_completed")
        .eq("player_id", currentPlayerId)
        .maybeSingle();

      let alreadyCleared = false;
      if (progress) {
        if (progress.is_completed || Number(progress.current_stage) > parseInt(stageId)) {
          alreadyCleared = true;
          setIsCleared(true);
        }
      }

      const { data: config } = await supabase
        .from("game_config")
        .select("unlock_time, is_active, secret_answer")
        .eq("level_id", parseInt(stageId))
        .maybeSingle();

      if (config) {
        setDbCorrectAnswer(config.secret_answer || "");
        
        if (alreadyCleared) {
          setUserAnswer(config.secret_answer || "");
          setStatusMsg("✅ REVIEW MODE: คุณได้ทำการถอดรหัสด่านนี้สำเร็จไปแล้ว");
        }

        const isStageActive = config.is_active !== false;
        const unlockDate = new Date(config.unlock_time);
        const isLockedByTime = Date.now() < unlockDate.getTime();

        if (!alreadyCleared) {
          if (!isStageActive) {
            setIsLockedByAdmin(true);
            setCooldownLeft(999999);
          } else if (isLockedByTime) {
            setIsLockedByAdmin(true);
            const targetTime = Math.ceil((unlockDate.getTime() - Date.now()) / 1000);
            setCooldownLeft(targetTime);
          } else {
            setIsLockedByAdmin(false);
          }
        } else {
          setIsLockedByAdmin(false);
        }
      }
    } catch (err) {
      console.error("Error reading database configuration:", err);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("game_player_id");
    const storedName = localStorage.getItem("game_username");

    if (!storedId || !storedName) {
      router.push("/");
      return;
    }
    setPlayerId(storedId);
    setUsername(storedName);

    checkAccessAndLockState(storedId);
    
    const interval = setInterval(() => checkAccessAndLockState(storedId), 3000);
    return () => clearInterval(interval);
  }, [stageId, router]);

  useEffect(() => {
    if (cooldownLeft <= 0 || cooldownLeft === 999999) return;
    const timer = setTimeout(() => {
      setCooldownLeft(cooldownLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownLeft]);

  const currentMission = STAGE_MISSIONS[stageId];

  if (!currentMission) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono p-6 text-[#2CFFB5]">
        <div className="border border-[#2CFFB5]/30 bg-[#050505] rounded-lg p-8 text-center max-w-md space-y-4">
          <h1 className="text-2xl font-bold tracking-widest text-white animate-pulse">🎉 MISSION ACCOMPLISHED</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            ยินดีด้วย! ทีมของคุณได้ทำการกู้คืนระบบ Mainframe และเจาะข้อมูลรหัสผ่านสำเร็จครบถ้วนทุกด่านเรียบร้อยแล้ว!
          </p>
          <div className="text-xs text-[#2CFFB5] border border-neutral-900 rounded p-3 bg-black uppercase font-bold text-center">
            SYSTEM STATUS: ALL OPERATIONAL BY {username}
          </div>
          <button 
            onClick={() => { 
              localStorage.clear(); 
              router.push("/");
            }}
            className="text-xs border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-black transition-all"
          >
            DISCONNECT SESSION
          </button>
        </div>
      </main>
    );
  }

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCleared) return;

    setIsLoading(true);
    setStatusMsg("");

    const formattedUserAns = userAnswer.trim().replace(/\s+/g, ""); 
    const formattedCorrectAns = dbCorrectAnswer.trim().replace(/\s+/g, ""); 

    if (formattedUserAns.toLowerCase() === formattedCorrectAns.toLowerCase()) {
      setStatusMsg("⚡ ACCESS GRANTED: คำตอบถูกต้อง! กำลังบันทึกข้อมูลเข้าระบบ...");

      try {
        const nextStageNum = parseInt(stageId) + 1;
        const isGameFinished = nextStageNum > 3;

        const { error } = await supabase
          .from("player_progress")
          .upsert({
            player_id: playerId,
            current_stage: isGameFinished ? 3 : nextStageNum,
            is_completed: isGameFinished,
            updated_at: new Date().toISOString()
          }, { onConflict: "player_id" });

        if (error) throw error;

        localStorage.setItem(`ans_${playerId}_stage_${stageId}`, userAnswer);

        setTimeout(() => {
          router.push(`/stage`);
        }, 1500);

      } catch (err: any) {
        setStatusMsg(`DATABASE ERROR: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setStatusMsg("❌ ACCESS DENIED: รหัสตรวจสอบไม่ถูกต้อง ถอดรหัสล้มเหลว!");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-6 selection:bg-[#2CFFB5] selection:text-black">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
        <div>
          <span className="text-white font-bold">OPERATOR_ID:</span> <span className="text-[#2CFFB5] font-bold">{username || "FETCHING..."}</span>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="text-xs border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-black transition-all"
        >
          LOGOUT
        </button>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col justify-center my-4">
        {isLockedByAdmin ? (
          <div className="border border-red-500/40 bg-red-950/5 rounded-lg p-8 text-center space-y-5 shadow-2xl">
            <h2 className="text-xl font-bold tracking-widest text-red-500 uppercase animate-pulse">
              ⚠️ SYSTEM LOCKED BY ADMIN ⚠️
            </h2>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md mx-auto">
              ระบบป้องกันตัวเองของ Mainframe ทำงาน! ด่านนี้ถูกระงับการเข้าถึงชั่วคราว
            </p>
            <div className="text-6xl font-black text-red-500 font-mono tracking-wider py-2">
              {cooldownLeft === 999999 ? "OFFLINE" : `${Math.floor(cooldownLeft / 60)}:${(cooldownLeft % 60).toString().padStart(2, "0")}`}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-neutral-900 bg-[#050505] rounded-lg p-6 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold tracking-wider text-white border-b border-neutral-900 pb-3 uppercase flex items-center gap-2">
                {currentMission.title}
                {isCleared && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">CLEARED</span>}
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded border border-neutral-900/40 font-mono">
                {currentMission.story}
              </p>
              <div className="text-[11px] text-neutral-500 bg-neutral-950 p-3 rounded border border-neutral-950">
                {currentMission.hint}
              </div>
            </div>

            <form onSubmit={handleVerifyAnswer} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] uppercase text-neutral-400 tracking-wider">
                  {currentMission.label}
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    required
                    disabled={isLoading || isCleared}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={currentMission.placeholder}
                    className="flex-1 bg-[#050505] border border-neutral-900 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] transition-colors font-mono tracking-wide disabled:opacity-70 disabled:text-[#2CFFB5]"
                  />
                  {!isCleared && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="border border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-semibold text-xs px-8 rounded transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      {isLoading ? "RUNNING..." : "EXECUTE"}
                    </button>
                  )}
                </div>
              </div>

              {statusMsg && (
                <div className={`text-xs p-3 rounded text-center border ${
                  statusMsg.includes("SUCCESS") || statusMsg.includes("GRANTED") || statusMsg.includes("REVIEW")
                    ? "bg-[#2cffb5]/5 border-[#2CFFB5]/30 text-[#2CFFB5]" 
                    : "bg-red-500/5 border-red-500/30 text-red-400"
                }`}>
                  {statusMsg}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-[9px] text-neutral-700 mt-6">
        TERMINAL OVERLOAD INTERFACE v2.2.2 - REFRESHED ACTIVE SESSION
      </footer>
    </main>
  );
}