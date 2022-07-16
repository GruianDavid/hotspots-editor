<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Hotspots Editor</title>

    @vite(['resources/js/editor/base.js'])
</head>
<body>

<div id="map" class="grow"></div>

@include('components.sidebar')

</body>
</html>
