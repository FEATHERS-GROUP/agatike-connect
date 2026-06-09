import { ReactNode } from "react";

export type Template =
  | "concert"
  | "concert-1"
  | "concert-2"
  | "movie"
  | "movie-1"
  | "movie-2"
  | "experience"
  | "experience-1"
  | "experience-2"
  | "conference"
  | "conference-1"
  | "conference-2"
  | "entrance"
  | "entrance-1"
  | "entrance-2";

export type TicketLayout = {
  titleSize: number;
  subtitleSize: number;
  metaSize: number;
  titleAlign: "left" | "center" | "right";
  titleOffsetY: number;
  subtitleOffsetY: number;
  metaOffsetY: number;
};

export type TicketBack = {
  backText: string;
  backImage: string;
  backImageOpacity: number;
};

export interface TicketPreviewProps {
  template: Template;
  palette: { from: string; to: string; name: string };
  font: { css: string; name: string };
  tier: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  currency: string;
  cover: string;
  logoText: string;
  logoImage?: string;
  logoScale: number;
  logoOpacity: number;
  logoColorMode: string;
  orderId: string;
  qrValue?: string;
  previewMode: "Front" | "Back" | "Mobile";
  onLogoClick?: () => void;
  layout: TicketLayout;
  back: TicketBack;
}

export interface TemplateProps extends TicketPreviewProps {
  isBack?: boolean;
  BackSide?: ReactNode;
  Stub?: ReactNode;
  Perf?: ReactNode;
  Cell: React.FC<{ label: string; value: string }>;
}

export const DEFAULT_TERMS_HTML = `<p><strong>Terms &amp; Conditions</strong></p><p>• Ticket is non-refundable and non-transferable.</p><p>• Organizer reserves the right to refuse entry.</p><p>• Retain this ticket for the duration of the event.</p>`;
export const DEFAULT_EXPERIENCE_BACK_HTML = `<p><strong>What's Included</strong></p><p>• Professional certified guide</p><p>• All safety equipment &amp; gear</p><p>• Pickup &amp; drop-off service</p><p>• Refreshments during activity</p><p>• Insurance coverage</p><p>• Photo/video of experience</p>`;
