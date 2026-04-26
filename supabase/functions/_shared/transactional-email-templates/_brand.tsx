/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Img, Section } from 'npm:@react-email/components@0.0.22'

export const SITE_NAME = 'EventPros'
export const SITE_URL = 'https://eventpro.vendibook.com'
export const LOGO_URL =
  'https://nswjmgrqgvgxlchefeca.supabase.co/storage/v1/object/public/email-assets/eventpro-logo.png'

export const BrandHeader = () => (
  <Section style={{ textAlign: 'center' as const, padding: '0 0 24px' }}>
    <Img
      src={LOGO_URL}
      alt={SITE_NAME}
      width="140"
      style={{ display: 'block', margin: '0 auto' }}
    />
  </Section>
)

// Shared style tokens
export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  container: { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' },
  h1: {
    fontSize: '26px',
    fontWeight: 'bold' as const,
    color: '#0a0a0a',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '15px',
    color: '#3f3f46',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  card: {
    background: '#fafafa',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '8px 0 24px',
  },
  label: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: '#71717a',
    margin: '0 0 4px',
  },
  value: {
    fontSize: '15px',
    color: '#0a0a0a',
    margin: '0 0 4px',
    fontWeight: 500 as const,
  },
  valueLarge: {
    fontSize: '20px',
    color: '#0a0a0a',
    margin: '0',
    fontWeight: 600 as const,
  },
  hr: { borderColor: '#e5e5e5', margin: '14px 0' },
  muted: { fontSize: '13px', color: '#71717a', margin: '12px 0 0' },
  footer: { fontSize: '12px', color: '#a1a1aa', margin: '6px 0 0' },
  button: {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600 as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonSection: { textAlign: 'center' as const, margin: '8px 0 24px' },
}

export const formatDate = (d?: string) => {
  if (!d) return 'TBD'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

export const formatPrice = (p?: number) =>
  typeof p === 'number' ? `$${p.toFixed(2)}` : 'TBD'
