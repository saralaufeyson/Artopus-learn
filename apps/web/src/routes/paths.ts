export const paths = {
  home: '/', classes: '/classes', events: '/events', blog: '/blog',
  about: '/about', contact: '/contact', admin: '/admin', login: '/admin/login',
} as const;
export const publicPages = [
  { path: paths.home, title: 'Home' },
  { path: paths.classes, title: 'Drawing classes' },
  { path: paths.events, title: 'Events' },
  { path: paths.blog, title: 'Blog' },
  { path: paths.about, title: 'About' },
  { path: paths.contact, title: 'Contact' },
] as const;
