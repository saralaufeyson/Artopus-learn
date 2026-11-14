import { classInputSchema, siteSettingsInputSchema } from '@artopus/shared';
import { loadEnv } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { SiteSettings } from '../modules/settings/settings.model.js';
import { ClassOffering } from '../modules/classes/class.model.js';
import { initializeSiteSettings } from '../modules/settings/settings.service.js';
import { sanitizeRichText } from '../lib/sanitize-rich-text.js';
// Business facts and the featured video supplied by the owner on 2026-11-14.
// This is an explicit content update, never an automatic startup/demo seed.
const ownership = 'Artopus India is owned and operated by Sasirekha Creations, a proprietorship registered in Bengaluru, Karnataka.';
const about = '<p>Our drawing-class journey began in <strong>December 2025</strong>. We teach children and teens both <strong>online and in person</strong>, through two age groups: <strong>Buds (ages 5–12)</strong> and <strong>Blossoms (ages 12–18)</strong>.</p>' +
  '<p>Our growing community includes <strong>more than 10 students learning offline</strong> and <strong>one student learning online</strong>. We are always striving to learn, improve, and teach, with creativity at the heart of our journey.</p>' +
  '<p>' + ownership + '</p>';
const offerings = [
  { title: 'Buds', slug: 'buds-drawing-classes', ageGroup: '5–12 years', displayOrder: 0, description: '<p>Buds is our drawing-class group for children aged 5–12. Classes are available both online and in person.</p><p>Join us as we keep learning, improving, and creating together. Contact us for current schedules, fees, and registration details.</p>' },
  { title: 'Blossoms', slug: 'blossoms-drawing-classes', ageGroup: '12–18 years', displayOrder: 1, description: '<p>Blossoms is our drawing-class group for ages 12–18. Classes are available both online and in person.</p><p>Keep exploring your creativity with Artopus India. Contact us for current schedules, fees, and registration details.</p>' },
];
async function main() {
  await connectDatabase(loadEnv().MONGODB_URI);
  try {
    await initializeSiteSettings();
    await Promise.all([ClassOffering.init(), SiteSettings.init()]);
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    if (!settings) throw new Error('Site settings unavailable');
    const ids: string[] = [];
    for (const offering of offerings) {
      const input = classInputSchema.parse({ ...offering, classMode: 'hybrid', status: 'active', featured: true, isDemo: false });
      const { displayOrder, ...copy } = offering;
      const record = await ClassOffering.findOneAndUpdate({ slug: input.slug }, {
        $set: { ...copy, description: sanitizeRichText(input.description), classMode: input.classMode, status: input.status, featured: true, isDemo: false, seoTitle: input.title + ' drawing classes | Artopus India', seoDescription: 'Online and in-person drawing classes for ages ' + input.ageGroup + ' at Artopus India. Ask about current schedules, fees, and registration.' },
        $setOnInsert: { displayOrder, learningObjectives: [], mediums: [], faqs: [{ question: 'Can we join online or in person?', answer: 'Yes. Both online and offline classes are available. Contact us to discuss the current options.' }] },
      }, { upsert: true, new: true, runValidators: true });
      ids.push(record._id.toHexString());
    }
    const featuredClasses = [...new Set([...ids, ...(settings.featuredContent?.classes ?? []).map(String)])];
    if (featuredClasses.length > 12) throw new Error('Choose featured classes in Site settings before applying this content.');
    const patch: Record<string, unknown> = {
      'branding.ownershipStatement': ownership,
      'heroSection.description': 'Online and offline drawing classes for kids aged 5–18. From Buds (5–12) to Blossoms (12–18), let’s keep learning, improving, and creating together.',
      'heroSection.primaryCta': { label: 'Explore drawing classes', href: '/classes' },
      'heroSection.secondaryCta': { label: 'About Artopus', href: '/about' },
      'aboutSection.heading': 'Learning, growing, and creating together.',
      'aboutSection.content': sanitizeRichText(about),
      'featuredContent.classes': featuredClasses,
      featuredVideo: { title: 'Creativity, one drawing at a time.', description: 'Take a glimpse into the creative world of Artopus India with our featured YouTube Short.', url: 'https://www.youtube.com/shorts/I-JhZjzQMLY' },
      benefits: [
        { title: 'Two stages, room to grow', description: 'Buds welcomes ages 5–12, and Blossoms welcomes ages 12–18.' },
        { title: 'Online or in person', description: 'Join our drawing classes online or offline, in a way that works for your family.' },
        { title: 'Always learning', description: 'We strive to keep learning, improving, and teaching better.' },
        { title: 'Growing together', description: 'Our drawing-class journey began in December 2025, and our community continues to grow.' },
      ],
      finalCta: { heading: 'Let’s learn and create together.', description: 'Explore Buds for ages 5–12 and Blossoms for ages 12–18, with classes available online and in person.', action: { label: 'Ask about a class', href: '/contact' } },
      'seoDefaults.description': 'Online and offline drawing classes for kids aged 5–18. Explore Buds and Blossoms with Artopus India, learning and teaching since December 2025.',
    };
    const knownLinks = { instagram: 'https://www.instagram.com/artopusindia/', drawingClassesInstagram: 'https://www.instagram.com/artopusindia_drawingclasses/', youtube: 'https://www.youtube.com/@ArtopusIndia', shop: 'https://www.artopusindia.com/' };
    for (const [key, url] of Object.entries(knownLinks)) if (!settings.socialLinks?.[key as keyof typeof knownLinks]) patch['socialLinks.' + key] = url;
    if (!settings.contactDetails?.email) patch['contactDetails.email'] = 'contact@artopusindia.com';
    // Validate the combined settings before the targeted update; preserve unrelated fields and images.
    const combined = { ...settings, branding: { ...settings.branding, ownershipStatement: ownership }, featuredVideo: patch.featuredVideo };
    siteSettingsInputSchema.pick({ branding: true, featuredVideo: true }).parse(combined);
    await SiteSettings.updateOne({ key: 'site' }, { $set: patch }, { runValidators: true });
    console.info('Updated owner-supplied About content, Buds/Blossoms classes, ownership details, and featured YouTube video.');
  } finally { await disconnectDatabase(); }
}
main().catch(() => { console.error('Business content update failed. Check database configuration and content validation.'); process.exitCode = 1; });
