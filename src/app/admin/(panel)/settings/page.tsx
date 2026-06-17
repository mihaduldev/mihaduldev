import { getHeroContent, getScrollSettings } from "@/server/db/settings";
import { saveHeroSettings, saveScrollSettings } from "@/app/admin/actions";
import { PageHeader, AdminCard, Field, field } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { TagInput } from "@/components/admin/tag-input";

export const dynamic = "force-dynamic";

const SPEEDS = [
  { ms: 800, label: "Snappy" },
  { ms: 1100, label: "Smooth" },
  { ms: 1650, label: "Calm" },
  { ms: 2200, label: "Slow motion" },
];

export default async function SettingsAdmin() {
  const [hero, scroll] = await Promise.all([getHeroContent(), getScrollSettings()]);
  // ensure the current stored speed is selectable even if it's a custom value
  const speeds = SPEEDS.some((s) => s.ms === scroll.durationMs)
    ? SPEEDS
    : [...SPEEDS, { ms: scroll.durationMs, label: `Custom (${scroll.durationMs}ms)` }];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Edit the hero content and how the site scrolls. Changes go live immediately."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Hero content */}
        <AdminCard>
          <h2 className="font-semibold text-primary">Hero content</h2>
          <p className="mt-1 text-sm text-tertiary">The headline block on the home page.</p>
          <form action={saveHeroSettings} className="mt-4 space-y-4">
            <Field label="Name">
              <input name="name" defaultValue={hero.name} className={field} required />
            </Field>
            <Field label="Role" hint="bold lead, e.g. Full-Stack .NET Engineer">
              <input name="roleLead" defaultValue={hero.roleLead} className={field} required />
            </Field>
            <Field label="Role accent" hint="cyan continuation shown after the role">
              <input name="roleAccent" defaultValue={hero.roleAccent} className={field} />
            </Field>
            <Field label="Description">
              <textarea name="description" rows={4} defaultValue={hero.description} className={field} required />
            </Field>
            <Field label="Availability badge">
              <input name="availability" defaultValue={hero.availability} className={field} />
            </Field>
            <Field label="Proof chips" hint="comma separated">
              <TagInput name="proof" defaultValue={hero.proof} placeholder="Clean Architecture" />
            </Field>
            <SubmitButton>Save hero</SubmitButton>
          </form>
        </AdminCard>

        {/* Scroll & motion */}
        <AdminCard>
          <h2 className="font-semibold text-primary">Scroll &amp; motion</h2>
          <p className="mt-1 text-sm text-tertiary">
            How the home page moves between sections (desktop pointer; touch &amp; reduced-motion always use native scrolling).
          </p>
          <form action={saveScrollSettings} className="mt-4 space-y-4">
            <Field label="Scroll type">
              <select name="mode" defaultValue={scroll.mode} className={field}>
                <option value="glide">Paged glide — one section at a time</option>
                <option value="snap">Instant snap — jump between sections</option>
                <option value="native">Native — normal browser scrolling</option>
              </select>
            </Field>
            <Field label="Speed" hint="glide length">
              <select name="durationMs" defaultValue={String(scroll.durationMs)} className={field}>
                {speeds.map((s) => (
                  <option key={s.ms} value={s.ms}>
                    {s.label} ({s.ms}ms)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Animation curve">
              <select name="easing" defaultValue={scroll.easing} className={field}>
                <option value="smootherstep">Smootherstep — buttery (recommended)</option>
                <option value="easeInOut">Ease in-out</option>
                <option value="easeOut">Ease out</option>
                <option value="linear">Linear</option>
              </select>
            </Field>
            <p className="text-xs text-tertiary">
              Speed &amp; curve apply to the paged glide. “Instant snap” jumps immediately; “Native” disables the paged deck.
            </p>
            <SubmitButton>Save scroll</SubmitButton>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
