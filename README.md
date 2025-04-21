# Checklsit App Frontend Repository

Built with **React**, **TypeScript**/**JavaScript**, **Material UI**, and **Auth0** for authentication.

## 🚀 Features
- Auth0-powered login/logout and authentication
- Nested categories and items within each checklist
- File uploads for categories and items
- Shared checklists with public view (users can upload files to categories and items)
- Checklist cloning


## Getting Started

### 1. Install dependencies
```
cd checklist-fronted
npm install
```
This will install all dependencies required in the project
### 2. Env config
Create a ```.env``` file in the root of the repository. Fill it with 
```
REACT_APP_AUTH0_DOMAIN=your-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_AUDIENCE=your-auth0-api-identifier
```
You can get these values from the Auth0 platform.

### 3. Start the App
```
npm start
```
The app runs at ```http://localhost:3000```





