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
  reviewUrl?: string
  bookingId?: string
}

const Email = ({ customerName, vendorName, packageName, reviewUrl, bookingId }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>How was your experience with {vendorName ?? 'your Event Pro'}?</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>How did it go? ⭐</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, hope your event was a hit! Your honest review
          helps other planners and supports{' '}
          <strong>{vendorName ?? 'your Event Pro'}</strong>.
        </Text>
        <Text style={styles.text}>
          It only takes a minute.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={reviewUrl ?? `${SITE_URL}/dashboard/customer`}>
            Leave a review
          </Button>
        </Section>
        {packageName && (
          <Text style={styles.muted}>For: {packageName}</Text>
        )}
        {bookingId && <Text style={styles.footer}>Booking ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `How was ${d.vendorName ?? 'your Event Pro'}?`,
  displayName: 'Review request',
  previewData: {
    customerName: 'Jane', vendorName: 'Sunset Catering Co.',
    packageName: 'Taco Bar for 50',
    reviewUrl: 'https://eventpro.vendibook.com/dashboard/customer',
    bookingId: 'abc123',
  },
} satisfies TemplateEntry
