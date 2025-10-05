# Local MySQL Integration

1) Install MySQL locally and note your credentials.
- Host: localhost (or 127.0.0.1)
- Port: 3306 (default)
- User/Password: your local MySQL user
- Database: create one, e.g. escrow_app

2) Create the schema.
- In your MySQL client, run the SQL in scripts/mysql/001_init.sql (you can copy-paste it).
- This creates users and orders tables with sensible indexes and no mock data.

3) Configure environment variables in the v0 Project Settings (Gear icon → Environment Variables).
Use either DATABASE_URL or the discrete MYSQL_* variables (server-only):
- DATABASE_URL (preferred): mysql://USER:PASSWORD@HOST:PORT/DBNAME
OR
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

4) Publish or restart the preview so server routes pick up env vars.

5) Test the app:
- Register a user at /register (registration enforces MX DNS check; use a real domain like gmail.com, your company, etc.).
- Connect your wallet on Buyer/Seller dashboards.
- The dashboards will query /api/orders with your wallet address. Insert orders manually at first:
  INSERT INTO orders (product,buyer_name,seller_name,buyer_wallet,seller_wallet,amount_cents,currency,status,progress,delivery_status,escrow_hash)
  VALUES ('Sample Product','Alice','Bob','0xBUYER','0xSELLER',249900,'USD','locked',33,'Processing','0x...');

Notes:
- All DB queries use parameterized statements.
- Update schema as your product evolves (add foreign keys to users if desired).
