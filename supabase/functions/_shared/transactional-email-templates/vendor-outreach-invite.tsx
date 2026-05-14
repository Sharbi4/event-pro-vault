import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Img, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EventPro by Vendibook'
const SITE_URL = 'https://eventpro.vendibook.com'
const LOGO_URL =
  'https://nswjmgrqgvgxlchefeca.supabase.co/storage/v1/object/public/email-assets/eventpro-logo.png'

interface Props {
  businessName?: string
  area?: string
}

const VendorOutreachInviteEmail = ({ businessName, area }: Props) => {
  const greeting = businessName ? `Hey ${businessName} team,` : 'Hey there,'
  const region = area || 'Arizona'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Get booked for events with EventPro by Vendibook</Preview>
      <Body style={main}>
        <Container style={card}>

          {/* Logo header */}
          <Section style={{ textAlign: 'center', padding: '40px 32px 24px', backgroundColor: '#ffffff' }}>
            <Img
              src={LOGO_URL}
              alt={SITE_NAME}
              width="180"
              style={{ display: 'block', margin: '0 auto', width: '180px', height: 'auto' }}
            />
          </Section>

          {/* Accent divider */}
          <Section style={{ padding: '0 32px' }}>
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, #2563eb 0%, #0a0a0a 100%)',
              borderRadius: '2px',
            }} />
          </Section>

          {/* Headline */}
          <Section style={{ padding: '32px 40px 8px' }}>
            <Heading style={h1}>
              Get booked for events — from one dedicated platform.
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '8px 40px 0' }}>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              I wanted to reach out because we recently launched{' '}
              <strong style={{ color: '#0a0a0a' }}>EventPro by Vendibook</strong>{' '}
              — a new marketplace built specifically for mobile food businesses,
              food trucks, trailers, mobile bartenders, dessert vendors, and
              other food service pros.
            </Text>
            <Text style={{ ...text, fontWeight: 600, color: '#0a0a0a' }}>
              The goal is simple:
            </Text>
            <Text style={text}>
              Help mobile food vendors get booked for private events, parties,
              corporate catering, weddings, festivals, and pop-ups — all from
              one dedicated platform.
            </Text>
          </Section>

          {/* Benefits card */}
          <Section style={{ padding: '8px 40px' }}>
            <div style={benefitsCard}>
              <Text style={benefitsLabel}>What you get on EventPro</Text>
              <Text style={benefit}><span style={arrow}>→</span>&nbsp;&nbsp;Your own dedicated booking page</Text>
              <Text style={benefit}><span style={arrow}>→</span>&nbsp;&nbsp;Online booking inquiries from customers actively searching</Text>
              <Text style={benefit}><span style={arrow}>→</span>&nbsp;&nbsp;Showcase photos, menus, packages, pricing &amp; availability</Text>
              <Text style={benefit}><span style={arrow}>→</span>&nbsp;&nbsp;Exposure for birthdays, weddings, office &amp; school events</Text>
              <Text style={benefit}><span style={arrow}>→</span>&nbsp;&nbsp;A professional online presence customers can share</Text>
              <Text style={{ ...benefit, marginBottom: 0 }}><span style={arrow}>→</span>&nbsp;&nbsp;Accept online payments and deposits</Text>
            </div>
          </Section>

          {/* Continued */}
          <Section style={{ padding: '24px 40px 0' }}>
            <Text style={text}>
              We noticed there really isn't a true marketplace focused
              specifically on mobile food professionals and event-based food
              vendors — so we built one.
            </Text>
            <Text style={text}>
              Right now we're onboarding early vendors in{' '}
              <strong style={{ color: '#0a0a0a' }}>{region}</strong> and would
              love to feature your business on the platform.
            </Text>
            <Text style={{ ...text, fontSize: '18px', fontWeight: 700, color: '#0a0a0a', margin: '20px 0 8px' }}>
              Getting listed is free.
            </Text>
            <Text style={text}>
              As EventPro grows, early vendors will naturally have a major
              advantage with visibility, reviews, and booking history on the
              platform.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', padding: '8px 40px 32px' }}>
            <Button href={SITE_URL} style={button}>
              Create your free profile →
            </Button>
            <Text style={{ margin: '14px 0 0', fontSize: '13px', color: '#71717a' }}>
              or visit{' '}
              <a href={SITE_URL} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                eventpro.vendibook.com
              </a>
            </Text>
          </Section>

          {/* Signature */}
          <Section style={{ padding: '0 40px 36px' }}>
            <Text style={{ ...text, margin: 0 }}>Would love to have you on board.</Text>
            <Text style={{ margin: '18px 0 0', fontSize: '15px', color: '#0a0a0a' }}>
              <strong>Shawnna</strong><br />
              <span style={{ color: '#71717a', fontSize: '14px' }}>Founder, Vendibook / EventPro</span>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={{ margin: '0 0 6px', fontSize: '12px', color: '#71717a' }}>
              EventPro by Vendibook · Arizona's marketplace for mobile food pros
            </Text>
            <Text style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>
              <a href={SITE_URL} style={{ color: '#71717a', textDecoration: 'none' }}>
                eventpro.vendibook.com
              </a>
              {' · '}
              <a href="tel:+17257559598" style={{ color: '#71717a', textDecoration: 'none' }}>
                +1 (725) 755-9598
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const main = {
  margin: 0,
  padding: '32px 16px',
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}
const card = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}
const h1 = {
  margin: 0,
  fontSize: '26px',
  lineHeight: '1.25',
  fontWeight: 700,
  color: '#0a0a0a',
  letterSpacing: '-0.01em',
}
const text = {
  margin: '16px 0',
  fontSize: '15px',
  lineHeight: '1.65',
  color: '#3f3f46',
}
const benefitsCard = {
  background: '#fafafa',
  border: '1px solid #e5e5e5',
  borderRadius: '12px',
  padding: '24px 28px',
}
const benefitsLabel = {
  margin: '0 0 14px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#2563eb',
}
const benefit = {
  margin: '0 0 8px',
  fontSize: '14.5px',
  lineHeight: '1.6',
  color: '#0a0a0a',
}
const arrow = { color: '#2563eb', fontWeight: 700 }
const button = {
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  padding: '16px 36px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e5e5e5',
  padding: '24px 40px',
  textAlign: 'center' as const,
}

export const template = {
  component: VendorOutreachInviteEmail,
  subject: 'Get booked for events with EventPro by Vendibook',
  displayName: 'Vendor outreach invite',
  previewData: { businessName: 'Modern Tortilla', area: 'Phoenix' },
} satisfies TemplateEntry
