//turns the search button into a variable
// var newCity = document.querySelector("#btn");
//adds event listener
// newCity.addEventListener("click", function() {
    //add the function for what happens when you search a city
// });

if(localStorage.getItem('searchHistory') === null) {
  localStorage.setItem('searchHistory', JSON.stringify([]))
}

var apiKey = '8f0fe1c2e1b6bf51ff65bb8d80f3ff00'

// id's that populate the div that displays today's forecast
var cityAndDateEl = $('#cityAndDate')
var tempEl = $('#temp')
var windEl = $('#wind')
var humidityEl = $('#humidity')
var uvTextEl = $('#uvIndexText')
var weatherIconEl = $('#weatherIcon')
var fiveDayForecastEl = $('#fiveDayForecast')
var cityName = '';
var stateName = '';




function getApi() {
  // resets dynamically populated five day forecast div
  fiveDayForecastEl.html('');

  // initial fetch to pull coordinates
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateName},US&appid=${apiKey}`)
      .then(function (response) {
        return response.json();
      })
      .then(function (inititalData) {

        var lattitude = inititalData.coord.lat;
        var longitude = inititalData.coord.lon;

        // uses newly acquired lat and lon coordinates to fetch the 'one call' api
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lattitude}&lon=${longitude}&units=imperial&exclude=minutely&appid=${apiKey}`)
        .then(function (response) {
          return response.json();
        })

        .then(function (oneCallData) {
          // converts unix time to a date
          var dateObject = new Date(oneCallData.current.dt * 1000);
          var humanDateFormat = dateObject.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "numeric"
          });
          // populates today's forecast with the data recieved from the one call api data. 
          cityAndDateEl.text(`${cityName}, ${stateName} -- ${humanDateFormat}`);
          weatherIconEl.attr('src', 'https://openweathermap.org/img/w/' + oneCallData.current.weather[0].icon + '.png'); 
          tempEl.text('Temperature: ' + oneCallData.current.temp + '°F');
          windEl.text('Wind: ' + oneCallData.current.wind_speed + ' MPH');
          humidityEl.text('Humidity: ' + oneCallData.current.humidity + '%');
          uvTextEl.text('UV Index: ');
          var uvNumber = $('<span></span>');
          uvNumber.text(' ' + oneCallData.current.uvi)
          uvTextEl.append(uvNumber)
          if(oneCallData.current.uvi <= 2) {
            uvNumber.addClass('green')
          } else if (2 < oneCallData.current.uvi <= 5) {
            uvNumber.addClass('yellow')
          } else if (5 < oneCallData.current.uvi <= 7) {
            uvNumber.addClass('orange')
          } else {
            uvNumber.addClass('red')
          }
          fiveDayForecastEl.removeClass('invisible');
          
          // uses a for loop to generate a card layout for the five day forecast
          for (let i = 1; i < 6; i++) {
            const element = oneCallData.daily[i];
            var unixToDate = new Date (element.dt * 1000);
            var forecastDiv = $('<div></div>');
            forecastDiv.id = 'forecastDiv'
            forecastDiv.addClass('card col-lg-2 col-md-5 col-sm-12 m-2 text-blk light-blue');
            fiveDayForecastEl.append(forecastDiv);
            var forecastDate = $('<h5></h5>').text(unixToDate.toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "numeric"
            }))
            var iconImg = $('<img></img>').attr('src', 'https://openweathermap.org/img/w/' + element.weather[0].icon + '.png')
            var temph6 = $('<h6></h6>').text('Temp: ' + element.temp.day + '°F');
            var windh6 = $('<h6></h6>').text('Wind: ' + element.wind_speed + 'mph');
            var humidityh6 = $('<h6></h6>').text('Humidity: ' + element.humidity + '%');
            forecastDate.addClass('bold');
            iconImg.addClass('icon-img');
            forecastDiv.append(forecastDate);
            forecastDiv.append(iconImg);
            forecastDiv.append(temph6);
            forecastDiv.append(windh6);
            forecastDiv.append(humidityh6);

          }
        })
        })
}

// sets searches in local storage to more easily populate search history buttons
function setHistory() {
  if(localStorage.getItem('searchHistory') === null) {
    localStorage.setItem('searchHistory', JSON.stringify([]))
  }
  var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
for (let i = 0; i < searchHistory.length; i++) {
  const element = searchHistory[i];
  if (element.city === cityName) {
    return;
  }
}
  searchHistory.push({city: cityName, state: stateName})
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory))

}

// generates buttons with info from local storage 
function recentSearches() {
  $('#search-history').html('')
  var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
  for (let i = 0; i < searchHistory.length; i++) {
    const element = searchHistory[i];
    var searchButton = $('<button></button>').attr({value:element.city + '-' + element.state});
    searchButton.html(element.city + ', ' + element.state);
    searchButton.addClass('btn m-1 btn-light w-100');
    $('#search-history').append(searchButton);
  }
}

// grabs weather info on previously searched cities by clicking on their dynamically generated buttons
$('#search-history').on('click', '.btn', function(event){
  event.preventDefault();
  cityName = $(this).val().split('-')[0];
  stateName = $(this).val().split('-')[1];
  getApi()
  })

 // main function. called when the user clicks the get weather button. it runs getApi() to get weather data, setHistory() to update local storage, and recentSearches() to update the search history buttons. 
function weatherReport() {
  // variables that capture user input
  var cityEl = $('#city').val().trim();
  cityName = cityEl
  var stateEl = $('#state :selected').val();
  stateName = stateEl
  getApi();
  setHistory();
  recentSearches();
}  

// goes into local storage on page load to keep the previously searched cities as clickable buttons.
    recentSearches(); 

// runs the main function on button click.
  $('#get-weather-btn').on('click', weatherReport);