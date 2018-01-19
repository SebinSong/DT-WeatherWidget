var GM = {mapObj: null, mapCanvas: null, defaultcenter: null,
          marker: null, infoWindow: null, mapWrapper: null,
          mapOptions: {}, geocode: {}, autocomplete: {},
          closebtn: null
         };

var ipad = { animation: document.querySelector("div.ipad div.ani"),
             wind: document.querySelector("div.ipad div.wind"),
             temp: document.querySelector("div.ipad div.temp"),
             pressure: document.querySelector("div.ipad div.pressure"),
             description: document.querySelector("div.ipad div.description"),
             container: document.querySelector("div.ipad")
          };
var aniArray = [].slice.call(document.querySelectorAll("div#asset > div"));


//Temp = kelvin, wind: m/s

var GM_Listeners = {
      map: {}, marker: {}, infoWindow: {}
};

GM.createMarker = function(pos){
  GM.marker = new google.maps.Marker({
    position: pos, map: GM.mapObj,
    animation: google.maps.Animation.DROP,
    /*icon: GM.custom_Marker,*/
    draggable: true
  });

GM.marker.addListener("dragend", function(event){
    let pos = event.latLng;
    GM.geocode.reverseGeocodeByMap(pos);
  });
}

GM.removeMarker = function(){
  google.maps.event.clearInstanceListeners(GM.marker);
  GM.marker.setMap(null);
}

GM.createinfoWindow = function(pos){
  GM.infoWindow = new google.maps.InfoWindow({
    position: pos,
    maxWidth: 200,
    content: "<div class='infowindow_spaceholder'><span></span></div>"
  });
  GM.infoWindow.open(GM.mapObj, GM.marker);
}


/* Initializing Google Map canvas */
function initGoogleMap(){

  GM.defaultcenter = new google.maps.LatLng(-25.363, 131.044);
  GM.custom_Marker = {
    url: "https://lh3.googleusercontent.com/NWg1NNexJUxCs-kPmtFKkUF0yivwBwKXaLptjPeSlSTyShqessEZijFxTo_gMWig-MAjqo5wzImstT61l1cYrgPrI9SNVbqqR8YYvxc0E23HJAMRXWRDssfk4-69FTiMz94ZQ-huskpCL7sH0xydpsDN5P_6rpJFDUy2picgtsksgbX_v0unBiI92FN8WPn9jKDsNJnd0Bf5NhxDidrNPJuvxpL1_fbL2mIWG-s95sfw2ueyBCIRsjCbCGrjcE5sZ1qSH5Iuaa42JtzKy08qoPYW2iH3qSrHv8nFjYy7mzBAr5-YDcvickezWgC95J-PDb4kje47wTprLoFLVHpBw92kmeTBakBIaqEGZslvuTtxrwSb8KPuvGzfoEg-uUG4pt54LPlaJnq5o54lwduah5IvrifEzUO8HNKiK5n8fd8_ylxtfzueUF9e2eFhlxok7uFQAY9HkgizIeyWw8N73H9AZpz08qqCqYTcYWX8CT0aMUCBQqcqQG3SP0KxIsBn4rKSWTSRPoe0usWUXe5rtiB8wwhfaPkZCuDdxz44-PeqiKMYyL3z2fWohXxX21lX4eQZetobAeqHowqs7cy9csIjE0OnBN9QCNscRpE=w530-h600-no",
    scaledSize: new google.maps.Size(35, 50),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(17.5,50)
  };

  GM.closebtn = document.querySelector("div#googleMap div.closebtn");
  GM.mapWrapper = document.querySelector("div#googleMap");
  GM.mapCanvas = document.querySelector("div#map");

  GM.mapOptions = { zoom: 6,
    center: GM.defaultcenter,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
     mapTypeControl: false,
     scaleControl: false,
     streetViewControl: false,
     rotateControl: false,
     fullscreenControl: true,
     fullscreenControlOptions: {
       position: google.maps.ControlPosition.RIGHT_BOTTOM
     },
     gestureHandling: "none",
    styles:
   [{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"simplified"}]}]
 }; // mapOptions Object.

  GM.mapObj = new google.maps.Map(GM.mapCanvas, GM.mapOptions);

  GM.createMarker(GM.defaultcenter);
  GM.createinfoWindow(GM.defaultcenter);

  /* Create and Mount EventHandlers */
  GM_Listeners.map.click = GM.mapObj.addListener("click", click_map);

  function click_map(event) {
    PlaceMarkerAndPanTo(event.latLng);
    GM.geocode.reverseGeocodeByMap(event.latLng);
    addLoadingAnimation();
  }

  function PlaceMarkerAndPanTo(position) {
    GM.marker.setMap(null);
    GM.infoWindow.close();

    GM.createMarker(position);

    //Doesn't have to worry about position object cuz closure comes to play here.
    window.setTimeout(function(){
      GM.mapObj.panTo(position);
    }, 600);
    window.setTimeout(function(){
      GM.createinfoWindow(position);
    }, 0);

    weatherRequest(position);
  }

  function addLoadingAnimation() {
    let index, oldNode, newNode;
    index = Math.floor(Math.random() * aniArray.length);

    newNode = aniArray[index].cloneNode(true);
    oldNode = ipad.animation.querySelector("div.ani > div");
    ipad.animation.replaceChild(newNode, oldNode);

    ipad.description.textContent = "Loading..";
    ipad.pressure.textContent = "-";
    ipad.temp.textContent = "-";
    ipad.wind.textContent = "-";
  }

  GM.closebtn.addEventListener("click", (event)=>{
    event.stopPropagation(); event.preventDefault();

    GM.mapWrapper.classList.remove("open");
    GM.mapWrapper.classList.add("closed");
    setTimeout(()=>{
      GM.mapWrapper.style.display = "none";
    }, 500); // transition duration is 0.5s
  });

  GM.mapWrapper.addEventListener("click", ()=>{
    GM.closebtn.click();
  });
  GM.mapCanvas.addEventListener("click", (event)=>{
    event.stopPropagation();
  });

  //geocode
  GM.geocode.btn = document.querySelector("div#floatingPanel > button");
  GM.geocode.input = document.querySelector("div#floatingPanel > input");
  GM.geocode.panel = document.querySelector("div#floatingPanel");
  GM.geocode.obj = new google.maps.Geocoder();

  GM.mapObj.controls[google.maps.ControlPosition.LEFT_TOP].push(GM.geocode.panel);
  GM.mapObj.controls[google.maps.ControlPosition.LEFT_TOP].push(ipad.container);
  GM.mapObj.controls[google.maps.ControlPosition.RIGHT_TOP].push(GM.closebtn);

  GM.geocode.btn.addEventListener("click", btnSubmit);

  function btnSubmit(event) {
    event.preventDefault();

    let address = GM.geocode.input.value;

  GM.geocode.obj.geocode(
    {"address": address},
    geocode_callback
  );

  }

  function geocode_callback(results, status){
    if(status === "OK") {
      let lat, lng, position;
      lat = results[0].geometry.location.lat();
      lng = results[0].geometry.location.lng();

      position = new google.maps.LatLng(lat, lng);
      PlaceMarkerAndPanTo(position);
      GM.geocode.reverseGeocodeByMap(position);
    }
  }

  GM.geocode.reverseGeocodeByMap = function (position) {

    GM.geocode.obj.geocode(
      { 'location': position }, reverseGeocodeCallback);

      function reverseGeocodeCallback(results, status) {
        if(status === "OK"){
          let shortAddress = results[0].formatted_address
                             .replace(/[\w\s]+,/i, "");

          GM.infoWindow.setContent(
            "<div class='infowindow'>" + shortAddress + "</div>"
          );
        }
      }
  }

  //Autocomplete Setting

    let entireMap = new google.maps.LatLngBounds(
      {lat:-90, lng:-180}, {lat:90, lng:180}
    );
    GM.autocomplete.input = document.querySelector("input#addressInput");
    GM.autocomplete.obj = new google.maps.places.Autocomplete(
    GM.autocomplete.input, {"bounds": entireMap } );

    GM.autocomplete.obj.addListener("place_changed", OnPlaceChanged);

    function OnPlaceChanged() {
      let place = GM.autocomplete.obj.getPlace();

      if(place.geometry){
        let pos = place.geometry.location;
        GM.geocode.btn.click();
      }
      else GM.autocomplete.input.value = "";
    }

    GM.autocomplete.input.addEventListener("keydown", (event)=>{
      if(event.keyCode == 13) GM.geocode.btn.click();
    });

  function weatherRequest(pos) {
    let xhr, lat, lng;

    xhr = new XMLHttpRequest();
    lat = pos.lat(), lng = pos.lng();

    xhr.onload = () => {
      let weatherData = JSON.parse(xhr.responseText);
      let  temp, wind, pressure, name, txt;

      name = weatherData.weather[0].main;
      temp = weatherData.main.temp; // K
      wind = weatherData.wind.speed; // m/s
      pressure = weatherData.main.pressure; // Pa
      txt = document.querySelector("p#txt");

      temp = Math.round(temp - 273.15);
      copyAndPasteAnimation(name);
      ipad.description.textContent = name;
      ipad.temp.textContent = "" + temp + String.fromCharCode(176) + "C (" +
                  Math.round(temp*9/5 + 32) + String.fromCharCode(176) + "F)";
      ipad.wind.textContent = wind + "m/s";
      ipad.pressure.textContent = pressure + " Pa";
      txt.textContent = name;

      function copyAndPasteAnimation(weather) {
        console.log("weather", weather);
        let oldNode, newNode;
        let weatherIcons = {
          Clear: document.querySelector("div#weathericon > div.clear"),
          Rain: document.querySelector("div#weathericon > div.rain"),
          Clouds: document.querySelector("div#weathericon > div.cloudy"),
          Drizzle: document.querySelector("div#weathericon > div.drizzling"),
          Thunderstorm: document.querySelector("div#weathericon > div.thunderstorm"),
          Snow: document.querySelector("div#weathericon > div.snowy")
        };
        weatherIcons.Haze = weatherIcons.Smoke = weatherIcons.Mist =
        weatherIcons.Fog = weatherIcons.Clouds;

        oldNode = ipad.animation.querySelector("div.ipad div.ani > div");
        newNode = weatherIcons[weather].cloneNode(true);

        ipad.animation.replaceChild(newNode, oldNode);
      }
    };

    xhr.onerror = () => {
      weather.txt.textContent = "An Error Ocurred!";
    };

    xhr.open("GET",
                "https://api.openweathermap.org/data/2.5/weather?lat=" +
                 lat + "&lon=" + lng +
                 "&APPID=5cf4a173e461092281f1f31537b0b928",
                true);
    xhr.send(null);

  }

} // initMap() function end
