// localStorage.clear();

let todayIs = moment().format('l');
let cityArr = JSON.parse(localStorage.getItem("userInput")) || [];
let APIKey = "f0c2ae9f58930d7040112332f71a143d";

function putOnPage(array) {

    $("#todayIs").text(todayIs);
    $(".list-group").empty();
    array = JSON.parse(localStorage.getItem("userInput")) || [];
    for (let i = 0; i < array.length; i++) {
        let newLi = $("<li class='list-group-item city'>").text(array[i]).attr("data-city", array[i]);
        $(".list-group").prepend(newLi);
    };
    // console.log(array);
};

function ajaxCall(cityName, url, arr) {

    let cardDeck = $(".card-deck");
    let lat = "";
    let lon = "";

    $(".card-deck").empty();
    $("input").val("");

    $.ajax({
        method: "GET",
        url: url,
        dataType: "json",
        success: function (response) {
            console.log("Success");
            console.log(response);

            let icon = response.weather[0].icon;
            let iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
            let iconImg = $("<img>").attr("src", iconURL)
            console.log("Icon URL: ", iconURL);
            let curTemp = response.main.temp;
            let curHumidity = response.main.humidity;
            let curWind = response.wind.speed;
            cityArr.push(cityName);
            localStorage.setItem("userInput", JSON.stringify(cityArr));

            $("#current").text(`${cityName} (${todayIs}) `).append(iconImg);
            $("#cur-temp").text(curTemp).append(" °F");
            $("#cur-hum").text(curHumidity).append(" %");
            $("#cur-wind").text(curWind).append(" MPH");

            putOnPage(cityArr);

            lat += response.coord.lat;
            lon += response.coord.lon;

            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lat + "&lon=" + lon,
                method: "GET"
            }).then(function (response) {
                let uvIndex = response.value;
                $("#cur-uv").text(uvIndex);
            });
        },
        error: function (e) {
            console.log("Error");
            alert(`Error. ${cityName} Not Found`);
        }
    });

    var forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?appid=' + APIKey + '&q=' + cityName + '&count=40';

    $.ajax({
        url: forecastURL,
        dataType: "json",
        type: "GET",
        data: {
            q: cityName,
            appid: APIKey,
            units: "imperial",
            cnt: "40"
        },
        success: function (data) {
            console.log('Received data:', data);
            console.log('Received data-list:', data.list);
            let every3hour = data.list;
            for (let i = 4; i < every3hour.length; i += 8) {
                let outerDiv = $("<div>").attr("class", "card bg-primary");
                let innerDiv = $("<div>").attr("class", "card-body text-left");
                let pDate = $("<p>").attr("class", "card-text").text(every3hour[i].dt_txt);
                let icon = $("<img src='https://openweathermap.org/img/w/" + every3hour[i].weather[0].icon + ".png'>");
                let temp = $("<p>").attr("class", "card-text").text("Temp: " + every3hour[i].main.temp).append(" °F");
                let humidity = $("<p>").attr("class", "card-text").text("Humidity: " + every3hour[i].main.humidity).append(" %");
                innerDiv.append(pDate, icon, temp, humidity);
                outerDiv.append(innerDiv);
                cardDeck.append(outerDiv);
            };
        }
    });
};

putOnPage(cityArr);

$(document).on("click", "#submit", function (event) {

    event.preventDefault();

    let cityName = $(this).parent().siblings("#user-input").val().trim();
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey + "&units=imperial";

    ajaxCall(cityName, queryURL, cityArr);

});

$(document).on("click", ".city", function (event) {

    event.preventDefault();

    let cityName = $(this).attr("data-city");
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey + "&units=imperial";

    ajaxCall(cityName, queryURL, cityArr);
});