/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingRequestReceived } from './booking-request-received.tsx'
import { template as bookingApproved } from './booking-approved.tsx'
import { template as bookingDeclined } from './booking-declined.tsx'
import { template as paymentReceipt } from './payment-receipt.tsx'
import { template as paymentReminder } from './payment-reminder.tsx'
import { template as balanceDue } from './balance-due.tsx'
import { template as eventReminder } from './event-reminder.tsx'
import { template as reviewRequest } from './review-request.tsx'
import { template as messageReceived } from './message-received.tsx'
import { template as payoutSent } from './payout-sent.tsx'
import { template as refundIssued } from './refund-issued.tsx'
import { template as contactFormConfirmation } from './contact-form-confirmation.tsx'
import { template as vendorNewRequest } from './vendor-new-request.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'booking-request-received': bookingRequestReceived,
  'booking-approved': bookingApproved,
  'booking-declined': bookingDeclined,
  'payment-receipt': paymentReceipt,
  'payment-reminder': paymentReminder,
  'balance-due': balanceDue,
  'event-reminder': eventReminder,
  'review-request': reviewRequest,
  'message-received': messageReceived,
  'payout-sent': payoutSent,
  'refund-issued': refundIssued,
  'contact-form-confirmation': contactFormConfirmation,
  'vendor-new-request': vendorNewRequest,
}
