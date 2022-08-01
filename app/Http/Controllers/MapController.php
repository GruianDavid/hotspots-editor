<?php

namespace App\Http\Controllers;

use App\Models\Coordinate;
use App\Models\Way;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MapController extends Controller
{
    /**
     * Return coords within a bbox
     */
    public function getCoordinatesWithinBoundingBox(Request $request): \Illuminate\Database\Eloquent\Collection|array
    {
        return Coordinate::query()
            ->selectRaw("id,ST_AsGeoJson(ST_FlipCoordinates(geom::geometry))::json->'coordinates' as coordinates,location,updated_at")
//            ->whereRaw('ST_Contains(ST_GeomFromGeoJson(?),geom::geometry)',[$request->bbox])
            ->get();
    }

    /**
     * Return ways within a bbox
     */
    public function getWaysWithinBoundingBox(Request $request): StreamedResponse
    {
        return new StreamedResponse(function() use ($request) {
            DB::table('ways')
                ->selectRaw("ST_AsGeoJson(ST_FlipCoordinates(geom::geometry))::json->'coordinates' as coordinates")
                ->whereRaw('ST_Intersects(ST_GeomFromGeoJson(?),geom::geometry)',[$request->bbox])
                ->orderBy('id')
                ->chunk("500", function($e){ echo $e;});
        });
    }

    public function createCoordinate(Request $request): bool|string
    {
        $coordinate = new Coordinate();
        $coordinate->geom = "Point(".$request->coords['lng']." ".$request->coords['lat'].")";
        $coordinate->save();
        return json_encode(["id"=>$coordinate->id]);
    }

    public function deleteCoordinate($id)
    {
        Coordinate::destroy($id);
    }

    public function updateCoordinate($id,Request $request)
    {
        $coordinate = Coordinate::query()->findOrFail($id);
        $coordinate->geom = "Point(".$request->coords['lng']." ".$request->coords['lat'].")";
        $coordinate->save();
    }

}
