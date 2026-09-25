-- Universe-1218 Corps backend schema specification.
-- This file is intentionally not a migration yet. It must be applied and
-- verified against a dedicated Lanterns Supabase project before a migration
-- history entry is created.

create schema if not exists corps_private;
revoke all on schema corps_private from public, anon, authenticated;

create or replace function corps_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function corps_private.set_updated_at() from public, anon, authenticated;

create table if not exists public.lantern_selection_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  case_id text not null default '2814-E/001',
  evidence_order text[] not null,
  criteria_version text not null default 'u1218-selection-v1',
  selected_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  check (
    cardinality(evidence_order) = 3
    and evidence_order @> array['scene', 'witness', 'record']::text[]
    and evidence_order <@ array['scene', 'witness', 'record']::text[]
  )
);

create table if not exists public.lantern_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selection_claim_id uuid not null unique
    references public.lantern_selection_claims(id) on delete restrict,
  ring_serial text not null unique check (ring_serial ~ '^2814-[0-9]{8}
create table if not exists public.lantern_service_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text,
  event_type text not null,
  summary text not null check (char_length(summary) between 1 and 500),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lantern_service_events_user_time_idx
  on public.lantern_service_events (user_id, occurred_at desc);

create table if not exists public.assignment_definitions (
  id uuid primary key default gen_random_uuid(),
  assignment_key text not null unique,
  case_id text,
  title text not null,
  brief text not null,
  objective text not null,
  target_system text not null
    check (target_system in ('archive', 'case', 'sector', 'construct')),
  definition jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger assignment_definitions_set_updated_at
before update on public.assignment_definitions
for each row execute function corps_private.set_updated_at();

create table if not exists public.lantern_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignment_definitions(id) on delete restrict,
  state text not null
    check (state in ('ACTIVE', 'AVAILABLE', 'BLOCKED', 'QUEUED', 'COMPLETE')),
  state_data jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, assignment_id)
);

create index if not exists lantern_assignments_user_state_idx
  on public.lantern_assignments (user_id, state);

create trigger lantern_assignments_set_updated_at
before update on public.lantern_assignments
for each row execute function corps_private.set_updated_at();

create table if not exists public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  assignment_instance_id uuid not null references public.lantern_assignments(id) on delete cascade,
  sector text not null,
  summary text not null check (char_length(summary) between 1 and 500),
  status text not null default 'OPEN'
    check (status in ('OPEN', 'ANSWERED', 'ACCEPTED', 'CLOSED', 'CANCELLED')),
  accepted_response_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists assistance_requests_status_sector_idx
  on public.assistance_requests (status, sector, created_at desc);

create trigger assistance_requests_set_updated_at
before update on public.assistance_requests
for each row execute function corps_private.set_updated_at();

create table if not exists public.assistance_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.assistance_requests(id) on delete cascade,
  responder_user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 1000),
  created_at timestamptz not null default timezone('utc', now()),
  unique (request_id, responder_user_id)
);

alter table public.assistance_requests
  add constraint assistance_requests_accepted_response_fk
  foreign key (accepted_response_id)
  references public.assistance_responses(id)
  on delete set null;

create index if not exists assistance_responses_request_idx
  on public.assistance_responses (request_id, created_at);

create table if not exists public.corps_transmissions (
  id uuid primary key default gen_random_uuid(),
  assistance_request_id uuid not null references public.assistance_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists corps_transmissions_request_time_idx
  on public.corps_transmissions (assistance_request_id, created_at);

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  title text not null,
  status text not null
    check (status in ('SCHEDULED', 'ACTIVE', 'RESOLVED', 'CANCELLED')),
  scope text not null
    check (scope in ('CORPS', 'SECTOR', 'SUBSECTOR')),
  sector text,
  brief text not null,
  payload jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists world_events_status_start_idx
  on public.world_events (status, starts_at);

create trigger world_events_set_updated_at
before update on public.world_events
for each row execute function corps_private.set_updated_at();

create table if not exists public.world_event_participants (
  world_event_id uuid not null references public.world_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'JOINED'
    check (state in ('JOINED', 'ACTIVE', 'COMPLETE', 'WITHDRAWN')),
  state_data jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (world_event_id, user_id)
);

create index if not exists world_event_participants_user_idx
  on public.world_event_participants (user_id, updated_at desc);

create trigger world_event_participants_set_updated_at
before update on public.world_event_participants
for each row execute function corps_private.set_updated_at();

-- Data API grants. RLS below is still required for row authorization.
revoke all on public.lantern_selection_claims from anon, authenticated;
revoke all on public.lantern_profiles from anon, authenticated;
grant select on public.lantern_profiles to authenticated;
grant update (display_name, discoverable) on public.lantern_profiles to authenticated;

revoke all on public.lantern_service_events from anon, authenticated;
grant select on public.lantern_service_events to authenticated;

revoke all on public.assignment_definitions from anon, authenticated;
grant select on public.assignment_definitions to authenticated;

revoke all on public.lantern_assignments from anon, authenticated;
grant select on public.lantern_assignments to authenticated;

revoke all on public.assistance_requests from anon, authenticated;
grant select, insert on public.assistance_requests to authenticated;
grant update (status, accepted_response_id) on public.assistance_requests to authenticated;

revoke all on public.assistance_responses from anon, authenticated;
grant select, insert on public.assistance_responses to authenticated;

revoke all on public.corps_transmissions from anon, authenticated;
grant select, insert on public.corps_transmissions to authenticated;

revoke all on public.world_events from anon, authenticated;
grant select on public.world_events to authenticated;

revoke all on public.world_event_participants from anon, authenticated;
grant select, insert on public.world_event_participants to authenticated;
grant update (state, state_data) on public.world_event_participants to authenticated;

alter table public.lantern_selection_claims enable row level security;
alter table public.lantern_profiles enable row level security;
alter table public.lantern_service_events enable row level security;
alter table public.assignment_definitions enable row level security;
alter table public.lantern_assignments enable row level security;
alter table public.assistance_requests enable row level security;
alter table public.assistance_responses enable row level security;
alter table public.corps_transmissions enable row level security;
alter table public.world_events enable row level security;
alter table public.world_event_participants enable row level security;

create policy "lanterns can read discoverable profiles"
on public.lantern_profiles
for select
to authenticated
using (discoverable or (select auth.uid()) = user_id);

create policy "lanterns can update own profile presentation"
on public.lantern_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "lanterns can read own service events"
on public.lantern_service_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "lanterns can read active assignment definitions"
on public.assignment_definitions
for select
to authenticated
using (active);

create policy "lanterns can read own assignment instances"
on public.lantern_assignments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "lanterns can read open or own assistance requests"
on public.assistance_requests
for select
to authenticated
using (
  status = 'OPEN'
  or requester_user_id = (select auth.uid())
  or exists (
    select 1
    from public.assistance_responses response
    where response.request_id = assistance_requests.id
      and response.responder_user_id = (select auth.uid())
  )
);

create policy "lanterns can request assistance for own assignment"
on public.assistance_requests
for insert
to authenticated
with check (
  requester_user_id = (select auth.uid())
  and exists (
    select 1
    from public.lantern_assignments assignment
    where assignment.id = assignment_instance_id
      and assignment.user_id = (select auth.uid())
  )
);

create policy "requesters can update own assistance state"
on public.assistance_requests
for update
to authenticated
using (requester_user_id = (select auth.uid()))
with check (requester_user_id = (select auth.uid()));

create policy "participants can read assistance responses"
on public.assistance_responses
for select
to authenticated
using (
  responder_user_id = (select auth.uid())
  or exists (
    select 1
    from public.assistance_requests request
    where request.id = request_id
      and request.requester_user_id = (select auth.uid())
  )
);

create policy "lanterns can answer open assistance requests"
on public.assistance_responses
for insert
to authenticated
with check (
  responder_user_id = (select auth.uid())
  and exists (
    select 1
    from public.assistance_requests request
    where request.id = request_id
      and request.status = 'OPEN'
      and request.requester_user_id <> (select auth.uid())
  )
);

create policy "assistance participants can read transmissions"
on public.corps_transmissions
for select
to authenticated
using (
  exists (
    select 1
    from public.assistance_requests request
    where request.id = assistance_request_id
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "assistance participants can send transmissions"
on public.corps_transmissions
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1
    from public.assistance_requests request
    where request.id = assistance_request_id
      and request.status in ('OPEN', 'ANSWERED', 'ACCEPTED')
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "authenticated lanterns can read world events"
on public.world_events
for select
to authenticated
using (status <> 'CANCELLED');

create policy "lanterns can read own world event participation"
on public.world_event_participants
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "lanterns can join visible world events"
on public.world_event_participants
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.world_events event
    where event.id = world_event_id
      and event.status in ('SCHEDULED', 'ACTIVE')
  )
);

create policy "lanterns can update own event participation"
on public.world_event_participants
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Private Realtime authorization.
-- Topics:
--   assist:<assistance_request_uuid>
--   event:<world_event_uuid>
alter table realtime.messages enable row level security;

create policy "assistance participants can receive private broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.assistance_requests request
    where ('assist:' || request.id::text) = (select realtime.topic())
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "assistance participants can send private broadcasts"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.assistance_requests request
    where ('assist:' || request.id::text) = (select realtime.topic())
      and request.status in ('OPEN', 'ANSWERED', 'ACCEPTED')
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "event participants can receive private broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.world_event_participants participant
    where ('event:' || participant.world_event_id::text) = (select realtime.topic())
      and participant.user_id = (select auth.uid())
  )
);
),
  display_name text check (char_length(display_name) between 1 and 64),
  species text not null default 'HUMAN',
  homeworld text not null default 'EARTH',
  sector text not null default '2814',
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  discoverable boolean not null default true,
  selected_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger lantern_profiles_set_updated_at
before update on public.lantern_profiles
for each row execute function corps_private.set_updated_at();

create or replace function corps_private.allocate_ring_serial()
returns text
language plpgsql
volatile
set search_path = ''
as $
declare
  candidate text;
begin
  for attempt in 1..32 loop
    candidate :=
      '2814-' ||
      lpad(floor(random() * 100000000)::bigint::text, 8, '0');

    if not exists (
      select 1
      from public.lantern_profiles profile
      where profile.ring_serial = candidate
    ) then
      return candidate;
    end if;
  end loop;

  raise exception 'Unable to allocate a unique Lantern ring serial';
end;
$;

revoke all on function corps_private.allocate_ring_serial() from public, anon, authenticated;

create or replace function public.server_claim_lantern_identity(
  p_user_id uuid,
  p_display_name text,
  p_evidence_order text[]
)
returns public.lantern_profiles
language plpgsql
security definer
set search_path = ''
as $
declare
  existing_profile public.lantern_profiles;
  claim_id uuid;
  issued_profile public.lantern_profiles;
  clean_name text;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  if not exists (
    select 1 from auth.users account where account.id = p_user_id
  ) then
    raise exception 'Authenticated account does not exist';
  end if;

  select *
  into existing_profile
  from public.lantern_profiles profile
  where profile.user_id = p_user_id;

  if found then
    return existing_profile;
  end if;

  if (
    p_evidence_order is null
    or cardinality(p_evidence_order) <> 3
    or not (
      p_evidence_order @> array['scene', 'witness', 'record']::text[]
      and p_evidence_order <@ array['scene', 'witness', 'record']::text[]
    )
  ) then
    raise exception 'Selection requires all three case records exactly once';
  end if;

  clean_name := nullif(btrim(p_display_name), '');

  if clean_name is not null and char_length(clean_name) > 64 then
    raise exception 'Display name exceeds 64 characters';
  end if;

  insert into public.lantern_selection_claims (
    user_id,
    evidence_order
  )
  values (
    p_user_id,
    p_evidence_order
  )
  returning id into claim_id;

  insert into public.lantern_profiles (
    user_id,
    selection_claim_id,
    ring_serial,
    display_name,
    selected_at
  )
  select
    claim.user_id,
    claim.id,
    corps_private.allocate_ring_serial(),
    clean_name,
    claim.selected_at
  from public.lantern_selection_claims claim
  where claim.id = claim_id
  returning * into issued_profile;

  return issued_profile;
end;
$;

revoke all on function public.server_claim_lantern_identity(uuid, text, text[])
  from public, anon, authenticated;
grant execute on function public.server_claim_lantern_identity(uuid, text, text[])
  to service_role;

create table if not exists public.lantern_service_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text,
  event_type text not null,
  summary text not null check (char_length(summary) between 1 and 500),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lantern_service_events_user_time_idx
  on public.lantern_service_events (user_id, occurred_at desc);

create table if not exists public.assignment_definitions (
  id uuid primary key default gen_random_uuid(),
  assignment_key text not null unique,
  case_id text,
  title text not null,
  brief text not null,
  objective text not null,
  target_system text not null
    check (target_system in ('archive', 'case', 'sector', 'construct')),
  definition jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger assignment_definitions_set_updated_at
before update on public.assignment_definitions
for each row execute function corps_private.set_updated_at();

create table if not exists public.lantern_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignment_definitions(id) on delete restrict,
  state text not null
    check (state in ('ACTIVE', 'AVAILABLE', 'BLOCKED', 'QUEUED', 'COMPLETE')),
  state_data jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, assignment_id)
);

create index if not exists lantern_assignments_user_state_idx
  on public.lantern_assignments (user_id, state);

create trigger lantern_assignments_set_updated_at
before update on public.lantern_assignments
for each row execute function corps_private.set_updated_at();

create table if not exists public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  assignment_instance_id uuid not null references public.lantern_assignments(id) on delete cascade,
  sector text not null,
  summary text not null check (char_length(summary) between 1 and 500),
  status text not null default 'OPEN'
    check (status in ('OPEN', 'ANSWERED', 'ACCEPTED', 'CLOSED', 'CANCELLED')),
  accepted_response_id uuid,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists assistance_requests_status_sector_idx
  on public.assistance_requests (status, sector, created_at desc);

create trigger assistance_requests_set_updated_at
before update on public.assistance_requests
for each row execute function corps_private.set_updated_at();

create table if not exists public.assistance_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.assistance_requests(id) on delete cascade,
  responder_user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 1000),
  created_at timestamptz not null default timezone('utc', now()),
  unique (request_id, responder_user_id)
);

alter table public.assistance_requests
  add constraint assistance_requests_accepted_response_fk
  foreign key (accepted_response_id)
  references public.assistance_responses(id)
  on delete set null;

create index if not exists assistance_responses_request_idx
  on public.assistance_responses (request_id, created_at);

create table if not exists public.corps_transmissions (
  id uuid primary key default gen_random_uuid(),
  assistance_request_id uuid not null references public.assistance_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists corps_transmissions_request_time_idx
  on public.corps_transmissions (assistance_request_id, created_at);

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  title text not null,
  status text not null
    check (status in ('SCHEDULED', 'ACTIVE', 'RESOLVED', 'CANCELLED')),
  scope text not null
    check (scope in ('CORPS', 'SECTOR', 'SUBSECTOR')),
  sector text,
  brief text not null,
  payload jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists world_events_status_start_idx
  on public.world_events (status, starts_at);

create trigger world_events_set_updated_at
before update on public.world_events
for each row execute function corps_private.set_updated_at();

create table if not exists public.world_event_participants (
  world_event_id uuid not null references public.world_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'JOINED'
    check (state in ('JOINED', 'ACTIVE', 'COMPLETE', 'WITHDRAWN')),
  state_data jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (world_event_id, user_id)
);

create index if not exists world_event_participants_user_idx
  on public.world_event_participants (user_id, updated_at desc);

create trigger world_event_participants_set_updated_at
before update on public.world_event_participants
for each row execute function corps_private.set_updated_at();

-- Data API grants. RLS below is still required for row authorization.
revoke all on public.lantern_profiles from anon, authenticated;
grant select on public.lantern_profiles to authenticated;
grant update (display_name, discoverable) on public.lantern_profiles to authenticated;

revoke all on public.lantern_service_events from anon, authenticated;
grant select on public.lantern_service_events to authenticated;

revoke all on public.assignment_definitions from anon, authenticated;
grant select on public.assignment_definitions to authenticated;

revoke all on public.lantern_assignments from anon, authenticated;
grant select on public.lantern_assignments to authenticated;

revoke all on public.assistance_requests from anon, authenticated;
grant select, insert on public.assistance_requests to authenticated;
grant update (status, accepted_response_id) on public.assistance_requests to authenticated;

revoke all on public.assistance_responses from anon, authenticated;
grant select, insert on public.assistance_responses to authenticated;

revoke all on public.corps_transmissions from anon, authenticated;
grant select, insert on public.corps_transmissions to authenticated;

revoke all on public.world_events from anon, authenticated;
grant select on public.world_events to authenticated;

revoke all on public.world_event_participants from anon, authenticated;
grant select, insert on public.world_event_participants to authenticated;
grant update (state, state_data) on public.world_event_participants to authenticated;

alter table public.lantern_profiles enable row level security;
alter table public.lantern_service_events enable row level security;
alter table public.assignment_definitions enable row level security;
alter table public.lantern_assignments enable row level security;
alter table public.assistance_requests enable row level security;
alter table public.assistance_responses enable row level security;
alter table public.corps_transmissions enable row level security;
alter table public.world_events enable row level security;
alter table public.world_event_participants enable row level security;

create policy "lanterns can read discoverable profiles"
on public.lantern_profiles
for select
to authenticated
using (discoverable or (select auth.uid()) = user_id);

create policy "lanterns can update own profile presentation"
on public.lantern_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "lanterns can read own service events"
on public.lantern_service_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "lanterns can read active assignment definitions"
on public.assignment_definitions
for select
to authenticated
using (active);

create policy "lanterns can read own assignment instances"
on public.lantern_assignments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "lanterns can read open or own assistance requests"
on public.assistance_requests
for select
to authenticated
using (
  status = 'OPEN'
  or requester_user_id = (select auth.uid())
  or exists (
    select 1
    from public.assistance_responses response
    where response.request_id = assistance_requests.id
      and response.responder_user_id = (select auth.uid())
  )
);

create policy "lanterns can request assistance for own assignment"
on public.assistance_requests
for insert
to authenticated
with check (
  requester_user_id = (select auth.uid())
  and exists (
    select 1
    from public.lantern_assignments assignment
    where assignment.id = assignment_instance_id
      and assignment.user_id = (select auth.uid())
  )
);

create policy "requesters can update own assistance state"
on public.assistance_requests
for update
to authenticated
using (requester_user_id = (select auth.uid()))
with check (requester_user_id = (select auth.uid()));

create policy "participants can read assistance responses"
on public.assistance_responses
for select
to authenticated
using (
  responder_user_id = (select auth.uid())
  or exists (
    select 1
    from public.assistance_requests request
    where request.id = request_id
      and request.requester_user_id = (select auth.uid())
  )
);

create policy "lanterns can answer open assistance requests"
on public.assistance_responses
for insert
to authenticated
with check (
  responder_user_id = (select auth.uid())
  and exists (
    select 1
    from public.assistance_requests request
    where request.id = request_id
      and request.status = 'OPEN'
      and request.requester_user_id <> (select auth.uid())
  )
);

create policy "assistance participants can read transmissions"
on public.corps_transmissions
for select
to authenticated
using (
  exists (
    select 1
    from public.assistance_requests request
    where request.id = assistance_request_id
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "assistance participants can send transmissions"
on public.corps_transmissions
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1
    from public.assistance_requests request
    where request.id = assistance_request_id
      and request.status in ('OPEN', 'ANSWERED', 'ACCEPTED')
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "authenticated lanterns can read world events"
on public.world_events
for select
to authenticated
using (status <> 'CANCELLED');

create policy "lanterns can read own world event participation"
on public.world_event_participants
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "lanterns can join visible world events"
on public.world_event_participants
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.world_events event
    where event.id = world_event_id
      and event.status in ('SCHEDULED', 'ACTIVE')
  )
);

create policy "lanterns can update own event participation"
on public.world_event_participants
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Private Realtime authorization.
-- Topics:
--   assist:<assistance_request_uuid>
--   event:<world_event_uuid>
alter table realtime.messages enable row level security;

create policy "assistance participants can receive private broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.assistance_requests request
    where ('assist:' || request.id::text) = (select realtime.topic())
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "assistance participants can send private broadcasts"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.assistance_requests request
    where ('assist:' || request.id::text) = (select realtime.topic())
      and request.status in ('OPEN', 'ANSWERED', 'ACCEPTED')
      and (
        request.requester_user_id = (select auth.uid())
        or exists (
          select 1
          from public.assistance_responses response
          where response.request_id = request.id
            and response.responder_user_id = (select auth.uid())
        )
      )
  )
);

create policy "event participants can receive private broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and exists (
    select 1
    from public.world_event_participants participant
    where ('event:' || participant.world_event_id::text) = (select realtime.topic())
      and participant.user_id = (select auth.uid())
  )
);
