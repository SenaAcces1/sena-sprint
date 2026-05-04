<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Models\Ingreso;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    public function getIngresos()
    {
        $ingresos = Ingreso::with('user')->orderBy('ingreso_datetime', 'desc')->get();
        return response()->json($ingresos);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'user_identification' => 'required|string|max:20|unique:usuarios',
            'user_name' => 'required',
            'user_lastname' => 'required',
            'user_email' => 'required|email|unique:usuarios',
            'user_password' => 'required',
            'user_coursenumber' => 'required',
            'user_program' => 'required',
            'fk_id_rol' => 'required|exists:roles,id_rol',
            'image' => 'nullable|image|max:2048',
        ]);

        $profile_photo_path = null;
        if ($request->hasFile('image')) {
            $profile_photo_path = $request->file('image')->storeOnCloudinary('avatars')->getSecurePath();
        }

        $user = User::create([
            'user_identification' => $request->user_identification,
            'user_name' => $request->user_name,
            'user_lastname' => $request->user_lastname,
            'user_email' => $request->user_email,
            'user_password' => Hash::make($request->user_password),
            'user_coursenumber' => $request->user_coursenumber,
            'user_program' => $request->user_program,
            'fk_id_rol' => $request->fk_id_rol,
            'profile_photo_path' => $profile_photo_path,
        ]);

        return response()->json($user, 201);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'user_identification' => 'required|string|max:20|unique:usuarios,user_identification,' . $id . ',id_usuario',
            'user_name' => 'required',
            'user_lastname' => 'required',
            'user_email' => 'required|email|unique:usuarios,user_email,' . $id . ',id_usuario',
            'user_password' => 'nullable|min:6',
            'user_coursenumber' => 'required',
            'user_program' => 'required',
            'fk_id_rol' => 'required|exists:roles,id_rol',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $profile_photo_path = $request->file('image')->storeOnCloudinary('avatars')->getSecurePath();
            $user->profile_photo_path = $profile_photo_path;
        }

        $user->user_identification = $request->user_identification;
        $user->user_name = $request->user_name;
        $user->user_lastname = $request->user_lastname;
        $user->user_email = $request->user_email;
        $user->user_coursenumber = $request->user_coursenumber;
        $user->user_program = $request->user_program;
        $user->fk_id_rol = $request->fk_id_rol;

        if ($request->filled('user_password')) {
            $user->user_password = Hash::make($request->user_password);
        }

        $user->save();

        return response()->json($user->load('role'));
    }

    public function getRoles()
    {
        return response()->json(Role::all());
    }

    public function getMyIngresos(Request $request)
    {
        $ingresos = Ingreso::where('fk_id_user', $request->user()->id_usuario)
            ->with('user')
            ->orderBy('ingreso_datetime', 'desc')
            ->get();
        return response()->json($ingresos);
    }

    public function updateMyProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'user_identification' => 'required|string|max:20|unique:usuarios,user_identification,' . $user->id_usuario . ',id_usuario',
            'user_name' => 'required',
            'user_lastname' => 'required',
            'user_email' => 'required|email|unique:usuarios,user_email,' . $user->id_usuario . ',id_usuario',
            'user_password' => 'nullable|min:6',
            'user_coursenumber' => 'required',
            'user_program' => 'required',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $profile_photo_path = $request->file('image')->storeOnCloudinary('avatars')->getSecurePath();
            $user->profile_photo_path = $profile_photo_path;
        }

        $user->user_identification = $request->user_identification;
        $user->user_name = $request->user_name;
        $user->user_lastname = $request->user_lastname;
        $user->user_email = $request->user_email;
        $user->user_coursenumber = $request->user_coursenumber;
        $user->user_program = $request->user_program;

        if ($request->filled('user_password')) {
            $user->user_password = Hash::make($request->user_password);
        }

        $user->save();

        return response()->json($user->load('role'));
    }
}
