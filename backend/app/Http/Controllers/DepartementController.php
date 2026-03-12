<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Http\Requests\StoreDepartementRequest;
use App\Http\Requests\UpdateDepartementRequest;

class DepartementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departements = Departement::paginate(14);
        return response()->json($departements);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartementRequest $request)
    {
        $departement = Departement::create($request->validated());
        return response()->json($departement, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Departement $departement)
    {
        return response()->json($departement);
    }




    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDepartementRequest $request, Departement $departement)
    {


        $departement->update($request->validated());

        return response()->json($departement);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Departement $departement)
    {
        $departement->delete();
        return response()->json([
            'message' => 'Departement deleted'
        ]);
    }
}
