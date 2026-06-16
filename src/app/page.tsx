import { getGithubStats } from "@/lib/github";
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

const pager = [
  { id: "home", label: "Intro" },
  { id: "about", label: "About" },
  { id: "skills", label: "Stack" },
  { id: "experience", label: "Journey" },
  { id: "projects", label: "Work" },
  { id: "stats", label: "GitHub" },
  { id: "testimonials", label: "Praise" },
  { id: "blog", label: "Writing" },
  { id: "principles", label: "Ethos" },
  { id: "contact", label: "Contact" },
];

export default async function HomePage() {
  const stats = await getGithubStats();

  return (
    <>
      <SnapController />
      <SectionPager items={pager} />

      <Panel id="home" index={0}>
        <Hero />
      </Panel>
      <Panel id="about" index={1}>
        <About />
      </Panel>
      <Panel id="skills" index={2}>
        <Skills />
      </Panel>
      <Panel id="experience" index={3}>
        <Experience />
      </Panel>
      <Panel id="projects" index={4}>
        <Projects />
      </Panel>
      <Panel id="stats" index={5}>
        <Stats stats={stats} />
      </Panel>
      <Panel id="testimonials" index={6}>
        <Testimonials />
      </Panel>
      <Panel id="blog" index={7}>
        <Writing />
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
