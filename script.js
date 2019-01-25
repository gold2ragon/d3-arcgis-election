var CandidateResultDictionary = GetCandidateResultDictionary();
var CandidateNameList = GetCandidateNameList();
var CandidateList = GetCandidateList();
var colors = ["rgb(0,154,205)", "rgb(139,119,101)", "rgb(255,140,0)", "rgb(127,255,0)" ];
var parties = ["DEM", "LIB", "REP"];
var selectedAccordion;

$(document).ready(function() {
    var ElectionRaceList = GetElectionRaceList();
    var accordion = ""
    ElectionRaceList.forEach(item => {
        accordion += `<div class="card">
            <div class="card-header" id="heading`+item.Fieldname+`">
                <h5 class="mb-0">
                    <button
                        class="btn btn-link"
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapse`+item.Fieldname+`"
                        aria-expanded="true"
                        aria-controls="collapse`+item.Fieldname+`"
                    >`+item.Name+`</button>
                </h5>
            </div>
            <div
                id="collapse`+item.Fieldname+`"
                class="collapse electionlist"
                data="`+item.Name+`"
                aria-labelledby="heading`+item.Fieldname+`"
            >
                <div class="card-body text-center" id="div`+item.Fieldname+`"></div>
            </div>
        </div>`;
        
    });
    $('#election_accordion').html(accordion)
    ElectionRaceList.forEach(item => {
        FormatData(CandidateResultDictionary[item.Fieldname].Candidates, 'div'+item.Fieldname)
        $('#div'+item.Fieldname).append(GetWiningCandidate(item.Fieldname));
    });
    
    $('.btn_toggle').click(function() {
        var $icon = $(this).find('>:first-child');
        if($icon.hasClass('fa-angle-double-up')) {
            $icon.removeClass('fa-angle-double-up');
            $icon.addClass('fa-angle-double-down');
        }
        else {
            $icon.addClass('fa-angle-double-up');
            $icon.removeClass('fa-angle-double-down');
        }    
    });
    $('.electionlist').on('shown.bs.collapse', function () {
        var $header = $(this).prev();
        $header.addClass('highlight-boder');
        $(document).find('.card-header').not($header).removeClass('highlight-boder');
        $header.addClass('highlight');

        selectedAccordion = $(this).attr('data');
        console.log(selectedAccordion);

    })
    $('.electionlist').on('hidden.bs.collapse', function () {
        var $header = $(this).prev();
        $header.removeClass('highlight');
        $header.removeClass('highlight-boder');
    })
});
function GetWiningCandidate(precinct) {
    candidates = CandidateResultDictionary[precinct].Candidates;
    var winner = {};
    var max = 0;
    var totalvotes = 0;
    for(var i = 0; i < candidates.length; i++) {
        totalvotes += parseInt(candidates[i].CandidateTotal);
        if(max < parseInt(candidates[i].CandidateTotal)) {
           max =  parseInt(candidates[i].CandidateTotal);
           winner = CandidateNameList[candidates[i].FieldName]
        }
    }
    var htmlstring = `<div>
                        <p class="total_votes">Total Votes: <strong>`+ totalvotes +`</strong></p>
                        <p class="winner">Winning Candidate: <strong>`+ winner +`</strong></p>
                      </div>`;
    return htmlstring;
}
function FormatData(data, div_id) {
    var chartdata = [];
    for(var i = 0; i < data.length; i++) {
        chartdata[i] = {}
        chartdata[i].name = CandidateNameList[data[i].FieldName];
        chartdata[i].count = data[i].CandidateTotal;
        chartdata[i].color = colors[parties.indexOf(CandidateList[data[i].FieldName])]
    }
    D3PieChart(chartdata, div_id)
}


function D3PieChart(data, div_id) {
	var width = 275; //width
	var height = 250; //height
	var radius = 150 / 2; //radius of the pie-chart
    
    var svg = d3.select('#'+div_id)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
        .outerRadius(radius).innerRadius(0);

    var pie = d3.layout.pie()
        .value(function (d) { return d.count; })
        .sort(null);

    var path = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    path.append("path")
        .attr("d", arc)
        .style("fill", function (d) { return d.data.color; });

    var tooltip = d3.select('#'+div_id)
    .append('div')
    .attr('class', 'tooltip');


    tooltip.append('div')
    .attr('class', 'name');
    path.on('mouseover', function(d) {
        tooltip.select('.name').html(d.data.name).style('color','white');
        tooltip.style('display', 'block');
        tooltip.style('opacity',0.8);
        tooltip.style('width','auto');
        tooltip.style('background','black');
        tooltip.style('border-radius','5px');
    });
    path.on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 20) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    });

    path.on('mouseout', function() {
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
    path.append("text")
        .attr("transform", function (d) {
            var _d = arc.centroid(d);
            _d[0] *= 3;	//multiply by a constant factor
            _d[1] *= 2.7;	//multiply by a constant factor
            return "translate(" + _d + ")";
        })
        .attr("dy", ".50em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.data.count;
        });
		
	

}

