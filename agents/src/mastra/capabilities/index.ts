import { marcosKnowledgeManifest } from '../knowledge/marcos';

export type MarcosCapability = {
  description: string;
  id: string;
  sourceDoc: string;
  title: string;
};

const capabilityEntries = marcosKnowledgeManifest.filter(
  entry => entry.kind === 'capability',
);

export const marcosCapabilityRegistry: Record<string, MarcosCapability> =
  Object.fromEntries(
    capabilityEntries.map(entry => [
      entry.id,
      {
        description: `Capability materializada a partir de ${entry.id}.`,
        id: entry.id,
        sourceDoc: entry.path,
        title: toTitle(entry.id),
      },
    ]),
  ) as Record<string, MarcosCapability>;

function toTitle(id: string): string {
  return id
    .replace(/^\d+-/, '')
    .replace(/-capability(-\d+)?$/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
