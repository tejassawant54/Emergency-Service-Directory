var app = angular.module("esdList",['angularUtils.directives.dirPagination','angularSpinner']),
    http = new XMLHttpRequest(); 	// We create the HTTP Object	

app.controller("esdController",["$http","$scope", "usSpinnerService", function($http,$scope,usSpinnerService){

    var self = this,
        url = "http://people.rit.edu/dmgics/754/23/proxy.php";
    
    self.orgs = [];
    self.cities = [];
        
    var st;
    
    /**
    * startSpin() - Function to start the spinner
    */
    
    self.startSpin = function(){
        usSpinnerService.spin('spinner-1');
    }
    
    /**
    * stopSpin() - Function to stop the spinner on loading all the data
    */
    
    self.stopSpin = function(){
        usSpinnerService.stop('spinner-1');
    }
    
    // Citation: http://code.ciphertrick.com/2015/06/01/search-sort-and-pagination-ngrepeat-angularjs/
    
    $scope.sort = function(keyname){
        
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    
    /**
    * getOrgs() - Function to get Organization types from the API
    */
    
    self.getOrgs = function(){
    
        $http.get(url+"?path="+encodeURIComponent("/OrgTypes"),{responseType:"document"}).success(function(response){

        var orgType = response.getElementsByTagName("type");
            
        for(var i=0;i<orgType.length;i++){    
            self.orgs.push(orgType[i].firstChild.data);             // Push the data into array and send it to the view to display
        }    
                
        });  
    };
    
    /**
    * getCities() - Function to get Cities from the API
    *               Calls getCity function on Success
    */
        
    self.getCities = function(state){
        
        self.cities = [];
        st = state || "NY";
            
        $http.get(url+"?path="+encodeURIComponent("/Cities")+"?state="+st,{responseType:"document"}).success(self.getCity); // On success calls getCity
    
    };
    
    /**
    * getCity() - Get cities and binds to the view
    */
    
    self.getCity  = function(xmlDoc){
                
        var opts = "",
            cityType;
                
        if($(xmlDoc).find("error").length !== 0){
              console.error("AJAX error");
        }else if($(xmlDoc).find("row").length === 0){                              // If no cities found in the state 
                  
                $("#orgCitySearch").html("There are no cities in "+st);
                $("#orgCitySearch").css("display","inline");
                
                 
        }else{
                $("#orgCitySearch").css("display","none");                       // else store the cities in array and send it to view
                cityType = xmlDoc.getElementsByTagName("city");
                        
                for(var i=0;i<cityType.length;i++){   
                    if(cityType[i].firstChild != null){
                        self.cities.push(cityType[i].firstChild.data);
                    }
                }
        }
   
    };            
    
    /**
    * showResults() - Display results in a table on submit
    * @param {string} input - data from the form
    */
        
    self.showResults = function(input){
        
        var name = input['name'],
            cty = input['county'],
            zip = input['zip'],
            orgTyp = input['type'],
            state = input['state'],
            city = input['town'],
            obj = {};
        
        obj = {type: orgTyp,
              state: state,
              town: city};
        
        var retVal = $('orgName').validation({val: name,                // Call to Validation cutom plugin to validate
                                type: "name"});
        var retCounty = $('county').validation({val: cty,
                                type: "name"});
        var retZip = $('zip').validation({val: zip,
                                type: "zip"});
        //----------- Org Name ---------------
        
        if(retVal === false){
            
            $("#orgSearch").html("Enter Valid Organization Name !!");
            $("#orgSearch").css("display","inline");
            
        }else{
             //console.log("In else "+retVal);
            if(retVal === ""){
                console.log("Object empty");  
            }else{
                
                $("#orgSearch").css("display","none");
                obj["name"] = retVal;
            }
        }
        
        //------------ Conty ----------------
        
        if(retCounty === false){
            
            $("#ctySearch").html("Enter Valid County !!");
            $("#ctySearch").css("display","inline");
            
        }else{
             //console.log("In else "+retCounty);
            if(retCounty === ""){
                console.log("Object empty");  
            }else{
                $("#ctySearch").css("display","none");
                obj["county"] = retCounty;
            }
        }
        
        //------------ Zip ----------------
        
        if(retZip === false){
            
           $("#zipSearch").html("Enter Valid Zip !!");
           $("#zipSearch").css("display","inline");
            
        }else{
             //console.log("In else "+retZip);
            if(retZip === ""){
                console.log("Object empty");  
            }else{
                
                $("#zipSearch").css("display","none");
                obj["zip"] = retZip;
            }
        }
        
        //console.log("after validation: ",angular.element.param(obj));
        
        self.dataArr = [];
        
        // if everything validates show data in table
        
       if((retVal !== false || retVal === "") && (retCounty !== false || retCounty === "") && (retZip !== false || retZip === "")){
        $http.get(url+"?path="+encodeURIComponent("/Organizations")+"?"+encodeURIComponent(angular.element.param(obj)),                   {responseType:"document"}).success(function(response){
        
            //console.log(response);
            $('row',response).each(function(){                                   // Push each row data in to array and send it 
                                                                                 // to view to display in table
            
                self.dataArr.push({id: $('OrganizationID',this).text(),
                                  type: $('type',this).text(),
                                  name: $('Name',this).text(),
                                  city: $('city',this).text(),
                                  zip: $('zip',this).text(),
                                  county: $('CountyName',this).text(),
                                  state: $('State',this).text()});
                self.stopSpin();                                            // Stop spinner after loading data
            });
           
        } );
       }
        if(self.dataArr.length == 0){                                      // stop spinner if No Results Found 
            
            setTimeout(function(){self.stopSpin();},400);
        }
    }; 
        
    /**
    * getTabs() - Generate tabs on click for particular Organization
    * @param {Number} val - Selected organization ID to view tabs for.
    */
    
    self.getTabs = function(val,name){
    
        $http.get(url+"?path="+encodeURIComponent("/Application/Tabs")+"?orgId="+val,{responseType:"document"}).success(function(response){
           
            var x ="";
            
            //console.log("in tabs: "+name);
                
            if($(response).find("error").length !== 0){
                  console.error("AJAX error");
              }else{ 
                  
                  x += "<div class='modal-content animated bounceInDown'>";
                  x += "<div class='modal-header'>";
                  x += "<button type='button' class='close' data-dismiss='modal' onclick='closePopup()'>&times;</button>";
                  x += "<h3 class='modal-title'>"+name+"</h3>";
                  x += "</div>";
                  
                  x += "<div class='modal-body'>";
                  
                  x += "<ul>";
                  
                  $("Tab",response).each(function(){                        // Generates Tabs using JQuery UI        
                    
                      x += "<li><a href= "+'#'+$(this).text()+">"+$(this).text()+"</a></li>"
                      
                  });
                  
                  x += "</ul>";
                  
                  $("Tab",response).each(function(){                        // Show Tabs on each click for specific organization        
                  
                        if($(this).text() == "General"){
                            
                            x += "<div id='General'>";
                            $http.get(url+"?path=/"+val+encodeURIComponent("/General"),{responseType:"document"}).success(self.getGenData);                        // On success call getGenData to show General info 
                                                                           
                            x += "</div>";
                            
                        }else if($(this).text() == "Locations"){
                            
                            x += "<div id='Locations' style='position: relative;height: 550px;'>";
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Locations"),{responseType:"document"}).success(self.getLocData);
                            x += " <div id='googleMap' style='width: 450px;height: 450px;top: 80px;left: 290px;'></div>"
                            x += "</div>";
                        }else if($(this).text() == "Facilities"){
                            
                            x += "<div id=Facilities >"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Facilities"),{responseType:"document"}).success(self.getFacData);                       // On success call getFacData to show Facilities info  
                            x += "</div>";                                     
                                    
                        }else if($(this).text() == "People"){
                            
                            x += "<div id=People >"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/People"),{responseType:"document"}).success(self.getPplData);                        // On success call getPplData to show People info 
                            x += "</div>";                                 
                            
                        }else if($(this).text() == "Treatment"){
                            
                            x += "<div id=Treatment style='overflow:auto;' >"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Treatments"),{responseType:"document"}).success(self.getTrtData);                        // On success call getTrtData to show Treatment info 
                            x += "</div>";                                  
                            
                        }else if($(this).text() == "Training"){
                            
                            x += "<div id=Training style='overflow:auto;' >"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Training"),{responseType:"document"}).success(self.getTraData);                       // On success call getTraData to show Training info 
                            x += "</div>";                                
                            
                        }else if($(this).text() == "Equipment"){
                            
                            x += "<div id=Equipment >"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Equipment"),{responseType:"document"}).success(self.getEqpData);                      // On success call getEqpData to show Equipment info 
                            x += "</div>";  
                            
                        }else if($(this).text() == "Physicians"){
                            
                            x += "<div id=Physicians style='height:400px;overflow:auto;'>"; 
                             $http.get(url+"?path=/"+val+encodeURIComponent("/Physicians"),{responseType:"document"}).success(self.getPhyData);                     // On success call getPhyData to show Physicians info 
                            x += "</div>";
                            
                        }    
                  });
                  
                x += "</div>";
                x += "   <div class='modal-footer'>";
                x += "        <button type='button' class='btn btn-default' data-dismiss='modal' onclick='closePopup()'>Close</button>";
                x += "   </div>";
                x += "</div>";
                  
                if($("#tabOutput").tabs("instance")){
                
                    $("#tabOutput").tabs("destroy");
                }  
                
                $("#tabOutput").html(x).tabs();  
                $("#tabOutput").css("display","block");
                  
              }   
            
            self.stopSpin();                // Stop spinner on data load
           
           } )
    };
        
    /**
    * getGenData() - Get general data for a particualr tab and display
    * @param {xml} xmlDoc - Response from the ajax call
    */
    
        self.getGenData = function(xmlDoc){
            
            var x = angular.element(document.querySelector('#General')); 
             
            $('data',xmlDoc).each(function(){       
                                
                x.append( "<h3>GENERAL INFORMATION</h3>" );    
                x.append( "<p>NAME: "+$('name',this).isNullOrNot()+"</p>" );    // Used isNullOrNot Plugin to check if null or blank
                x.append( "<p>DESCRIPTION: "+$('description',this).isNullOrNot()+"</p>" );    
                x.append( "<p>EMIAL: "+$('email',this).isNullOrNot()+"</p>" );    
                x.append( "<p>WEBSITE: "+$('website',this).isNullOrNot()+"</p>" );    
                x.append( "<p>NUMBER OF MEMBERS: "+$('nummembers',this).isNullOrNot()+"</p>" );    
                x.append( "<p>NUMBER OF CALLS LAST YEAR: "+$('numcalls',this).isNullOrNot()+"</p>" );    
                
            });
        };
    
    /**
    * getLocData() - Get Location data for a particualr tab and display
    * @param {xml} xmlDoc - Response from the ajax call
    */

        self.getLocData = function(xmlDoc){
            
            var x = angular.element(document.querySelector('#Locations')),
                locdata = "",
                mapData = "",
                myLatLon = "",
                bounds = new google.maps.LatLngBounds(),
                locXML = [],
                sel = "";
            
            $('location',xmlDoc).each(function(){     // Push each Location info into an array
                    
                    locXML.push({
                                    type: $('type',this).isNullOrNot(),
                                    address1: $('address1',this).isNullOrNot(),
                                    address2: $('address2',this).isNullOrNot(),
                                    city: $('city',this).isNullOrNot(),
                                    state: $('state',this).isNullOrNot(),
                                    zip: $('zip',this).isNullOrNot(),
                                    phone: $('phone',this).isNullOrNot(),
                                    ttyphone: $('ttyPhone',this).isNullOrNot(),
                                    fax: $('fax',this).isNullOrNot(),
                                    latitude: $('latitude',this).isNullOrNot(),
                                    longiude: $('longitude',this).isNullOrNot(),
                                    countyId: $('countyId',this).isNullOrNot(),
                                    countyName: $('countyName',this).isNullOrNot(),
                                    siteId: $('siteId',this).isNullOrNot()
                                });
                });
            
            
            x.append("<h3 style='position: absolute;top: 20px;'>LOCATION INFROMATION</h3><br/>");
            sel = "<select id='locSelect' style='position: absolute;top: 125px;'>";
            sel += '<option value="">---Select Location---</option>';
            $('location',xmlDoc).each(function(){                               // Create Select options for different locations
              sel += '<option value="'+ $("siteId",this).text() +'">Location: '+ $("type",this).text() +'</option>';
            });    
            
            sel += "</select>";
            
            x.append(sel);
            
            x.append(locdata);
            
            $('#locSelect').on('change',function(){             // onchange of select value
               
                var siteIdXML = xmlDoc.getElementsByTagName('siteId'),
                    seleVal = this.value,
                    flag = false;
                
                for(var i=0;i<siteIdXML.length;i++){
            
                    if(seleVal === siteIdXML[i].firstChild.data){               // If true display data related to selected location
                
                        $('#locDiv').remove();        
                
                       locdata = "<div id='locDiv' style='position: absolute;top: 160px;'>";
                       locdata += "<p>TYPE: "+locXML[i].type+"</p>";    
                       locdata += "<p>ADDRESS: "+locXML[i].address1+"</p>";   
                       //x.append("<p>TYPE: "+locXML[i].address2+"</p>")    
                       locdata += "<p>CITY: "+locXML[i].city+"</p>";    
                       locdata += "<p>STATE: "+locXML[i].state+"</p>";   
                       locdata += "<p>COUNTY: "+locXML[i].countyName+"</p>";   
                       locdata += "<p>ZIP: "+locXML[i].zip+"</p>";  
                       locdata += "<p>PHONE: "+locXML[i].phone+"</p>";  
                       locdata += "<p>TTYPHONE: "+locXML[i].ttyphone+"</p>";   
                       locdata += "<p>FAX: "+locXML[i].fax+"</p>";    
                       locdata += "<p>LATITUDE: "+locXML[i].latitude+"</p>";    
                       locdata += "<p>LONGITUDE: "+locXML[i].longiude+"</p>";    
                       locdata += "</div>";
                        
                       //console.log("Lat: "+ locXML[i].latitude+" Log: "+locXML[i].longiude);
                        
                        var Latitude = locXML[i].latitude.trim(),
                            Longitude = locXML[i].longiude.trim();
                     
        //Citation: http://webkul.com/blog/get-latitude-and-longitude-of-address-from-google-map-api-in-json-formate-using-ajax/
                        
                        if(Latitude == "" && Longitude == ""){      
                            
                            // If Latitude and Logitude null display Location on basis of address
                            
                            var place =  locXML[i].address1+" "+locXML[i].city+" "+locXML[i].state+" "+locXML[i].zip;
                                console.log(place);
                            
                            jQuery.ajax({
                                type: "GET",
                                dataType: "json",
                                url: "http://maps.googleapis.com/maps/api/geocode/json",
                                data: {'address': place,'sensor':false},
                                success: function(data){
                                    if(data.results.length){
                                        var Lat = data.results[0].geometry.location.lat;
                                        var Lng = data.results[0].geometry.location.lng;
                                        
                                        newLatLon =  new google.maps.LatLng(parseFloat(Lat),parseFloat(Lng));
                               
                                        var mapProp = {
                                             center: newLatLon,
                                             zoom:15,
                                             mapTypeId:google.maps.MapTypeId.ROADMAP,
                                             mapTypeControl: true,
                                             mapTypeControlOptions: {
                                                 style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                                                 position: google.maps.ControlPosition.TOP_LEFT
                                             },
                                             zoomControl: true,
                                             zoomControlOptions: {
                                                 position: google.maps.ControlPosition.RIGHT_BOTTOM
                                             },
                                             scaleControl: true,
                                             streetViewControl: true,
                                             streetViewControlOptions: {
                                                 position: google.maps.ControlPosition.RIGHT_BOTTOM
                                             }
                                         };    
                                         var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
                                         
                                         var marker = new google.maps.Marker({
                                             position: newLatLon,
                                             map: map,
                                             title: "Marker"
                                         });
                                        
                                    }else{
                                        console.log('invalid address');
                                    }
                                }
                            });
                            
                        }else{                                  // else call to Google Maps API to dispaly location
                        
                            newLatLon =  new google.maps.LatLng(parseFloat(Latitude),parseFloat(Longitude));
                               
                            var mapProp = {
                                 center: newLatLon,
                                 zoom:15,
                                 mapTypeId:google.maps.MapTypeId.ROADMAP,
                                 mapTypeControl: true,
                                 mapTypeControlOptions: {
                                     style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                                     position: google.maps.ControlPosition.TOP_LEFT
                                 },
                                 zoomControl: true,
                                 zoomControlOptions: {
                                     position: google.maps.ControlPosition.RIGHT_BOTTOM
                                 },
                                 scaleControl: true,
                                 streetViewControl: true,
                                 streetViewControlOptions: {
                                     position: google.maps.ControlPosition.RIGHT_BOTTOM
                                 }
                             };    
                             var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
                             
                             var marker = new google.maps.Marker({
                                 position: newLatLon,
                                 map: map,
                                 title: "Marker"
                             });
                        }
                       x.append(locdata); 
                        
                    }
                }
                
            });
            
        };
    
    /**
    * getFacData() - Get facilities data for a particualr tab and display
    * @param {xml} xmlDoc - Response from the ajax call
    */

        self.getFacData = function(xmlDoc){
        
            var x = angular.element(document.querySelector("#Facilities"));
            
            var traData = "",
                data = [];   
            
             $('facility',xmlDoc).each(function(){                      // Push required data into array of objects
                 
                 data.push({ type: $('type',this).isNullOrNot(),
                            quantity: $('quantity',this).isNullOrNot(),
                            desc: $('description',this).isNullOrNot()
                 });
             });
            
            var facLen = data.length
            
            // Display data in tab
    
            x.append("<h3>FACILITIES</h3>");
            
            traData = "<table id='facilitiesTab' class='tablesorter'>"
            traData += "<thead>";
            traData +=  "<tr>";
            traData +=    "<th>TYPE</th>";
            traData +=    "<th>QUANTITY</th>";
            traData +=    "<th>DESCRIPTION</th>";
            traData +=  "</tr>";
            traData += "</thead>";
            traData += "<tbody>";
            
            if(facLen != 0){                    // If array length is not equal to zero display table
            
                for(var i=0;i<facLen;i++){
                   
                    traData += "<tr>";
                    traData += "<td>"+data[i].type+"</td>";
                    traData += "<td>"+data[i].quantity+"</td>";
                    traData += "<td>"+data[i].desc+"</td>";
                    traData += "</tr>";
                    
                }
            }else{                              // else no results found
                
                    traData += "<tr>";
                    traData += "<td colspan='3'><center><b>No Results Found !!</b></center></td>";
                    traData += "</tr>";
            }
            traData += "</tbody>";
            traData += "</table>";
            
            x.append(traData);
            
            if(facLen != 0){
                $('#facilitiesTab').tablesorter();
            }
        };
        
    /**
    * getPplData() - Get People data for a particualr tab or display
    * @param {xml} xmlDoc - Response from the ajax call
    */
        self.getPplData = function(xmlDoc){
            
            //console.log(" IN PPL: ",xmlDoc);
            
            var x = angular.element(document.querySelector("#People")),
                sel = "",
                siteId = [],
                traData = "";
            
            x.append("<h3>PEOPLE</h3>");
            
            sel = "<select id='pplSelect'>";
            sel += '<option value="">---Select People---</option>';
            $('site',xmlDoc).each(function(){
            
                //console.log(" Site ID: "+$(this).attr('siteId'));
                //console.log(" Address: "+$(this).attr('address'));
              siteId.push();
              sel += '<option value="'+ $(this).attr('siteId') +'">'+ $(this).attr('address') +'</option>';
            });    
            
            sel += "</select>";
            
            x.append(sel+"<br><br>");
            
            $("#pplSelect").on("change",function(){     // On change of select value display table for each people
                
                $('#pplTab').remove();
                $('#siteTitle').remove();
                
                //console.log(" SiteID: ",this.value); 
                //console.log(" SiteName: ",$("#pplSelect option[value="+this.value+"]").text()); 
                
                var selVal = this.value,
                    label = $("#pplSelect option[value="+this.value+"]").text();
                
                x.append("<h3 id='siteTitle'>SITE: "+label+"</h3>");
                
                $('site',xmlDoc).each(function(){               
                    var st = $(this).attr('siteId'),
                        personCount = "";
                    
                    if(selVal === st){                      // If site equal then only display persons table
                        
                        traData = "<table id='pplTab' class='tablesorter'>"
                        traData += "<thead>";
                        traData +=  "<tr>";
                        traData +=    "<th>NAME</th>";
                        traData +=    "<th>ROLE</th>";
                        traData +=  "</tr>";
                        traData += "</thead>";
                        traData += "<tbody>";
                        
                        personCount = $("personCount",this).isNullOrNot();
                        
                        if(personCount == 0){                   // check for person count if 0 no results found
                            
                            console.log("No Result Found !!");
                             traData += "<tr>";
                             traData += "<td colspan='2'><center><b>No Results Found !!</b></center></td>";
                             traData += "</tr>";
                            
                        }else{                          // else find each person and display
                        
                        $(this).find('person').each(function(i,e){
                            
                            traData += "<tr>";
                            traData += "<td>"+$(e).find('honorific').isNullOrNot()+" "+$(e).find('fName').isNullOrNot()+" "+$(e).find('mName').isNullOrNot()+" "+$(e).find('lName').isNullOrNot()+"</td>";
                            traData += "<td>"+$(e).find('role').text()+"</td>";
                            traData += "</tr>";
                            
                        });
                      }
                        
                         traData += "</tbody>";
                         traData += "</table>";
                        
                        x.append(traData);
                        
                        if(personCount != 0){
                            $('#pplTab').tablesorter();
                        }
                    }
                    
                });
   
            });
        };
    
    /**
    * getTrtData() - Get Treatment data for a particualr tab
    * @param {xml} xmlDoc - Response from the ajax call
    */
    
        self.getTrtData = function(xmlDoc){
            
            var x = angular.element(document.querySelector("#Treatment"));
            
            var traData = "",
                data = [];   
            
            $('treatment',xmlDoc).each(function(){              // Push data into array
                
                data.push({ type: $('type',this).isNullOrNot(),
                           abbr: $('abbreviation',this).isNullOrNot()
                });
            
            });
            
            var trtLen = data.length;
            
            x.append("<h3>TREATMENTS</h3>");
            
            // Display data into tab
            
            traData = "<table id='treatmentTab' class='tablesorter'>"
            traData += "<thead>";
            traData +=  "<tr>";
            traData +=    "<th>TYPE</th>";
            traData +=    "<th>ABBERVIATION</th>";
            traData +=  "</tr>";
            traData += "</thead>";
            traData += "<tbody>";
            
            if(trtLen != 0){                            // If array length is 0 display data
                for(var i=0;i<trtLen;i++){
                   
                    traData += "<tr>";
                    traData += "<td>"+data[i].type+"</td>";
                    traData += "<td>"+data[i].abbr+"</td>";
                    traData += "</tr>";
                    
                }
            }else{                                      // else no results found
                
                    traData += "<tr>";
                    traData += "<td colspan='3'><center><b>No Results Found !!</b></center></td>";
                    traData += "</tr>";
            }
            
            traData += "</tbody>";
            traData += "</table>";
            
            x.append(traData);
            
            if(trtLen !=0){
                $('#treatmentTab').tablesorter();
            }
        };
    
    /**
    * getTraData() - Get Training data for a particualr tab
    * @param {xml} xmlDoc - Response from the ajax call
    */
    
        self.getTraData = function(xmlDoc){
            
            var x = angular.element(document.querySelector("#Training"));
            
            var traData = "",
                data = [];   
            
            $('training',xmlDoc).each(function(){           // Push data into array
                
                data.push({ type: $('type',this).isNullOrNot(),
                           abbr: $('abbreviation',this).isNullOrNot()
                });
            
            });
            
            var traLen = data.length;;   
            
            x.append("<h3>SERVICES/TRANING</h3>");
            
            traData = "<table id='trainingTab' class='tablesorter'>"
            traData += "<thead>";
            traData +=  "<tr>";
            traData +=    "<th>TYPE</th>";
            traData +=    "<th>ABBERVIATION</th>";
            traData +=  "</tr>";
            traData += "</thead>";
            traData += "<tbody>";
            
            //Display data in tab
            
            if(traLen != 0){
                for(var i=0;i<traLen;i++){              // If array length is 0 display data
                   
                    traData += "<tr>";
                    traData += "<td>"+data[i].type+"</td>";
                    traData += "<td>"+data[i].abbr+"</td>";
                    traData += "</tr>";
                    
                }
            }else{                                     // else no result found 
                    
                    traData += "<tr>";
                    traData += "<td colspan='3'><center><b>No Results Found !!</b></center></td>";
                    traData += "</tr>";
            }
        
            
            traData += "</tbody>";
            traData += "</table>";
            
            x.append(traData);
            
            if(traLen != 0){
                $('#trainingTab').tablesorter();        // Add table sorter plugin if array length is not 0
            }
        };
    
    /**
    * getEqpData() - Get Equipment data for a particualr tab
    * @param {xml} xmlDoc - Response from the ajax call
    */
    
        self.getEqpData = function(xmlDoc){
            
            //console.log(" IN EQP: ",xmlDoc);
            
            var x = angular.element(document.querySelector("#Equipment"));
            
            var traData = "",
                 data = [];   
            
             $('equipment',xmlDoc).each(function(){         // Push data into array
                 
                 data.push({ type: $('type',this).isNullOrNot(),
                            quantity: $('quantity',this).isNullOrNot(),
                            desc: $('description',this).isNullOrNot()
                 });
             });
            
            var equLen = data.length;
            
            x.append("<h3>EQUIPMENTS</h3>");
            
            // Display data into tab
            
            traData = "<table id='equipmentTab' class='tablesorter'>"
            traData += "<thead>";
            traData +=  "<tr>";
            traData +=    "<th>TYPE</th>";
            traData +=    "<th>QUANTITY</th>";
            traData +=    "<th>DESCRIPTION</th>";
            traData +=  "</tr>";
            traData += "</thead>";
            traData += "<tbody>";
            
            if(equLen != 0){                                // If array length is not 0 display data
            
                for(var i=0;i<equLen;i++){
                   
                    traData += "<tr>";
                    traData += "<td>"+data[i].type+"</td>";
                    traData += "<td>"+data[i].quantity+"</td>";
                    traData += "<td>"+data[i].desc+"</td>";
                    traData += "</tr>";
                    
                }
            }else{                                      // else no results found
                    
                    traData += "<tr>";
                    traData += "<td colspan='3'><center><b>No Results Found !!</b></center></td>";
                    traData += "</tr>";
            }
            
            traData += "</tbody>";
            traData += "</table>";
            
            x.append(traData);
            
            if(equLen != 0){
                $('#equipmentTab').tablesorter();           // Add table sorter plugin if array length is not 0
            }
        };
    
    /**
    * getPhyData() - Get Physicians data for a particualr tab
    * @param {xml} xmlDoc - Response from the ajax call
    */
    
        self.getPhyData = function(xmlDoc){
            
            //console.log(" IN PHY: ",xmlDoc);
            
            var x = angular.element(document.querySelector("#Physicians"));
            
            var traData = "",
                data =[];   
            
            $('physician',xmlDoc).each(function(){                  // Push data into array 
                
                data.push({ fname: $('fName',this).isNullOrNot(),
                           mname: $('mName',this).isNullOrNot(),
                           lname: $('lName',this).isNullOrNot(),
                           license: $('license',this).isNullOrNot(),
                           phn: $('phone',this).isNullOrNot()
                    
                });
            });
            
            var phyLen = data.length;
            
            // Display data in tab
            
            x.append("<h3>PHYSICIANS WITH ADMITTING PRIVILAGES</h3>");
            
            traData = "<table id='physiciansTab' class='tablesorter'>"
            traData += "<thead>";
            traData +=  "<tr>";
            traData +=    "<th>NAME</th>";
            traData +=    "<th>LICENSE</th>";
            traData +=    "<th>CONTACT</th>";
            traData +=  "</tr>";
            traData += "</thead>";
            traData += "<tbody>";
            
            if(phyLen != 0){
                for(var i=0;i<phyLen;i++){              // If array length is not 0 display data
                    
                    traData += "<tr>";
                    traData += "<td>"+data[i].fname+" "+data[i].mname+" "+data[i].lname+"</td>";
                    traData += "<td>"+data[i].license+"</td>";
                    traData += "<td>"+data[i].phn+"</td>";
                    traData += "</tr>";
                    
                }
            }else{                                      // else no results found
                
                    traData += "<tr>";
                    traData += "<td colspan='3'><center><b>No Results Found !!</b></center></td>";
                    traData += "</tr>";
            }
    
            traData += "</tbody>";
            traData += "</table>";
            
            x.append(traData);
            
            if(phyLen !=0){                                     // Add table sorter plugin if array length is not 0
                $('#physiciansTab').tablesorter();
            }
        };
        
    
        self.getCities();
        self.getOrgs();
        
    } ]);

    //$('#county').autocomplete({ source: county});

    /**
    * closePopup() - close the tabs 
    */

    function closePopup(){ 
        $("#tabOutput").css("display","none");
    }

    // Another controller for Pagination

    app.controller('OtherController', OtherController);

    function OtherController($scope) {
        $scope.pageChangeHandler = function(num) {
            console.log('going to page ' + num);
        };
    }


    