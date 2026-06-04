import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// สะพานเชื่อมแบบ Public สำหรับใช้ในฝั่งหน้าบ้านทั่วไป
export const supabase = createClient(supabaseUrl, supabaseAnonKey)