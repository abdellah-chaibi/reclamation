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
        $reclamation = Reclamation::paginate(15);
        return response()->json($reclamation);
    }

 

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReclamationRequest $request)
    {
    $reclamation = Reclamation::create($request->validated());

    if($request->hasFile('media')) {
        foreach ($request->file('media') as $file) {
            $path = $file->store('media', 'public');
            $reclamation->media()->create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
            ]);
        }

        return response()->json($reclamation->load('media'), 201);
    }
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
        $data=$request->validated();

        if ($request->user()->role==='admin') {
            unset( $data['status'] ) ;

        }elseif ($request->user()->role==='chef_departement' || $request->user()->role==='employe') {
            unset( $data['departement_id'] ) ;
        }

        $reclamation->update();
        return response()->json($reclamation);
    }

    /**
     * Remove the specified resource from storage.
     */
    /*public function destroy(Reclamation $reclamation)
    {
        $reclamation->
    }*/
}
