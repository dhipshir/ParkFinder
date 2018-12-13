var app = angular.module('annArborParking', []);

app.controller('parkingResults',[ '$scope', '$http', function($scope, $http) {
  function checkKey(){
    if(event.keyCode === 13){
      getResults();
    }
  }

  function getResults(){
    $scope.showResults = 1;
    if($scope.searchQuery === ''){
      $scope.searchQuery = "Ann Arbor";
    }
    $http.get(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" + $scope.searchQuery + "&key=" + $scope.apiKey
    ).then((response) => {
      $scope.searchCoords = _.cloneDeep(response.data.results[0].geometry.location);
      $scope.garages.forEach((garage) => {
        let garageCoords = new google.maps.LatLng(garage.lat, garage.lon);
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [$scope.searchCoords, $scope.searchQuery],
            destinations: [garageCoords, garage.name],
            travelMode: 'DRIVING' ,
            unitSystem: google.maps.UnitSystem.IMPERIAL           
          }, (response, status) => {
            garage.distance = response.rows[0].elements[0].distance.text;
            if(garage.distance.includes("mi")){
              garage.feet = parseInt(garage.distance.split(" ")[0] * 5280);
            }
            else if(garage.distance.includes("ft")){
              garage.feet = parseInt(garage.distance.split(" ")[0]);
            }
          }
      );

      });
    });

    // Scrape Parking Availability
    $http.get("http://ec2-3-16-114-121.us-east-2.compute.amazonaws.com/")
    .then((response) => {
      console.log("Scraped availability: ", response.data);
      for (var i = 0; i < response.data.garages.length; i++){
        $scope.garages[i].availability = parseInt(response.data.garages[i].availability);

      }
    });

    //Initialize Search Map
    let lat = 42.2808;
    let lon = -83.7430;
    let newOptions = {
      center: {
        lat: lat,
        lng: lon
      },
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.searchMap = new google.maps.Map(document.getElementById('searchMap'), newOptions);

    //Initialize markers
    $scope.garages.forEach((garage) => {
      let marker = new google.maps.Marker({
        position: {
          lat: parseFloat(garage.lat),
          lng: parseFloat(garage.lon)
        },
        map: $scope.searchMap
      })
    });
  }


  function setSelectedGarage(garage){
    // Set selected garage variable
    $scope.selectedGarage = angular.copy(_.findIndex($scope.garages, function(o){return o.name === garage.name}));

    // Update Modal Map Options
    let idx = $scope.selectedGarage;
    let lat = _.cloneDeep(parseFloat($scope.garages[idx].lat));
    let lon = _.cloneDeep(parseFloat($scope.garages[idx].lon));
    let newOptions = {
      center:{
        lat: lat,
        lng: lon
      },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.modalMap = new google.maps.Map(document.getElementById('modalMap'), newOptions);

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap($scope.modalMap);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    let dest = new google.maps.LatLng(lat, lon);

    let request = {
      origin: $scope.searchCoords,
      destination: dest,
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  }

  function getDirections(){ 
    let directionsURL = "https://www.google.com/maps/dir/?api=1";
    let origin = "origin=" + $scope.searchQuery;
    let destination = "destination=" + $scope.garages[$scope.selectedGarage].address;
    directionsURL = directionsURL + "&" + origin + "&" + destination;
    window.open(directionsURL);
  }

  function orderWith(filter){
    if(filter === 1){
      $scope.garages = _.orderBy($scope.garages, ['feet'] ,['asc'])
      console.log($scope.garages);
    }
    else{
      $scope.garages = _.orderBy($scope.garages, ['availability'] ,['desc']);
      console.log($scope.garages);
    }
  }


  /*
    Scope Variables
  */
  $scope.searchQuery = "";
  $scope.searchCoords = {
    lat: "0",
    lon: "0",
  };
  $scope.getResults = getResults;
  $scope.showResults = 0;
  $scope.garages = [
    {
      name: "Fourth & Washington Structure",
      address: "123 E. Washington St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.28073",
      lon: "-83.747648"
    },
    {
      name: "First & Washington Structure",
      address: "215 W. Washington St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.280823",
      lon: "-83.750633"
    },
    {
      name: "Maynard Structure",
      address: "324 Maynard St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.278674",
      lon: "-83.742258"
    },
    {
      name: "Forest Struture",
      address: "659 Forest St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.273913",
      lon: "-83.732751"
    },
    {
      name: "Fourth & William Structure",
      address: "115 E. William St.",
      availability: 0,
      distance: "0 mi",
      lat: "42.278422",
      lon: "-83.747678"
    },
    {
      name: "Liberty Square Structure",
      address: "510 E. Washington St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.279972",
      lon: "-83.742601"
    },
    {
      name: "Ann Ashley Structure",
      address: "220 N. Ashley St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.282582",
      lon: "-83.749404"
    },
    {
      name: "Library Lane Structure",
      address: "319 S. Fifth Ave.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.278754",
      lon: "-83.745565"
    },
    {
      name: "South Ashley Lot",
      address: "305 S. Ashley St.",
      availability: 0,
      distance: "0 mi",
      feet: 0,
      lat: "42.27923",
      lon: "-83.749871"
    }    
  ];
  $scope.selectedGarage = 0;
  $scope.setSelectedGarage = setSelectedGarage;
  $scope.apiKey = "removed this key";
  $scope.getDirections = getDirections;
  $scope.modalMap = undefined;
  $scope.searchMap = undefined;
  $scope.selectedGarageMarker = undefined;
  $scope.checkKey = checkKey;
  $scope.orderWith = orderWith;
  $scope.curLoc = undefined;

}]);