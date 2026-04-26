import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, SITE_URL, styles, formatDate, formatPrice } from './_brand.tsx'

interface Props {
  customerName?: string
  packageName?: string
  vendorName?: string
  amountDue?: number
  dueDate?: string
  bookingId?: string
  paymentUrl?: string
}

const Email = ({
  customerName, packageName, vendorName, amountDue, dueDate, bookingId, paymentUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Friendly reminder: payment due {formatDate(dueDate)}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Payment reminder</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, just a friendly reminder that your payment for{' '}
          <strong>{packageName ?? 'your booking'}</strong>
          {vendorName ? ` with ${vendorName}` : ''} is coming up.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Amount due</Text>
          <Text style={styles.valueLarge}>{formatPrice(amountDue)}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.label}>Due by</Text>
          <Text style={styles.value}>{formatDate(dueDate)}</Text>
        </Section>

        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={paymentUrl ?? `${SITE_URL}/dashboard/customer`}>
            Pay now
          </Button>
        </Section>

        {bookingId && <Text style={styles.footer}>Booking ref: {bookingId}</Text>}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Payment reminder',
  displayName: 'Payment reminder',
  previewData: {
    customerName: 'Jane', packageName: 'Taco Bar for 50',
    vendorName: 'Sunset Catering Co.', amountDue: 625, dueDate: '2026-06-08',
    bookingId: 'abc123', paymentUrl: 'https://eventpro.vendibook.com/dashboard/customer',
  },
} satisfies TemplateEntry
