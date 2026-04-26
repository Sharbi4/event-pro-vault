import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles } from './_brand.tsx'

interface Props {
  name?: string
  subject?: string
  message?: string
}

const Email = ({ name, subject, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reaching out to {SITE_NAME}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>
          {name ? `Thanks, ${name}!` : 'Thanks for reaching out!'}
        </Heading>
        <Text style={styles.text}>
          We received your message and our team will get back to you within 1 business day.
        </Text>
        {(subject || message) && (
          <Section style={styles.card}>
            {subject && (
              <>
                <Text style={styles.label}>Subject</Text>
                <Text style={styles.value}>{subject}</Text>
              </>
            )}
            {message && (
              <>
                <Text style={{ ...styles.label, marginTop: subject ? '14px' : 0 }}>Your message</Text>
                <Text style={styles.value}>{message}</Text>
              </>
            )}
          </Section>
        )}
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'We received your message',
  displayName: 'Contact form confirmation',
  previewData: {
    name: 'Jane', subject: 'Question about pricing',
    message: 'Hi! I have a question about your service fees...',
  },
} satisfies TemplateEntry
