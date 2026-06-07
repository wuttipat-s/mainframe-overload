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
    title: "STAGE_01: ถอดรหัสลับ String Slicing & Matrix (The Compiler's Nightmare)",
    story: "ภารกิจ: แอดมินจอมปั่นได้ทำการเข้ารหัสชื่ออุปกรณ์สื่อสารของเขาเอาไว้ในฟังก์ชันภาษา Python ขั้นสูงเพื่อป้องกันการแกะรอย\n\nน้องๆ ต้องทำหน้าที่เป็นระบบ Compiler ถอดรหัสผลลัพธ์ (Return Value) ออกมาจากสถาปัตยกรรมการหั่นข้อความ (String Slicing Subroutine) และการเข้าถึงอาร์เรย์ 2 มิติ (2D Matrix) ด้านล่างนี้ให้ถูกต้องทางหลักการ!\n\n---------------------------------------\ndef decrypt_admin_device():\n    # Subroutine 1: String Slicing Step & Reverse\n    scrambled = \"e1n2o3h4P5i\"\n    brand = scrambled[::2][::-1]\n    \n    # Subroutine 2: 2D Array Matrix Lookup\n    matrix = [\n        [5, 10],\n        [15, 20]\n    ]\n    version = matrix[1][0]\n    \n    return f\"{brand} {version}\"\n---------------------------------------",
    hint: "คำใบ้จากรุ่นพี่: จงจำไว้ว่า [::2] คือการกระโดดทีละ 2 หลัก ส่วน [::-1] คือการกลับด้านข้อความจากหลังมาหน้า และ matrix[1][0] คือการเจาะแถวที่ 1 หลักที่ 0 (อย่าลืมว่าดัชนีคอมพิวเตอร์นับจาก 0 เสมอ!)",
    label: "ENTER DECRYPTED DEVICE (พิมพ์ชื่อรุ่นภาษาอังกฤษพร้อมตัวเลข เว้นวรรคให้ตรงตามโค้ด)",
    placeholder: "e.g. Samsung S24..."
  },
  "2": {
    title: "STAGE_02: ถอดสมการดัชนีวงกต (The Hidden Pointer Offset)",
    story: "ภารกิจ: การตามล่าหาตัวตนแอดมินเริ่มลึกลับขึ้น! คราวนี้ระบบกล้องวงจรปิดต้องการพิกัดดัชนี (Index Pointer) จำนวน 5 หลักเพื่อไปสุ่มเจาะดึงลักษณะรูปโปรไฟล์ของแอดมินออกจากคลังข้อมูล\n\nแต่แอดมินดันซ่อนเลขดัชนีทั้ง 5 ตัวเอาไว้ในรูปของสมการตรรกศาสตร์! น้องๆ ต้องคำนวณหาผลลัพธ์ของ `[Key_A, Key_B, Key_C, Key_D, Key_E]` ออกมาก่อน แล้วจึงนำตัวเลขเหล่านั้นไปนับช่องดึงคำตอบจากกล่องสุ่มทั้ง 5 กล่องตามลำดับ\n\n📊 [สมการถอดรหัสพิกัดลับ]:\n• Key_A = len(\"iPhone\") - 1\n• Key_B = 16 // 4\n• Key_C = int(\"100\", 2)  *(คำนวณเลขฐานสองให้เป็นฐานสิบ)*\n• Key_D = 25 // 5\n• Key_E = 0b100         *(ค่าของตัวแปรประเภท Binary Literals)*\n\n📦 [กล่องสุ่มคลังคำศัพท์]:\n• กล่องที่ 1: [\"คอร์ส\", \"เกรด\", \"อาจารย์\", \"วิชา\", \"การบ้าน\", \"โปร\"]\n• กล่องที่ 2: [\"เซิร์ฟ\", \"ระบบ\", \"ดาต้า\", \"คลาวด์\", \"ไฟล์\"]\n• กล่องที่ 3: [\"แว่น\", \"หมวก\", \"กางเกง\", \"เข็มขัด\", \"เสื้อ\"]\n• กล่องที่ 4: [\"ลาย\", \"ขนาด\", \"ยี่ห้อ\", \"ประเภท\", \"เนื้อผ้า\", \"สี\"]\n• กล่องที่ 5: [\"ขาว\", \"เทา\", \"น้ำเงิน\", \"เขียว\", \"ดำ\"]",
    hint: "คำใบ้จากระบบ: ถอดสมการทั้ง 5 ข้อให้ได้ตัวเลขออกมาก่อน (ย้ำว่าเริ่มนับคำแรกในกล่องสุ่มจากดัชนีเลข 0) แล้วเอาคำศัพท์ภาษาไทยที่ได้จากทั้ง 5 กล่องมาเชื่อมต่อกันแบบไม่มีเว้นวรรค!",
    label: "ENTER IDENTITY CLUE (ลักษณะโปรไฟล์แอดมินที่ถอดรหัสสมบูรณ์)",
    placeholder: "กรอกลักษณะโปรไฟล์ภาษาไทย..."
  },
  "3": {
    title: "STAGE_03: ทลายรังแฮกเกอร์ กระชากหน้ากาก Hex Dump (The Core Cryptography)",
    story: "ภารกิจสุดท้าย: เราได้เบาะแสรูปพรรณสัณฐานของแอดมินแล้ว! จงนำเบาะแสที่ได้จากด่านที่ 2 ไปใช้เป็นคีย์ผ่านทางเพื่อเข้าถึงโครงสร้างข้อมูลจำลองซับซ้อน (Nested JSON Object) ด้านล่างนี้\n\nเมื่อเจาะเข้าไปจนถึงฟิลด์เป้าหมายสำเร็จ น้องๆ จะพบกับชุดรหัสเลขฐานสิบหก (Hexadecimal Code) จงนำรหัสชุดนั้นไปทำการแปลงกลับ (Hex to ASCII String) เพื่อเปิดเผยรหัส CODE NAME ลับ 4 ตัวอักษรของแอดมินตัวจริงตัวร้ายคนนี้ให้สำเร็จ!\n\n---------------------------------------\n{\n  \"node_root\": {\n    \"security_gate\": {\n      \"โปรไฟล์เสื้อสีขาว\": \"0x44415441\",\n      \"โปรไฟล์เสื้อสีดำ\": {\n        \"hex_payload\": \"4D 58 4D 4F\"\n      },\n      \"โปรไฟล์ไม่ใส่เสื้อ\": \"0x4E4554\"\n    }\n  }\n}\n---------------------------------------",
    hint: "คำใบ้สุดท้าย: ลองมองหาเว็บประเภท Hex to ASCII Converter หรือแปลงเลขฐาน 16 ทีละคู่ (เช่น 4D เท่ากับเลขฐานสิบอะไร แล้วตรงกับอักษรอะไรในตาราง ASCII) คีย์เวิร์ดจะเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ 4 ตัว!",
    label: "DECRYPTED CODENAME (รหัสประจำตัวที่แท้จริงของแอดมินคนนี้คือใคร?)",
    placeholder: "กรอกโค้ดเนมภาษาอังกฤษพิมพ์ใหญ่..."
  }
};

const MOTIVATION_MSGS: Record<string, string> = {
  "1": "รู้ยัง รู้ยัง ถ้าไม่รู้ก็หยุดตามหาพี่ได้เลย",
  "2": "พี่ไม่ใช่คนเก่าที่เราตามหา เพราะฉะนั้นหยุดตามหาพี่",
  "3": "รู้ได้ไงว่าเป็นพี่ อาจจะไม่ใช่ก็ได้นะ (พี่ไม่มีเงินนนน)"
};

export default function StagePage() {
  const router = useRouter();
  const rawParams = useParams();
  const stageId = (rawParams?.id as string) || "1";

  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false); // ⚡ ควบคุมการโชว์ Popup
  const [motivationMsg, setMotivationMsg] = useState("");
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
      setStatusMsg("⚡ ACCESS GRANTED: กำลังอัปเดตระบบ...");
      
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

        // ⚡ เปิดการแสดงผล Popup ทันทีที่เซฟข้อมูลเสร็จ
        setMotivationMsg(MOTIVATION_MSGS[stageId] || "");
        setShowPopup(true);

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
      
      {/* ⚡ Popup Modal เด้งกลางหน้าจอเมื่อตอบถูก */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="border-2 border-[#2CFFB5] bg-[#050505] rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(44,255,181,0.2)]">
            <div className="space-y-2">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest animate-pulse">
                INCOMING INTERCEPTED MESSAGE
              </div>
              <h2 className="text-xl font-bold text-white tracking-wider">
                FROM: UNKNOWN_ADMIN
              </h2>
            </div>
            
            <div className="bg-[#2CFFB5]/10 border border-[#2CFFB5]/30 p-6 rounded-lg">
              <p className="text-[#2CFFB5] text-lg font-bold leading-relaxed">
                "{motivationMsg}"
              </p>
            </div>

            <button
              onClick={() => router.push("/stage")}
              className="w-full bg-[#2CFFB5] text-black hover:bg-emerald-400 font-black text-sm py-4 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.2)]"
            >
              RETURN TO MISSION_HUB
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
        <div>
          <span className="text-white font-bold">OPERATOR_ID:</span> <span className="text-[#2CFFB5] font-bold">{username || "FETCHING..."}</span>
        </div>
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