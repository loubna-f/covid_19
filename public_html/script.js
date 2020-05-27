window.addEventListener('load',()=>{
    j = 1;
    var form = document.getElementById('form-data')
    form.addEventListener('submit',(event)=>{
        event.preventDefault()
        $('#cards').empty()
        fetchData(event.target)
    })
    var addBtn = document.getElementById('add')
    addBtn.addEventListener('click',(event)=>{
        event.preventDefault()
        j++
        if(j<=188)
        addCountry(j)
        else alert("Désolé , on peut pas visualiser plus que 5 pays ")
    })
    fillDataList()
})

const fillDataList = ()=>{
    let url = 'https://pomber.github.io/covid19/timeseries.json'
    let countryList = []
    fetch(url)
    .then(res=>res.json())
    .then(res=>{
        countryList = Object.keys(res)
        console.log(Object.keys(res), " Sont les pays visualisés ")
        localStorage.setItem('cList', JSON.stringify(countryList))
        countryList.forEach((cntry)=>{
            $('datalist').append(`<option value="${cntry}">`)
        })
    })
}

const addCountry = (j)=>{
    $('#inputDiv').append(`<input type="text" class="form-control  mx-auto font-weight-bold wi-75" name="Country"  placeholder="Enter le nom du pays..." list="country${j}">
    <datalist id="country${j}"></datalist>`)
    let cList = JSON.parse(localStorage.getItem('cList'))
    cList.forEach((cntry)=>{
        $(`#country${j}`).append(`<option value="${cntry}">`)
    })
}

const fetchData = async (target)=>{
    
    let i = 1
    let longest = []
    let mainDB = {}
    let graphDB = []
    let dateLabels = {}
    let correctDate
    let type = $('#type').val()
    let typeData
    let url = 'https://pomber.github.io/covid19/timeseries.json'
    await fetch(url)
    .then(res=>res.json())
    .then(res=>{
            
        Array.from(target).forEach((elem)=>{
        if(elem.name == 'Country' && elem.value != '')
        {
            country = elem.value
      //      console.log("current country is ", country)
            mainDB[country]= [] 
            dateLabels[country] = []

            res[country].forEach(({ date, confirmed, recovered, deaths })=>{

                switch(type){
                    case 'Confirmed': typeData = confirmed; break;
                    case 'Recovered': typeData = recovered; break;
                    case 'Deaths': typeData = deaths; break;
                }

                correctDate = formatDate(date)
                mainDB[country].push({x:correctDate, y: Number(typeData)})
                dateLabels[country].push(correctDate)
                latestConf = confirmed 
                latestReco = recovered 
                latestDead = deaths 
                latestDate = correctDate
            })

            $('#date').text('Data as of '+latestDate)
            createCard(country, latestConf, latestReco, latestDead)
            
            if(dateLabels[country].length > longest.length) longest = [...dateLabels[country]]

            console.log(mainDB[country], " is ", country)


            switch(i)
            {
                case 1: clr = 'rgb(255, 0, 0)'; break;
                case 2: clr = 'rgb(0, 255, 0)'; break;
                case 3: clr = 'rgb(0, 0, 255)'; break;
                case 4: clr = 'rgb(232, 122, 199)'; break;
                case 5: clr = 'rgb(60, 201, 215)'; break;
            }
            i++

            let obj = {
                label: country,
                backgroundColor:clr,
                borderColor: clr,
                data: mainDB[country],
                fill: false,
                pointHoverBackgroundColor: 'rgb(0,0,0)',
                pointHoverRadius: 6,
            }

            graphDB.push(obj)
        }       
        })
    })
    .catch((err)=>{
        alert('Le nom du pays est incorrect !')
    })
    drawGraph(graphDB, longest, type)
    
}

const drawGraph = (graphDB, longest, type)=>{


    let config = {
        type : 'line',
        data : {
            labels:  longest ,
            datasets: graphDB ,
        },
        options: {
            responsive: true,
            legend: {
                labels: {
                    fontColor: 'white',
                    fontSize: 20,
                }
            },
            title: {
                display: false,
                text: 'Les cas de Covid 19 '
            },
            tooltips: {
                mode: 'x',
                backgroundColor: 'rgb(0,128,0)',
                titleFontSize: 18,
                bodyFontSize: 17,
            },
            hover: {
                mode: 'index',
                intersect: true
            },    
            scales: {
                xAxes: [{
                    type : 'time',
                    distribution: 'series',
                    ticks: {
                        fontSize: 17,
                        fontColor: 'grey'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: type.toUpperCase()+'   CAS',
                        fontColor: 'white'
                    },
                    ticks: {
                        fontSize: 20,
                        fontColor: 'grey'
                    }
                        }]
            },
        }
    }
    $('canvas').remove()
    $('#chart-container').append('<canvas id="canvas"></canvas>')
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height)
    window.myLine = new Chart(ctx, config);
}

const createCard = (country, latestConf, latestReco, latestDead)=>{
    $('#cards').append(`<div class="card">
    <div class="card-body">
    <h5 class="card-title">${country}</h5>

    <p class="mt-3 text-info"> Confirmed : ${latestConf}</p>
    <p class="text-success"> Recovered : ${latestReco}</p>
    <p class="text-danger"> Deaths : ${latestDead}</p>`)
}
async function store() {
    const covidData = await getData();
    const database = firebase.database();
    for (var i= 0 ; i < covidData.countryList.length; i++) {
        database.ref('/country/'+covidData.countryList[i]).set({
            confirmed : covidData.latestConf[i],
            deaths:  covidData.latestDead[i],
            recovered : covidData.latestReco[i],
        });
    }
}

$(document).ready(function () {
    var nowDate = new Date();
    var secondes = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 24, 0, 0) - nowDate;
    if (secondes < 0) {
         secondes += 86400000;
}
    setTimeout(function(){
        const database = firebase.database();
        store();
        alert("correct");
    }, secondes);
});

const formatDate = (dateInWrongFormat)=>
{   
    var len = dateInWrongFormat.length
    var lastPos = dateInWrongFormat.lastIndexOf('-')
    let day = dateInWrongFormat.slice(lastPos+1)
    var firstPos = dateInWrongFormat.indexOf('-')
    let month = dateInWrongFormat.slice(firstPos+1, lastPos)
    let year = dateInWrongFormat.substr(0,4)
    return new Date(year, month-1, day)
}
var tab = Array();

function sum(tab) {
    var s = 0;
    for (k = 0; k < tab.length; k++) {
        s = s + tab[k];
    }
    return s;
};

var html = "";
var html1 = "";
var html2 = "";
var pays = Array();
var day = Array();
var conf = Array();
var death = Array();
var recov = Array();

fetch('https://pomber.github.io/covid19/timeseries.json')
    .then(dataWrappedByPromise => dataWrappedByPromise.json())
    .then(data => {
        var cas = Object.values(data)[0];
        pays.push(Object.getOwnPropertyNames(data));
        html += "<option>countries and territoires:</option>";

        for (i = 0; i < pays[0].length; i++) {
            html += "<option value=" + i + ">" + pays[0][i] + "</option>";
            day.push(Object.values(data)[i][cas.length - 1].date);
            conf.push(Object.values(data)[i][cas.length - 1].confirmed);
            death.push(Object.values(data)[i][cas.length - 1].deaths);
            recov.push(Object.values(data)[i][cas.length - 1].recovered);

            html2 += "<tr>";
            html2 += "<td>" + pays[0][i] + "</td>";
            html2 += "<td>" + Object.values(data)[i][cas.length - 1].confirmed + "</td>";
            html2 += "<td>" + Object.values(data)[i][cas.length - 1].deaths + "</td>";
            html2 += "<td>" + Object.values(data)[i][cas.length - 1].recovered + "</td>";
            html2 += "</tr>";

            var d = Array();
            var c = Array();
            var dea = Array();
            var r = Array();
            for (j = 0; j < cas.length; j++) {
                d.push(Object.values(data)[i][j].date);
                c.push(Object.values(data)[i][j].confirmed);
                dea.push(Object.values(data)[i][j].deaths);
                r.push(Object.values(data)[i][j].recovered);
            }
            
        }
         function tri(tab) {
            var changed;
            do {
                changed = false;
                for (var i = 0; i < tab.length - 1; i++) {
                    if (tab[i + 1] > tab[i]) {
                        var tmp = tab[i + 1];
                        tab[i + 1] = tab[i];
                        tab[i] = tmp;
                        var p = pays[0][i + 1];
                        pays[0][i + 1] = pays[0][i];
                        pays[0][i] = p;
                        changed = true;
                    }
                }
            } while (changed);
            return tab;
        }
        
        var database = firebase.database();
        var ref2 = database.ref(day[pays[0].length - 1]);

        for (h = 0; h < pays[0].length; h++) {
            var ref = ref2.child(pays[0][h]);
            var data = {

                confirmed: conf[h],
                deaths: death[h],
                recovered: recov[h],
            }
            
            ref.set(data);
        }
      

        html1 += "From :" + cas[0].date + "  to  " + cas[cas.length - 1].date;
        $('#op').html(html);
        $('#mytable').html(html2);
        $('#date').html(html1);
        $('#ca').html(sum(conf));
        $('#dea').html(sum(death));
        $('#rec').html(sum(recov));


       

    });




