"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Send, Github, Linkedin, Mail, Globe } from "lucide-react";
import { profile, socials } from "@/lib/data";
import { submitContact } from "@/app/actions/contact";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { GlassCard } from "@/components/depth/glass-card";

const iconMap = { Github, Linkedin, Mail, Globe } as const;

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Tell me a little more (10+ characters)"),
});
type Values = z.infer<typeof schema>;

export function Contact() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const [submitError, setSubmitError] = useState("");

  async function onSubmit(values: Values) {
    setSubmitError("");
    const res = await submitContact(values);
    if (res.ok) {
      setSent(true);
      reset();
      setTimeout(() => setSent(false), 2800);
    } else {
      setSubmitError(res.error ?? "Something went wrong.");
    }
  }

  const field =
    "w-full rounded-xl border border-border bg-primary/[0.03] px-4 py-3 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent";

  return (
    <div className="relative w-full">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let&apos;s build something{" "}
              <span className="text-accent">dependable</span>
            </>
          }
          description="Interested in .NET, cloud, AI, or system design? Let's talk."
        />

        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col gap-4">
              <GlassCard tilt={false} className="p-7">
                <h3 className="font-display text-xl font-semibold text-primary">Get in touch</h3>
                <p className="mt-2 text-sm leading-relaxed text-tertiary">
                  Open to new opportunities and collaborations. The fastest way to
                  reach me is email — I usually reply within a day.
                </p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)]"
                >
                  <Mail className="size-4" />
                  {profile.email}
                </a>
              </GlassCard>

              <div className="grid grid-cols-2 gap-3">
                {socials.map((s) => {
                  const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Globe;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-2xl glass p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--glow-md)]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                        <Icon className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">{s.label}</p>
                        <p className="truncate text-xs text-tertiary">{s.handle}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="relative rounded-2xl glass glow-ring p-7 sm:p-8"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-secondary">Name</label>
                  <input id="name" className={field} placeholder="Your name" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-secondary">Email</label>
                  <input id="email" className={field} placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-secondary">Message</label>
                  <textarea id="message" rows={4} className={`${field} resize-none`} placeholder="Tell me about your project…" {...register("message")} />
                  {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || sent}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-brand-foreground transition-all hover:shadow-[var(--glow-lg)] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="size-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="size-4" /> Send message</>
                  )}
                </button>
                {submitError && (
                  <p className="text-center text-xs text-red-400">{submitError}</p>
                )}
                <p className="text-center text-xs text-tertiary">
                  Your message lands straight in my inbox — I usually reply within a day.
                </p>
              </div>

              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSent(false)}
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl glass-strong"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    >
                      <CheckCircle2 className="size-16 text-accent glow-text" />
                    </motion.div>
                    <p className="mt-4 font-display text-xl font-semibold text-primary">Message sent!</p>
                    <p className="mt-1 text-sm text-tertiary">Thanks for reaching out — I&apos;ll reply soon.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
