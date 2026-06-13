import { type ReactNode } from "react";

import OnboardingShell from "./OnboardingShell";
import OnboardingHeader from "./OnboardingHeader";
import BodySlot from "./BodySlot";
import ActionFooter, { type Action } from "./ActionFooter";

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
