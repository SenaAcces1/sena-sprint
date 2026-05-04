import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    // HOOK: useNavigate se usa para programar la navegación hacia el Login o Registro sin recargar la página entera (Single Page Application).
    const navigate = useNavigate();
    
    // HOOK: useState se utiliza aquí para controlar un estado booleano (verdadero/falso) que activa la animación de salida antes de navegar.
    const [isExiting, setIsExiting] = useState(false);

    const handleNavigation = (path) => {
        setIsExiting(true);
        setTimeout(() => {
            navigate(path);
        }, 500);
    };

    return (
        <div className={`landing-overlay ${isExiting ? 'exit-animation' : 'entry-animation'}`}>
            {/* Decorative ring behind card */}
            <div className="landing-ring"></div>

            <div className="landing-card glass-box p-4 p-md-5 text-center mx-3 anim-fade-up anim-fade-up-1">

                {/* Logo */}
                <div className="logo-container mb-4 anim-scale-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="landing-logo-wrapper">
                        <img
                            src="/Icons/logoSena.png"
                            alt="SENA Logo"
                            className="landing-logo neon-glow"
                        />
                    </div>
                </div>

                {/* Title & Subtitle */}
                <div className="anim-fade-up anim-fade-up-2">
                    <h1 className="landing-title mb-1 fw-bold text-white">
                        SENA <span className="neon-text">ACCESS</span>
                    </h1>
                    <p className="landing-subtitle text-uppercase fw-bold mb-0">
                        Control de Acceso Biométrico
                    </p>
                </div>

                {/* Feature pills */}
                <div className="d-flex justify-content-center gap-2 flex-wrap my-4 anim-fade-up anim-fade-up-2">
                    <span className="landing-feature-pill">
                        <span className="material-symbols-outlined landing-feature-icon">fingerprint</span>
                        Biométrico
                    </span>
                    <span className="landing-feature-pill">
                        <span className="material-symbols-outlined landing-feature-icon">shield</span>
                        Seguro
                    </span>
                    <span className="landing-feature-pill">
                        <span className="material-symbols-outlined landing-feature-icon">speed</span>
                        Rápido
                    </span>
                </div>

                {/* Divider */}
                <div className="landing-divider mx-auto mb-4 anim-fade-up anim-fade-up-3"></div>

                {/* Buttons */}
                <div className="d-grid gap-3 px-md-4 anim-fade-up anim-fade-up-3">
                    <button
                        onClick={() => handleNavigation('/login')}
                        className="btn btn-neon-solid py-3 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                    >
                        <span className="material-symbols-outlined">login</span>
                        INGRESAR
                    </button>
                    <button
                        onClick={() => handleNavigation('/register')}
                        className="btn btn-neon-outline py-3 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        REGISTRARSE
                    </button>
                </div>

                {/* Footer info */}
                <div className="mt-4 pt-4 border-top border-success border-opacity-10 landing-footer-divider anim-fade-up anim-fade-up-4">
                    <p className="small text-white-50 mb-1 d-flex align-items-center justify-content-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>apartment</span>
                        Sistema de Gestión de Ambientes y Equipos
                    </p>
                    <span className="landing-version-chip">v0.1.9</span>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
