<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Resources\CreateResourceAction;
use App\Actions\Resources\DeleteResourceAction;
use App\Actions\Resources\UpdateResourceAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Resource\StoreResourceRequest;
use App\Http\Requests\Resource\UpdateResourceRequest;
use App\Http\Resources\ResourceResource;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ResourceController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $query = Resource::with('images')->active();

        if ($name = $request->query('name')) {
            $query->where('name', 'ilike', "%{$name}%");
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($from = $request->query('available_from')) {
            if ($to = $request->query('available_to')) {
                $query->whereDoesntHave('bookings', function ($q) use ($from, $to) {
                    $q->whereIn('status', ['pending', 'paid'])
                      ->where('starts_at', '<', $to)
                      ->where('ends_at', '>', $from);
                });
            }
        }

        return ResourceResource::collection($query->paginate(15));
    }

    public function show(Resource $resource): ResourceResource
    {
        return new ResourceResource($resource->load('images'));
    }

    public function store(StoreResourceRequest $request, CreateResourceAction $action): JsonResponse
    {
        $this->authorize('create', Resource::class);

        $resource = $action->execute($request->validated());

        return (new ResourceResource($resource))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateResourceRequest $request, Resource $resource, UpdateResourceAction $action): ResourceResource
    {
        $this->authorize('update', $resource);

        return new ResourceResource($action->execute($resource, $request->validated()));
    }

    public function destroy(Resource $resource, DeleteResourceAction $action): JsonResponse
    {
        $this->authorize('delete', $resource);

        $action->execute($resource);

        return response()->json(null, 204);
    }
}
