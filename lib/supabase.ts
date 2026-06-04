import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// สร้างจุดเชื่อมต่อกลางตัวเดียวที่เสถียรที่สุดในการใช้งานบน Vercel และ Local เครื่องพี่
export const supabase = createClient(supabaseUrl, supabaseAnonKey);