
# ⚽ Youth Football League Website

### Full Stack Web Development | Freelance Project

Official website developed for a youth football league
in Mexico.

This project was created to provide a digital platform
for the league, combining responsive web interfaces,
backend functionality, relational databases, and API
integration.

The website was developed and deployed as a freelance
project in 2026.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | PHP |
| Database | MySQL |
| Data Format | JSON |
| API | PHP API, HTTP |
| Development | Git, GitHub, XAMPP |

## 🚀 Project Features

### 🌐 Responsive Web Interface
- Responsive website layout
- Desktop and mobile compatibility
- User-friendly navigation
- Custom styling with CSS

### ⚽ Football League Management
- League information pages
- Team-related interfaces
- Match and tournament data organization
- Football-related content management

### 🔐 Backend and Authentication
- PHP-based backend
- Database connection and configuration
- JWT-based authentication configuration
- API endpoints for application functionality

### 🗄️ Database Management
- MySQL relational database
- SQL database schema
- Database migrations
- Example seed data

### 🔗 API Integration
- JavaScript and PHP communication
- JSON-based data exchange
- Dynamic content integration

## 📂 Project Structure

```text
football-league-website/
├── database/
│   ├── schema.sql
│   ├── seed_ejemplo.sql
│   └── migration_*.sql
├── frontend/
│   ├── admin.html
│   ├── admin.js
│   ├── equipo.html
│   ├── equipo.js
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── img/
├── php-api/
│   └── public/
│       ├── .htaccess
│       ├── config.example.php
│       ├── index.php
│       ├── setup.php
│       └── upload.php
├── tools/
├── index.html
├── script.js
├── styles.css
├── .gitignore
└── README.md
```

Note: `config.example.php` should be added as a
safe configuration template. The real `config.php`
must remain excluded from Git.

## ⚙️ Local Installation

### Prerequisites

- XAMPP
- PHP
- MySQL
- Apache
- Web browser

### 1. Clone the Repository

```bash
git clone https://github.com/ManuLandin/football-league-website.git
```

### 2. Move the Project to XAMPP

Place the project inside the XAMPP `htdocs` directory.

Example:

```text
C:\xampp\htdocs\football-league-website
```

### 3. Configure the Database

Start Apache and MySQL using the XAMPP Control Panel.

Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Create a database named:

```text
liga_estrellas
```

Import the SQL schema:

```text
database/schema.sql
```

Apply any required migrations in the correct order.

### 4. Configure the Backend

Create a local configuration file:

```text
php-api/public/config.php
```

Configure the database connection and JWT secret
using local environment variables or private settings.

Never commit real credentials or JWT secrets.

### 5. Run the Application

Start Apache and MySQL through XAMPP.

Open the application in your browser using the
local URL corresponding to your Apache configuration.

## 📸 Screenshots

### Homepage

![Homepage](docs/screenshots/homepage.png)

### Administration Interface

![Administration](docs/screenshots/admin.png)

### Team Information

![Teams](docs/screenshots/teams.png)


## 👨‍💻 My Responsibilities

**Role: Freelance Web Developer**

- Developed responsive frontend interfaces
  using HTML, CSS, and JavaScript.
- Implemented PHP-based backend functionality.
- Worked with MySQL databases and SQL scripts.
- Integrated APIs and JSON-based data exchange.
- Configured website hosting and domain integration.
- Deployed and maintained the website.

## 🎯 Skills Demonstrated

- Full-stack web development
- Frontend and backend integration
- Relational database management
- API integration
- Responsive web design
- Website deployment and maintenance
- Git and version control

## 📬 Contact

**Juan Manuel Landín Romo**

Computer Systems Engineering Student  
ESCOM - Instituto Politécnico Nacional

GitHub: https://github.com/ManuLandin
