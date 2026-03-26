/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ 缺少数据库连接串：请设置 SUPABASE_DB_URL 或 DATABASE_URL');
  process.exit(1);
}

const client = new Client({
  connectionString
});

async function setup() {
  await client.connect();
  console.log('✅ 数据库连接成功');

  // 1. 清理
  console.log('\n🔄 清理旧数据...');
  try { await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE'); } catch { console.log('  skip: on_auth_user_created'); }
  try { await client.query('DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users CASCADE'); } catch { console.log('  skip: on_auth_user_created_credits'); }
  try { await client.query('DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles CASCADE'); } catch { console.log('  skip: profiles_updated_at'); }
  try { await client.query('DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE'); } catch { console.log('  skip: handle_new_user'); }
  try { await client.query('DROP FUNCTION IF EXISTS public.handle_new_user_credits() CASCADE'); } catch { console.log('  skip: handle_new_user_credits'); }
  try { await client.query('DROP FUNCTION IF EXISTS public.generate_invite_code() CASCADE'); } catch { console.log('  skip: generate_invite_code'); }
  try { await client.query('DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE'); } catch { console.log('  skip: update_updated_at'); }
  try { await client.query('DROP TABLE IF EXISTS public.payment_orders CASCADE'); } catch { console.log('  skip: payment_orders'); }
  try { await client.query('DROP TABLE IF EXISTS public.credit_transactions CASCADE'); } catch { console.log('  skip: credit_transactions'); }
  try { await client.query('DROP TABLE IF EXISTS public.pricing_plans CASCADE'); } catch { console.log('  skip: pricing_plans'); }
  try { await client.query('DROP TABLE IF EXISTS public.profiles CASCADE'); } catch { console.log('  skip: profiles'); }
  console.log('✅ 清理完成');

  // 2. 建表
  console.log('\n🔄 创建表...');
  await client.query(`
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
  `);
  console.log('✅ profiles 表创建成功');

  await client.query(`
    create table public.credit_transactions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users on delete cascade not null,
      amount integer not null,
      type text not null check (type in ('register_gift','purchase','cover_generate','copywriting_generate','invite_reward','invited_reward')),
      description text,
      created_at timestamptz default now()
    );
  `);
  console.log('✅ credit_transactions 表创建成功');

  await client.query(`
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
  `);
  console.log('✅ pricing_plans 表创建成功');

  await client.query(`
    create table public.payment_orders (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users on delete cascade not null,
      plan_id uuid references public.pricing_plans(id),
      amount integer not null,
      credits integer not null,
      status text default 'pending' check (status in ('pending','paid','failed','expired')),
      payment_method text check (payment_method in ('wechat','alipay')),
      trade_no text,
      created_at timestamptz default now(),
      paid_at timestamptz
    );
  `);
  console.log('✅ payment_orders 表创建成功');

  // 3. 插入套餐
  console.log('\n🔄 插入套餐数据...');
  await client.query(`
    insert into public.pricing_plans (name,price,credits,original_price,duration_days,is_popular,sort_order) values
      ('月度会员',990,50,1490,30,false,1),
      ('季度会员',2490,200,4470,90,true,2),
      ('年度会员',7990,1000,17880,365,false,3);
  `);
  console.log('✅ 套餐数据插入成功');

  // 4. 创建函数
  console.log('\n🔄 创建函数...');
  await client.query(`
    create or replace function public.generate_invite_code() returns text language plpgsql as $$
    declare chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      result text; exists boolean;
    begin loop
        result := '';
        for i in 1..6 loop result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1); end loop;
        select exists(select 1 from public.profiles where invite_code = result) into exists;
        if not exists then return result; end if;
      end loop;
    end;
    $$;
  `);
  console.log('✅ generate_invite_code 函数创建成功');

  await client.query(`
    create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
    begin
      insert into public.profiles (id,email,nickname,invite_code)
      values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email,'@',1)), public.generate_invite_code());
      return new;
    end;
    $$;
  `);
  console.log('✅ handle_new_user 函数创建成功');

  await client.query(`
    create or replace function public.handle_new_user_credits() returns trigger language plpgsql security definer set search_path = '' as $$
    begin
      insert into public.credit_transactions (user_id,amount,type,description) values (new.id,2,'register_gift','新用户注册赠送 2 积分');
      return new;
    end;
    $$;
  `);
  console.log('✅ handle_new_user_credits 函数创建成功');

  await client.query(`
    create or replace function public.update_updated_at() returns trigger language plpgsql as $$
    begin new.updated_at = now(); return new; end;
    $$;
  `);
  console.log('✅ update_updated_at 函数创建成功');

  // 5. 绑定触发器
  console.log('\n🔄 绑定触发器...');
  await client.query('create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();');
  console.log('✅ on_auth_user_created 触发器绑定成功');

  await client.query('create trigger on_auth_user_created_credits after insert on auth.users for each row execute procedure public.handle_new_user_credits();');
  console.log('✅ on_auth_user_created_credits 触发器绑定成功');

  await client.query('create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();');
  console.log('✅ profiles_updated_at 触发器绑定成功');

  // 6. RLS
  console.log('\n🔄 配置 RLS 策略...');
  await client.query('alter table public.profiles enable row level security');
  await client.query('create policy "Users can view all profiles" on public.profiles for select using (true)');
  await client.query('create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id)');
  await client.query('alter table public.credit_transactions enable row level security');
  await client.query('create policy "Users can view own transactions" on public.credit_transactions for select using (auth.uid() = user_id)');
  await client.query('alter table public.payment_orders enable row level security');
  await client.query('create policy "Users can view own orders" on public.payment_orders for select using (auth.uid() = user_id)');
  await client.query('alter table public.pricing_plans enable row level security');
  await client.query('create policy "Anyone can view plans" on public.pricing_plans for select using (true)');
  console.log('✅ RLS 策略配置完成');

  // 7. 索引
  console.log('\n🔄 创建索引...');
  await client.query('create index idx_profiles_invite_code on public.profiles(invite_code)');
  await client.query('create index idx_profiles_invited_by on public.profiles(invited_by)');
  await client.query('create index idx_credit_transactions_user_id on public.credit_transactions(user_id)');
  await client.query('create index idx_payment_orders_user_id on public.payment_orders(user_id)');
  await client.query('create index idx_payment_orders_status on public.payment_orders(status)');
  console.log('✅ 索引创建完成');

  // 验证
  console.log('\n🔍 验证...');
  const tables = await client.query("select tablename from pg_tables where schemaname='public'");
  console.log('已创建的表:', tables.rows.map(r => r.tablename).join(', '));

  const plans = await client.query('select name, price, credits from public.pricing_plans');
  console.log('套餐数据:', plans.rows.map(r => `${r.name}: ¥${r.price/100} / ${r.credits}积分`).join(', '));

  await client.end();
  console.log('\n🎉 数据库建表全部完成！');
}

setup().catch(e => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});
