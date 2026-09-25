// Seed data for the Sitescape prototype. Sites u2+ are real personal websites
// (from the shared "product portfolio examples" sheet); highlights link out to them.
const U = (id, name, site, roles, bio, tint) => ({ id, name, site_url: 'https://' + site, domain: site, role_tags: roles, bio, tint, created_at: '2026-0' + (1 + (id.length % 8)) + '-12' });
// [id, handle, domain, roles, bio, tint, url, section, title, note, tech, ratio, kind, likes, views, clicks, day]
const S = [
  ['u2', 'tkkong', 'tkkong.com', ['PM'], 'Product manager. Twitter is the CTA.', 'b', 'https://tkkong.com/', 'Project', 'Projects, with Twitter as the call to action', 'Skipped the contact form entirely — every project ends in a tweet thread. Curious if that reads as lazy or honest.', ['Webflow'], 1.3, 'gallery', 214, 3120, 890, 21],
  ['u3', 'productlife.to', 'productlife.to', ['PM', 'Founder'], 'Product Life — a Substack about the craft of product.', 'a', 'https://productlife.to/', 'Blog', 'Product Life, the newsletter', 'The whole site is the newsletter archive. Start with the most-read issue, pinned at the top.', ['Substack'], 0.8, 'article', 401, 6200, 1980, 20],
  ['u4', 'bensol', 'bensol.me', ['SWE', 'Other'], 'Engineer by day. Side projects include rap.', 'c', 'https://bensol.me/', 'Playground', 'Side projects — including the rap', 'Yes, there is a rap section. It sits next to the code projects on purpose.', ['Next.js'], 1.2, 'grid', 389, 4700, 1800, 19],
  ['u5', 'ovetta-sampson', 'ovetta-sampson.com', ['Designer', 'Researcher'], 'Showing the UX process, not just the outcome.', 'a', 'http://www.ovetta-sampson.com/', 'Portfolio', 'Case studies that show the process', 'Every case study has a “messy middle” section. That is the part I want people to read.', ['Squarespace'], 0.75, 'gallery', 276, 3900, 1210, 18],
  ['u6', 'whoisjuan', 'whoisjuan.me', ['Designer'], 'Designer. Lots of projects, arranged as a gallery.', 'b', 'https://whoisjuan.me/', 'Portfolio', 'The project gallery', 'Forty-plus projects on one page. The grid is the portfolio — click anything.', ['Framer'], 1, 'grid', 455, 6100, 1900, 17],
  ['u7', 'hamzalouar', 'hamzalouar.me', ['Data'], 'Data projects, hosted on GitHub Pages.', 'c', 'https://hamzalouar.me/', 'Project', 'Data projects, straight from GitHub', 'Each project links to the notebook and the repo. No write-ups yet — is that a problem?', ['GitHub Pages', 'Python'], 1.4, 'chart', 188, 2600, 720, 16],
  ['u8', 'florentisidore', 'florentisidore.com', ['PM'], 'Blog, projects and a newsletter — all in Notion.', 'a', 'https://florentisidore.com/', 'Blog', 'A whole personal site built in Notion', 'Blog, projects, newsletter — one Notion workspace with a custom domain. Took an afternoon.', ['Notion', 'Super'], 0.85, 'article', 320, 4500, 1500, 15],
  ['u9', 'alexmeub', 'alexmeub.com', ['SWE'], 'Software engineer. Hardware hobby projects.', 'b', 'https://alexmeub.com/about/', 'About', 'About — with the hardware projects', 'The about page doubles as a hardware log. The e-paper display build is the fun one.', ['Jekyll'], 0.9, 'about', 233, 3200, 990, 14],
  ['u10', 'waynestrydom', 'waynestrydom.com', ['PM', 'Founder'], 'Numbers up front and a showreel.', 'c', 'https://waynestrydom.com/', 'Portfolio', 'Numbers first, then the showreel', 'Impact numbers above the fold, a 90-second reel below. Landing-page logic applied to a person.', ['Webflow'], 1.5, 'app', 298, 4400, 1600, 13],
  ['u11', 'raquelmsmith', 'raquelmsmith.com', ['PM'], 'Product manager. Keeps a public bookshelf.', 'a', 'https://raquelmsmith.com/about-me/', 'About', 'About me, plus the bookshelf', 'The bookshelf at the bottom gets more email than anything else on the site.', ['WordPress'], 0.8, 'about', 143, 2200, 700, 12],
  ['u12', 'stephwang', 'stephwang.github.io', ['Student', 'SWE'], 'CS student. Everything lives on GitHub.', 'b', 'https://stephwang.github.io/', 'Project', 'Projects on a GitHub Pages site', 'Plain, fast, free. Every card links to a repo with a README that actually explains things.', ['GitHub Pages', 'Jekyll'], 1.3, 'code', 178, 2800, 800, 11],
  ['u13', 'samdickie', 'samdickie.me', ['Designer', 'PM'], 'Designer turned PM. Ships a newsletter too.', 'c', 'https://www.samdickie.me/', 'Portfolio', 'Portfolio with a newsletter sign-up', 'Visual portfolio up top, newsletter at the bottom. Trying to make the two feel like one site.', ['Framer'], 0.78, 'gallery', 356, 5000, 1700, 10],
  ['u14', 'herbig', 'herbig.co', ['Founder'], 'Product coach. Writes a weekly letter.', 'a', 'https://herbig.co/', 'About', 'Coaching page, written like a letter', 'No “services” grid — one long letter about how I work and who it is for.', ['Ghost'], 0.85, 'article', 201, 3100, 1300, 9],
  ['u15', 'abhishekbhardwaj', 'abhishekbhardwaj.me', ['Data', 'SWE'], 'Numbers, GitHub and testimonials on one page.', 'b', 'https://abhishekbhardwaj.me/', 'Resume', 'A resume page with live GitHub stats', 'Contribution graph, star counts and a couple of testimonials, all on the resume page.', ['Hugo', 'GitHub API'], 0.72, 'resume', 141, 2300, 690, 8],
  ['u16', 'jomiyoko', 'jomiyoko.blog', ['Other', 'PM'], 'Writes about product and life on a .blog domain.', 'c', 'https://jomiyoko.blog/about/', 'About', 'An about page with a project structure I like', 'Projects grouped by the question they answered, not by year. Stole the idea from a friend.', ['WordPress'], 0.9, 'about', 94, 1500, 420, 7],
  ['u17', 'stephendangerfield', 'stephendangerfield.com', ['SWE', 'Founder'], 'Builds odd personal projects. Site opens with a chat.', 'a', 'https://stephendangerfield.com/', 'Playground', 'The site that talks to you first', 'It opens as a chat window. Original idea or gimmick — genuinely want to know.', ['React', 'Vercel'], 1.35, 'app', 598, 8800, 3600, 6],
  ['u18', 'borja.hormigos', 'borja.hormigos.com', ['PM'], 'Clear CV, a few numbers.', 'b', 'https://borja.hormigos.com/', 'Resume', 'A CV with numbers and nothing else', 'One page. Each role has one metric. Deliberately boring.', ['Carrd'], 0.74, 'resume', 116, 1700, 480, 5],
  ['u19', 'nathanko', 'nathanko.com', ['Student'], 'Personal projects while studying.', 'c', 'https://nathanko.com/', 'Project', 'Personal projects, one per semester', 'A project per semester. The early ones are rough and I left them up.', ['Astro'], 1.25, 'grid', 267, 3300, 1250, 4],
  ['u20', 'omareletr', 'omareletr.com', ['Researcher', 'Other'], 'Reading list, YouTube, and an impossible list.', 'a', 'https://www.omareletr.com/', 'About', 'The impossible list', 'A public list of things I might never do. People check in on it, which is the point.', ['Squarespace'], 0.88, 'about', 512, 7700, 2900, 3],
  ['u21', 'daliashea', 'daliashea.com', ['Designer'], 'Design tutorials on YouTube, notes here.', 'b', 'https://daliashea.com/', 'Blog', 'Tutorial notes for the YouTube videos', 'Each video gets a written companion. The written version is usually better.', ['Squarespace'], 0.8, 'article', 645, 10100, 3900, 22],
  ['u22', 'liminsun', 'liminsun.com', ['Other'], 'Travel videos and the writing around them.', 'c', 'https://liminsun.com/', 'Blog', 'Travel writing behind the videos', 'The blog is where the videos get context. Start with the Kyrgyzstan entry.', ['Squarespace'], 1.4, 'gallery', 318, 4300, 1400, 21],
  ['u23', 'sherlaine', 'sherlaine.com', ['Designer'], 'Portfolio that opens with a reel.', 'a', 'https://sherlaine.com/', 'Portfolio', 'The portfolio reel', 'A 40-second reel before any text. Skip it if you are on mobile data.', ['Webflow'], 1.6, 'app', 486, 6900, 2400, 20],
  ['u24', 'joshneuman', 'joshneuman.me', ['PM'], 'Product manager with an unusually honest skills block.', 'b', 'https://www.joshneuman.me/', 'Resume', 'A skills block that admits weaknesses', 'The skills section lists what I am bad at too. Feedback welcome on whether that is brave or dumb.', ['Squarespace'], 0.76, 'resume', 377, 5200, 1900, 19],
  ['u25', 'robski', 'robski.me', ['Designer', 'SWE'], 'Minimalist site, mostly whitespace.', 'c', 'https://robski.me/', 'About', 'Minimal about page', 'Two paragraphs and a link. Could not cut any more.', ['Vanilla HTML'], 0.95, 'about', 259, 3800, 1300, 18],
  ['u26', 'adrianhiotis', 'adrianhiotis.com', ['PM', 'Designer'], 'Detailed process write-ups for each project.', 'a', 'https://www.adrianhiotis.com/', 'Project', 'One project, documented end to end', 'The longest case study on the site — discovery to launch, with the dead ends kept in.', ['Webflow'], 0.8, 'article', 411, 5600, 2100, 17],
  ['u27', 'cyrusstoller', 'cyrusstoller.com', ['SWE'], 'Developer. Ships small tools.', 'b', 'https://www.cyrusstoller.com/about.html', 'About', 'About, with the dev projects', 'Plain HTML about page. The projects list is hand-maintained and I like it that way.', ['Vanilla HTML'], 0.9, 'about', 132, 1900, 560, 16],
  ['u28', 'tuanmon', 'tuanmon.com', ['Designer', 'Founder'], 'Design and productivity.', 'c', 'https://tuanmon.com/', 'Portfolio', 'A portfolio built like a productivity app', 'Sidebar, keyboard shortcuts, the works. Press ? on the page.', ['Next.js', 'Tailwind'], 1.5, 'app', 734, 12400, 4100, 15],
  ['u29', 'connorhenkel', 'connorhenkel.com', ['Founder', 'SWE'], 'Builder. Ships things.', 'a', 'https://connorhenkel.com/', 'Project', 'Everything I have shipped', 'A running list of launches with what happened to each one. Several are dead. That is fine.', ['Astro'], 1.2, 'table', 342, 5100, 1720, 14],
  ['u30', 'brittbarak', 'brittbarak.com', ['SWE', 'Other'], 'Engineer and speaker. Writes long.', 'b', 'https://www.brittbarak.com/', 'Blog', 'The essays', 'Long-form technical essays with real illustrations. The one on state machines is the entry point.', ['Gatsby'], 0.8, 'article', 870, 14200, 5200, 13],
  ['u31', 'scottwittrock', 'scottwittrock.me', ['Designer', 'SWE'], 'GitHub and Dribbble, side by side.', 'c', 'https://scottwittrock.me/', 'Playground', 'Dribbble shots next to GitHub repos', 'Design shots and code repos in one grid. The overlap is the interesting part.', ['Eleventy'], 1.1, 'grid', 289, 4100, 1300, 12],
];
export const users = [
  U('u1', 'Mara Lindqvist', 'mara.design', ['Designer'], 'Product designer in Malmö. I write about type, tools and slow interfaces.', 'a'),
  ...S.map(r => U(r[0], r[1], r[2], r[3], r[4], r[5])),
];
const H = (id, u, tag, url, title, note, tech, ratio, kind, likes, views, clicks, day) => ({
  id, user_id: u, section_tag: tag, url, title, note, tech_stack: tech,
  cover: { ratio, kind }, like_count: likes, view_count: views, outbound_click_count: clicks, created_at: '2026-09-' + String(day).padStart(2, '0'),
});
export const highlights = [
  H('h1', 'u1', 'Blog', 'https://mara.design/writing/slow-interfaces', 'Slow interfaces are a feature', 'The essay I keep pointing people to. It took four rewrites and I still like the ending.', ['Astro', 'MDX'], 0.8, 'article', 214, 3120, 890, 21),
  H('h2', 'u1', 'Portfolio', 'https://mara.design/work/ledger', 'Ledger — a calmer banking app', 'Case study for a year of work. Scroll to the type-scale section, that is the part I am proud of.', ['Figma'], 1.25, 'gallery', 168, 2410, 610, 14),
  ...S.map((r, i) => H('h' + (i + 3), r[0], r[7], r[6], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15], r[16])),
];

const bodies = [
  'This is exactly the kind of page I wish more people shared.',
  'Bookmarked. The typography on this is doing a lot of quiet work.',
  'Read the whole thing on the train. Thank you for writing it.',
  'How long did this take you? Genuinely curious about the process.',
  'The middle section changed how I think about this.',
  'Small note: the anchor links skip the headings on Safari.',
  'Sent this to my whole team.',
  'Would love a follow-up on the parts you cut.',
];
const replies = ['About three months of evenings.', 'Thank you — that means a lot.', 'Good catch, fixing it tonight.', 'Yes! Draft is half done.'];
export const comments = [];
let cid = 1;
highlights.forEach((h, i) => {
  const n = (i % 3) + 1;
  for (let k = 0; k < n; k++) {
    const author = users[(i * 7 + k * 3 + 5) % users.length];
    if (author.id === h.user_id) continue;
    const c = { id: 'c' + cid++, highlight_id: h.id, author_id: author.id, body: bodies[(i + k) % bodies.length], parent_id: null, pinned: k === 0 && i % 5 === 0, created_at: '2026-09-' + String(Math.min(22, ((i + k) % 20) + 2)).padStart(2, '0') };
    comments.push(c);
    if (k === 0 && i % 2 === 0) comments.push({ id: 'c' + cid++, highlight_id: h.id, author_id: h.user_id, body: replies[i % replies.length], parent_id: c.id, pinned: false, created_at: c.created_at });
  }
});
const guest = ['Your whole site feels like a printed magazine. Love it.', 'Found you through the projects page, stayed for the blog.', 'Your about page is the best on this app.', 'Please never redesign this.'];
users.forEach((u, i) => {
  if (i % 2) return;
  comments.push({ id: 'c' + cid++, profile_user_id: u.id, author_id: users[(i + 9) % users.length].id, body: guest[i % guest.length], parent_id: null, pinned: false, created_at: '2026-09-1' + (i % 9) });
});

export const roleTags = ['PM', 'SWE', 'Designer', 'Researcher', 'Founder', 'Student', 'Data', 'Other'];
export const sectionTags = ['Blog', 'Project', 'Portfolio', 'Resume', 'About', 'Playground'];
