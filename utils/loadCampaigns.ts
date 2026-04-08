import type { Campaign } from '../types/campaign'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

export interface CampaignConfig {
  campaigns: Record<string, Campaign>
  domainToSlug: Record<string, string>
}

export function loadCampaigns(): CampaignConfig {
  const raw = readFileSync(join(process.cwd(), 'campaigns.yml'), 'utf-8')
  const parsed = yaml.load(raw) as Record<string, Omit<Campaign, 'domains'> & { domains?: string[] }>

  const campaigns: Record<string, Campaign> = {}
  const domainToSlug: Record<string, string> = {}

  for (const [slug, config] of Object.entries(parsed)) {
    campaigns[slug] = { ...config, domains: config.domains ?? [] }
    for (const domain of config.domains ?? []) {
      domainToSlug[domain] = slug
    }
  }

  return { campaigns, domainToSlug }
}
