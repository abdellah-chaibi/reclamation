<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Departement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {   
        //$users = User::whereNot('role','citoyen')->with('departement')->get();
        $users = User::with('departement')->get();
        return response()->json($users);
    }
    public function store(Request $request)
    {   
        if ($request->user()->role === 'chef_dep') {
            $request->merge([
                'role' => 'employe',
                'departement_id' => $request->user()->departement_id,
            ]);
        }

        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'nullable|string',
            'departement_id' => 'required_unless:role,citoyen|nullable|exists:departements,id',
            'cin' => 'nullable|unique:users',
        ]);

        if ($request->user()->role === 'chef_dep' && $request->role !== 'employe') {
            return response()->json([
                'message' => 'Un chef de departement ne peut creer que des employes.'
            ], 403);
        }
//
        if ($request->role === 'chef_dep' && $request->departement_id) {
            $exists = User::where('role', 'chef_dep')
                ->where('departement_id', $request->departement_id)
                ->exists();
            if ($exists) {
                return response()->json([
                    'errors' => ['departement_id' => ['Ce département a déjà un chef.']]
                ], 422);
            }
        }
//
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password'=>Hash::make($request->password),
            'cin' => $request->cin,
            'departement_id' => $request->departement_id,
            'role' => $request->role ?? 'citoyen',
        ]);
//
        if ($user->role === 'chef_dep' && $user->departement_id) {
            Departement::where('id', $user->departement_id)->update(['user_id' => $user->id]);
        }
//
        return response()->json($user, 201);
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->role === 'chef_dep') {
            if ($user->departement_id !== $request->user()->departement_id || $user->role !== 'employe') {
                return response()->json([
                    'message' => 'Acces refuse pour cet employe.'
                ], 403);
            }

            $request->merge([
                'role' => 'employe',
                'departement_id' => $request->user()->departement_id,
            ]);
        }
        //
        $newRole = $request->input('role', $user->role);
        $newDeptId = $request->input('departement_id', $user->departement_id);

        if ($newRole === 'chef_dep' && $newDeptId) {
            $exists = User::where('role', 'chef_dep')
                ->where('departement_id', $newDeptId)
                ->where('id', '!=', $user->id)
                ->exists();
            if ($exists) {
                return response()->json([
                    'errors' => ['departement_id' => ['Ce département a déjà un chef.']]
                ], 422);
            }
        }
//
        $user->update($request->all());
//
        if ($user->role === 'chef_dep' && $user->departement_id) {
            Departement::where('id', $user->departement_id)->update(['user_id' => $user->id]);
        }
//
        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if (request()->user()->role === 'chef_dep') {
            if ($user->departement_id !== request()->user()->departement_id || $user->role !== 'employe') {
                return response()->json([
                    'message' => 'Acces refuse pour cet employe.'
                ], 403);
            }
        }

        $user->delete();
        return response()->json([
            'message' => 'User deleted'
        ]);
    }

}
