# Solo Beta Launch Plan

This is the practical version of CareCircle for one developer.

## What You Should Launch First

Launch CareCircle as a private beta PWA for families, not as a nursing-home platform or healthcare enterprise product.

Beta promise:

> One calm shared workspace for families caring for an aging parent.

Beta scope:

- One family workspace per invite link
- One elder profile per workspace
- Tasks
- Medication reminders
- Appointments
- Shared notes
- Insurance call logs
- Family chat
- Document names and locations
- Paid care packet export

Do not launch with real file uploads yet.

## What I Changed For Solo Launch

- Added workspace-specific URLs such as `?workspace=parker-family`
- Added server storage per family workspace
- Added real-time updates per workspace
- Added a beta notice inside the app
- Changed the document vault into a document list until secure storage exists
- Kept care packet export as the first paid trigger
- Documented the production migration path

## First 10 Beta Users

Do not invite random public traffic first. Start with ten families you can talk to.

Good beta candidates:

- Adult children coordinating care with siblings
- Families preparing for frequent doctor visits
- Families who already use group texts for caregiving
- Families dealing with insurance calls or paperwork
- People hiring a home-care helper for the first time

Ask each family to use CareCircle for seven days.

## Beta Rules

Use these rules until real auth and encrypted storage are connected:

- Invite only people you know
- Tell users not to store full SSNs, bank info, passwords, or actual document scans
- Store document names and locations, not uploaded files
- Do not market it as medical advice
- Keep support personal and fast
- Manually collect feedback every week

## Solo Dev Build Order

1. Add real auth and family invites
2. Add cloud database
3. Add role permissions
4. Add Stripe Checkout
5. Add email reminders
6. Add secure document upload
7. Add push notifications
8. Wrap as mobile app only after people use the web app

## Revenue Test

Do not overcomplicate pricing at beta launch.

Use:

- Free beta while onboarding
- $12/month Family plan after beta
- $24/month Family Plus later

The first paid action should remain:

> Export a care packet for a doctor visit, emergency handoff, or home-care helper.

If nobody wants the care packet export, fix the packet before adding more features.

## Launch Checklist

- Privacy policy draft
- Terms draft
- Support email address
- Real auth connected
- Per-family access permissions
- Database backups
- Stripe test mode verified
- Care packet export tested on mobile and desktop
- Clear warning that the app is not medical advice
- Simple feedback form

## What To Ignore For Now

These can wait:

- Native app stores
- Nursing-home sales
- Corporate benefits sales
- HIPAA-heavy enterprise positioning
- SMS reminders
- Multi-family professional dashboard
- Advanced analytics
- Insurance integrations

The goal is not to look huge. The goal is to find families who use it every week.
