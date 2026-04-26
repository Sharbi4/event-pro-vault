import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandHeader, SITE_NAME, SITE_URL, styles } from './_brand.tsx'

interface Props {
  recipientName?: string
  senderName?: string
  preview?: string
  conversationUrl?: string
}

const Email = ({ recipientName, senderName, preview, conversationUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New message from {senderName ?? 'someone'} on {SITE_NAME}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>You've got a new message 💬</Heading>
        <Text style={styles.text}>
          Hi {recipientName ?? 'there'}, <strong>{senderName ?? 'someone'}</strong> just
          sent you a message on {SITE_NAME}.
        </Text>
        {preview && (
          <Section style={styles.card}>
            <Text style={styles.label}>Message</Text>
            <Text style={styles.value}>"{preview}"</Text>
          </Section>
        )}
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={conversationUrl ?? `${SITE_URL}/messages`}>
            Open conversation
          </Button>
        </Section>
        <Text style={styles.muted}>
          Tip: keep all communication in the app for your protection.
        </Text>
        <Text style={styles.footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `New message from ${d.senderName ?? 'a user'}`,
  displayName: 'Message received',
  previewData: {
    recipientName: 'Jane', senderName: 'Sunset Catering Co.',
    preview: 'Hi! Just confirming the menu choices for Saturday...',
    conversationUrl: 'https://eventpro.vendibook.com/messages',
  },
} satisfies TemplateEntry
