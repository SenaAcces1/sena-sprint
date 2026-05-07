import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import Navbar from './Navbar';
import FingerprintSimulation from './FingerprintSimulation';
import Novedades from './Novedades';

const Instructor = () => {
    const navigate = useNavigate();
    const carouselRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [userFilter, setUserFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTermUsers, setSearchTermUsers] = useState('');
    const [searchTermIngresos, setSearchTermIngresos] = useState('');
    const [myEquipmentList, setMyEquipmentList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
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
    const [fingerprintCaptured, setFingerprintCaptured] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const [usersResponse, ingresosResponse, userMeResponse, myEquipmentResponse, rolesResponse] = await Promise.all([
                    axios.get('/api/admin/users'),
                    axios.get('/api/admin/ingresos'),
                    axios.get('/api/user'),
                    axios.get('/api/my-equipment'),
                    axios.get('/api/admin/roles')
                ]);
                setUsers(usersResponse.data);
                setIngresos(ingresosResponse.data);
                setCurrentUser(userMeResponse.data);
                setMyEquipmentList(myEquipmentResponse.data);
                setRoles(rolesResponse.data);
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
            ingreso.ingreso_place.toLowerCase().includes(search)
        );
    });

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user.id_usuario);
        setIsCreating(false);
        setFormData({
            user_identification: user.user_identification || '',
            user_name: user.user_name || '',
            user_lastname: user.user_lastname || '',
            user_email: user.user_email || '',
            user_password: '',
            user_coursenumber: user.user_coursenumber || '',
            user_program: user.user_program || '',
            fk_id_rol: user.fk_id_rol || ''
        });
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setIsCreating(true);
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

    const handleCancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
        setSelectedFile(null);
        setFingerprintCaptured(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (selectedFile) data.append('image', selectedFile);

            if (editingUser) {
                data.append('_method', 'PUT');
                const response = await axios.post(`/api/admin/users/${editingUser}`, data);
                setUsers(users.map(u => u.id_usuario === editingUser ? response.data : u));
                alert('Usuario actualizado');
            } else {
                const response = await axios.post('/api/admin/users', data);
                setUsers([response.data, ...users]);
                alert('Usuario creado');
            }
            handleCancelEdit();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const handleDeleteUser = async (id) => {
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

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return (
                    <div className="fade-in-up">
                        <div className="text-center mb-5">
                            <h2 className="mb-2" style={{fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px'}}>
                                Panel de <span style={{color: 'var(--primary-color)'}}>Instructor</span>
                            </h2>
                            <p className="opacity-75">Visualización y gestión de usuarios y registros de acceso</p>
                        </div>
                        <div className="stats-container mx-auto">
                            <div className="stat-card">
                                <div className="stat-icon"><span className="material-symbols-outlined">group</span></div>
                                <div className="stat-info"><h4>Usuarios</h4><p>{users.length}</p></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><span className="material-symbols-outlined">login</span></div>
                                <div className="stat-info"><h4>Ingresos</h4><p>{ingresos.length}</p></div>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="fade-in-up">
                        {(editingUser || isCreating) && (
                            <div className="glass-box p-4 mb-5 mx-auto fade-in-up" style={{maxWidth: '850px'}}>
                                <div className="section-header">
                                    <h3 className="mb-0">{isCreating ? 'Nuevo Usuario' : 'Editar Usuario'}</h3>
                                </div>
                                <form onSubmit={handleSubmitUser}>
                                    <div className="row">
                                        <div className="col-12 mb-3 text-center">
                                            <div className="user-avatar-lg mx-auto mb-2 shadow overflow-hidden border border-success">
                                                {selectedFile ? (
                                                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                ) : (
                                                    <span className="material-symbols-outlined" style={{fontSize: '3rem'}}>add_a_photo</span>
                                                )}
                                            </div>
                                            <label className="btn btn-outline-success btn-sm cursor-pointer">
                                                Subir Foto
                                                <input type="file" className="d-none" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">N° Documento</label>
                                            <input type="text" name="user_identification" className="form-control" value={formData.user_identification} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Nombre</label>
                                            <input type="text" name="user_name" className="form-control" value={formData.user_name} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Apellido</label>
                                            <input type="text" name="user_lastname" className="form-control" value={formData.user_lastname} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label opacity-75 small">Email</label>
                                            <input type="email" name="user_email" className="form-control" value={formData.user_email} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label opacity-75 small">Contraseña</label>
                                            <input type="password" name="user_password" placeholder={editingUser ? "Dejar vacío para no cambiar" : "Contraseña..."} className="form-control" value={formData.user_password} onChange={handleChange} required={isCreating} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Ficha</label>
                                            <input type="number" name="user_coursenumber" className="form-control" value={formData.user_coursenumber} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Programa</label>
                                            <input type="text" name="user_program" className="form-control" value={formData.user_program} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label opacity-75 small">Rol</label>
                                            <select name="fk_id_rol" className="form-select" value={formData.fk_id_rol} onChange={handleChange} required>
                                                <option value="">Seleccione rol</option>
                                                {roles.map(role => <option key={role.id_rol} value={role.id_rol}>{role.rol_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 mt-4">
                                        <button type="submit" className="btn btn-success flex-grow-1">{editingUser ? 'Actualizar' : 'Crear'}</button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="mx-auto" style={{maxWidth: '1200px'}}>
                            <div className="d-flex justify-content-between align-items-center mb-5 px-4 flex-wrap gap-3">
                                <div>
                                    <h3 className="mb-0">Gestión de Usuarios</h3>
                                    <p className="small opacity-50 mb-0">Total: {filteredUsers.length} registros</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="input-group search-input-group" style={{maxWidth: '350px'}}>
                                        <span className="input-group-text"><span className="material-symbols-outlined">search</span></span>
                                        <input type="text" className="form-control" placeholder="Buscar..." value={searchTermUsers} onChange={(e) => setSearchTermUsers(e.target.value)} />
                                    </div>
                                    <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleCreateClick}>
                                        <span className="material-symbols-outlined">person_add</span> Nuevo
                                    </button>
                                </div>
                            </div>
                            <div className="carousel-wrapper position-relative">
                                <div className="user-carousel d-flex gap-4 pb-4 px-5" ref={carouselRef}>
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <div key={user.id_usuario} className="user-card-new glass-box">
                                            <div className="user-card-settings">
                                                <div className="dropdown">
                                                    <button className="settings-btn" data-bs-toggle="dropdown"><span className="material-symbols-outlined">settings</span></button>
                                                    <ul className="dropdown-menu glass-box border-success border-opacity-25 shadow-lg">
                                                        <li><button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => handleEditClick(user)}><span className="material-symbols-outlined text-warning small">edit</span> Editar</button></li>
                                                        <li><button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={() => handleDeleteUser(user.id_usuario)}><span className="material-symbols-outlined small">delete</span> Eliminar</button></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="user-card-header text-center pt-4 mb-3">
                                                <div className="user-avatar-lg mx-auto mb-3 shadow overflow-hidden">
                                                    {user.profile_photo_path ? <img src={user.profile_photo_path} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <>{user.user_name[0]}{user.user_lastname[0]}</>}
                                                </div>
                                                <h5 className="mb-1 text-truncate px-2">{user.user_name} {user.user_lastname}</h5>
                                                <span className="badge bg-success bg-opacity-10 text-white border border-success border-opacity-25" style={{fontSize: '0.65rem'}}>{user.role?.rol_name}</span>
                                            </div>
                                            <div className="user-card-body px-3 pb-4">
                                                <div className="user-info-item mb-2"><span className="material-symbols-outlined">id_card</span><span className="text-truncate">{user.user_identification || 'S/N'}</span></div>
                                                <div className="user-info-item mb-2"><span className="material-symbols-outlined">mail</span><span className="text-truncate">{user.user_email}</span></div>
                                                <div className="user-info-item"><span className="material-symbols-outlined">groups</span><span className="text-truncate">Ficha: {user.user_coursenumber}</span></div>
                                            </div>
                                        </div>
                                    )) : <div className="text-center w-100 py-5 opacity-50"><p>No se encontraron usuarios</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'historial':
                return (
                    <div className="fade-in-up">
                        <div className="table-responsive glass-box p-4 mb-5 mx-auto" style={{maxWidth: '1000px'}}>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <h3 className="mb-0">Historial de Accesos</h3>
                                <div className="input-group search-input-group" style={{maxWidth: '350px'}}>
                                    <span className="input-group-text"><span className="material-symbols-outlined">search</span></span>
                                    <input type="text" className="form-control" placeholder="Buscar..." value={searchTermIngresos} onChange={(e) => setSearchTermIngresos(e.target.value)} />
                                </div>
                            </div>
                            <table className="table table-dark admin-table mb-0">
                                <thead><tr><th>Usuario</th><th>Fecha y Hora</th><th>Ubicación</th></tr></thead>
                                <tbody>
                                    {filteredIngresos.map(ingreso => (
                                        <tr key={ingreso.id_ingreso}>
                                            <td>{ingreso.user?.user_name} {ingreso.user?.user_lastname}</td>
                                            <td>{new Date(ingreso.ingreso_datetime).toLocaleString()}</td>
                                            <td><span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">{ingreso.ingreso_place}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'novedad_form':
                return <Novedades currentUser={currentUser} initialMode="form" />;
            case 'novedad_historial':
                return <Novedades currentUser={currentUser} initialMode="history" />;
            case 'mis_equipos':
                return (
                    <div className="fade-in-up">
                        <div className="table-responsive glass-box p-4 mb-5 mx-auto" style={{maxWidth: '1000px'}}>
                            <h3 className="mb-4">Mis Comprobantes de Equipo</h3>
                            <table className="table table-dark admin-table mb-0">
                                <thead><tr><th>Equipo</th><th>Marca/Modelo</th><th>Serial</th><th>Fecha</th></tr></thead>
                                <tbody>
                                    {myEquipmentList.length > 0 ? myEquipmentList.map(item => (
                                        <tr key={item.id_ingreso_equipo}>
                                            <td><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">{item.equipo_type}</span></td>
                                            <td>{item.equipo_brand} {item.equipo_model}</td>
                                            <td><code>{item.equipo_serial}</code></td>
                                            <td>{new Date(item.entry_datetime).toLocaleString()}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="text-center py-4 opacity-50">No tienes equipos registrados.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const instructorLinks = [
        { label: 'DASHBOARD', icon: 'dashboard', view: 'dashboard' },
        { 
            label: 'NOVEDADES', 
            icon: 'report_problem', 
            view: 'novedad_historial',
            dropdown: true,
            items: [
                { label: 'Nueva Novedad', icon: 'add_circle', view: 'novedad_form' },
                { label: 'Historial Novedades', icon: 'history', view: 'novedad_historial' }
            ]
        },
        { 
            label: 'USUARIOS', 
            icon: 'group', 
            view: 'users',
            dropdown: true,
            items: [
                { label: 'Instructores', icon: 'school', filter: 'Instructor', view: 'users' },
                { label: 'Aprendices', icon: 'person', filter: 'Aprendiz', view: 'users' },
                { divider: true },
                { label: 'Ver Todos', icon: 'groups', filter: 'all', view: 'users' }
            ]
        },
        { label: 'HISTORIAL', icon: 'history', view: 'historial' },
        { label: 'MIS EQUIPOS', icon: 'inventory_2', view: 'mis_equipos' }
    ];

    if (loading) return <div className="text-white text-center mt-5">Cargando...</div>;

    return (
        <div className="min-vh-100 d-flex flex-column fade-in-up">
            <Navbar currentUser={currentUser} view={view} setView={setView} userFilter={userFilter} setUserFilter={setUserFilter} links={instructorLinks} />
            <main className="container-fluid px-4 px-md-5 py-4 flex-grow-1">{renderView()}</main>
            <Footer />
        </div>
    );
};

export default Instructor;
