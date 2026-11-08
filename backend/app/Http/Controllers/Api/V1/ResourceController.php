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
use Carbon\Carbon;
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

        if ($request->filled('capacity_min')) {
            $query->where('capacity', '>=', (int) $request->query('capacity_min'));
        }

        if ($request->filled('capacity_max')) {
            $query->where('capacity', '<=', (int) $request->query('capacity_max'));
        }

        match ($request->query('sort')) {
            'price_asc' => $query->orderBy('hourly_price'),
            'price_desc' => $query->orderByDesc('hourly_price'),
            'capacity_desc' => $query->orderByRaw('capacity desc nulls last'),
            default => $query->orderBy('id'),
        };

        $perPage = min(max((int) $request->query('per_page', 15), 1), 24);

        return ResourceResource::collection($query->paginate($perPage));
    }

    /** Busy intervals of one resource on one day, without exposing who booked. */
    public function availability(Request $request, Resource $resource): JsonResponse
    {
        $data = $request->validate(['date' => ['required', 'date_format:Y-m-d']]);

        $dayStart = Carbon::parse($data['date'])->startOfDay();
        $dayEnd = $dayStart->copy()->addDay();

        $busy = $resource->bookings()
            ->whereIn('status', ['pending', 'paid'])
            ->where('starts_at', '<', $dayEnd)
            ->where('ends_at', '>', $dayStart)
            ->orderBy('starts_at')
            ->get(['starts_at', 'ends_at'])
            ->map(fn ($b) => [
                'starts_at' => $b->starts_at->toIso8601String(),
                'ends_at' => $b->ends_at->toIso8601String(),
            ]);

        return response()->json(['data' => $busy]);
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
