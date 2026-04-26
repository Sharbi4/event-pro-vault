/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL =
  'https://nswjmgrqgvgxlchefeca.supabase.co/storage/v1/object/public/email-assets/eventpro-logo.png'
const BRAND = 'EventPros'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {BRAND}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt={BRAND} width="140" style={logo} />
        </Section>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You asked to change the email on your {BRAND} account from{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          . Confirm below to make it official.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Confirm email change
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Didn't request this? Secure your account right away.
        </Text>
        <Text style={footerBrand}>{BRAND} · by Vendibook</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const logoSection = { marginBottom: '28px' }
const logo = { display: 'block' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#000000',
  letterSpacing: '-0.01em',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#000000',
  lineHeight: '1.55',
  margin: '0 0 24px',
}
const link = { color: '#000000', textDecoration: 'underline' }
const buttonSection = { margin: '0 0 24px' }
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e5e5e5', margin: '32px 0 20px' }
const footer = { fontSize: '13px', color: '#666666', margin: '0 0 8px' }
const footerBrand = { fontSize: '12px', color: '#999999', margin: '0' }
