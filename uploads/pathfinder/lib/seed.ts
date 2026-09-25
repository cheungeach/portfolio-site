import { db } from "./db";

// 20 example postings across the three student job types. Replace with the fetch pipeline (Greenhouse / Lever / Ashby JSON + school packs) later.
const d = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const SEED_JOBS = [
  { org: "MIT Media Lab", title: "UROP — Tangible Media Group", type: "Lab", deadline: d(5), direction_hint: "UX Design", big_title: 1, easy_get: 0, base_score: 88, description: "A research assistant role building physical interfaces. The posting asks for prototyping and user studies." },
  { org: "Stanford Vision Lab", title: "Research Assistant, Computer Vision", type: "Lab", deadline: d(3), direction_hint: "AI practical projects", big_title: 1, easy_get: 0, base_score: 84, description: "Help run experiments on 3D scene understanding; PyTorch and dataset tooling." },
  { org: "Berkeley BAIR", title: "Undergraduate researcher, embodied agents", type: "Lab", deadline: d(11), direction_hint: "AI desktop agent", big_title: 1, easy_get: 0, base_score: 91, description: "Work on agents that act in desktop and web environments; evaluation harnesses and human-in-the-loop studies." },
  { org: "Berkeley CogSci — Decision Lab", title: "URAP: human-AI collaboration study", type: "Lab", deadline: d(9), direction_hint: "AI and Cognitive Science", big_title: 0, easy_get: 1, base_score: 86, description: "Run behavioral studies on how people delegate decisions to AI assistants. Qualtrics, R or Python." },
  { org: "Haas BOBALAB", title: "URAP research apprentice", type: "Lab", deadline: d(14), direction_hint: "AI and Cognitive Science", big_title: 0, easy_get: 1, base_score: 78, description: "Behavioral operations research on human decision-making with algorithms." },
  { org: "Berkeley EECS — HCI Group", title: "Research assistant, interface prototyping", type: "Lab", deadline: d(20), direction_hint: "UX Design", big_title: 0, easy_get: 1, base_score: 80, description: "Build prototypes for a study on AI writing tools. Figma and React." },
  { org: "Figma", title: "Product Design Intern, Summer 2027", type: "Intern", deadline: d(12), direction_hint: "UX Design", big_title: 1, easy_get: 0, base_score: 79, description: "Design intern on the editor team. Portfolio required; cover letter optional." },
  { org: "Anthropic", title: "Product Management Intern", type: "Intern", deadline: d(6), direction_hint: "Product Manager", big_title: 1, easy_get: 0, base_score: 82, description: "Work with a product team on developer-facing features. Written exercise in the application." },
  { org: "Notion", title: "Product Manager Intern", type: "Intern", deadline: d(18), direction_hint: "Product Manager", big_title: 1, easy_get: 0, base_score: 76, description: "Ship a feature end to end with a small team. Two short-answer questions." },
  { org: "Linear", title: "Full-stack Engineering Intern", type: "Intern", deadline: d(25), direction_hint: "Full-stack engineer", big_title: 0, easy_get: 0, base_score: 74, description: "TypeScript, React, Postgres. Small team, high ownership." },
  { org: "Vercel", title: "Software Engineer Intern, Frontend", type: "Intern", deadline: d(30), direction_hint: "Full-stack engineer", big_title: 1, easy_get: 0, base_score: 72, description: "Next.js internals and developer tooling." },
  { org: "Replit", title: "AI Agent Engineering Intern", type: "Intern", deadline: d(8), direction_hint: "AI desktop agent", big_title: 0, easy_get: 0, base_score: 85, description: "Build and evaluate coding agents; prompt design, tool use, evals." },
  { org: "Adept", title: "Applied AI Intern — computer-use agents", type: "Intern", deadline: d(4), direction_hint: "AI desktop agent", big_title: 0, easy_get: 0, base_score: 87, description: "Agents that operate GUIs. Data collection and evaluation." },
  { org: "Duolingo", title: "Product Design Intern", type: "Intern", deadline: d(22), direction_hint: "UX Design", big_title: 1, easy_get: 0, base_score: 70, description: "Learning product design; strong visual craft expected." },
  { org: "Handshake", title: "Product Intern, student experience", type: "Intern", deadline: d(16), direction_hint: "Product Manager", big_title: 0, easy_get: 1, base_score: 81, description: "Improve the student job-search flow. Interviews with students; PM shadowing." },
  { org: "ASUCD / UC Davis", title: "Student Web Developer", type: "On-campus", deadline: d(28), direction_hint: "Full-stack engineer", big_title: 0, easy_get: 1, base_score: 68, description: "Maintain student-government sites. 10 hrs/week." },
  { org: "Berkeley RSF", title: "Front desk assistant", type: "On-campus", deadline: d(21), direction_hint: "", big_title: 0, easy_get: 1, base_score: 60, description: "Front desk and membership support. Work-study eligible." },
  { org: "Berkeley Library — Makerspace", title: "Student technician, fabrication", type: "On-campus", deadline: d(7), direction_hint: "AI practical projects", big_title: 0, easy_get: 1, base_score: 73, description: "Support 3D printing and laser cutting; teach intro workshops." },
  { org: "Berkeley School of Information", title: "UX research assistant (student)", type: "On-campus", deadline: d(10), direction_hint: "UX Design", big_title: 0, easy_get: 1, base_score: 83, description: "Assist with usability studies for campus apps. Interviewing and synthesis." },
  { org: "Cal Student Store", title: "Marketing & photography assistant", type: "On-campus", deadline: d(35), direction_hint: "", big_title: 0, easy_get: 1, base_score: 62, description: "Product photography and social content." },
];

export function seedJobsIfEmpty() {
  const n = (db.prepare("SELECT COUNT(*) AS n FROM jobs").get() as { n: number }).n;
  if (n > 0) return;
  const ins = db.prepare("INSERT INTO jobs (org,title,type,url,deadline,description,direction_hint,big_title,easy_get,base_score) VALUES (@org,@title,@type,'',@deadline,@description,@direction_hint,@big_title,@easy_get,@base_score)");
  const tx = db.transaction((rows: typeof SEED_JOBS) => rows.forEach((r) => ins.run(r)));
  tx(SEED_JOBS);
}

export const DEFAULT_DIRECTIONS = [
  { name: "Product Manager", hint: "PM internships, product roles" },
  { name: "AI desktop agent", hint: "Agents that operate software" },
  { name: "AI and Cognitive Science", hint: "Decision-making, human–AI collaboration" },
  { name: "AI practical projects", hint: "Applied, not theoretical" },
  { name: "UX Design", hint: "Product and UX design roles" },
  { name: "Full-stack engineer", hint: "TypeScript, React, backend" },
];
