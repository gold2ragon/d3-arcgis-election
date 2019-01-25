require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/WebMap",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/SpatialReference",
    "esri/geometry/Polygon",
    "esri/core/promiseUtils",
    "esri/renderers/smartMapping/creators/type",
    "esri/renderers/smartMapping/creators/color",
    "esri/layers/support/LabelClass",
    "esri/portal/PortalItem",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/widgets/Legend",
    "esri/widgets/Popup",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/widgets/Home",
    "esri/geometry/Extent",
    "esri/layers/MapImageLayer",
    "esri/core/watchUtils",
    "esri/layers/TileLayer",
    "dojo/_base/window",  

    "dojo/dom-construct",
    "dojo/domReady!"
],
    function (
        Map, MapView,
        FeatureLayer, WebMap, Graphic, Point, SpatialReference,
        Polygon, promiseUtils, typeRendererCreator, colorRendererCreator, LabelClass, PortalItem, GraphicsLayer, Graphic, Legend, Popup, Search, Locator, Home, Extent, MapImageLayer, watchUtils, TileLayer,win,domConstruct
    ) {

        var ElectionWebmapID = "2d78bab94c2d40dcaef3176a8fbeea6b";
        //var LabelMapLayerID = "e9c51b6dc229467bb71d7709f32c0aed";
        var CVTMapLayer = "https://gis.collincountytx.gov/arcgis/rest/services/election/ElectionResults_2018/MapServer/";

        //Define Web Map
        var webmap = new WebMap({
            portalItem: {
                id: ElectionWebmapID
            }
        });

       
        //Create Map View
        var view = new MapView({
            container: "sceneDiv",
            map: webmap,
            center: [-96.300, 33.203],
            zoom: 10
        });

        //Variable Section
        var listNode = document.getElementById("nyc_graphics");
        var MobileListNode = document.getElementById("RaceList");
        var fragment = document.createDocumentFragment();
        var CurrentRace;
        var CurrentRaceName;
        var OnLayer;
        var length;
        var Feature;
        var Symbology = "Label";
        var target = "";
        var mobiletarget = "";
        var defaultSym = {
            type: "simple-fill",
            outline: {
                color: "lightgray",
                width: 0.5
            }
        };
        var CompleteCandidateList = GetCandidateList();
        var ElectionRaceList = GetElectionRaceList();
        var CandidateNameList = GetCandidateNameList();
        var PopupContent = GetPopupContent();
        var PrecinctDictionary = GetPrecinctDictionary();
        var ElectionRaceDictionary = GetElectionRaceDictionary();
        var CandidateResultDictionary = GetCandidateResultDictionary()
        var NewMoveGraphic = "";
        var NewClickGraphic = "";
        var ColorDictionary = {
            REP: ["#99000d", "#ff8c00", "#ffd700", "#8b0000", "#ff6347", "#5d5c5c", "#ffa500", "#b22222", "#fa8072", "#ffe4b5"],
            DEM: ["#084594", "#6a5acd", "#2e8b57", "#000080", "#4b3d8b", "#6495ed", "#006400", "#9400d3", "#008080", "#556b2f"],
            GRE: ["#005a32", "#238b45", "#41ab5d", "#74c476", "#a1d99b", "#c7e9c0", "#edf8e9"],
            LIB: ["#fd8d3c", "#feb24c", "#fed976", "#ffffb2"],
            None: ["#ffffb3", "#8dd3c7", "#bebada", "#fdb462", "#ccebc5", "#ffed6f", "#fb8072", "#d9d9d9", "#fccde5", "#bc80bd"],
            Yes: ["#1a9850"],
            No: ["#d73027"]
        };
        var ColorList = [];
        var CandidateColorList = [];
        var CandidateColorDictionary = [];
        var ArcadeRenderer;
        var ClickPrecinctID = "";
        var CurrentClickPrecinctName = "";
        var CurrentClickPrecinctID = "";
        var PrecinctLayer;
        var GlobalListStatement;
        var GloablFieldList;
        var PercentMax;
        var PercentMin;
        var MarginMax;
        var MarginMin;
        var TurnoutMax;
        var TurnoutMin;
        var RaceTotal;
        var TotalRegisteredVoters;
        var PrecinctRaceTotal;
        var PrecinctTotalRegisteredVoters;
        var TotalTotalVoters;
        var ArcadeRenderer;
        var CurrentDiv = "";
        var CountyResultList = [];
        var PrecinctResultList = [];
        var PrecinctResultList = [];
        var CountyTurnoutList = [];
        var PrecinctTurnoutList = [];
        var AllFeatures = "";
        var PopupActive = "";
        var CVTStatus = "Removed";
        var LegendStatus = "Removed";
        var OptionsStatus = "Removed";
        var legend;
        var MoveGeometry;
        var NewMoveGraphic = "";
        var CurrentMovePrecinctID = "";
        var OldMovePrecinctID = "1";
        var ElectionResultsLayerURL;
        var LayerTitle;

        var Panel = document.getElementById("PanelRaceList");
        var PanelContainer = document.getElementsByClassName("panel-container");
        var body = document.getElementsByTagName('body');
        var BodyHeight = body[0].clientHeight;
        PanelContainer[0].setAttribute("style", "height: " + String(BodyHeight - 69) + "px;");
        Panel.setAttribute("style", "height: " + String(BodyHeight - 580) + "px;");

        // For Mobile Application
        var SideDiv = document.getElementById("SideDiv");
        var MainDiv = document.getElementById("MainDiv");
        var HeaderTextMap = document.getElementsByClassName("HeaderTextMap")
        var TitleText = document.getElementById("TitleText");
        var ImageText = document.getElementById("ImageText");
        var Image = document.getElementById("Image");
        var ImageName = document.getElementById("ImageName");
        var RaceBoxText = document.getElementById("RaceBoxtext").onclick = onRaceButtonClick
        var HiddenRaceBox = document.getElementById("HiddenRaceBox")
        var RaceCloseButton = document.getElementById("RaceCloseButton").onclick = onRaceButtonCloseClick
        var RaceBoxDiv = document.getElementById("RaceBoxDiv")
        var Mobile = "False"

        window.addEventListener("resize", onWindowResize);

        watchUtils.init(view, "widthBreakpoint", function (breakpoint) {
            switch (breakpoint) {
                case "xsmall":
                case "small":
                case "medium":
                    setViewResponsive(true);
                    break;
                case "large":
                case "xlarge":
                    setViewResponsive(false);
                    break;
                default:
            }
        });

        function setViewResponsive(isMobile) {
            setTitleMobile(isMobile);
        };

        function setTitleMobile(isMobile) {
            if (isMobile) {
                SideDiv.setAttribute("style", "visibility:hidden;");
                MainDiv.setAttribute("style", "height:150px!important;");
                HeaderTextMap[1].setAttribute("style", "visibility:visible;");
                view.padding.left = 0;
                view.ui.add([{
                    component: "RaceBoxDiv",
                    position: "top-left",
                    index: 1
                }]);
                RaceBoxDiv.setAttribute("style", "visibility:visible;");
                Mobile = "True"
            } else {
                SideDiv.setAttribute("style", "visibility:visible;");
                MainDiv.setAttribute("style", "height:470px!important;");
                HeaderTextMap[0].setAttribute("style", "visibility:visible;");
                HeaderTextMap[1].setAttribute("style", "visibility:visible;");
                view.padding.left = 0;
                view.on("pointer-move", moveEventHandler);
                view.on("pointer-down", moveEventHandler);
                if (Mobile == "True") {
                    RaceBoxDiv.setAttribute("style", "visibility:hidden;");
                };
                HiddenRaceBox.setAttribute("style", "visibility:hidden;");
                Mobile = "False"
            };
        };

        function onRaceButtonClick() {
            HiddenRaceBox.setAttribute("style", "visibility:visible;");
        }

        function onRaceButtonCloseClick() {
            HiddenRaceBox.setAttribute("style", "visibility:hidden;");
        }

        function onWindowResize() {
            var BodyHeight = body[0].clientHeight;
            PanelContainer[0].setAttribute("style", "height: " + String(BodyHeight - 69) + "px;");
            Panel.setAttribute("style", "height: " + String(BodyHeight - 580) + "px;");
        };

        var CheckBox = document.getElementsByClassName("checkmark")
        for (var i = 0; i < CheckBox.length; i++) {
            CheckBox[i].addEventListener("click", onCheckBoxClick)
        };

        var FilterButtonText = document.getElementById("FilterButtonText");
        FilterButtonText.addEventListener("click", OnPrecinctButtonClick);

        var CVTLayer = new MapImageLayer({
            url: CVTMapLayer
        });

        var CloseButton = document.getElementById("CloseButton")
        var AdvancedInfo = document.getElementById("AdvancedInfo")
        CloseButton.addEventListener("click", function () {
            AdvancedInfo.setAttribute("style", "visibility: hidden;");
        })

        function onCheckBoxClick(event) {
            var Value = event.target.attributes.value.value;
            if (Value == "CVT") {
                if (CVTStatus == "Added") {
                    view.map.remove(CVTLayer)
                    CVTStatus = "Removed";
                } else if (CVTStatus == "Removed") {
                    view.map.add(CVTLayer)
                    CVTStatus = "Added";
                };
            } else if (Value == "Legend") {
                if (LegendStatus == "Added") {
                    view.ui.remove(legend)
                    LegendStatus = "Removed"
                } else if (LegendStatus == "Removed") {
                    view.ui.add([{
                        component: legend,
                        position: "bottom-left",
                        index: 1
                    }]);
                    LegendStatus = "Added"
                }
            } else if (Value == "Options") {
                if (OptionsStatus == "Added") {
                    view.ui.remove("RadioDiv");
                    Symbology = "Label";
                    changeRadioSymbology(Symbology);
                    OptionsStatus = "Removed";
                } else if (OptionsStatus == "Removed") {
                    CreateMapOptionRadios();
                    OptionsStatus = "Added"
                }
            };
        };

        //Create Panel Result Div When Map Has Loaded
        view.when(function () {
            CurrentRace = ElectionRaceList[0].Fieldname;
            CreateRaceList("Load")
            var Layer = webmap.layers.items[0]
            console.log(Layer.parsedUrl.path);
            LayerTitle = Layer.title
            ElectionResultsLayerURL = Layer.parsedUrl.path

            OnLayer = webmap.layers.items[0]
            PrecinctLayer = webmap.layers.items[1]

            NewLayer = new TileLayer({
                portalItem: {
                    id: LabelMapLayerID
                }
            });
          //  view.map.add(NewLayer);

            ChangeRace();

            //Create Legend
            legend = new Legend({
                view: view,
                layerInfos: [{
                    layer: OnLayer,
                    title: "Election Results"
                }]
            });

            CreateMobileRaceList()
        });

        function ChangeRace() {
            OnLayer.when(function () {
                var Fields = OnLayer.fields;
                var ValueList = [];
                var WhenStatement = "When(";
                var EqualExpression = "";
                var ListStatement = "["
                var ReturnStatement = "";
                var ValueInfos = [];
                var FieldList = [];
                var FeatureName;
                var CurrentFieldName;
                AllFeatures = "";
                var arcadeExpressionInfos = [];
                var Content = "<div id='ElectionResultsPopup' class='TableDisplay'><h4 style='font-size:1.25em'>" + CurrentRaceName + "</h4><table><tbody>"
                var CurrentRaceList = ElectionRaceDictionary[CurrentRace]

                for (var step = 0; step < Fields.length; step++) {
                    var Field = Fields[step];
                    var FieldName = Field.name;
                    if (CurrentRaceList.indexOf(FieldName) >= 0) {
                        var FieldAlias = Field.alias;
                        FeatureName = "$feature." + FieldName;
                        CurrentFieldName = FieldName;
                        ValueList.push(FeatureName);
                        ListStatement += FeatureName + ", ";
                        ReturnStatement += FeatureName + ", '" + FieldName + "', ";
                        EqualExpression += FeatureName + " == 0 && ";
                        AllFeatures += FeatureName + " + "
                        var NewColor = AssignColor(FieldName);
                        var Candidate = CandidateNameList[FieldName];
                        Content += "<tr><td class='Party'><div class='PartyColor' style='background-color:" + NewColor + "'></div></td><td class='Candidate'>" + Candidate + "</td><td class='Votes'>{" + FieldName + "}</td><td class='Percent'>{expression/" + FieldName + "}%</td></tr>"
                        ValueInfos.push({ value: FieldName, symbol: { type: 'simple-fill', color: NewColor }, label: CandidateNameList[FieldName] });
                        FieldList.push(FieldName);
                    };
                };
                GloablFieldList = FieldList;
                if (FieldList.length > 1) {
                    ListStatement = ListStatement.substring(0, ListStatement.length - 2);
                    ListStatement += "]";
                    GlobalListStatement = ListStatement;
                    EqualExpression = EqualExpression.substring(0, EqualExpression.length - 4);
                    var ArcadeExpression = "When(" + EqualExpression + ", 'N/A', " + "Sort(" + ListStatement + ")[" + String(FieldList.length - 1) + "] == Sort(" + ListStatement + ")[" + String(FieldList.length - 2) + "], 'Tie', Decode(" + "Max(" + ListStatement + "), " + ReturnStatement + "'N/A'))";
                    ValueInfos.push({ value: 'Tie', symbol: { type: 'simple-fill', color: 'purple' }, label: 'Tie' });
                    ValueInfos.push({ value: 'N/A', symbol: { type: 'simple-fill', style: "none" }, label: 'N/A' });
                    ArcadeRenderer = {
                        type: "unique-value",
                        valueExpression: ArcadeExpression,
                        uniqueValueInfos: ValueInfos
                    };
                } else {
                    ValueInfos.push({ value: 'N/A', symbol: { type: 'simple-fill', style: "none" }, label: "N/A" })
                    GlobalListStatement = "";

                    ArcadeRenderer = {
                        type: "unique-value",
                        valueExpression: "When(" + FeatureName + " == 0, 'N/A', '" + CurrentFieldName + "')",
                        uniqueValueInfos: ValueInfos
                    };
                };

                //Set the Popup for the Layer
                AllFeatures = AllFeatures.substring(0, AllFeatures.length - 3);
                for (var step = 0; step < FieldList.length; step++) {
                    var FieldName = FieldList[step];
                    arcadeExpressionInfos.push({ name: FieldName, title: FieldName + "_PERCENT", expression: "Round(" + "($feature." + FieldName + "/(" + AllFeatures + "))*100, 1)" });
                }


                //Arcade Expression: PoperName
                arcadeExpressionInfos.push({ name: "ProperName", title: "Proper Name", expression: "(Proper($feature.NAME, 'everyword'))" })

                //Arcade Expression: Votes Cast
                arcadeExpressionInfos.push({ name: "VotesCast", title: "Votes Cast", expression: "(" + AllFeatures + ")" })

                //Arcade Expression: Votes Not Cast
                arcadeExpressionInfos.push({ name: "VotesNotCast", title: "Votes Not Cast", expression: "($feature.REGISTERED_VOTERS-(" + AllFeatures + "))" })

                //Arcade Expression: Cast Pervent
                arcadeExpressionInfos.push({ name: "CastPercent", title: "Cast Percent", expression: "Round(" + "((" + AllFeatures + ")/$feature.REGISTERED_VOTERS)*100, 1)" })

                //Arcade Expression: Not Cast Percent
                arcadeExpressionInfos.push({ name: "NotCastPercent", title: "Not Cast Percent", expression: "Round((($feature.REGISTERED_VOTERS-(" + AllFeatures + "))/$feature.REGISTERED_VOTERS)*100, 1)" })

                //Arcade Expression: Cast Bar
                arcadeExpressionInfos.push({ name: "CastBar", title: "Cast Bar", expression: "When( (" + AllFeatures + ") < ($feature.REGISTERED_VOTERS-(" + AllFeatures + ")), ((" + AllFeatures + ")/($feature.REGISTERED_VOTERS-(" + AllFeatures + ")))*60 , 60)" })

                //Arcade Expression: Not Cast Bar
                arcadeExpressionInfos.push({ name: "NotCastBar", title: "Not Cast Bar", expression: "When( ($feature.REGISTERED_VOTERS-(" + AllFeatures + ")) < (" + AllFeatures + "), (($feature.REGISTERED_VOTERS-(" + AllFeatures + "))/(" + AllFeatures + "))*60 , 60)" })

                var template = {
                    content: PopupContent,
                    expressionInfos: arcadeExpressionInfos
                };

                OnLayer.popupTemplate = template;
                PrecinctLayer.popupTemplate = template;


                CountyResultList = [];

                CandidateDictionary = CandidateResultDictionary[CurrentRace];
                var Candidates = CandidateDictionary["Candidates"];

                TotalTotalVoters = CandidateDictionary["Total"];
                TotalRegisteredVoters = CandidateDictionary["RegisteredTotal"];
                RaceTotal = CandidateDictionary["Total"];
                PercentMax = CandidateDictionary["PercentMax"];
                PercentMin = CandidateDictionary["PercentMin"];
                MarginMax = CandidateDictionary["MarginMax"];
                MarginMin = CandidateDictionary["MarginMin"];
                TurnoutMax = CandidateDictionary["TurnoutMax"];
                TurnoutMin = CandidateDictionary["TurnoutMin"];

                for (var a = 0; a < Candidates.length; a++) {
                    var Dictionary = Candidates[a];
                    var FieldName = Dictionary["FieldName"];
                    var Candidate = CandidateNameList[FieldName];
                    var CandidateResult = Dictionary["CandidateTotal"];
                    var CandidatePercent = ((CandidateResult / RaceTotal) * 100).toFixed(1);
                    var Color;
                    Color = ReturnColor(FieldName);
                    CountyResultList.push({ Party: Color, Candidate: Candidate, Votes: CandidateResult, Percent: CandidatePercent })
                };

                OnLayer.renderer = ArcadeRenderer;
                OnLayer.opacity = 0.75;

                changeRadioSymbology(Symbology);

                ChangeResults();
            });
        }

        function ChangeResults() {
            if (CurrentClickPrecinctID == "") {
                ChangeDivElement(CountyResultList);
            } else {
                var query = OnLayer.createQuery();
                query.where = "PRECINCTID = '" + CurrentClickPrecinctID + "'"
                OnLayer.queryFeatures(query).then(function (results) {
                    var Attributes = results.features[0].attributes
                    GetPrecinctAttributes(Attributes)
                });
            }
        }

        //Return color based on field name; the party addiliation is identified, and the corresponding color is assigned if the field name does not already have a color assigned
        function AssignColor(CandidateFieldName) {
            var Color;
            if (CandidateColorList.findIndex(function (element) { return element == CandidateFieldName }) == -1) {
                var Party = CompleteCandidateList[CandidateFieldName];
                var PartyColorList = ColorDictionary[Party]
                for (var l = 0; l < PartyColorList.length; l++) {
                    if (ColorList.findIndex(function (element) { return element == PartyColorList[l] }) == -1) {
                        Color = PartyColorList[l];
                        ColorList.push(Color);
                        break;
                    };
                };
                CandidateColorList.push(CandidateFieldName);
                ColorList.push(Color);
                CandidateColorDictionary.push({ Candidate: CandidateFieldName, Color: Color })
            };
            return Color
        };

        function ReturnColor(CandidateFieldName) {
            var Color;
            for (var c = 0; c < CandidateColorList.length; c++) {
                var Dictionary = CandidateColorDictionary[c]
                if (Dictionary.Candidate == CandidateFieldName) {
                    Color = Dictionary.Color;
                    break;
                };
            };
            return Color
        };

        function ChangeDivElement(Dictionary) {
            if (CurrentDiv != "") {
                var CurrentDivElement = document.getElementById("ElectionResults");
                if (CurrentDivElement != null) {
                    var MainDiv = document.getElementById("ResultDiv");
                    MainDiv.removeChild(CurrentDivElement);
                }

                var CurrentDivElement = document.getElementById("TurnoutResults");
                if (CurrentDivElement != null) {
                    var MainDiv = document.getElementById("TurnoutDiv");
                    MainDiv.removeChild(CurrentDivElement);
                }

                CreateResultTable(Dictionary);
                CreateTurnoutTable();
                CurrentDiv = "ElectionResults";
            } else {
                CreateResultTable(Dictionary);
                CreateTurnoutTable();
                CurrentDiv = "ElectionResults";
            };
        };

        function CreateResultTable(Dictionary) {
            if (CurrentClickPrecinctID == "") {
                var CurrentResult = "County Results - " + LayerTitle;
            } else {
                var CurrentResult = "Results for: " + CurrentClickPrecinctName + " - " + LayerTitle;
            }

            var MainDiv = document.getElementById("ResultDiv");
            var CurrentDivElement = document.createElement("div");
            CurrentDivElement.id = "ElectionResults";
            CurrentDivElement.className = "TableDisplay";

            var CurrentResultDiv = document.createElement("h4");
            var CurrentResultDivText = document.createTextNode(CurrentResult);
            CurrentResultDiv.appendChild(CurrentResultDivText);
            CurrentResultDiv.setAttribute("style", "font-size:1.3em;");
            CurrentDivElement.appendChild(CurrentResultDiv);

            var Header = document.createElement("h4");
            var HeaderText = document.createTextNode(CurrentRaceName);
            Header.appendChild(HeaderText);
            CurrentDivElement.appendChild(Header);

            var tbl = document.createElement("table");
            var tblBody = document.createElement("tbody");

            for (var a = 0; a < Dictionary.length; a++) {
                var Item = Dictionary[a]

                var row = document.createElement("tr");

                var cell = document.createElement("td");
                cell.className = "Party";
                var cellDiv = document.createElement("div");
                cellDiv.className = "PartyColor";
                cellDiv.setAttribute("style", "background-color:" + Item["Party"] + ";");
                cell.appendChild(cellDiv);
                row.appendChild(cell);

                var cell = document.createElement("td");
                cell.className = "Candidate";
                var cellText = document.createTextNode(Item["Candidate"]);
                cell.appendChild(cellText);
                row.appendChild(cell);

                var cell = document.createElement("td");
                cell.className = "Votes";
                var cellText = document.createTextNode(Item["Votes"]);
                cell.appendChild(cellText);
                row.appendChild(cell);

                var cell = document.createElement("td");
                cell.className = "Percent";
                var cellText = document.createTextNode(String(Item["Percent"]) + "%");
                cell.appendChild(cellText);
                row.appendChild(cell);

                tblBody.appendChild(row);
            };

            tbl.appendChild(tblBody);
            CurrentDivElement.appendChild(tbl);
            MainDiv.appendChild(CurrentDivElement);
        }

        function CreateTurnoutTable() {
            if (CurrentClickPrecinctID == "") {
                var DivRaceTotal = RaceTotal
                var DivTotalRegisteredVoters = TotalRegisteredVoters
            } else {
                var DivRaceTotal = PrecinctRaceTotal
                var DivTotalRegisteredVoters = PrecinctTotalRegisteredVoters
            }
            var NotCast = DivTotalRegisteredVoters - DivRaceTotal;
            var VotePercent = ((DivRaceTotal / DivTotalRegisteredVoters) * 100).toFixed(1);
            var NotCastPercent = ((NotCast / DivTotalRegisteredVoters) * 100).toFixed(1);
            if (DivRaceTotal > NotCast) {
                CastBar = "55px"
                NotCastBar = String((NotCast / DivRaceTotal) * 60) + "px"
            } else {
                CastBar = String((DivRaceTotal / NotCast) * 60) + "px"
                NotCastBar = "55px"
            };

            var MainDiv = document.getElementById("TurnoutDiv");
            var CurrentDivElement = document.createElement("div");
            CurrentDivElement.id = "TurnoutResults";
            CurrentDivElement.className = "TableDisplay";
            var Header = document.createElement("h4");
            var HeaderText = document.createTextNode("Voter Turnout");
            Header.appendChild(HeaderText);
            CurrentDivElement.appendChild(Header);
            var tbl = document.createElement("table");
            var tblBody = document.createElement("tbody");


            //Create Votes Cast Row
            var row = document.createElement("tr");

            var cell = document.createElement("td");
            cell.className = "Turnout";
            var cellText = document.createTextNode("Votes Cast");
            cell.appendChild(cellText);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "Bar";
            var cellDiv = document.createElement("div");
            cellDiv.className = "TurnoutColor";
            cellDiv.setAttribute("style", "background-color:#add8e6; width:" + CastBar + ";");
            cell.appendChild(cellDiv);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "TurnoutVotes";
            var cellText = document.createTextNode(DivRaceTotal);
            cell.appendChild(cellText);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "TurnoutPercent";
            var cellText = document.createTextNode(String(VotePercent) + "%");
            cell.appendChild(cellText);
            row.appendChild(cell);

            tblBody.appendChild(row);


            //Create Votes Not Cast Row
            var row = document.createElement("tr");

            var cell = document.createElement("td");
            cell.className = "Turnout";
            var cellText = document.createTextNode("Votes Not Cast");
            cell.appendChild(cellText);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "Bar";
            var cellDiv = document.createElement("div");
            cellDiv.className = "TurnoutColor";
            cellDiv.setAttribute("style", "background-color:#deb887; width:" + NotCastBar + ";");
            cell.appendChild(cellDiv);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "TurnoutVotes";
            var cellText = document.createTextNode(NotCast);
            cell.appendChild(cellText);
            row.appendChild(cell);

            var cell = document.createElement("td");
            cell.className = "TurnoutPercent";
            var cellText = document.createTextNode(String(NotCastPercent) + "%");
            cell.appendChild(cellText);
            row.appendChild(cell);

            tblBody.appendChild(row);

            tbl.appendChild(tblBody);
            CurrentDivElement.appendChild(tbl);

            var Footer = document.createElement("p");
            var FooterText = document.createTextNode(DivRaceTotal + " votes were cast, with " + DivTotalRegisteredVoters + " registered voters for this race.");
            Footer.appendChild(FooterText);
            Footer.setAttribute("style", "font-size: 1em; font-weight: bold;");
            CurrentDivElement.appendChild(Footer);

            if (CurrentClickPrecinctID != "") {
                var Return = document.createElement("p");
                var ReturnText = document.createTextNode("Return to County Results");
                Return.appendChild(ReturnText);
                Return.setAttribute("id", "CloseDiv");
                Return.addEventListener("click", onReturnToCountyResult)

                CurrentDivElement.appendChild(Return);
            };

            MainDiv.appendChild(CurrentDivElement);
        };

        // These should be available when the view is finished loading
        view.on("click", clickEventHandler);

        view.when(function () {
            view.popup.dockEnabled = true;
            view.popup.dockOptions = {
                position: "bottom-left",
            };

            var searchWidget = new Search({
                view: view,
                source: [{
                    locator: new Locator({
                        url: "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                    }),
                    singleLineFieldName: "SingleLine",
                    name: "Address Search"
                }]
            });
            searchWidget.on("select-result", function (event) {
                view.goTo({
                    target: view.center,
                    zoom: view.zoom - 3
                });
            });
            view.ui.add([{
                component: searchWidget,
                position: "top-left",
                index: 0
            }]);
            //view.ui.add(searchWidget, "top-left");


            var home = new Home({
                view: view
            });
            view.ui.add(home, "top-left", 0);

            //Add Div Elements to View
            view.ui.add([{
                component: "MainDiv",
                position: "bottom-left",
                index: 0
            }]);
        });

        function onReturnToCountyResult() {
            ClearRace();
        }

        function CreateMapOptionRadios() {
            //Create Box Element
            var box = document.createElement("div");
            box.className = "esri-widget";
            box.setAttribute("id", "RadioDiv");

            //Add a Line of Text
            var title = document.createElement("p");
            var text = document.createTextNode("Advanced Map Options: ");
            title.appendChild(text);
            title.setAttribute("style", "font-weight: bold;");
            box.appendChild(title)

            //Create Radio for Percent
            var label = document.createElement("label")
            label.className = "tooltip";

            var ToolTip = document.createElement("span")
            ToolTip.className = "tooltiptext"
            ToolTip.id = "RadioToolTipText"
            ToolTip.appendChild(document.createTextNode("Percent of the candidate recieving the most votes in the precinct"));
            label.appendChild(ToolTip);

            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "renderer";
            radio.value = "Percent";

            label.appendChild(radio);
            label.appendChild(document.createTextNode("Highest Percent"));
            box.appendChild(label)

            box.appendChild(document.createElement("br"))

            //Create Radio for Margin of Victory
            var label = document.createElement("label")
            label.className = "tooltip";

            var ToolTip = document.createElement("span")
            ToolTip.className = "tooltiptext"
            ToolTip.id = "RadioToolTipText"
            ToolTip.appendChild(document.createTextNode("Number of votes between the 1st and 2nd candidates"));
            label.appendChild(ToolTip);

            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "renderer";
            radio.value = "Margin";

            label.appendChild(radio);
            label.appendChild(document.createTextNode("Margin of Victory"));
            box.appendChild(label)

            box.appendChild(document.createElement("br"))

            //Create Radio for Voter Turnout
            var label = document.createElement("label")
            label.className = "tooltip";

            var ToolTip = document.createElement("span")
            ToolTip.className = "tooltiptext"
            ToolTip.id = "RadioToolTipText"
            ToolTip.appendChild(document.createTextNode("Voter turnout for specific race"));
            label.appendChild(ToolTip);

            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "renderer";
            radio.value = "Turnout";

            label.appendChild(radio);
            label.appendChild(document.createTextNode("Voter Turnout"));
            box.appendChild(label)

            //Add a Line of Text
            var title = document.createElement("p")
            var text = document.createTextNode("More Info")
            title.appendChild(text)
            title.setAttribute("id", "CloseDiv");
            box.appendChild(title)

            //Append Box to Body
            var Body = document.body
            Body.appendChild(box)

            view.ui.add([
                {
                    component: "RadioDiv",
                    position: "bottom-left",
                    index: 2
                }
            ]);

            var MapOptionRadio = document.getElementById("CloseDiv");
            var AdvancedInfo = document.getElementById("AdvancedInfo")
            MapOptionRadio.addEventListener("click", function () {
                AdvancedInfo.setAttribute("style", "visibility: visible;");
            });

            var radios = document.getElementsByName("renderer");
            // Handle change events on radio buttons to switch to the correct renderer
            for (var i = 0; i < radios.length; i++) {
                radios[i].addEventListener("change", function (event) {
                    Symbology = event.target.value;
                    changeRadioSymbology(Symbology);
                });
            };
        };

        function moveEventHandler(event) {
            // Get the screen point from the view's click event
            var screenPoint = {
                x: event.x,
                y: event.y
            };

            // Search for graphics at the clicked location
            view.hitTest(screenPoint).then(function (response) {
                if (response.results.length == 1 && MoveGraphic != "") {
                    MoveGraphic = ""
                    if (NewMoveGraphic != "") {
                        view.graphics.remove(NewMoveGraphic);
                        NewMoveGraphic = "";
                        OldMovePrecinctID = "1";
                        var PrecinctName = document.getElementById("PrecinctName");
                        PrecinctName.textContent = "";
                        PrecinctName.setAttribute("style", "visibility: hidden;");
                    }
                };
                if (response.results.length > 1) {
                    MoveGraphic = response.results[0].graphic;
                    Attributes = MoveGraphic.attributes;
                    if (!Attributes.layerId) {
                        MoveGeometry = MoveGraphic.geometry;
                        CurrentMovePrecinctID = Attributes.PRECINCTID;

                        if (CurrentMovePrecinctID != OldMovePrecinctID) {

                            if (NewMoveGraphic != "") {
                                view.graphics.remove(NewMoveGraphic);
                            }

                            NewMoveGraphic = new Graphic({
                                geometry: MoveGeometry,
                                symbol: {
                                    type: 'simple-fill',
                                    style: "none",
                                    outline: {
                                        color: 'white',
                                        width: 2
                                    }
                                }
                            });
                            view.graphics.add(NewMoveGraphic);
                            OldMovePrecinctID = Attributes.PRECINCTID;
                            var MovePrecicntName = FixPrecinctName(Attributes);
                            var PrecinctName = document.getElementById("PrecinctName");
                            PrecinctName.textContent = MovePrecicntName;
                            PrecinctName.setAttribute("style", "visibility: visible;");
                        };
                    };
                };
            });
        };

        function clickEventHandler(event) {
            // Get the screen point from the view's click event
            var screenPoint = {
                x: event.x,
                y: event.y
            };

            // Search for graphics at the clicked location
            view.hitTest(screenPoint).then(function (response) {
                if (response.results.length == 1 && ClickPrecinctID != "") {
                    ClearRace()
                };
                if (response.results[0].graphic.layer.parsedUrl.path == ElectionResultsLayerURL) {
                    console.log(ElectionResultsLayerURL)
                    ClickGraphic = response.results[0].graphic;
                    ClickGeometry = ClickGraphic.geometry;
                    var Attributes = ClickGraphic.attributes;

                    NewClickGraphic = new Graphic({
                        geometry: ClickGeometry,
                        symbol: {
                            type: 'simple-fill',
                            style: "none",
                            outline: {
                                color: "#00FFFF",
                                width: 2
                            }
                        }
                    });
                    if (ClickPrecinctID != "") {
                        view.graphics.remove(ClickPrecinctID);
                    };
                    view.graphics.add(NewClickGraphic);
                    ClickPrecinctID = NewClickGraphic;

                    if (Attributes.PRECINCT != CurrentClickPrecinctID) {
                        PrecinctClickCheckFilterButton("Map")
                        CurrentClickPrecinctName = FixPrecinctName(Attributes);

                        var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue;

                        var FilterPrecinct = document.getElementById("FilterPrecinct");
                        FilterPrecinct.textContent = CurrentClickPrecinctName;

                        CurrentClickPrecinctID = Attributes.PRECINCT;
                        GetPrecinctAttributes(Attributes);

                        var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue;

                        if (FilterButtonValue == "Ready for Clear") {
                            CreateRaceList(CurrentClickPrecinctID);
                        };
                    };
                };
            });
        };

        function ClearRace() {
            var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue;

            PrecinctClickCheckFilterButton("Basemap");
            var FilterPrecinct = document.getElementById("FilterPrecinct");
            FilterPrecinct.textContent = "";
            CreateRaceList("Remove")

            ClearSelectedPrecinct()
        }

        function PrecinctClickCheckFilterButton(type) {
            var FilterButton = document.getElementById("FilterButton");
            var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue
            var FilterButtonText = document.getElementById("FilterButtonText");
            var FilterPrecinct = document.getElementById("FilterPrecinct");
            var FilterPrecinctText = FilterPrecinct.textContent

            if (type == "Map") {
                if (FilterButtonValue == "Off" && FilterPrecinctText == "") {
                    FilterButton.attributes.value.nodeValue = "Ready for Filter";
                    FilterButton.setAttribute("style", "background-color: blue;");
                    FilterButtonText.setAttribute("style", "color: white;");
                };
            } else if (type == "Basemap") {
                FilterButton.attributes.value.nodeValue = "Off";
                FilterButton.setAttribute("style", "background-color: grey;");
                FilterButtonText.setAttribute("style", "color: black;");
                FilterButtonText.textContent = "Filter Races";
            };
        }

        function OnPrecinctButtonClick() {
            var FilterButton = document.getElementById("FilterButton");
            var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue
            var FilterButtonText = document.getElementById("FilterButtonText");
            var FilterPrecinct = document.getElementById("FilterPrecinct");

            if (FilterButtonValue == "Ready for Filter") {
                FilterButton.attributes.value.nodeValue = "Ready for Clear";
                FilterButton.setAttribute("style", "background-color: red;");
                FilterButtonText.textContent = "Clear Filter";
                while (listNode.firstChild) {
                    listNode.removeChild(listNode.firstChild);
                }
                CreateRaceList(CurrentClickPrecinctID)
                FilterPrecinct.textContent = CurrentClickPrecinctName
            } else if (FilterButtonValue == "Ready for Clear") {
                if (FilterPrecinct.textContent != "") {
                    FilterButton.attributes.value.nodeValue = "Ready for Filter";
                    FilterButton.setAttribute("style", "background-color: blue;");
                } else {
                    FilterButton.attributes.value.nodeValue = "Off";
                    FilterButton.setAttribute("style", "background-color: grey;");
                    FilterButtonText.setAttribute("style", "color: black;");
                }
                FilterButtonText.textContent = "Filter Races"
                CreateRaceList("Remove")
                FilterPrecinct.textContent = CurrentClickPrecinctName
            }
        }


        function FixPrecinctName(Attributes) {
            var PrecinctNameFix = "";
            var Name = Attributes.NAME;
            var Split = Name.split(" ");
            for (var item in Split) {
                var Word = Split[item];
                if (isNaN(Word.charAt(0))) {
                    PrecinctNameFix += Word.charAt(0).toUpperCase() + Word.substr(1).toLowerCase() + " ";
                } else {
                    PrecinctNameFix += Word
                }
            }
            return PrecinctNameFix
        }

        function CreateRaceList(Value) {
            if (Value != "Load") {
                while (listNode.firstChild) {
                    listNode.removeChild(listNode.firstChild);
                };
            };

            if (Value == "Load" || Value == "Remove") {
                listNode.innerHTML = "";

                for (step = 0; step < ElectionRaceList.length; step++) {
                    var Dictionary = ElectionRaceList[step]
                    var Race = Dictionary.Fieldname
                    Name = Dictionary.Name;

                    var li = document.createElement("li");
                    li.classList.add("panel-result");
                    li.tabIndex = 0;
                    li.setAttribute("data-result-id", step);
                    li.textContent = Name;
                    if (step == 0 && Value == "Load") {
                        CurrentRaceName = Name;
                        li.setAttribute("class", "selected");
                        target = li;
                    } else if (Race == CurrentRace && Value == "Remove") {
                        li.setAttribute("class", "selected");
                        target = li;
                    };
                    listNode.appendChild(li);

                    var NumRaces = document.getElementById("RaceSubTitle");
                    NumRaces.textContent = "Number of Races: " + String(ElectionRaceList.length)
                    NumRaces.setAttribute("style", "color: black;")
                };
                if (Value == "Remove") {
                    RaceTitle = document.getElementById("RaceTitle");
                    RaceTitle.textContent = "All Races";
                    RaceTitle.setAttribute("style", "color: black;")
                };
            } else {
                var PrecinctRaceList = PrecinctDictionary[Value];
                var NumRaces = document.getElementById("RaceSubTitle");
                var FilterButtonValue = document.getElementById("FilterButton").attributes.value.nodeValue

                if (FilterButtonValue == "Ready for Clear") {
                    NumRaces.textContent = "Number of Races: " + String(PrecinctRaceList.length)
                    NumRaces.setAttribute("style", "color: red;")
                    RaceTitle = document.getElementById("RaceTitle");
                    RaceTitle.textContent = "Races for: " + CurrentClickPrecinctName;
                    RaceTitle.setAttribute("style", "color: red;")
                }


                for (p = 0; p < PrecinctRaceList.length; p++) {
                    var PrecinctRace = PrecinctRaceList[p]

                    for (step = 0; step < ElectionRaceList.length; step++) {
                        var Dictionary = ElectionRaceList[step]
                        var Race = Dictionary.Fieldname
                        Name = Dictionary.Name;

                        if (Race == PrecinctRace) {
                            var li = document.createElement("li");
                            li.classList.add("panel-result");
                            li.tabIndex = 0;
                            li.setAttribute("data-result-id", step);
                            li.textContent = Name;
                            if (Race == CurrentRace) {
                                li.setAttribute("class", "selected");
                                target = li;
                            };
                            listNode.appendChild(li);
                        };
                    };
                };
            };
        };

        function CreateMobileRaceList() {
            MobileListNode.innerHTML = "";
            for (step = 0; step < ElectionRaceList.length; step++) {
                var Dictionary = ElectionRaceList[step]
                var Race = Dictionary.Fieldname
                Name = Dictionary.Name;

                var li = document.createElement("li");
                li.classList.add("panel-result");
                li.tabIndex = 0;
                li.setAttribute("data-result-id", step);
                li.textContent = Name;
                if (step == 0) {
                    CurrentRaceName = Name;
                    li.setAttribute("class", "selected");
                    mobiletarget = li;
                };
                MobileListNode.appendChild(li);
            };
        };

        function GetPrecinctAttributes(Attributes) {
            var Fields = OnLayer.fields;
            PrecinctRaceTotal = 0
            PrecinctTotalRegisteredVoters = Attributes.REGISTERED_VOTERS;
            var PrecinctCandidateList = [];
            PrecinctResultList = [];
            var CurrentRaceList = ElectionRaceDictionary[CurrentRace];
            for (var f = 0; f < Fields.length; f++) {
                var PrecinctFieldName = Fields[f].name;
                if (CurrentRaceList.indexOf(PrecinctFieldName) >= 0) {
                    var Value = Attributes[PrecinctFieldName]
                    PrecinctCandidateList.push({ Field: PrecinctFieldName, Votes: Value })
                    PrecinctRaceTotal += Value;
                };
            };
            for (var p = 0; p < PrecinctCandidateList.length; p++) {
                var CandidateFieldName = PrecinctCandidateList[p].Field
                var Candidate = CandidateNameList[CandidateFieldName];
                var CandidateResult = PrecinctCandidateList[p].Votes;
                if (PrecinctRaceTotal != 0) {
                    var CandidatePercent = ((CandidateResult / PrecinctRaceTotal) * 100).toFixed(1);
                } else {
                    var CandidatePercent = 0
                }
                var Color;
                Color = ReturnColor(CandidateFieldName);
                PrecinctResultList.push({ Party: Color, Candidate: Candidate, Votes: CandidateResult, Percent: CandidatePercent })
            }

            ChangeDivElement(PrecinctResultList);
        }

        //Create Event Listener to Listen for Click
        listNode.addEventListener("click", onListClickHandler);
        MobileListNode.addEventListener("click", onMobileListClickHandler);

        function onClickMapOptions(event) {
            view.ui.remove("MapOptionDiv")
            CreateMapOptionRadios()
        };

        function onClickMapOptionRadio(event) {
            view.ui.remove("RadioDiv")
            CreateMapOptionBox()

            Symbology = "Label";
            changeRadioSymbology(Symbology);
        }

        //Function for Click Event Handler
        function onListClickHandler(event) {
            if (target.id != "nyc_graphics" && target.id != "ClearButton") {
                target.setAttribute("class", "panel-result")
            };
            target = event.target;
            if (target.id != "nyc_graphics" && target.id != "ClearButton") {
                target.setAttribute("class", "selected")
                var resultId = target.getAttribute("data-result-id");
                CurrentRaceName = target.textContent;

                CurrentRace = ElectionRaceList[resultId].Fieldname

                ColorList = [];
                CandidateColorList = [];
                CandidateColorDictionary = [];

                ChangeRace()
            };
        };

        function onMobileListClickHandler(event) {
            if (mobiletarget.id != "RaceList") {
                mobiletarget.setAttribute("class", "panel-result")
            };
            mobiletarget = event.target;
            if (mobiletarget.id != "RaceList") {
                mobiletarget.setAttribute("class", "selected")
                var resultId = mobiletarget.getAttribute("data-result-id");
                CurrentRaceName = mobiletarget.textContent;

                CurrentRace = ElectionRaceList[resultId].Fieldname

                ColorList = [];
                CandidateColorList = [];
                CandidateColorDictionary = [];

                ChangeRace()
            };
        };

        function ClearSelectedPrecinct() {
            view.graphics.remove(ClickPrecinctID);
            ClickPrecinctID = "";
            CurrentClickPrecinctID = "";

            ChangeDivElement(CountyResultList);

        };

        function changeRadioSymbology(fieldName) {
            if (fieldName === "Label") {
                OnLayer.renderer = ArcadeRenderer
            } else if (fieldName === "Percent") {
                var opacityVisVar = {
                    type: "opacity",
                    valueExpression: "Round((Max(" + GlobalListStatement + ")/Sum(" + GlobalListStatement + "))*100, 1)",
                    stops: [{ value: PercentMax, opacity: 1 },
                    { value: PercentMin, opacity: 0.25 }]
                };
                var renderer = OnLayer.renderer.clone();
                renderer.visualVariables = [opacityVisVar];
                OnLayer.renderer = renderer
            } else if (fieldName === "Margin") {
                var NewListStatement = GlobalListStatement;

                var opacityVisVar = {
                    type: "opacity",
                    valueExpression: "( Sort(" + NewListStatement + ")[" + String(GloablFieldList.length - 1) + "] - Sort(" + NewListStatement + ")[" + String(GloablFieldList.length - 2) + "] )",
                    stops: [{ value: MarginMax, opacity: 1 },
                    { value: MarginMin, opacity: 0.25 }]
                };
                var renderer = OnLayer.renderer.clone();
                renderer.visualVariables = [opacityVisVar];
                OnLayer.renderer = renderer
            } else if (fieldName === "Turnout") {

                var opacityVisVar = {
                    type: "opacity",
                    valueExpression: "Round( ( (" + AllFeatures + ")/$feature.REGISTERED_VOTERS)*100, 1)",
                    stops: [{ value: TurnoutMax, opacity: 1 },
                    { value: TurnoutMin, opacity: 0.25 }]
                };
                var renderer = OnLayer.renderer.clone();
                renderer.visualVariables = [opacityVisVar];
                OnLayer.renderer = renderer
            }
        };

        //  Create Chart
                                //CandidateDictionary = CandidateResultDictionary[CurrentRace];
                                // TotalTotalVoters = CandidateDictionary["Total"];

      var data = [4, 8, 15, 16, 23, 42];

var x = d3.scale.linear()
.domain([0, d3.max(data)])
.range([0, 420]);

d3.select(".chart")
.selectAll("div")
.data(data)
.enter().append("div")
.style("width", function(d) { return x(d) + "px"; })
.text(function(d) { return d; });

        //End Create Chart
    });