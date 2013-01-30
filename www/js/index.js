/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var mapdata = null;

var cachedData = null;

var currentBusinessData = null;


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        console.log('Received Event: ' + id);

        alert('Device is ready');

        bind();
    }
};


/**
 * Fetch the details of a place/business. This function is called before user navigates to details page
 */
function fetchDetails(entry){

    console.log('--fetchDetails--');

    currentBusinessData = null;

    $.mobile.showPageLoadingMsg();

    var detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?reference=" + entry.reference + "&sensor=false&key=AIzaSyCBRSbosCTi9toiTCM1yidoN0I6qWgTMnw";

    console.log(detailsUrl);

    $("#name").html("");
    $("#address").html("");
    $("#phone").html("");
    $("#rating").html("");
    $("#homepage").attr("href", "");

    $.getJSON(detailsUrl, function(data){

        if (data.result) {

            currentBusinessData = data.result;

            /*
            isFav(currentBusinessData, function(isPlaceFav){

                console.log(currentBusinessData.name+" is fav "+isPlaceFav);
                if (!isPlaceFav) {

                    $("#add").show();
                    $("#remove").hide();
                }
                else {

                    $("#add").hide();
                    $("#remove").show();
                }
                $("#name").html(data.result.name);
                $("#address").html(data.result.formatted_address);
                $("#phone").html(data.result.formatted_phone_number);
                $("#rating").html(data.result.rating);
                $("#homepage").attr("href", data.result.url);

            });
            */

            $("#add").show();
            $("#remove").hide();

            $("#name").html(data.result.name);
            $("#address").html(data.result.formatted_address);
            $("#phone").html(data.result.formatted_phone_number);
            $("#rating").html(data.result.rating);
            $("#homepage").attr("href", data.result.url);

        }
    }).error(function(err){
            console.log("Got Error while fetching details of Business " + err);
        }).complete(function(){
            $.mobile.hidePageLoadingMsg();
        });
}


function initiateSearch() {
    $("#search").click(function () {

        console.log('initiateSearch called') ;

        try {

            $.mobile.showPageLoadingMsg();

            navigator.geolocation.getCurrentPosition(function (position) {

                console.log(position);

                var radius = $("#range").val() * 1000;

                mapdata = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                var url ="https://maps.googleapis.com/maps/api/place/search/json?location=" + position.coords.latitude + "," + position.coords.longitude + "&radius=" + radius +
                        "&name=" + $("#searchbox").val() + "&sensor=true&key=AIzaSyCBRSbosCTi9toiTCM1yidoN0I6qWgTMnw";

                $.getJSON(url, function (data) {

                    console.log('getJSON woked');
                    console.log(data);

                    cachedData = data;
                    $("#result-list").html("");

                    try {

                        $(data.results).each(function (index, entry) {

                            var htmlData = "<a href=\"#details\" id=\"" + entry.reference + "\"><img src=\"" + entry.icon + "\" class=\"ui-li-icon\"></img><h3>&nbsp;" + entry.name + "</h3><p><strong>&nbsp;vicinity:" + entry.vicinity + "</strong></p></a>";
                            var liElem = $(document.createElement('li'));


                            $("#result-list").append(liElem.html(htmlData));

                            $(liElem).bind("tap", function(event){
                                event.stopPropagation();

                                fetchDetails(entry);
                                return true;
                            });
                        });

                        //$("#result-list").listview('refresh');
                    }
                    catch (err) {

                        console.log("Got error while putting search result on resultpage " + err);
                    }

                    $.mobile.showPageLoadingMsg();
                    $.mobile.changePage("#list");

                }).error(function (xhr, textStatus, errorThrown) {
                        console.log("Got error while fetching search result : xhr.status=" +
                            xhr.status);

                }).complete(function (error) {
                        $.mobile.hidePageLoadingMsg();
                });
            }, function (error) {
                console.log("Got Error fetching geolocation " + error);
            });

        } catch (err) {
            console.log("Got error on clicking search button " + err);
        }
    });
}

function initiateMap() {

    console.log('initiateMap called');

    $("#map").live("pagebeforecreate", function () {

        try {

            $('#map_canvas').gmap({
                'center': mapdata,
                'zoom': 12,
                'callback': function (map) {

                    $(cachedData.results).each(function (index, entry) {

                        $('#map_canvas').gmap('addMarker', {
                            'position': new
                                google.maps.LatLng(entry.geometry.location.lat, entry.geometry.location.lng),
                            'animation': google.maps.Animation.DROP
                        }, function (map, marker) {

                            $('#map_canvas').gmap('addInfoWindow', {
                                'position': marker.getPosition(),
                                'content': entry.name
                            }, function (iw) {
                                $(marker).click(function () {

                                    iw.open(map, marker);

                                    map.panTo(marker.getPosition());
                                });
                            });
                        });

                    });
                }

            });

            console.log("Map initialized");

        }
        catch (err) {

            console.log("Got error while initializing map " + err);
        }
    });

    console.log('initiateMap2 exit');
}



function bind()
{
    alert('Calling bind');

    initiateMap();

    initiateSearch();
}
