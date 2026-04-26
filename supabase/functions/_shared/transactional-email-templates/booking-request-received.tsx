import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EventPros'

interface Props {
  customerName?: string
  vendorName?: string
  packageName?: string
  eventDate?: string
  eventLocation?: string
  units?: number
  unitType?: string
  totalPrice?: number
  bookingId?: string
}

const formatDate = (d?: string) => {
  if (!d) return 'TBD'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return d }
}

const formatPrice = (p?: number) =>
  typeof p === 'number' ? `$${p.toFixed(2)}` : 'TBD'

const BookingRequestEmail = ({
  customerName, vendorName, packageName, eventDate, eventLocation,
  units, unitType, totalPrice, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've sent your request to {vendorName ?? 'your Event Pro'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Request sent ✨</Heading>
        <Text style={text}>
          Hi {customerName ?? 'there'}, thanks for booking through {SITE_NAME}.
          We've sent your request to <strong>{vendorName ?? 'your Event Pro'}</strong>{' '}
          and you'll hear back shortly.
        </Text>

        <Section style={card}>
          <Text style={label}>Package</Text>
          <Text style={value}>{packageName ?? 'Your package'}</Text>

          <Hr style={hr} />
          <Text style={label}>Event date</Text>
          <Text style={value}>{formatDate(eventDate)}</Text>

          {eventLocation && (
            <>
              <Hr style={hr} />
              <Text style={label}>Location</Text>
              <Text style={value}>{eventLocation}</Text>
            </>
          )}

          {units ? (
            <>
              <Hr style={hr} />
              <Text style={label}>Quantity</Text>
              <Text style={value}>{units} {unitType ?? 'unit'}{units > 1 ? 's' : ''}</Text>
            </>
          ) : null}

          <Hr style={hr} />
          <Text style={label}>Estimated total</Text>
          <Text style={valueLarge}>{formatPrice(totalPrice)}</Text>
        </Section>

        <Text style={text}>
          You won't be charged until {vendorName ?? 'the Event Pro'} accepts
          your request. We'll email you the moment they respond.
        </Text>

        {bookingId && <Text style={footer}>Request ref: {bookingId}</Text>}
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingRequestEmail,
  subject: (d: Record<string, any>) =>
    `Request sent${d.vendorName ? ` to ${d.vendorName}` : ''}`,
  displayName: 'Booking request received',
  previewData: {
    customerName: 'Jane',
    vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50',
    eventDate: '2026-06-15',
    eventLocation: '123 Main St, Brooklyn, NY',
    units: 50,
    unitType: 'guest',
    totalPrice: 1250,
    bookingId: 'abc123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 20px' }
const card = { background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px 24px', margin: '8px 0 24px' }
const label = { fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: '#71717a', margin: '0 0 4px' }
const value = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 4px', fontWeight: 500 as const }
const valueLarge = { fontSize: '20px', color: '#0a0a0a', margin: '0', fontWeight: 600 as const }
const hr = { borderColor: '#e5e5e5', margin: '14px 0' }
const footer = { fontSize: '12px', color: '#a1a1aa', margin: '6px 0 0' }
