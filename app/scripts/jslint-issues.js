/* global ls */
ls.app.controller('MapCtrl', [
    '$scope',
    '$http',
    'leafletBoundsHelpers',
    function($scope, $http, leafletBoundsHelpers) {
        'use strict';
        var bounds = leafletBoundsHelpers.createBoundsFromArray([
            [ 37.010163, -109.024103 ],
            [ 40.970504, -102.058771 ]
          ]);

        angular.extend($scope, {
            bounds: bounds,
            center: {
                lat: 39.226392,
                lng: -105.488929,
                zoom: 4
              },
              defaults: {
                scrollWheelZoom: false
              }
            });

        // Get the countries geojson data from a JSON
        $http.get('/scripts/example.json').success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style: {
                      fillColor: 'green',
                      weight: 2,
                      opacity: 1,
                      color: 'white',
                      dashArray: '3',
                      fillOpacity: 0.7
                    }
                  }
                });
          });
      }
  ]);