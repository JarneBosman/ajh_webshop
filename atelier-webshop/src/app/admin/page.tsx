"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { OptionInputType } from "@/types/shop";

interface ProductRow {
  id: string;
  name: string;
  name_nl: string | null;
  slug: string;
  category: string;
  base_price: number;
  subtitle: string;
  subtitle_nl: string | null;
  description: string;
  description_nl: string | null;
  lead_time: string;
  lead_time_nl: string | null;
  images: unknown;
  featured: boolean;
  story: string | null;
  story_nl: string | null;
  default_selections: unknown;
  custom_options: unknown;
}

type ProductCategory = string;

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_nl: string | null;
  description: string;
  description_nl: string | null;
  hero_image: string;
}

interface NewCategoryState {
  name: string;
  nameNl: string;
  slug: string;
  description: string;
  descriptionNl: string;
  heroImage: string;
}

type LayoutMode = "compact" | "balanced" | "spacious";
type ContainerWidthMode = "narrow" | "standard" | "wide";
type SectionSpacingMode = "tight" | "balanced" | "airy";
type HeroLayoutMode = "split" | "centered" | "image-first";

interface AppearanceSettingsState {
  brandName: string;
  colorBg: string;
  colorInk: string;
  colorMuted: string;
  colorNeutral100: string;
  colorNeutral200: string;
  colorNeutral300: string;
  colorWood: string;
  colorWoodDark: string;
  layoutMode: LayoutMode;
  containerWidth: ContainerWidthMode;
  sectionSpacing: SectionSpacingMode;
  heroLayout: HeroLayoutMode;
}

interface AppearanceScheme {
  id: string;
  name: string;
  settings: AppearanceSettingsState;
}

interface CmsSeoState {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface CmsHomeDraftState {
  heroEyebrow: string;
  heroEyebrowNl: string;
  heroTitle: string;
  heroTitleNl: string;
  heroDescription: string;
  heroDescriptionNl: string;
  heroPrimaryCta: string;
  heroPrimaryCtaNl: string;
  heroSecondaryCta: string;
  heroSecondaryCtaNl: string;
  heroImage: string;
  featuredEyebrow: string;
  featuredEyebrowNl: string;
  featuredTitle: string;
  featuredTitleNl: string;
  featuredDescription: string;
  featuredDescriptionNl: string;
  categoriesEyebrow: string;
  categoriesEyebrowNl: string;
  categoriesTitle: string;
  categoriesTitleNl: string;
  categoriesDescription: string;
  categoriesDescriptionNl: string;
  storyEyebrow: string;
  storyEyebrowNl: string;
  storyTitle: string;
  storyTitleNl: string;
  storyDescription: string;
  storyDescriptionNl: string;
  storyPointOne: string;
  storyPointOneNl: string;
  storyPointTwo: string;
  storyPointTwoNl: string;
  storyPointThree: string;
  storyPointThreeNl: string;
}

interface CmsLinkRowState {
  id: string;
  label: string;
  labelNl: string;
  href: string;
  external: boolean;
}

type CmsPageSlug = "home" | "shop" | "configurator" | "cart";

interface CmsGenericDraftState {
  eyebrow: string;
  eyebrowNl: string;
  title: string;
  titleNl: string;
  description: string;
  descriptionNl: string;
  primaryCta: string;
  primaryCtaNl: string;
  secondaryCta: string;
  secondaryCtaNl: string;
}

interface CmsMediaAssetRow {
  id: string;
  bucket: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt: string | null;
  alt_nl: string | null;
  created_at: string;
}

interface NewProductState {
  name: string;
  nameNl: string;
  slug: string;
  category: ProductCategory;
  basePrice: string;
  subtitle: string;
  subtitleNl: string;
  description: string;
  descriptionNl: string;
  leadTime: string;
  leadTimeNl: string;
  images: string;
  featured: boolean;
  story: string;
  storyNl: string;
}

const createInitialCategoryState = (): NewCategoryState => ({
  name: "",
  nameNl: "",
  slug: "",
  description: "",
  descriptionNl: "",
  heroImage: "",
});

const createInitialAppearanceState = (): AppearanceSettingsState => ({
  brandName: "Atelier Nord",
  colorBg: "#fbfaf8",
  colorInk: "#2b231d",
  colorMuted: "#6f655c",
  colorNeutral100: "#f2ede7",
  colorNeutral200: "#e8e1d8",
  colorNeutral300: "#d7cabc",
  colorWood: "#b88a5b",
  colorWoodDark: "#7f5534",
  layoutMode: "balanced",
  containerWidth: "standard",
  sectionSpacing: "balanced",
  heroLayout: "split",
});

const createInitialCmsSeoState = (): CmsSeoState => ({
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
});

const createInitialCmsHomeDraftState = (): CmsHomeDraftState => ({
  heroEyebrow: "",
  heroEyebrowNl: "",
  heroTitle: "",
  heroTitleNl: "",
  heroDescription: "",
  heroDescriptionNl: "",
  heroPrimaryCta: "",
  heroPrimaryCtaNl: "",
  heroSecondaryCta: "",
  heroSecondaryCtaNl: "",
  heroImage: "",
  featuredEyebrow: "",
  featuredEyebrowNl: "",
  featuredTitle: "",
  featuredTitleNl: "",
  featuredDescription: "",
  featuredDescriptionNl: "",
  categoriesEyebrow: "",
  categoriesEyebrowNl: "",
  categoriesTitle: "",
  categoriesTitleNl: "",
  categoriesDescription: "",
  categoriesDescriptionNl: "",
  storyEyebrow: "",
  storyEyebrowNl: "",
  storyTitle: "",
  storyTitleNl: "",
  storyDescription: "",
  storyDescriptionNl: "",
  storyPointOne: "",
  storyPointOneNl: "",
  storyPointTwo: "",
  storyPointTwoNl: "",
  storyPointThree: "",
  storyPointThreeNl: "",
});

const createInitialCmsGenericDraftState = (): CmsGenericDraftState => ({
  eyebrow: "",
  eyebrowNl: "",
  title: "",
  titleNl: "",
  description: "",
  descriptionNl: "",
  primaryCta: "",
  primaryCtaNl: "",
  secondaryCta: "",
  secondaryCtaNl: "",
});

interface DefaultSelectionRow {
  id: string;
  optionId: string;
  choiceId: string;
}

interface CustomOptionChoiceForm {
  formId: string;
  id: string;
  label: string;
  labelNl: string;
  priceModifier: string;
  swatchHex: string;
}

interface CustomOptionForm {
  formId: string;
  id: string;
  label: string;
  labelNl: string;
  helperText: string;
  helperTextNl: string;
  type: OptionInputType;
  choices: CustomOptionChoiceForm[];
}

const defaultStandardOptionIds = ["material", "size"];
const standardOptionStorageKey = "atelier.admin.defaultSelectionStandardOptionIds";
const appearanceSchemesStorageKey = "atelier.admin.appearanceSchemes";
const productImageBucket = "product-images";
const appearanceUndoHistoryLimit = 30;
const cmsHomeSlug = "home";
const cmsMediaBucket = "cms-media";
const cmsManagedPageSlugs: CmsPageSlug[] = ["home", "shop", "configurator", "cart"];
const cmsAdditionalPageSlugs: Array<Exclude<CmsPageSlug, "home">> = [
  "shop",
  "configurator",
  "cart",
];

const createCmsLinkRow = (): CmsLinkRowState => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  label: "",
  labelNl: "",
  href: "",
  external: false,
});

const asText = (value: unknown) => (typeof value === "string" ? value : "");

const parseCmsHomeDraft = (value: unknown): CmsHomeDraftState => {
  const defaults = createInitialCmsHomeDraftState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;

  return {
    heroEyebrow: asText(source.heroEyebrow),
    heroEyebrowNl: asText(source.heroEyebrowNl),
    heroTitle: asText(source.heroTitle),
    heroTitleNl: asText(source.heroTitleNl),
    heroDescription: asText(source.heroDescription),
    heroDescriptionNl: asText(source.heroDescriptionNl),
    heroPrimaryCta: asText(source.heroPrimaryCta),
    heroPrimaryCtaNl: asText(source.heroPrimaryCtaNl),
    heroSecondaryCta: asText(source.heroSecondaryCta),
    heroSecondaryCtaNl: asText(source.heroSecondaryCtaNl),
    heroImage: asText(source.heroImage),
    featuredEyebrow: asText(source.featuredEyebrow),
    featuredEyebrowNl: asText(source.featuredEyebrowNl),
    featuredTitle: asText(source.featuredTitle),
    featuredTitleNl: asText(source.featuredTitleNl),
    featuredDescription: asText(source.featuredDescription),
    featuredDescriptionNl: asText(source.featuredDescriptionNl),
    categoriesEyebrow: asText(source.categoriesEyebrow),
    categoriesEyebrowNl: asText(source.categoriesEyebrowNl),
    categoriesTitle: asText(source.categoriesTitle),
    categoriesTitleNl: asText(source.categoriesTitleNl),
    categoriesDescription: asText(source.categoriesDescription),
    categoriesDescriptionNl: asText(source.categoriesDescriptionNl),
    storyEyebrow: asText(source.storyEyebrow),
    storyEyebrowNl: asText(source.storyEyebrowNl),
    storyTitle: asText(source.storyTitle),
    storyTitleNl: asText(source.storyTitleNl),
    storyDescription: asText(source.storyDescription),
    storyDescriptionNl: asText(source.storyDescriptionNl),
    storyPointOne: asText(source.storyPointOne),
    storyPointOneNl: asText(source.storyPointOneNl),
    storyPointTwo: asText(source.storyPointTwo),
    storyPointTwoNl: asText(source.storyPointTwoNl),
    storyPointThree: asText(source.storyPointThree),
    storyPointThreeNl: asText(source.storyPointThreeNl),
  };
};

const parseCmsGenericDraft = (value: unknown): CmsGenericDraftState => {
  const defaults = createInitialCmsGenericDraftState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;

  return {
    eyebrow: asText(source.eyebrow),
    eyebrowNl: asText(source.eyebrowNl),
    title: asText(source.title),
    titleNl: asText(source.titleNl),
    description: asText(source.description),
    descriptionNl: asText(source.descriptionNl),
    primaryCta: asText(source.primaryCta),
    primaryCtaNl: asText(source.primaryCtaNl),
    secondaryCta: asText(source.secondaryCta),
    secondaryCtaNl: asText(source.secondaryCtaNl),
  };
};

const parseCmsSeoDraft = (value: unknown): CmsSeoState => {
  const defaults = createInitialCmsSeoState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;

  return {
    metaTitle: asText(source.metaTitle),
    metaDescription: asText(source.metaDescription),
    ogImage: asText(source.ogImage),
  };
};

const parseCmsLinkRows = (value: unknown): CmsLinkRowState[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): CmsLinkRowState | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const source = entry as Record<string, unknown>;
      const label = asText(source.label).trim();
      const href = asText(source.href).trim();

      if (!label || !href) {
        return null;
      }

      return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label,
        labelNl: asText(source.labelNl).trim(),
        href,
        external: source.external === true,
      };
    })
    .filter((entry): entry is CmsLinkRowState => entry !== null);
};

const serializeCmsLinkRows = (rows: CmsLinkRowState[]) =>
  rows
    .map((row) => ({
      label: row.label.trim(),
      labelNl: row.labelNl.trim(),
      href: row.href.trim(),
      external: row.external,
    }))
    .filter((row) => row.label.length > 0 && row.href.length > 0)
    .map((row) => ({
      label: row.label,
      href: row.href,
      ...(row.labelNl ? { labelNl: row.labelNl } : {}),
      ...(row.external ? { external: true } : {}),
    }));

const createDefaultSelectionRow = (): DefaultSelectionRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  optionId: "",
  choiceId: "",
});

const createDefaultSelectionRowForOption = (optionId: string): DefaultSelectionRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  optionId,
  choiceId: "",
});

const createStandardDefaultSelectionRows = (optionIds: string[]): DefaultSelectionRow[] =>
  optionIds.map((optionId) => createDefaultSelectionRowForOption(optionId));

const createCustomChoiceForm = (): CustomOptionChoiceForm => ({
  formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: "",
  label: "",
  labelNl: "",
  priceModifier: "0",
  swatchHex: "",
});

const createCustomOptionForm = (): CustomOptionForm => ({
  formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: "",
  label: "",
  labelNl: "",
  helperText: "",
  helperTextNl: "",
  type: "dropdown",
  choices: [createCustomChoiceForm()],
});

const normalizeOptionId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

const toColorInputValue = (value: string) => {
  const trimmed = value.trim();
  return /^#([0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : "#c9a97c";
};

const createInitialProductState = (): NewProductState => ({
  name: "",
  nameNl: "",
  slug: "",
  category: "tables",
  basePrice: "",
  subtitle: "",
  subtitleNl: "",
  description: "",
  descriptionNl: "",
  leadTime: "6-8 weeks",
  leadTimeNl: "",
  images: "",
  featured: false,
  story: "",
  storyNl: "",
});

const fieldClassName =
  "mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

export default function AdminPage() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"catalog" | "appearance">("catalog");
  const [appearanceForm, setAppearanceForm] = useState<AppearanceSettingsState>(
    createInitialAppearanceState,
  );
  const [loadingAppearance, setLoadingAppearance] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearanceDirty, setAppearanceDirty] = useState(false);
  const [appearanceUndoHistory, setAppearanceUndoHistory] = useState<AppearanceSettingsState[]>([]);
  const [appearanceRedoHistory, setAppearanceRedoHistory] = useState<AppearanceSettingsState[]>([]);
  const [appearanceDefaultSnapshot, setAppearanceDefaultSnapshot] =
    useState<AppearanceSettingsState | null>(null);
  const [appearanceSchemes, setAppearanceSchemes] = useState<AppearanceScheme[]>([]);
  const [newAppearanceSchemeName, setNewAppearanceSchemeName] = useState("");
  const [appearanceDrawerOpen, setAppearanceDrawerOpen] = useState(false);
  const [previewPath, setPreviewPath] = useState("/");
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceSuccess, setAppearanceSuccess] = useState("");
  const [loadingCms, setLoadingCms] = useState(false);
  const [savingCmsDraft, setSavingCmsDraft] = useState(false);
  const [publishingCms, setPublishingCms] = useState(false);
  const [cmsError, setCmsError] = useState("");
  const [cmsSuccess, setCmsSuccess] = useState("");
  const [cmsHomeDraft, setCmsHomeDraft] = useState<CmsHomeDraftState>(
    createInitialCmsHomeDraftState,
  );
  const [cmsSeoDraft, setCmsSeoDraft] = useState<CmsSeoState>(createInitialCmsSeoState);
  const [cmsPageDrafts, setCmsPageDrafts] = useState<
    Record<Exclude<CmsPageSlug, "home">, CmsGenericDraftState>
  >({
    shop: createInitialCmsGenericDraftState(),
    configurator: createInitialCmsGenericDraftState(),
    cart: createInitialCmsGenericDraftState(),
  });
  const [cmsPageSeoDrafts, setCmsPageSeoDrafts] = useState<
    Record<Exclude<CmsPageSlug, "home">, CmsSeoState>
  >({
    shop: createInitialCmsSeoState(),
    configurator: createInitialCmsSeoState(),
    cart: createInitialCmsSeoState(),
  });
  const [cmsPagePublishedAt, setCmsPagePublishedAt] = useState<
    Record<Exclude<CmsPageSlug, "home">, string | null>
  >({
    shop: null,
    configurator: null,
    cart: null,
  });
  const [cmsHeaderLinks, setCmsHeaderLinks] = useState<CmsLinkRowState[]>([]);
  const [cmsFooterLinks, setCmsFooterLinks] = useState<CmsLinkRowState[]>([]);
  const [cmsHomePublishedAt, setCmsHomePublishedAt] = useState<string | null>(null);
  const [cmsMediaAssets, setCmsMediaAssets] = useState<CmsMediaAssetRow[]>([]);
  const [cmsMediaUploadError, setCmsMediaUploadError] = useState("");
  const [isUploadingCmsMedia, setIsUploadingCmsMedia] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<NewCategoryState>(createInitialCategoryState);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<NewProductState>(createInitialProductState);
  const [standardOptionIds, setStandardOptionIds] = useState<string[]>(defaultStandardOptionIds);
  const [newStandardOptionId, setNewStandardOptionId] = useState("");
  const [defaultSelectionRows, setDefaultSelectionRows] = useState<DefaultSelectionRow[]>(
    createStandardDefaultSelectionRows(defaultStandardOptionIds),
  );
  const [customOptionsForm, setCustomOptionsForm] = useState<CustomOptionForm[]>([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [ownerCheckError, setOwnerCheckError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem(standardOptionStorageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = Array.from(
        new Set(
          parsed
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => normalizeOptionId(entry))
            .filter(Boolean),
        ),
      );

      if (normalized.length === 0) {
        return;
      }

      setStandardOptionIds(normalized);
      setDefaultSelectionRows((previousRows) => {
        const presentOptionIds = new Set(
          previousRows.map((row) => row.optionId.trim().toLowerCase()),
        );

        const missingRows = normalized
          .filter((optionId) => !presentOptionIds.has(optionId))
          .map((optionId) => createDefaultSelectionRowForOption(optionId));

        return missingRows.length > 0 ? [...previousRows, ...missingRows] : previousRows;
      });
    } catch {
      window.localStorage.removeItem(standardOptionStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(standardOptionStorageKey, JSON.stringify(standardOptionIds));
  }, [standardOptionIds]);

  useEffect(() => {
    const stored = window.localStorage.getItem(appearanceSchemesStorageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = parsed
        .map((entry): AppearanceScheme | null => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const candidate = entry as Record<string, unknown>;
          const settings = candidate.settings as Record<string, unknown> | undefined;

          if (!settings || typeof settings !== "object") {
            return null;
          }

          const layoutMode = settings.layoutMode;
          const containerWidth = settings.containerWidth;
          const sectionSpacing = settings.sectionSpacing;
          const heroLayout = settings.heroLayout;

          if (
            layoutMode !== "compact" &&
            layoutMode !== "balanced" &&
            layoutMode !== "spacious"
          ) {
            return null;
          }

          if (
            containerWidth !== "narrow" &&
            containerWidth !== "standard" &&
            containerWidth !== "wide"
          ) {
            return null;
          }

          if (
            sectionSpacing !== "tight" &&
            sectionSpacing !== "balanced" &&
            sectionSpacing !== "airy"
          ) {
            return null;
          }

          if (
            heroLayout !== "split" &&
            heroLayout !== "centered" &&
            heroLayout !== "image-first"
          ) {
            return null;
          }

          const requiredColorFields = [
            "brandName",
            "colorBg",
            "colorInk",
            "colorMuted",
            "colorNeutral100",
            "colorNeutral200",
            "colorNeutral300",
            "colorWood",
            "colorWoodDark",
          ];

          for (const field of requiredColorFields) {
            if (typeof settings[field] !== "string") {
              return null;
            }
          }

          return {
            id:
              typeof candidate.id === "string" && candidate.id.length > 0
                ? candidate.id
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name:
              typeof candidate.name === "string" && candidate.name.trim().length > 0
                ? candidate.name.trim()
                : "Saved scheme",
            settings: {
              brandName: settings.brandName as string,
              colorBg: settings.colorBg as string,
              colorInk: settings.colorInk as string,
              colorMuted: settings.colorMuted as string,
              colorNeutral100: settings.colorNeutral100 as string,
              colorNeutral200: settings.colorNeutral200 as string,
              colorNeutral300: settings.colorNeutral300 as string,
              colorWood: settings.colorWood as string,
              colorWoodDark: settings.colorWoodDark as string,
              layoutMode,
              containerWidth,
              sectionSpacing,
              heroLayout,
            },
          };
        })
        .filter((entry): entry is AppearanceScheme => Boolean(entry));

      setAppearanceSchemes(normalized);
    } catch {
      window.localStorage.removeItem(appearanceSchemesStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(appearanceSchemesStorageKey, JSON.stringify(appearanceSchemes));
  }, [appearanceSchemes]);

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data?.session ?? null);
      setSessionChecked(true);
    };

    void initializeSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!sessionChecked) {
      return;
    }

    if (!session) {
      router.replace("/admin/login");
    }
  }, [router, session, sessionChecked]);

  const fetchCategories = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingCategories(true);
      setCategoryError("");

      const { data, error: queryError } = await supabase
        .from("categories" as never)
        .select("id, slug, name, name_nl, description, description_nl, hero_image")
        .order("created_at", { ascending: true });

      if (queryError) {
        setCategoryError(queryError.message);
        return;
      }

      const nextRows = (data ?? []) as CategoryRow[];
      setCategoryRows(nextRows);

      if (nextRows.length > 0) {
        setProductForm((previous) => {
          const exists = nextRows.some((row) => row.slug === previous.category);
          return exists ? previous : { ...previous, category: nextRows[0].slug };
        });
      }
    } catch {
      setCategoryError("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  }, [session, supabase]);

  const fetchAppearanceSettings = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingAppearance(true);
      setAppearanceError("");

      const { data, error: queryError } = await (supabase as any)
        .from("site_settings")
        .select(
          "brand_name, color_bg, color_ink, color_muted, color_neutral_100, color_neutral_200, color_neutral_300, color_wood, color_wood_dark, layout_mode, container_width, section_spacing, hero_layout",
        )
        .eq("id", 1)
        .maybeSingle();

      if (queryError) {
        setAppearanceError(queryError.message);
        return;
      }

      if (!data) {
        return;
      }

      setAppearanceForm({
        brandName: data.brand_name,
        colorBg: data.color_bg,
        colorInk: data.color_ink,
        colorMuted: data.color_muted,
        colorNeutral100: data.color_neutral_100,
        colorNeutral200: data.color_neutral_200,
        colorNeutral300: data.color_neutral_300,
        colorWood: data.color_wood,
        colorWoodDark: data.color_wood_dark,
        layoutMode: (data.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (data.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (data.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (data.hero_layout ?? "split") as HeroLayoutMode,
      });
      setAppearanceDefaultSnapshot({
        brandName: data.brand_name,
        colorBg: data.color_bg,
        colorInk: data.color_ink,
        colorMuted: data.color_muted,
        colorNeutral100: data.color_neutral_100,
        colorNeutral200: data.color_neutral_200,
        colorNeutral300: data.color_neutral_300,
        colorWood: data.color_wood,
        colorWoodDark: data.color_wood_dark,
        layoutMode: (data.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (data.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (data.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (data.hero_layout ?? "split") as HeroLayoutMode,
      });
      setAppearanceDirty(false);
      setAppearanceUndoHistory([]);
      setAppearanceRedoHistory([]);
    } catch {
      setAppearanceError("Failed to load appearance settings.");
    } finally {
      setLoadingAppearance(false);
    }
  }, [session, supabase]);

  const saveAppearanceSettings = useCallback(
    async (nextAppearance: AppearanceSettingsState) => {
      try {
        setSavingAppearance(true);
        setAppearanceError("");

        const { error: upsertError } = await (supabase as any).from("site_settings").upsert({
          id: 1,
          brand_name: nextAppearance.brandName.trim() || "Atelier Nord",
          color_bg: nextAppearance.colorBg,
          color_ink: nextAppearance.colorInk,
          color_muted: nextAppearance.colorMuted,
          color_neutral_100: nextAppearance.colorNeutral100,
          color_neutral_200: nextAppearance.colorNeutral200,
          color_neutral_300: nextAppearance.colorNeutral300,
          color_wood: nextAppearance.colorWood,
          color_wood_dark: nextAppearance.colorWoodDark,
          layout_mode: nextAppearance.layoutMode,
          container_width: nextAppearance.containerWidth,
          section_spacing: nextAppearance.sectionSpacing,
          hero_layout: nextAppearance.heroLayout,
        });

        if (upsertError) {
          setAppearanceError(upsertError.message);
          return;
        }

        setAppearanceDirty(false);
        setAppearanceDefaultSnapshot({ ...nextAppearance });
        setAppearanceSuccess("Appearance settings saved.");
      } catch {
        setAppearanceError("Failed to save appearance settings.");
      } finally {
        setSavingAppearance(false);
      }
    },
    [supabase],
  );

  const updateAppearanceForm = useCallback(
    (updater: React.SetStateAction<AppearanceSettingsState>) => {
      setAppearanceForm((previous) => {
        const next = typeof updater === "function" ? updater(previous) : updater;

        if (JSON.stringify(previous) !== JSON.stringify(next)) {
          setAppearanceUndoHistory((previousHistory) => {
            const nextHistory = [...previousHistory, previous];
            return nextHistory.slice(-appearanceUndoHistoryLimit);
          });
          setAppearanceRedoHistory([]);
          setAppearanceDirty(true);
          setAppearanceSuccess("");
        }

        return next;
      });
    },
    [],
  );

  const updateAppearanceField = useCallback(
    <K extends keyof AppearanceSettingsState>(field: K, value: AppearanceSettingsState[K]) => {
      updateAppearanceForm((previous) => ({ ...previous, [field]: value }));
    },
    [updateAppearanceForm],
  );

  const handleUndoAppearanceChange = () => {
    if (appearanceUndoHistory.length === 0) {
      return;
    }

    const previousSnapshot = appearanceUndoHistory[appearanceUndoHistory.length - 1];
    setAppearanceUndoHistory((previousHistory) => previousHistory.slice(0, -1));
    setAppearanceRedoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, appearanceForm];
      return nextHistory.slice(-appearanceUndoHistoryLimit);
    });
    setAppearanceForm(previousSnapshot);
    setAppearanceDirty(true);
    setAppearanceSuccess("");
    setAppearanceError("");
  };

  const handleRedoAppearanceChange = () => {
    if (appearanceRedoHistory.length === 0) {
      return;
    }

    const nextSnapshot = appearanceRedoHistory[appearanceRedoHistory.length - 1];
    setAppearanceRedoHistory((previousHistory) => previousHistory.slice(0, -1));
    setAppearanceUndoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, appearanceForm];
      return nextHistory.slice(-appearanceUndoHistoryLimit);
    });
    setAppearanceForm(nextSnapshot);
    setAppearanceDirty(true);
    setAppearanceSuccess("");
    setAppearanceError("");
  };

  const handleSaveAppearanceScheme = () => {
    const schemeName = newAppearanceSchemeName.trim();

    if (!schemeName) {
      setAppearanceError("Enter a scheme name before saving.");
      return;
    }

    setAppearanceSchemes((previous) => {
      const withoutSameName = previous.filter(
        (scheme) => scheme.name.toLowerCase() !== schemeName.toLowerCase(),
      );

      return [
        ...withoutSameName,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: schemeName,
          settings: { ...appearanceForm },
        },
      ];
    });

    setNewAppearanceSchemeName("");
    setAppearanceError("");
    setAppearanceSuccess(`Saved scheme \"${schemeName}\".`);
  };

  const handleApplyAppearanceScheme = (scheme: AppearanceScheme) => {
    updateAppearanceForm({ ...scheme.settings });
    setAppearanceError("");
    setAppearanceSuccess(`Applied scheme \"${scheme.name}\". Click Save Appearance to publish.`);
  };

  const handleDeleteAppearanceScheme = (schemeId: string) => {
    setAppearanceSchemes((previous) => previous.filter((scheme) => scheme.id !== schemeId));
  };

  const handleRestoreAppearanceDefault = () => {
    if (!appearanceDefaultSnapshot) {
      return;
    }

    updateAppearanceForm({ ...appearanceDefaultSnapshot });
    setAppearanceError("");
    setAppearanceSuccess("Restored default appearance from the currently saved website colors.");
  };

  const fetchCmsWorkspace = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingCms(true);
      setCmsError("");

      const [
        { data: pageData, error: pageError },
        { data: navigationData, error: navigationError },
        { data: mediaData, error: mediaError },
      ] = await Promise.all([
        (supabase as any)
          .from("cms_pages")
          .select("slug, title, draft_content, draft_seo, published_at")
          .in("slug", cmsManagedPageSlugs),
        (supabase as any)
          .from("cms_navigation")
          .select("location, draft_items")
          .in("location", ["header", "footer"]),
        (supabase as any)
          .from("cms_media_assets")
          .select("id, bucket, storage_path, mime_type, size_bytes, alt, alt_nl, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      if (mediaError) {
        setCmsError(mediaError.message);
        return;
      }

      const pageRows =
        ((pageData ?? []) as Array<{
          slug: CmsPageSlug;
          draft_content: unknown;
          draft_seo: unknown;
          published_at: string | null;
        }>) ?? [];

      const homePage = pageRows.find((row) => row.slug === cmsHomeSlug);

      setCmsHomeDraft(parseCmsHomeDraft(homePage?.draft_content));
      setCmsSeoDraft(parseCmsSeoDraft(homePage?.draft_seo));
      setCmsHomePublishedAt(homePage?.published_at ?? null);

      setCmsPageDrafts({
        shop: parseCmsGenericDraft(pageRows.find((row) => row.slug === "shop")?.draft_content),
        configurator: parseCmsGenericDraft(
          pageRows.find((row) => row.slug === "configurator")?.draft_content,
        ),
        cart: parseCmsGenericDraft(pageRows.find((row) => row.slug === "cart")?.draft_content),
      });

      setCmsPageSeoDrafts({
        shop: parseCmsSeoDraft(pageRows.find((row) => row.slug === "shop")?.draft_seo),
        configurator: parseCmsSeoDraft(pageRows.find((row) => row.slug === "configurator")?.draft_seo),
        cart: parseCmsSeoDraft(pageRows.find((row) => row.slug === "cart")?.draft_seo),
      });

      setCmsPagePublishedAt({
        shop: pageRows.find((row) => row.slug === "shop")?.published_at ?? null,
        configurator: pageRows.find((row) => row.slug === "configurator")?.published_at ?? null,
        cart: pageRows.find((row) => row.slug === "cart")?.published_at ?? null,
      });

      const rows = (navigationData ?? []) as Array<{ location: "header" | "footer"; draft_items: unknown }>;
      const header = rows.find((row) => row.location === "header");
      const footer = rows.find((row) => row.location === "footer");

      setCmsHeaderLinks(parseCmsLinkRows(header?.draft_items));
      setCmsFooterLinks(parseCmsLinkRows(footer?.draft_items));
      setCmsMediaAssets((mediaData ?? []) as CmsMediaAssetRow[]);
    } catch {
      setCmsError("Failed to load CMS workspace.");
    } finally {
      setLoadingCms(false);
    }
  }, [session, supabase]);

  const handleSaveCmsDraft = useCallback(async () => {
    try {
      setSavingCmsDraft(true);
      setCmsError("");
      setCmsSuccess("");

      const pagePayload = [
        {
          slug: "home",
          title: "Home",
          draft_content: cmsHomeDraft,
          draft_seo: cmsSeoDraft,
        },
        {
          slug: "shop",
          title: "Shop",
          draft_content: cmsPageDrafts.shop,
          draft_seo: cmsPageSeoDrafts.shop,
        },
        {
          slug: "configurator",
          title: "Configurator",
          draft_content: cmsPageDrafts.configurator,
          draft_seo: cmsPageSeoDrafts.configurator,
        },
        {
          slug: "cart",
          title: "Cart",
          draft_content: cmsPageDrafts.cart,
          draft_seo: cmsPageSeoDrafts.cart,
        },
      ];

      const { error: pageError } = await (supabase as any)
        .from("cms_pages")
        .upsert(pagePayload, { onConflict: "slug" });

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      const headerPayload = serializeCmsLinkRows(cmsHeaderLinks);
      const footerPayload = serializeCmsLinkRows(cmsFooterLinks);

      const { error: navigationError } = await (supabase as any).from("cms_navigation").upsert(
        [
          {
            location: "header",
            draft_items: headerPayload,
          },
          {
            location: "footer",
            draft_items: footerPayload,
          },
        ],
        { onConflict: "location" },
      );

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      setCmsSuccess("CMS draft saved.");
    } catch {
      setCmsError("Failed to save CMS draft.");
    } finally {
      setSavingCmsDraft(false);
    }
  }, [
    cmsFooterLinks,
    cmsHeaderLinks,
    cmsHomeDraft,
    cmsPageDrafts.cart,
    cmsPageDrafts.configurator,
    cmsPageDrafts.shop,
    cmsPageSeoDrafts.cart,
    cmsPageSeoDrafts.configurator,
    cmsPageSeoDrafts.shop,
    cmsSeoDraft,
    supabase,
  ]);

  const handlePublishCms = useCallback(async () => {
    try {
      setPublishingCms(true);
      setCmsError("");
      setCmsSuccess("");

      const publishedAt = new Date().toISOString();

      const pagePayload = [
        {
          slug: "home",
          title: "Home",
          draft_content: cmsHomeDraft,
          published_content: cmsHomeDraft,
          draft_seo: cmsSeoDraft,
          published_seo: cmsSeoDraft,
          published_at: publishedAt,
        },
        {
          slug: "shop",
          title: "Shop",
          draft_content: cmsPageDrafts.shop,
          published_content: cmsPageDrafts.shop,
          draft_seo: cmsPageSeoDrafts.shop,
          published_seo: cmsPageSeoDrafts.shop,
          published_at: publishedAt,
        },
        {
          slug: "configurator",
          title: "Configurator",
          draft_content: cmsPageDrafts.configurator,
          published_content: cmsPageDrafts.configurator,
          draft_seo: cmsPageSeoDrafts.configurator,
          published_seo: cmsPageSeoDrafts.configurator,
          published_at: publishedAt,
        },
        {
          slug: "cart",
          title: "Cart",
          draft_content: cmsPageDrafts.cart,
          published_content: cmsPageDrafts.cart,
          draft_seo: cmsPageSeoDrafts.cart,
          published_seo: cmsPageSeoDrafts.cart,
          published_at: publishedAt,
        },
      ];

      const { error: pageError } = await (supabase as any)
        .from("cms_pages")
        .upsert(pagePayload, { onConflict: "slug" });

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      const { error: navigationError } = await (supabase as any).from("cms_navigation").upsert(
        [
          {
            location: "header",
            draft_items: serializeCmsLinkRows(cmsHeaderLinks),
            published_items: serializeCmsLinkRows(cmsHeaderLinks),
          },
          {
            location: "footer",
            draft_items: serializeCmsLinkRows(cmsFooterLinks),
            published_items: serializeCmsLinkRows(cmsFooterLinks),
          },
        ],
        { onConflict: "location" },
      );

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      setCmsHomePublishedAt(publishedAt);
      setCmsPagePublishedAt({
        shop: publishedAt,
        configurator: publishedAt,
        cart: publishedAt,
      });
      setCmsSuccess("CMS content published.");
    } catch {
      setCmsError("Failed to publish CMS content.");
    } finally {
      setPublishingCms(false);
    }
  }, [
    cmsFooterLinks,
    cmsHeaderLinks,
    cmsHomeDraft,
    cmsPageDrafts.cart,
    cmsPageDrafts.configurator,
    cmsPageDrafts.shop,
    cmsPageSeoDrafts.cart,
    cmsPageSeoDrafts.configurator,
    cmsPageSeoDrafts.shop,
    cmsSeoDraft,
    supabase,
  ]);

  const updateCmsLink = useCallback(
    (
      location: "header" | "footer",
      rowId: string,
      field: keyof Omit<CmsLinkRowState, "id">,
      value: string | boolean,
    ) => {
      const updater = (rows: CmsLinkRowState[]) =>
        rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));

      if (location === "header") {
        setCmsHeaderLinks(updater);
      } else {
        setCmsFooterLinks(updater);
      }
    },
    [],
  );

  const addCmsLink = useCallback((location: "header" | "footer") => {
    if (location === "header") {
      setCmsHeaderLinks((previous) => [...previous, createCmsLinkRow()]);
      return;
    }

    setCmsFooterLinks((previous) => [...previous, createCmsLinkRow()]);
  }, []);

  const removeCmsLink = useCallback((location: "header" | "footer", rowId: string) => {
    if (location === "header") {
      setCmsHeaderLinks((previous) => previous.filter((row) => row.id !== rowId));
      return;
    }

    setCmsFooterLinks((previous) => previous.filter((row) => row.id !== rowId));
  }, []);

  const updateCmsPageField = useCallback(
    (
      slug: Exclude<CmsPageSlug, "home">,
      field: keyof CmsGenericDraftState,
      value: string,
    ) => {
      setCmsPageDrafts((previous) => ({
        ...previous,
        [slug]: {
          ...previous[slug],
          [field]: value,
        },
      }));
    },
    [],
  );

  const updateCmsPageSeoField = useCallback(
    (slug: Exclude<CmsPageSlug, "home">, field: keyof CmsSeoState, value: string) => {
      setCmsPageSeoDrafts((previous) => ({
        ...previous,
        [slug]: {
          ...previous[slug],
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleCmsMediaFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!session) {
        return;
      }

      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));

      if (list.length === 0) {
        setCmsMediaUploadError("No valid image files selected for CMS media.");
        return;
      }

      setCmsMediaUploadError("");
      setIsUploadingCmsMedia(true);

      try {
        const uploadErrors: string[] = [];

        for (const file of list) {
          const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
          const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
          const uniquePath = `cms/${Date.now()}-${Math.random().toString(16).slice(2)}-${baseName || "asset"}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(cmsMediaBucket)
            .upload(uniquePath, file, { upsert: false });

          if (uploadError) {
            uploadErrors.push(`${file.name}: ${uploadError.message}`);
            continue;
          }

          const { error: insertError } = await (supabase as any).from("cms_media_assets").insert({
            bucket: cmsMediaBucket,
            storage_path: uniquePath,
            mime_type: file.type || null,
            size_bytes: file.size,
            created_by: session.user.id,
          });

          if (insertError) {
            uploadErrors.push(`${file.name}: ${insertError.message}`);
          }
        }

        if (uploadErrors.length > 0) {
          setCmsMediaUploadError(uploadErrors.join(" | "));
        }

        await fetchCmsWorkspace();
      } finally {
        setIsUploadingCmsMedia(false);
      }
    },
    [fetchCmsWorkspace, session, supabase],
  );

  const handleCmsMediaInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        await handleCmsMediaFiles(event.target.files);
      }

      event.target.value = "";
    },
    [handleCmsMediaFiles],
  );

  const handleUpdateCmsMediaAlt = useCallback(
    async (assetId: string, field: "alt" | "alt_nl", value: string) => {
      const { error: updateError } = await (supabase as any)
        .from("cms_media_assets")
        .update({ [field]: value || null })
        .eq("id", assetId);

      if (updateError) {
        setCmsMediaUploadError(updateError.message);
        return;
      }

      setCmsMediaAssets((previous) =>
        previous.map((asset) => (asset.id === assetId ? { ...asset, [field]: value } : asset)),
      );
    },
    [supabase],
  );

  const fetchProducts = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingProducts(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          "id, name, name_nl, slug, category, base_price, subtitle, subtitle_nl, description, description_nl, lead_time, lead_time_nl, images, featured, story, story_nl, default_selections, custom_options",
        )
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setProducts((data ?? []) as ProductRow[]);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [session, supabase]);

  useEffect(() => {
    if (session) {
      void fetchCategories();
      void fetchProducts();
      void fetchAppearanceSettings();
      void fetchCmsWorkspace();
    }
  }, [session, fetchAppearanceSettings, fetchCategories, fetchCmsWorkspace, fetchProducts]);

  const handleSaveAppearance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveAppearanceSettings(appearanceForm);
  };

  const handleOpenPreviewInNewTab = () => {
    window.open(previewPath, "_blank", "noopener,noreferrer");
  };

  const postPreviewDraft = useCallback(() => {
    if (!previewIframeRef.current?.contentWindow) {
      return;
    }

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:update",
        payload: appearanceForm,
      },
      window.location.origin,
    );
  }, [appearanceForm]);

  useEffect(() => {
    if (activeAdminTab === "appearance") {
      postPreviewDraft();
    }
  }, [activeAdminTab, postPreviewDraft]);

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = categoryForm.name.trim();
    const nameNl = categoryForm.nameNl.trim();
    const slug = slugify(categoryForm.slug || categoryForm.name);
    const description = categoryForm.description.trim();
    const descriptionNl = categoryForm.descriptionNl.trim();

    if (!name || !slug) {
      setCategoryError("Category name and slug are required.");
      return;
    }

    const duplicateSlug = categoryRows.find(
      (category) => category.slug === slug && category.id !== editingCategoryId,
    );

    if (duplicateSlug) {
      setCategoryError(
        `A category with slug "${slug}" already exists. Please choose a different slug.`,
      );
      return;
    }

    try {
      setManagingCategories(true);
      setCategoryError("");

      if (editingCategoryId) {
        const { error: updateError } = await (supabase as any)
          .from("categories")
          .update({
            name,
            name_nl: nameNl || null,
            slug,
            description,
            description_nl: descriptionNl || null,
            hero_image: categoryForm.heroImage.trim(),
          })
          .eq("id", editingCategoryId);

        if (updateError) {
          setCategoryError(updateError.message);
          return;
        }
      } else {
        const { error: insertError } = await (supabase as any).from("categories").insert({
          name,
          name_nl: nameNl || null,
          slug,
          description,
          description_nl: descriptionNl || null,
          hero_image: categoryForm.heroImage.trim(),
        });

        if (insertError) {
          setCategoryError(insertError.message);
          return;
        }
      }

      setEditingCategoryId(null);
      setCategoryForm(createInitialCategoryState());
      await fetchCategories();
      setProductForm((previous) => ({ ...previous, category: slug }));
    } catch {
      setCategoryError("Failed to create category.");
    } finally {
      setManagingCategories(false);
    }
  };

  const handleDeleteCategory = async (category: CategoryRow) => {
    const inUse = products.some((product) => product.category === category.slug);

    if (inUse) {
      setCategoryError("Cannot delete a category that is still used by one or more products.");
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    try {
      setManagingCategories(true);
      setCategoryError("");

      const { error: deleteError } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        setCategoryError(deleteError.message);
        return;
      }

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setCategoryForm(createInitialCategoryState());
      }

      await fetchCategories();
    } catch {
      setCategoryError("Failed to delete category.");
    } finally {
      setManagingCategories(false);
    }
  };

  const handleEditCategory = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setCategoryError("");
    setCategoryForm({
      name: category.name,
      nameNl: category.name_nl ?? "",
      slug: category.slug,
      description: category.description,
      descriptionNl: category.description_nl ?? "",
      heroImage: category.hero_image,
    });
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryError("");
    setCategoryForm(createInitialCategoryState());
  };

  useEffect(() => {
    if (!session) {
      setIsOwner(null);
      setOwnerCheckError("");
      return;
    }

    let active = true;

    const checkOwnerMembership = async () => {
      setOwnerCheckError("");

      const { data, error: membershipError } = await supabase
        .from("admin_users" as never)
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (membershipError) {
        setIsOwner(false);
        setOwnerCheckError(membershipError.message);
        return;
      }

      setIsOwner(Boolean((data as { user_id?: string } | null)?.user_id));
    };

    void checkOwnerMembership();

    return () => {
      active = false;
    };
  }, [session, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setError("");
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id);

      if (!deleteError) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        setError(deleteError.message);
      }
    } catch {
      setError("Error deleting product");
    }
  };

  const updateDefaultSelectionRow = (
    id: string,
    field: "optionId" | "choiceId",
    value: string,
  ) => {
    setDefaultSelectionRows((previousRows) =>
      previousRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addDefaultSelectionRow = () => {
    setDefaultSelectionRows((previousRows) => [...previousRows, createDefaultSelectionRow()]);
  };

  const removeDefaultSelectionRow = (id: string) => {
    setDefaultSelectionRows((previousRows) => {
      const nextRows = previousRows.filter((row) => row.id !== id);
      return nextRows.length > 0 ? nextRows : [createDefaultSelectionRow()];
    });
  };

  const addStandardOptionRow = (optionId: string) => {
    setDefaultSelectionRows((previousRows) => {
      const exists = previousRows.some(
        (row) => row.optionId.trim().toLowerCase() === optionId.toLowerCase(),
      );

      if (exists) {
        return previousRows;
      }

      return [...previousRows, createDefaultSelectionRowForOption(optionId)];
    });
  };

  const restoreStandardOptionRows = () => {
    setDefaultSelectionRows((previousRows) => {
      const presentOptionIds = new Set(
        previousRows.map((row) => row.optionId.trim().toLowerCase()),
      );

      const missingStandardRows = standardOptionIds
        .filter((optionId) => !presentOptionIds.has(optionId))
        .map((optionId) => createDefaultSelectionRowForOption(optionId));

      return missingStandardRows.length > 0
        ? [...previousRows, ...missingStandardRows]
        : previousRows;
    });
  };

  const addStandardOptionId = () => {
    const normalized = normalizeOptionId(newStandardOptionId);

    if (!normalized) {
      return;
    }

    setStandardOptionIds((previousIds) => {
      if (previousIds.includes(normalized)) {
        return previousIds;
      }

      return [...previousIds, normalized];
    });

    addStandardOptionRow(normalized);
    setNewStandardOptionId("");
  };

  const removeStandardOptionId = (optionId: string) => {
    setStandardOptionIds((previousIds) => previousIds.filter((id) => id !== optionId));
  };

  const resetEditorState = () => {
    setEditingProductId(null);
    setProductForm(createInitialProductState());
    setDefaultSelectionRows(createStandardDefaultSelectionRows(standardOptionIds));
    setCustomOptionsForm([]);
    setSlugEdited(false);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleEditProduct = (product: ProductRow) => {
    const normalizedCategory =
      categoryRows.find((row) => row.slug === product.category)?.slug ??
      categoryRows[0]?.slug ??
      "tables";

    const imageList = Array.isArray(product.images)
      ? product.images.filter((entry): entry is string => typeof entry === "string")
      : [];

    const defaultSelectionsRaw =
      product.default_selections && typeof product.default_selections === "object"
        ? (product.default_selections as Record<string, unknown>)
        : {};

    const defaultSelectionEntries = Object.entries(defaultSelectionsRaw).map(([key, value]) => [
      key,
      typeof value === "string" ? value : String(value),
    ]);

    const customOptionsRaw = Array.isArray(product.custom_options)
      ? (product.custom_options as Array<Record<string, unknown>>)
      : [];

    const mappedCustomOptions: CustomOptionForm[] = customOptionsRaw
      .map((option) => {
        const id = typeof option.id === "string" ? option.id : "";
        const label = typeof option.label === "string" ? option.label : "";
        const labelNl = typeof option.labelNl === "string" ? option.labelNl : "";
        const helperText = typeof option.helperText === "string" ? option.helperText : "";
        const helperTextNl =
          typeof option.helperTextNl === "string" ? option.helperTextNl : "";
        const type =
          option.type === "dropdown" || option.type === "toggle" || option.type === "swatch"
            ? option.type
            : "dropdown";
        const choicesRaw = Array.isArray(option.choices)
          ? (option.choices as Array<Record<string, unknown>>)
          : [];
        const choices = choicesRaw
          .map((choice) => ({
            formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            id: typeof choice.id === "string" ? choice.id : "",
            label: typeof choice.label === "string" ? choice.label : "",
            labelNl: typeof choice.labelNl === "string" ? choice.labelNl : "",
            priceModifier: String(Number(choice.priceModifier ?? 0)),
            swatchHex: typeof choice.swatchHex === "string" ? choice.swatchHex : "",
          }))
          .filter((choice) => choice.id || choice.label);

        return {
          formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          id,
          label,
          labelNl,
          helperText,
          helperTextNl,
          type: type as OptionInputType,
          choices: choices.length > 0 ? choices : [createCustomChoiceForm()],
        };
      })
      .filter((option) => option.id || option.label || option.choices.some((choice) => choice.id));

    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      nameNl: product.name_nl ?? "",
      slug: product.slug,
      category: normalizedCategory,
      basePrice: String(product.base_price),
      subtitle: product.subtitle,
      subtitleNl: product.subtitle_nl ?? "",
      description: product.description,
      descriptionNl: product.description_nl ?? "",
      leadTime: product.lead_time,
      leadTimeNl: product.lead_time_nl ?? "",
      images: imageList.join("\n"),
      featured: Boolean(product.featured),
      story: product.story ?? "",
      storyNl: product.story_nl ?? "",
    });
    setDefaultSelectionRows(
      defaultSelectionEntries.length > 0
        ? defaultSelectionEntries.map(([optionId, choiceId]) => ({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            optionId,
            choiceId,
          }))
        : createStandardDefaultSelectionRows(standardOptionIds),
    );
    setCustomOptionsForm(mappedCustomOptions);
    setSlugEdited(true);
    setCreateError("");
    setCreateSuccess("");
  };

  const updateCustomOptionField = (
    optionFormId: string,
    field: "id" | "label" | "labelNl" | "helperText" | "helperTextNl" | "type",
    value: string,
  ) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) =>
        option.formId === optionFormId
          ? {
              ...option,
              [field]: field === "type" ? (value as OptionInputType) : value,
            }
          : option,
      ),
    );
  };

  const addCustomOption = () => {
    setCustomOptionsForm((previous) => [...previous, createCustomOptionForm()]);
  };

  const removeCustomOption = (optionFormId: string) => {
    setCustomOptionsForm((previous) => previous.filter((option) => option.formId !== optionFormId));
  };

  const updateCustomChoiceField = (
    optionFormId: string,
    choiceFormId: string,
    field: "id" | "label" | "labelNl" | "priceModifier" | "swatchHex",
    value: string,
  ) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) => {
        if (option.formId !== optionFormId) {
          return option;
        }

        return {
          ...option,
          choices: option.choices.map((choice) =>
            choice.formId === choiceFormId ? { ...choice, [field]: value } : choice,
          ),
        };
      }),
    );
  };

  const addCustomChoice = (optionFormId: string) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) =>
        option.formId === optionFormId
          ? { ...option, choices: [...option.choices, createCustomChoiceForm()] }
          : option,
      ),
    );
  };

  const removeCustomChoice = (optionFormId: string, choiceFormId: string) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) => {
        if (option.formId !== optionFormId) {
          return option;
        }

        const nextChoices = option.choices.filter((choice) => choice.formId !== choiceFormId);

        return {
          ...option,
          choices: nextChoices.length > 0 ? nextChoices : [createCustomChoiceForm()],
        };
      }),
    );
  };

  const appendImageUrls = (urls: string[]) => {
    if (urls.length === 0) {
      return;
    }

    setProductForm((previous) => {
      const existing = previous.images
        .split(/\r?\n|,/) 
        .map((entry) => entry.trim())
        .filter(Boolean);

      const merged = [...existing, ...urls];

      return {
        ...previous,
        images: merged.join("\n"),
      };
    });
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (list.length === 0) {
      setImageUploadError("No image files detected. Please drop JPG, PNG, WEBP, or GIF files.");
      return;
    }

    setImageUploadError("");
    setIsUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];
      const failedUploads: string[] = [];

      for (const file of list) {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
        const uniquePath = `products/${Date.now()}-${Math.random().toString(16).slice(2)}-${fileName || "image"}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(productImageBucket)
          .upload(uniquePath, file, { upsert: false });

        if (uploadError) {
          failedUploads.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from(productImageBucket)
          .getPublicUrl(uniquePath);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        } else {
          failedUploads.push(`${file.name}: uploaded but public URL could not be generated.`);
        }
      }

      appendImageUrls(uploadedUrls);

      if (failedUploads.length > 0) {
        setImageUploadError(
          `Some uploads failed. ${failedUploads.join(" | ")} (Bucket: \"${productImageBucket}\")`,
        );
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await handleImageFiles(event.target.files);
    }

    event.target.value = "";
  };

  const handleImageDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImages(false);

    if (event.dataTransfer.files) {
      await handleImageFiles(event.dataTransfer.files);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOwner === false) {
      setCreateError(
        "This user is not allowed to create products. Add this user id to public.admin_users in Supabase.",
      );
      setCreateSuccess("");
      return;
    }

    const basePriceNumber = Number(productForm.basePrice);
    if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
      setCreateError("Base price must be a valid number greater than 0.");
      setCreateSuccess("");
      return;
    }

    const name = productForm.name.trim();
    const nameNl = productForm.nameNl.trim();
    const slug = slugify(productForm.slug);
    const subtitle = productForm.subtitle.trim();
    const subtitleNl = productForm.subtitleNl.trim();
    const description = productForm.description.trim();
    const descriptionNl = productForm.descriptionNl.trim();
    const leadTime = productForm.leadTime.trim();
    const leadTimeNl = productForm.leadTimeNl.trim();

    if (!name || !slug || !subtitle || !description || !leadTime) {
      setCreateError("Please fill all required product fields.");
      setCreateSuccess("");
      return;
    }

    const images = productForm.images
      .split(/\r?\n|,/) 
      .map((entry) => entry.trim())
      .filter(Boolean);

    const defaultSelections = Object.fromEntries(
      defaultSelectionRows
        .map((row) => [row.optionId.trim(), row.choiceId.trim()] as const)
        .filter(([optionId, choiceId]) => optionId.length > 0 && choiceId.length > 0),
    );

    const customOptionsPayload: Array<{
      id: string;
      label: string;
      labelNl?: string;
      helperText?: string;
      helperTextNl?: string;
      type: OptionInputType;
      choices: Array<{
        id: string;
        label: string;
        labelNl?: string;
        priceModifier: number;
        swatchHex?: string;
      }>;
    }> = [];

    for (const option of customOptionsForm) {
      const normalizedId = normalizeOptionId(option.id);
      const label = option.label.trim();
      const labelNl = option.labelNl.trim();
      const helperText = option.helperText.trim();
      const helperTextNl = option.helperTextNl.trim();

      const hasAnyData =
        normalizedId.length > 0 ||
        label.length > 0 ||
        labelNl.length > 0 ||
        helperText.length > 0 ||
        helperTextNl.length > 0 ||
        option.choices.some(
          (choice) =>
            choice.id.trim().length > 0 ||
            choice.label.trim().length > 0 ||
            choice.labelNl.trim().length > 0 ||
            choice.swatchHex.trim().length > 0 ||
            choice.priceModifier.trim().length > 0,
        );

      if (!hasAnyData) {
        continue;
      }

      const choices = option.choices
        .map((choice) => {
          const choiceId = normalizeOptionId(choice.id);
          const choiceLabel = choice.label.trim();
          const choiceLabelNl = choice.labelNl.trim();

          if (!choiceId || !choiceLabel) {
            return null;
          }

          return {
            id: choiceId,
            label: choiceLabel,
            ...(choiceLabelNl ? { labelNl: choiceLabelNl } : {}),
            priceModifier: Number(choice.priceModifier || 0),
            ...(choice.swatchHex.trim() ? { swatchHex: choice.swatchHex.trim() } : {}),
          };
        })
        .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice));

      if (!normalizedId || !label || choices.length === 0) {
        setCreateError(
          "Each custom option needs an option id, label, and at least one complete choice (id + label).",
        );
        setCreateSuccess("");
        return;
      }

      customOptionsPayload.push({
        id: normalizedId,
        label,
        ...(labelNl ? { labelNl } : {}),
        ...(helperText ? { helperText } : {}),
        ...(helperTextNl ? { helperTextNl } : {}),
        type: option.type,
        choices,
      });
    }

    try {
      setCreatingProduct(true);
      setCreateError("");
      setCreateSuccess("");

      const productPayload = {
        slug,
        name,
        name_nl: nameNl || null,
        subtitle,
        subtitle_nl: subtitleNl || null,
        description,
        description_nl: descriptionNl || null,
        category: productForm.category,
        base_price: basePriceNumber,
        lead_time: leadTime,
        lead_time_nl: leadTimeNl || null,
        images,
        featured: productForm.featured,
        story: productForm.story.trim() || null,
        story_nl: productForm.storyNl.trim() || null,
        default_selections: defaultSelections,
        custom_options: customOptionsPayload,
      };

      if (editingProductId) {
        const { error: updateError } = await (supabase as any)
          .from("products")
          .update(productPayload)
          .eq("id", editingProductId);

        if (updateError) {
          setCreateError(updateError.message);
          return;
        }

        setCreateSuccess("Product updated successfully.");
      } else {
        const { error: insertError } = await (supabase as any)
          .from("products")
          .insert(productPayload);

        if (insertError) {
          setCreateError(insertError.message);
          return;
        }

        setCreateSuccess("Product created successfully.");
      }

      setProductForm(createInitialProductState());
      setDefaultSelectionRows(createStandardDefaultSelectionRows(standardOptionIds));
      setCustomOptionsForm([]);
      setSlugEdited(false);
      setEditingProductId(null);
      await fetchProducts();
    } catch {
      setCreateError("Failed to create product.");
    } finally {
      setCreatingProduct(false);
    }
  };

  if (!sessionChecked) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-[var(--color-ink)]">Product Manager</h1>
            <p className="mt-2 text-[var(--color-muted)]">Manage products stored in Supabase</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeAdminTab === "catalog" ? "primary" : "secondary"}
            onClick={() => setActiveAdminTab("catalog")}
          >
            Catalog
          </Button>
          <Button
            type="button"
            variant={activeAdminTab === "appearance" ? "primary" : "secondary"}
            onClick={() => setActiveAdminTab("appearance")}
          >
            Appearance
          </Button>
        </div>

        {activeAdminTab === "appearance" ? (
          <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Website Appearance Studio</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Live consumer preview with manual publish. Open Controls to edit settings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                  value={previewPath}
                  onChange={(event) => setPreviewPath(event.target.value)}
                >
                  <option value="/">Home</option>
                  <option value="/shop">Shop</option>
                  <option value="/shop/tables">Category: Tables</option>
                  <option value="/configurator">Configurator</option>
                  <option value="/cart">Cart</option>
                </select>
                <Button type="button" variant="secondary" onClick={() => setAppearanceDrawerOpen(true)}>
                  Open Controls
                </Button>
                <Button type="button" variant="secondary" onClick={handleOpenPreviewInNewTab}>
                  Open Preview Tab
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-5 rounded-2xl border border-black/10 bg-[var(--color-neutral-100)]/55 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">CMS Workspace</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Edit homepage copy, SEO, and navigation links in draft mode, then publish in one click.
                  </p>
                </div>
                <div className="text-xs text-[var(--color-muted)]">
                  {cmsHomePublishedAt
                    ? `Last published: ${new Date(cmsHomePublishedAt).toLocaleString()}`
                    : "Not published yet"}
                </div>
              </div>

              {loadingCms ? (
                <p className="rounded-lg bg-white px-4 py-2 text-sm text-[var(--color-muted)]">
                  Loading CMS workspace...
                </p>
              ) : null}

              {cmsError ? (
                <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{cmsError}</p>
              ) : null}

              {cmsSuccess ? (
                <p className="rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">{cmsSuccess}</p>
              ) : null}

              <details open className="rounded-2xl border border-black/10 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                  Home Content (EN/NL)
                </summary>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {([
                    { label: "Hero Eyebrow", keyEn: "heroEyebrow", keyNl: "heroEyebrowNl" },
                    { label: "Hero Title", keyEn: "heroTitle", keyNl: "heroTitleNl" },
                    {
                      label: "Hero Description",
                      keyEn: "heroDescription",
                      keyNl: "heroDescriptionNl",
                    },
                    { label: "Hero Primary CTA", keyEn: "heroPrimaryCta", keyNl: "heroPrimaryCtaNl" },
                    {
                      label: "Hero Secondary CTA",
                      keyEn: "heroSecondaryCta",
                      keyNl: "heroSecondaryCtaNl",
                    },
                    { label: "Featured Eyebrow", keyEn: "featuredEyebrow", keyNl: "featuredEyebrowNl" },
                    { label: "Featured Title", keyEn: "featuredTitle", keyNl: "featuredTitleNl" },
                    {
                      label: "Featured Description",
                      keyEn: "featuredDescription",
                      keyNl: "featuredDescriptionNl",
                    },
                    {
                      label: "Categories Eyebrow",
                      keyEn: "categoriesEyebrow",
                      keyNl: "categoriesEyebrowNl",
                    },
                    { label: "Categories Title", keyEn: "categoriesTitle", keyNl: "categoriesTitleNl" },
                    {
                      label: "Categories Description",
                      keyEn: "categoriesDescription",
                      keyNl: "categoriesDescriptionNl",
                    },
                    { label: "Story Eyebrow", keyEn: "storyEyebrow", keyNl: "storyEyebrowNl" },
                    { label: "Story Title", keyEn: "storyTitle", keyNl: "storyTitleNl" },
                    {
                      label: "Story Description",
                      keyEn: "storyDescription",
                      keyNl: "storyDescriptionNl",
                    },
                    { label: "Story Point One", keyEn: "storyPointOne", keyNl: "storyPointOneNl" },
                    { label: "Story Point Two", keyEn: "storyPointTwo", keyNl: "storyPointTwoNl" },
                    {
                      label: "Story Point Three",
                      keyEn: "storyPointThree",
                      keyNl: "storyPointThreeNl",
                    },
                  ] as const).map((field) => (
                    <div key={field.keyEn} className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        {field.label}
                      </label>
                      <input
                        className={fieldClassName}
                        value={cmsHomeDraft[field.keyEn]}
                        onChange={(event) =>
                          setCmsHomeDraft((previous) => ({
                            ...previous,
                            [field.keyEn]: event.target.value,
                          }))
                        }
                        placeholder="English"
                      />
                      <input
                        className={fieldClassName}
                        value={cmsHomeDraft[field.keyNl]}
                        onChange={(event) =>
                          setCmsHomeDraft((previous) => ({
                            ...previous,
                            [field.keyNl]: event.target.value,
                          }))
                        }
                        placeholder="Nederlands"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                      Hero Image URL
                    </label>
                    <input
                      className={fieldClassName}
                      value={cmsHomeDraft.heroImage}
                      onChange={(event) =>
                        setCmsHomeDraft((previous) => ({ ...previous, heroImage: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </details>

              <details className="rounded-2xl border border-black/10 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                  Home SEO (Draft)
                </summary>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                      Meta Title
                    </label>
                    <input
                      className={fieldClassName}
                      value={cmsSeoDraft.metaTitle}
                      onChange={(event) =>
                        setCmsSeoDraft((previous) => ({ ...previous, metaTitle: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                      OG Image URL
                    </label>
                    <input
                      className={fieldClassName}
                      value={cmsSeoDraft.ogImage}
                      onChange={(event) =>
                        setCmsSeoDraft((previous) => ({ ...previous, ogImage: event.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                      Meta Description
                    </label>
                    <textarea
                      className={fieldClassName}
                      rows={3}
                      value={cmsSeoDraft.metaDescription}
                      onChange={(event) =>
                        setCmsSeoDraft((previous) => ({
                          ...previous,
                          metaDescription: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </details>

              {cmsAdditionalPageSlugs.map((slug) => (
                <details key={slug} className="rounded-2xl border border-black/10 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold capitalize text-[var(--color-ink)]">
                    {slug} Page (Draft)
                  </summary>

                  <div className="mt-4 text-xs text-[var(--color-muted)]">
                    {cmsPagePublishedAt[slug]
                      ? `Last published: ${new Date(cmsPagePublishedAt[slug] as string).toLocaleString()}`
                      : "Not published yet"}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {([
                      { label: "Eyebrow", keyEn: "eyebrow", keyNl: "eyebrowNl" },
                      { label: "Title", keyEn: "title", keyNl: "titleNl" },
                      { label: "Description", keyEn: "description", keyNl: "descriptionNl" },
                      { label: "Primary CTA", keyEn: "primaryCta", keyNl: "primaryCtaNl" },
                      { label: "Secondary CTA", keyEn: "secondaryCta", keyNl: "secondaryCtaNl" },
                    ] as const).map((field) => (
                      <div key={field.keyEn} className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          {field.label}
                        </label>
                        <input
                          className={fieldClassName}
                          value={cmsPageDrafts[slug][field.keyEn]}
                          onChange={(event) =>
                            updateCmsPageField(slug, field.keyEn, event.target.value)
                          }
                          placeholder="English"
                        />
                        <input
                          className={fieldClassName}
                          value={cmsPageDrafts[slug][field.keyNl]}
                          onChange={(event) =>
                            updateCmsPageField(slug, field.keyNl, event.target.value)
                          }
                          placeholder="Nederlands"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Meta Title
                      </label>
                      <input
                        className={fieldClassName}
                        value={cmsPageSeoDrafts[slug].metaTitle}
                        onChange={(event) =>
                          updateCmsPageSeoField(slug, "metaTitle", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        OG Image URL
                      </label>
                      <input
                        className={fieldClassName}
                        value={cmsPageSeoDrafts[slug].ogImage}
                        onChange={(event) =>
                          updateCmsPageSeoField(slug, "ogImage", event.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Meta Description
                      </label>
                      <textarea
                        className={fieldClassName}
                        rows={3}
                        value={cmsPageSeoDrafts[slug].metaDescription}
                        onChange={(event) =>
                          updateCmsPageSeoField(slug, "metaDescription", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </details>
              ))}

              {([
                { title: "Header Navigation", location: "header", rows: cmsHeaderLinks },
                { title: "Footer Navigation", location: "footer", rows: cmsFooterLinks },
              ] as const).map((section) => (
                <details key={section.location} className="rounded-2xl border border-black/10 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                    {section.title}
                  </summary>

                  <div className="mt-4 space-y-3">
                    {section.rows.map((row) => (
                      <div
                        key={row.id}
                        className="grid gap-2 rounded-xl border border-black/10 p-3 md:grid-cols-[1fr_1fr_1.2fr_auto_auto]"
                      >
                        <input
                          className={fieldClassName}
                          value={row.label}
                          placeholder="Label EN"
                          onChange={(event) =>
                            updateCmsLink(section.location, row.id, "label", event.target.value)
                          }
                        />
                        <input
                          className={fieldClassName}
                          value={row.labelNl}
                          placeholder="Label NL"
                          onChange={(event) =>
                            updateCmsLink(section.location, row.id, "labelNl", event.target.value)
                          }
                        />
                        <input
                          className={fieldClassName}
                          value={row.href}
                          placeholder="/shop"
                          onChange={(event) =>
                            updateCmsLink(section.location, row.id, "href", event.target.value)
                          }
                        />
                        <label className="mt-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <input
                            type="checkbox"
                            checked={row.external}
                            onChange={(event) =>
                              updateCmsLink(section.location, row.id, "external", event.target.checked)
                            }
                          />
                          External
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => removeCmsLink(section.location, row.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button type="button" variant="secondary" onClick={() => addCmsLink(section.location)}>
                      Add Link
                    </Button>
                  </div>
                </details>
              ))}

              <details className="rounded-2xl border border-black/10 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                  Media Library
                </summary>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-dashed border-black/15 bg-[var(--color-neutral-100)] px-4 py-4">
                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)]">
                      Upload images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleCmsMediaInputChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      Uploaded files go to bucket "{cmsMediaBucket}" and are registered in cms_media_assets.
                    </p>
                    {isUploadingCmsMedia ? (
                      <p className="mt-2 text-xs text-[var(--color-muted)]">Uploading CMS media...</p>
                    ) : null}
                    {cmsMediaUploadError ? (
                      <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700">
                        {cmsMediaUploadError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {cmsMediaAssets.length === 0 ? (
                      <p className="text-xs text-[var(--color-muted)]">No CMS media assets uploaded yet.</p>
                    ) : (
                      cmsMediaAssets.map((asset) => {
                        const publicUrl = supabase.storage
                          .from(asset.bucket)
                          .getPublicUrl(asset.storage_path).data.publicUrl;

                        return (
                          <div
                            key={asset.id}
                            className="rounded-xl border border-black/10 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-[var(--color-wood)] underline"
                              >
                                {asset.storage_path}
                              </a>
                              <button
                                type="button"
                                className="text-xs font-medium text-[var(--color-muted)]"
                                onClick={() => void navigator.clipboard.writeText(publicUrl)}
                              >
                                Copy URL
                              </button>
                            </div>

                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              <input
                                className={fieldClassName}
                                value={asset.alt ?? ""}
                                placeholder="Alt text EN"
                                onChange={(event) =>
                                  setCmsMediaAssets((previous) =>
                                    previous.map((row) =>
                                      row.id === asset.id ? { ...row, alt: event.target.value } : row,
                                    ),
                                  )
                                }
                                onBlur={(event) =>
                                  void handleUpdateCmsMediaAlt(asset.id, "alt", event.target.value)
                                }
                              />
                              <input
                                className={fieldClassName}
                                value={asset.alt_nl ?? ""}
                                placeholder="Alt text NL"
                                onChange={(event) =>
                                  setCmsMediaAssets((previous) =>
                                    previous.map((row) =>
                                      row.id === asset.id ? { ...row, alt_nl: event.target.value } : row,
                                    ),
                                  )
                                }
                                onBlur={(event) =>
                                  void handleUpdateCmsMediaAlt(asset.id, "alt_nl", event.target.value)
                                }
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </details>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleSaveCmsDraft()}
                  disabled={loadingCms || savingCmsDraft || publishingCms}
                >
                  {savingCmsDraft ? "Saving Draft..." : "Save CMS Draft"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handlePublishCms()}
                  disabled={loadingCms || savingCmsDraft || publishingCms}
                >
                  {publishingCms ? "Publishing..." : "Publish CMS"}
                </Button>
              </div>
            </div>

            {loadingAppearance ? (
              <p className="mt-4 text-sm text-[var(--color-muted)]">Loading appearance settings...</p>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
              <iframe
                ref={previewIframeRef}
                src={previewPath}
                title="Live storefront preview"
                className="h-[78vh] w-full border-0"
                onLoad={postPreviewDraft}
              />
            </div>

            {appearanceDrawerOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setAppearanceDrawerOpen(false)}
                />
                <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-[520px] overflow-y-auto border-l border-black/10 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-ink)]">Appearance Controls</h3>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Accordion controls keep options out of the way while you preview.
                      </p>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setAppearanceDrawerOpen(false)}>
                      Close
                    </Button>
                  </div>

                  <form onSubmit={handleSaveAppearance} className="mt-5 space-y-3 pb-24">
                    <details open className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        Brand and Layout
                      </summary>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Brand Name</label>
                          <input
                            className={fieldClassName}
                            value={appearanceForm.brandName}
                            onChange={(event) => updateAppearanceField("brandName", event.target.value)}
                            placeholder="Atelier Nord"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Layout Density</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.layoutMode}
                            onChange={(event) =>
                              updateAppearanceField("layoutMode", event.target.value as LayoutMode)
                            }
                          >
                            <option value="compact">compact</option>
                            <option value="balanced">balanced</option>
                            <option value="spacious">spacious</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Container Width</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.containerWidth}
                            onChange={(event) =>
                              updateAppearanceField("containerWidth", event.target.value as ContainerWidthMode)
                            }
                          >
                            <option value="narrow">narrow</option>
                            <option value="standard">standard</option>
                            <option value="wide">wide</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Section Spacing</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.sectionSpacing}
                            onChange={(event) =>
                              updateAppearanceField("sectionSpacing", event.target.value as SectionSpacingMode)
                            }
                          >
                            <option value="tight">tight</option>
                            <option value="balanced">balanced</option>
                            <option value="airy">airy</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Home Hero Layout</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.heroLayout}
                            onChange={(event) =>
                              updateAppearanceField("heroLayout", event.target.value as HeroLayoutMode)
                            }
                          >
                            <option value="split">split</option>
                            <option value="centered">centered</option>
                            <option value="image-first">image-first</option>
                          </select>
                        </div>
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">Colors</summary>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Background", "colorBg"],
                          ["Ink", "colorInk"],
                          ["Muted Text", "colorMuted"],
                          ["Neutral 100", "colorNeutral100"],
                          ["Neutral 200", "colorNeutral200"],
                          ["Neutral 300", "colorNeutral300"],
                          ["Wood Accent", "colorWood"],
                          ["Wood Dark", "colorWoodDark"],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <label className="text-sm font-medium text-[var(--color-ink)]">{label}</label>
                            <input
                              type="color"
                              className={fieldClassName}
                              value={appearanceForm[key as keyof AppearanceSettingsState] as string}
                              onChange={(event) =>
                                updateAppearanceField(
                                  key as keyof AppearanceSettingsState,
                                  event.target.value as never,
                                )
                              }
                            />
                            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                              <span
                                className="h-6 w-6 rounded-md border border-black/20"
                                style={{
                                  backgroundColor: appearanceForm[key as keyof AppearanceSettingsState] as string,
                                }}
                              />
                              <span>
                                {(appearanceForm[key as keyof AppearanceSettingsState] as string).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        Color Schemes
                      </summary>
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="min-w-[180px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                            value={newAppearanceSchemeName}
                            onChange={(event) => setNewAppearanceSchemeName(event.target.value)}
                            placeholder="Scheme name"
                          />
                          <Button type="button" variant="secondary" onClick={handleSaveAppearanceScheme}>
                            Save Scheme
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRestoreAppearanceDefault}
                            disabled={!appearanceDefaultSnapshot}
                          >
                            Restore Default
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {appearanceSchemes.length === 0 ? (
                            <p className="text-xs text-[var(--color-muted)]">No saved schemes yet.</p>
                          ) : (
                            appearanceSchemes.map((scheme) => (
                              <div
                                key={scheme.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/10 px-3 py-2"
                              >
                                <span className="text-sm font-medium text-[var(--color-ink)]">{scheme.name}</span>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleApplyAppearanceScheme(scheme)}
                                  >
                                    Apply
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleDeleteAppearanceScheme(scheme.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        History and Publish
                      </summary>
                      <div className="mt-4 space-y-3">
                        {appearanceDirty ? (
                          <p className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
                            You have unsaved appearance changes.
                          </p>
                        ) : null}

                        {appearanceError ? (
                          <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                            {appearanceError}
                          </p>
                        ) : null}

                        {appearanceSuccess ? (
                          <p className="rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
                            {appearanceSuccess}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" disabled={savingAppearance}>
                            {savingAppearance ? "Saving..." : "Save Appearance"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUndoAppearanceChange}
                            disabled={appearanceUndoHistory.length === 0 || savingAppearance}
                          >
                            Undo ({appearanceUndoHistory.length})
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRedoAppearanceChange}
                            disabled={appearanceRedoHistory.length === 0 || savingAppearance}
                          >
                            Redo ({appearanceRedoHistory.length})
                          </Button>
                        </div>
                      </div>
                    </details>
                  </form>
                </aside>
              </>
            ) : null}
          </div>
        ) : null}

        {activeAdminTab === "catalog" ? (
          <>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Manage Categories</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Add, edit, or remove product categories used in the shop and admin forms.
          </p>

          <form onSubmit={handleCreateCategory} className="mt-5 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category Name EN *</label>
              <input
                className={fieldClassName}
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                    slug: previous.slug ? previous.slug : slugify(event.target.value),
                  }))
                }
                placeholder="Benches"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category Name NL</label>
              <input
                className={fieldClassName}
                value={categoryForm.nameNl}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    nameNl: event.target.value,
                  }))
                }
                placeholder="Banken"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Slug *</label>
              <input
                className={fieldClassName}
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    slug: slugify(event.target.value),
                  }))
                }
                placeholder="benches"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description EN</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Compact and versatile seating pieces."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description NL</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={categoryForm.descriptionNl}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    descriptionNl: event.target.value,
                  }))
                }
                placeholder="Compacte en veelzijdige zitmeubels."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Hero Image URL (optional)</label>
              <input
                className={fieldClassName}
                value={categoryForm.heroImage}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    heroImage: event.target.value,
                  }))
                }
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={managingCategories}>
                  {managingCategories
                    ? "Saving..."
                    : editingCategoryId
                      ? "Save Category"
                      : "Add Category"}
                </Button>
                {editingCategoryId ? (
                  <Button type="button" variant="secondary" onClick={handleCancelCategoryEdit}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </div>
          </form>

          {categoryError ? (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{categoryError}</p>
          ) : null}

          <div className="mt-6 space-y-2">
            {loadingCategories ? (
              <p className="text-sm text-[var(--color-muted)]">Loading categories...</p>
            ) : categoryRows.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No categories yet. Add one above.</p>
            ) : (
              categoryRows.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{category.name}</p>
                    {category.name_nl ? (
                      <p className="text-xs text-[var(--color-muted)]">NL: {category.name_nl}</p>
                    ) : null}
                    <p className="text-xs text-[var(--color-muted)]">/{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => handleEditCategory(category)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleDeleteCategory(category)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            {editingProductId ? "Edit Product" : "Add Product"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {editingProductId
              ? "Update product details stored in Supabase."
              : "Create a new product directly in Supabase."}
          </p>

          {isOwner === false && (
            <p className="mt-4 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
              Owner access missing for this user. Add this user id to public.admin_users to enable create/update/delete.
            </p>
          )}

          {ownerCheckError && (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
              Could not verify owner membership: {ownerCheckError}
            </p>
          )}

          <form onSubmit={handleCreateProduct} className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Name EN *</label>
              <input
                className={fieldClassName}
                value={productForm.name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setProductForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: slugEdited ? prev.slug : slugify(nextName),
                  }));
                }}
                placeholder="Oak Dining Table"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Name NL</label>
              <input
                className={fieldClassName}
                value={productForm.nameNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    nameNl: event.target.value,
                  }))
                }
                placeholder="Eiken eettafel"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Slug *</label>
              <input
                className={fieldClassName}
                value={productForm.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setProductForm((prev) => ({
                    ...prev,
                    slug: slugify(event.target.value),
                  }));
                }}
                placeholder="oak-dining-table"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category *</label>
              <select
                className={fieldClassName}
                value={productForm.category}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                required
              >
                {categoryRows.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Base Price (USD) *</label>
              <input
                className={fieldClassName}
                type="number"
                step="0.01"
                min="0"
                value={productForm.basePrice}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    basePrice: event.target.value,
                  }))
                }
                placeholder="1499"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Subtitle EN *</label>
              <input
                className={fieldClassName}
                value={productForm.subtitle}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    subtitle: event.target.value,
                  }))
                }
                placeholder="Solid oak, hand-finished"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Subtitle NL</label>
              <input
                className={fieldClassName}
                value={productForm.subtitleNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    subtitleNl: event.target.value,
                  }))
                }
                placeholder="Massief eiken, met de hand afgewerkt"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Lead Time EN *</label>
              <input
                className={fieldClassName}
                value={productForm.leadTime}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    leadTime: event.target.value,
                  }))
                }
                placeholder="6-8 weeks"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Lead Time NL</label>
              <input
                className={fieldClassName}
                value={productForm.leadTimeNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    leadTimeNl: event.target.value,
                  }))
                }
                placeholder="6-8 weken"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description EN *</label>
              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="A handcrafted oak dining table with natural oil finish."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description NL</label>
              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.descriptionNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    descriptionNl: event.target.value,
                  }))
                }
                placeholder="Een handgemaakte eiken eettafel met natuurlijke olie-afwerking."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">
                Images (drag and drop supported)
              </label>

              <div
                className={`mt-2 rounded-2xl border-2 border-dashed p-4 transition ${
                  isDraggingImages
                    ? "border-[var(--color-wood-dark)] bg-[var(--color-neutral-100)]"
                    : "border-black/15 bg-white"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingImages(true);
                }}
                onDragLeave={() => setIsDraggingImages(false)}
                onDrop={handleImageDrop}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] hover:border-[var(--color-wood)]">
                    Select images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageInputChange}
                    />
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    Drag images here or click Select images. They upload automatically.
                  </p>
                </div>

                {isUploadingImages ? (
                  <p className="mt-3 text-xs text-[var(--color-muted)]">Uploading images...</p>
                ) : null}

                {imageUploadError ? (
                  <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700">
                    {imageUploadError}
                  </p>
                ) : null}
              </div>

              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.images}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    images: event.target.value,
                  }))
                }
                placeholder="Uploaded image URLs appear here automatically (one per line)."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Story EN (optional)</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={productForm.story}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    story: event.target.value,
                  }))
                }
                placeholder="Built by local craftsmen."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Story NL (optioneel)</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={productForm.storyNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    storyNl: event.target.value,
                  }))
                }
                placeholder="Gemaakt door lokale vakmensen."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Custom Options</label>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Create product-specific options and choices shown on this product page.
              </p>

              <div className="mt-3 space-y-3">
                {customOptionsForm.map((option) => (
                  <div key={option.formId} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.id}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "id", event.target.value)
                        }
                        placeholder="Option id (e.g. finish)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.label}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "label", event.target.value)
                        }
                        placeholder="Option label EN (e.g. Finish)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.labelNl}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "labelNl", event.target.value)
                        }
                        placeholder="Option label NL (bijv. Afwerking)"
                      />
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_220px_auto]">
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.helperText}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "helperText", event.target.value)
                        }
                        placeholder="Helper text EN (optional)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.helperTextNl}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "helperTextNl", event.target.value)
                        }
                        placeholder="Helper text NL (optioneel)"
                      />
                      <select
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.type}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "type", event.target.value)
                        }
                      >
                        <option value="dropdown">dropdown</option>
                        <option value="toggle">toggle</option>
                        <option value="swatch">swatch</option>
                      </select>
                      <Button type="button" variant="ghost" onClick={() => removeCustomOption(option.formId)}>
                        Remove option
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {option.choices.map((choice) => (
                        <div
                          key={choice.formId}
                          className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_140px_140px_64px_auto]"
                        >
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.id}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "id", event.target.value)
                            }
                            placeholder="Choice id"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.label}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "label", event.target.value)
                            }
                            placeholder="Choice label EN"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.labelNl}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "labelNl", event.target.value)
                            }
                            placeholder="Choice label NL"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.priceModifier}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "priceModifier", event.target.value)
                            }
                            placeholder="Price +/-"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.swatchHex}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "swatchHex", event.target.value)
                            }
                            placeholder="Swatch hex"
                          />
                          {option.type === "swatch" ? (
                            <input
                              type="color"
                              aria-label="Pick swatch color"
                              className="h-11 w-full cursor-pointer rounded-xl border border-black/10 bg-white p-1"
                              value={toColorInputValue(choice.swatchHex)}
                              onChange={(event) =>
                                updateCustomChoiceField(
                                  option.formId,
                                  choice.formId,
                                  "swatchHex",
                                  event.target.value,
                                )
                              }
                            />
                          ) : (
                            <div />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeCustomChoice(option.formId, choice.formId)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Button type="button" variant="secondary" onClick={() => addCustomChoice(option.formId)}>
                        Add choice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Button type="button" variant="secondary" onClick={addCustomOption}>
                  Add custom option
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">
                Default Selections
              </label>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Add your own standard option IDs below. They are auto-added for every new product.
              </p>

              <div className="mt-3 rounded-2xl border border-black/10 bg-[var(--color-neutral-100)] p-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Standard option IDs
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {standardOptionIds.map((optionId) => (
                    <span
                      key={optionId}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-[var(--color-ink)]"
                    >
                      {optionId}
                      <button
                        type="button"
                        onClick={() => removeStandardOptionId(optionId)}
                        className="text-[var(--color-muted)] transition hover:text-red-700"
                        aria-label={`Remove standard option ${optionId}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                    value={newStandardOptionId}
                    onChange={(event) => setNewStandardOptionId(event.target.value)}
                    placeholder="Add standard id (e.g. finish or leg_style)"
                  />
                  <Button type="button" variant="secondary" onClick={addStandardOptionId}>
                    Add standard id
                  </Button>
                </div>

                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Tip: spaces are converted to underscores automatically.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {standardOptionIds.map((optionId) => {
                  const exists = defaultSelectionRows.some(
                    (row) => row.optionId.trim().toLowerCase() === optionId,
                  );

                  if (exists) {
                    return null;
                  }

                  return (
                    <Button
                      key={optionId}
                      type="button"
                      variant="secondary"
                      onClick={() => addStandardOptionRow(optionId)}
                    >
                      Add {optionId}
                    </Button>
                  );
                })}

                <Button type="button" variant="ghost" onClick={restoreStandardOptionRows}>
                  Restore standard options
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {defaultSelectionRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                      value={row.optionId}
                      onChange={(event) =>
                        updateDefaultSelectionRow(row.id, "optionId", event.target.value)
                      }
                      placeholder="Option id (e.g. material)"
                    />
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                      value={row.choiceId}
                      onChange={(event) =>
                        updateDefaultSelectionRow(row.id, "choiceId", event.target.value)
                      }
                      placeholder="Default value (e.g. oak)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeDefaultSelectionRow(row.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Button type="button" variant="secondary" onClick={addDefaultSelectionRow}>
                  Add default option
                </Button>
              </div>
            </div>

            <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[var(--color-wood-dark)]"
              />
              Mark as featured
            </label>

            {createError && (
              <p className="md:col-span-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p className="md:col-span-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
                {createSuccess}
              </p>
            )}

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={creatingProduct}>
                  {creatingProduct ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}
                </Button>
                {editingProductId ? (
                  <Button type="button" variant="secondary" onClick={resetEditorState}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Products ({products.length})</h2>
            <Button variant="ghost" onClick={() => void fetchProducts()} disabled={loadingProducts}>
              {loadingProducts ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {error && <p className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg">{error}</p>}

          {products.length === 0 ? (
            <p className="mt-4 text-[var(--color-muted)]">No products found. Create one to get started.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right font-semibold text-[var(--color-ink)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-black/5 hover:bg-[var(--color-neutral-100)]">
                      <td className="px-4 py-3 text-[var(--color-ink)]">{product.name}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{product.category}</td>
                      <td className="px-4 py-3 text-[var(--color-ink)] font-medium">
                        ${product.base_price}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-wood-dark)]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Connected</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            You are authenticated with Supabase. Use the Add Product form above to create products directly from this page.
          </p>
        </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
