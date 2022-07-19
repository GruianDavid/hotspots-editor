<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Way
 *
 * @property int $id
 * @property string $geom
 *
 * @package App\Models
 */
class Way extends Model
{
	protected $table = 'ways';
	public $timestamps = false;

	protected $fillable = [
		'geom'
	];
}
