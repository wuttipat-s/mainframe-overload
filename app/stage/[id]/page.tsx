"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // ⚡ เพิ่ม useParams สำหรับดึง ID ด่านจาก URL
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
    story: `ภารกิจ: พี่รหัสจอมปั่นได้ทำการเข้ารหัสชื่ออุปกรณ์สื่อสารของเขาเอาไว้ในฟังก์ชันภาษา Python ขั้นสูงเพื่อป้องกันการแกะรอย

น้องๆ ต้องทำหน้าที่เป็นระบบ Compiler ถอดรหัสผลลัพธ์ (Return Value) ออกมาจากสถาปัตยกรรมการหั่นข้อความ (String Slicing Subroutine) และการเข้าถึงอาร์เรย์ 2 มิติ (2D Matrix) ด้านล่างนี้ให้ถูกต้องทางหลักการ!

---------------------------------------
def decrypt_admin_device():
    # Subroutine 1: String Slicing Step & Reverse
    scrambled = "e1n2o3h4P5i"
    brand = scrambled[::2][::-1]
    
    # Subroutine 2: 2D Array Matrix Lookup
    matrix = [
        [5, 10],
        [15, 20]
    ]
    version = matrix[1][0]
    
    return f"{brand} {version}"
---------------------------------------`,
    hint: "คำใบ้จากรุ่นพี่: จงจำไว้ว่า [::2] คือการกระโดดทีละ 2 หลัก ส่วน [::-1] คือการกลับด้านข้อความจากหลังมาหน้า และ matrix[1][0] คือการเจาะแถวที่ 1 หลักที่ 0 (อย่าลืมว่าดัชนีคอมพิวเตอร์นับจาก 0 เสมอ!)",
    label: "ENTER DECRYPTED DEVICE (พิมพ์ชื่อรุ่นภาษาอังกฤษพร้อมตัวเลข เว้นวรรคให้ตรงตามโค้ด)",
    placeholder: "e.g. Samsung S24..."
  },
  "2": {
    title: "STAGE_02: ถอดสมการดัชนีวงกต (The Hidden Pointer Offset)",
    story: `ภารกิจ: การตามล่าหาตัวตนพี่รหัสเริ่มลึกลับขึ้น! คราวนี้ระบบกล้องวงจรปิดต้องการพิกัดดัชนี (Index Pointer) จำนวน 5 หลักเพื่อไปสุ่มเจาะดึงลักษณะรูปโปรไฟล์ของพี่รหัสออกจากคลังข้อมูล

แต่พี่รหัสดันซ่อนเลขดัชนีทั้ง 5 ตัวเอาไว้ในรูปของสมการตรรกศาสตร์! น้องๆ ต้องคำนวณหาผลลัพธ์ของ [Key_A, Key_B, Key_C, Key_D, Key_E] ออกมาก่อน แล้วจึงนำตัวเลขเหล่านั้นไปนับช่องดึงคำตอบจากกล่องสุ่มทั้ง 5 กล่องตามลำดับ

📊 [สมการถอดรหัสพิกัดลับ]:
• Key_A = len("iPhone") - 1
• Key_B = 16 // 4
• Key_C = int("100", 2)   *(คำนวณเลขฐานสองให้เป็นฐานสิบ)*
• Key_D = 25 // 5
• Key_E = 0b100          *(ค่าของตัวแปรประเภท Binary Literals)*

📦 [กล่องสุ่มคลังคำศัพท์]:
• กล่องที่ 1: ["คอร์ส", "เกรด", "อาจารย์", "วิชา", "การบ้าน", "โปร"]
• กล่องที่ 2: ["เซิร์ฟ", "ระบบ", "ดาต้า", "คลาวด์", "ไฟล์"]
• กล่องที่ 3: ["แว่น", "หมวก", "กางเกง", "เข็มขัด", "เสื้อ"]
• กล่องที่ 4: ["ลาย", "ขนาด", "ยี่ห้อ", "ประเภท", "เนื้อผ้า", "สี"]
• กล่องที่ 5: ["ขาว", "เทา", "น้ำเงิน", "เขียว", "ดำ"]`,
    hint: "คำใบ้จากระบบ: ถอดสมการทั้ง 5 ข้อให้ได้ตัวเลขออกมาก่อน (ย้ำว่าเริ่มนับคำแรกในกล่องสุ่มจากดัชนีเลข 0) แล้วเอาคำศัพท์ภาษาไทยที่ได้จากทั้ง 5 กล่องมาเชื่อมต่อกันแบบไม่มีเว้นวรรค!",
    label: "ENTER IDENTITY CLUE (ลักษณะโปรไฟล์พี่รหัสที่ถอดรหัสสมบูรณ์)",
    placeholder: "กรอกลักษณะโปรไฟล์ภาษาไทย..."
  },
  "3": {
    title: "STAGE_03: ทลายรังแฮกเกอร์ กระชากหน้ากาก Hex Dump (The Core Cryptography)",
    story: `ภารกิจสุดท้าย: เราได้เบาะแสรูปพรรณสัณฐานของพี่รหัสแล้ว! จงนำเบาะแสที่ได้จากด่านที่ 2 ไปใช้เป็นคีย์ผ่านทางเพื่อเข้าถึงโครงสร้างข้อมูลจำลองซับซ้อน (Nested JSON Object) ด้านล่างนี้

เมื่อเจาะเข้าไปจนถึงฟิลด์เป้าหมายสำเร็จ น้องๆ จะพบกับชุดรหัสเลขฐานสิบหก (Hexadecimal Code) จงนำรหัสชุดนั้นไปทำการแปลงกลับ (Hex to ASCII String) เพื่อเปิดเผยรหัส CODE NAME ลับ 4 ตัวอักษรของพี่รหัสตัวจริงตัวร้ายคนนี้ให้สำเร็จ!

---------------------------------------
{
  "node_root": {
    "security_gate": {
      "โปรไฟล์เสื้อสีขาว": "0x44415441",
      "โปรไฟล์เสื้อสีดำ": {
        "hex_payload": "4D 58 4D 4F"
      },
      "โปรไฟล์ไม่ใส่เสื้อ": "0x4E4554"
    }
  }
}
---------------------------------------`,
    hint: "คำใบ้สุดท้าย: ลองมองหาเว็บประเภท Hex to ASCII Converter หรือแปลงเลขฐาน 16 ทีละคู่ (เช่น 4D เท่ากับเลขฐานสิบอะไร แล้วตรงกับอักษรอะไรในตาราง ASCII) คีย์เวิร์ดจะเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ 4 ตัว!",
    label: "DECRYPTED CODENAME (รหัสประจำตัวที่แท้จริงของพี่รหัสคนนี้คือใคร?)",
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
  const params = useParams(); // ⚡ ดึง Parameter จาก URL ของ Next.js

  // 💡 กำหนด stageId ตั้งต้นจาก URL Path เช่น /stage/1 -> "1"
  const urlStageId = (params?.id as string) || "1";
  const [stageId, setStageId] = useState<string>(urlStageId);
  
  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false); 
  const [motivationMsg, setMotivationMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbCorrectAnswer, setDbCorrectAnswer] = useState("");
  const [isLockedByAdmin, setIsLockedByAdmin] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false); // ⚡ เพิ่ม State เช็คว่าเป็นโหมดรีวิวหรือไม่

  const checkAccessAndLockState = async (currentPlayerId: string) => {
    if (!currentPlayerId) return;

    try {
      const { data: progress } = await supabase
        .from("player_progress")
        .select("current_stage, is_completed")
        .eq("player_id", currentPlayerId)
        .maybeSingle();

      const currentDbStage = progress ? Number(progress.current_stage) : 1;
      const isGameCompleted = progress ? progress.is_completed : false;
      const targetStageNum = parseInt(urlStageId);

      // 🛡️ Security Check: ป้องกันคนแอบพิมพ์ URL ข้ามไปด่านที่ยังล็อกอยู่ (ถ้าเกมยังไม่จบ)
      if (!isGameCompleted && targetStageNum > currentDbStage) {
        router.push("/stage");
        return;
      }

      // 💡 [REVIEW MODE LOGIC]: ตรวจสอบว่าด่านที่เข้ามาดู เป็นด่านที่เคยผ่านมาแล้วหรือยัง
      if (isGameCompleted || targetStageNum < currentDbStage) {
        setIsReviewMode(true);
        setStageId(urlStageId);

        // ดึงคำตอบเก่าที่เซฟไว้ใน sessionStorage มาแสดงในช่อง Input
        const savedAns = sessionStorage.getItem(`ans_${currentPlayerId}_stage_${urlStageId}`);
        if (savedAns) {
          setUserAnswer(savedAns);
        }
      } else {
        // ถ้าเป็นด่านปัจจุบันที่กำลังเคลียร์อยู่ปกติ
        setIsReviewMode(false);
        setStageId(urlStageId);
      }

      // ดึงข้อมูล Config ประจำด่านนั้นๆ จากแอดมิน
      const { data: config } = await supabase
        .from("game_config")
        .select("is_active, secret_answer")
        .eq("level_id", targetStageNum)
        .maybeSingle();

      if (config) {
        setDbCorrectAnswer(config.secret_answer || "");
        setIsLockedByAdmin(config.is_active === false);
      }
    } catch (err) {
      console.error("Error reading database configuration:", err);
    }
  };

  useEffect(() => {
    const storedId = sessionStorage.getItem("game_player_id");
    const storedName = sessionStorage.getItem("game_username");

    if (!storedId || !storedName) {
      router.push("/");
      return;
    }
    
    setPlayerId(storedId);
    setUsername(storedName);

    checkAccessAndLockState(storedId);
    
    // ทำ Polling ตรวจสอบสถานะการล็อกของแอดมินทุกๆ 3 วินาที
    const interval = setInterval(() => checkAccessAndLockState(storedId), 3000);
    return () => clearInterval(interval);
  }, [urlStageId, router]); // ⚡ ทำงานใหม่ทุกครั้งที่ URL เปลี่ยนด่าน

  const currentMission = STAGE_MISSIONS[stageId];

  // หน้าจอ MISSION ACCOMPLISHED (แสดงผลเมื่อไม่มีด่านย่อยรองรับ หรือกดเข้าด่านเกินกำหนด)
  if (!currentMission) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black font-mono p-6 text-[#2CFFB5]">
        <div className="border border-[#2CFFB5]/30 bg-[#050505] rounded-lg p-8 text-center max-w-md space-y-6 shadow-[0_0_50px_rgba(44,255,181,0.15)]">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-widest text-white animate-pulse">🎉 MISSION ACCOMPLISHED</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              ยินดีด้วย! ทีมของคุณได้ทำการกู้คืนระบบ Mainframe และเจาะข้อมูลรหัสผ่านสำเร็จครบถ้วนทุกด่านเรียบร้อยแล้ว!
            </p>
          </div>
          
          <div className="text-xs text-[#2CFFB5] border border-neutral-900 rounded p-3 bg-black uppercase font-bold text-center tracking-wider">
            SYSTEM STATUS: ALL OPERATIONAL BY {username}
          </div>
          
          <button 
            onClick={() => router.push("/stage")}
            className="w-full text-xs border border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black py-3.5 rounded transition-all font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.1)]"
          >
            ➔ BACK TO MAIN STAGE
          </button>
        </div>
      </main>
    );
  }

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReviewMode) return; // 🛡️ ป้องกันการกดส่งฟอร์มซ้ำซ้อนในโหมด Review

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

        // 💾 เซฟคำตอบลง sessionStorage ไว้ใช้เปิดดูย้อนหลังตอนกดปุ่ม Review
        sessionStorage.setItem(`ans_${playerId}_stage_${stageId}`, userAnswer);
        
        setMotivationMsg(MOTIVATION_MSGS[stageId] || "");
        setShowPopup(true);
        setUserAnswer(""); 

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

  const handleClosePopup = () => {
    setShowPopup(false);
    router.push("/stage"); 
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-[#2CFFB5] font-mono p-6 selection:bg-[#2CFFB5] selection:text-black">
      
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
              onClick={handleClosePopup}
              className="w-full bg-[#2CFFB5] text-black hover:bg-emerald-400 font-black text-sm py-4 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(44,255,181,0.2)]"
            >
              ➔ RETURN TO MAIN STAGE
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">OPERATOR_ID:</span> 
          <span className="text-[#2CFFB5] font-bold">{username || "FETCHING..."}</span>
          
          {/* 🛡️ ป้ายสัญลักษณ์แสดงสถานะให้ผู้เล่นทราบว่ากำลังอยู่ใน Review Mode */}
          {isReviewMode && (
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black tracking-widest animate-pulse">
              🛡️ REVIEW MODE
            </span>
          )}
        </div>
        
        <button 
          onClick={() => router.push("/stage")}
          className="text-xs border border-[#2CFFB5]/30 text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black px-4 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(44,255,181,0.1)]"
        >
          ➔ BACK TO MAIN STAGE
        </button>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col justify-center my-4">
        {isLockedByAdmin ? (
          <div className="border border-red-500/40 bg-red-950/5 rounded-lg p-8 text-center space-y-5 shadow-2xl">
            <h2 className="text-xl font-bold tracking-widest text-red-500 uppercase animate-pulse">
              ⚠️ SYSTEM LOCKED BY ADMIN ⚠️
            </h2>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md mx-auto">
              ระบบป้องกันตัวเองของ Mainframe ทำงาน! ด่านนี้ถูกระงับการเข้าถึงชั่วคราวโดยพี่รหัสของคุณเพื่อรอคำสั่งถัดไป
            </p>
            <div className="text-6xl font-black text-red-500 font-mono tracking-wider py-2">
              OFFLINE
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-neutral-900 bg-[#050505] rounded-lg p-6 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold tracking-wider text-white border-b border-neutral-900 pb-3 uppercase flex items-center gap-2">
                {currentMission.title}
              </h2>
              
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap bg-black/40 p-4 rounded border border-neutral-900/40 font-mono">
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
                    disabled={isLoading || isReviewMode} // ⚡ ล็อกกล่องข้อความไม่ให้แก้ไขในโหมดรีวิว
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={currentMission.placeholder}
                    className="flex-1 bg-[#050505] border border-neutral-900 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2CFFB5] transition-colors font-mono tracking-wide disabled:opacity-70 disabled:text-emerald-400 font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || isReviewMode} // ⚡ ปิดปุ่มตรวจสอบในโหมดรีวิว
                    className="border border-[#2CFFB5] text-[#2CFFB5] hover:bg-[#2CFFB5] hover:text-black font-semibold text-xs px-8 rounded transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {isReviewMode ? "VERIFIED" : isLoading ? "RUNNING..." : "EXECUTE"}
                  </button>
                </div>
              </div>

              {/* แสดงข้อความสถานะเพิ่มเติมหากไม่ใช่โหมดรีวิว */}
              {statusMsg && !isReviewMode && (
                <div className={`text-xs p-3 rounded text-center border ${
                  statusMsg.includes("SUCCESS") || statusMsg.includes("GRANTED")
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
        TERMINAL OVERLOAD INTERFACE v2.5.0 - PRODUCTION STABLE
      </footer>
    </main>
  );
}