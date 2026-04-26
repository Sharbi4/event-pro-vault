import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles, formatDate, formatPrice } from './_brand.tsx'

interface Props {
  customerName?: string
  packageName?: string
  vendorName?: string
  refundAmount?: number
  refundDate?: string
  reason?: string
  bookingId?: string
  arrivalEstimate?: string
}

const Email = ({
  customerName, packageName, vendorName, refundAmount, refundDate,
  reason, bookingId, arrivalEstimate,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Refund issued: {formatPrice(refundAmount)}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Refund issued</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, we've issued a refund for{' '}
          <strong>{packageName ?? 'your booking'}</strong>
          {vendorName ? ` with ${vendorName}` : ''}.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Refund amount</Text>
          <Text style={styles.valueLarge}>{formatPrice(refundAmount)}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.label}>Issued</Text>
          <Text style={styles.value}>{formatDate(refundDate)}</Text>
          {arrivalEstimate && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Expected arrival</Text>
              <Text style={styles.value}>{arrivalEstimate}</Text>
            </>
          )}
          {reason && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Reason</Text>
              <Text style={styles.value}>{reason}</Text>
            </>
          )}
        </Section>

        <Text style={styles.muted}>
          Refunds usually take 5–10 business days to appear, depending on your card issuer.
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
    `Refund issued: ${formatPrice(d.refundAmount)}`,
  displayName: 'Refund issued',
  previewData: {
    customerName: 'Jane', packageName: 'Taco Bar for 50',
    vendorName: 'Sunset Catering Co.', refundAmount: 625,
    refundDate: '2026-04-22', arrivalEstimate: '5–10 business days',
    reason: 'Booking cancelled within Flexible policy window.',
    bookingId: 'abc123',
  },
} satisfies TemplateEntry
