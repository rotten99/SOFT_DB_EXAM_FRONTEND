// src/Components/Login.jsx
import React, { useState } from 'react';
import userFacade from '../Facades/UserFacade';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email,    setEmail]    = useState('');
    const [error,    setError]    = useState('');
    const [info,     setInfo]     = useState('');
    const [showReg,  setShowReg]  = useState(false);

    const handleLogin = async e => {
        e.preventDefault();
        setError('');
        try {
            await userFacade.login(username, password);
            window.location.href = '/movies';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleRegister = async e => {
        e.preventDefault();
        setError('');
        try {
            await userFacade.register(username, email, password);
            setInfo('Registered! You can now log in.');
            setShowReg(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                {info  && <p className="info">{info}</p>}

                <form onSubmit={handleLogin} className="form">
                    <input
                        type="text" placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password" placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Log In</button>
                </form>

                <p className="switch">
                    Don’t have an account?{' '}
                    <button onClick={() => { setShowReg(true); setError(''); setInfo(''); }}>
                        Register
                    </button>
                </p>
            </div>

            {showReg && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <button className="close-btn" onClick={() => setShowReg(false)}>×</button>
                        <h2>Register</h2>
                        {error && <p className="error">{error}</p>}
                        <form onSubmit={handleRegister} className="form">
                            <input
                                type="text" placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="email" placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password" placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Create Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
