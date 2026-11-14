import mongoose from 'mongoose';
import { loadEnv } from '../config/env.js';
import { connectDatabase } from '../config/database.js';
import { BlogPost } from '../modules/blogs/blog.model.js';
import { Event } from '../modules/events/event.model.js';
import { ClassOffering } from '../modules/classes/class.model.js';
import { SiteSettings } from '../modules/settings/settings.model.js';

async function seed() {
  const env = loadEnv();
  if (env.NODE_ENV === 'production') throw new Error('Demo seeding is disabled in production.');
  await connectDatabase(env.MONGODB_URI);
  const now = Date.now();
  const day = 86_400_000;
  const classes = [];
  for (const [index, entry] of [
    ['Little mark makers', 'A playful introduction to lines, shapes and colour.', '6-9 years', 'online', ['Confident lines and shapes', 'Simple colour combinations', 'Observation through drawing']],
    ['The sketchbook studio', 'Explore observation, shading and your own visual ideas.', '10-14 years', 'offline', ['Light and shade', 'Form and proportion', 'Building a sketchbook habit']],
    ['Start with a pencil', 'An approachable starting point for a new creative practice.', 'Beginners', 'online', ['Drawing everyday objects', 'Pencil textures', 'Simple compositions']],
  ].entries()) {
    const [title, description, ageGroup, classMode, learningObjectives] = entry;
    const slug = 'demo-' + String(title).toLowerCase().replaceAll(' ', '-');
    classes.push(await ClassOffering.findOneAndUpdate({ slug }, { $setOnInsert: {
      title, slug, description, ageGroup, classMode, learningObjectives, status: 'active', displayOrder: index,
      mediums: ['Pencil', 'Colour pencils', 'Watercolour'], isDemo: true,
      schedule: 'Sample schedule - actual timings will be announced.', duration: 'Sample format: weekly sessions',
      faqs: [{ question: 'Is this a confirmed class?', answer: 'This is demonstration content. Contact Artopus for current programs, fees and schedules.' }],
    } }, { upsert: true, new: true }));
  }
  const events = [];
  for (const [index, entry] of [
    ['Colour outside the lines', 'workshop', 12, 13, 'A sample workshop exploring colour, shape and playful composition.'],
    ['The everyday sketch challenge', 'challenge', -2, 3, 'A sample creative challenge about noticing the small things around us.'],
    ['A world of paper and paint', 'exhibition', -25, -24, 'A sample past-event page showing how creative highlights can be shared.'],
  ].entries()) {
    const [title, eventType, startOffset, endOffset, description] = entry;
    const slug = 'demo-' + String(title).toLowerCase().replaceAll(' ', '-');
    events.push(await Event.findOneAndUpdate({ slug }, { $setOnInsert: {
      title, slug, eventType, description, startDate: new Date(now + Number(startOffset) * day),
      endDate: new Date(now + Number(endOffset) * day), locationType: 'online',
      location: 'Demo event - no confirmed venue', status: 'published', isDemo: true,
      eligibility: 'Sample audience: beginner artists and curious learners.',
      rules: '<p>This is a demonstration event, not a registration announcement.</p>',
      ...(index === 2 ? { results: '<p>This sample page demonstrates where verified event highlights and results will appear.</p>' } : {}),
    } }, { upsert: true, new: true }));
  }
  const articles = [
    ['A sketchbook is a place to begin', 'Art Education', 'Start small, notice more, and let your sketchbook become a place to explore.'],
    ['Five ways to explore pencil marks', 'Art Tips and Tutorials', 'Discover how pressure, direction and repetition change a simple pencil line.'],
    ['Making room for creative practice', 'Drawing Classes', 'A few practical ideas for making art part of an ordinary week.'],
    ['Discover a world of colour', 'Art Tips and Tutorials', 'An introduction to mixing colours, noticing contrast and building a palette.'],
    ['Drawing the things around you', 'Art Education', 'Everyday objects can be a starting point for observation and imagination.'],
    ['Your first watercolour page', 'Art Tips and Tutorials', 'Explore water, pigment and paper with a few simple experiments.'],
    ['A new space for creative stories', 'Announcements', 'A demonstration of how studio news and learning resources will appear here.'],
    ['Let a simple shape lead the way', 'Art Tips and Tutorials', 'Turn a circle, a line or a square into an open-ended drawing exercise.'],
  ];
  for (const [index, [title, category, excerpt]] of articles.entries()) {
    const slug = 'demo-' + title!.toLowerCase().replaceAll(' ', '-');
    const content = '<p>' + excerpt + '</p><h2>Begin with what you have</h2><p>A pencil and a sheet of paper are enough to start. Choose something nearby, look at its outline, and spend a few minutes exploring its shape.</p><h2>Try a small experiment</h2><ul><li>Make light marks, then try a little more pressure.</li><li>Notice the spaces between shapes.</li><li>Repeat an idea with a different colour or texture.</li></ul><blockquote>Leave room on the page for curiosity.</blockquote><h2>Keep exploring</h2><p>A creative practice can grow through small, repeatable exercises. There is no need for every page to be a finished artwork. Visit our <a href="/classes">drawing classes page</a> to explore learning formats.</p><p><em>Demo article: this original sample content illustrates the blog experience and is not a report of an Artopus event or student achievement.</em></p>';
    await BlogPost.updateOne({ slug }, { $setOnInsert: { title, slug, category, excerpt, content, author: 'Artopus Learn demo', status: 'published', publishedAt: new Date(now - index * day), isDemo: true, featured: index === 0 } }, { upsert: true });
  }
  await SiteSettings.updateOne({ key: 'site' }, { $setOnInsert: {
    key: 'site', demoMode: true,
    branding: { name: 'Artopus Learn', tagline: 'Create. Explore. Learn. Shop. Grow.' },
    heroSection: {
      heading: 'Every Artist Starts Somewhere.',
      description: 'Explore creativity through drawing classes, art workshops, competitions, and inspiring artistic experiences at Artopus India.',
      primaryCta: { label: 'Join Drawing Classes', href: '/classes' },
      secondaryCta: { label: 'Explore Our Events', href: '/events' },
    },
    aboutSection: { heading: 'A little curiosity. A world of possibilities.', content: '<p>Artopus India brings drawing classes, workshops, competitions and creative experiences together in one place.</p><p>Artopus Learn is a space to explore art, discover learning opportunities and follow our creative journey.</p>' },
    benefits: [
      { title: 'Learn the foundations', description: 'Explore drawing and painting through structured creative learning.' },
      { title: 'Follow your curiosity', description: 'Discover new themes, art activities and creative worksheets.' },
      { title: 'Make room to create', description: 'Build a creative practice, one thoughtful mark at a time.' },
      { title: 'Be part of the journey', description: 'Discover workshops, challenges and opportunities to participate.' },
    ],
    featuredContent: { classes: classes.map(item => item!._id), events: events.slice(0, 2).map(item => item!._id), gallery: [] },
    finalCta: { heading: 'Your next creative chapter starts here.', description: 'Explore a class, find an event, or simply start with a blank page.', action: { label: 'Find your starting point', href: '/classes' } },
    registrationLinks: {},
    socialLinks: { instagram: 'https://www.instagram.com/artopusindia/', drawingClassesInstagram: 'https://www.instagram.com/artopusindia_drawingclasses/', youtube: 'https://www.youtube.com/@ArtopusIndia', shop: 'https://www.artopusindia.com/' },
    contactDetails: {},
    seoDefaults: { title: 'Artopus Learn | Drawing classes and creative experiences', description: 'Explore drawing classes, art workshops, creative events and art education with Artopus India.', siteUrl: 'https://learn.artopusindia.com' },
  } }, { upsert: true });
  console.info('Demo content is ready. Existing records were preserved; demo offerings are explicitly labeled and have no registration URLs.');
}
seed().catch(() => { console.error('Demo seed failed. Check MongoDB availability and local configuration.'); process.exitCode = 1; }).finally(() => mongoose.disconnect());
