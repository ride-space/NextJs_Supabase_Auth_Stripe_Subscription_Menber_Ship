alter table profiles add column customer_id text;

-- membershipsテーブル作成
create table memberships (
  id uuid not null default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  title text not null,
  price int not null,
  content text not null,
  price_id text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- membershipsテーブルRLS設定
alter table memberships enable row level security;
create policy "誰でも参照可能" on memberships for select using ( true );
create policy "自身のメンバーシップを追加" on memberships for insert with check (auth.uid() = profile_id);
create policy "自身のメンバーシップを更新" on memberships for update using (auth.uid() = profile_id);
create policy "自身のメンバーシップを削除" on memberships for delete using (auth.uid() = profile_id);

-- memberships画像のstorage作成
insert into storage.buckets (id, name, public) values ('memberships', 'memberships', true);
create policy "メンバーシップ画像は誰でも参照可能" on storage.objects for select using ( bucket_id = 'memberships' );
create policy "メンバーシップ画像はログインユーザーが追加" on storage.objects for insert with check ( bucket_id = 'memberships' AND auth.role() = 'authenticated' );
create policy "自身のメンバーシップ画像を更新" on storage.objects for update with check ( bucket_id = 'memberships' AND auth.uid() = owner );
create policy "自身のメンバーシップ画像を削除" on storage.objects for delete using ( bucket_id = 'memberships' AND auth.uid() = owner );

-- postsテーブル作成
create table posts (
  id uuid not null default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  title text not null,
  content text not null,
  membership_id uuid references public.memberships on delete cascade,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- postsテーブルRLS設定
alter table posts enable row level security;
create policy "誰でも参照可能" on posts for select using ( true );
create policy "自身の投稿を追加" on posts for insert with check (auth.uid() = profile_id);
create policy "自身の投稿を更新" on posts for update using (auth.uid() = profile_id);
create policy "自身の投稿を削除" on posts for delete using (auth.uid() = profile_id);

-- posts画像のstorage作成
insert into storage.buckets (id, name, public) values ('posts', 'posts', true);
create policy "投稿画像は誰でも参照可能" on storage.objects for select using ( bucket_id = 'posts' );
create policy "投稿画像はログインユーザーが追加" on storage.objects for insert with check ( bucket_id = 'posts' AND auth.role() = 'authenticated' );
create policy "自身の投稿画像を更新" on storage.objects for update with check ( bucket_id = 'posts' AND auth.uid() = owner );
create policy "自身の投稿画像を削除" on storage.objects for delete using ( bucket_id = 'posts' AND auth.uid() = owner );

-- subscriptionsテーブル作成
create table subscriptions (
  profile_id uuid references public.profiles on delete cascade not null,
  membership_id uuid references public.memberships on delete cascade not null,
  primary key (profile_id, membership_id),
  subscription_id text not null,
  customer_id text not null,
  price_id text not null,
  -- サブスクリプションの有効期限
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- subscriptionsテーブルRLS設定
alter table subscriptions enable row level security;
create policy "誰でも参照可能" on subscriptions for select using ( true );
create policy "誰でも追加可能" on subscriptions for insert with check (true);
create policy "誰でも更新可能" on subscriptions for update using (true);
