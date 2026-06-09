import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually (dotenv not available)
function loadEnv(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = value;
  }
}

loadEnv(path.resolve(__dirname, "../.env.local"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SUPABASE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/imagenes/`;

interface TableConfig {
  table: string;
  column: string;
  folder: string;
  resourceType?: "image" | "video" | "auto";
  where?: string;
}

const TABLES: TableConfig[] = [
  { table: "productos", column: "image_url", folder: "productos/main" },
  { table: "producto_imagenes", column: "url_imagenes", folder: "productos/gallery" },
  { table: "producto_videos", column: "video_url", folder: "productos/videos", resourceType: "video" },
  { table: "videos", column: "video_url", folder: "videos", resourceType: "video" },
  { table: "videos", column: "thumbnail", folder: "videos/thumbnails" },
  { table: "vlog_imagenes", column: "url_imagen", folder: "blog/imagenes" },
  { table: "vlog_videos", column: "video_url", folder: "blog/videos", resourceType: "video" },
  { table: "quienes_somos_imagenes", column: "url_imagen", folder: "sobre-nosotros" },
  { table: "marcas", column: "logo_url", folder: "marcas" },
  { table: "colaboradores", column: "logo_url", folder: "colaboradores/logos" },
  { table: "colaborador_media", column: "url", folder: "colaboradores/media" },
  { table: "empresa", column: "logo", folder: "empresa" },
  { table: "banners_carousel", column: "image_url", folder: "banners/carousel" },
  { table: "banners_config", column: "image_url", folder: "banners/config" },
];

function isSupabaseUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("supabase.co/storage");
}

async function migrateUrl(
  oldUrl: string,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto",
): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(oldUrl, {
      folder,
      resource_type: resourceType,
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  FAILED: ${oldUrl.slice(0, 80)}... - ${err}`);
    return null;
  }
}

async function migrateTable(cfg: TableConfig): Promise<{ ok: number; fail: number; skip: number }> {
  console.log(`\n=== ${cfg.table}.${cfg.column} → ${cfg.folder} ===`);

  let query = supabase.from(cfg.table).select(`id, ${cfg.column}`);
  if (cfg.where) {
    query = query.or(cfg.where);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error(`  ERROR querying ${cfg.table}: ${error.message}`);
    return { ok: 0, fail: 0, skip: 0 };
  }

  if (!rows || rows.length === 0) {
    console.log("  No records found.");
    return { ok: 0, fail: 0, skip: 0 };
  }

  let ok = 0, fail = 0, skip = 0;

  for (const row of rows) {
    const r = row as unknown as Record<string, unknown>;
    const oldUrl: string | null = r[cfg.column] as string | null;
    if (!isSupabaseUrl(oldUrl)) {
      skip++;
      continue;
    }

    process.stdout.write(`  [${ok + fail + skip}/${rows.length}] Migrating ID ${r.id}... `);
    const newUrl = await migrateUrl(oldUrl!, cfg.folder, cfg.resourceType ?? "auto");

    if (!newUrl) {
      fail++;
      console.log("FAILED");
      continue;
    }

    const { error: updateError } = await supabase
      .from(cfg.table)
      .update({ [cfg.column]: newUrl })
      .eq("id", r.id);

    if (updateError) {
      console.log(`UPDATED CLOUDINARY BUT FAILED TO SAVE TO DB: ${updateError.message}`);
      fail++;
    } else {
      ok++;
      console.log("OK");
    }
  }

  console.log(`  Result: ${ok} migrated, ${fail} failed, ${skip} already Cloudinary`);

  return { ok, fail, skip };
}

async function main() {
  console.log("=== MEDIA MIGRATION: Supabase Storage → Cloudinary ===\n");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Cloudinary: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\n`);

  let totalOk = 0, totalFail = 0, totalSkip = 0;

  for (const cfg of TABLES) {
    const result = await migrateTable(cfg);
    totalOk += result.ok;
    totalFail += result.fail;
    totalSkip += result.skip;
  }

  console.log("\n========================================");
  console.log(`TOTAL: ${totalOk} migrated, ${totalFail} failed, ${totalSkip} already Cloudinary`);
  console.log("========================================");
}

main().catch(console.error);
