-- Seed: current portfolio content so the site is populated on first deploy.

DELETE FROM experiences;
INSERT INTO experiences (period, title, org, description, icon, tags_json, sort) VALUES
('Now', 'Backend & Cloud Engineering', 'Enterprise Product Work', 'Building enterprise-grade backend systems with ASP.NET Core and Clean Architecture — clean APIs, solid database design, and dependable business workflows.', 'Server', '["ASP.NET Core","Clean Architecture","Web API","SQL"]', 1),
('Ongoing', 'Cloud Deployment & DevOps', 'Modern Delivery Workflows', 'Shipping cloud-ready applications using Docker, AWS, and modern CI/CD so releases are automated, repeatable, and safe.', 'Cloud', '["Docker","AWS","GitHub Actions","CI/CD"]', 2),
('Ongoing', 'AI-Powered Product Development', 'Applied LLM Engineering', 'Designing practical AI tools with LLMs, automation, and retrieval-based workflows that solve real business problems.', 'Sparkles', '["LLMs","OpenAI","LangChain","Automation"]', 3),
('Continuous', 'Developer Education & System Design', 'Community & Writing', 'Creating developer education content around .NET, C#, OOP, and system design — turning hard concepts into shared understanding.', 'GraduationCap', '[".NET","C#","OOP","System Design"]', 4);

DELETE FROM projects;
INSERT INTO projects (title, description, focus_json, repo, featured, accent, sort) VALUES
('System Design Overview', 'Notes and examples around system design, architecture, scalability, and clean software thinking.', '["C#","Architecture","System Design","Engineering Notes"]', 'https://github.com/mihaduldev/System-Design-Overview', 1, '#087EA4', 1),
('Tourism Ecosystem Backend', 'Backend foundation for a tourism ecosystem platform — API design, database design, and real business workflows.', '["ASP.NET Core","API Design","Database Design","Workflow"]', 'https://github.com/mihaduldev/tourism-ecosystem-backend', 1, '#512BD4', 2),
('Tourism Ecosystem', 'Frontend / product layer for a tourism platform experience, built with a modern TypeScript stack.', '["TypeScript","Web Application","Product UI"]', 'https://github.com/mihaduldev/tourism-ecosystem', 0, '#3178C6', 3),
('Microservices With Clean Architecture', 'Practice and implementation around microservices and clean architecture concepts in .NET.', '["C#","Microservices","Clean Architecture","Backend Patterns"]', 'https://github.com/mihaduldev/MicroservicesWithCleanArchitecture', 0, '#0052CC', 4);

DELETE FROM skill_groups;
INSERT INTO skill_groups (category, icon, description, skills_json, sort) VALUES
('Backend & Architecture', 'Server', 'My core stack for APIs, application services, business workflows, and scalable system architecture.', '[{"name":"C#","color":"#68217A","core":true,"logo":"csharp/csharp-original","desc":"Primary backend language for APIs, services, and business logic."},{"name":".NET","color":"#512BD4","core":true,"logo":"dotnetcore/dotnetcore-original","desc":"Framework for scalable APIs, services, and web applications."},{"name":"ASP.NET Core","color":"#512BD4","core":true,"logo":"dotnetcore/dotnetcore-original","desc":"REST APIs, authentication, middleware, and enterprise services."},{"name":"REST API","color":"#02569B","core":true,"desc":"Clean, secure, versioned API contract design."},{"name":"Clean Architecture","color":"#5E687E","core":true,"desc":"Domain, application, and infrastructure layers, cleanly separated."},{"name":"Microservices","color":"#0052CC","core":true,"desc":"Modular, independently deployable service design."}]', 1),
('Frontend & Product UI', 'Layout', 'Building clean, responsive product interfaces and consistent design systems.', '[{"name":"TypeScript","color":"#3178C6","core":true,"logo":"typescript/typescript-original","desc":"Type-safe UI and API-client development."},{"name":"JavaScript","color":"#C9A227","logo":"javascript/javascript-original","desc":"Interactive product interfaces and tooling."},{"name":"Angular","color":"#DD0031","logo":"angularjs/angularjs-original","desc":"Component-driven enterprise web applications."},{"name":"HTML5","color":"#E34F26","logo":"html5/html5-original","desc":"Semantic, accessible markup."},{"name":"CSS3","color":"#1572B6","logo":"css3/css3-original","desc":"Responsive, modern styling."},{"name":"Tailwind CSS","color":"#06B6D4","core":true,"logo":"tailwindcss/tailwindcss-original","desc":"Rapid, consistent UI with a design system."}]', 2),
('Data, Cloud & DevOps', 'Database', 'Storing data and shipping reliably with containers, cloud, and automated pipelines.', '[{"name":"SQL Server","color":"#CC2927","core":true,"logo":"microsoftsqlserver/microsoftsqlserver-plain","desc":"Relational data modeling and T-SQL queries."},{"name":"PostgreSQL","color":"#4169E1","core":true,"logo":"postgresql/postgresql-original","desc":"Robust relational storage and querying."},{"name":"MongoDB","color":"#47A248","logo":"mongodb/mongodb-original","desc":"Document storage for flexible schemas."},{"name":"Docker","color":"#2496ED","core":true,"logo":"docker/docker-original","desc":"Containerized, reproducible deployments."},{"name":"AWS","color":"#FF9900","desc":"Cloud hosting, storage, and services."},{"name":"Azure","color":"#0078D4","logo":"azure/azure-original","desc":"Cloud applications and managed services."},{"name":"GitHub Actions","color":"#2088FF","core":true,"logo":"githubactions/githubactions-original","desc":"CI/CD pipelines and release automation."}]', 3),
('AI & Automation', 'Sparkles', 'Practical LLM features, retrieval-based workflows, and automation that saves real time.', '[{"name":"Python","color":"#3776AB","core":true,"logo":"python/python-original","desc":"Automation scripts and AI tooling."},{"name":"OpenAI","color":"#10A37F","core":true,"desc":"LLM-powered features and assistants."},{"name":"LangChain","color":"#1C7C54","desc":"Retrieval and agent-style workflows."},{"name":"Automation","color":"#FF6F00","desc":"Cutting manual work with scripts and AI."}]', 4);

DELETE FROM posts;
INSERT INTO posts (slug, title, excerpt, body_md, tags_json, cover, reading_time, published, published_at) VALUES
('clean-architecture-dotnet', 'Clean Architecture in .NET, Without the Dogma', 'A practical take on layering ASP.NET Core apps so they stay understandable and easy to change — and when the rules are worth bending.', '## The one rule that matters

Clean Architecture gets a bad reputation because people treat it as a checklist instead of a tool. The real point is **dependency direction**: your business rules should not know or care about the database, the web framework, or the message broker. Everything else is negotiable.

Inner layers never depend on outer layers. In an ASP.NET Core app that usually means three things:

- **Domain** — entities, value objects, and rules that are true regardless of how data is stored.
- **Application** — use cases that orchestrate the domain; they define interfaces but never implement them.
- **Infrastructure** — EF Core, HTTP clients, storage. This is where the interfaces get implemented.

> If you can delete your Infrastructure project and your business logic still compiles, you have the direction right.

## When to bend the rules

A 200-line internal tool does not need this. Clean Architecture pays off when the system will live for years, the business rules are genuinely complex, or you need to swap infrastructure without a rewrite. Start simple and add layers when a real seam appears — the best architecture is the one your team can still understand at 4pm on a Friday.', '[".NET","Architecture","ASP.NET Core"]', 'from-[#087EA4] to-[#58C4DC]', '8 min read', 1, '2026-05-28'),
('ship-dotnet-with-docker-ci', 'Shipping a .NET API with Docker and CI/CD', 'From Dockerfile to GitHub Actions: a repeatable, automated path to production that you can trust on a Friday afternoon.', '## Boring releases are the goal

The point of a deployment pipeline is boring releases: no manual steps, no "works on my machine", no Friday-afternoon dread.

Use a multi-stage Dockerfile so the final image ships only the runtime, not the SDK — restoring packages before copying the full source means Docker caches the dependency layer and rebuilds stay fast.

A GitHub Actions workflow then builds, **tests**, and pushes an image on every push. Tests run before anything ships; if they fail, nothing is deployed — that is the whole point.

## Safe deploys

Tag images with the commit SHA so every deploy is traceable and instantly rollback-able. Run database migrations as an explicit, separate step — never silently on startup in production. Automate the repeatable work and shipping becomes a non-event, which is exactly what you want.', '["Docker","DevOps","AWS"]', 'from-[#512BD4] to-[#087EA4]', '10 min read', 1, '2026-04-15'),
('practical-llm-workflows', 'Practical LLM Workflows for Real Products', 'How to move past chatbot demos and build retrieval-based AI features that are reliable enough to put in front of real users.', '## Retrieval beats memorization

Most LLM demos are impressive and useless — they fall apart the moment a real user types something unexpected. Building AI features that hold up in production is closer to systems engineering than prompt-crafting.

Do not ask a model to recall your business data; it will confidently invent it. Instead, retrieve the relevant facts and put them in the prompt: chunk your documents, embed them, and at query time fetch the top matches to ground the answer.

## Treat the LLM as an unreliable function

A language model usually returns the right shape — but not always. Validate the output (ask for JSON, then parse and verify), constrain the task to something narrow and well-defined, and keep a human in the loop for anything irreversible. Build a small evaluation set of real inputs and run it on every prompt change — without it you are tuning blind.', '["AI","LLMs","Automation"]', 'from-[#58C4DC] to-[#61DAFB]', '7 min read', 1, '2026-03-02');
