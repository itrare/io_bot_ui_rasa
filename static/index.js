jQuery = $.noConflict();

jQuery(document).ready(function() {

    // =============== send request/queries by user ================== //
    let caa;
    jQuery("#in-cb-sendText").on('keypress', function(e) {
        if (e.which == 13) {
            catchText();
        }
    });

    jQuery("#in-cb-sendit").click(function() {
        catchText();
    });

    function catchText() {
        let textToSent = jQuery("#in-cb-sendText").val();
        jQuery("#in-cb-sendText").val("");
        if (textToSent != "") {
            sendRequest(textToSent);
            setUserResponse(textToSent);
        }
    }
    jQuery(document).on("click", ".caraousel-slide button", function() {

        if (jQuery(this).attr('data') == "next") {
            jQuery(this).parent().parent().next().animate({
                scrollLeft: jQuery(this).parent().parent().next().scrollLeft() + 270
            }, 300);
        } else {
            jQuery(this).parent().parent().next().animate({
                scrollLeft: jQuery(this).parent().parent().next().scrollLeft() - 270
            }, 300);

        }
    });
    jQuery(document).on("click", "li.msg-button button", function() {
        let textToSent = jQuery(this).text();
        if (textToSent != "") {
            sendRequest(textToSent);
            setUserResponse(textToSent);
        }
    });
    jQuery(".in-cb-rightItem #show-about").click(function() {
        jQuery(this).children().eq(0).toggleClass("fa-info");
        jQuery(this).children().eq(0).toggleClass("fa-arrow-left");
        jQuery(".in-cb-iabout").toggle();
        jQuery(".in-cb-iabout").toggleClass("pers_anim01");
        jQuery(".body-msg").toggle();
        scrollBottom();
    });
    jQuery(".in-cb-rightItem #expand-chatroom").click(function() {

        scrollBottom();
    });

    function scrollBottom() {
        jQuery(".in-cb-body").scrollTop(jQuery(".in-cb-body").prop('scrollHeight'));
    }

    function setUserResponse(message) {
        var UserResponse = `<div class="msg-wrapper">
        <div class="msg-grp user-msg">
            
            <div class="msg-items">
                <li> ` + message + `</li>
            </div>
            <div class="u-pic">
                <img src="./static/bot2.png">

            </div>
        </div>
        </div>`;
        jQuery(UserResponse).insertBefore(".body-msg #spinner-holder");
        botSpinner(true);
        scrollBottom();

    }

    function putResponse(response) {
        setTimeout(function() {
            botSpinner(false);
            let defaultMessage = "<li>Sorry for incovinience, I am facing some trouble!</li>";
            let BotResponse;
            let customResponse;
            if (response.length < 1) {

                var fallbackMsg = "Sorry for incovinience, I am facing some trouble!";

                scrollBottom();
            } else {


                BotResponse = '';
                customResponse = '';
                for (i = 0; i < response.length; i++) {

                    if (response[i].hasOwnProperty("text")) {

                        iRes = `<li>` + response[i].text + `</li>`;

                        BotResponse += iRes;

                    }

                    if (response[i].hasOwnProperty("image")) {
                        BotResponse += '<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="' + response[i].image + '"></div></li>';

                    }



                    if (response[i].hasOwnProperty("buttons")) {


                        let buttons = response[i].buttons;
                        BotResponse += addButton(buttons);


                    }


                    if (response[i].hasOwnProperty("attachment")) {


                        if (response[i].attachment.type == "video") {
                            video_url = response[i].attachment.payload.src;

                            BotResponse += `<li><div class="bothelp-video-set"><button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button><iframe 
                            src="` + video_url + `" allowfullscreen></iframe></div></li>`;
                        }

                    }

                    if (response[i].hasOwnProperty("custom")) {

                        if (response[i].custom.image == "pdf_attachment") {

                            BotResponse += `<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="` + response[i].custom.image.src + `"></div></li>`;
                        }

                        if (response[i].custom.payload == "location") {
                            jQuery("#userInput").prop('disabled', true);
                            return;
                        }
                        if (response[i].custom.payload == "carousel") {

                            carouselData = (response[i].custom.carousels);
                            customResponse += renderCarousel(carouselData);
                            caa = carouselData;




                        }
                        if (response[i].custom.type == "card") {

                            cardData = (response[i].custom.card);
                            BotResponse += renderCard(cardData);

                        }

                        if (response[i].custom.payload == "chart") {

                            chartData = (response[i].custom.data)
                            createChart(chartData);


                        }

                        if (response[i].custom.payload == "collapsible") {
                            data = (response[i].custom.data);

                        }
                    }
                }

            }
            if (response.length > 0) {
                defaultMessage = BotResponse;
            }
            appendToMSGBody(defaultMessage);
            appendCustomResponse(customResponse, caa);


        }, 0);
    }

    function appendCustomResponse(custom, caa) {
        if(!custom)
            return;
        jQuery(custom).insertBefore(".body-msg #spinner-holder");
        scrollBottom();
    }

    function appendToMSGBody(MSG, custom = false) {
        var container = `<div class="msg-wrapper"><div class="msg-grp bot-msg">
        <div class="u-pic">
            <img src="./static/landing-page-smart-home-with-robot-icon/2050_CROP.jpg">
        </div>
        <div class="msg-items"> ` + MSG + `</div>
        </div></div>`;
        // jQuery(container).appendTo(".body-msg");
        jQuery(container).insertBefore(".body-msg #spinner-holder");
        scrollBottom();
    }

    function sendRequest(text) {
        jQuery.ajax({
            url: "http://localhost:5005/webhooks/rest/webhook",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                message: text,
                sender: "Abhishek"
            }),
            success: function(botResponse, status) {
                console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

                // if user wants to restart the chat and clear the existing chat contents
                if (text.toLowerCase() == '/restart') {
                    //jQuery("#userInput").prop('disabled', false);

                    //if you want the bot to start the conversation after restart
                    // action_trigger();
                    return;
                }
                putResponse(botResponse);

            },
            error: function(xhr, textStatus, errorThrown) {

                if (text.toLowerCase() == '/restart') {
                    // jQuery("#userInput").prop('disabled', false);

                    //if you want the bot to start the conversation after the restart action.
                    // action_trigger();
                    // return;
                }

                // if there is no response from rasa server
                putResponse("");
                console.log("Error from bot end: ", textStatus);
            }
        });
    }

    function botSpinner(param) {
        if (param === true) {
            jQuery("#spinner-holder").show();
        } else {
            jQuery("#spinner-holder").hide(0);
        }
    }
    botSpinner(false);

    function addButton(btn) {

        var BTN = btn;
        var noBtn = btn.length;

        // Loop through suggestions]
        let addB = "<li class='msg-button'>";
        for (var j = 0; j < noBtn; j++) {
            addB += '<button data-payload=\'' + (BTN[j].payload) + '\'>' + BTN[j].title + "</button>"

        }
        addB += '</li>';

        return addB;

    }

    function createChart(data, chartType = "line") {
        //if you want to display the charts in modal, make sure you have configured the modal in index.html
        //create the context that will draw the charts over the canvas in the "#modal-chart" div of the modal

        // jQuery(ctx).removeClass("newChart");
        var container = `<li class="bothelp-canvas-set"> <div class="side-options">
            <button><i class="fas fa-chart-pie fa-fw"></i></button>
            <button><i class="far fa-chart-bar fa-fw"></i></button>
        </div> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <div> <canvas class="newChart" height="720" width="500"></canvas></div></li>`;
        appendToMSGBody(container);
        var cntx = jQuery(".newChart");
        //  cntx.canvas.parentNode.style.height = '300px';
        //cntx.canvas.parentNode.style.width = '250px';


        // Once you have the element or context, instantiate the chart-type by passing the configuration,
        //for more info. refer: https://www.chartjs.org/docs/latest/configuration/

        var options = {
            title: {
                display: true,
                text: "DEMO"
            },
            layout: {
                padding: {
                    left: 5,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            legend: {

                position: "top"
            },
            maintainAspectRatio: true,
            responsive: true,
            steppedLine: true,
        }

        modalChart = new Chart(cntx, {
            type: chartType,
            data: data,
            options: options
        });



        cntx.removeClass("newChart");


        scrollBottom();

    }

    function renderCarousel(data) {
        let dataLength = data.length;
        let carousel = '';
        for (var j = 0; j < dataLength; j++) {
            carousel += `<div class="carousel-item">
                                <div class="carousel-head">
                                    <div> ` + data[j].title + `</div>
                                </div>
                                <div class="carousel-body">
                                <iframe
                                width="250"
                                height="250"
                                frameborder="0" style="border:0"
                                src="https://www.google.com/maps/embed/v1/search?key=AIzaSyCVX9Rp9az96ve6OEUPl81o2xUWrBFVs3s&q=Lucknow" allowfullscreen>
                              </iframe>
                                </div>
                                <div class="carousel-footer">
                                    <div class="options">
                                        <button type="button"> </button>
                                    </div>
                                </div>
                            </div>`;
        }

        let groupCarousel = `
            <div class="msg-wrapper">
            <div class="msg-carousel bot-msg">
                <div class="msg-carousel-nav">
                    <div class="caraousel-slide">
                    <button class="carousel-next carousel-btn-nav" data="prev"><i class="fas fa-angle-left"></i></button>
                    <div></div>
                    <button class="carousel-prev carousel-btn-nav" data="next"><i class="fas fa-angle-right"></i></button>
                    </div>
                </div>
                <div class="carousel-grp" id="carousel-content">
                    ` + carousel + `
                </div>
            </div>
        </div>`;

        //
        return groupCarousel;


    }

    function renderCard(cardData) {
        let cardContainer = `<li><div class="carousel-item">
            <div class="carousel-head">
                <div> ` + cardData.title + `</div>
            </div>
            <div class="carousel-body">
                <img src="` + cardData.image + `">
            </div>
            <div class="carousel-footer">
                <div class="options">
                    <button type="button"> </button>
                </div>
            </div>
        </div></li>`;
        return cardContainer;

    }
    // Create the script tag, set the appropriate attributes




});