import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, SITE_URL, styles } from './_brand.tsx'

interface Props {
  customerName?: string
  vendorName?: string
  packageName?: string
  reason?: string
  bookingId?: string
}

const Email = ({ customerName, vendorName, packageName, reason, bookingId }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Update on your booking request</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Your request wasn't accepted</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, unfortunately{' '}
          <strong>{vendorName ?? 'the Event Pro'}</strong> wasn't able to accept your
          request{packageName ? ` for ${packageName}` : ''}.
        </Text>
        {reason && (
          <Section style={styles.card}>
            <Text style={styles.label}>Note from the Event Pro</Text>
            <Text style={styles.value}>{reason}</Text>
          </Section>
        )}
        <Text style={styles.text}>
          No charge was made. The good news? There are plenty of other Event Pros
          available for your date.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={`${SITE_URL}/search`}>
            Find another Event Pro
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
  subject: 'Update on your booking request',
  displayName: 'Booking declined',
  previewData: {
    customerName: 'Jane', vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50',
    reason: 'Already booked another event that day.',
    bookingId: 'abc123',
  },
} satisfies TemplateEntry
