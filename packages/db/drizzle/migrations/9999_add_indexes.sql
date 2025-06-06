-- migrate/9999_add_indexes.sql

-- Primary Keys
CREATE UNIQUE INDEX IF NOT EXISTS audit_logs_pkey ON public.audit_logs USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS id_pkey ON public.posts USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS leave_balances_pkey ON public.leave_balances USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS notes_pkey ON public.notes USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS positions_pkey ON public.positions USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS post_tags_pkey ON public.post_tags USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS tags_pkey ON public.tags USING btree (id);

-- Constraints using indexes
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY USING INDEX audit_logs_pkey;
ALTER TABLE public.posts ADD CONSTRAINT id_pkey PRIMARY KEY USING INDEX id_pkey;
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_pkey PRIMARY KEY USING INDEX leave_balances_pkey;
ALTER TABLE public.notes ADD CONSTRAINT notes_pkey PRIMARY KEY USING INDEX notes_pkey;
ALTER TABLE public.positions ADD CONSTRAINT positions_pkey PRIMARY KEY USING INDEX positions_pkey;
ALTER TABLE public.post_tags ADD CONSTRAINT post_tags_pkey PRIMARY KEY USING INDEX post_tags_pkey;
ALTER TABLE public.tags ADD CONSTRAINT tags_pkey PRIMARY KEY USING INDEX tags_pkey;
