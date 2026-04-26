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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email and start booking with {BRAND}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt={BRAND} width="140" style={logo} />
        </Section>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Welcome to{' '}
          <Link href={siteUrl} style={link}>
            <strong>{BRAND}</strong>
          </Link>
          . Confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          to finish setting up your account.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Confirm email
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Didn't sign up? You can safely ignore this email.
        </Text>
        <Text style={footerBrand}>{BRAND} · by Vendibook</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0 20px',
}
const footer = { fontSize: '13px', color: '#666666', margin: '0 0 8px' }
const footerBrand = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
}
