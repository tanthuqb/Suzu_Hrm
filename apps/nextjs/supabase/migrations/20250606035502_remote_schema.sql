create type "public"."approval_status" as enum ('pending', 'approved', 'rejected');

create type "public"."office" as enum ('SKY', 'NTL');

create type "public"."post_status" as enum ('draft', 'pending', 'published', 'approved', 'rejected');

create type "public"."status" as enum ('active', 'suspended');

alter table "public"."departments" drop constraint "departments_user_id_fkey";

alter table "public"."users" drop constraint "users_department_id_key";

alter table "public"."assets" drop constraint "assets_assigned_to_users_id_fk";

alter table "public"."notifications" drop constraint "notifications_user_id_users_id_fk";

alter table "public"."permissions" drop constraint "permissions_role_id_roles_id_fk";

alter table "public"."salary_slips" drop constraint "salary_slips_user_id_users_id_fk";

alter table "public"."transactions" drop constraint "transactions_user_id_users_id_fk";

alter table "public"."users" drop constraint "users_role_id_roles_id_fk";

alter table "public"."workflow_steps" drop constraint "workflow_steps_workflow_id_workflows_id_fk";

drop index if exists "public"."users_department_id_key";

create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default gen_random_uuid(),
    "action" text,
    "entity" text,
    "request" text,
    "response" text,
    "payload" jsonb
);


alter table "public"."audit_logs" enable row level security;

create table "public"."leave_balances" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default gen_random_uuid(),
    "year" smallint,
    "total_days" smallint,
    "used_days" smallint,
    "remaining_days" smallint,
    "updated_at" timestamp with time zone default now()
);


create table "public"."notes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "post_id" uuid default gen_random_uuid(),
    "user_id" uuid default gen_random_uuid(),
    "content" text
);


alter table "public"."notes" enable row level security;

create table "public"."positions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying,
    "department_id" uuid default gen_random_uuid(),
    "updated_at" timestamp without time zone
);


alter table "public"."positions" enable row level security;

create table "public"."post_tags" (
    "created_at" timestamp with time zone not null default now(),
    "post_id" uuid default gen_random_uuid(),
    "tag_id" uuid default gen_random_uuid(),
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."post_tags" enable row level security;

create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text,
    "content" text,
    "author_id" uuid default gen_random_uuid(),
    "status" post_status,
    "updated_at" timestamp with time zone default now(),
    "attachments" json
);


alter table "public"."posts" enable row level security;

create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "slug" text
);


alter table "public"."tags" enable row level security;

alter table "public"."attendances" add column "is_remote" boolean default false;

alter table "public"."attendances" add column "leave_request_id" uuid default gen_random_uuid();

alter table "public"."attendances" add column "remote_reason" text;

alter table "public"."attendances" alter column "id" set default gen_random_uuid();

alter table "public"."attendances" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."attendances" alter column "user_id" set default gen_random_uuid();

alter table "public"."departments" drop column "position";

alter table "public"."departments" drop column "user_id";

alter table "public"."departments" add column "office" office default 'NTL'::office;

alter table "public"."leave_requests" drop column "department";

alter table "public"."leave_requests" add column "approval_status" approval_status;

alter table "public"."leave_requests" add column "approved_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text);

alter table "public"."leave_requests" add column "approved_by" uuid;

alter table "public"."leave_requests" add column "department_id" uuid not null;

alter table "public"."leave_requests" add column "status" attendance_status;

alter table "public"."permissions" alter column "allow" set default true;

alter table "public"."permissions" alter column "allow" drop not null;

alter table "public"."permissions" alter column "created_at" set not null;

alter table "public"."permissions" alter column "role_id" drop not null;

alter table "public"."roles" alter column "created_at" set not null;

alter table "public"."users" add column "avatar_url" character varying;

alter table "public"."users" add column "position_id" uuid;

alter table "public"."users" alter column "department_id" drop not null;

alter table "public"."users" alter column "role_id" drop not null;

alter table "public"."users" alter column "status" set default 'active'::status;

alter table "public"."users" alter column "status" set not null;

alter table "public"."users" alter column "status" set data type status using "status"::status;

drop sequence if exists "public"."attendances_id_seq";

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX id_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX leave_balances_pkey ON public.leave_balances USING btree (id);

CREATE UNIQUE INDEX notes_pkey ON public.notes USING btree (id);

CREATE UNIQUE INDEX positions_pkey ON public.positions USING btree (id);

CREATE UNIQUE INDEX post_tags_pkey ON public.post_tags USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."leave_balances" add constraint "leave_balances_pkey" PRIMARY KEY using index "leave_balances_pkey";

alter table "public"."notes" add constraint "notes_pkey" PRIMARY KEY using index "notes_pkey";

alter table "public"."positions" add constraint "positions_pkey" PRIMARY KEY using index "positions_pkey";

alter table "public"."post_tags" add constraint "post_tags_pkey" PRIMARY KEY using index "post_tags_pkey";

alter table "public"."posts" add constraint "id_pkey" PRIMARY KEY using index "id_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."attendances" add constraint "attendances_leaveRequestId_fkey" FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."attendances" validate constraint "attendances_leaveRequestId_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."leave_balances" add constraint "leave_balances_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."leave_balances" validate constraint "leave_balances_user_id_fkey";

alter table "public"."leave_requests" add constraint "leave_requests_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."leave_requests" validate constraint "leave_requests_approved_by_fkey";

alter table "public"."leave_requests" add constraint "leave_requests_department_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."leave_requests" validate constraint "leave_requests_department_fkey";

alter table "public"."leave_requests" add constraint "leave_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leave_requests" validate constraint "leave_requests_user_id_fkey";

alter table "public"."notes" add constraint "notes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."notes" validate constraint "notes_post_id_fkey";

alter table "public"."notes" add constraint "notes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."notes" validate constraint "notes_user_id_fkey";

alter table "public"."positions" add constraint "positions_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."positions" validate constraint "positions_department_id_fkey";

alter table "public"."post_tags" add constraint "post_tags_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."post_tags" validate constraint "post_tags_post_id_fkey";

alter table "public"."post_tags" add constraint "post_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."post_tags" validate constraint "post_tags_tag_id_fkey";

alter table "public"."posts" add constraint "id_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."posts" validate constraint "id_author_id_fkey";

alter table "public"."users" add constraint "users_department_id_departments_id_fk" FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "users_department_id_departments_id_fk";

alter table "public"."users" add constraint "users_position_id_fkey" FOREIGN KEY (position_id) REFERENCES positions(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "users_position_id_fkey";

alter table "public"."assets" add constraint "assets_assigned_to_users_id_fk" FOREIGN KEY (assigned_to) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."assets" validate constraint "assets_assigned_to_users_id_fk";

alter table "public"."notifications" add constraint "notifications_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_users_id_fk";

alter table "public"."permissions" add constraint "permissions_role_id_roles_id_fk" FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."permissions" validate constraint "permissions_role_id_roles_id_fk";

alter table "public"."salary_slips" add constraint "salary_slips_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."salary_slips" validate constraint "salary_slips_user_id_users_id_fk";

alter table "public"."transactions" add constraint "transactions_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_users_id_fk";

alter table "public"."users" add constraint "users_role_id_roles_id_fk" FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "users_role_id_roles_id_fk";

alter table "public"."workflow_steps" add constraint "workflow_steps_workflow_id_workflows_id_fk" FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."workflow_steps" validate constraint "workflow_steps_workflow_id_workflows_id_fk";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."leave_balances" to "anon";

grant insert on table "public"."leave_balances" to "anon";

grant references on table "public"."leave_balances" to "anon";

grant select on table "public"."leave_balances" to "anon";

grant trigger on table "public"."leave_balances" to "anon";

grant truncate on table "public"."leave_balances" to "anon";

grant update on table "public"."leave_balances" to "anon";

grant delete on table "public"."leave_balances" to "authenticated";

grant insert on table "public"."leave_balances" to "authenticated";

grant references on table "public"."leave_balances" to "authenticated";

grant select on table "public"."leave_balances" to "authenticated";

grant trigger on table "public"."leave_balances" to "authenticated";

grant truncate on table "public"."leave_balances" to "authenticated";

grant update on table "public"."leave_balances" to "authenticated";

grant delete on table "public"."leave_balances" to "service_role";

grant insert on table "public"."leave_balances" to "service_role";

grant references on table "public"."leave_balances" to "service_role";

grant select on table "public"."leave_balances" to "service_role";

grant trigger on table "public"."leave_balances" to "service_role";

grant truncate on table "public"."leave_balances" to "service_role";

grant update on table "public"."leave_balances" to "service_role";

grant delete on table "public"."notes" to "anon";

grant insert on table "public"."notes" to "anon";

grant references on table "public"."notes" to "anon";

grant select on table "public"."notes" to "anon";

grant trigger on table "public"."notes" to "anon";

grant truncate on table "public"."notes" to "anon";

grant update on table "public"."notes" to "anon";

grant delete on table "public"."notes" to "authenticated";

grant insert on table "public"."notes" to "authenticated";

grant references on table "public"."notes" to "authenticated";

grant select on table "public"."notes" to "authenticated";

grant trigger on table "public"."notes" to "authenticated";

grant truncate on table "public"."notes" to "authenticated";

grant update on table "public"."notes" to "authenticated";

grant delete on table "public"."notes" to "service_role";

grant insert on table "public"."notes" to "service_role";

grant references on table "public"."notes" to "service_role";

grant select on table "public"."notes" to "service_role";

grant trigger on table "public"."notes" to "service_role";

grant truncate on table "public"."notes" to "service_role";

grant update on table "public"."notes" to "service_role";

grant delete on table "public"."positions" to "anon";

grant insert on table "public"."positions" to "anon";

grant references on table "public"."positions" to "anon";

grant select on table "public"."positions" to "anon";

grant trigger on table "public"."positions" to "anon";

grant truncate on table "public"."positions" to "anon";

grant update on table "public"."positions" to "anon";

grant delete on table "public"."positions" to "authenticated";

grant insert on table "public"."positions" to "authenticated";

grant references on table "public"."positions" to "authenticated";

grant select on table "public"."positions" to "authenticated";

grant trigger on table "public"."positions" to "authenticated";

grant truncate on table "public"."positions" to "authenticated";

grant update on table "public"."positions" to "authenticated";

grant delete on table "public"."positions" to "service_role";

grant insert on table "public"."positions" to "service_role";

grant references on table "public"."positions" to "service_role";

grant select on table "public"."positions" to "service_role";

grant trigger on table "public"."positions" to "service_role";

grant truncate on table "public"."positions" to "service_role";

grant update on table "public"."positions" to "service_role";

grant delete on table "public"."post_tags" to "anon";

grant insert on table "public"."post_tags" to "anon";

grant references on table "public"."post_tags" to "anon";

grant select on table "public"."post_tags" to "anon";

grant trigger on table "public"."post_tags" to "anon";

grant truncate on table "public"."post_tags" to "anon";

grant update on table "public"."post_tags" to "anon";

grant delete on table "public"."post_tags" to "authenticated";

grant insert on table "public"."post_tags" to "authenticated";

grant references on table "public"."post_tags" to "authenticated";

grant select on table "public"."post_tags" to "authenticated";

grant trigger on table "public"."post_tags" to "authenticated";

grant truncate on table "public"."post_tags" to "authenticated";

grant update on table "public"."post_tags" to "authenticated";

grant delete on table "public"."post_tags" to "service_role";

grant insert on table "public"."post_tags" to "service_role";

grant references on table "public"."post_tags" to "service_role";

grant select on table "public"."post_tags" to "service_role";

grant trigger on table "public"."post_tags" to "service_role";

grant truncate on table "public"."post_tags" to "service_role";

grant update on table "public"."post_tags" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


