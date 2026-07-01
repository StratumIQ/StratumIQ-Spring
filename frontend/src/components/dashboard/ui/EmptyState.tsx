"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import Button from "./Button";
import GlassCard from "./GlassCard";

type Action =
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href: string; onClick?: never };

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: Action;
};

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <GlassCard className="d-empty-state" padding="lg">
      <div className="d-empty-state-icon" aria-hidden>
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="d-empty-state-title">{title}</h3>
      {description && <p className="d-empty-state-desc">{description}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button size="md">{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick} size="md">{action.label}</Button>
        ))}
    </GlassCard>
  );
}
