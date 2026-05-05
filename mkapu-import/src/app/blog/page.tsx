import { supabase } from "@/lib/supabase";
import BlogList from "./BlogList";

export const revalidate = 60;

export default async function BlogPage() {
  const [{ data: posts }, { data: bannerData }] = await Promise.all([
    supabase
      .from("vlog_posts")
      .select("*")
      .eq("activo", true)
      .order("fecha_publicacion", { ascending: false }),
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/blog")
      .single(),
  ]);

  const postsWithImages = await Promise.all(
    (posts || []).map(async (post) => {
      const { data: imagenes } = await supabase
        .from("vlog_imagenes")
        .select("*")
        .eq("vlog_post_id", post.id)
        .order("orden")
        .limit(1);

      return {
        ...post,
        imagen_principal: imagenes?.[0]?.url_imagen || null,
      };
    }),
  );

  return <BlogList posts={postsWithImages} banner={bannerData ?? null} />;
}
