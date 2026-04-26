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
  paymentMethod?: string
  bookingId?: string
}

const BookingConfirmationEmail = ({
  customerName, vendorName, packageName, eventDate, eventLocation,
  units, unitType, totalPrice, paymentMethod, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your booking with {vendorName ?? 'your Event Pro'} is confirmed</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>You're booked! 🎉</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, your booking with{' '}
          <strong>{vendorName ?? 'your Event Pro'}</strong> is confirmed.
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
          <Text style={styles.label}>Total</Text>
          <Text style={styles.valueLarge}>{formatPrice(totalPrice)}</Text>

          {paymentMethod === 'cash' && (
            <Text style={styles.muted}>Payment: cash, due at the event.</Text>
          )}
        </Section>

        <Text style={styles.text}>
          You can chat with {vendorName ?? 'your Event Pro'} directly in the app
          to coordinate details. We'll send a reminder before your event.
        </Text>

        {bookingId && (
          <Text style={styles.footer}>Booking ref: {bookingId}</Text>
        )}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: (d: Record<string, any>) =>
    `Booking confirmed${d.vendorName ? ` with ${d.vendorName}` : ''}`,
  displayName: 'Booking confirmation',
  previewData: {
    customerName: 'Jane',
    vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50',
    eventDate: '2026-06-15',
    eventLocation: '123 Main St, Brooklyn, NY',
    units: 50,
    unitType: 'guest',
    totalPrice: 1250,
    paymentMethod: 'stripe',
    bookingId: 'abc123',
  },
} satisfies TemplateEntry
