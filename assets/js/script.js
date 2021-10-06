var apiKey = '1954df614121c3c2ef68df0743988e4c';
var rootUrl = 'https://api.openweathermap.org';
var queryURL;
var week = [];

//DOM Selectors
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var currentWeather = document.querySelector('#today');
var historyContainer = document.querySelector('#history');
var citySearch = document.querySelector('#searched-city');
var currentTemp = document.querySelector('#temp');
var currentWind = document.querySelector('#wind');
var currentHumidity = document.querySelector('#humidity')
var currentUVI = document.querySelector('#uv');
var uviTitle = document.querySelector('#uv-title');
var searchedCities = JSON.parse(localStorage.getItem("searchedCities")) || [];


function getWeather() {
    var city = searchInput.value.trim();

    var queryURL = rootUrl + '/geo/1.0/direct?q=' + city + '&limit=5&units=imperial&appid=' + apiKey;
    console.log(city);

    // Fetch's latitude and longitude
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data)
            
            addCityToRecents(city);

            fetch(rootUrl + '/data/2.5/onecall?lat=' + data[0].lat + '&lon=' + data[0].lon + '&units=imperial&appid=' + apiKey).then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    //Pulls current temp
                    var temp = (data.current.temp);
                    currentTemp.textContent = "Temperature: " + temp + ' ºF'
                    //Pulls current wind speed
                    var wind = (data.current.wind_speed);
                    currentWind.textContent = "Wind Speed: " + wind + ' mph'
                    //Pulls current humidity
                    var humidity = (data.current.humidity);
                    currentHumidity.textContent = "Humidity: " + humidity + '%'
                    //Pulls current UVI
                    var uvi = (data.current.uvi);
                    uviTitle.textContent = "UV Index: ";
                    currentUVI.textContent = uvi
                    //Pulls city name next to current date
                    var date = moment().format("MM[/]DD[/]YYYY");
                    citySearch.textContent = city + "\n" + "(" + date + ")";

                    // Change UVI background color
                    var uviBackground = $('.uv-background');
                    if (uvi <= 2) {
                        console.log("123");
                        uviBackground.css("background-color", "green")
                    } else if (uvi > 2 && uvi <= 8) {
                        uviBackground.css("background-color", "yellow")
                    } else if (uvi > 8) {
                        uviBackground.css("background-color", "red")
                    }

                    //5-Day Forecast
                    fetch(rootUrl + "/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey).then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        console.log(data);
                        var forecastWeather = $('#forecast');
                        $('#forecast-title').text("5-Day Forecast");
                       
                        for (var i = 0; i < 5; i++) {
                            var day = {
                                dayNum: i,
                                conditions:data.list[i].weather[0].icon,
                                temp: data.list[i].main.temp,
                                wind: data.list[i].wind.speed,
                                humidity: data.list[i].main.humidity
                            }
                            week.push(day);
                            forecastWeather.children().eq(i).empty();
                            console.log(week)

                            var currentDate = moment();
                            var icon = week[i].conditions;
                            var weekDate = $("<h6></h6>").text(moment(currentDate, "MM[/]DD[/]YYYY").add(i + 1, 'days'));
                            var status = $("<img>").attr("src","http://openweathermap.org/img/wn/" + icon + "@2x.png");
                            var weekTemp = $("<h6></h6>").text(week[i].temp + " F");
                            var weekWind = $("<h6></h6>").text(week[i].wind + " MPH");
                            var weekHumid = $("<h6></h6>").text(week[i].humidity + " Humidity");
                           forecastWeather.children().eq(i).append(weekDate, status, weekTemp, weekWind, weekHumid);
                        }
                        
                    })
                })
        })
};

function addCityToRecents(searchedCity) {
    searchedCities.push(searchedCity);
    localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
    var recentList = $("#city-results");
    recentList.append(`<button>${searchedCity}</button>`);
}

function renderSavedSearches(){
    var recentList = $("#city-results");
    for (var i = 0; i < searchedCities.length && i < 5; i++) {
        var city = `<button>${searchedCities[i]}</button>`;
        recentList.append(city);
    }
}

$('#search-button').on("click", (event) => {
    event.preventDefault();
    getWeather();
})

renderSavedSearches();
