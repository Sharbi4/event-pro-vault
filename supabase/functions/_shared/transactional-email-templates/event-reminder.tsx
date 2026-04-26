import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles, formatDate } from './_brand.tsx'

interface Props {
  customerName?: string
  vendorName?: string
  packageName?: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  vendorPhone?: string
  bookingId?: string
}

const Email = ({
  customerName, vendorName, packageName, eventDate, eventTime,
  eventLocation, vendorPhone, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your event with {vendorName ?? 'your Event Pro'} is tomorrow</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Your event is almost here ⏰</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, just a heads-up that{' '}
          <strong>{packageName ?? 'your booking'}</strong>
          {vendorName ? ` with ${vendorName}` : ''} is coming up.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>When</Text>
          <Text style={styles.value}>
            {formatDate(eventDate)}{eventTime ? ` · ${eventTime}` : ''}
          </Text>
          {eventLocation && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Where</Text>
              <Text style={styles.value}>{eventLocation}</Text>
            </>
          )}
          {vendorPhone && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Vendor contact</Text>
              <Text style={styles.value}>{vendorPhone}</Text>
            </>
          )}
        </Section>

        <Text style={styles.text}>
          Have questions? Message {vendorName ?? 'your Event Pro'} directly in the app.
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
    `Reminder: ${d.packageName ?? 'your event'} on ${formatDate(d.eventDate)}`,
  displayName: 'Event reminder',
  previewData: {
    customerName: 'Jane', vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50', eventDate: '2026-06-15',
    eventTime: '5:00 PM', eventLocation: '123 Main St, Brooklyn, NY',
    vendorPhone: '+1 (555) 123-4567', bookingId: 'abc123',
  },
} satisfies TemplateEntry
