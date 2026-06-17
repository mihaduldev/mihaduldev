import {
  Server,
  Cloud,
  Sparkles,
  GraduationCap,
  Layout,
  Database,
  Boxes,
  Shuffle,
  ShieldCheck,
  Workflow,
  FileText,
  Code2,
  Briefcase,
  Smartphone,
  Github,
  Linkedin,
  Mail,
  Globe,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Server,
  Cloud,
  Sparkles,
  GraduationCap,
  Layout,
  Database,
  Boxes,
  Shuffle,
  ShieldCheck,
  Workflow,
  FileText,
  Code2,
  Briefcase,
  Smartphone,
  Github,
  Linkedin,
  Mail,
  Globe,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = icons[name] ?? Sparkles;
  return <Cmp className={className} />;
}
