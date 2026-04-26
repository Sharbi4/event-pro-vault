import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles, formatDate, formatPrice } from './_brand.tsx'

interface Props {
  vendorName?: string
  payoutAmount?: number
  payoutDate?: string
  packageName?: string
  customerName?: string
  arrivalEstimate?: string
  bookingId?: string
}

const Email = ({
  vendorName, payoutAmount, payoutDate, packageName, customerName, arrivalEstimate, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your payout of {formatPrice(payoutAmount)} is on the way</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>You've been paid 💸</Heading>
        <Text style={styles.text}>
          Hi {vendorName ?? 'there'}, great work — your payout has been initiated.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Payout amount</Text>
          <Text style={styles.valueLarge}>{formatPrice(payoutAmount)}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.label}>Sent</Text>
          <Text style={styles.value}>{formatDate(payoutDate)}</Text>
          {arrivalEstimate && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Expected arrival</Text>
              <Text style={styles.value}>{arrivalEstimate}</Text>
            </>
          )}
          {packageName && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>For</Text>
              <Text style={styles.value}>
                {packageName}{customerName ? ` — ${customerName}` : ''}
              </Text>
            </>
          )}
        </Section>

        <Text style={styles.muted}>
          Funds typically arrive in 1–2 business days, depending on your bank.
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
    `Payout sent: ${formatPrice(d.payoutAmount)}`,
  displayName: 'Payout sent',
  previewData: {
    vendorName: 'Sunset Catering Co.', payoutAmount: 1088.75,
    payoutDate: '2026-06-16', packageName: 'Taco Bar for 50',
    customerName: 'Jane Doe', arrivalEstimate: '1–2 business days',
    bookingId: 'abc123',
  },
} satisfies TemplateEntry
