//SLIGHTLY modified version of thmslprt's script
//CREDIT TO https://github.com/thmslprt/hangouts-chat-rss-bot

// URL of the RSS feed to parse
var RSS_FEED_URL = "(STATUS PAGE RSS FEED)";

// Webhook URL of the Hangouts Chat room
var WEBHOOK_URL = "(GOOGLE CHAT WEBHOOK URL";

// When DEBUG is set to true, the topic is not actually posted to the room
var DEBUG = false;

function fetchNews() {
  
  var lastUpdate = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastUpdate")) || 0);

  Logger.log("Last update: " + lastUpdate);
  
  Logger.log("Fetching '" + RSS_FEED_URL + "'...");
  
  var xml = UrlFetchApp.fetch(RSS_FEED_URL).getContentText();
  var document = XmlService.parse(xml);
    
  var items = document.getRootElement().getChild('channel').getChildren('item').reverse();
  
  Logger.log(items.length + " entrie(s) found");
  
  var count = 0;
  
  for (var i = 0; i < items.length; i++) {
    
    var pubDate = new Date(items[i].getChild('pubDate').getText());
    //var pubDate = new Date(items[i].getChild('pubDate'));
    
    var title = items[i].getChild("title").getText();
    var description = items[i].getChild("description").getText();
    var link = items[i].getChild("link").getText();
    var name = "Name";
    var today = new Date();
    
    today.setMinutes(today.getMinutes() + 1);
    
  
    if(link.includes("zoom")){name = "Zoom"}
     else if(link.includes("blackboard")){name = "Blackboard"}
     else if(link.includes("nwea")){name = "NWEA"}
     else if(link.includes("google")){name = "Google"}
     else if(link.includes("meeting")){name = "GoToMeeting"}
     else if(link.includes("webex")){name = "WebeEx"}
     else if(link.includes("instructure")){name = "Canvas"}
     else if(link.includes("clever")){name = "Clever"}
     else if(link.includes("seesaw")){name = "Seesaw"}
     else if(link.includes("kamihq")){name = "Kami"}
       else {
        name = "No Name"
           }
       
    if(DEBUG){
      Logger.log("------ " + (i+1) + "/" + items.length + " ------");
      Logger.log(pubDate);
      Logger.log(title);
      Logger.log(link);
      // Logger.log(description);
      Logger.log("--------------------");
    }

    
    if(pubDate.getTime() > lastUpdate.getTime() && pubDate.getTime() < today.getTime()) {
      Logger.log("Posting topic '"+ title +"'...");
      if(!DEBUG){
        postTopic_(title, description, link, name,pubDate,today);
      }
      PropertiesService.getScriptProperties().setProperty("lastUpdate", Date.now());
      count++;
      
      
      /*Limiter for Testing
      if(count > 1){
        break;
        }
      
      */
      
      
    }
  }
  
  Logger.log("> " + count + " new(s) posted");




}

function postTopic_(title, description, link,name,pubDate,today,lastUpdate) {
 
  var name = "*" + name + "*" + "\n";
  var text = "*" + title + "*" + "\n";
  var pubDate = "*" + pubDate + "*" + "\n";
  var today = today;
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      "text": "Service: " + name + "\n" + "Issue Description: " + text + "\n"+ "Date Reported: "+ pubDate +"\n" + "Link to Status Page: " + link,
    })
  };
  
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}
