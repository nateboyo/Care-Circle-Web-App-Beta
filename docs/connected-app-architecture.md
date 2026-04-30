# Connected Desktop And Mobile Architecture

## Best First Build

Build CareCircle as a responsive PWA first.

This gives you:

- One codebase for desktop and mobile
- Installable app behavior on phones and desktops
- Faster launch than separate native apps
- A direct path to app-store wrappers later through Capacitor

The current prototype uses a local Node server with workspace invite links:

```text
?workspace=parker-family
```

That is useful for private beta demos, but it is not production authentication.

## How Devices Connect

Production flow:

1. A family member signs in.
2. The app loads the family's shared workspace from the cloud database.
3. Every note, task, medication update, document entry, call log, and chat message is written to the same workspace.
4. Other signed-in family members receive real-time updates through database subscriptions, WebSockets, or server-sent events.
5. Push notifications handle reminders and urgent handoffs.

Private beta flow in this repo:

1. A family opens a workspace invite link.
2. The app stores that workspace id in local storage.
3. The local server reads and writes `data/workspaces/{workspace-id}.json`.
4. Other open sessions in the same workspace receive server-sent events.

## Recommended Stack

Practical low-cost stack:

- Frontend: React, Vite, TypeScript, PWA
- Backend: Supabase
- Database: Postgres with row-level security
- Realtime: Supabase Realtime
- File storage: Supabase Storage with private buckets
- Payments: Stripe Checkout and Customer Portal
- Mobile wrapper later: Capacitor

Alternative:

- Firebase Auth
- Firestore
- Firebase Storage
- Cloud Functions
- Stripe Firebase Extension

## Data Model

Core tables:

- `workspaces`
- `workspace_members`
- `care_recipients`
- `tasks`
- `medication_reminders`
- `appointments`
- `notes`
- `documents`
- `insurance_calls`
- `messages`
- `subscriptions`

For a solo MVP, start with these first:

- `workspaces`
- `workspace_members`
- `care_recipients`
- `tasks`
- `medication_reminders`
- `appointments`
- `notes`
- `insurance_calls`
- `messages`
- `subscriptions`

Add encrypted `documents` storage after auth, permissions, and billing are stable.

Important permissions:

- Owner: billing, invites, exports, member removal
- Family member: create and edit care records
- Helper: limited tasks, appointments, and notes
- Viewer: read-only access for occasional relatives

## Security Requirements

CareCircle should treat data as sensitive from day one:

- Enforce authentication
- Encrypt files at rest
- Use private storage URLs
- Keep audit timestamps
- Let families remove members quickly
- Avoid selling personal health data
- Do not claim to diagnose, treat, or replace clinical guidance

If you sell to covered healthcare entities, you will need deeper HIPAA review and a vendor stack willing to sign a BAA.

## Native App Path

Start with the PWA. Once families are using it:

1. Add push notifications.
2. Wrap the PWA with Capacitor for iOS and Android.
3. Add native notification permissions.
4. Add app-store subscriptions only if needed.

This keeps the early build small while preserving a path to native distribution.
