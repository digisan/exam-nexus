import { type TableName } from "@db/dbService.ts";

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

// console.log('init env variables')

export const T_G: TableName = 'general';
export const T_REG: TableName = 'register';
export const T_DEBUG: TableName = 'messages';
export const T_USERSYSCFG: TableName = 'user_sys_config';

export { };