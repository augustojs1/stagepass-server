<h1 align="center"> 
	StagePass
</h1>

<h3 align="center"> 
	Non-Functional Requirements
</h3>

- [ ] StagePass should be developed using the following technologies: Node.js, Next.js, Nest.js, TypeScript, PostgreSQL, Drizzle and Docker.

<h3 align="center"> 
	Functional Requirements
</h3>

### Authentication

- [ ] Users should be able sign-up
- [ ] User should be able to sign-in
  - [ ] Sign-in via local email and password
  - [ ] Sign-in via local email and password should return access and refresh token
  - [ ] Sign-in via Google Auth
  - [ ] Sign-in via One Time Password
- [ ] Users should be able to reset their password
- [ ] Users should be able to verify their email after sign-up

### Events

- [ ] Users should be able to see a list of events that is yet to happen
- [ ] Users should be able to filter events by category, pricing and type
- [ ] Users should be able to search event by name
- [ ] Users should be able to filter events around them with geolocation
- [ ] Users should be able to create events
- [ ] Users should be able to update or cancel their events
- [ ] Events should not be deletable if tickets have already been sold

### Event Tickets

- [ ] Users should be able to create event tickets for an event
- [ ] Event tickets should have a maximum capacity
- [ ] Event tickets should not be created for past events.
- [ ] Event tickets should support different types
- [ ] Users should be able to fetch all event tickets for an order

### Order

- [ ] Users should be able to create an order for a ticket event
- [ ] Users should not be able to create a ticket event order for an already started event
- [ ] Event Ticket amount should be lowered by the amount of event tickets in order
- [ ] Event Ticket amount should sum up by the amount of event tickets in order after it expires
- [ ] Orders should be paid within a time limit
- [ ] Tickets for an order is reserved for a limited amount of time
- [ ] Orders should have a unique identifier for payment gateway integration
- [ ] Orders should expire if not paid within the reservation time window.

### Order Item

- [ ] Order item quantity should not be bigger than the amount of available event tickets

### Reservations

- [ ] Users should be able able to reserve a ticket event for purchase
- [ ] Reservations should expire after 20 minutes
- [ ] Event ticket order should be cancelled after reservation expires
- [ ] Reservation expiration should trigger an event to release tickets and cancel the related order
- [ ] Reservations should not allow overselling

### Tickets

- [ ] User tickets should be generated after succesfully paid for order
- [ ] User should be able to fetch all of their tickets
- [ ] Tickets should be unique and contain a secure code (QR Code + hash)
- [ ] Tickets should be associated with an owner name and email

### Payment

- [ ] Users should be able to pay for an order
- [ ] Successfull paid orders should have their status updated to PAID
- [ ] Failed paid orders should have their status updated to FAILED
- [ ] Payment webhook retries should be idempotent.
- [ ] Orders should not be marked as PAID until payment is confirmed via webhook.

### Payment Order

- [ ] Successfull payment orders should have their status updated to PAID
- [ ] Failed payment orders should have their status updated to FAILED

### Email

- [ ] Users should be able to receive reset password emails
- [ ] Users should be able to receive One Time Password login email
- [ ] Users should be able to receive email confirmation for their orders
- [ ] Users should be able to receive their bought tickets in their email
- [ ] Ticket delivery emails should include the QR Code / PDF attachment.
- [ ] Failed payments should trigger a notification email.
