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

## #Authentication

- [x] Users should be able sign-up
- [x] User should be able to sign-in
  - [x] Sign-in via local email and password
  - [x] Sign-in via local email and password should return access and refresh token
- [ ] Users should be able to reset their password

## #Users

- [ ] Users should be able to upload an image for avatar
  - [ ] Old image should be deleted from storage

#### Get User orders

**Endpoint:** `GET /me/orders`

- [ ] The authenticated user should be able to fetch its orders with a summary of the event.

#### Get User order items by order id

**Endpoint:** `GET /me/orders/:order_id/items`

- [ ] The authenticated user should be able to fetch order items from a order id.

## #Categories

- [x] Admin Users should be able to create a category
- [x] Admin Users Users should be able to update a category
- [x] Admin Users should be able to delete a category

## #Events

- [x] Users should be able to create events
- [ ] Users should be able to upload banner event
- [ ] Users should be able to see a list of events that is yet to happen
- [ ] Users should be able to filter events by category, pricing and type
- [ ] Users should be able to search event by name
- [ ] Users should be able to filter events around them with geolocation

#### Get Event Orders

**Endpoint:** `GET /events/:event_id/orders`

- [ ] The authenticated user should be the event organizer.
- [ ] Endpoint should list every order for that event.

#### Get Event By slug or id with tickets

**Endpoint:** `GET /events/:identifier/tickets`

- [x] The event should exist.
- [x] Endpoint should return the event with a list of its associated tickets.

## #Event Images

- [x] Users should be able to upload images for the event gallery.

## #Event Tickets

- [ ] Users should be able to create event tickets for an event
- [ ] Event tickets should have a maximum capacity
- [ ] Event tickets should not be created for past events.
- [ ] Event tickets should support different types
- [ ] Users should be able to fetch all event tickets for an order

## #Orders

#### Create Order

**Endpoint:** `POST /orders`

- [x] The authenticated user should be able to create an order.
- [x] The order must be associated with a single event (`event_id`).
- [x] The order should be created with status `PENDING`.
- [x] The order must store the `user_id` of the authenticated user.
- [x] The order must not have `reservation_expires_at` set at creation.
- [x] The API should return the created order.

#### Add Order Items

**Endpoint:** `POST /orders/:orderId/items`

- [x] The authenticated user should be able to add items to their own order.
  - [x] Order should exist.
- [x] Each order item must represent one ticket.
  - [x] Event ticket should exist.
  - [x] Event ticket should have non-zero amount and not be sold out.
- [x] Each order item must reference an `event_ticket_id`.
- [x] Each order item must store a snapshot of the ticket price at purchase time.
- [x] Each order item must include:
  - [x] `owner_name`
  - [x] `owner_email`
- [x] The API should return the updated list of order items.

#### Confirm Order and Create Reservations

**Endpoint:** `POST /orders/:orderId/confirm`

- [x] The authenticated user should be able to confirm their own order.
- [x] Confirming an order must reserve all order items atomically
- [x] Reservations must expire after 20 minutes.
- [x] The order status must change from PENDING to AWAITING_PAYMENT.
- [x] The order must receive reservation_expires_at = now() + 20 minutes.
- [x] The operation must be fully transactional (atomic).
- [x] Overselling must be prevented using concurrency-safe logic (row-level locking).
- [x] The API must return:
  - [x] Order ID
  - [x] Order status
- [x] Reservation expiration timestamp

#### Remove Order Item

**Endpoint:** `DELETE /orders/:orderId/items/:itemId`

- [x] The authenticated user should be able to remove items from their own order.
- [x] Items may only be removed if the order status is PENDING.
- [x] User must only remove order items from his own orders.
- [x] Order item must be related to the order.
- [x] Removing an item must not affect other order items.

## #Reservations

- [x] Users should be able able to reserve a ticket event for purchase.
- [x] Reservations should expire after a time limit in minutes.
- [ ] Event ticket order should be cancelled after reservation expires.
- [ ] Reservation expiration should trigger an event to release tickets and cancel the related order.
- [x] Reservations should not allow overselling.

## #Tickets

- [ ] User tickets should be generated after succesfully paid for order.
- [ ] User should be able to fetch all of their tickets.
- [ ] Tickets should be unique and contain a secure code (QR Code + hash)
- [ ] Tickets should be associated with an owner name and email.

## #Payment

- [ ] Users should be able to pay for an order
- [ ] Successfull paid orders should have their status updated to PAID
- [ ] Failed paid orders should have their status updated to FAILED
- [ ] Payment webhook retries should be idempotent.
- [ ] Orders should not be marked as PAID until payment is confirmed via webhook.

## #Payment Order

- [ ] Successfull payment orders should have their status updated to PAID
- [ ] Failed payment orders should have their status updated to FAILED

## #Email

- [ ] Users should be able to receive reset password emails
- [ ] Users should be able to receive email confirmation for their orders
- [ ] Users should be able to receive their bought tickets in their email
- [ ] Ticket delivery emails should include the QR Code / PDF attachment.
- [ ] Failed payments should trigger a notification email.
