
# Customer Messaging Hub Implementation Plan

## Overview
This plan implements a comprehensive in-app messaging system for Event Pros to communicate with their clients directly from the dashboard. The hub includes conversation threads linked to bookings, message templates for quick responses, real-time messaging, and an unread notification system.

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Vendor Dashboard                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  New Tab: Messages (with unread badge indicator)          │   │
│  │  ┌────────────────────┬──────────────────────────────┐   │   │
│  │  │  Conversation List │  Active Chat Thread          │   │   │
│  │  │  - Client name     │  - Message bubbles           │   │   │
│  │  │  - Last message    │  - Typing input              │   │   │
│  │  │  - Unread dot      │  - Template quick-insert     │   │   │
│  │  │  - Booking context │  - Send button               │   │   │
│  │  └────────────────────┴──────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Implementation Details

### Phase 1: Database Schema

**New Tables:**

1. **`conversations`** - Tracks message threads between vendors and clients
   - `id` (uuid, PK)
   - `vendor_user_id` (uuid, FK to auth.users) - The Event Pro
   - `client_user_id` (uuid, nullable FK to auth.users) - Customer (if logged in)
   - `client_email` (text) - For guest customers
   - `client_name` (text) - Display name
   - `booking_id` (uuid, nullable FK to bookings) - Link to related booking
   - `subject` (text) - Conversation subject/title
   - `last_message_at` (timestamptz)
   - `vendor_unread_count` (integer, default 0)
   - `client_unread_count` (integer, default 0)
   - `status` (text: 'active', 'archived')
   - `created_at`, `updated_at`

2. **`messages`** - Individual messages within conversations
   - `id` (uuid, PK)
   - `conversation_id` (uuid, FK to conversations)
   - `sender_user_id` (uuid, nullable FK to auth.users)
   - `sender_type` (text: 'vendor', 'client')
   - `content` (text)
   - `is_read` (boolean, default false)
   - `read_at` (timestamptz)
   - `created_at`

3. **`message_templates`** - Vendor's saved quick-response templates
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users) - The vendor who owns this template
   - `name` (text) - Template name/title (e.g., "Booking Confirmation")
   - `content` (text) - Template body text
   - `category` (text) - Optional categorization (e.g., "booking", "inquiry", "followup")
   - `sort_order` (integer)
   - `created_at`, `updated_at`

**RLS Policies:**
- Vendors can read/write their own conversations and messages
- Clients can read/write their own conversations and messages
- Vendors can fully manage their own message templates
- Enable real-time for the `messages` table

### Phase 2: Backend Hook & Data Layer

**New Hook: `useVendorMessages`**
- Fetch all conversations for the logged-in vendor
- Fetch messages for a specific conversation
- Send new messages
- Mark messages as read
- Create new conversations (optionally linked to bookings)
- Real-time subscription for new messages
- Calculate unread count for badge display

**New Hook: `useMessageTemplates`**
- CRUD operations for message templates
- Reorder templates
- Default templates seeding for new vendors

### Phase 3: UI Components

**1. VendorMessages.tsx** (Main tab component)
- Split-pane layout: conversation list (left) + active chat (right)
- Mobile-responsive: drawer/sheet for conversation detail
- Search/filter conversations
- Empty states for no conversations

**2. ConversationList.tsx**
- List of conversation cards with:
  - Client avatar/initials
  - Client name
  - Last message preview (truncated)
  - Timestamp
  - Unread indicator dot
  - Booking badge if linked

**3. ChatThread.tsx**
- Header with client info and booking link
- Scrollable message area with auto-scroll to bottom
- Message bubbles (vendor right-aligned, client left-aligned)
- Timestamps
- "Seen" indicators for read messages

**4. MessageInput.tsx**
- Textarea for composing messages
- Send button
- Template picker dropdown/popover
- Character count (optional)

**5. TemplateManager.tsx**
- List of saved templates
- Add/edit/delete templates
- Drag-to-reorder
- Default templates:
  - "Booking Confirmation"
  - "Event Reminder (48h)"
  - "Thank You Follow-up"
  - "Quote Response"
  - "Availability Check"

**6. NewConversationDialog.tsx**
- Start a new conversation with a client
- Option to link to an existing booking
- Client email/name input

### Phase 4: Dashboard Integration

**Updates to VendorDashboard.tsx:**
- Add new "Messages" tab with `MessageCircle` icon
- Display unread count badge on tab when messages are unread
- Tab position: after "Bookings" tab (logical flow)

**Tab order:**
1. Overview
2. Earnings  
3. Bookings
4. **Messages** (new)
5. Packages
6. Availability
7. Settings

### Phase 5: Real-time & Notifications

**Real-time Subscriptions:**
- Subscribe to `postgres_changes` on `messages` table filtered by conversation IDs
- Auto-update conversation list when new messages arrive
- Play subtle notification sound (optional, user preference)

**Notification Integration:**
- Unread badge count updates in real-time
- Toast notification for new messages when on other tabs
- (Future) Push notifications via edge function

### Phase 6: Booking Integration

**VendorBookings.tsx Enhancement:**
- Add "Message Client" button on each booking card
- Opens messaging tab with that conversation pre-selected
- Creates conversation if one doesn't exist for that booking

## Default Message Templates

The system will include these starter templates for new vendors:

| Template Name | Category | Content |
|--------------|----------|---------|
| Booking Confirmation | booking | "Thank you for your booking! I'm excited to be part of your event on [DATE]. I'll reach out again 48 hours before to confirm all the details. Feel free to message me if you have any questions!" |
| 48-Hour Reminder | reminder | "Hi! Just a friendly reminder that your event is coming up in 48 hours. Please confirm the venue address and any last-minute details. Looking forward to seeing you!" |
| Thank You Follow-up | followup | "Thank you so much for having me at your event! I hope everything exceeded your expectations. If you have a moment, I'd really appreciate a review. It helps me grow my business!" |
| Quote Response | inquiry | "Thanks for reaching out! Based on your event details, here's what I can offer: [DETAILS]. Let me know if you have any questions or would like to proceed with booking." |
| Availability Check | inquiry | "Thanks for your interest! I'm checking my calendar for [DATE]. I'll get back to you within 24 hours to confirm availability and provide pricing details." |

## File Structure

```
src/
├── components/vendor-dashboard/
│   ├── VendorMessages.tsx          (Main messages tab)
│   ├── messaging/
│   │   ├── ConversationList.tsx    (Sidebar list)
│   │   ├── ChatThread.tsx          (Message thread view)
│   │   ├── MessageInput.tsx        (Compose area)
│   │   ├── MessageBubble.tsx       (Individual message)
│   │   ├── TemplateManager.tsx     (Template CRUD)
│   │   ├── TemplatePicker.tsx      (Quick-insert dropdown)
│   │   └── NewConversationDialog.tsx
├── hooks/
│   ├── useVendorMessages.ts        (Conversations & messages)
│   └── useMessageTemplates.ts      (Templates CRUD)
```

## Implementation Order

1. **Database Migration** - Create tables and RLS policies, enable real-time
2. **useMessageTemplates Hook** - Template management (simpler, can test independently)
3. **useVendorMessages Hook** - Full messaging logic with real-time
4. **UI Components** - Build from smallest to largest:
   - MessageBubble → ChatThread → MessageInput → TemplatePicker
   - ConversationList → VendorMessages (main component)
   - TemplateManager, NewConversationDialog
5. **Dashboard Integration** - Add Messages tab with badge
6. **Booking Integration** - Add "Message Client" button to booking cards

## Security Considerations

- All RLS policies ensure vendors only access their own conversations
- Client email is stored but not exposed to other vendors
- Message content is validated for length limits
- Template content is sanitized before display
