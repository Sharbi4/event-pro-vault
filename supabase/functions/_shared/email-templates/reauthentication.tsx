/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL =
  'https://nswjmgrqgvgxlchefeca.supabase.co/storage/v1/object/public/email-assets/eventpro-logo.png'
const BRAND = 'EventPros'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt={BRAND} width="140" style={logo} />
        </Section>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>Use this code to verify your identity:</Text>
        <Section style={codeSection}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          The code expires shortly. Didn't request it? You can ignore this email.
        </Text>
        <Text style={footerBrand}>{BRAND} · by Vendibook</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
  margin: '0 0 16px',
}
const codeSection = {
  backgroundColor: '#f5f5f5',
  borderRadius: '16px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
const codeStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#000000',
  letterSpacing: '0.2em',
  margin: '0',
}
const hr = { borderColor: '#e5e5e5', margin: '32px 0 20px' }
const footer = { fontSize: '13px', color: '#666666', margin: '0 0 8px' }
const footerBrand = { fontSize: '12px', color: '#999999', margin: '0' }
