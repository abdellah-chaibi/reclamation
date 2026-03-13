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
    // Create the reclamation
    $reclamation = Reclamation::create($request->validated());

    // Handle media files if present
    if ($request->hasFile('media')) {
        $mediaData = collect($request->file('media'))->map(function ($file) {
            return [
                'name' => $file->getClientOriginalName(),
                'path' => $file->store('media', 'public'),
                'size' => $file->getSize(),
            ];
        });

        $reclamation->media()->createMany($mediaData->toArray());
    }

    // Return the created reclamation with media loaded
    return response()->json($reclamation->load('media'), 201);
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
