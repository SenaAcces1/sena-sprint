<?php

namespace App\Http\Controllers;

use App\Models\IngresoEquipo;
use App\Models\User;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fk_id_usuario' => 'required|exists:usuarios,id_usuario',
            'equipo_type' => 'required|string',
            'equipo_brand' => 'required|string',
            'equipo_model' => 'nullable|string',
            'equipo_color' => 'required|string',
            'equipo_serial' => 'required|string|unique:ingreso_equipos',
            'equipo_observations' => 'nullable|string',
        ]);

        $ingreso = IngresoEquipo::create($request->all());

        return response()->json([
            'message' => 'Comprobante de ingreso de equipo creado con éxito',
            'data' => $ingreso->load('user')
        ], 201);
    }

    public function index()
    {
        $ingresos = IngresoEquipo::with('user')->orderBy('entry_datetime', 'desc')->get();
        return response()->json($ingresos);
    }
}
