export type Language = "es" | "en";

/**
 * Detecta el idioma del usuario basado en:
 * 1. Query param (?lang=en)
 * 2. localStorage
 * 3. Default: es
 */
export function detectLanguage(): Language {
  // En servidor, siempre retornamos 'es' por defecto
  if (typeof window === "undefined") {
    return "es";
  }

  // En cliente, verificar localStorage
  const stored = localStorage.getItem("preferredLang") as Language | null;
  if (stored === "es" || stored === "en") {
    return stored;
  }

  return "es";
}

/**
 * Cambia el idioma y recarga la página
 */
export function changeLanguage(lang: Language) {
  localStorage.setItem("preferredLang", lang);

  // Obtener URL actual
  const url = new URL(window.location.href);

  // Actualizar query param
  url.searchParams.set("lang", lang);

  // Redirigir
  window.location.href = url.toString();
}
