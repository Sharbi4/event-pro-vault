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
  amountPaid?: number
  paymentDate?: string
  paymentMethod?: string
  receiptId?: string
  bookingId?: string
}

const Email = ({
  customerName, packageName, vendorName, amountPaid, paymentDate,
  paymentMethod, receiptId, bookingId,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment received — {formatPrice(amountPaid)}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Payment received</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, thanks for your payment. Here's your receipt.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.valueLarge}>{formatPrice(amountPaid)}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(paymentDate)}</Text>
          {packageName && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>For</Text>
              <Text style={styles.value}>{packageName}{vendorName ? ` — ${vendorName}` : ''}</Text>
            </>
          )}
          {paymentMethod && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Method</Text>
              <Text style={styles.value}>{paymentMethod}</Text>
            </>
          )}
        </Section>

        {receiptId && <Text style={styles.footer}>Receipt: {receiptId}</Text>}
        {bookingId && <Text style={styles.footer}>Booking ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your payment receipt',
  displayName: 'Payment receipt',
  previewData: {
    customerName: 'Jane', packageName: 'Taco Bar for 50',
    vendorName: 'Sunset Catering Co.', amountPaid: 1250,
    paymentDate: '2026-04-20', paymentMethod: 'Visa ••4242',
    receiptId: 'rcpt_123', bookingId: 'abc123',
  },
} satisfies TemplateEntry
