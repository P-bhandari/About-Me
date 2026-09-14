import { PortfolioExperience } from '@/components/portfolio-experience';
import { loadPublicSiteDataSafe } from '@/lib/database';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await loadPublicSiteDataSafe();
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Person', name: data.profile.name,
    jobTitle: data.profile.tagline, email: `mailto:${data.profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY' },
    sameAs: [data.profile.githubUrl, data.profile.scholarUrl, data.profile.linkedinUrl].filter(Boolean),
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'The Wharton School, University of Pennsylvania' },
      { '@type': 'CollegeOrUniversity', name: 'Indian Institute of Technology Patna' },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} /><PortfolioExperience data={data} /></>;
}
