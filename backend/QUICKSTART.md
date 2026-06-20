# Quick Start Guide for Django Backend

## One-Time Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Setup .env file**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser (admin account)**
   ```bash
   python manage.py createsuperuser
   ```

8. **Create sample data**
   ```bash
   python manage.py populate_sample_data
   ```

## Running the Development Server

1. **Ensure virtual environment is activated**

2. **Start the server**
   ```bash
   python manage.py runserver
   ```

3. **Access the API**
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/

## Default Sample Users

### Admin Account
- **Username**: admin1
- **Password**: admin123
- **Email**: admin1@university.edu

### Student Accounts
- **Username**: student1-5
- **Password**: student123
- **Email**: student1-5@university.edu

## API Testing

Use tools like:
- Postman (Desktop client)
- Insomnia (REST client)
- cURL (command line)
- Thunder Client (VS Code extension)

### Example: Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@university.edu","password":"student123"}'
```

Response:
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "your-auth-token"
}
```

### Example: Create Complaint
```bash
curl -X POST http://localhost:8000/api/complaints/ \
  -H "Authorization: Token your-auth-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Library issue",
    "description": "Library closes too early",
    "category": "academic",
    "priority": "medium"
  }'
```

## Troubleshooting

**Port 8000 already in use:**
```bash
python manage.py runserver 8001
```

**Database errors:**
```bash
python manage.py migrate --run-syncdb
```

**Virtual environment not activating:**
Check you're in the correct directory and use the full path to activate script.

## Connecting Frontend

Update your frontend API base URL to:
```
http://localhost:8000/api/
```

Make sure CORS is enabled for your frontend origin in `.env`:
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Explore API endpoints in the admin panel
3. Test API with Postman/Insomnia
4. Connect frontend to backend
5. Customize models and serializers as needed
