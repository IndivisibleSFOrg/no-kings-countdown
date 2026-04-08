// Augment Nuxt's generated runtimeConfig types for fields that Nuxt cannot
// fully infer (e.g. arrays of objects lose their item shape).
declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    appMajorMinor: string
    releaseVersionIndex: { version: string, date: string }[]
    campaigns: Record<string, import('./types/campaign').Campaign>
    domainToSlug: Record<string, string>
  }
}

export {}
