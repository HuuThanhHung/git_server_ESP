// set up port, express for server
var express = require("express");
var Excel = require("exceljs");
const { emit } = require("process");
const { Socket } = require("dgram");
const { stringify } = require("querystring");
const { count } = require("console");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");// set view when render home page
app.set("views", "./views");

var server = require("http").createServer(app);
var io = require("socket.io")(server);// set up SOCKET.IO
server.listen(1805);
var req,res;
//create function to parse JSON data to object
function PareseJSONdata(JsonData){
    try {
        return JSON.parse(JsonData);
    } 
    catch (error) {
        console.log("No Json data found");
        return null;
    }
}
var workbook = new Excel.Workbook(); 
var filename = "database.xlsx";
var month = new Array();
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";



io.on("connection", function(socket) {	
    console.log(socket.id);//debug
    //console.log(t_day+" "+t_hour+" "+t_minute);//debug
    // ================ Server and ESP ==========================
    //step 1.0 create connection with ESP
    var date_ob = new Date();
    var t_day = date_ob.getDate();
    var t_month  = month[date_ob.getMonth()];
    var MonthDate = [t_day,t_month]
    console.log(MonthDate);//debug
    socket.on("connect_ESP_server",function(data_from_ESP){
        console.log(data_from_ESP);//debug
    });
    
    //step 1.1 receive Json data from ESP
    socket.on("Json_from_ESP",function(Json_from_ESP){
        var date_ob = new Date();
        var t_day = date_ob.getDate();
        var t_month  = month[date_ob.getMonth()];
        var t_hour = date_ob.getHours();
        var t_minute = date_ob.getMinutes();
        // data Json format from ESP { pH: 18, EC: 5, Temp: 19, PumpStatus: 97 }
        console.log("Json From ESP " + Json_from_ESP.pH);//debug
        console.log(Json_from_ESP.Status);//debug
        console.log(Json_from_ESP.Temp);//debug
        console.log(Json_from_ESP.PumpStatus);//debug
        console.log(t_minute + " -------- end");//debug
        var ArrDatabase = [];
        workbook.xlsx.readFile(filename).then(function(){
            var worksheet = workbook.getWorksheet("Data");
            worksheet.columns = [
                {key: 'Time', header: 'Time'}, 
                {key: 'pH', header: 'pH'}, 
                {key: 'Temperature', header: 'Temperature'}
            ];
            var StsRow = worksheet.getRow(1);
            StsRow.getCell(4).value = Json_from_ESP.PumpStatus;
            StsRow.getCell(5).value = Json_from_ESP.Status;
            //console.log("rowCount is "+  rowNum);//debug
            //console.log(currentRow.getCell("A").value);//debug
            t_hour = t_hour +7;
            if(t_hour >= 24)
            {
                t_hour = 24 - t_hour;
            }
            const tdataPh = [{
                Time : t_day+ "-"+ t_month+" "+t_hour+"h "+t_minute+"m",
                pH : Json_from_ESP.pH,
                Temperature : Json_from_ESP.Temp
            }];
            //====================================
            //save data from ESP to excel file when recieved status True 
            if(Json_from_ESP.Status == 1)
            { 
                tdataPh.forEach((item) => {
                worksheet.addRow(item);
                });
                var newRowNum = worksheet.rowCount;
                console.log("when status = 1 totalrow"+newRowNum)
                var ArrDB_time = [];
                var ArrDB_pH = [];
                var ArrDB_temp = [];
                var ofset = 10;// how many column in chart you want is here
                var ArrId = ofset -1;
                if(ofset >= newRowNum)
                {
                    ArrId = newRowNum -2;//8
                    for(CountUp = 2;CountUp <= newRowNum ;CountUp++)
                    {
                        var CurRow = worksheet.getRow(CountUp);
                        ArrDB_time[CountUp -2] = CurRow.getCell("A").value
                        console.log("Where is bug "+ArrDB_time[CountUp -2])
                        ArrDB_pH[CountUp -2] = CurRow.getCell("B").value
                        ArrDB_temp[CountUp -2] = CurRow.getCell("C").value
                    }
                }
                //else if(ofset == newRowNum)
                //{
                    //do nothing
                //}
                //===========================
                else
                {
                    for(CountDwn = newRowNum;CountDwn > newRowNum - ofset;CountDwn--)
                    {
                        var CurRow = worksheet.getRow(CountDwn);
                        ArrDB_time[ArrId] = CurRow.getCell("A").value
                        ArrDB_pH[ArrId] = CurRow.getCell("B").value
                        ArrDB_temp[ArrId] = CurRow.getCell("C").value
                        ArrId =  ArrId -1;
                    }
                }
            
                var db_chart = {
                    db_time: ArrDB_time, 
                    db_pH: ArrDB_pH,
                    db_temp:ArrDB_temp                    
                };
                //data_chartold = db_chart;
                //console.log("Time load db"+db_chart.db_time);//debug 
                workbook.xlsx.writeFile(filename).then(function() {
                console.log('pH Temp are added and then file saved.')
                });
                console.log("-----------------------------")//debug
                socket.broadcast.emit("Sever_send_chart_Json",db_chart);
                
                var totalrow = worksheet.rowCount;
                var ArrDB_time_all = [];
                var ArrDB_pH_all = [];
                var ArrDB_temp_all = [];
                for(m=2;m<=totalrow;m++){
                    var CurRow1 = worksheet.getRow(m);
                    ArrDB_time_all[m-2] = CurRow1.getCell("A").value;
                    ArrDB_pH_all[m-2] = CurRow1.getCell("B").value;
                    ArrDB_temp_all[m-2] = CurRow1.getCell("C").value;
                }
                var db_table = {
                    db_time: ArrDB_time_all, 
                    db_pH: ArrDB_pH_all,
                    db_temp:ArrDB_temp_all                    
                };
                //console.log("when status = 1 send db table :"+db_table.db_time)
                socket.broadcast.emit("Old_data_table_from_server",db_table);
            }
            
            else if(Json_from_ESP.Status == 3 || Json_from_ESP.Status == 2)
            {
                var RowRow = worksheet.getRow(1);
                RowRow.getCell(4).value = Json_from_ESP.PumpStatus;
                RowRow.getCell(5).value = Json_from_ESP.Status;
            }
            else if(Json_from_ESP.Status == 0)
            {
                console.log("-------old data --------")
                //var worksheet1 = workbook.getWorksheet("Data");
                var totalrow = worksheet.rowCount;
                console.log("totalrow: "+worksheet.rowCount);//debug
                var ProcessStsRow = worksheet.getRow(1);
                ProcessStsRow.getCell(5).value = Json_from_ESP.Status;
                var ArrDB_time = [];
                var ArrDB_pH = [];
                var ArrDB_temp = [];
                var ArrId = 10 -1;
                var offset;
                if(totalrow>1 && totalrow<10)
                {
                    tcount = totalrow;
                    ArrId = totalrow - 2;
                    do{
                        var CurRow = worksheet.getRow(tcount);
                        ArrDB_time[ArrId] = CurRow.getCell("A").value;
                        ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                        ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                        ArrId =  ArrId -1;
                        tcount = tcount -1;
                    }while(tcount > 1)
                }
                else if(totalrow>=10)
                {
                    if(totalrow==10)
                    {
                        ArrId = totalrow - 2;
                    }
                    offset = totalrow -10;
                    for(countdown=totalrow;countdown>offset;countdown--){
                        var CurRow = worksheet.getRow(countdown);
                        ArrDB_time[ArrId] = CurRow.getCell("A").value;
                        ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                        ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                        ArrId =  ArrId -1;
                    }
                }
                
                var db_chart_old = {
                    db_time: ArrDB_time, 
                    db_pH: ArrDB_pH,
                    db_temp:ArrDB_temp                    
                };
                //console.log(db_chart_old.db_pH);
                //socket.emit("Old_data_from_server",db_chart_old);
            }
            
        });
        //step 2 Server send bradcast to all node
        //when receive data from ESP server will send new data broadcast to all node
        //onsole.log("old data "+data_chartold.db_pH)//debug
        socket.broadcast.emit("Sever_send_ESP_Json",Json_from_ESP);
        

    });

    // ================ Server and another node =================
    //step 3.1 client request login
    socket.on("user_login",function(LogIndata){
        console.log(LogIndata.name);//debug
        console.log(LogIndata.password)//debug

        //step 3.2 server check password and send back response      
        workbook.xlsx.readFile(filename).then(function() {
            var worksheet = workbook.getWorksheet("UserInfor");
            console.log("Number of row UserInfor"+worksheet.rowCount);
            for(i =1; i <= worksheet.rowCount; i++)
            {
                var row = worksheet.getRow(i);
                console.log(row.getCell("A").value);
                //console.log(row.getCell("B").value);
                //console.log(row.getCell("C").value);
                //console.log(row.getCell("D").value);
                
                if(LogIndata.name == row.getCell("A").value && LogIndata.password == row.getCell("B").value)
                {   
                    var str_1 =row.getCell("D").value;
                    socket.emit("login_response_success",MonthDate); 
                    //socket.broadcast.emit("chart_here")
                }
                else
                {
                    socket.emit("login_response_failed");
                }
            }
            // read excel file to excute chart
            console.log("-------old data --------")
            var worksheet1 = workbook.getWorksheet("Data");
            var totalrow = worksheet1.rowCount;
            console.log("totalrow: "+worksheet1.rowCount);//debug
            var ArrDB_time = [];
            var ArrDB_pH = [];
            var ArrDB_temp = [];
            var ArrId = 10 -1;
            var offset;
            if(totalrow>1 && totalrow<10)
            {
                tcount = totalrow;
                ArrId = totalrow - 2;
                do{
                    var CurRow = worksheet1.getRow(tcount);
                    ArrDB_time[ArrId] = CurRow.getCell("A").value;
                    ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                    ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                    ArrId =  ArrId -1;
                    tcount = tcount -1;
                }while(tcount > 1)
            }
            else if(totalrow>=10)
            {
                if(totalrow==10)
                {
                    ArrId = totalrow - 2;
                }
                offset = totalrow -10;
                for(countdown=totalrow;countdown>offset;countdown--){
                    var CurRow = worksheet1.getRow(countdown);
                    ArrDB_time[ArrId] = CurRow.getCell("A").value;
                    ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                    ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                    ArrId =  ArrId -1;
                }
            }
            
            var db_chart_old = {
                db_time: ArrDB_time, 
                db_pH: ArrDB_pH,
                db_temp:ArrDB_temp                    
            };
            console.log(db_chart_old.db_pH);
            socket.emit("Old_data_from_server",db_chart_old);

            var FirstRow =  worksheet1.getRow(1);
            var pumpStsRow = FirstRow.getCell("D").value;
            var processStsRow = FirstRow.getCell("E").value;
            var ArrDataSts =[];
            ArrDataSts[0] = pumpStsRow;
            ArrDataSts[1] = processStsRow;
            socket.emit("Old_data_sts_from_server",ArrDataSts);

            var ArrDB_time_all = [];
            var ArrDB_pH_all = [];
            var ArrDB_temp_all = [];
            for(m=2;m<=totalrow;m++){
                var CurRow1 = worksheet1.getRow(m);
                ArrDB_time_all[m-2] = CurRow1.getCell("A").value;
                ArrDB_pH_all[m-2] = CurRow1.getCell("B").value;
                ArrDB_temp_all[m-2] = CurRow1.getCell("C").value;
            }
            var db_table = {
                db_time: ArrDB_time_all, 
                db_pH: ArrDB_pH_all,
                db_temp:ArrDB_temp_all                    
            };
            socket.emit("Old_data_table_from_server",db_table);
        });
    
    });

    //sign up data recieve from client
    socket.on("user_signup",function(SignUpdata){      
        workbook.xlsx.readFile(filename).then(function() {
            var worksheet = workbook.getWorksheet("UserInfor");
            worksheet.columns = [
                {key: 'UsrName', header: 'UserName'}, 
                {key: 'Password', header: 'Password'}, 
                {key: 'FirtName', header: 'FirstName'}, 
                {key: 'LastName', header: 'LastName'}
            ];
            var i = 0;
            var breakTheLoop = false;
            var count = worksheet.rowCount;
            var Endrow;
            console.log("Number of row "+  count);//debug
            do{
                i = i + 1;
                var row = worksheet.getRow(i);
                
                if(SignUpdata.UrsName == row.getCell("A").value)
                {
                    socket.emit("signup_response_failed");
                    breakTheLoop = true;
                }
            } while (i < count && !breakTheLoop);
            
            if(!breakTheLoop)//not found any name same
            {
                const tdata = [{
                    UsrName : SignUpdata.UrsName,
                    Password : SignUpdata.Password,
                    FirtName : SignUpdata.FirtName,
                    LastName : SignUpdata.LastName
                }]; 
                tdata.forEach((item) => {
                   worksheet.addRow(item);
                });
                workbook.xlsx.writeFile(filename).then(function() {
                    console.log('Array added and then file saved.')
                });
                var str_1 =SignUpdata.LastName;
                socket.emit("login_response_success",MonthDate); 
            }
            //read excel file to get data for chart
            var worksheet1 = workbook.getWorksheet("Data");
            var totalrow = worksheet1.rowCount;
            console.log("false: "+totalrow);//debug
            var ArrDB_time = [];
            var ArrDB_pH = [];
            var ArrDB_temp = [];
            var ArrId = 10 -1;
                var offset;
                if(totalrow>1 && totalrow<10)
                {
                    tcount = totalrow;
                    ArrId = totalrow - 2;
                    do{
                        var CurRow = worksheet1.getRow(tcount);
                        ArrDB_time[ArrId] = CurRow.getCell("A").value;
                        ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                        ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                        ArrId =  ArrId -1;
                        tcount = tcount -1;
                    }while(tcount > 1)
                }
                else if(totalrow>=10)
                {
                    if(totalrow==10)
                    {
                        ArrId = totalrow - 2;
                    }
                    offset = totalrow -10;
                    for(countdown=totalrow;countdown>offset;countdown--){
                        var CurRow = worksheet1.getRow(countdown);
                        ArrDB_time[ArrId] = CurRow.getCell("A").value;
                        ArrDB_pH[ArrId] = CurRow.getCell("B").value;
                        ArrDB_temp[ArrId] = CurRow.getCell("C").value;
                        ArrId =  ArrId -1;
                    }
                }
                
                var db_chart_old = {
                    db_time: ArrDB_time, 
                    db_pH: ArrDB_pH,
                    db_temp:ArrDB_temp                    
                };
                console.log(db_chart_old.db_pH);
                socket.emit("Old_data_from_server",db_chart_old);

            var FirstRow =  worksheet1.getRow(1);
            var pumpStsRow = FirstRow.getCell("D").value;
            var processStsRow = FirstRow.getCell("E").value;
            var ArrDataSts =[];
            ArrDataSts[0] = pumpStsRow;
            ArrDataSts[1] = processStsRow;
            socket.emit("Old_data_sts_from_server",ArrDataSts);
            
            var ArrDB_time_all = [];
            var ArrDB_pH_all = [];
            var ArrDB_temp_all = [];
            for(m=2;m<=totalrow;m++){
                var CurRow1 = worksheet1.getRow(m);
                ArrDB_time_all[m-2] = CurRow1.getCell("A").value;
                ArrDB_pH_all[m-2] = CurRow1.getCell("B").value;
                ArrDB_temp_all[m-2] = CurRow1.getCell("C").value;
            }
            var db_table = {
                db_time: ArrDB_time_all, 
                db_pH: ArrDB_pH_all,
                db_temp:ArrDB_temp_all                    
            };
            socket.emit("Old_data_table_from_server",db_table);
        });

    });

    
    
    
});

app.get("/",function(req, res){
    res.render("home");
    
}); 

app.get("/signup/",function(req, res){
    res.render("signup");
    
}); 