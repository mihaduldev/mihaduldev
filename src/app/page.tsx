import { getGithubStats } from "@/lib/github";
import { listExperiences } from "@/server/db/experiences";
import { listProjects } from "@/server/db/projects";
import { listSkillGroups } from "@/server/db/skills";
import { listPublishedPosts } from "@/server/db/posts";
import type { Metadata } from "next";
import { getHeroContent, getScrollSettings } from "@/server/db/settings";
import { profile } from "@/lib/data";
import { JsonLd } from "@/components/seo/json-ld";
import { SnapController } from "@/components/depth/snap-controller";
import { SectionPager } from "@/components/depth/section-pager";
import { Panel } from "@/components/depth/panel";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";
import { Writing } from "@/components/sections/writing";
import { Principles } from "@/components/sections/principles";
import { Contact } from "@/components/sections/contact";

export const revalidate = 3600;

const siteUrl = "https://mihad.site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: `${profile.name} (also ${profile.fullName}) is a ${profile.role} based in ${profile.location}. ${profile.tagline}`,
};

// Home is the person's profile page → ties the page to the Person entity.
const profilePageLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteUrl}/#profilepage`,
  url: siteUrl,
  name: `${profile.name} — ${profile.role}`,
  isPartOf: { "@id": `${siteUrl}/#website` },
  about: { "@id": `${siteUrl}/#person` },
  mainEntity: { "@id": `${siteUrl}/#person` },
  inLanguage: "en",
};

const pager = [
  { id: "home", label: "Intro" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Journey" },
  { id: "projects", label: "Work" },
  { id: "stats", label: "GitHub" },
  { id: "testimonials", label: "Praise" },
  { id: "blog", label: "Writing" },
  { id: "principles", label: "Ethos" },
  { id: "contact", label: "Contact" },
];

export default async function HomePage() {
  const [stats, experiences, projects, groups, posts, hero, scroll] = await Promise.all([
    getGithubStats(),
    listExperiences(),
    listProjects(),
    listSkillGroups(),
    listPublishedPosts(),
    getHeroContent(),
    getScrollSettings(),
  ]);

  const postCards = posts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.publishedAt ?? "",
    readingTime: p.readingTime,
    tags: p.tags,
    cover: p.cover,
  }));

  return (
    <>
      <JsonLd data={profilePageLd} />
      <SnapController settings={scroll} />
      <SectionPager items={pager} />

      <Panel id="home" index={0}>
        <Hero content={hero} />
      </Panel>
      <Panel id="about" index={1}>
        <About />
      </Panel>
      <Panel id="skills" index={2}>
        <Skills groups={groups} />
      </Panel>
      <Panel id="experience" index={3}>
        <Experience items={experiences} />
      </Panel>
      <Panel id="projects" index={4}>
        <Projects projects={projects} />
      </Panel>
      <Panel id="stats" index={5}>
        <Stats stats={stats} />
      </Panel>
      <Panel id="testimonials" index={6}>
        <Testimonials />
      </Panel>
      <Panel id="blog" index={7}>
        <Writing posts={postCards} />
      </Panel>
      <Panel id="principles" index={8}>
        <Principles />
      </Panel>
      <Panel id="contact" index={9}>
        <Contact />
      </Panel>
    </>
  );
}
