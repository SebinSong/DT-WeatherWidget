(function mobileDeviceDetection(){ // It's gonna check the type of the user device.
  let widget, landingPage;
})();

(function weatherWidget(){

  var widget, remover, degreebtn, temp, windspeed, place, description,
      weatherIcons, loadingIcon, menu, googleMapWrapper, firstTime= true,
      activatebtn, activated = false;

  widget = document.querySelector("div#weatherwidget");
  animationbox = document.querySelector("div#weatherwidget > div.animation");
  remover = document.querySelector("div#weatherwidget > div.remove");
  degreebtn = document.querySelector("div#weatherwidget span.temp.unit");
  temp = document.querySelector("div#weatherwidget span.temp.number");
  windspeed = document.querySelector("div#weatherwidget span.wind.number");
  place = document.querySelector("div#weatherwidget div.place");
  description = document.querySelector("div#weatherwidget div.description");
  menu = document.querySelector("div#weatherwidget div.menu");
  googleMapWrapper = document.querySelector("div#googleMap");
  activatebtn = document.querySelector("div#landingPage button#activate_widget");

  weatherIcons = {
    Clear: document.querySelector("div#weathericon > div.clear"),
    Rain: document.querySelector("div#weathericon > div.rain"),
    Clouds: document.querySelector("div#weathericon > div.cloudy"),
    Drizzle: document.querySelector("div#weathericon > div.drizzling"),
    Thunderstorm: document.querySelector("div#weathericon > div.thunderstorm"),
    Snow: document.querySelector("div#weathericon > div.snowy")
  };

  weatherIcons.Haze = weatherIcons.Smoke = weatherIcons.Mist =
  weatherIcons.Fog = weatherIcons.Clouds;

  loadingIcon = document.querySelector("div#jumpingpill");

/* Adding Event Listeners */
  remover.addEventListener("click", (event)=>{
    event.preventDefault();

    widget.classList.add("removed");
    setTimeout(()=>{
      widget.style.display = "none";
    }, 400); //0.5s is the duration for opacity transition
  });

  degreebtn.addEventListener("click", (event)=>{
    event.preventDefault();
    tempUnitChange();
  });

  menu.addEventListener("click", (event)=>{
    event.preventDefault();

    googleMapWrapper.style.display = "block";
    setTimeout(()=>{
      googleMapWrapper.classList.remove("closed");
      googleMapWrapper.classList.add("open");

      if(firstTime) {
        initGoogleMap();
        firstTime = !firstTime;
      }
    },100);

  });

  function tempUnitChange () {
    let temp_value = parseInt(temp.textContent, 10);
    let celcius = degreebtn.classList.contains("celcius");

    if(celcius) {
      temp.textContent = Math.round(temp_value*9/5 + 32);
      degreebtn.classList.remove("celcius");
      degreebtn.classList.add("fahrenheit");
    }
    else {
      temp.textContent = Math.round((temp_value - 32)*5/9);
      degreebtn.classList.remove("fahrenheit");
      degreebtn.classList.add("celcius");
    }

    temp.style.visibility = "hidden"; temp.style.opacity = 0;
    setTimeout(()=>{
      temp.style.opacity = 1;
      temp.style.visibility = "visible";
    }, 300);
  }

  function initializeWidget() {

    let aniRect, CopiedAnimation;

    //2. Add a loading animation
    aniRect = animationbox.getBoundingClientRect();
    CopiedAnimation = loadingIcon.cloneNode(true);
    CopiedAnimation.style.width = aniRect.width + "px";
    CopiedAnimation.style.height = aniRect.height + "px";
    animationbox.appendChild(CopiedAnimation);
  }

  activatebtn.addEventListener("click", (event)=>{

    if(!activated)
      ajaxRequestForWeather();
    else return;

    widget.classList.add("active");
    activated = !activated;
  });


  function ajaxRequestForWeather() {
    let error = false;

    if(!navigator.geolocation) error = true;
    else {
      loadGeoLocationInfo()
        .then(geo_success, geo_error)
          .then(weather_success, geo_error);
    }

    function loadGeoLocationInfo(){
      return new Promise((resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(
          (data)=>{resolve(data.coords);},
          ()=>{error = true;}
        );
      });
    }

    function geo_success(coords){
      let lat = coords.latitude, lng = coords.longitude;

      return new Promise(
        (resolve, reject) => {
          let xhr = new XMLHttpRequest();

          xhr.open("GET",
          "https://api.openweathermap.org/data/2.5/weather?lat=" +
                 lat + "&lon=" + lng +
                 "&APPID=5cf4a173e461092281f1f31537b0b928",
          true);
          xhr.send(null);
          xhr.onload = ()=>{ resolve(JSON.parse(xhr.responseText)); };
          xhr.onerror = ()=>{ error= true; };

        }
      );
    }

    function geo_error() {
      error = true;
    }

    function weather_success(weatherObj) {
      let descriptionstr = weatherObj.weather[0].main;

      place.textContent = weatherObj.name;
      description.textContent =
          (descriptionstr==="Thunderstorm")? "Thunders": descriptionstr;
      temp.textContent = Math.round(weatherObj.main.temp - 273.15);
      windspeed.textContent = weatherObj.wind.speed;

      copyAndPasteWeatherIcon(descriptionstr);
    }

  }

  function copyAndPasteWeatherIcon(descriptionstr) {
    let newNode, oldNode;

    oldNode = animationbox.querySelector("div.animation > div");
    newNode = weatherIcons[descriptionstr].cloneNode(true);

    if(descriptionstr === "Thunderstorm") resizeAnimation(newNode);

    animationbox.replaceChild(newNode, oldNode);

    function resizeAnimation(clone) {

      boxsize = parseInt(
        Math.round(animationbox.getBoundingClientRect().width), 10);
        bolts = [].slice
          .call(clone.querySelectorAll("div.bolt"));

      //1. resizing thunderstorm animation
      bolts.forEach((bolt, i)=>{
        let triangles = bolt.querySelectorAll("span");

        triangles[0].style.borderRightWidth = boxsize * ((i===0)?2.1:1) / 7  + "px";
        triangles[0].style.borderTopWidth = boxsize * ((i===0)?32:16) / 70  + "px";
        triangles[1].style.borderLeftWidth = boxsize * ((i===0)?2.1:1) / 7  + "px";
        triangles[1].style.borderBottomWidth = boxsize * ((i===0)?32:16) / 70  + "px";

      });
    }
  }


  initializeWidget();

})();


(function draggableAndThrowable(){

  let btns = {
    holder: document.querySelector("div#weatherwidget div.grabbable"),
    fixtoggle: document.querySelector("div#weatherwidget div.fix"),
    onoffswitch: document.querySelector("div#weatherwidget div.fix")
  };

  let txtbox, widgetObj, requestID, holderDown = false;

  txtbox = document.querySelector("p#txt");
  widgetObj = {
    box: document.querySelector("div#weatherwidget"),
    firstBoxTop: 0, firstBoxLeft: 0, firstmx: 0, firstmy: 0,
    movementX: 0, movementY: 0, widget_fixed: false, timeStamp: 0
  };

  window.requestAnimationFrame = window.requestAnimationFrame ||
   window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
   window.msRequestAnimationFrame;

  btns.holder.addEventListener("mousedown", mdown_holder);
  btns.onoffswitch.addEventListener("click", click_onoff);
  addEventListener("mouseup", mup);

  function mdown_holder(event) {

    if(widgetObj.widget_fixed) return;

    event.preventDefault();
    holderDown = true;

    window.cancelAnimationFrame(requestID);
    widgetObj.initialize(event);

    addEventListener("mousemove", mmove);
  }

  function click_onoff(event) {
    event.preventDefault();
    event.stopPropagation();

    if(this.classList.contains("on")) {
      this.classList.remove("on"), this.classList.add("off");

      btns.holder.classList.add("unavailable");
      widgetObj.widget_fixed = true;
    }
    else {
      this.classList.remove("off"), this.classList.add("on");

      btns.holder.classList.remove("unavailable");
      widgetObj.widget_fixed = false;
    }

  }

  function mup(event) {
    let elapsedTime = Date.now() - widgetObj.timeStamp;
    if(!holderDown) return;

    holderDown = false;
    removeEventListener("mousemove", mmove);
    if(elapsedTime<100) throwingEffect();
  }

  widgetObj.initialize = function(event){
    let widgetRect = widgetObj.box.getBoundingClientRect();

    widgetObj.firstBoxTop = widgetRect.top;
    widgetObj.firstBoxLeft = widgetRect.left;
    widgetObj.firstmx = event.clientX, widgetObj.firstmy = event.clientY;

  };

  function mmove(event) {

    let box = widgetObj.box.getBoundingClientRect();
    let bodybox = document.querySelector("body").getBoundingClientRect();

    let currentX, currentY, lx, ly, toX, toY, w, h, xLimit, yLimit, stickyValue;

    w = box.width, h = box.height; // border-box properties
    currentX = event.clientX, currentY = event.clientY;
    lx = currentX - widgetObj.firstmx;
    ly = currentY - widgetObj.firstmy;
    stickyValue = 20;

    toX = widgetObj.firstBoxLeft + lx, toY = widgetObj.firstBoxTop + ly;

    xLimit = bodybox.width - (w + 15);
    yLimit = bodybox.height - (h + 15);

    // 15 is the px value for margin
    if(toX <= (15 + stickyValue)) toX = 15;
    else if(toX >= (xLimit - stickyValue)) toX = xLimit;

    if(toY <= (15 + stickyValue)) toY = 15;
    else if(toY >= (yLimit - stickyValue)) toY = yLimit;

    widgetObj.box.style.top = toY + "px";
    widgetObj.box.style.left = toX + "px";

    widgetObj.movementX = event.movementX;
    widgetObj.movementY = event.movementY;

    widgetObj.timeStamp = Date.now();
  }

  function throwingEffect() {

    let w, h, widgetbox, body, bodyh, bodyw, xLimit, yLimit, f1, f2;
    let vx = widgetObj.movementX, vy = widgetObj.movementY;
    let signx, signy, v, theta;
    let previousTop, previousLeft;

    widgetbox = widgetObj.box.getBoundingClientRect();
    body = document.querySelector("body");
    /*
    bodyw = window.getComputedStyle(body).getPropertyValue("width");
    bodyh = window.getComputedStyle(body).getPropertyValue("height");
    */
    bodyw = window.innerWidth, bodyh = window.innerHeight;
    bodyw = parseInt(bodyw, 10); bodyh = parseInt(bodyh, 10);

    w = widgetbox.width, h = widgetbox.h;
    xLimit = bodyw - (widgetbox.width + 15);
    yLimit = bodyh - (widgetbox.height + 15);
    previousTop = widgetbox.top, previousLeft = widgetbox.left;


    v = Math.sqrt(vx*vx + vy*vy);
    v = (v>80)? 80: v;
    signx = (vx<0)? -1: 1, signy = (vy<0)? -1: 1;
    theta = Math.atan(Math.abs(vy)/Math.abs(vx));
    f1 = 0.2, f2 = 0.075;

    if(v>=5)
      requestID = window.requestAnimationFrame(animateWidget);


    function animateWidget() {

      let toTop, toLeft, vx, vy;

      v = (v>7)? v*(1-f1): v*(1-f2);

      vx = v*Math.cos(theta)*signx;
      vy = v*Math.sin(theta)*signy;

      toTop = previousTop + vy, toLeft = previousLeft + vx;

      if(toTop < 15)
        { toTop = 15, vy = 0; }
      else if(toTop > yLimit)
        { toTop = yLimit, vy = 0; }

      if(toLeft < 15)
        { toLeft = 15, vx = 0; }
      else if(toLeft > xLimit)
        { toLeft = xLimit, vx = 0; }

      widgetObj.box.style.top = toTop + "px";
      widgetObj.box.style.left = toLeft + "px";

      previousTop = toTop, previousLeft = toLeft;

      if(v < 1) v = 0;

      if(v === 0){
        window.cancelAnimationFrame(requestID);
        widgetObj.movementX = 0, widgetObj.movementY = 0;
      }
      else
        requestID = window.requestAnimationFrame(animateWidget);
    }
  }

})();

(function LandingPageSetting(){
    let _DT = {
      d: document.querySelector("span#dt > span:first-child"),
      t: document.querySelector("span#dt > span:last-child"),
      word: document.querySelector("span#word_ani")
    };
    let wordOnAnimation, txt, requestID;
    let landingPage = {
      p1: document.querySelector("div#landingPage div.page._1"),
      p2: document.querySelector("div#landingPage div.page._2"),
      contentbox: document.querySelector("div#landingPage > section.content"),
      activatebtn: document.querySelector("div#landingPage button#activate_widget"),
      startingani: document.querySelector("div#weatherwidget div#startingani"),
      descriptionbtn : document.querySelector("div#landingPage div.menu >span:first-child"),
      instructionbtn : document.querySelector("div#landingPage div.menu >span:last-child")
    };

    txt = document.querySelector("p#txt");

    _DT.d.classList.add("on");
    wordOnAnimation = "Draggable";

    for(let i=0; i<=wordOnAnimation.length; i++){
      let slicedWord = wordOnAnimation.slice(0,i);

      window.setTimeout(function(){
        _DT.word.textContent = slicedWord;
      }, i*100);

    }

    window.setInterval(word_switch, 5000);

    function word_switch(){

      if(!_DT.d.classList.contains("on")) {
        _DT.t.classList.remove("on");
        _DT.d.classList.add("on");
        wordOnAnimation = "Draggable";
      }
      else {
        _DT.d.classList.remove("on");
        _DT.t.classList.add("on");
        wordOnAnimation = "Throwable";
      }

      for(let i=0; i<=wordOnAnimation.length; i++){
        let slicedWord = wordOnAnimation.slice(0,i);

        window.setTimeout(function(){
          _DT.word.textContent = slicedWord;
        }, i*100);

      }
    }

    landingPage.activatebtn.addEventListener("click", ()=>{
      setTimeout(()=>{
        landingPage.startingani.style.opacity = 0;
      }, 1500);
      setTimeout(()=>{
        landingPage.startingani.remove();
      }, 2000);
    });

    {
      let h = landingPage.contentbox.getBoundingClientRect().height;
      landingPage.contentbox.scrollTop = h;
    }

    landingPage.descriptionbtn.addEventListener("click", (event)=>{
      window.cancelAnimationFrame(requestID);
      landingPage.descriptionbtn.classList.add("active");
      landingPage.instructionbtn.classList.remove("active");
      scrollAnimation(landingPage.p1.offsetTop);
    });
    landingPage.instructionbtn.addEventListener("click", (event)=>{
      window.cancelAnimationFrame(requestID);
      landingPage.instructionbtn.classList.add("active");
      landingPage.descriptionbtn.classList.remove("active");
      scrollAnimation(landingPage.p2.offsetTop);
    });

    function scrollAnimation(scrollTo) {
      console.log(scrollTo);
      let vel, sign, gap, box;

      box = landingPage.contentbox;
      gap = scrollTo - box.scrollTop;
      if(gap == 0) return;
      sign = (gap > 0)? 1: -1;
      vel = 2*sign;

      requestID = window.requestAnimationFrame(animate);

      function animate() {
        let currentTop, toTop;

        currentTop = box.scrollTop;
        toTop = currentTop + vel;
        if(vel<0) toTop = (toTop<=scrollTo)? scrollTo : toTop;
        else toTop = (toTop>=scrollTo)? scrollTo : toTop;

        vel = vel*1.12;

        box.scrollTop = toTop;
        if(toTop == scrollTo)
          window.cancelAnimationFrame(requestID);
        else
          requestID = window.requestAnimationFrame(animate);

      }
    }
})();
