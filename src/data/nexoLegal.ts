export type NexoLanguage = "es" | "en";
export type NexoDocumentKey = "privacy" | "terms" | "deletion";

export type NexoBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "link"; before: string; label: string; href: string; after?: string };

export interface NexoSection {
  title: string;
  blocks: NexoBlock[];
}

export interface NexoDocument {
  title: string;
  description: string;
  sections: NexoSection[];
}

export const paragraph = (text: string): NexoBlock => ({ kind: "paragraph", text });
export const list = (items: string[], ordered = false): NexoBlock => ({ kind: "list", ordered, items });
export const link = (before: string, label: string, href: string, after = ""): NexoBlock => ({ kind: "link", before, label, href, after });

export const nexoRoutes: Record<NexoLanguage, Record<NexoDocumentKey, { href: string; label: string }>> = {
  es: {
    privacy: { href: "/nexo/privacidad/", label: "Política de privacidad" },
    terms: { href: "/nexo/terminos/", label: "Términos y condiciones" },
    deletion: { href: "/nexo/eliminacion-de-datos/", label: "Eliminación de datos" },
  },
  en: {
    privacy: { href: "/en/nexo/privacy/", label: "Privacy policy" },
    terms: { href: "/en/nexo/terms/", label: "Terms and conditions" },
    deletion: { href: "/en/nexo/data-deletion/", label: "Data deletion" },
  },
};

export const nexoContact = "idiomasboston@gmail.com";
export const nexoEmailHref = (subject: string) => `mailto:${nexoContact}?subject=${encodeURIComponent(subject)}`;
