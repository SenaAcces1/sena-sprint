import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const PasswordRecovery = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Se ha enviado un enlace de recuperación a tu correo.');
        navigate('/');
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="glass-box password p-4 p-md-5 mx-3">
                <div className="text-center mb-4">
                    <h2 className="fw-bold">SENA</h2>
                    <h4 className="mb-3">Bienvenido al CCyS</h4>
                    <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png?rev=40" className="logosena mb-3" alt="Logo SENA" />
                    <h5 className="fw-light text-warning">Recuperar Contraseña</h5>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="user-box">
                        <input type="email" name="email" required />
                        <label>Correo Electrónico</label>
                    </div>
                    <div className="d-grid gap-2">
                        <button className="btn btn-glow w-100 fw-bold" type="submit">Enviar Enlace</button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <p className="mb-2 theme-text">¿Recordaste tu contraseña? <Link to="/" className="custom-link fw-bold">Inicia sesión</Link></p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PasswordRecovery;
