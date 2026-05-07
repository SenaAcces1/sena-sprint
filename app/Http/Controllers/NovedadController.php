<?php

namespace App\Http\Controllers;

use App\Models\Novedad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NovedadController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = Novedad::with('user');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('novedad_title', 'like', "%{$search}%")
                  ->orWhere('novedad_body', 'like', "%{$search}%")
                  ->orWhere('novedad_ambiente', 'like', "%{$search}%");
            });
        }

        $novedades = $query->orderBy('novedad_datetime', 'desc')->get();

        return response()->json($novedades);
    }

    public function store(Request $request)
    {
        $request->validate([
            'novedad_ambiente' => 'required|string|max:100',
            'novedad_title' => 'required|string|max:100',
            'novedad_body' => 'required|string',
        ]);

        $novedad = Novedad::create([
            'novedad_ambiente' => $request->novedad_ambiente,
            'novedad_title' => $request->novedad_title,
            'novedad_body' => $request->novedad_body,
            'novedad_datetime' => now(),
            'fk_id_usuario' => Auth::id(),
        ]);

        return response()->json($novedad, 201);
    }

    public function show($id)
    {
        $novedad = Novedad::with('user')->findOrFail($id);
        return response()->json($novedad);
    }

    public function update(Request $request, $id)
    {
        $novedad = Novedad::findOrFail($id);

        // Only the creator or an admin can update
        if ($novedad->fk_id_usuario !== Auth::id() && Auth::user()->role->rol_name !== 'admin') {
            return response()->json(['message' => 'No tienes permiso para actualizar esta novedad'], 403);
        }

        $request->validate([
            'novedad_ambiente' => 'string|max:100',
            'novedad_title' => 'string|max:100',
            'novedad_body' => 'string',
        ]);

        $novedad->update($request->only(['novedad_ambiente', 'novedad_title', 'novedad_body']));

        return response()->json($novedad);
    }

    public function destroy($id)
    {
        $novedad = Novedad::findOrFail($id);

        // Only the creator or an admin can delete
        if ($novedad->fk_id_usuario !== Auth::id() && Auth::user()->role->rol_name !== 'admin') {
            return response()->json(['message' => 'No tienes permiso para eliminar esta novedad'], 403);
        }

        $novedad->delete();

        return response()->json(['message' => 'Novedad eliminada correctamente']);
    }
}
