import type { TableType } from "@define/type.ts";

// 
// Environment
//
const SIGNATURE_KEY = "mySecretKey";
const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";
const HCAPTCHA_SECRET = "ES_d9b1e2678035429d92d31e64f99227b6"; // hCaptcha 私钥
const SUPABASE_URL = 'https://njtznkkjfdamxepxjzmj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdHpua2tqZmRhbXhlcHhqem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MzczMTgsImV4cCI6MjA1NjIxMzMxOH0.IDu55DGOQGR2vdgUFoEJabuyytIUYFTc1OEIQwPMdlk'

Deno.env.set('SIGNATURE_KEY', SIGNATURE_KEY)
Deno.env.set('HCAPTCHA_VERIFY_URL', HCAPTCHA_VERIFY_URL)
Deno.env.set('HCAPTCHA_SECRET', HCAPTCHA_SECRET)
Deno.env.set('SUPABASE_URL', SUPABASE_URL)
Deno.env.set('SUPABASE_KEY', SUPABASE_KEY)

console.log('init env variables')

//
// System Configuration
//
export const TABLES_SB = [
    "general",
    "messages",
    "register",
    "user_sys_config",
    "register_new",
    "test2"
] as const;

export const T_G: TableType = 'general';
export const T_REG: TableType = 'register';
export const T_DEBUG: TableType = 'messages';
export const T_USER_SYSCFG: TableType = 'user_sys_config';
export const T_REG_NEW: TableType = 'register_new';
export const T_TEST: TableType = 'test2';

//
// User Configuration
//
export const REGIONS = [
    "au",
    "cn",
    "us",
    "jp",
] as const;

export const LANGUAGES = [
    "en",
    "zh"
] as const;
