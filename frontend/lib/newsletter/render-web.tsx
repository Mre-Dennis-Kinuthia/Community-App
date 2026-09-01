"use client"

import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { HUB_CONTACT_EMAIL, HUB_MAILING_ADDRESS } from "@/lib/hub-contact"
import {
  resolveNewsletterBrand,
  type NewsletterBrand,
} from "./render-email"
import type { NewsletterSection } from "./section-schema"
import { NEWSLETTER_SECTION_ACCENTS } from "./section-schema"

function SectionShell({
  children,
  className = "",
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <section className={`mb-6 ${className}`} style={style}>
      {children}
    </section>
  )
}

function SectionView({
  section,
  brand,
  appBaseUrl,
}: {
  section: NewsletterSection
  brand: NewsletterBrand
  appBaseUrl: string
}) {
  switch (section.type) {
    case "header":
      return (
        <SectionShell className="border-b pb-4" style={{ borderColor: brand.border }}>
          {section.showLogo !== false ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/brand/impact-hub-nairobi-logo.png"
              alt="Impact Hub Nairobi"
              className="mb-3 h-10 w-auto"
            />
          ) : null}
          {section.eyebrow ? (
            <p
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: brand.primary }}
            >
              {section.eyebrow}
            </p>
          ) : null}
          {section.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.imageUrl}
              alt={section.alt || ""}
              className="mt-3 w-full rounded-lg object-cover"
            />
          ) : null}
        </SectionShell>
      )
    case "hero":
      return (
        <SectionShell>
          {section.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.imageUrl}
              alt=""
              className="mb-4 w-full rounded-xl object-cover"
            />
          ) : null}
          <h1
            className="mb-2 text-3xl font-bold tracking-tight"
            style={{ color: brand.text }}
          >
            {section.headline}
          </h1>
          {section.subcopy ? (
            <p className="mb-4 text-base leading-relaxed" style={{ color: brand.textMuted }}>
              {section.subcopy}
            </p>
          ) : null}
          {section.cta?.label && section.cta?.url ? (
            <a
              href={section.cta.url}
              className="inline-block rounded-lg px-6 py-3 text-sm font-bold text-white"
              style={{ background: brand.primary }}
            >
              {section.cta.label}
            </a>
          ) : null}
        </SectionShell>
      )
    case "text":
      return (
        <SectionShell>
          <div
            className="prose prose-sm max-w-none leading-relaxed"
            style={{ color: brand.text }}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        </SectionShell>
      )
    case "image":
      return (
        <SectionShell>
          {section.linkUrl ? (
            <a href={section.linkUrl}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.imageUrl}
                alt={section.alt || ""}
                className="w-full rounded-xl"
              />
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.imageUrl}
              alt={section.alt || ""}
              className="w-full rounded-xl"
            />
          )}
          {section.caption ? (
            <p className="mt-2 text-center text-sm" style={{ color: brand.textMuted }}>
              {section.caption}
            </p>
          ) : null}
        </SectionShell>
      )
    case "button":
      return (
        <SectionShell
          className={section.align === "left" ? "text-left" : "text-center"}
        >
          <a
            href={section.url}
            className="inline-block rounded-lg px-6 py-3 text-sm font-bold text-white"
            style={{ background: brand.primary }}
          >
            {section.label}
          </a>
        </SectionShell>
      )
    case "divider":
      return (
        <hr className="my-6 border-0 border-t" style={{ borderColor: brand.border }} />
      )
    case "spacer": {
      const h = section.size === "sm" ? 12 : section.size === "lg" ? 40 : 24
      return <div style={{ height: h }} />
    }
    case "columns":
      return (
        <SectionShell>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              {section.leftImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.leftImageUrl}
                  alt={section.leftAlt || ""}
                  className="mb-3 aspect-[4/3] w-full rounded-xl object-cover"
                />
              ) : null}
              {section.leftHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.leftHtml }}
                />
              ) : null}
            </div>
            <div>
              {section.rightImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.rightImageUrl}
                  alt={section.rightAlt || ""}
                  className="mb-3 aspect-[4/3] w-full rounded-xl object-cover"
                />
              ) : null}
              {section.rightHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.rightHtml }}
                />
              ) : null}
            </div>
          </div>
        </SectionShell>
      )
    case "news_card":
      return (
        <SectionShell>
          <div
            className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row"
            style={{ borderColor: brand.border, background: brand.footerBg }}
          >
            {section.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={section.imageUrl}
                alt=""
                className="h-28 w-full rounded-lg object-cover sm:w-40"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: brand.primary }}
              >
                From the news
              </p>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brand.text }}>
                {section.url ? (
                  <Link href={section.url}>{section.title || "Community news"}</Link>
                ) : (
                  section.title || "Community news"
                )}
              </h3>
              {section.excerpt ? (
                <p className="mb-2 text-sm" style={{ color: brand.textMuted }}>
                  {section.excerpt}
                </p>
              ) : null}
              {section.url ? (
                <Link
                  href={section.url}
                  className="text-sm font-bold"
                  style={{ color: brand.primary }}
                >
                  Read more →
                </Link>
              ) : null}
            </div>
          </div>
        </SectionShell>
      )
    case "section_heading": {
      const accent =
        NEWSLETTER_SECTION_ACCENTS[section.accent ?? "maroon"] ??
        NEWSLETTER_SECTION_ACCENTS.maroon
      return (
        <SectionShell className="mb-5">
          <div className="h-2 w-full rounded-full" style={{ background: accent.bar }} />
          <p
            className="mt-3 text-[13px] font-bold uppercase tracking-[0.16em]"
            style={{ color: accent.label }}
          >
            {section.label}
          </p>
        </SectionShell>
      )
    }
    case "event_card": {
      const meta = [section.dateLine, section.location].filter(Boolean).join(" · ")
      return (
        <SectionShell>
          <div
            className="flex flex-col gap-4 overflow-hidden rounded-xl border sm:flex-row"
            style={{ borderColor: brand.border, background: brand.footerBg }}
          >
            {section.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={section.imageUrl}
                alt=""
                className="h-40 w-full object-cover sm:h-auto sm:w-48"
              />
            ) : null}
            <div className="min-w-0 flex-1 p-4">
              {section.kicker ? (
                <p
                  className="mb-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: brand.primary }}
                >
                  {section.kicker}
                </p>
              ) : null}
              <h3 className="mb-1 text-lg font-semibold" style={{ color: brand.text }}>
                {section.title}
              </h3>
              {meta ? (
                <p className="mb-2 text-sm font-semibold" style={{ color: brand.primary }}>
                  {meta}
                </p>
              ) : null}
              {section.body ? (
                <p className="mb-3 text-sm leading-relaxed" style={{ color: brand.textMuted }}>
                  {section.body}
                </p>
              ) : null}
              {section.cta?.label && section.cta?.url ? (
                <a
                  href={section.cta.url}
                  className="inline-block rounded-lg px-4 py-2 text-xs font-bold text-white"
                  style={{ background: brand.primary }}
                >
                  {section.cta.label}
                </a>
              ) : null}
            </div>
          </div>
        </SectionShell>
      )
    }
    case "footer":
      return (
        <SectionShell className="border-t pt-6 text-center" style={{ borderColor: brand.border }}>
          <p className="mb-1 text-sm font-bold" style={{ color: brand.primaryDark }}>
            Impact Hub Nairobi
          </p>
          {section.note ? (
            <p className="mb-3 text-xs" style={{ color: brand.textMuted }}>
              {section.note}
            </p>
          ) : null}
          <p className="mb-3 text-[11px]" style={{ color: brand.textMuted }}>
            {HUB_MAILING_ADDRESS}
          </p>
          <p className="text-xs">
            <a href={appBaseUrl} className="font-semibold" style={{ color: brand.primary }}>
              Visit platform
            </a>
            <span className="mx-2 opacity-40">|</span>
            <a
              href={`mailto:${HUB_CONTACT_EMAIL}`}
              className="font-semibold"
              style={{ color: brand.primary }}
            >
              Contact
            </a>
          </p>
        </SectionShell>
      )
    default:
      return null
  }
}

export function NewsletterWebRenderer({
  sections,
  brandPrimary,
  brandAccent,
  appBaseUrl = "",
  className = "",
  /** Public archive: no nested “email card” chrome — page provides the frame. */
  variant = "card",
}: {
  sections: NewsletterSection[]
  brandPrimary?: string | null
  brandAccent?: string | null
  appBaseUrl?: string
  className?: string
  variant?: "card" | "article"
}) {
  const brand = resolveNewsletterBrand({ brandPrimary, brandAccent })
  const isArticle = variant === "article"

  return (
    <article
      className={
        isArticle
          ? `mx-auto w-full max-w-2xl ${className}`
          : `mx-auto max-w-[600px] rounded-xl border bg-white p-6 shadow-sm sm:p-8 ${className}`
      }
      style={
        isArticle
          ? { color: brand.text }
          : { borderColor: brand.border, background: brand.surface }
      }
    >
      {!isArticle ? (
        <div
          className="-mx-6 -mt-6 mb-6 h-1.5 rounded-t-xl sm:-mx-8 sm:-mt-8"
          style={{
            background: `linear-gradient(90deg, ${brand.primaryDark} 0%, ${brand.navy} 45%, ${brand.primary} 100%)`,
          }}
        />
      ) : null}
      {sections.map((section) => (
        <SectionView
          key={section.id}
          section={section}
          brand={brand}
          appBaseUrl={appBaseUrl}
        />
      ))}
    </article>
  )
}
