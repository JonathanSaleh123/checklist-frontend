
// RequireAuth.tsx
import { Outlet } from "react-router"
import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();
    return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

export const LogoutButton = () => {
    const { logout } = useAuth0();
  
    return (
      <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
        Log Out
      </button>
    );
  };

  {/* 
        {!isAuthenticated && !isLoading && <LoginButton />}

        {isAuthenticated && !isLoading && (
          <div style={{ marginBottom: '1rem' }}>
            <p>Welcome, {user?.name}!</p>
            <img src={user?.picture} alt="User Avatar" style={{ width: '50px', borderRadius: '50%' }} />
            <LogoutButton />
          </div>
        )} */}