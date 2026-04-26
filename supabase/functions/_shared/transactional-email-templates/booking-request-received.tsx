import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles, formatDate, formatPrice } from './_brand.tsx'

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

const BookingRequestEmail = ({
  customerName, vendorName, packageName, eventDate, eventLocation,
  units, unitType, totalPrice, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've sent your request to {vendorName ?? 'your Event Pro'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Request sent ✨</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, thanks for booking through {SITE_NAME}.
          We've sent your request to <strong>{vendorName ?? 'your Event Pro'}</strong>{' '}
          and you'll hear back shortly.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Package</Text>
          <Text style={styles.value}>{packageName ?? 'Your package'}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.label}>Event date</Text>
          <Text style={styles.value}>{formatDate(eventDate)}</Text>
          {eventLocation && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{eventLocation}</Text>
            </>
          )}
          {units ? (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.value}>{units} {unitType ?? 'unit'}{units > 1 ? 's' : ''}</Text>
            </>
          ) : null}
          <Hr style={styles.hr} />
          <Text style={styles.label}>Estimated total</Text>
          <Text style={styles.valueLarge}>{formatPrice(totalPrice)}</Text>
        </Section>

        <Text style={styles.text}>
          You won't be charged until {vendorName ?? 'the Event Pro'} accepts
          your request. We'll email you the moment they respond.
        </Text>

        {bookingId && <Text style={styles.footer}>Request ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
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
