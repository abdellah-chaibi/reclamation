<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use App\Http\Requests\RefuseReclamationRequest;
use App\Http\Requests\StoreReclamationRequest;
use App\Http\Requests\UpdateReclamationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReclamationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reclamation = Reclamation::with(['medias', 'departement', 'user'])->paginate(15);
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

        $reclamation->medias()->createMany($mediaData->toArray());
    }

    // Return the created reclamation with media loaded
    return response()->json($reclamation->load('medias'), 201);
}

    /**
     * Display the specified resource.
     */
    public function show(Reclamation $reclamation)
    {
        return response()->json($reclamation->load(['medias', 'departement', 'user']));
    }

   

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReclamationRequest $request, Reclamation $reclamation)
    {
        $data=$request->validated();

        if ($request->user()->role==='admin') {
            unset( $data['status'] ) ;

        }elseif ($request->user()->role==='chef_dep' || $request->user()->role==='employe') {
            unset( $data['departement_id'] ) ;
        }

        $reclamation->update($data);
        return response()->json($reclamation->load(['medias', 'departement', 'user']));
    }

    public function refuse(RefuseReclamationRequest $request, Reclamation $reclamation): JsonResponse
    {
        if ($reclamation->status === 'rejete') {
            return response()->json([
                'message' => 'Cette reclamation est deja rejetee.',
            ], 422);
        }

        DB::transaction(function () use ($request, $reclamation) {
            $reclamation->update([
                'status' => 'rejete',
                'refusal_reason' => $request->validated('refusal_reason'),
            ]);
        });

        return response()->json([
            'message' => 'Reclamation rejetee avec succes.',
            'data' => $reclamation->fresh()->load(['medias', 'departement', 'user']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    /*public function destroy(Reclamation $reclamation)
    {
        $reclamation->
    }*/
}
