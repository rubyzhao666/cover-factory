-- =============================================
-- 封面工厂 Supabase 数据库 Schema
-- =============================================

-- 1. profiles 表（用户资料）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  nickname text,
  avatar_url text,
  credits integer default 2,
  total_covers_generated integer default 0,
  total_copywriting_generated integer default 0,
  invited_by uuid references public.profiles(id),
  invite_code text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. credit_transactions 表（积分流水）
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('register_gift', 'purchase', 'cover_generate', 'copywriting_generate', 'invite_reward', 'invited_reward')),
  description text,
  created_at timestamptz default now()
);

-- 3. pricing_plans 表（套餐）
create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  credits integer not null,
  original_price integer not null,
  duration_days integer not null,
  is_popular boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. payment_orders 表（支付订单）
create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  plan_id uuid references public.pricing_plans(id),
  amount integer not null,
  credits integer not null,
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  payment_method text check (payment_method in ('wechat', 'alipay')),
  trade_no text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- =============================================
-- 插入默认套餐数据
-- =============================================
insert into public.pricing_plans (name, price, credits, original_price, duration_days, is_popular, sort_order) values
  ('月度会员', 990, 50, 1490, 30, false, 1),
  ('季度会员', 2490, 200, 4470, 90, true, 2),
  ('年度会员', 7990, 1000, 17880, 365, false, 3);

-- =============================================
-- 触发器：自动生成邀请码
-- =============================================
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text;
  exists boolean;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select exists(select 1 from public.profiles where invite_code = result) into exists;
    if not exists then
      return result;
    end if;
  end loop;
end;
$$;

-- =============================================
-- 触发器：新用户注册自动创建 profile
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nickname, invite_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    public.generate_invite_code()
  );
  return new;
end;
$$;

-- 触发器绑定
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 触发器：新用户注册送 2 积分
-- =============================================
create or replace function public.handle_new_user_credits()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.credit_transactions (user_id, amount, type, description)
  values (new.id, 2, 'register_gift', '新用户注册赠送 2 积分');
  return new;
end;
$$;

create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute procedure public.handle_new_user_credits();

-- =============================================
-- 触发器：绑定邀请关系后发放奖励（双方各 +2）
-- =============================================
create or replace function public.handle_invite_reward()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- 仅在首次绑定 invited_by 时触发，避免重复奖励
  if old.invited_by is null and new.invited_by is not null then
    -- 邀请者 +2
    update public.profiles
    set credits = credits + 2
    where id = new.invited_by;

    -- 被邀请者 +2（注册赠送之外的邀请奖励）
    update public.profiles
    set credits = credits + 2
    where id = new.id;

    -- 记录流水
    insert into public.credit_transactions (user_id, amount, type, description)
    values
      (new.invited_by, 2, 'invite_reward', '成功邀请好友注册，获得 2 积分'),
      (new.id, 2, 'invited_reward', '通过好友邀请注册，获得 2 积分');
  end if;

  return new;
end;
$$;

drop trigger if exists on_profile_invite_bound on public.profiles;
create trigger on_profile_invite_bound
  after update of invited_by on public.profiles
  for each row execute procedure public.handle_invite_reward();

-- =============================================
-- 触发器：自动更新 updated_at
-- =============================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- =============================================
-- RLS (Row Level Security) 策略
-- =============================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- credit_transactions
alter table public.credit_transactions enable row level security;

create policy "Users can view own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- payment_orders
alter table public.payment_orders enable row level security;

create policy "Users can view own orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);

-- pricing_plans（公开读取）
alter table public.pricing_plans enable row level security;

create policy "Anyone can view plans"
  on public.pricing_plans for select
  using (true);

-- =============================================
-- 索引
-- =============================================
create index idx_profiles_invite_code on public.profiles(invite_code);
create index idx_profiles_invited_by on public.profiles(invited_by);
create index idx_credit_transactions_user_id on public.credit_transactions(user_id);
create index idx_payment_orders_user_id on public.payment_orders(user_id);
create index idx_payment_orders_status on public.payment_orders(status);
