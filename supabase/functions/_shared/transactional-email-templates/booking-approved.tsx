import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, SITE_URL, styles, formatDate, formatPrice } from './_brand.tsx'

interface Props {
  customerName?: string
  vendorName?: string
  packageName?: string
  eventDate?: string
  eventLocation?: string
  totalPrice?: number
  bookingId?: string
  paymentUrl?: string
}

const Email = ({
  customerName, vendorName, packageName, eventDate, eventLocation,
  totalPrice, bookingId, paymentUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{vendorName ?? 'Your Event Pro'} approved your request</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Great news — you're approved! ✅</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'},{' '}
          <strong>{vendorName ?? 'your Event Pro'}</strong> approved your request for{' '}
          <strong>{packageName ?? 'your package'}</strong>. To lock in your date, complete payment below.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Event date</Text>
          <Text style={styles.value}>{formatDate(eventDate)}</Text>
          {eventLocation && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{eventLocation}</Text>
            </>
          )}
          <Hr style={styles.hr} />
          <Text style={styles.label}>Amount due</Text>
          <Text style={styles.valueLarge}>{formatPrice(totalPrice)}</Text>
        </Section>

        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={paymentUrl ?? `${SITE_URL}/dashboard/customer`}>
            Complete payment
          </Button>
        </Section>

        <Text style={styles.muted}>
          Your date is held briefly. Pay soon to secure your booking.
        </Text>
        {bookingId && <Text style={styles.footer}>Booking ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Approved${d.vendorName ? ` by ${d.vendorName}` : ''} — payment required`,
  displayName: 'Booking approved',
  previewData: {
    customerName: 'Jane', vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50', eventDate: '2026-06-15',
    eventLocation: '123 Main St, Brooklyn, NY', totalPrice: 1250,
    bookingId: 'abc123', paymentUrl: 'https://eventpro.vendibook.com/dashboard/customer',
  },
} satisfies TemplateEntry
