\# LibraCore – Library Management System



A full-stack Library Management System developed using React, Node.js, Express.js and MySQL. LibraCore helps libraries manage books, users, borrowing, returns and stock efficiently through a modern web interface.



\## Features



\### Authentication and User Management

\- User registration and login.

\- Secure password hashing using bcrypt.

\- JWT-based authentication.

\- Role-based access control for administrators, librarians and members.

\- User management by administrators.



\### Book Management

\- View available books.

\- Add new books.

\- Update book information.

\- Delete books.

\- Track book quantities and availability.



\### Transaction Management

\- Borrow books.

\- Return borrowed books.

\- Add new book stock.

\- View borrowing and return records.

\- Members can view their own borrowing history.



\### Dashboard

\- View library statistics.

\- Monitor available and borrowed books.

\- Identify low-stock books.

\- View recent library activity.



\## Technologies Used



| Component | Technology |

|---|---|

| Frontend | React 18 |

| Build Tool | Vite |

| Routing | React Router |

| Icons | Lucide React |

| Backend | Node.js |

| API Framework | Express.js |

| Database | MySQL |

| Database Driver | mysql2 |

| Authentication | JSON Web Token |

| Password Security | bcryptjs |

| API Communication | Fetch API |



\## Project Structure



```text

LibraryManagementSystem/

│

├── backend/

│   ├── config/

│   │   └── db.js

│   ├── controllers/

│   │   ├── authController.js

│   │   ├── bookController.js

│   │   ├── transactionController.js

│   │   └── userController.js

│   ├── middleware/

│   │   └── authMiddleware.js

│   ├── routes/

│   │   ├── authRoutes.js

│   │   ├── bookRoutes.js

│   │   ├── transactionRoutes.js

│   │   └── userRoutes.js

│   ├── server.js

│   ├── package.json

│   └── .env.example

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   └── services/

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## Requirements



Install the following before running the application:



\- Node.js and npm.

\- MySQL Server or XAMPP.

\- A web browser.

\- Visual Studio Code (recommended).



\## Installation and Setup



\### 1. Clone the Repository



```bash

git clone https://github.com/ttau92951-code/tautau.git

cd tautau

```



\### 2. Database Setup



1\. Start MySQL using XAMPP or your installed MySQL server.

2\. Open phpMyAdmin.

3\. Create a database named:



```sql

CREATE DATABASE library\_management\_system;

```



4\. Import or execute the project's database table creation SQL scripts, if provided.



The database includes tables for:

\- Users

\- Books

\- Transactions



\### 3. Backend Setup



Open a terminal:



```bash

cd backend

npm install

```



Create a `.env` file inside the backend folder:



```env

DB\_HOST=localhost

DB\_USER=root

DB\_PASSWORD=your\_mysql\_password

DB\_NAME=library\_management\_system

DB\_PORT=3306

PORT=5000

JWT\_SECRET=your\_private\_jwt\_secret

```



Replace the example values with your own local configuration.



Start the backend:



```bash

npm run dev

```



The backend runs at:



```text

http://localhost:5000

```



Health check:



```text

http://localhost:5000/api/health

```



\### 4. Frontend Setup



Open another terminal:



```bash

cd frontend

npm install

```



Create a `.env` file inside the frontend folder:



```env

VITE\_API\_URL=http://localhost:5000/api

```



Start the frontend:



```bash

npm run dev

```



Open the local address displayed by Vite, normally:



```text

http://localhost:5173

```



\## API Endpoints



Base URL:



```text

http://localhost:5000/api

```



\### Authentication



| Method | Endpoint | Description |

|---|---|---|

| POST | /auth/register | Register a member |

| POST | /auth/login | Login |



\### Books



| Method | Endpoint | Description |

|---|---|---|

| GET | /books | View all books |

| GET | /books/:id | View a specific book |

| POST | /books | Add a book |

| PUT | /books/:id | Update a book |

| DELETE | /books/:id | Delete a book |



\### Transactions



| Method | Endpoint | Description |

|---|---|---|

| GET | /transactions | View transactions |

| GET | /transactions/my | View member transactions |

| POST | /transactions/borrow | Borrow a book as admin/librarian |

| POST | /transactions/member-borrow | Borrow a book as a member |

| POST | /transactions/return | Return a book |

| POST | /transactions/stock | Add book stock |



\### Users



| Method | Endpoint | Description |

|---|---|---|

| GET | /users | View users |

| GET | /users/:id | View a specific user |

| POST | /users | Add a user |

| PUT | /users/:id | Update a user |

| DELETE | /users/:id | Delete a user |



\*\*Note:\*\* Protected endpoints require a valid JWT token. Access is controlled according to the user's role.



\## Security



\- Passwords are hashed using bcryptjs.

\- JWT tokens are used for authentication.

\- Role-based middleware protects restricted endpoints.

\- Environment variables store sensitive configuration.

\- Secret files such as `.env` are excluded from Git.



\## Running the Production Build



To build the frontend:



```bash

cd frontend

npm run build

```



To preview the production build:



```bash

npm run preview

```



\## Testing



The application can be tested by:



1\. Registering a new member account.

2\. Logging in using valid credentials.

3\. Adding and managing books as an administrator or librarian.

4\. Borrowing a book as a member.

5\. Confirming that the available quantity decreases.

6\. Returning a book

