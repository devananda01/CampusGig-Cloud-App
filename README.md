# CampusGig

A cloud-based web app that connects students who need help with tasks to students looking for short-term gigs on campus. Built on a serverless AWS backend.

**Live demo:** https://production.d7vfgfgwkm8pw.amplifyapp.com/
**Demo video:** https://youtu.be/zMkhf0f1hRc

## Features

**Everyone**
- Register, log in, forgot/reset password (JWT auth via Amazon Cognito)
- Profile management with profile picture upload

**Applicants**
- Browse, search and filter tasks by category
- View task details, apply, edit or withdraw an application

**Posters**
- Create, edit and delete tasks
- Accept or reject applications
- Can't apply to their own tasks

Applicants are emailed when their application status changes (Amazon SES).

## Architecture

```
Browser (Amplify) → API Gateway → Lambda ─┬─ Cognito     (auth)
                                          ├─ DynamoDB    (user profiles)
                                          ├─ RDS MySQL   (tasks, applications)
                                          ├─ S3          (profile images)
                                          └─ SES         (email notifications)
```

| Service | Purpose |
|---|---|
| Amazon Cognito | Authentication and JWT tokens |
| API Gateway + Lambda | REST API (`/users`, `/tasks`, `/applications`) |
| DynamoDB | User profiles |
| RDS (MySQL) | Tasks and applications |
| S3 | Profile images |
| SES | Application status emails |
| Amplify | Frontend hosting |
| CloudWatch | Monitoring and logs |

## Tech Stack

HTML · CSS · JavaScript (vanilla) · AWS (Cognito, API Gateway, Lambda, DynamoDB, RDS, S3, SES, Amplify, CloudWatch)

## Running Locally

The frontend is static, so no build step is needed.

```bash
git clone https://github.com/YOUR_USERNAME/CampusGig-CADV.git
cd CampusGig-CADV
npx serve .
```

To use your own backend, update the API Gateway URL and S3 bucket in `js/config.js`.

## Project Structure

```
CampusGig-CADV/
├── *.html          # Pages (login, register, tasks, applications, profile, ...)
├── components/     # Shared navbar and sidebar
├── css/            # Styles
└── js/             # Page logic, API client (api.js), config
```

## Author

Devananda Thayyullathil, Temasek Polytechnic

## License

Developed for educational purposes.
