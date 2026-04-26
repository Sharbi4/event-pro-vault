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
  balanceAmount?: number
  dueDate?: string
  bookingId?: string
  paymentUrl?: string
}

const Email = ({
  customerName, packageName, vendorName, balanceAmount, dueDate, bookingId, paymentUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Balance due: {formatPrice(balanceAmount)}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Your balance is due</Heading>
        <Text style={styles.text}>
          Hi {customerName ?? 'there'}, your remaining balance for{' '}
          <strong>{packageName ?? 'your booking'}</strong>
          {vendorName ? ` with ${vendorName}` : ''} is ready to pay.
        </Text>

        <Section style={styles.card}>
          <Text style={styles.label}>Balance amount</Text>
          <Text style={styles.valueLarge}>{formatPrice(balanceAmount)}</Text>
          {dueDate && (
            <>
              <Hr style={styles.hr} />
              <Text style={styles.label}>Due by</Text>
              <Text style={styles.value}>{formatDate(dueDate)}</Text>
            </>
          )}
        </Section>

        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={paymentUrl ?? `${SITE_URL}/dashboard/customer`}>
            Pay balance
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
  subject: 'Balance due for your booking',
  displayName: 'Balance due',
  previewData: {
    customerName: 'Jane', packageName: 'Taco Bar for 50',
    vendorName: 'Sunset Catering Co.', balanceAmount: 625, dueDate: '2026-06-14',
    bookingId: 'abc123', paymentUrl: 'https://eventpro.vendibook.com/booking/pay/abc',
  },
} satisfies TemplateEntry
