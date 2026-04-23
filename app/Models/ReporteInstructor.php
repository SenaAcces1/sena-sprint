<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReporteInstructor extends Model
{
    use HasFactory;

    protected $table = 'reportes_instructor';
    protected $primaryKey = 'id_reporte_instructor';

    protected $fillable = [
        'reporte_head',
        'reporte_body',
        'reporte_datetime',
        'fk_id_user',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'fk_id_user', 'id_usuario');
    }
}
