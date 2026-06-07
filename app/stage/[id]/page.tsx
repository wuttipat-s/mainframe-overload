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
    title: "STAGE_01: ตามหาร่องรอยอารยธรรมผลไม้ (The Overpriced Hardware)",
    story: "ภารกิจ: แอดมินจอมดองงานลืมกุญแจห้องแล็บคอมฯ แต่ทิ้งคำใบ้กากๆ ไว้ในฟังก์ชันภาษา Python... ระบบแจ้งว่าเขานั่งเขียนโค้ดนี้บน 'สมาร์ทโฟนรุ่นปฏิวัติวงการ (ที่เพิ่งเปลี่ยนมาใช้พอร์ต Type-C เหมือนชาวบ้านเขาหลังจากดื้อมานาน)'\n\nน้องๆ ต้องรับบทเป็นหน่วยประมวลผล ไล่รันโค้ดด้านล่างนี้ในหัว เพื่อหาว่าสมาร์ทโฟนคู่ใจที่แอดมินใช้ปั่นงานคือรุ่นอะไรกันแน่!?\n\n---------------------------------------\ndef trace_admin_device():\n    brand = \"i\" + \"Phone\"\n    year_released = 2023\n    base_factor = 2008\n    model = year_released - base_factor\n    return f\"{brand} {model}\"\n---------------------------------------",
    hint: "คำใบ้จากระบบ: ไม่ต้องคิดลึก เอาข้อความ brand มาต่อกับเลขผลลัพธ์ลบเลขของ model ตรงๆ (เคารพพิมพ์เล็กพิมพ์ใหญ่ด้วยนะกัปตัน)",
    label: "ENTER DEVICE NAME (ชื่อรุ่นมือถือภาษาอังกฤษพร้อมตัวเลข เว้นวรรคให้ถูก)",
    placeholder: "e.g. Nokia 3310..."
  },
  "2": {
    title: "STAGE_02: ส่องกล้องวงจรปิดสืบหาตัวตน (The Identity Profiler)",
    story: "ภารกิจ: ยินดีด้วยที่รู้ว่าแอดมินใช้มือถือหรูหราหมาเห่า! คราวนี้เราต้องมาเจาะระบบฐานข้อมูลรูปภาพอวตารของเขาเพื่อจำกัดวงผู้ต้องสงสัย น้องๆ จงนำเลขดัชนี (Index) ลับ `5-4-4-5-4` ไปจิ้มสุ่มดึงชิ้นส่วนข้อความในกล่องอาร์เรย์ทั้ง 5 กล่องด้านล่างมาต่อกัน เพื่อสืบดูว่า 'รูปโปรไฟล์ของแอดมินตัวจริง' มีลักษณะเด่นยังไง?\n\n⚠️ คำเตือน: ย้ำอีกครั้งว่าโลกโปรแกรมเมอร์ Index เริ่มนับจาก 0 เสมอ! ใครนับเริ่มจาก 1 ขอให้เปิดคอมแล้วจอฟ้า!\n\n• กล่องสุ่มที่ 1: [\"คอร์ส\", \"เกรด\", \"อาจารย์\", \"วิชา\", \"การบ้าน\", \"โปร\"]\n• กล่องสุ่มที่ 2: [\"เซิร์ฟ\", \"ระบบ\", \"ดาต้า\", \"คลาวด์\", \"ไฟล์\"]\n• กล่องสุ่มที่ 3: [\"แว่น\", \"หมวก\", \"กางเกง\", \"เข็มขัด\", \"เสื้อ\"]\n• กล่องสุ่มที่ 4: [\"ลาย\", \"ขนาด\", \"ยี่ห้อ\", \"ประเภท\", \"เนื้อผ้า\", \"สี\"]\n• กล่องสุ่มที่ 5: [\"ขาว\", \"เทา\", \"น้ำเงิน\", \"เขียว\", \"ดำ\"]",
    hint: "คำใบ้จากระบบ: ตัวเลขดัชนีมี 5 ตัว เอาไปจิ้มทีละกล่องตามลำดับ เช่น ตัวแรกคือเลข 5 ให้นับกล่องแรกช่องที่ 5 (เริ่มนับช่องแรกเป็น 0) แล้วเอาคำที่ได้มาพิมพ์ต่อกันยาวๆ เลย!",
    label: "ENTER PROFILE CLUE (ลักษณะโปรไฟล์ที่ถอดรหัสได้เป็นภาษาไทย)",
    placeholder: "กรอกลักษณะโปรไฟล์ที่แกะได้..."
  },
  "3": {
    title: "STAGE_03: ถอดรหัสลับแอดมินหลังม่าน (The Binary Overload)",
    story: "ภารกิจสุดท้าย: ได้เบาะแสชัดเจนแล้วว่าแอดมินคือคนที่มี \"โปรไฟล์เสื้อสีดำ\"! จงนำคำศัพท์เบาะแสนี้ ไปใช้เป็น Key เพื่อเจาะเข้าคลังข้อมูลลับ JSON Database ด้านล่าง\n\nเมื่อเจอคู่ข้อมูลที่ตรงกับเบาะแสแล้ว ให้นำชุด \"เลขฐานสอง (Binary Code)\" ในฟิลด์นั้น ไปแปลงกลับเป็นข้อความภาษาอังกฤษ (ASCII) เพื่อกระชากหน้ากากเปิดเผย CODE NAME ที่แท้จริงของแอดมินตัวร้ายให้โลกรับรู้!\n\n{\n  \"โปรไฟล์เสื้อสีขาว\": \"01000100 01000001 01010100 01000001\",\n  \"โปรไฟล์เสื้อสีดำ\": \"01001101 01011000 01001101 01001111\",\n  \"โปรไฟล์ไม่ใส่เสื้อ\": \"01001110 01000101 01010100\"\n}",
    hint: "คำใบ้สุดท้าย: เลขฐานสอง 8 หลัก = อักษรอังกฤษ 1 ตัว (มี 4 ชุดแปลว่าได้ 4 ตัวอักษร) แอบไปใช้เว็บ Binary to Text Converter ก็ได้ แอดมินใจดีไม่หักคะแนนหรอก!",
    label: "DECRYPTED CODENAME (รหัสโค้ดเนมภาษาอังกฤษพิมพ์ใหญ่ 4 ตัว)",
    placeholder: "กรอกโค้ดเนมท่านประธานแอดมิน..."
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
        {/* 🔥 แก้ไขปุ่มขวาบนตรงนี้: เปลี่ยนจากปุ่ม LOGOUT เป็นปุ่มกลับสู่หน้าหลัก / Mission Hub */}
        <button
          onClick={() => router.push("/stage")}
          className="text-xs border border-neutral-800 text-neutral-400 px-3 py-1 rounded hover:border-[#2CFFB5] hover:text-white transition-colors"
        >
          RETURN TO MISSION_HUB
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
        TERMINAL OVERLOAD INTERFACE v2.2.3 - NAVIGATION PATTERN FIXED
      </footer>
    </main>
  );
}