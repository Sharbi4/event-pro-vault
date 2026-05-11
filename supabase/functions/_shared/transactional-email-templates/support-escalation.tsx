import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, styles } from './_brand.tsx'

interface TranscriptLine { role: string; content: string }

interface Props {
  userName?: string
  userEmail?: string
  reason?: string
  transcript?: TranscriptLine[]
}

const Email = ({ userName, userEmail, reason, transcript = [] }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Event Pro Support escalation from {userName ?? 'a customer'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>New support escalation</Heading>
        <Section style={styles.card}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{userName ?? 'Unknown'} ({userEmail ?? 'no email'})</Text>
          <Text style={{ ...styles.label, marginTop: '14px' }}>Reason</Text>
          <Text style={styles.value}>{reason ?? 'No reason provided'}</Text>
        </Section>
        {transcript.length > 0 && (
          <Section style={styles.card}>
            <Text style={styles.label}>Conversation transcript</Text>
            {transcript.map((m, i) => (
              <Text key={i} style={{ ...styles.value, marginTop: i === 0 ? 0 : '10px' }}>
                <strong>{m.role === 'user' ? (userName ?? 'Customer') : 'Assistant'}:</strong> {m.content}
              </Text>
            ))}
          </Section>
        )}
        <Text style={styles.footer}>— {SITE_NAME} Support</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `Support escalation from ${data.userName ?? 'a customer'}`,
  displayName: 'Support escalation (internal)',
  previewData: {
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    reason: 'Customer needs help with a refund.',
    transcript: [
      { role: 'user', content: 'I want a refund for booking #123.' },
      { role: 'assistant', content: "I can't process refunds — forwarding to support." },
    ],
  },
} satisfies TemplateEntry
