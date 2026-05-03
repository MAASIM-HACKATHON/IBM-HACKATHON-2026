# PyMuPDF PDF Parser - Deployment Guide

## Quick Start

### Prerequisites

- Python 3.9 or higher
- pip package manager
- Node.js 18+ (for Node.js server integration)

### Installation Steps

#### 1. Set Up Python Service

```bash
# Navigate to Python parser directory
cd server/python-parser

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional)
cp .env.example .env
# Edit .env with your settings
```

#### 2. Start Python Service

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 3. Install Node.js Dependencies

```bash
# Navigate to server directory
cd ../

# Install axios (if not already installed)
npm install axios

# Or install all dependencies
npm install
```

#### 4. Configure Node.js Server

Add to `server/.env`:
```env
# Python Parser Service URL
PYTHON_PARSER_URL=http://localhost:8000

# Enable/disable Python parser (default: true)
USE_PYTHON_PARSER=true
```

#### 5. Start Node.js Server

```bash
# In server directory
npm run dev
```

#### 6. Verify Integration

```bash
# Test Python service health
curl http://localhost:8000/health

# Test Node.js server
curl http://localhost:3001/api/resume/parse \
  -F "file=@path/to/resume.pdf"
```

---

## Docker Deployment

### Build Docker Image

```bash
cd server/python-parser

# Build image
docker build -t pdf-parser:latest .

# Run container
docker run -d \
  --name pdf-parser \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e LOG_LEVEL=INFO \
  pdf-parser:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  pdf-parser:
    build: ./server/python-parser
    container_name: pdf-parser
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
      - MAX_FILE_SIZE=10485760
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  nodejs-server:
    build: ./server
    container_name: nodejs-server
    ports:
      - "3001:3001"
    environment:
      - PYTHON_PARSER_URL=http://pdf-parser:8000
      - USE_PYTHON_PARSER=true
    depends_on:
      - pdf-parser
    restart: unless-stopped
```

Start services:
```bash
docker-compose up -d
```

---

## Production Deployment

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 1GB for application + space for logs
- **Network**: Internal network access between services

### Environment Configuration

#### Python Service (.env)

```env
# Service Configuration
SERVICE_NAME="PDF Parser Microservice"
SERVICE_VERSION="1.0.0"

# Server Settings
HOST="0.0.0.0"
PORT=8000

# CORS Origins
CORS_ORIGINS="http://nodejs-server:3001,https://your-domain.com"

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB

# Logging
LOG_LEVEL="INFO"

# Environment
ENVIRONMENT="production"
```

#### Node.js Server (.env)

```env
# Python Parser Service
PYTHON_PARSER_URL=http://pdf-parser:8000
USE_PYTHON_PARSER=true

# Other configurations...
```

### Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start Python service
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4" \
  --name pdf-parser \
  --cwd /path/to/server/python-parser

# Start Node.js server
pm2 start npm --name nodejs-server -- run start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

#### Using Systemd

Create `/etc/systemd/system/pdf-parser.service`:

```ini
[Unit]
Description=PDF Parser Microservice
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server/python-parser
Environment="PATH=/path/to/server/python-parser/venv/bin"
ExecStart=/path/to/server/python-parser/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable pdf-parser
sudo systemctl start pdf-parser
sudo systemctl status pdf-parser
```

---

## Monitoring

### Health Checks

```bash
# Python service health
curl http://localhost:8000/health

# Detailed status
curl http://localhost:8000/status
```

### Logs

```bash
# Python service logs (if using uvicorn directly)
tail -f /var/log/pdf-parser.log

# PM2 logs
pm2 logs pdf-parser

# Docker logs
docker logs -f pdf-parser
```

### Metrics

Monitor these metrics:
- Response time (should be < 500ms per page)
- Error rate (should be < 1%)
- Memory usage (should be < 200MB per worker)
- CPU usage (should be < 50% average)

---

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Start multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 8

# Or run multiple instances
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4 &
uvicorn app.main:app --host 0.0.0.0 --port 8002 --workers 4 &
```

### Load Balancer Configuration (Nginx)

```nginx
upstream pdf_parser {
    least_conn;
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    listen 8000;
    
    location / {
        proxy_pass http://pdf_parser;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check Python version
python --version  # Should be 3.9+

# Check dependencies
pip list | grep -E "fastapi|uvicorn|PyMuPDF"

# Check port availability
lsof -i :8000

# Check logs
tail -f /var/log/pdf-parser.log
```

### Connection Refused

```bash
# Verify service is running
curl http://localhost:8000/health

# Check firewall
sudo ufw status

# Check CORS configuration
# Ensure Node.js server origin is in CORS_ORIGINS
```

### High Memory Usage

```bash
# Reduce number of workers
uvicorn app.main:app --workers 2

# Set memory limits (Docker)
docker run --memory="1g" pdf-parser:latest

# Monitor memory
watch -n 1 'ps aux | grep uvicorn'
```

### Slow Performance

```bash
# Increase workers
uvicorn app.main:app --workers 8

# Check system resources
top
htop

# Profile the application
python -m cProfile -o profile.stats app/main.py
```

---

## Security

### Best Practices

1. **Run as non-root user**
   ```bash
   useradd -m -s /bin/bash pdfparser
   chown -R pdfparser:pdfparser /path/to/python-parser
   ```

2. **Restrict CORS origins**
   ```env
   CORS_ORIGINS="https://your-domain.com"
   ```

3. **Use HTTPS in production**
   - Deploy behind reverse proxy (Nginx/Apache)
   - Use SSL/TLS certificates

4. **Limit file sizes**
   ```env
   MAX_FILE_SIZE=10485760  # 10MB
   ```

5. **Rate limiting**
   - Implement at reverse proxy level
   - Use tools like Nginx rate limiting

---

## Backup and Recovery

### Backup

No persistent data to backup (stateless service).

### Recovery

1. Restart service
2. Check logs for errors
3. Verify dependencies
4. Test with sample PDF

---

## Updates

### Updating Dependencies

```bash
# Activate virtual environment
source venv/bin/activate

# Update packages
pip install --upgrade -r requirements.txt

# Restart service
pm2 restart pdf-parser
```

### Updating Code

```bash
# Pull latest code
git pull origin main

# Restart service
pm2 restart pdf-parser

# Or with systemd
sudo systemctl restart pdf-parser
```

---

## Support

For issues:
1. Check logs
2. Verify configuration
3. Test with curl
4. Review main project documentation
5. Check GitHub issues

---

## Performance Tuning

### Uvicorn Workers

```bash
# Calculate optimal workers: (2 x CPU cores) + 1
# For 4 cores: (2 x 4) + 1 = 9 workers
uvicorn app.main:app --workers 9
```

### System Limits

```bash
# Increase file descriptors
ulimit -n 65536

# Add to /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
```

---

## Maintenance

### Regular Tasks

- Monitor logs daily
- Check disk space weekly
- Update dependencies monthly
- Review security patches regularly
- Test with sample PDFs after updates

### Scheduled Maintenance

```bash
# Add to crontab
0 2 * * 0 /path/to/maintenance-script.sh
```

Example maintenance script:
```bash
#!/bin/bash
# Rotate logs
find /var/log/pdf-parser -name "*.log" -mtime +7 -delete

# Check service health
curl -f http://localhost:8000/health || systemctl restart pdf-parser

# Send status email
echo "PDF Parser service status: OK" | mail -s "Weekly Status" admin@example.com