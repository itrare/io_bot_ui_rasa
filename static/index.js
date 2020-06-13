jQuery = $.noConflict();
jQuery(document).ready(function(){

// =============== send request/queries by user ================== //
   
    jQuery("#in-cb-sendit").click(function(){
        let textToSent = jQuery("#in-cb-sendText").val();
        jQuery("#in-cb-sendText").val("");
        if(textToSent!=""){
        sendRequest(textToSent);
        setUserResponse(textToSent);
        }
    });
    jQuery(document).on("click","li.msg-button button",function(){
        let textToSent = jQuery(this).text();
        if(textToSent!=""){
        sendRequest(textToSent);
        setUserResponse(textToSent);
        }
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
            let defaultMessage = "";
            let BotResponse;
            if (response.length < 1) {
                //if there is no response from Rasa, send  fallback message to the user
                var fallbackMsg = "Sorry for incovinience, I am facing some trouble!";
    
               
    
                jQuery(BotResponse).appendTo(".body-msg");
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
                        BotResponse = '<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="'+response[i].image+'"></div></li>';
                        
                    }
    
    
                    //check if the response contains "buttons" 
                    if (response[i].hasOwnProperty("buttons")) {
                        
                     
                        BotResponse += addButton(response[i].buttons);
                    }
    
                    //check if the response contains "attachment" 
                    if (response[i].hasOwnProperty("attachment")) {
    
                        //check if the attachment type is "video"
                        if (response[i].attachment.type == "video") {
                            video_url = response[i].attachment.payload.src;
    
                            BotResponse =  `<li><div class="bothelp-video-set"><button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button><iframe 
                            src="`+ video_url +`" allowfullscreen></iframe></div></li>`;
                        }
    
                    }
                    //check if the response contains "custom" message  
                    if (response[i].hasOwnProperty("custom")) {
    
            
        
                            
                        //check if the custom payload type is "pdf_attachment"
                        if (response[i].custom.image == "pdf_attachment") {
    
                            BotResponse = `<li> <div class="bothelp-snippet"> <button class="chart-expand-btn"><i class="fas fa-expand-alt"></i></button> <img src="`+response[i].custom.image.src +`"></div></li>`;
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
                        if (response[i].custom.payload == "chart") {
    
                            // sample format of the charts data:
                            // var chartData = { "title": "Leaves", "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"], "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"], "chartsData": [5, 10, 22, 3], "chartType": "pie", "displayLegend": "true" }
    
                            //store the below parameters as global variable, 
                            // so that it can be used while displaying the charts in modal.
                            chartData = (response[i].custom.data)
                            title = chartData.title;
                            labels = chartData.labels;
                            backgroundColor = chartData.backgroundColor;
                            chartsData = chartData.chartsData;
                            chartType = chartData.chartType;
                            displayLegend = chartData.displayLegend;
    
                            // pass the above variable to createChart function
                            createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend);
                            return;
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
            var container = `<div class="msg-wrapper"><div class="msg-grp bot-msg">
            <div class="u-pic">
                <img src="./static/2f08ab311cb92ed2cfafc691b12a8ce2.jpg">
            </div>
            <div class="msg-items"> `+ BotResponse +`</div>
            </div></div>`;
            jQuery(container).appendTo(".body-msg");
            scrollBottom();
            console.log(container);
        }, 500);
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
                for (i = 0; i <noBtn; i++) {
                    addB+='<button data-payload=\'' + (BTN[i].payload) + '\'>' + BTN[i].title + "</button>"
                    
                }
                addB+='</li>';
             
                return addB;
          
        }

});
