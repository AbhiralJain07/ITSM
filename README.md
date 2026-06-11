<div align="center">

# ITSM
### Enterprise-grade IT Service Management Platform

A modern, scalable and production-oriented IT Service Management system built to streamline internal IT operations, incident handling, asset management and service workflows.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Maintained](https://img.shields.io/badge/Maintained-Yes-brightgreen)

</div>

---

# Overview

ITSM (EvolveITSM) is a centralized, multi-tenant enterprise platform designed to digitize and automate organizational IT operations.

Instead of relying on emails, spreadsheets or manual approvals, the platform provides a unified workflow for:

- Incident Management (Ticketing Lifecycle)
- Service Requests
- Asset Tracking (Configuration Items)
- User Management
- Role-Based Access Control (RBAC)
- Analytics & Reporting
- SLA Monitoring (Target Met vs. Breached Tracking)
- Multilingual Localization

The project is designed with enterprise-level decoupling, clean architecture principles, and asynchronous event messaging in mind rather than being a typical academic project.

---

# Why this project?

Organizations often struggle with:

- Manual ticket handling & routing bottleneck
- Poor visibility of incident progress
- Lack of accountability and SLA tracking
- No centralized knowledge base or categories
- Delayed assignment & status updates
- Difficult analytics reporting

ITSM solves these problems by providing a structured, automated workflow backed by a real-time C# Background Automation Worker and live analytics dashboard.

---

# Key Features

## Authentication
- Realm-based Tenant Login (partitions users by organization boundaries)
- Secure JWT Authentication (Access Token + Refresh Token exchange)
- Middleware Protected Pages/Routes
- HttpOnly Cookies and Session management

---

## User Management
- Admin Dashboard (System Latencies, Quick Shortcuts)
- Agent Dashboard (Assigned queues, status controls)
- User Dashboard (Incident submission, self-service tracking)
- Role Based Access Control (RBAC: Admin, Agent, User)

---

## Ticket Management
- Create Ticket (Attachments, Category mapping)
- Assign Ticket (Ownership and Queue tracking)
- Update Status (Transitioning through Active workflow)
- Priority Management (Critical, High, Medium, Low)
- Comments & Timeline logs
- SLA Resolution Tracking (Response/Resolution target monitors)

---

## Dashboard
- Real-time Recharts Analytics
- Ticket Category statistics (Incident Type Volume)
- Daily Closure rates (Resolution Efficiency timeline)
- Leaderboard ranking (Top Performers by resolved counts)
- System Integrity Metrics (API, Mail, SLA and DB latencies)

---

## Notifications
- Status update logs
- Assignment and Ownership updates
- Resolution alerts

---

## Security
- Decoupled JWT Validation
- TLS bypass configurations for secure local development
- Core Query Input Validation (FluentValidation rules)
- SQL Injection protection via Entity Framework Core

---

# Architecture

```
                 Client (Next.js 16 App Router)
                                │
                                │ HTTP REST API (JWT)
                                ▼
              API Gateway (ASP.NET Core Web API / v1)
                                │
                                ├──────────────────────────┐
                                ▼                          ▼
                        Business Layer            Message Broker
                    (MediatR CQRS Queries)          (RabbitMQ)
                                │                          │
                                ▼                          ▼
                        Database Layer             Background Job
                        (PostgreSQL)         (SLA Engine & State Automation)
```

---

# Tech Stack

## Frontend
- React 19
- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 & Framer Motion
- Recharts v3
- TypeScript

## Backend
- .NET 8 (ASP.NET Core Web API)
- MediatR & FluentValidation
- .NET Background Worker (Winflow.BackgroundJob)

## Database & Messaging
- PostgreSQL (via Entity Framework Core)
- RabbitMQ

## Authentication
- JWT Bearer (Server-side & silent client-refresh)
- HttpOnly Cookies (Next.js session payload)

## Tools
- Git & GitHub
- Docker & Docker Compose
- Postman / Swagger Docs

---

# Folder Structure

```
project
│
├── ITSM (Frontend Workspace)
│     ├── app/                        # Next.js App Router (Dashboard layout, Admin/Agent/User views)
│     ├── components/                 # Shared UI elements (Badge, Button, Card, LanguageSelector)
│     ├── context/                    # Language and Toast context providers
│     ├── lib/                        # Client-side API fetchers, session & i18n configurations
│     └── README.md
│
├── WinFlow-API (Backend Workspace)
│     ├── Winflow.API/                # API controllers, JWT setup, realms, and cors configurations
│     ├── Winflow.Application/        # MediatR commands, queries, validators and behaviors
│     ├── Winflow.BackgroundJob/      # Background state machine automation & SLA monitors
│     ├── Winflow.Domain/             # Core Domain entities (Ticket, Category, User, Tenant)
│     ├── Winflow.Persistence/        # DbContext, migrations and PostgreSQL mapping configs
│     ├── docker-compose.yml          # Local infra (PostgreSQL, RabbitMQ, MailDev)
│     └── README.md
```

---

# Installation

## 1. Start Docker Containers (Infrastructure)
Move to the backend repository folder containing `docker-compose.yml` and launch database and messaging:
```bash
docker-compose up -d
```

## 2. Setup Database & Run Backend Services
Apply Entity Framework database migrations and launch the backend host and background services:
```bash
# Apply migrations to database
cd Winflow.Persistence
dotnet ef database update --startup-project ../Winflow.API

# Run C# Web API (runs on https://localhost:5001)
cd ../Winflow.API
dotnet run

# Run C# Background Worker Job
cd ../Winflow.BackgroundJob
dotnet run
```

## 3. Launch Frontend Workspace
Move into the frontend folder, install dependencies, and run the development environment:
```bash
cd ITSM
npm install
npm run dev
```

---

# Environment Variables

Create a `.env.development` or `.env` file in the frontend workspace root:

```env
# API Server Configuration
AUTH_API_BASE_URL=https://localhost:5001/api/v1
AUTH_API_KEY=your_optional_api_key
AUTH_API_TIMEOUT=30000
AUTH_API_IGNORE_TLS=true
```

---

# Screenshots

```
Dashboard    : Admin stats, system latencies, and shortcuts
Login        : Multi-tenant, realm-based login portal
Admin Panel  : Category data configuration & user management controls
Tickets      : Ticket queues, assignee rows, comments logs and timeline
Analytics    : Category volumes, weekly SLA metrics compliance, and top performing agents
```

---

# Future Roadmap

- Interactive Email/Mailbox Synchronization
- AI Ticket Classification & Auto-routing
- Real-time SLA breach push alerts
- Knowledge Base Article Search integrations
- Mobile Application Workspace (iOS & Android CLIs)
- Microservices deployment scaling

---

# Development Principles

- **Clean Architecture:** Strict separation of layers, keeping the business logic independent from databases or framework APIs.
- **CQRS Pattern:** Separate Read (Queries) and Write (Commands) models using MediatR dispatchers.
- **Validation-Driven:** Prevent incorrect request states early via FluentValidation rules.
- **Decoupled Messaging:** Ensure background processes handle long-running SLA timers out-of-process via RabbitMQ event streams.
- **UX Excellence:** Glassmorphism dashboard card tokens, custom charts, micro-animations, and fast loading skeletons.

---

# Author

**Abhiral Jain**

Full Stack Developer

GitHub: [AbhiralJain07](https://github.com/AbhiralJain07)

---

# Internship Note

This project was developed as part of a software engineering internship and demonstrates the implementation of a production-oriented IT Service Management system. Any confidential organizational information or proprietary assets have been excluded from this public repository.

---

# License

This project is intended for learning, portfolio and demonstration purposes.
