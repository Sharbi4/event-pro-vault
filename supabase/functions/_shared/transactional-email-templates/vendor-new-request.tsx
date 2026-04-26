import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, SITE_URL, styles, formatDate, formatPrice } from './_brand.tsx'

interface Props {
  vendorName?: string
  customerName?: string
  packageName?: string
  eventDate?: string
  eventLocation?: string
  totalPrice?: number
  bookingId?: string
  responseDeadline?: string
}

const Email = ({
  vendorName, customerName, packageName, eventDate, eventLocation,
  totalPrice, bookingId, responseDeadline,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking request from {customerName ?? 'a customer'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>New booking request 🎯</Heading>
        <Text style={styles.text}>
          Hi {vendorName ?? 'there'}, you've got a new booking request from{' '}
          <strong>{customerName ?? 'a customer'}</strong>. Respond within 48 hours
          to keep your acceptance rate strong.
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
          {typeof totalPrice === 'number' && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Estimated payout</Text>
              <Text style={styles.valueLarge}>{formatPrice(totalPrice)}</Text>
            </>
          )}
          {responseDeadline && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Respond by</Text>
              <Text style={styles.value}>{formatDate(responseDeadline)}</Text>
            </>
          )}
        </Section>

        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={`${SITE_URL}/dashboard/vendor`}>
            Review request
          </Button>
        </Section>

        {bookingId && <Text style={styles.footer}>Request ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `New request${d.customerName ? ` from ${d.customerName}` : ''}`,
  displayName: 'New booking request (vendor)',
  previewData: {
    vendorName: 'Sunset Catering Co.', customerName: 'Jane Doe',
    packageName: 'Taco Bar for 50', eventDate: '2026-06-15',
    eventLocation: '123 Main St, Brooklyn, NY', totalPrice: 1250,
    bookingId: 'abc123', responseDeadline: '2026-04-28',
  },
} satisfies TemplateEntry
