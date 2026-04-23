<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_identification',
        'user_name',
        'user_lastname',
        'user_email',
        'user_password',
        'user_coursenumber',
        'user_program',
        'fk_id_rol',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'user_password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'user_password' => 'hashed',
    ];

    public function getAuthPassword()
    {
        return $this->user_password;
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'fk_id_rol', 'id_rol');
    }

    public function ingresos()
    {
        return $this->hasMany(Ingreso::class, 'fk_id_usuario', 'id_usuario');
    }

    public function reportesInstructor()
    {
        return $this->hasMany(ReporteInstructor::class, 'fk_id_usuario', 'id_usuario');
    }

    public function Fingerprints()
    {
        return $this->hasMany(Fingerprint::class, 'fk_id_user', 'id_usuario');
    }
    
    public function Novedades()
    {
        return $this->hasMany(Novedad::class, 'fk_id_usuario', 'id_usuario');
    }
}



