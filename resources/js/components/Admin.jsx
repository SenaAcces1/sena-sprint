import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import Navbar from './Navbar';

const Admin = () => {
    const navigate = useNavigate();
    const carouselRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'historial', 'users', 'profile'
    const [userFilter, setUserFilter] = useState('all'); // 'all', 'Instructor', 'Aprendiz'
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTermUsers, setSearchTermUsers] = useState('');
    const [searchTermIngresos, setSearchTermIngresos] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [equipmentData, setEquipmentData] = useState({
        fk_id_usuario: '',
        equipo_type: 'Portátil',
        equipo_brand: '',
        equipo_model: '',
        equipo_color: '',
        equipo_serial: '',
        equipo_observations: ''
    });
    const [equipmentList, setEquipmentList] = useState([]);
    const [formData, setFormData] = useState({
        user_identification: '',
        user_name: '',
        user_lastname: '',
        user_email: '',
        user_password: '',
        user_coursenumber: '',
        user_program: '',
        fk_id_rol: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const [usersResponse, rolesResponse, ingresosResponse, userMeResponse, equipmentResponse] = await Promise.all([
                    axios.get('/api/admin/users'),
                    axios.get('/api/admin/roles'),
                    axios.get('/api/admin/ingresos'),
                    axios.get('/api/user'),
                    axios.get('/api/admin/equipment')
                ]);
                setUsers(usersResponse.data);
                setRoles(rolesResponse.data);
                setIngresos(ingresosResponse.data);
                setCurrentUser(userMeResponse.data);
                setEquipmentList(equipmentResponse.data);
            } catch (error) {
                console.error('Error cargando datos: ', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_role');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter users based on search term AND role filter
    const filteredUsers = users.filter(user => {
        const search = searchTermUsers.toLowerCase();
        const matchesSearch = (
            (user.user_identification?.toLowerCase() || '').includes(search) ||
            user.user_name.toLowerCase().includes(search) ||
            user.user_lastname.toLowerCase().includes(search) ||
            user.user_email.toLowerCase().includes(search) ||
            user.user_coursenumber.toString().includes(search) ||
            user.role?.rol_name.toLowerCase().includes(search)
        );

        if (userFilter === 'all') return matchesSearch;
        return matchesSearch && user.role?.rol_name === userFilter;
    });

    const filteredIngresos = ingresos.filter(ingreso => {
        const search = searchTermIngresos.toLowerCase();
        const userName = `${ingreso.user?.user_name} ${ingreso.user?.user_lastname}`.toLowerCase();
        return (
            userName.includes(search) ||
            ingreso.user?.user_email.toLowerCase().includes(search) ||
            ingreso.ingreso_place.toLowerCase().includes(search) ||
            new Date(ingreso.ingreso_datetime).toLocaleString().toLowerCase().includes(search)
        );
    });

    const handleLogout = async () => { // Logica para el log-out asincronica 
        try {
            await axios.post('/api/logout');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            navigate('/');
        }
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // funcion flecha para manejar la funcion de edicion de usuario
    const handleEditClick = (user) => {
        setEditingUser(user.id_usuario);
        setFormData({
            user_identification: user.user_identification || '',
            user_name: user.user_name,
            user_lastname: user.user_lastname,
            user_email: user.user_email,
            //Password vacio para no mostrarlo, se actualiza solo si se ingresa uno nuevo
            user_password: '', 
            user_coursenumber: user.user_coursenumber,
            user_program: user.user_program,
            fk_id_rol: user.fk_id_rol,
            profile_photo_path: user.profile_photo_path || null
        });
    };
    // funcion flecha para manejar la cancelacion de edicion de usuario
    const handleCancelEdit = () => {
        setEditingUser(null);
        setSelectedFile(null);
        setFormData({
            user_identification: '',
            user_name: '',
            user_lastname: '',
            user_email: '',
            user_password: '',
            user_coursenumber: '',
            user_program: '',
            fk_id_rol: ''
        });
    };
    // funcion flecha para manejar los cambios en el formulario de edicion de usuario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (selectedFile) {
                data.append('image', selectedFile);
            }
            // Workaround para PUT con FormData en Laravel
            data.append('_method', 'PUT');

            const response = await axios.post(`/api/admin/users/${editingUser}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setUsers(users.map(u => u.id_usuario === editingUser ? response.data : u));
            
            // Si el usuario editado es el actual, actualizarlo también
            if (currentUser && currentUser.id_usuario === editingUser) {
                setCurrentUser(response.data);
            }

            alert('Usuario actualizado con éxito');
            handleCancelEdit();
        } catch (error) {
            alert('Error al actualizar usuario: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const handleEquipmentChange = (e) => {
        setEquipmentData({
            ...equipmentData,
            [e.target.name]: e.target.value
        });
    };

    const handleEquipmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/admin/equipment', equipmentData);
            setEquipmentList([response.data.data, ...equipmentList]);
            alert('Comprobante creado con éxito');
            setEquipmentData({
                fk_id_usuario: '',
                equipo_type: 'Portátil',
                equipo_brand: '',
                equipo_model: '',
                equipo_color: '',
                equipo_serial: '',
                equipo_observations: ''
            });
            setView('historial_equipos');
        } catch (error) {
            alert('Error al crear comprobante: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await axios.delete(`/api/admin/users/${id}`);
                setUsers(users.filter(u => u.id_usuario !== id));
                alert('Usuario eliminado');
            } catch (error) {
                alert('Error al eliminar usuario');
            }
        }
    };

    if (loading) return <div className="text-white text-center mt-5">Cargando...</div>;

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return (
                    <div className="fade-in-up">
                        <div className="text-center mb-5">
                            <h2 className="mb-2" style={{fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px'}}>
                                Panel de <span style={{color: 'var(--primary-color)'}}>Control</span>
                            </h2>
                            <p className="opacity-75">Gestión integral de usuarios y registros de acceso</p>
                        </div>

                        <div className="stats-container mx-auto">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined" style={{fontSize: '32px'}}>group</span>
                                </div>
                                <div className="stat-info">
                                    <h4>Usuarios</h4>
                                    <p>{users.length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined" style={{fontSize: '32px'}}>login</span>
                                </div>
                                <div className="stat-info">
                                    <h4>Ingresos Hoy</h4>
                                    <p>{ingresos.filter(i => new Date(i.ingreso_datetime).toDateString() === new Date().toDateString()).length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="fade-in-up">
                        {editingUser && (
                            <div className="glass-box p-4 mb-5 mx-auto fade-in-up" style={{maxWidth: '850px'}}>
                                <div className="section-header">
                                    <h3 className="mb-0">Editar Perfil de Usuario</h3>
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="row">
                                        <div className="col-12 mb-3 text-center">
                                            <div className="user-avatar-lg mx-auto mb-2 shadow overflow-hidden border border-success">
                                                {selectedFile ? (
                                                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                ) : formData.profile_photo_path ? (
                                                    <img src={formData.profile_photo_path} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                ) : (
                                                    <span className="material-symbols-outlined" style={{fontSize: '3rem'}}>add_a_photo</span>
                                                )}
                                            </div>
                                            <label className="btn btn-outline-success btn-sm cursor-pointer">
                                                <span className="material-symbols-outlined small me-1">upload</span>
                                                {selectedFile || formData.profile_photo_path ? 'Cambiar Foto' : 'Subir Foto'}
                                                <input type="file" className="d-none" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">N° Documento</label>
                                            <input type="text" name="user_identification" className="form-control bg-dark text-white border-success" value={formData.user_identification} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Nombre</label>
                                            <input type="text" name="user_name" className="form-control bg-dark text-white border-success" value={formData.user_name} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Apellido</label>
                                            <input type="text" name="user_lastname" className="form-control bg-dark text-white border-success" value={formData.user_lastname} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label opacity-75 small">Email Institucional</label>
                                            <input type="email" name="user_email" className="form-control bg-dark text-white border-success" value={formData.user_email} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label opacity-75 small">Seguridad (Opcional)</label>
                                            <input type="password" name="user_password" placeholder="Nueva contraseña..." className="form-control bg-dark text-white border-success" value={formData.user_password} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Ficha</label>
                                            <input type="number" name="user_coursenumber" className="form-control bg-dark text-white border-success" value={formData.user_coursenumber} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Programa</label>
                                            <input type="text" name="user_program" className="form-control bg-dark text-white border-success" value={formData.user_program} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Rol Asignado</label>
                                            <select name="fk_id_rol" className="form-control bg-dark text-white border-success" value={formData.fk_id_rol} onChange={handleChange} required>
                                                <option value="">Seleccione un rol</option>
                                                {roles.map(role => (
                                                    <option key={role.id_rol} value={role.id_rol}>{role.rol_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 mt-4">
                                        <button type="submit" className="btn btn-success action-btn flex-grow-1 py-2">
                                            <span className="material-symbols-outlined">save</span> Actualizar Datos
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary action-btn px-4" onClick={handleCancelEdit}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="mx-auto" style={{maxWidth: '1200px'}}>
                            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3 px-4">
                                <div className="section-header mb-0">
                                    <h3 className="mb-0">Gestión de {userFilter === 'all' ? 'Usuarios' : userFilter + 's'}</h3>
                                    <p className="small opacity-50 mb-0">Total: {filteredUsers.length} registros</p>
                                </div>
                                <div className="input-group search-input-group" style={{maxWidth: '350px'}}>
                                    <span className="input-group-text">
                                        <span className="material-symbols-outlined">search</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Buscar..." 
                                        value={searchTermUsers}
                                        onChange={(e) => setSearchTermUsers(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="carousel-wrapper position-relative">
                                <button className="carousel-nav-btn left shadow-lg" onClick={() => scrollCarousel('left')} aria-label="Anterior">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                
                                <div className="carousel-blur-start"></div>
                                <div className="user-carousel d-flex gap-4 pb-4 px-5" ref={carouselRef}>
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <div key={user.id_usuario} className="user-card-new glass-box">
                                            <div className="user-card-settings">
                                                <div className="dropdown">
                                                    <button className="settings-btn" data-bs-toggle="dropdown">
                                                        <span className="material-symbols-outlined">settings</span>
                                                    </button>
                                                    <ul className="dropdown-menu glass-box border-success border-opacity-25 shadow-lg">
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => handleEditClick(user)}>
                                                                <span className="material-symbols-outlined text-warning small">edit</span> Editar
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={() => handleDelete(user.id_usuario)}>
                                                                <span className="material-symbols-outlined small">delete</span> Eliminar
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="user-card-header text-center pt-4 mb-3">
                                                <div className="user-avatar-lg mx-auto mb-3 shadow overflow-hidden">
                                                    {user.profile_photo_path ? (
                                                        <img src={user.profile_photo_path} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                    ) : (
                                                        <>{user.user_name[0]}{user.user_lastname[0]}</>
                                                    )}
                                                </div>
                                                <h5 className="mb-1 text-truncate px-2">{user.user_name} {user.user_lastname}</h5>
                                                <span className={`badge ${user.role?.rol_name === 'Admin' ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-white border border-${user.role?.rol_name === 'Admin' ? 'danger' : 'success'} border-opacity-25`} style={{fontSize: '0.65rem'}}>
                                                    {user.role?.rol_name}
                                                </span>
                                            </div>

                                            <div className="user-card-body px-3 pb-4">
                                                <div className="user-info-item mb-2">
                                                    <span className="material-symbols-outlined">id_card</span>
                                                    <span className="text-truncate">{user.user_identification || 'S/N'}</span>
                                                </div>
                                                <div className="user-info-item mb-2">
                                                    <span className="material-symbols-outlined">mail</span>
                                                    <span className="text-truncate">{user.user_email}</span>
                                                </div>
                                                <div className="user-info-item">
                                                    <span className="material-symbols-outlined">groups</span>
                                                    <span className="text-truncate">Ficha: {user.user_coursenumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center w-100 py-5 opacity-50">
                                            <span className="material-symbols-outlined" style={{fontSize: '48px'}}>person_off</span>
                                            <p className="mt-2">No se encontraron usuarios</p>
                                        </div>
                                    )}
                                </div>
                                <div className="carousel-blur-end"></div>

                                <button className="carousel-nav-btn right shadow-lg" onClick={() => scrollCarousel('right')} aria-label="Siguiente">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'historial':
                return (
                    <div className="fade-in-up">
                        <div className="table-responsive glass-box p-4 mb-5 mx-auto" style={{maxWidth: '1000px'}}>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <div className="section-header mb-0">
                                    <h3 className="mb-0">Historial de Accesos</h3>
                                </div>
                                <div className="input-group search-input-group" style={{maxWidth: '350px'}}>
                                    <span className="input-group-text">
                                        <span className="material-symbols-outlined">search</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Buscar en el historial..." 
                                        value={searchTermIngresos}
                                        onChange={(e) => setSearchTermIngresos(e.target.value)}
                                    />
                                </div>
                            </div>
                            <table className="table table-dark admin-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Fecha y Hora</th>
                                        <th>Ubicación / Punto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIngresos.map(ingreso => (
                                        <tr key={ingreso.id_ingreso}>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold">{ingreso.user?.user_name} {ingreso.user?.user_lastname}</span>
                                                    <span className="small opacity-50">{ingreso.user?.user_email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="material-symbols-outlined opacity-50" style={{fontSize: '18px'}}>calendar_today</span>
                                                    {new Date(ingreso.ingreso_datetime).toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2" style={{fontSize: '0.75rem'}}>
                                                    {ingreso.ingreso_place}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'equipo_entry':
                return (
                    <div className="fade-in-up">
                        <div className="glass-box p-4 mb-5 mx-auto" style={{maxWidth: '850px'}}>
                            <div className="section-header">
                                <h3 className="mb-0">Nuevo Comprobante de Equipo</h3>
                                <p className="opacity-50 small">Registrar ingreso de un dispositivo al centro</p>
                            </div>
                            <form onSubmit={handleEquipmentSubmit}>
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label opacity-75 small">Seleccionar Usuario</label>
                                        <select name="fk_id_usuario" className="form-control bg-dark text-white border-success" value={equipmentData.fk_id_usuario} onChange={handleEquipmentChange} required>
                                            <option value="">Seleccione el dueño del equipo...</option>
                                            {users.map(user => (
                                                <option key={user.id_usuario} value={user.id_usuario}>
                                                    {user.user_name} {user.user_lastname} - {user.user_identification}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label opacity-75 small">Tipo de Equipo</label>
                                        <select name="equipo_type" className="form-control bg-dark text-white border-success" value={equipmentData.equipo_type} onChange={handleEquipmentChange} required>
                                            <option value="Portátil">Portátil</option>
                                            <option value="Cámara">Cámara</option>
                                            <option value="Herramienta">Herramienta</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label opacity-75 small">Marca</label>
                                        <input type="text" name="equipo_brand" className="form-control bg-dark text-white border-success" placeholder="Ej: Lenovo, HP..." value={equipmentData.equipo_brand} onChange={handleEquipmentChange} required />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label opacity-75 small">Modelo</label>
                                        <input type="text" name="equipo_model" className="form-control bg-dark text-white border-success" placeholder="Ej: ThinkPad X1..." value={equipmentData.equipo_model} onChange={handleEquipmentChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label opacity-75 small">Color</label>
                                        <input type="text" name="equipo_color" className="form-control bg-dark text-white border-success" placeholder="Ej: Gris Espacial..." value={equipmentData.equipo_color} onChange={handleEquipmentChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label opacity-75 small">Número de Serie</label>
                                        <input type="text" name="equipo_serial" className="form-control bg-dark text-white border-success" placeholder="S/N único..." value={equipmentData.equipo_serial} onChange={handleEquipmentChange} required />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label opacity-75 small">Observaciones / Estado</label>
                                        <textarea name="equipo_observations" className="form-control bg-dark text-white border-success" rows="3" placeholder="Detalles adicionales del estado del equipo..." value={equipmentData.equipo_observations} onChange={handleEquipmentChange}></textarea>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button type="submit" className="btn btn-success w-100 py-2 action-btn">
                                        <span className="material-symbols-outlined">description</span> Generar Comprobante
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'historial_equipos':
                return (
                    <div className="fade-in-up">
                        <div className="table-responsive glass-box p-4 mb-5 mx-auto" style={{maxWidth: '1200px'}}>
                            <div className="section-header">
                                <h3 className="mb-0">Historial de Equipos</h3>
                                <p className="opacity-50 small">Registros de ingreso de dispositivos</p>
                            </div>
                            <table className="table table-dark admin-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Equipo</th>
                                        <th>Marca/Modelo</th>
                                        <th>Serial</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipmentList.map(item => (
                                        <tr key={item.id_ingreso_equipo}>
                                            <td>{item.user?.user_name} {item.user?.user_lastname}</td>
                                            <td><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">{item.equipo_type}</span></td>
                                            <td>{item.equipo_brand} {item.equipo_model}</td>
                                            <td><code>{item.equipo_serial}</code></td>
                                            <td>{new Date(item.entry_datetime).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="fade-in-up container glass-box p-5 mx-auto" style={{maxWidth: '600px'}}>
                        <div className="text-center mb-4">
                            <div className="rounded-circle bg-success mx-auto d-flex align-items-center justify-content-center mb-3 shadow overflow-hidden" style={{width: '100px', height: '100px', fontSize: '2.5rem', fontWeight: 'bold'}}>
                                {currentUser?.profile_photo_path ? (
                                    <img src={currentUser.profile_photo_path} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                ) : (
                                    <>{currentUser?.user_name[0]}{currentUser?.user_lastname[0]}</>
                                )}
                            </div>
                            <h3 className="mb-1">{currentUser?.user_name} {currentUser?.user_lastname}</h3>
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1">
                                {currentUser?.role?.rol_name || 'Usuario'}
                            </span>
                        </div>
                        
                        <div className="row text-start mt-4 g-4">
                            <div className="col-12">
                                <label className="form-label opacity-50 small mb-1">Identificación</label>
                                <div className="p-3 bg-dark bg-opacity-25 rounded border border-success border-opacity-10">
                                    {currentUser?.user_identification || 'No registrada'}
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="form-label opacity-50 small mb-1">Correo Institucional</label>
                                <div className="p-3 bg-dark bg-opacity-25 rounded border border-success border-opacity-10">
                                    {currentUser?.user_email}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label opacity-50 small mb-1">Ficha</label>
                                <div className="p-3 bg-dark bg-opacity-25 rounded border border-success border-opacity-10">
                                    {currentUser?.user_coursenumber}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label opacity-50 small mb-1">Programa</label>
                                <div className="p-3 bg-dark bg-opacity-25 rounded border border-success border-opacity-10">
                                    {currentUser?.user_program}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-top border-success border-opacity-10">
                            <button className="btn btn-outline-success w-100 py-3 d-flex align-items-center justify-content-center gap-2" onClick={() => {
                                handleEditClick(currentUser);
                                setView('users');
                            }}>
                                <span className="material-symbols-outlined">edit</span>
                                Editar Información de Perfil
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const adminLinks = [
        { label: 'DASHBOARD', icon: 'dashboard', view: 'dashboard' },
        { label: 'HISTORIAL', icon: 'history', view: 'historial' },
        { 
            label: 'COMPROBANTES', 
            icon: 'description', 
            view: 'equipo_entry',
            dropdown: true,
            items: [
                { label: 'Nuevo Comprobante', icon: 'add_circle', view: 'equipo_entry' },
                { label: 'Historial Equipos', icon: 'inventory_2', view: 'historial_equipos' }
            ]
        },
        { 
            label: 'GESTIÓN DE USUARIOS', 
            icon: 'group', 
            view: 'users',
            dropdown: true,
            items: [
                { label: 'Instructores', icon: 'school', filter: 'Instructor', view: 'users' },
                { label: 'Aprendices', icon: 'person', filter: 'Aprendiz', view: 'users' },
                { divider: true },
                { label: 'Ver Todos', icon: 'groups', filter: 'all', view: 'users' }
            ]
        }
    ];

    return (
        <div className="min-vh-100 d-flex flex-column fade-in-up" style={{background: 'transparent'}}>
            <Navbar 
                currentUser={currentUser} 
                view={view} 
                setView={setView} 
                userFilter={userFilter} 
                setUserFilter={setUserFilter} 
                links={adminLinks}
            />

            {/* Contenido Principal */}
            <main className="container-fluid px-4 px-md-5 py-2 flex-grow-1">
                {renderView()}
            </main>
            
            <Footer />

            <style>{`
                .nav-item-link {
                    background: transparent;
                    border: none;
                    color: var(--text-color);
                    font-size: 0.50rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    opacity: 0.8;
                }
                .nav-item-link:hover, .nav-item-link.active {
                    color: var(--primary-color);
                    background: rgba(2, 217, 20, 0.08);
                    opacity: 1;
                }
                .hover-bg:hover {
                    background: rgba(2, 217, 20, 0.1);
                }
                .btn-logout-minimal {
                    background: transparent;
                    border: 1px solid rgba(220, 53, 69, 0.2);
                    color: #dc3545;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .btn-logout-minimal:hover {
                    background: rgba(220, 53, 69, 0.1);
                    border-color: #dc3545;
                    transform: scale(1.05);
                }
                .dropdown-item {
                    color: var(--text-color);
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .dropdown-item:hover {
                    background: var(--dropdown-item-hover);
                    color: var(--primary-color);
                    padding-left: 1.25rem;
                }
                .dropdown-menu {
                    background: var(--dropdown-bg) !important;
                    border: 1px solid var(--dropdown-border) !important;
                    backdrop-filter: blur(20px);
                    border-radius: 15px;
                    padding: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .navbar-custom {
                    background: var(--glass-bg);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-bottom: 1px solid rgba(2, 217, 20, 0.2);
                    width: 100% !important;
                    max-width: none !important;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }
                .carousel-wrapper {
                    position: relative;
                    width: 100%;
                    padding: 30px 0;
                    overflow: visible; /* Permitir que los dropdowns salgan del contenedor */
                }
                .user-carousel {
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    -webkit-overflow-scrolling: touch;
                    padding: 20px 0;
                    display: flex;
                    gap: 30px;
                }
                .user-carousel::-webkit-scrollbar {
                    display: none;
                }
                .carousel-blur-start, .carousel-blur-end {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100px;
                    z-index: 5; /* Por debajo de los botones pero por encima del fondo */
                    pointer-events: none;
                }
                .carousel-blur-start {
                    left: 0;
                    background: linear-gradient(to right, var(--bg-color), transparent);
                }
                .carousel-blur-end {
                    right: 0;
                    background: linear-gradient(to left, var(--bg-color), transparent);
                }
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(2, 217, 20, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--primary-color);
                    color: var(--primary-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100; /* Siempre arriba */
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .carousel-nav-btn:hover {
                    background: var(--primary-color);
                    color: #000;
                    box-shadow: 0 0 25px rgba(2, 217, 20, 0.5);
                    transform: translateY(-50%) scale(1.1);
                }
                .carousel-nav-btn.left { left: 10px; }
                .carousel-nav-btn.right { right: 10px; }
                
                .user-card-new {
                    min-width: 280px;
                    max-width: 280px;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(2, 217, 20, 0.15);
                    flex-shrink: 0;
                    border-radius: 28px;
                    overflow: visible !important; /* CRITICO: Permitir que el dropdown sea visible */
                    z-index: 10;
                }
                .user-card-new:hover, .user-card-new:focus-within {
                    transform: translateY(-15px);
                    border-color: var(--primary-color);
                    box-shadow: 0 25px 50px rgba(2, 217, 20, 0.25);
                    z-index: 50; /* Elevar la tarjeta al interactuar */
                }
                .user-card-settings {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 60;
                }
                .settings-btn {
                    background: rgba(2, 217, 20, 0.1);
                    border: 1px solid rgba(2, 217, 20, 0.2);
                    color: var(--primary-color);
                    border-radius: 14px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .settings-btn:hover {
                    background: var(--primary-color);
                    color: #000;
                    transform: rotate(45deg);
                    box-shadow: 0 0 15px rgba(2, 217, 20, 0.4);
                }
                .user-avatar-lg {
                    width: 85px;
                    height: 85px;
                    background: linear-gradient(135deg, var(--primary-color), #16a34a);
                    color: #000;
                    border-radius: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 900;
                    margin-top: 10px;
                }
                .user-info-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.85rem;
                    opacity: 0.8;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px 15px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    transition: all 0.2s ease;
                }
                .user-card-new:hover .user-info-item {
                    background: rgba(2, 217, 20, 0.05);
                    border-color: rgba(2, 217, 20, 0.1);
                    opacity: 1;
                }
                .user-info-item span:first-child {
                    font-size: 18px;
                    color: var(--primary-color);
                }
                body.light-mode .user-info-item {
                    background: rgba(0, 0, 0, 0.04);
                }
                body.light-mode .carousel-blur-start {
                    background: linear-gradient(to right, #f8f9fa, transparent);
                }
                body.light-mode .carousel-blur-end {
                    background: linear-gradient(to left, #f8f9fa, transparent);
                }
                .user-card-header h5 {
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
};

export default Admin;
