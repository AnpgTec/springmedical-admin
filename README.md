# Spring Medical Admin

轻量运营后台：商品、订单、支付、预约、管理员。  
**不含**官网 CMS；静态页改仓库发版。

```bash
npm install
npm run dev
```

打开：http://localhost:3001

连接与官网同一套 Supabase（staging / production 用环境变量切换）。  
建立管理员账号需要 `SUPABASE_SERVICE_ROLE_KEY`（只放服务器，不要进浏览器）。

## 首个超管（交付前由我们做一次）

1. Supabase Dashboard → Authentication → Users → Add user（邮箱+密码）
2. 复制该用户 UUID，在 SQL Editor 执行：

```sql
insert into public.admin_profiles (id, display_name, role, status)
values ('<auth.users.id>', '超管', 'admin', 1);
```

仅 `admin_profiles.status = 1` 的账号可登录。

交付客户后，后续运营 / 超管都在后台「管理員」页填写电邮、显示名、角色和初始密码即可，不必再进 Supabase。
