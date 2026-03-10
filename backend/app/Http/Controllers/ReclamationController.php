<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use App\Http\Requests\StoreReclamationRequest;
use App\Http\Requests\UpdateReclamationRequest;

class ReclamationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reclamation = Reclamation::all();
        return response()->json($reclamation);
    }

 

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReclamationRequest $request)
    {
    $reclamation = Reclamation::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Reclamation $reclamation)
    {
        return response()->json($reclamation);
    }

   

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReclamationRequest $request, Reclamation $reclamation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reclamation $reclamation)
    {
        //
    }
}
