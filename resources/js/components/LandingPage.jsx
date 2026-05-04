import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleNavigation = (path) => {
        setIsExiting(true);
        setTimeout(() => {
            navigate(path);
        }, 500); // Duración de la animación de salida
    };

    return (
        <div className={`landing-overlay ${isExiting ? 'exit-animation' : 'entry-animation'}`}>
            <div className="landing-card glass-box p-4 p-md-5 text-center mx-3 anim-fade-up anim-fade-up-1">
                <div className="logo-container mb-4 anim-scale-bounce" style={{ animationDelay: '0.2s' }}>
                    <img 
                        src="/Icons/logoSena.png" 
                        alt="SENA Logo" 
                        className="landing-logo neon-glow"
                        style={{ height: '120px', maxWidth: '100%' }}
                    />
                </div>
                
                <div className="anim-fade-up anim-fade-up-2">
                    <h1 className="landing-title mb-2 fw-bold text-white display-5 display-md-4" style={{ letterSpacing: '2px' }}>
                        SENA <span className="neon-text">ACCESS</span>
                    </h1>
                    <p className="text-white-50 mb-5 small text-uppercase fw-bold landing-subtitle">
                        Control de Acceso Biométrico
                    </p>
                </div>

                <div className="d-grid gap-3 px-md-4 anim-fade-up anim-fade-up-3">
                    <button 
                        onClick={() => handleNavigation('/login')}
                        className="btn btn-neon-solid py-3 fw-bold rounded-pill"
                    >
                        INGRESAR
                    </button>
                    <button 
                        onClick={() => handleNavigation('/register')}
                        className="btn btn-neon-outline py-3 fw-bold rounded-pill"
                    >
                        REGISTRARSE
                    </button>
                </div>

                <div className="mt-5 pt-4 border-top border-success border-opacity-10 landing-footer-divider anim-fade-up anim-fade-up-4">
                    <p className="small text-white-50 mb-0">Sistema de Gestión de Ambientes y Equipos</p>
                    <p className="small text-success mt-1 version-badge">v0.1.9</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
