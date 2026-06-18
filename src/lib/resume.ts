/**
 * Resume / CV content for the printable /resume page. Transcribed from Mihadul's
 * own CV (lightly polished for phrasing + formatting). This is the source of
 * truth for the downloadable document and is intentionally separate from the
 * live-site data in data.ts.
 */

export type ResumeContact = { label: string; value: string; href?: string };
export type ResumeExperience = {
  role: string;
  org: string;
  period: string;
  points: string[];
  tools?: string;
};
export type ResumeProject = { name: string; org: string; description: string; tools?: string };
export type ResumeTraining = { title: string; org: string; period: string };
export type ResumeCertification = {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
};
export type ResumeEducation = { degree: string; org: string; period: string; note?: string };
export type ResumeReference = { name: string; title: string; email: string; phone: string };

export const resume = {
  name: "Md. Mehadul Islam",
  title: "Full-Stack .NET Engineer",
  photo: "/portrait.jpg",

  contacts: [
    { label: "Email", value: "mehad65@gmail.com", href: "mailto:mehad65@gmail.com" },
    { label: "Phone", value: "+880 1758166900", href: "tel:+8801758166900" },
    { label: "Skype", value: "mehad65" },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/mihadul",
      href: "https://www.linkedin.com/in/mihadul/",
    },
    { label: "Location", value: "Patnitala, Naogaon, Bangladesh" },
  ] satisfies ResumeContact[],

  summary:
    "Passionate software developer who loves learning new technologies and solving challenging problems. Specialized in .NET technologies, with a curious, practical, and hands-on approach to building reliable software.",

  skills: [
    "C#, C, C++",
    "Python",
    "TypeScript, JavaScript, jQuery",
    "ASP.NET Core MVC",
    "Web API (JWT Authentication, CORS)",
    "Node.js",
    "FastAPI",
    "Entity Framework Core",
    "Clean Architecture & Microservices",
    "Design Patterns (SOLID, Repository, Unit of Work, Facade, CQRS)",
    "High-Level Architecture",
    "OOP",
    "Dependency Injection (Autofac, Unity)",
    "Unit Testing (NUnit, Shouldly)",
    "Worker Service",
    "SignalR (Notifications & Messaging)",
    "Angular 14",
    "Next.js (React)",
    "Tailwind CSS",
    "Bootstrap, HTML5/CSS3, Sass",
    "DataTables, AJAX",
    "Flutter & Dart (Mobile)",
    "AI / LLM Integration (OpenAI)",
    "LangChain (RAG & Agents)",
    "Databases (SQL Server, PostgreSQL, Oracle, SQLite, MongoDB, DynamoDB, MySQL)",
    "LINQ, SQL",
    "Stored Procedures, Dynamic SQL",
    "Crystal & RDLC Reports",
    "Docker (Compose, Containers, Images, Volumes)",
    "AWS (Load Balancing, Auto Scaling, DynamoDB, SQS, S3)",
    "Azure",
    "CI/CD (GitHub Actions)",
    "Logging (Serilog)",
    "Git, TortoiseGit",
    "Agile, Scrum, Kanban",
    "Windows Forms",
  ],

  experience: [
    {
      role: "Senior Software Engineer",
      org: "UAPP — London, UK",
      period: "Jul 2025 – Present",
      points: [
        "Build an AI assistant for students and universities on ASP.NET Core Web APIs with Generative-AI / LLM features.",
        "Own Dockerized cloud deployment, authentication, and unit-tested, dependable services.",
      ],
      tools: "ASP.NET Core, Web API, Generative AI / LLM, Docker, Cloud",
    },
    {
      role: "Software Engineer",
      org: "Bluebay IT Limited — Dhaka, Bangladesh",
      period: "Jun 2024 – Jul 2025",
      points: [
        "Built and maintained production software against real business requirements — ASP.NET Core / Web API development and database-backed applications.",
        "Handled feature work, debugging, and deployment across the delivery lifecycle.",
      ],
      tools: "ASP.NET Core, Web API, SQL, Deployment",
    },
    {
      role: "Senior .NET Developer (Contract)",
      org: "Octopi Digital Ltd.",
      period: "Oct 2024 – Dec 2024",
      points: [
        "Senior-level .NET backend work — contributing implementation and architecture to an existing project on a short, focused engagement.",
      ],
      tools: "C#, .NET, Web API",
    },
    {
      role: "Software Engineer (Trainee → Intern → Engineer)",
      org: "Devskill — Mirpur-10, Dhaka, Bangladesh",
      period: "2021 – 2024",
      points: [
        "Built my professional foundation over ~3 years — progressing from C# trainee through engineering intern to Software Engineer, shipping ASP.NET Core apps, Web APIs, database integration, auth, and production maintenance.",
        "Developed point-of-sale (POS) applications end-to-end: gathering information needs, mapping system flow and work processes, and delivering across the full SDLC.",
        "Wrote unit tests for each module (NUnit, Shouldly) and documented solutions with documentation, flowcharts, layouts, and diagrams.",
      ],
      tools:
        ".NET 6, ASP.NET Core, Web API, AWS (S3), Docker, Unit Testing (NUnit, Shouldly), T4 Templates, SQL Server 2019, Bootstrap 4 & 5, JavaScript",
    },
    {
      role: "Trainee",
      org: "Dreamland IT — Dhaka, Bangladesh",
      period: "Dec 2020 – Apr 2021",
      points: [
        "First formal step into professional software/IT work — building the discipline and technical base for a .NET engineering career.",
      ],
    },
  ] satisfies ResumeExperience[],

  projects: [
    {
      name: "Devpos — Point of Sale Application",
      org: "Devskill",
      description:
        "A POS management system for shop owners to handle product management, sales, and purchases. Owners can calculate net profit and view reports such as inventory, statements, sales, purchases, and cashbook.",
      tools:
        "Unit Testing (NUnit, Shouldly), AWS (S3), T4 Templates, Docker, JavaScript, Bootstrap 4 & 5",
    },
    {
      name: "Devify — Multi-Vendor E-Commerce Platform",
      org: "Devskill",
      description:
        "A complete multi-vendor e-commerce platform built during the .NET course at Devskill. Implemented the product section, real-time messaging (SignalR), store admin panel, database/entity diagrams, and inventory management.",
      tools: ".NET Core MVC, SignalR, SQL Server 2019, Bootstrap 5, JavaScript",
    },
    {
      name: "Student Attendance Management System",
      org: "Devskill",
      description:
        "A system for managing attendance of students and teachers. Teachers record attendance and view details; administrators add teachers and students. A complete C# 10 console application.",
      tools: "C# 10, .NET Console Application",
    },
    {
      name: "Business Management Application (DMS)",
      org: "Personal Project",
      description:
        "A dealer management system for selling and purchasing products, with reports for sales, purchases, expenditures, stock, cashbooks, ledgers, and final statements.",
      tools: "C#, Windows Forms, Visual Studio 2019, SQLite, Fluent Validation",
    },
  ] satisfies ResumeProject[],

  training: [
    {
      title: "Professional Programming with C#",
      org: "Devskill — Mirpur-10, Dhaka",
      period: "Apr 2021 – Jul 2021",
    },
    {
      title: "Full-Stack ASP.NET Core MVC Web Development",
      org: "Devskill — Mirpur-10, Dhaka",
      period: "Nov 2021 – Jun 2022",
    },
    {
      title: "CSE Fundamentals with Phitron",
      org: "Programming Hero — Banani, Dhaka",
      period: "Mar 2022 – Present",
    },
    {
      title: "Web Design & Development (Bootstrap 5, CSS3, WordPress)",
      org: "Dreamland IT — Panthapath, Dhaka",
      period: "Jan 2021 – Apr 2021",
    },
    {
      title: "Web Development Training",
      org: "LEDP — Bangladesh Government",
      period: "May 2020 – Sep 2020",
    },
  ] satisfies ResumeTraining[],

  certifications: [
    {
      name: "AWS Solutions Architect – Associate (with DevOps Level Learning)",
      issuer: "Devskill · Amazon Web Services (AWS)",
      date: "Issued Feb 2024",
      credentialId: "dbxk2srvyl4",
    },
  ] satisfies ResumeCertification[],

  education: [
    {
      degree: "Bachelor of Engineering (BE), Information Technology",
      org: "International Open University",
      period: "Aug 2022 – Present",
    },
    {
      degree: "Postgraduate Degree, Computer Science",
      org: "Bangladesh Institute of Human Resource Management (BIHRM)",
      period: "Mar 2024 – Mar 2025",
      note: "Focus: Data Structures & Algorithms, Discrete Mathematics",
    },
    {
      degree: "B.A. in History & Civilization",
      org: "Khulna University, Khulna, Bangladesh",
      period: "2021",
    },
    {
      degree: "Higher Secondary Certificate (HSC) — Science",
      org: "Joypurhat Government College, Joypurhat",
      period: "2015",
    },
    {
      degree: "Secondary School Certificate (SSC) — Science",
      org: "Ramdeo Bazla Government High School, Joypurhat",
      period: "2012",
    },
  ] satisfies ResumeEducation[],

  otherSkills: [
    { area: "Graphics Design", tools: "Adobe Photoshop CC 2021, Adobe Illustrator CC 2021" },
    {
      area: "Video Editing",
      tools: "Adobe Premiere Pro, Adobe After Effects, Camtasia, AVS Video Editor",
    },
  ],

  references: [
    {
      name: "Md. Jalal Uddin",
      title: "CEO, Devskill",
      email: "jalaluddin@devskill.com",
      phone: "01777818008",
    },
    {
      name: "Hafij Ahmed",
      title: "Assistant Professor, Khulna University",
      email: "hafij1998@gmail.com",
      phone: "01714656526",
    },
  ] satisfies ResumeReference[],
};
