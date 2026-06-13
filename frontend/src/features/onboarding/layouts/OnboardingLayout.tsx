import { type ReactNode } from "react";

import OnboardingShell from "../components/OnboardingShell";
import OnboardingHeader from "../components/OnboardingHeader";
import BodySlot from "../components/BodySlot";
import ActionFooter, { type Action } from "../components/ActionFooter";
import ErrorActions from "@/shared/components/errors/ErrorActions";

type OnboardingVariant = "hero" | "form" | "cards";

type OnboardingLayoutProps = {
  variant?: OnboardingVariant;
  showHeader?: boolean;
  source: { uri: string } | number;
  title: string;
  subtitle?: string;
  heroSize?: "sm" | "md" | "lg";
  bodyCentered?: boolean;
  bodyGrow?: boolean;
  children?: ReactNode;
  actions: Action[];
  footerTopSpacing?: boolean;
  footerChildren?: ReactNode;
};

export default function OnboardingLayout({
  variant = "hero",
  showHeader = true,
  source,
  title,
  subtitle,
  heroSize = "md",
  bodyCentered = true,
  bodyGrow = true,
  children,
  actions,
  footerTopSpacing = true,
  footerChildren,
}: OnboardingLayoutProps) {
  return (
    <OnboardingShell variant={variant} showHeader={showHeader}>
      <OnboardingHeader
        source={source}
        title={title}
        subtitle={subtitle}
        size={heroSize}
      />
      <BodySlot centered={bodyCentered} grow={bodyGrow}>
        {children}
      </BodySlot>
      <ActionFooter actions={actions} topSpacing={footerTopSpacing} />
      {footerChildren}
    </OnboardingShell>
  );
}
