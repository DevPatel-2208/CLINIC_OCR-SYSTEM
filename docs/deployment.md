# Deployment Guide

## Docker Deployment

Use the provided `docker-compose.yml` for containerized deployment:

```bash
docker-compose up --build -d
```

## Production Considerations

### Environment Variables
- Use strong, unique JWT secrets
- Store secrets in a secure vault or environment manager
- Use production MongoDB Atlas cluster
- Use production Cloudinary account

### MongoDB
- Enable authentication
- Use MongoDB Atlas for managed service
- Set up automated backups

### Backend (Node.js)
- Use a process manager (PM2)
- Set NODE_ENV=production
- Enable MongoDB connection pooling
- Use Redis for session/cache if scaling

### Frontend (React)
- Build for production: `cd client && npm run build`
- Serve with Nginx or CDN
- Enable compression
- Set up proper caching headers

### Python AI Service
- Use a production ASGI server (Uvicorn with Gunicorn)
- Configure worker processes
- Set up health checks
- Consider GPU acceleration for OpenCV if scaling

### Security Checklist
- [ ] SSL/TLS configured
- [ ] JWT secret rotated
- [ ] Rate limiting enabled
- [ ] CORS restricted to client domain
- [ ] Monitoring and logging set up
- [ ] Regular security audits
- [ ] Database backups configured
- [ ] Environment variables not in code