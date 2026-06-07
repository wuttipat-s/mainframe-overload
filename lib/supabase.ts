// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// ตัวเชื่อมต่อเดี่ยวแชร์ใช้ทั้งแอป ป้องกัน Instance ซ้อนและแก้ไขระบบเขียน/อ่านพัง
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // ป้องกันการกวนกับระบบเซสชันที่พี่เขียนควบคุมเอง
  }
});