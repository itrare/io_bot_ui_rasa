jQuery = $.noConflict();
jQuery(document).ready(function(){

// =============== send request/queries by user ================== //
    jQuery("#in-cb-sendText").on('keypress',function(e) {
    if(e.which == 13) {
        catchText();
    }
    });
    
    jQuery("#in-cb-sendit").click(function(){
        catchText();
    });
    function catchText(){
        let textToSent = jQuery("#in-cb-sendText").val();
        jQuery("#in-cb-sendText").val("");
        if(textToSent!=""){
        sendRequest(textToSent);
        setUserResponse(textToSent);
        }
    }
    jQuery(document).on("click","li.msg-button button",function(){
        let textToSent = jQuery(this).text();
        if(textToSent!=""){
        sendRequest(textToSent);
        setUserResponse(textToSent);
        }
    });
    jQuery(".in-cb-rightItem button").click(function(){
        jQuery(this).children().eq(0).toggleClass("fa-info");
        jQuery(this).children().eq(0).toggleClass("fa-arrow-left");
        jQuery(".in-cb-iabout").toggle();
        jQuery(".in-cb-iabout").toggleClass("pers_anim01");
        jQuery(".body-msg").toggle();
        scrollBottom();
    });
    function scrollBottom(){
        jQuery(".in-cb-body").scrollTop( jQuery(".in-cb-body").prop('scrollHeight') );
    }
    function setUserResponse(message) {
        var UserResponse = `<div class="msg-wrapper">
        <div class="msg-grp user-msg">
            
            <div class="msg-items">
                <li> ` + message + `</li>
            </div>
            <div class="u-pic">
                <img src="./static/2f08ab311cb92ed2cfafc691b12a8ce2.jpg">

            </div>
        </div>
        </div>`;
        jQuery(UserResponse).appendTo(".body-msg").show("slow");
        botSpinner(true);
        scrollBottom();
       
    }
    function putResponse(response){
        setTimeout(function() {
            botSpinner(false);
            let defaultMessage = "<li>Sorry for incovinience, I am facing some trouble!</li>";
            let BotResponse;
           
            if (response.length < 1) {
                //if there is no response from Rasa, send  fallback message to the user
                var fallbackMsg = "Sorry for incovinience, I am facing some trouble!";
    
               
    
               // jQuery(BotResponse).appendTo(".body-msg");
                scrollBottom();
            } else {
                

                //if we get response from Rasa
                BotResponse = '';
                for (i = 0; i < response.length; i++) {
                    
                    //check if the response contains "text"
                    if (response[i].hasOwnProperty("text")) {
                        
                        iRes = `<li>`+ response[i].text +`</li>`;

                        BotResponse +=iRes;
                    
                    }
    
                    //check if the response contains "images"
                    if (response[i].hasOwnProperty("image")) {
                        BotResponse += '<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="'+response[i].image+'"></div></li>';
                        
                    }
    
    
                    //check if the response contains "buttons" 
                    
                    if (response[i].hasOwnProperty("buttons")) {
                        
                        
                        let buttons = response[i].buttons;
                        BotResponse += addButton(buttons);
                        
                        
                    }
                    //check if the response contains "attachment" 
                    
                    if (response[i].hasOwnProperty("attachment")) {
    
                        //check if the attachment type is "video"
                        if (response[i].attachment.type == "video") {
                            video_url = response[i].attachment.payload.src;
    
                            BotResponse +=  `<li><div class="bothelp-video-set"><button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button><iframe 
                            src="`+ video_url +`" allowfullscreen></iframe></div></li>`;
                        }
    
                    }
                    //check if the response contains "custom" message  
                    if (response[i].hasOwnProperty("custom")) {
    
            
        
                            
                        //check if the custom payload type is "pdf_attachment"
                        if (response[i].custom.image == "pdf_attachment") {
    
                            BotResponse += `<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="`+response[i].custom.image.src +`"></div></li>`;
                        }
    
                        //check if the custom payload type is "location"
                        if (response[i].custom.payload == "location") {
                            jQuery("#userInput").prop('disabled', true);
                            getLocation();
                            scrollToBottomOfResults();
                            return;
                        }
    
                        //check if the custom payload type is "cardsCarousel"
                        if (response[i].custom.payload == "cardsCarousel") {
                            restaurantsData = (response[i].custom.data)
                            showCardsCarousel(restaurantsData);
                            return;
                        }
    
                        //check if the custom payload type is "chart"
                        if (response[i].custom.hasOwnProperty("payload")) {

                            // sample format of the charts data:
                            // var chartData = { "title": "Leaves", "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"], "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"], "chartsData": [5, 10, 22, 3], "chartType": "pie", "displayLegend": "true" }
    
                            //store the below parameters as global variable, 
                            // so that it can be used while displaying the charts in modal.
                            chartData = (response[i].custom.payload.data)
                     //       title = chartData.title;
                       //     labels = chartData.labels;
                      //      backgroundColor = chartData.backgroundColor;
                           // chartsData = chartData.chartsData;
                           // chartType = chartData.chartType;
                            //displayLegend = chartData.displayLegend;
    
                            // pass the above variable to createChart function
                            createChart(chartData);
                           
                        }
    
                        //check of the custom payload type is "collapsible"
                        if (response[i].custom.payload == "collapsible") {
                            data = (response[i].custom.data);
                            //pass the data variable to createCollapsible function
                          //  createCollapsible(data);
                        }
                    }
                }
                
            }
            if(response.length>0){
                defaultMessage = BotResponse;
            }
            appendToMSGBody(defaultMessage);
           
        }, 500);
    }
    function appendToMSGBody(MSG){
        var container = `<div class="msg-wrapper"><div class="msg-grp bot-msg">
        <div class="u-pic">
            <img src="./static/2f08ab311cb92ed2cfafc691b12a8ce2.jpg">
        </div>
        <div class="msg-items"> `+  MSG+`</div>
        </div></div>`;
        jQuery(container).appendTo(".body-msg");
        scrollBottom();
    }
    function sendRequest(text){
        jQuery.ajax({
            url: "http://localhost:5005/webhooks/rest/webhook",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ message: text, sender: "Abhishek" }),
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
        function botSpinner(param){
            if(param===true){
                jQuery(".spinner").show();
            }else{
                jQuery(".spinner").hide();
            }
        }
        botSpinner(false);
        function addButton(btn) {
            
                var BTN = btn;
                var noBtn = btn.length;
                
                // Loop through suggestions]
                let addB = "<li class='msg-button'>";
                for (var j = 0; j <noBtn; j++) {
                    addB+='<button data-payload=\'' + (BTN[j].payload) + '\'>' + BTN[j].title + "</button>"
                    
                }
                addB+='</li>';
             
                return addB;
          
        }
        function createChart(data,chartType="bar") {
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
                maintainAspectRatio:true,
                responsive:true,
        
            }
        
            modalChart = new Chart(cntx, {
                type: chartType,
                data: data,
                options: options
            });
     
            

            cntx.removeClass("newChart");
           
           
            scrollBottom();

        }


});
