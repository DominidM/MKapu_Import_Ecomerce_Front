import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  { table: "productos", column: "image_url", folder: "productos/main" },
  { table: "producto_imagenes", column: "url_imagenes", folder: "productos/gallery" },
  { table: "producto_videos", column: "video_url", folder: "productos/videos", type: "video" },
  { table: "videos", column: "video_url", folder: "videos", type: "video" },
  { table: "videos", column: "thumbnail", folder: "videos/thumbnails" },
  { table: "vlog_imagenes", column: "url_imagen", folder: "blog/imagenes" },
  { table: "vlog_videos", column: "video_url", folder: "blog/videos", type: "video" },
  { table: "quienes_somos_imagenes", column: "url_imagen", folder: "sobre-nosotros" },
  { table: "marcas", column: "logo_url", folder: "marcas" },
  { table: "colaboradores", column: "logo_url", folder: "colaboradores/logos" },
  { table: "colaborador_media", column: "url", folder: "colaboradores/media" },
  { table: "empresa", column: "logo", folder: "empresa" },
  { table: "banners_carousel", column: "image_url", folder: "banners/carousel" },
  { table: "banners_config", column: "image_url", folder: "banners/config" },
];

function isSupabaseUrl(url) {
  return url && url.includes("supabase.co/storage");
}

async function migrateUrl(oldUrl, folder, type = "auto") {
  try {
    const result = await cloudinary.uploader.upload(oldUrl, {
      folder,
      resource_type: type,
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  FAILED: ${oldUrl.slice(0, 80)}... - ${err.message}`);
    return null;
  }
}

async function migrateTable(cfg) {
  console.log(`\n=== ${cfg.table}.${cfg.column} -> ${cfg.folder} ===`);

  const { data: rows, error } = await supabase
    .from(cfg.table)
    .select(`id, ${cfg.column}`);

  if (error) {
    console.error(`  ERROR: ${error.message}`);
    return { ok: 0, fail: 0, skip: 0 };
  }

  if (!rows || rows.length === 0) {
    console.log("  No records.");
    return { ok: 0, fail: 0, skip: 0 };
  }

  let ok = 0, fail = 0, skip = 0;

  for (const row of rows) {
    const oldUrl = row[cfg.column];
    if (!isSupabaseUrl(oldUrl)) { skip++; continue; }

    const newUrl = await migrateUrl(oldUrl, cfg.folder, cfg.type || "auto");
    if (!newUrl) { fail++; continue; }

    const { error: upErr } = await supabase
      .from(cfg.table)
      .update({ [cfg.column]: newUrl })
      .eq("id", row.id);

    if (upErr) {
      console.log(`  DB UPDATE FAILED for ID ${row.id}: ${upErr.message}`);
      fail++;
    } else {
      ok++;
    }
  }

  console.log(`  -> ${ok} migrated, ${fail} failed, ${skip} already Cloudinary`);
  return { ok, fail, skip };
}

async function main() {
  console.log("=== MIGRATION: Supabase Storage -> Cloudinary ===\n");
  let totalOk = 0, totalFail = 0, totalSkip = 0;

  for (const cfg of TABLES) {
    const r = await migrateTable(cfg);
    totalOk += r.ok; totalFail += r.fail; totalSkip += r.skip;
  }

  console.log("\n========================================");
  console.log(`TOTAL: ${totalOk} migrated, ${totalFail} failed, ${totalSkip} already Cloudinary`);
  console.log("========================================");
}

main().catch(console.error);
