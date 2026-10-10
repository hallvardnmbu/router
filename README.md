# Setup

## Refresh the app

Pushing to `main` deploys automatically via `.github/workflows/deploy.yml`, which
SSHs into the server and runs `scripts/deploy.sh`. It can also be run from the
Actions tab ("Run workflow"), or by hand on the server:

```bash
bash /var/www/router/scripts/deploy.sh
```

Submodules may also trigger the workflow from their repositories.

### Automatic deploys (one-time setup)

On the server, create a deploy key and allow the service restart without a password:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy   # copy into the DEPLOY_SSH_KEY secret, then delete the file

echo "snuble ALL=(root) NOPASSWD: /usr/bin/systemctl restart router, /usr/bin/systemctl is-active router" \
  | sudo tee /etc/sudoers.d/router-deploy
sudo chmod 440 /etc/sudoers.d/router-deploy
```

In GitHub, under Settings → Secrets and variables → Actions, add:

- `DEPLOY_HOST`: the droplet's IP or hostname
- `DEPLOY_USER`: `snuble`
- `DEPLOY_SSH_KEY`: the private key above

To deploy when a submodule repo is pushed, add a workflow there that sends a
`repository_dispatch` event of type `deploy` to this repo (needs a token with
access to `hallvardnmbu/router`).

## First-time setup

### 1. Dependencies

```bash
sudo apt update
sudo apt install nginx unzip python3-certbot-dns-cloudflare python3-certbot-nginx
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone the app

```bash
sudo mkdir -p /var/www/router
cd /var/www/router
sudo git clone https://github.com/hallvardnmbu/router.git .
sudo git submodule update --init --recursive
sudo chown -R $USER:$USER /var/www/router

cd src/reinli
bun install
bun run build
cd ../..
```

### 3. Certificate (DNS-01 via Cloudflare)

```bash
sudo mkdir -p /etc/letsencrypt/cloudflare
sudo vim /etc/letsencrypt/cloudflare/credentials.ini
```

```ini
dns_cloudflare_api_token = your_scoped_token
```

```bash
sudo chmod 600 /etc/letsencrypt/cloudflare/credentials.ini

sudo cp /usr/lib/python3/dist-packages/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
  /etc/letsencrypt/options-ssl-nginx.conf
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048

sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare/credentials.ini \
  --dns-cloudflare-propagation-seconds 30 \
  --cert-name router \
  -d dagsord.no -d www.dagsord.no \
  -d dilettant.no -d "*.dilettant.no" \
  -d reinlidigital.no -d www.reinlidigital.no \
  -d ferniss.no -d www.ferniss.no \
  --deploy-hook "systemctl reload nginx"
```

### 4. nginx

```bash
sudo vim /etc/nginx/sites-available/router
```

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/router/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/router/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/router /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. systemd service

```bash
sudo vim /etc/systemd/system/router.service
```

```ini
[Unit]
Description=Router
After=network.target

[Service]
Type=simple
User=snuble
WorkingDirectory=/var/www/router

Environment=ENVIRONMENT=production
Environment=PORT=8080

ExecStart=/home/snuble/.bun/bin/bun run start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable router
sudo systemctl start router
sudo systemctl status router
```

### 6. Verify renewal works

```bash
sudo certbot renew --dry-run
```
