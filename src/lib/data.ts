/**
 * Single source of truth for all portfolio content.
 * Sourced verbatim from the GitHub profile README of mihaduldev.
 * Edit values here — components stay presentational.
 */

export const profile = {
  name: "Mihadul Islam",
  fullName: "Md Mehadul Islam",
  initials: "MI",
  role: "Full-Stack .NET Engineer",
  roles: [
    "Full-Stack .NET Engineer",
    "Cloud & System Design",
    "AI Integrations",
    "Clean Architecture Advocate",
  ],
  headline:
    "Full-Stack .NET Engineer specializing in Cloud, System Design, and AI integrations.",
  tagline:
    "I build full-stack applications across the .NET ecosystem — scalable backends, clean APIs, and modern web frontends — with cloud-ready delivery and practical AI integrations that help real businesses operate faster and more reliably.",
  location: "Bangladesh",
  available: true,
  avatar: "https://avatars.githubusercontent.com/u/mihaduldev",
  githubUsername: "mihaduldev",
  email: "mehad65@gmail.com",
  website: "https://mihad.site",
} as const;

export const about = {
  lead: "I'm a Bangladesh-based Software Engineer who enjoys turning messy business requirements into clean, maintainable software.",
  body: "My main focus is ASP.NET Core, Web API, database design, cloud deployment, and AI-assisted product development. I care about practical engineering: readable code, clear architecture, strong security basics, automated deployment, and systems that real users can depend on.",
  buildingLabel: "Currently building & improving products around",
  building: [
    {
      title: "Enterprise backend systems",
      description:
        "Robust services built with ASP.NET Core and Clean Architecture.",
      icon: "Server",
    },
    {
      title: "Cloud-ready applications",
      description: "Shipped with Docker, AWS, and modern deployment workflows.",
      icon: "Cloud",
    },
    {
      title: "AI-powered tools",
      description: "Using LLMs, automation, and retrieval-based workflows.",
      icon: "Sparkles",
    },
    {
      title: "Developer education",
      description: "Content around .NET, C#, OOP, and system design.",
      icon: "GraduationCap",
    },
  ],
} as const;

export type Skill = {
  name: string;
  color: string;
  desc: string;
  core?: boolean;
  /** devicon path segment, e.g. "csharp/csharp-original" (omit for concepts) */
  logo?: string;
};

export type SkillGroup = {
  category: string;
  icon: string;
  description: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Backend & Architecture",
    icon: "Server",
    description:
      "My core stack for APIs, application services, business workflows, and scalable system architecture.",
    skills: [
      { name: "C#", color: "#68217A", core: true, logo: "csharp/csharp-original", desc: "Primary backend language for APIs, services, and business logic." },
      { name: ".NET", color: "#512BD4", core: true, logo: "dotnetcore/dotnetcore-original", desc: "Framework for scalable APIs, services, and web applications." },
      { name: "ASP.NET Core", color: "#512BD4", core: true, logo: "dotnetcore/dotnetcore-original", desc: "REST APIs, authentication, middleware, and enterprise services." },
      { name: "REST API", color: "#02569B", core: true, desc: "Clean, secure, versioned API contract design." },
      { name: "Clean Architecture", color: "#5E687E", core: true, desc: "Domain, application, and infrastructure layers, cleanly separated." },
      { name: "Microservices", color: "#0052CC", core: true, desc: "Modular, independently deployable service design." },
      { name: "Node.js", color: "#339933", logo: "nodejs/nodejs-original", desc: "JavaScript runtime for services and tooling alongside .NET." },
    ],
  },
  {
    category: "Frontend & Product UI",
    icon: "Layout",
    description:
      "Building clean, responsive product interfaces and consistent design systems.",
    skills: [
      { name: "TypeScript", color: "#3178C6", core: true, logo: "typescript/typescript-original", desc: "Type-safe UI and API-client development." },
      { name: "JavaScript", color: "#C9A227", logo: "javascript/javascript-original", desc: "Interactive product interfaces and tooling." },
      { name: "Angular", color: "#DD0031", logo: "angularjs/angularjs-original", desc: "Component-driven enterprise web applications." },
      { name: "HTML5", color: "#E34F26", logo: "html5/html5-original", desc: "Semantic, accessible markup." },
      { name: "CSS3", color: "#1572B6", logo: "css3/css3-original", desc: "Responsive, modern styling." },
      { name: "Tailwind CSS", color: "#06B6D4", core: true, logo: "tailwindcss/tailwindcss-original", desc: "Rapid, consistent UI with a design system." },
      { name: "Next.js", color: "#0070F3", desc: "React framework for full-stack, server-rendered web apps." },
    ],
  },
  {
    category: "Data, Cloud & DevOps",
    icon: "Database",
    description:
      "Storing data and shipping reliably with containers, cloud, and automated pipelines.",
    skills: [
      { name: "SQL Server", color: "#CC2927", core: true, logo: "microsoftsqlserver/microsoftsqlserver-plain", desc: "Relational data modeling and T-SQL queries." },
      { name: "PostgreSQL", color: "#4169E1", core: true, logo: "postgresql/postgresql-original", desc: "Robust relational storage and querying." },
      { name: "MongoDB", color: "#47A248", logo: "mongodb/mongodb-original", desc: "Document storage for flexible schemas." },
      { name: "Docker", color: "#2496ED", core: true, logo: "docker/docker-original", desc: "Containerized, reproducible deployments." },
      { name: "AWS", color: "#FF9900", desc: "Cloud hosting, storage, and services." },
      { name: "Azure", color: "#0078D4", logo: "azure/azure-original", desc: "Cloud applications and managed services." },
      { name: "GitHub Actions", color: "#2088FF", core: true, logo: "githubactions/githubactions-original", desc: "CI/CD pipelines and release automation." },
    ],
  },
  {
    category: "AI & Automation",
    icon: "Sparkles",
    description:
      "Practical LLM features, retrieval-based workflows, and automation that saves real time.",
    skills: [
      { name: "Python", color: "#3776AB", core: true, logo: "python/python-original", desc: "Automation scripts and AI tooling." },
      { name: "FastAPI", color: "#009688", logo: "fastapi/fastapi-original", desc: "Lightweight Python APIs for AI and automation services." },
      { name: "OpenAI", color: "#10A37F", core: true, desc: "LLM-powered features and assistants." },
      { name: "LangChain", color: "#1C7C54", core: true, desc: "Retrieval and agent-style workflows." },
      { name: "Automation", color: "#FF6F00", desc: "Cutting manual work with scripts and AI." },
    ],
  },
  {
    category: "Mobile",
    icon: "Smartphone",
    description:
      "Cross-platform mobile apps from a single codebase when a project needs to reach phones too.",
    skills: [
      { name: "Flutter", color: "#02569B", logo: "flutter/flutter-original", desc: "Cross-platform iOS and Android apps from one codebase." },
      { name: "Dart", color: "#0175C2", logo: "dart/dart-original", desc: "The language powering Flutter app development." },
    ],
  },
];

export type Experience = {
  period: string;
  title: string;
  org: string;
  description: string;
  tags: string[];
  icon: string;
};

/** Real work journey (reverse-chronological). Lower `sort` = nearer the top. */
export const experience: Experience[] = [
  {
    period: "Jul 2025 — Present",
    title: "Senior Software Engineer",
    org: "UAPP · London, UK",
    description:
      "Building an AI assistant for students and universities — ASP.NET Core Web APIs, Generative-AI / LLM features, Dockerized cloud deployment, authentication, and unit-tested, dependable services.",
    tags: ["ASP.NET Core", "Web API", "Generative AI", "Docker", "Cloud"],
    icon: "Sparkles",
  },
  {
    period: "Sep 2024 — Present",
    title: "Chief Technology Officer",
    org: "IT Solution Tree · Khulna, BD",
    description:
      "Technical leadership and architecture — technology selection, product direction, deployment and infrastructure planning, and guiding the engineering team on delivery.",
    tags: ["Architecture", "System Design", "Leadership", "Cloud"],
    icon: "Boxes",
  },
  {
    period: "Jun 2024 — Jul 2025",
    title: "Software Engineer",
    org: "Bluebay IT Limited · Dhaka, BD",
    description:
      "Built and maintained production software against real business requirements — ASP.NET Core / Web API development, database-backed applications, feature work, debugging, and deployment.",
    tags: ["ASP.NET Core", "Web API", "SQL", "Deployment"],
    icon: "Server",
  },
  {
    period: "Oct 2024 — Dec 2024",
    title: "Senior .NET Developer",
    org: "Octopi Digital Ltd. · Contract",
    description:
      "Senior-level .NET backend work — contributing implementation and architecture to an existing project on a short, focused engagement.",
    tags: ["C#", ".NET", "Web API"],
    icon: "Code2",
  },
  {
    period: "2021 — 2024",
    title: "Software Engineer — Trainee → Intern → Engineer",
    org: "Dev Skill · Mirpur, Dhaka, BD",
    description:
      "Where my professional foundation was built. Progressed from C# trainee through engineering intern to Software Engineer over ~3 years — shipping ASP.NET Core apps, Web APIs, database integration, auth, and production maintenance.",
    tags: ["C#", "ASP.NET Core", "Web API", "OOP", "Databases"],
    icon: "GraduationCap",
  },
  {
    period: "Dec 2020 — Apr 2021",
    title: "Trainee",
    org: "Dreamland IT · Dhaka, BD",
    description:
      "Where it began — my first formal step into professional software/IT work, building the discipline and technical base for a .NET engineering career.",
    tags: ["Foundations", "IT", "Software"],
    icon: "Briefcase",
  },
];

export type Project = {
  title: string;
  description: string;
  focus: string[];
  repo: string;
  featured?: boolean;
  accent: string;
};

export const projects: Project[] = [
  {
    title: "System Design Overview",
    description:
      "Notes and examples around system design, architecture, scalability, and clean software thinking.",
    focus: ["C#", "Architecture", "System Design", "Engineering Notes"],
    repo: "https://github.com/mihaduldev/System-Design-Overview",
    featured: true,
    accent: "#087EA4",
  },
  {
    title: "Tourism Ecosystem Backend",
    description:
      "Backend foundation for a tourism ecosystem platform — API design, database design, and real business workflows.",
    focus: ["ASP.NET Core", "API Design", "Database Design", "Workflow"],
    repo: "https://github.com/mihaduldev/tourism-ecosystem-backend",
    featured: true,
    accent: "#512BD4",
  },
  {
    title: "Tourism Ecosystem",
    description:
      "Frontend / product layer for a tourism platform experience, built with a modern TypeScript stack.",
    focus: ["TypeScript", "Web Application", "Product UI"],
    repo: "https://github.com/mihaduldev/tourism-ecosystem",
    accent: "#3178C6",
  },
  {
    title: "Microservices With Clean Architecture",
    description:
      "Practice and implementation around microservices and clean architecture concepts in .NET.",
    focus: ["C#", "Microservices", "Clean Architecture", "Backend Patterns"],
    repo: "https://github.com/mihaduldev/MicroservicesWithCleanArchitecture",
    accent: "#0052CC",
  },
];

export type Principle = {
  title: string;
  description: string;
  icon: string;
};

export const principles: Principle[] = [
  {
    title: "Keep systems understandable",
    description: "Simple architecture beats clever complexity.",
    icon: "Boxes",
  },
  {
    title: "Design for change",
    description:
      "Business requirements evolve, so code should be easy to extend.",
    icon: "Shuffle",
  },
  {
    title: "Security is not optional",
    description:
      "Authentication, authorization, validation, and safe defaults matter.",
    icon: "ShieldCheck",
  },
  {
    title: "Automate repeatable work",
    description:
      "CI/CD, Docker, scripts, and AI tools should reduce manual effort.",
    icon: "Workflow",
  },
  {
    title: "Document the why",
    description:
      "Good engineering is not only code, it is shared understanding.",
    icon: "FileText",
  },
];

/**
 * Demo testimonials — illustrative placeholders (no testimonials exist in the
 * source). Replace with real recommendations any time.
 */
export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Mihadul turns vague requirements into clean, dependable backend systems. His APIs are a pleasure to integrate with, and the architecture always holds up as the product grows.",
    name: "Engineering Lead",
    title: "Enterprise SaaS Team",
    initials: "EL",
  },
  {
    quote:
      "Pragmatic, security-minded, and fast. He shipped a Dockerized .NET service with CI/CD that just worked — readable code, clear docs, and zero drama in production.",
    name: "Product Manager",
    title: "Tourism Platform",
    initials: "PM",
  },
  {
    quote:
      "His system design notes and mentoring leveled up our whole team. He explains the why behind every decision, which is rare and incredibly valuable.",
    name: "Junior Developer",
    title: "Mentee",
    initials: "JD",
  },
  {
    quote:
      "We needed an AI workflow that was actually reliable, not a demo. Mihadul delivered a retrieval-based pipeline that's been solid since day one.",
    name: "Startup Founder",
    title: "AI Product",
    initials: "SF",
  },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  cover: string;
};

/** Blog post metadata. Bodies live in src/content/blog/*.mdx */
export const posts: Post[] = [
  {
    slug: "clean-architecture-dotnet",
    title: "Clean Architecture in .NET, Without the Dogma",
    excerpt:
      "A practical take on layering ASP.NET Core apps so they stay understandable and easy to change — and when the rules are worth bending.",
    date: "2026-05-28",
    readingTime: "8 min read",
    tags: [".NET", "Architecture", "ASP.NET Core"],
    cover: "from-[#087EA4] to-[#58C4DC]",
  },
  {
    slug: "ship-dotnet-with-docker-ci",
    title: "Shipping a .NET API with Docker and CI/CD",
    excerpt:
      "From Dockerfile to GitHub Actions: a repeatable, automated path to production that you can trust on a Friday afternoon.",
    date: "2026-04-15",
    readingTime: "10 min read",
    tags: ["Docker", "DevOps", "AWS"],
    cover: "from-[#512BD4] to-[#087EA4]",
  },
  {
    slug: "practical-llm-workflows",
    title: "Practical LLM Workflows for Real Products",
    excerpt:
      "How to move past chatbot demos and build retrieval-based AI features that are reliable enough to put in front of real users.",
    date: "2026-03-02",
    readingTime: "7 min read",
    tags: ["AI", "LLMs", "Automation"],
    cover: "from-[#58C4DC] to-[#61DAFB]",
  },
];

export type SocialLink = {
  label: string;
  href: string;
  icon: string;
  handle: string;
};

export const socials: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/mihaduldev",
    icon: "Github",
    handle: "@mihaduldev",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mihadul/",
    icon: "Linkedin",
    handle: "in/mihadul",
  },
  {
    label: "Email",
    href: "mailto:mehad65@gmail.com",
    icon: "Mail",
    handle: "mehad65@gmail.com",
  },
  {
    label: "Website",
    href: "https://mihad.site",
    icon: "Globe",
    handle: "mihad.site",
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Journey", href: "#experience" },
  { label: "Work", href: "#projects" },
  { label: "Writing", href: "#blog" },
  { label: "Contact", href: "#contact" },
] as const;

/** Fallback stats shown before/if the live GitHub API is unavailable. */
export const fallbackStats = {
  followers: 0,
  publicRepos: 0,
  stars: 0,
  topLanguages: ["C#", "TypeScript", "Python", "JavaScript"],
};
