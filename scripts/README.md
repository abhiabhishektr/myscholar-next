# Database Seed Scripts

## Admin User Seed

Creates a default admin user for initial system access.

### Usage

```bash
npm run db:seed
```

### Default Credentials

- **Email:** `admin@myscholar.com`
- **Password:** `Admin@123`
- **Role:** `admin`

### Important Notes

⚠️ **Security Warning:**

- Change the default password immediately after first login
- The admin user is created with email verification already enabled
- The seed script is idempotent - it will skip creation if the admin user already exists

### What it does

1. Checks if admin user already exists
2. Creates admin user with verified email
3. Creates credential account with hashed password
4. Sets role to 'admin' for full system access

### Manual Cleanup

To remove the seeded admin user:

```sql
DELETE FROM account WHERE user_id IN (SELECT id FROM "user" WHERE email = 'admin@myscholar.com');
DELETE FROM "user" WHERE email = 'admin@myscholar.com';
```
