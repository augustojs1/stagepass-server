-- Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- users
create table users (
    id UUID primary key default gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) unique NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
		refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE index users_email_idx on users (email);

-- users_profile
create table users_profile (
	id UUID primary key default gen_random_uuid(),
	user_id UUID references users (id),
	avatar_url VARCHAR(255),
	phone_number VARCHAR(255),
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- categories
create table event_categories (
	id UUID primary key default gen_random_uuid(),
	name VARCHAR(100) unique not NULL,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO event_categories (name)
VALUES
  ('Music'),
  ('Sport'),
  ('Exhibition'),
  ('Business'),
  ('Photography'),
  ('Theater'),
  ('Comedy'),
  ('Cinema'),
  ('Education'),
  ('Gaming'),
  ('Festival');

create index event_categories_name_idx on event_categories (name);

-- countries
CREATE TABLE countries (
	code CHAR(2) PRIMARY KEY,
	name VARCHAR(50) NOT NULL
);

create index countries_code_idx ON countries (code);

-- events
create table events (
	id UUID primary key default gen_random_uuid() NOT NULL,
	organizer_id UUID references users (id) not NULL,
	event_category_id UUID references event_categories (id) NOT NULL,
	is_free BOOLEAN NOT NULL,
	name VARCHAR(100) NOT NULL,
	description text NOT NULL,
	banner_url text,
	slug TEXT NOT NULL,
	address_street VARCHAR(100) NOT NULL,
	address_number VARCHAR(20) NOT NULL,
	address_district VARCHAR(100) NOT NULL,
	address_city VARCHAR(100) NOT NULL,
	country_id CHAR(2) references countries (code),
	location GEOGRAPHY(Point, 4326) NOT NULL,
  sales_starts_at TIMESTAMPTZ NOT NULL,
	starts_at TIMESTAMPTZ NOT NULL,
	ends_at TIMESTAMPTZ NOT NULL,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

alter table
	events
add constraint
	starts_at_before_ends_at
check
	(ends_at > starts_at);

CREATE INDEX events_name_trgm_idx ON events USING gin (name gin_trgm_ops);
create index events_starts_at_idx on events(starts_at);
CREATE INDEX events_slug_idx ON events(slug);

-- event_tickets
create table event_tickets (
	id UUID primary key default gen_random_uuid() not null,
	event_id UUID references events (id) not null,
	name VARCHAR(50) not null,
	price BIGINT not null,
	amount INT not null,
	sold boolean default false,
	updated_at TIMESTAMPTZ default CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ default CURRENT_TIMESTAMP
);

alter table
	event_tickets
add constraint
	non_zero_price
check
	(price > 0);

-- event_images
CREATE TABLE event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) NOT NULL,
  url TEXT NOT NULL,
  object_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_images_event_id ON event_images(event_id);

-- orders
CREATE TYPE order_statuses AS ENUM ('PENDING',
  'AWAITING_PAYMENT',
  'PAID',
  'EXPIRED',
  'CANCELLED',
  'FAILED');

create table orders (
	id UUID primary key default gen_random_uuid(),
	user_id UUID references users(id),
	event_id UUID references events(id) not null,
	status order_statuses not null,
	total_price BIGINT not null,
	reservation_expires_at TIMESTAMPTZ,
	updated_at TIMESTAMPTZ default CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ default CURRENT_TIMESTAMP
);

-- order_item
create table order_item (
	id UUID primary key default gen_random_uuid(),
	order_id UUID references orders(id),
	event_ticket_id UUID references event_tickets(id),
	owner_name VARCHAR(255) not null,
	owner_email VARCHAR(255) not null,
	unit_price BIGINT not null,
	updated_at TIMESTAMPTZ default CURRENT_TIMESTAMP,
	created_at TIMESTAMPTZ default CURRENT_TIMESTAMP
);

-- event_ticket_reservations
CREATE TABLE event_ticket_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
  event_ticket_id UUID NOT NULL REFERENCES event_tickets(id),
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE event_ticket_reservations
  ADD CONSTRAINT event_ticket_reservations_order_item_uidx UNIQUE (order_item_id);

CREATE INDEX orders_expiration_idx
	ON orders(reservation_expires_at)
WHERE status = 'AWAITING_PAYMENT';

-- payment_orders
CREATE TYPE payment_providers AS ENUM ('STRIPE');

CREATE TYPE payment_order_statuses AS ENUM (
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider payment_providers NOT NULL DEFAULT 'STRIPE',
  provider_reference_id TEXT NOT NULL, 
  status payment_order_statuses NOT NULL DEFAULT 'PENDING',
	checkout_url TEXT,
  amount BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  receipt_url TEXT,
  error_code TEXT,
  error_message TEXT,
	checkout_url_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX payment_provider_and_provider_reference_uidx ON payment_orders(provider, provider_reference_id);

CREATE INDEX payment_order_id_and_created_at_idx ON payment_orders(order_id, created_at DESC);

CREATE INDEX payment_order_status_and_id_idx ON payment_orders(order_id, status);

create type webhook_process_statuses AS enum ('PROCESSING', 'PROCESSED', 'FAILED_TO_PROCESS');

create type webhook_payment_statuses as enum ('PAID', 'FAILED');

-- payment_gateway_webhook_events
create table payment_gateway_webhook_events (
	id UUID primary key default gen_random_uuid(),
	provider_reference_id text unique not null,
	order_id UUID not null references orders(id),
	provider payment_providers not NULL,
	process webhook_process_statuses not null,
	amount_total BIGINT,
	payment_status webhook_payment_statuses not NULL,
	event_created_at BIGINT not NULL,
	currency VARCHAR(10) not null,
	expires_at BIGINT,
	receipt_url text,
	error_code TEXT,
	error_decline_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX provider_reference_id_idx ON payment_gateway_webhook_events(provider_reference_id);

-- tickets
create table tickets (
	id UUID primary key default gen_random_uuid(),
	order_item_id UUID references order_item(id) on delete set null,
	owner_id UUID references users(id) on delete set null,
	event_ticket_id UUID references event_tickets(id) on delete set null,
	file_url text,
	checked_in BOOLEAN default false,
	checked_in_at TIMESTAMPTZ,
	code  VARCHAR(50) UNIQUE not null,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- email_templates
create type email_template_type AS enum ('TICKETS_AVAILABLE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED');

CREATE TABLE email_templates (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	type email_template_type UNIQUE NOT NULL,
	html TEXT NOT NULL,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

insert into 
	email_templates (type, html) 
values
	(
	'PAYMENT_SUCCESS',
	'<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Payment confirmed</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f3fa; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f3fa; padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">
            
            <tr>
              <td style="background-color:#111827; padding:28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-size:22px; font-weight:700; color:#ffffff;">
                      Stage<span style="color:#6366f1;">Pass</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px 24px 32px; text-align:center;">
                <div style="display:inline-block; background-color:#ecfdf5; color:#047857; font-size:14px; font-weight:700; padding:8px 14px; border-radius:999px; margin-bottom:20px;">
                  Payment confirmed
                </div>

                <h1 style="margin:0; font-size:28px; line-height:36px; color:#111827;">
                  Your order has been confirmed!
                </h1>

                <p style="margin:16px 0 0 0; font-size:16px; line-height:24px; color:#4b5563;">
                  Hi, {{customer_name}}. We have received the payment confirmation for your order.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 32px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e5e7eb; border-radius:10px;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                        Event
                      </p>
                      <p style="margin:0; font-size:18px; color:#111827; font-weight:700;">
                        {{event_name}}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px;">
                      <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Order
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              #{{order_id}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Amount paid
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{order_total}}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td colspan="2" style="height:20px;"></td>
                        </tr>

                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Event date
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{event_date}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Tickets
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{tickets_count}} ticket(s)
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0; font-size:15px; line-height:24px; color:#4b5563;">
                  We are preparing your tickets. Once they are generated, you will receive another email with the ticket files attached.
                </p>

                <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                  <tr>
                    <td style="background-color:#6366f1; border-radius:8px;">
                      <a href="{{receipt_url}}" style="display:inline-block; padding:14px 22px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">
                        View order details
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background-color:#111827; padding:28px 32px; text-align:center;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#9ca3af;">
                  This is an automated email. Please do not reply.
                </p>
                <p style="margin:8px 0 0 0; font-size:13px; color:#9ca3af;">
                  © {{current_year}} StagePass. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
'
	),
	(
	'PAYMENT_FAILED',
	' <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Payment failed</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f3fa; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f3fa; padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">
            
            <tr>
              <td style="background-color:#111827; padding:28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-size:22px; font-weight:700; color:#ffffff;">
                      Stage<span style="color:#6366f1;">Pass</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px 24px 32px; text-align:center;">
                <div style="display:inline-block; background-color:#fef2f2; color:#b91c1c; font-size:14px; font-weight:700; padding:8px 14px; border-radius:999px; margin-bottom:20px;">
                  Payment failed
                </div>

                <h1 style="margin:0; font-size:28px; line-height:36px; color:#111827;">
                  We could not confirm your payment
                </h1>

                <p style="margin:16px 0 0 0; font-size:16px; line-height:24px; color:#4b5563;">
                  Hi, {{customer_name}}. There was a problem while processing the payment for your order.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 32px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e5e7eb; border-radius:10px;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                        Event
                      </p>
                      <p style="margin:0; font-size:18px; color:#111827; font-weight:700;">
                        {{event_name}}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px;">
                      <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Order
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              #{{order_id}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Status
                            </p>
                            <p style="margin:0; font-size:15px; color:#b91c1c; font-weight:700;">
                              {{payment_status}}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td colspan="2" style="height:20px;"></td>
                        </tr>

                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Amount
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{order_total}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Reason
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{error_message}}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0; font-size:15px; line-height:24px; color:#4b5563;">
                  No tickets were issued for this order. You can try the payment again or choose another payment method.
                </p>

                <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                  <tr>
                    <td style="background-color:#6366f1; border-radius:8px;">
                      <a href="{{checkout_url}}" style="display:inline-block; padding:14px 22px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">
                        Try payment again
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0; font-size:13px; line-height:20px; color:#6b7280;">
                  If you believe you were charged incorrectly, please contact support and provide your order number.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color:#111827; padding:28px 32px; text-align:center;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#9ca3af;">
                  This is an automated email. Please do not reply.
                </p>
                <p style="margin:8px 0 0 0; font-size:13px; color:#9ca3af;">
                  © {{current_year}} StagePass. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
'
	),
	(
	'TICKETS_AVAILABLE',
	' <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your tickets are ready</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f3fa; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f3fa; padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">
            
            <tr>
              <td style="background-color:#111827; padding:28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-size:22px; font-weight:700; color:#ffffff;">
                      Stage<span style="color:#6366f1;">Pass</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px 24px 32px; text-align:center;">
                <div style="display:inline-block; background-color:#eef2ff; color:#4f46e5; font-size:14px; font-weight:700; padding:8px 14px; border-radius:999px; margin-bottom:20px;">
                  Tickets available
                </div>

                <h1 style="margin:0; font-size:28px; line-height:36px; color:#111827;">
                  Your tickets are ready!
                </h1>

                <p style="margin:16px 0 0 0; font-size:16px; line-height:24px; color:#4b5563;">
                  Hi, {{customer_name}}. Your tickets for the event have been generated successfully and are attached to this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 32px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e5e7eb; border-radius:10px;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                        Event
                      </p>
                      <p style="margin:0; font-size:20px; color:#111827; font-weight:700;">
                        {{event_name}}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px;">
                      <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Date and time
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{event_date}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Order
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              #{{order_id}}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td colspan="2" style="height:20px;"></td>
                        </tr>

                        <tr>
                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Location
                            </p>
                            <p style="margin:0; font-size:15px; line-height:22px; color:#111827;">
                              {{event_location}}
                            </p>
                          </td>

                          <td width="50%" style="vertical-align:top;">
                            <p style="margin:0 0 6px 0; font-size:13px; color:#6b7280; text-transform:uppercase; font-weight:700;">
                              Quantity
                            </p>
                            <p style="margin:0; font-size:15px; color:#111827;">
                              {{tickets_count}} ticket(s)
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px; background-color:#f9fafb; border-radius:10px;">
                  <tr>
                    <td style="padding:20px;">
                      <h2 style="margin:0 0 12px 0; font-size:18px; color:#111827;">
                        How to use your ticket
                      </h2>

                      <p style="margin:0 0 10px 0; font-size:15px; line-height:24px; color:#4b5563;">
                        1. Open the PDF file attached to this email.
                      </p>

                      <p style="margin:0 0 10px 0; font-size:15px; line-height:24px; color:#4b5563;">
                        2. Present the QR Code at the event entrance.
                      </p>

                      <p style="margin:0; font-size:15px; line-height:24px; color:#4b5563;">
                        3. Keep the ticket readable and do not share it with other people.
                      </p>
                    </td>
                  </tr>
                </table>

                <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                  <tr>
                    <td style="background-color:#6366f1; border-radius:8px;">
                      <a href="{{receipt_url}}" style="display:inline-block; padding:14px 22px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">
                        View order details
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0; font-size:13px; line-height:20px; color:#6b7280;">
                  Important: each ticket has a unique QR Code. Once it is validated at the entrance, it cannot be used again.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color:#111827; padding:28px 32px; text-align:center;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#9ca3af;">
                  This is an automated email. Please do not reply.
                </p>
                <p style="margin:8px 0 0 0; font-size:13px; color:#9ca3af;">
                  © {{current_year}} StagePass. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
'
	);

-- countries seed
INSERT INTO countries (name, code) VALUES
('Afghanistan', 'AF'),
('Albania', 'AL'),
('Algeria', 'DZ'),
('American Samoa', 'AS'),
('Andorra', 'AD'),
('Angola', 'AO'),
('Anguilla', 'AI'),
('Antarctica', 'AQ'),
('Antigua and Barbuda', 'AG'),
('Argentina', 'AR'),
('Armenia', 'AM'),
('Aruba', 'AW'),
('Asia/Pacific Region', 'AP'),
('Australia', 'AU'),
('Austria', 'AT'),
('Azerbaijan', 'AZ'),
('Bahamas', 'BS'),
('Bahrain', 'BH'),
('Bangladesh', 'BD'),
('Barbados', 'BB'),
('Belarus', 'BY'),
('Belgium', 'BE'),
('Belize', 'BZ'),
('Benin', 'BJ'),
('Bermuda', 'BM'),
('Bhutan', 'BT'),
('Bolivia', 'BO'),
('Bonaire, Sint Eustatius and Saba', 'BQ'),
('Bosnia and Herzegovina', 'BA'),
('Botswana', 'BW'),
('Bouvet Island', 'BV'),
('Brazil', 'BR'),
('British Indian Ocean Territory', 'IO'),
('Brunei Darussalam', 'BN'),
('Bulgaria', 'BG'),
('Burkina Faso', 'BF'),
('Burundi', 'BI'),
('Cambodia', 'KH'),
('Cameroon', 'CM'),
('Canada', 'CA'),
('Cape Verde', 'CV'),
('Cayman Islands', 'KY'),
('Central African Republic', 'CF'),
('Chad', 'TD'),
('Chile', 'CL'),
('China', 'CN'),
('Christmas Island', 'CX'),
('Cocos (Keeling) Islands', 'CC'),
('Colombia', 'CO'),
('Comoros', 'KM'),
('Congo', 'CG'),
('Congo, The Democratic Republic of the', 'CD'),
('Cook Islands', 'CK'),
('Costa Rica', 'CR'),
('Croatia', 'HR'),
('Cuba', 'CU'),
('Curaçao', 'CW'),
('Cyprus', 'CY'),
('Czech Republic', 'CZ'),
('Côte d Ivoire', 'CI'),
('Denmark', 'DK'),
('Djibouti', 'DJ'),
('Dominica', 'DM'),
('Dominican Republic', 'DO'),
('Ecuador', 'EC'),
('Egypt', 'EG'),
('El Salvador', 'SV'),
('Equatorial Guinea', 'GQ'),
('Eritrea', 'ER'),
('Estonia', 'EE'),
('Ethiopia', 'ET'),
('Falkland Islands (Malvinas)', 'FK'),
('Faroe Islands', 'FO'),
('Fiji', 'FJ'),
('Finland', 'FI'),
('France', 'FR'),
('French Guiana', 'GF'),
('French Polynesia', 'PF'),
('French Southern Territories', 'TF'),
('Gabon', 'GA'),
('Gambia', 'GM'),
('Georgia', 'GE'),
('Germany', 'DE'),
('Ghana', 'GH'),
('Gibraltar', 'GI'),
('Greece', 'GR'),
('Greenland', 'GL'),
('Grenada', 'GD'),
('Guadeloupe', 'GP'),
('Guam', 'GU'),
('Guatemala', 'GT'),
('Guernsey', 'GG'),
('Guinea', 'GN'),
('Guinea-Bissau', 'GW'),
('Guyana', 'GY'),
('Haiti', 'HT'),
('Heard Island and Mcdonald Islands', 'HM'),
('Holy See (Vatican City State)', 'VA'),
('Honduras', 'HN'),
('Hong Kong', 'HK'),
('Hungary', 'HU'),
('Iceland', 'IS'),
('India', 'IN'),
('Indonesia', 'ID'),
('Iran, Islamic Republic Of', 'IR'),
('Iraq', 'IQ'),
('Ireland', 'IE'),
('Isle of Man', 'IM'),
('Israel', 'IL'),
('Italy', 'IT'),
('Jamaica', 'JM'),
('Japan', 'JP'),
('Jersey', 'JE'),
('Jordan', 'JO'),
('Kazakhstan', 'KZ'),
('Kenya', 'KE'),
('Kiribati', 'KI'),
('Korea, Republic of', 'KR'),
('Kuwait', 'KW'),
('Kyrgyzstan', 'KG'),
('Laos', 'LA'),
('Latvia', 'LV'),
('Lebanon', 'LB'),
('Lesotho', 'LS'),
('Liberia', 'LR'),
('Libyan Arab Jamahiriya', 'LY'),
('Liechtenstein', 'LI'),
('Lithuania', 'LT'),
('Luxembourg', 'LU'),
('Macao', 'MO'),
('Madagascar', 'MG'),
('Malawi', 'MW'),
('Malaysia', 'MY'),
('Maldives', 'MV'),
('Mali', 'ML'),
('Malta', 'MT'),
('Marshall Islands', 'MH'),
('Martinique', 'MQ'),
('Mauritania', 'MR'),
('Mauritius', 'MU'),
('Mayotte', 'YT'),
('Mexico', 'MX'),
('Micronesia, Federated States of', 'FM'),
('Moldova, Republic of', 'MD'),
('Monaco', 'MC'),
('Mongolia', 'MN'),
('Montenegro', 'ME'),
('Montserrat', 'MS'),
('Morocco', 'MA'),
('Mozambique', 'MZ'),
('Myanmar', 'MM'),
('Namibia', 'NA'),
('Nauru', 'NR'),
('Nepal', 'NP'),
('Netherlands', 'NL'),
('Netherlands Antilles', 'AN'),
('New Caledonia', 'NC'),
('New Zealand', 'NZ'),
('Nicaragua', 'NI'),
('Niger', 'NE'),
('Nigeria', 'NG'),
('Niue', 'NU'),
('Norfolk Island', 'NF'),
('North Korea', 'KP'),
('North Macedonia', 'MK'),
('Northern Mariana Islands', 'MP'),
('Norway', 'NO'),
('Oman', 'OM'),
('Pakistan', 'PK'),
('Palau', 'PW'),
('Palestinian Territory, Occupied', 'PS'),
('Panama', 'PA'),
('Papua New Guinea', 'PG'),
('Paraguay', 'PY'),
('Peru', 'PE'),
('Philippines', 'PH'),
('Pitcairn Islands', 'PN'),
('Poland', 'PL'),
('Portugal', 'PT'),
('Puerto Rico', 'PR'),
('Qatar', 'QA'),
('Reunion', 'RE'),
('Romania', 'RO'),
('Russian Federation', 'RU'),
('Rwanda', 'RW'),
('Saint Barthélemy', 'BL'),
('Saint Helena', 'SH'),
('Saint Kitts and Nevis', 'KN'),
('Saint Lucia', 'LC'),
('Saint Martin', 'MF'),
('Saint Pierre and Miquelon', 'PM'),
('Saint Vincent and the Grenadines', 'VC'),
('Samoa', 'WS'),
('San Marino', 'SM'),
('Sao Tome and Principe', 'ST'),
('Saudi Arabia', 'SA'),
('Senegal', 'SN'),
('Serbia', 'RS'),
('Seychelles', 'SC'),
('Sierra Leone', 'SL'),
('Singapore', 'SG'),
('Sint Maarten', 'SX'),
('Slovakia', 'SK'),
('Slovenia', 'SI'),
('Solomon Islands', 'SB'),
('Somalia', 'SO'),
('South Africa', 'ZA'),
('South Georgia and the South Sandwich Islands', 'GS'),
('South Sudan', 'SS'),
('Spain', 'ES'),
('Sri Lanka', 'LK'),
('Sudan', 'SD'),
('Suriname', 'SR'),
('Svalbard and Jan Mayen', 'SJ'),
('Sweden', 'SE'),
('Switzerland', 'CH'),
('Syrian Arab Republic', 'SY'),
('Taiwan', 'TW'),
('Tajikistan', 'TJ'),
('Tanzania', 'TZ'),
('Thailand', 'TH'),
('Timor-Leste', 'TL'),
('Togo', 'TG'),
('Tokelau', 'TK'),
('Tonga', 'TO'),
('Trinidad and Tobago', 'TT'),
('Tunisia', 'TN'),
('Turkey', 'TR'),
('Turkmenistan', 'TM'),
('Turks and Caicos Islands', 'TC'),
('Tuvalu', 'TV'),
('Uganda', 'UG'),
('Ukraine', 'UA'),
('United Arab Emirates', 'AE'),
('United Kingdom', 'GB'),
('United States', 'US'),
('United States Minor Outlying Islands', 'UM'),
('Uruguay', 'UY'),
('Uzbekistan', 'UZ'),
('Vanuatu', 'VU'),
('Venezuela', 'VE'),
('Vietnam', 'VN'),
('Virgin Islands (British)', 'VG'),
('Virgin Islands (U.S.)', 'VI'),
('Wallis and Futuna', 'WF'),
('Western Sahara', 'EH'),
('Yemen', 'YE'),
('Zambia', 'ZM'),
('Zimbabwe', 'ZW');
