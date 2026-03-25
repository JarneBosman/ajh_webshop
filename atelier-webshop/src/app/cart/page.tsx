import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { CartContent } from "@/app/cart/cart-content";
import { getPublishedCmsPageContentFromStore, getPublishedSeoBySlug } from "@/lib/cms-repository";
import { getTranslations, languageCookieName, normalizeLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);
  const seo = await getPublishedSeoBySlug("cart", language);

  return {
    title: seo?.metaTitle || t.cartReviewTitle,
    description: seo?.metaDescription || t.cartCheckoutHint,
    openGraph: {
      title: seo?.metaTitle || t.cartReviewTitle,
      description: seo?.metaDescription || t.cartCheckoutHint,
      ...(seo?.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const cmsContent = await getPublishedCmsPageContentFromStore("cart", language);

  return (
    <Providers>
      <CartContent cmsContent={cmsContent} />
    </Providers>
  );
}
