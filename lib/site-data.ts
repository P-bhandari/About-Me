import { projectCatalog } from './project-catalog';
export type Profile = {
  id: number; name: string; tagline: string; shortBio: string; longBio: string;
  location: string; email: string; phone: string | null; githubUrl: string;
  scholarUrl: string; linkedinUrl: string | null; profileImageKey: string | null; updatedAt: string;
};
export type Project = { id: number; title: string; summary: string; tags: string; repoUrl: string | null; liveUrl: string | null; imageKey: string | null; featured: boolean; published: boolean; archived: boolean; sortOrder: number };
export type Publication = { id: number; title: string; authors: string; venue: string; year: number; summary: string; url: string; imageKey: string | null; sortOrder: number };
export type Place = { id: number; city: string; country: string; latitude: number; longitude: number; year: number | null; note: string | null; sortOrder: number };
export type Exercise = 'bench-press' | 'back-squat' | 'overhead-press' | 'push-ups';
export type LiftEntry = { id: number; date: string; exercise: Exercise; weightLb: number | null; sets: number; reps: number; notes: string | null; createdAt: string };
export type SiteData = { profile: Profile; projects: Project[]; publications: Publication[]; places: Place[]; lifts: LiftEntry[] };

export const exerciseLabels: Record<Exercise, string> = {
  'bench-press': 'Bench press', 'back-squat': 'Back squat',
  'overhead-press': 'Overhead press', 'push-ups': 'Push-ups',
};

export const fallbackProfile: Profile = {
  id: 1, name: 'Piyush Bhandari', tagline: 'Product, AI & Technology Leader',
  shortBio: 'Project Leader at BCG working on getting AI systems into production inside large organizations. Wharton MBA, former Samsung product manager and engineer, and lifelong builder.',
  longBio: 'I work at the intersection of enterprise AI, product strategy, and technology transformation. At BCG, I have led GenAI deployments, developer-productivity programs, and go-to-market operating models.\n\nPrior to consulting, I built products and platforms at Samsung—from AI-powered television discovery to cloud governance across Korea, China, and India. My foundation is engineering, and I still build the tools I use.',
  location: 'Williamsburg, NYC (open to relocation)', email: 'piyush1995bhandari@gmail.com', phone: '267-746-6725',
  githubUrl: 'https://github.com/P-bhandari', scholarUrl: 'https://scholar.google.com/citations?user=8VfF1kEAAAAJ&hl=en',
  linkedinUrl: 'https://www.linkedin.com/in/piyush-bhandari95/', profileImageKey: null, updatedAt: '2026-08-11T00:00:00.000Z',
};

export const fallbackProjects: Project[] = projectCatalog;

export const fallbackPublications: Publication[] = [
  { id: 1, title: 'A Novel Krawtchouk Moment Zonal Feature Descriptor for User-independent Static Hand Gesture Recognition', authors: 'Subhamoy Chatterjee, Piyush Bhandari, Maheshkumar H. Kolekar', venue: 'IEEE TENCON', year: 2016, summary: 'A computer-vision method for recognizing static hand gestures across users.', url: 'https://ieeexplore.ieee.org/document/7848027', imageKey: null, sortOrder: 1 },
  { id: 2, title: 'Feature Extraction and Segmentation Techniques in a Static Hand Gesture Recognition System', authors: 'Subhamoy Chatterjee, Piyush Bhandari, Mahesh Kumar Kolekar', venue: 'Wiley · Hybrid Intelligence for Image Analysis and Understanding', year: 2017, summary: 'A book chapter on segmentation, contour features, feature weighting, and recognition of similar hand shapes.', url: 'https://doi.org/10.1002/9781119242963.ch4', imageKey: null, sortOrder: 2 },
  { id: 3, title: 'Analysis for Self-taught and Transfer Learning Based Approaches for Emotion Recognition', authors: 'Piyush Bhandari, Rakesh Kumar Bijarniya, Subhamoy Chatterjee, Maheshkumar H. Kolekar', venue: 'IEEE SPIN', year: 2018, summary: 'An evaluation of learned representations and transfer-learning approaches for facial emotion recognition.', url: 'https://ieeexplore.ieee.org/document/8474199', imageKey: null, sortOrder: 3 },
  { id: 4, title: 'Efficient Sparse to Dense Stereo Matching Technique', authors: 'Piyush Bhandari, Meiqing Wu, Nazia Aslam, Siew-Kei Lam, Maheshkumar H. Kolekar', venue: 'CVIP · Springer', year: 2018, summary: 'An efficient approach for converting sparse correspondences into dense stereo depth estimates.', url: 'https://doi.org/10.1007/978-981-32-9088-4_14', imageKey: null, sortOrder: 4 },
];

export const fallbackData: SiteData = { profile: fallbackProfile, projects: fallbackProjects, publications: fallbackPublications, places: [], lifts: [] };

export type PublicProfile = Pick<Profile, 'name' | 'tagline' | 'shortBio' | 'longBio' | 'email' | 'githubUrl' | 'scholarUrl' | 'linkedinUrl'>;
export type PublicSiteData = { profile: PublicProfile; projects: Project[]; publications: Publication[] };
export function toPublicProfile(profile: Profile): PublicProfile {
  const { name, tagline, shortBio, longBio, email, githubUrl, scholarUrl, linkedinUrl } = profile;
  return { name, tagline, shortBio, longBio, email, githubUrl, scholarUrl, linkedinUrl };
}
