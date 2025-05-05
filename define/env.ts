// ****************** Environment ****************** //
const EnvVars = [
    "SIGNATURE_KEY",
    "HCAPTCHA_VERIFY_URL",
    "HCAPTCHA_SECRET",
    "SUPABASE_URL",
    "SUPABASE_KEY",
] as const;
type EnvVarType = typeof EnvVars[number];

const env_set = (ev: EnvVarType, value: string) => {
    Deno.env.set(ev, value);
};
export const env_get = (ev: EnvVarType) => Deno.env.get(ev);

env_set("SIGNATURE_KEY", "mySecretKey");
env_set("HCAPTCHA_VERIFY_URL", "https://api.hcaptcha.com/siteverify");
env_set("HCAPTCHA_SECRET", "ES_d9b1e2678035429d92d31e64f99227b6");
env_set("SUPABASE_URL", "https://njtznkkjfdamxepxjzmj.supabase.co");
env_set(
    "SUPABASE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdHpua2tqZmRhbXhlcHhqem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MzczMTgsImV4cCI6MjA1NjIxMzMxOH0.IDu55DGOQGR2vdgUFoEJabuyytIUYFTc1OEIQwPMdlk",
);

console.log("init env variables");
