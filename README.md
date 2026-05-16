# Setup

# Refresh the app

```bash
bun upgrade

cd /var/www/router
git pull

# To initialize the submodules.
# git submodule update --init --recursive
git submodule update --remote --merge

cd src/reinli
bun install
bunx vite build
cd ../..

sudo systemctl daemon-reload
sudo systemctl restart router
```

```bash
sudo systemctl status router
```

# Set up the app

## 1.

```bash
sudo apt update
sudo apt install nginx
sudo apt install unzip
curl -fsSL https://bun.sh/install | bash
```

## 2.

```bash
sudo mkdir -p /var/www/router
cd /var/www/router
sudo git clone https://github.com/hallvardnmbu/router.git .
sudo git submodule update --init --recursive
sudo chown -R $USER:$USER /var/www/router
```

## 3.

```bash
sudo vim /etc/nginx/sites-available/router
```

```raw
# dagsord.no
server {
	listen 80;
	server_name dagsord.no;

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

# www.dagsord.no
server {
	listen 80;
	server_name www.dagsord.no;

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

# dilettant.no
server {
	listen 80;
	server_name dilettant.no;

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

# www.dilettant.no
server {
	listen 80;
	server_name www.dilettant.no;

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

# reinli.dilettant.no
server {
	listen 80;
	server_name reinli.dilettant.no;

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

## 4.

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
```

## 5.

```bash
sudo ln -s /etc/nginx/sites-available/router /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

## 5.

```bash
sudo vim /etc/systemd/system/router.service
```

```raw
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

## 6.

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dagsord.no
sudo certbot --nginx -d www.dagsord.no
sudo certbot --nginx -d dilettant.no
sudo certbot --nginx -d www.dilettant.no
sudo certbot --nginx -d reinli.dilettant.no
sudo systemctl reload nginx
```
