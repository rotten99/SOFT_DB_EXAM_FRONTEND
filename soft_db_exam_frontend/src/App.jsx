// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar        from './Components/NavBar';
import Movies        from './Components/Movies';
import Movie         from './Components/Movie';
import Login         from './Components/Login';
import User          from './Components/User';
import WatchLists    from './Components/WatchLists';
import WatchList     from './Components/WatchList';
import WatchParties  from './Components/WatchParties';
import WatchParty    from './Components/WatchParty';
import userFacade    from './Facades/UserFacade';

// Gatekeeper for protected routes
function PrivateRoute({ children }) {
    return userFacade.isLoggedIn()
        ? children
        : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />

            <Routes>
                {/* 1) "/" → /login */}
                <Route index element={<Navigate to="/login" replace />} />

                {/* 2) Public login */}
                <Route path="/login" element={<Login />} />

                {/* 3) Movies */}
                <Route
                    path="/movies"
                    element={<PrivateRoute><Movies /></PrivateRoute>}
                />
                <Route
                    path="/movies/:id"
                    element={<PrivateRoute><Movie /></PrivateRoute>}
                />

                {/* 4) User profile */}
                <Route
                    path="/user"
                    element={<PrivateRoute><User /></PrivateRoute>}
                />

                {/* 5) WatchLists */}
                <Route
                    path="/watchlists"
                    element={<PrivateRoute><WatchLists /></PrivateRoute>}
                />
                <Route
                    path="/watchlists/:id"
                    element={<PrivateRoute><WatchList /></PrivateRoute>}
                />

                {/* 6) WatchParties */}
                <Route
                    path="/watchparties"
                    element={<PrivateRoute><WatchParties /></PrivateRoute>}
                />
                <Route
                    path="/watchparties/:id"
                    element={<PrivateRoute><WatchParty /></PrivateRoute>}
                />

                {/* 7) Catch-all → back to "/" */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
