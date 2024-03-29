/*
This populates the page dashboard.html
Software used: Impyla, Impala, Hive
Author: Ashley Wang
*/

/*
This code makes the query settings form pop up.
*/

$(function() {
  $('#querySettings').on('click', function() {
    if($(this).hasClass('selected')) {
      deselect($(this));               
    } else {
      $(this).addClass('selected');
      $('.pop').slideFadeToggle();
    }
    return false;
  });

  $('.close').on('click', function() {
    deselect($(this));
    return false;
  });
});

function deselect(e) {
  if($('#querySettings').hasClass('selected')) {
      $('.pop').slideFadeToggle(function() {
        e.removeClass('selected');
      });
  }
      
}

$.fn.slideFadeToggle = function(easing, callback) {
  return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
};


// /* 
// Create the Network, and Domain Selection dropdown menu

// Copyright (c) 2013. All Rights reserved.
//    If you use this script, please email me and let me know, thanks!
//    Andrew Hedges, andrew(at)hedges(dot)name
// */

(function (window, document, undefined) {
  'use strict'

  // Narrower is defined in pipeline.js

  // initialization for span form
  var inp  = document.querySelector('#nrwr')
  var sel  = document.querySelector('#spanNames')
  var disp = document.querySelector('#spanMatches')
  var spanList = ['ALL', 'akanote', 'euc', 'freeflow', 'essl', 'mobile', 'ffs', 'ddc', 'ffessl', 'iis', 'dna', 'volta', 'mediac', 'cmso', 'csi', 'icecast', 'mega', 'internal', 'feo', 'c2s', 'netmgmt', 'rum', 'odin', 'storage', 'cobra', 'ingest', 'srip', 'multi1', 'ness', 'netview', 'noffessl', 'dart', 'flash', 'map', 'mts', 'infra'];
  // kick it off
  var nrwr = new Narrower(inp, sel, disp, spanList)
  nrwr.init()

  //same for domain form
  var inp2  = document.querySelector('#nrwr2')
  var sel2  = document.querySelector('#domainNames')
  var disp2 = document.querySelector('#domainMatches')
  var domainList = ['ALL', 'amsstagethree', 'nocc-auto', 'portalc', 'cogs', 'nmtc', 'static', 'mapnocctwo', 'ams', 'mapnoccthree', 'nmt', 'amstwo', 'portala', 'pacmanb', 'prodb', 'prod', 'resolve', 'devbl', 'amscmp', 'monster', 'svcperf', 'amsfour', 'mui', 'perf', 'dev', 'amsstagefour', 'mapnocc', 'perfbl', 'nmtd', 'ump', 'dashboard', 'nmtb', 'proda', 'estats', 'portalb', 'mapnoccfive', 'amsstagetwo', 'nocc', 'amsstage', 'regionview', 'amsthree', 'prodc', 'pacman', 'mapnoccfour']
  var nrwr2 = new Narrower(inp2, sel2, disp2, domainList)
  nrwr2.init()

  //same for thread form
  var inp3  = document.querySelector('#nrwr3')
  var sel3  = document.querySelector('#threadNames')
  var disp3 = document.querySelector('#threadMatches')
  var threadList = ['ALL', 'decoder', 'main', 'decoder06', 'decoder04', 'decoder02', 'decoder01', 'main01', 'decoder03', 'decoder05']
  var nrwr3 = new Narrower(inp3, sel3, disp3, threadList)
  nrwr3.init()

}(this, this.document))

/*
Generate the rest of the Query Settings div
*/
$(function () {

    // Add table and IP input box
    $('<p><input type="text" class="form-control" id="tableNames" placeholder = "Table Name" size="12"></p>').appendTo('#other');
    $('<p><input type="text" class="form-control" id="ipAddress" placeholder = "IP Address" size="12" ></p>').appendTo('#other');

    // Set defaults for span and domain and thread
    $("option:contains('ALL')")[0]["selected"] = true; //span
    $("option:contains('ALL')")[1]["selected"] = true; //domain
    $("option:contains('ALL')")[2]["selected"] = true; //thread
    
    //Create and add buttons
    $('<p><input type="button" id="newGraph" value = "New Graph" class="btn-primary btn"><br></p>').appendTo('#button_div');
    $('<p><input type="button" id="addGraph" value = "Add Graph" class="btn-primary btn"><br></p>').appendTo('#button_div');
    // If you click the button, this will run
    $('#newGraph').bind('click', submit_query);
    $('#addGraph').bind('click', submit_query_add);

});

/*
This setting draws the event flags.
*/
$(function () {
    $('#drawFlags').bind('click', drawFlags);
});

/*
Initialize the page with graphs
*/
function generate_chart() {
  return {
    chart: {
        type: 'spline',
        zoomType: 'x'
    },
    title: {
        text: 'Aggset Size over Time'
    },
    legend: {
        enabled: true,
        // align: 'right',
        // x: -20,
        // verticalAlign: 'top',
        // y: 25,
        // floating: true,
        // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        // borderColor: '#CCC',
        // borderWidth: 1,
        // shadow: false
    },
    xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // Highstock runs into issues with updating irregular time intervals, keep this.
            second: '%b %e',
            minute: '%b %e',
            hour: '%b %e',
            day: '%b %e',
            month: '%e. %b',
            year: '%b'
        },
        title: {
            text: 'Date'
        },
        ordinal: false, // essential for allowing highstocks to deal with incoming data (graph it correctly)
        minRange: 1
    },
    yAxis: {
        title: {
            text: 'Number of Rows'
        },
        labels: {
          formatter: function () {
              return Highcharts.numberFormat(this.value,0, ".", ",");
          }
        },
        stackLabels: {
            enabled: true,
            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
        },
        min: 0
    },
    navigator: {
        enabled: true,
        series: {data: [[1432897200000.0, 242378244], [1432898100000.0, 294217299], [1432898700000.0, 414146527], [1432899900000.0, 211385957], [1432901400000.0, 254118775], [1432902000000.0, 410955918], [1432902300000.0, 256434576], [1432902900000.0, 214361825], [1432903200000.0, 492927248], [1432903800000.0, 227048355], [1432904400000.0, 316624818], [1432904700000.0, 164893251], [1432905300000.0, 362149794], [1432905600000.0, 310215100], [1432905900000.0, 438240595], [1432906200000.0, 520803813], [1432906500000.0, 569727619], [1432906800000.0, 239649112], [1432907100000.0, 685389091], [1432907400000.0, 238605276], [1432908300000.0, 806030902], [1432908600000.0, 1813254746], [1432908900000.0, 204751321], [1432909500000.0, 544558776], [1432909800000.0, 123293502]]}
    },
    exporting: {
        buttons: {
            contextButton: {
                menuItems: [{
                    text: 'Print Chart',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {
                    text: 'Export to PNG',
                    onclick: function () {
                        this.exportChart();
                    },
                    separator: false
                },
                {separator: true},
                {text: 'Graph as Area Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'area'})}};
                }},
                {text: 'Graph as Line Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'line'})}};
                }},
                {text: 'Graph as Bar Chart',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'bar'})}};
                }},
                {text: 'Graph as Scatter Plot',
                onclick: function () {
                    a = $('#feed_main_chart').highcharts();
                    for (i = 0; i < a.series.length; i++) {if (a.series[i].type != 'flags') {a.series[i].update({type: 'scatter'})}};
                }}
              ]
            }
        }
    },
    turboThreshold: 0, //TODO this allows the chart to keep over 1000 points.
    // tooltip: { //TODO DELETE THIS if you add flags
    //  formatter: function() {
    //    if "{series.type}" == 'flags':
    //      return '{point.text}';
    //    else:
     //          return '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>';
    //     }
    //     // headerFormat: '<b>{series.name}</b><br>',
        // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>',//'{point.x: %b/%e/%Y}: {point.y:.0f}'
    //     valueDecimals: 0
    // },
    plotOptions: {
        spline: {
            marker: {
                enabled: true
            }
        }
    },
    series: [
        {
        name: 'freeflow.',
        tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'},
        data: [
             [1432897200000.0, 242378244], [1432898100000.0, 294217299], [1432898700000.0, 414146527], [1432899900000.0, 211385957], [1432901400000.0, 254118775], [1432902000000.0, 410955918], [1432902300000.0, 256434576], [1432902900000.0, 214361825], [1432903200000.0, 492927248], [1432903800000.0, 227048355], [1432904400000.0, 316624818], [1432904700000.0, 164893251], [1432905300000.0, 362149794], [1432905600000.0, 310215100], [1432905900000.0, 438240595], [1432906200000.0, 520803813], [1432906500000.0, 569727619], [1432906800000.0, 239649112], [1432907100000.0, 685389091], [1432907400000.0, 238605276], [1432908300000.0, 806030902], [1432908600000.0, 1813254746], [1432908900000.0, 204751321], [1432909500000.0, 544558776], [1432909800000.0, 123293502]
        ]
        }
        //,
        // {
        // name: 'All',
        // id: 'dataSeries',
        // tooltip: {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'},
        // data: [[1435578000000.0, 370006710], [1435582200000.0, 192928248], [1435582800000.0, 169444486], [1435583100000.0, 346033501], [1435583700000.0, 667454773], [1435584000000.0, 718132135], [1435584300000.0, 2100765152], [1435584600000.0, 1116371431], [1435584900000.0, 1965781013], [1435585200000.0, 2655460072], [1435585500000.0, 3615086808], [1435585800000.0, 4645715133], [1435586100000.0, 7455624770], [1435586400000.0, 16164030529], [1435586700000.0, 17811901300], [1435587000000.0, 20243627379], [1435587300000.0, 29036973691], [1435587600000.0, 23847797061], [1435587900000.0, 20602244792], [1435588200000.0, 15129416233], [1435588500000.0, 11185836911], [1435588800000.0, 3090273715], [1435589100000.0, 428980024], [1435589400000.0, 632082965], [1435589700000.0, 512451017], [1435715520000.0, 973530090], [1435721880000.0, 520580840], [1435728660000.0, 190031239], [1435732800000.0, 37848905], [1435739220000.0, 448117885], [1435746060000.0, 704029808], [1435750320000.0, 641113845], [1435757040000.0, 553121615], [1435760640000.0, 936557856], [1435763580000.0, 48976676], [1435769880000.0, 486442920], [1435776540000.0, 817036971], [1435779540000.0, 30360635], [1435783500000.0, 629591945], [1435790040000.0, 804994065], [1435794180000.0, 74810048], [1435797600000.0, 370724674], [1435802820000.0, 626630150], [1435808220000.0, 975007435], [1435812360000.0, 143570256], [1435818420000.0, 200146800], [1435821780000.0, 927658005], [1435828920000.0, 110350753], [1435835220000.0, 852837107], [1435841460000.0, 416970582], [1435845780000.0, 315270339], [1435852200000.0, 770709866], [1435856820000.0, 166576486], [1435861380000.0, 981719598], [1435867320000.0, 96253718], [1435873500000.0, 787628716], [1435880340000.0, 469422047], [1435884720000.0, 672872881], [1435889640000.0, 382055068], [1435894980000.0, 200082045], [1435901820000.0, 921167390], [1435905240000.0, 270870108], [1435912320000.0, 455109192], [1435917540000.0, 418271267], [1435920300000.0, 293097258], [1435924920000.0, 113041816], [1435929660000.0, 615061856], [1435936260000.0, 314408339], [1435942020000.0, 334217119], [1435944720000.0, 130723261], [1435951500000.0, 623867154], [1435954500000.0, 471479737], [1435961280000.0, 937308387], [1435966680000.0, 984172671], [1435973820000.0, 888913990], [1435980660000.0, 895467317], [1435984500000.0, 790127663], [1435988460000.0, 987039296], [1435991220000.0, 764035476], [1435997160000.0, 519246644], [1436000520000.0, 272280791], [1436006880000.0, 708827528], [1436011080000.0, 812370713], [1436016840000.0, 395323454], [1436022480000.0, 520790317], [1436025540000.0, 769885920], [1436030280000.0, 16022119], [1436035800000.0, 767545661], [1436039580000.0, 763317797], [1436042400000.0, 279070831], [1436048160000.0, 882067607], [1436054760000.0, 69403519], [1436060880000.0, 623981893], [1436064900000.0, 985811040], [1436070180000.0, 322310531], [1436077020000.0, 930007396], [1436084040000.0, 203270355], [1436089920000.0, 516412674], [1436095380000.0, 25082887], [1436100900000.0, 858734023], [1436105160000.0, 622793365], [1436109420000.0, 870067638], [1436116380000.0, 163212328], [1436119500000.0, 895217638], [1436124480000.0, 646428748], [1436127540000.0, 890947529], [1436130600000.0, 141100287], [1436136480000.0, 163637416], [1436140620000.0, 607668625], [1436146560000.0, 57854046], [1436153160000.0, 148271872], [1436156400000.0, 244743534], [1436161500000.0, 34290713], [1436165400000.0, 301242500], [1436168100000.0, 241291065], [1436171040000.0, 472716044], [1436177700000.0, 503796437], [1436181000000.0, 39294701], [1436186640000.0, 261054229], [1436189400000.0, 238091972], [1436194860000.0, 953916975], [1436201820000.0, 750948201], [1436207880000.0, 683486287], [1436212920000.0, 160148708], [1436219580000.0, 787306425], [1436226540000.0, 434364951], [1436229420000.0, 582161285], [1436233920000.0, 765588296], [1436236800000.0, 951691307], [1436240340000.0, 658639374], [1436247060000.0, 369718297], [1436250300000.0, 440025618], [1436257080000.0, 925096087], [1436263740000.0, 40315509], [1436267220000.0, 859636000], [1436271300000.0, 334636282], [1436275980000.0, 653017599], [1436282700000.0, 663348443], [1436288280000.0, 563126774], [1436291280000.0, 525257772], [1436298060000.0, 801821812], [1436301360000.0, 852406353], [1436308320000.0, 184727178], [1436313120000.0, 895601789], [1436316900000.0, 159195970], [1436322840000.0, 410653407], [1436326080000.0, 401410242], [1436331120000.0, 872594247], [1436334600000.0, 325649077], [1436340240000.0, 122074828], [1436346300000.0, 195803911], [1436349420000.0, 81703747], [1436355180000.0, 3023226], [1436359560000.0, 513967170], [1436366580000.0, 185427449], [1436369340000.0, 879780945], [1436374140000.0, 698046890], [1436379960000.0, 530605447], [1436386920000.0, 219579309], [1436390580000.0, 966989165], [1436397420000.0, 700786557], [1436403540000.0, 698365660], [1436408100000.0, 410205675], [1436413380000.0, 284396758], [1436417280000.0, 980038970], [1436421840000.0, 306776123], [1436428320000.0, 244878172], [1436431920000.0, 327430592], [1436438880000.0, 331669480], [1436441880000.0, 725768845], [1436447160000.0, 560913724], [1436451060000.0, 275453581], [1436454300000.0, 815641522], [1436457180000.0, 566202998], [1436460300000.0, 480287355], [1436466420000.0, 780595487], [1436473440000.0, 989154339], [1436478720000.0, 558567393], [1436485380000.0, 129232348], [1436490060000.0, 208749888], [1436494860000.0, 375761789], [1436500260000.0, 913038988], [1436503680000.0, 966668946], [1436508540000.0, 847023587], [1436515320000.0, 271142441], [1436522160000.0, 790516246], [1436528100000.0, 877378770], [1436535180000.0, 579147258], [1436539980000.0, 897130799], [1436544900000.0, 106048015], [1436550720000.0, 683371702], [1436557200000.0, 338490705], [1436562360000.0, 738692349], [1436567940000.0, 510750926], [1436573580000.0, 350464421], [1436579760000.0, 988430583], [1436585520000.0, 808311095], [1436590740000.0, 300938775], [1436595600000.0, 739484011], [1436600040000.0, 695866280], [1436603220000.0, 21295974], [1436610360000.0, 25155021], [1436614260000.0, 609123515], [1436620020000.0, 701029582], [1436622960000.0, 227220270], [1436626080000.0, 847775758], [1436632380000.0, 576467652], [1436637240000.0, 478852294], [1436643840000.0, 708430175], [1436649360000.0, 111535115], [1436652900000.0, 517762124], [1436659920000.0, 645906534], [1436665380000.0, 354312681], [1436671080000.0, 62804840], [1436678160000.0, 444669074], [1436682000000.0, 903454690], [1436688120000.0, 530826456], [1436691780000.0, 470836662], [1436694840000.0, 574907568], [1436699940000.0, 794376733], [1436703120000.0, 861090119], [1436708580000.0, 30280628], [1436714280000.0, 237970527], [1436720640000.0, 852427200], [1436725500000.0, 914121069], [1436729580000.0, 562694239], [1436732400000.0, 944762013], [1436737740000.0, 269618110], [1436743500000.0, 186469537], [1436746680000.0, 263158439], [1436753220000.0, 910221131], [1436756520000.0, 85340982], [1436761020000.0, 713318910], [1436764440000.0, 768459193], [1436767200000.0, 435244018], [1436770080000.0, 983943213], [1436777040000.0, 564101973], [1436782320000.0, 15586892], [1436788500000.0, 227406777], [1436793420000.0, 610273164], [1436796960000.0, 488804221], [1436802960000.0, 692219824], [1436806080000.0, 292479550], [1436811540000.0, 692575951], [1436814780000.0, 958011148], [1436821320000.0, 395509973], [1436827740000.0, 4343031], [1436833320000.0, 288060238], [1436839560000.0, 232933754], [1436842560000.0, 909086999], [1436848680000.0, 152674075], [1436853240000.0, 280886588], [1436859660000.0, 154749638], [1436866380000.0, 563650949], [1436869560000.0, 759442612], [1436872500000.0, 734746949], [1436875680000.0, 357441253], [1436878860000.0, 234667559], [1436884200000.0, 972765448], [1436888160000.0, 11816894], [1436893200000.0, 77633188], [1436898060000.0, 476873488], [1436904240000.0, 977207806], [1436910900000.0, 933114146], [1436915580000.0, 961616921], [1436920800000.0, 225357451], [1436927640000.0, 238869331], [1436934780000.0, 87531747], [1436940900000.0, 31786015], [1436945940000.0, 596508448], [1436951160000.0, 876068657], [1436955300000.0, 330210174], [1436959980000.0, 338290794], [1436962800000.0, 739165808], [1436966340000.0, 333429225], [1436971140000.0, 415592734], [1436975940000.0, 653700163], [1436980860000.0, 649579509], [1436986800000.0, 925028546], [1436990700000.0, 943302028], [1436995380000.0, 317162731], [1436998320000.0, 194237307], [1437004320000.0, 269699947], [1437007440000.0, 474642181], [1437011940000.0, 741123220], [1437016260000.0, 80352344], [1437022800000.0, 919122198], [1437029460000.0, 32971695], [1437032400000.0, 626911484], [1437037440000.0, 673128924], [1437043980000.0, 333721140], [1437048720000.0, 681240946], [1437052740000.0, 299709545], [1437056640000.0, 831139471], [1437061800000.0, 388336533], [1437064980000.0, 211309007], [1437070440000.0, 552198675], [1437074760000.0, 463436926], [1437080400000.0, 96955494], [1437086340000.0, 405075327], [1437091980000.0, 398779231], [1437098100000.0, 399267635], [1437103740000.0, 827661081], [1437108720000.0, 653655838], [1437113280000.0, 284866429], [1437117300000.0, 786984101], [1437123240000.0, 387857452], [1437128700000.0, 31131407], [1437133860000.0, 386793421], [1437139980000.0, 543315017], [1437147060000.0, 329481849], [1437150900000.0, 280260854], [1437153960000.0, 585399071], [1437159900000.0, 369123026], [1437165300000.0, 155265346], [1437172200000.0, 251907282], [1437178860000.0, 296375366], [1437182640000.0, 176477240], [1437187680000.0, 87428974], [1437193380000.0, 700855400], [1437197100000.0, 917548598], [1437202020000.0, 767654330], [1437209100000.0, 635722875], [1437212760000.0, 18837591], [1437219720000.0, 489222490], [1437225840000.0, 131492573], [1437231000000.0, 743101104], [1437237840000.0, 1370975], [1437244260000.0, 771350604], [1437247620000.0, 871442261], [1437252900000.0, 299734020], [1437257940000.0, 821958023], [1437260880000.0, 301076434], [1437264780000.0, 834195131], [1437269700000.0, 573715309], [1437273660000.0, 752098979], [1437277500000.0, 725175173], [1437283500000.0, 971215515], [1437289380000.0, 806956664], [1437293640000.0, 420956525], [1437296580000.0, 315427989], [1437302700000.0, 482553445], [1437308520000.0, 805970784], [1437314640000.0, 143142263], [1437320280000.0, 73298124], [1437323760000.0, 318840062], [1437328560000.0, 434567000], [1437334860000.0, 417048595], [1437339720000.0, 768874708], [1437343440000.0, 176531499], [1437346260000.0, 551348622], [1437350160000.0, 407624121], [1437353340000.0, 922136835], [1437356520000.0, 727896979], [1437360900000.0, 729632701], [1437364440000.0, 254962170], [1437367740000.0, 641095695], [1437371580000.0, 615092711], [1437377220000.0, 354442649], [1437383100000.0, 161427489], [1437388380000.0, 706517408], [1437391320000.0, 102197807], [1437397140000.0, 329753915], [1437402600000.0, 239837728], [1437405420000.0, 479650748], [1437412140000.0, 578781841], [1437416340000.0, 290372420], [1437419880000.0, 278454618], [1437423180000.0, 681417319], [1437428880000.0, 967208], [1437432840000.0, 127407961], [1437439920000.0, 228305131], [1437443100000.0, 450525301], [1437447840000.0, 411142496], [1437454440000.0, 729529524], [1437461160000.0, 627642498], [1437467820000.0, 360939176], [1437470640000.0, 294528422], [1437474840000.0, 258112894], [1437481560000.0, 224295507], [1437485040000.0, 377847876], [1437487800000.0, 329395403], [1437490620000.0, 744661547], [1437493740000.0, 142598012], [1437496680000.0, 680490258], [1437503640000.0, 57028283], [1437507060000.0, 264299017], [1437510780000.0, 980827769], [1437517260000.0, 663461275], [1437522660000.0, 939140125], [1437526920000.0, 907729350], [1437532380000.0, 872274487], [1437535500000.0, 977495338], [1437540360000.0, 611294521], [1437547500000.0, 336170753], [1437554280000.0, 359312332], [1437559620000.0, 190971894], [1437565200000.0, 111426063], [1437570180000.0, 807287227], [1437577320000.0, 262984598], [1437584460000.0, 50575263], [1437589740000.0, 462679392], [1437594900000.0, 368298391], [1437599040000.0, 711882593], [1437605820000.0, 566960596], [1437609900000.0, 148699785], [1437613200000.0, 558697694], [1437619920000.0, 465896635], [1437626700000.0, 896425638], [1437632220000.0, 968081141], [1437636660000.0, 381363433], [1437640140000.0, 259777345], [1437643260000.0, 402815032], [1437649080000.0, 879920513], [1437656040000.0, 901361492], [1437660120000.0, 51201097], [1437662940000.0, 804942678], [1437667380000.0, 219137807], [1437670740000.0, 36496139], [1437675540000.0, 418362906], [1437680340000.0, 836610073], [1437686880000.0, 772805742], [1437693840000.0, 61318971], [1437698520000.0, 566326365], [1437701280000.0, 722421850], [1437707640000.0, 128654137], [1437711000000.0, 486304873], [1437717180000.0, 886856711], [1437722460000.0, 728709211], [1437727080000.0, 776386197], [1437731460000.0, 530221461], [1437736440000.0, 357672767], [1437739980000.0, 96661848], [1437744300000.0, 903272754], [1437749940000.0, 157342830], [1437755280000.0, 391462900], [1437760920000.0, 326210490], [1437767280000.0, 72409047], [1437772800000.0, 14724254], [1437777660000.0, 707883902], [1437783480000.0, 664728240], [1437787560000.0, 74709159], [1437793380000.0, 339649062], [1437798300000.0, 241390168], [1437805020000.0, 987400765], [1437809100000.0, 772876481], [1437816120000.0, 877944], [1437821460000.0, 5734365], [1437826260000.0, 965393575], [1437831840000.0, 494045828], [1437835140000.0, 961367733], [1437838680000.0, 85875297], [1437841860000.0, 598302449], [1437844800000.0, 995727507], [1437848160000.0, 550450200], [1437852780000.0, 449673050], [1437857760000.0, 772630267], [1437864480000.0, 78436307], [1437870600000.0, 39111325], [1437876060000.0, 703065960], [1437879900000.0, 593040444], [1437883680000.0, 747301421], [1437889380000.0, 189112887], [1437895920000.0, 966510831], [1437902640000.0, 498022780], [1437906180000.0, 741520844], [1437911220000.0, 400707667], [1437914520000.0, 417290090], [1437918600000.0, 501281155], [1437921600000.0, 376955358], [1437927120000.0, 480290679], [1437932460000.0, 322462949], [1437937620000.0, 117674869], [1437942180000.0, 430378087], [1437945480000.0, 416858070], [1437949320000.0, 554223613], [1437954180000.0, 658636798], [1437959700000.0, 742916592], [1437965160000.0, 595988501], [1437970200000.0, 128729315], [1437974760000.0, 649844950], [1437977700000.0, 493281074], [1437982860000.0, 696987077], [1437987360000.0, 731026090], [1437990540000.0, 100621444], [1437996540000.0, 616135162], [1437999300000.0, 103501936], [1438006140000.0, 456909222], [1438012260000.0, 284134632], [1438018800000.0, 842731950], [1438023840000.0, 377769528], [1438027020000.0, 808541139], [1438032060000.0, 689472775], [1438037580000.0, 586863699], [1438041840000.0, 565834105], [1438046820000.0, 306083535], [1438051860000.0, 353764958], [1438056300000.0, 623257610], [1438061460000.0, 144362962], [1438067160000.0, 955494665], [1438071060000.0, 617319657], [1438076760000.0, 385690765], [1438082700000.0, 906129239], [1438086420000.0, 776140905], [1438090020000.0, 358880719], [1438095360000.0, 544861647], [1438100460000.0, 42836827], [1438103280000.0, 479303385], [1438107300000.0, 67455638], [1438113120000.0, 616761624], [1438118220000.0, 406655127], [1438122000000.0, 295672089], [1438126920000.0, 617604006], [1438131780000.0, 376152643], [1438137540000.0, 967078971], [1438141740000.0, 9357041], [1438144440000.0, 106679166], [1438148340000.0, 360981470], [1438152960000.0, 336464672], [1438159860000.0, 703661801], [1438165140000.0, 697710861], [1438168980000.0, 904457035], [1438173480000.0, 230846453], [1438176300000.0, 474106700], [1438181520000.0, 186173974], [1438185240000.0, 681435749], [1438188000000.0, 439949805], [1438195080000.0, 628514288], [1438201200000.0, 538541387], [1438206420000.0, 403561869], [1438211580000.0, 443738111], [1438215180000.0, 72225149], [1438221060000.0, 853075196], [1438225560000.0, 467813674], [1438228560000.0, 611657382], [1438235220000.0, 70857295], [1438239600000.0, 691356117], [1438243740000.0, 669555160], [1438249320000.0, 856407490], [1438252500000.0, 715678009], [1438258080000.0, 554917501], [1438265220000.0, 448611693], [1438270560000.0, 407538377]]
        // }
    ]
  }
}

var initial_main_feed = generate_chart();

$(function () {
    // Create the main graph
    var series = initial_main_feed.series;
    $('#feed_main_chart').highcharts("StockChart", initial_main_feed);
    initial_main_feed.series = series;
    // submit_query()
    // drawFlags()
});


/*
Populate the sub rows with tables with the highest tables, ip's and aggsets
*/

// $(function () {
//     // Add options for the sub charts
//     $('<p align="center"><input type="button" id="tableList" value = "Generate List : Largest Tables"><br></p>').appendTo('.sub_1_chart_container');
//     $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='tableNum'> </p>").appendTo('.sub_1_chart_container');
//     $("<p align = 'center'>Over the course of: <select id = 'tableTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_1_chart_container');

//     $('<p align="center"><input type="button" id="ipList" value = "Generate List : Highest Output IP Addresses"><br></p>').appendTo('.sub_2_chart_container');
//     $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='ipNum'> </p>").appendTo('.sub_2_chart_container');
//     $("<p align = 'center'>Over the course of: <select id = 'ipTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_2_chart_container');

//     $('<p align="center"><input type="button" id="aggsetList" value = "Generate List : Largest Aggsets"><br></p>').appendTo('.sub_3_chart_container');
//     $("<p align = 'center'>List the highest: <input type='number' min='0' value='10' id='aggsetNum'> </p>").appendTo('.sub_3_chart_container');
//     $("<p align = 'center'>Over the course of: <select id = 'aggsetTime'><option>All Time</option><option>Past Day</option><option>Past Week</option><option>Past Month</option><option>Past Year</option></select> </p>").appendTo('.sub_3_chart_container');

//   // If you click the button, this will run
//   $('#tableList').bind('click', make_table_1);
//   $('#ipList').bind('click', make_table_2);
//   $('#aggsetList').bind('click', make_table_3);
// });

/*
Functions that deal with button clicks
*/

var colorWheel = 0;

// Make a new graph
var submit_query = function(e) {
  var page_args = {
    table: 'dec',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#tableNames').val(),
    e: $('#ipAddress').val()
  };
  args = $.param(page_args);
  $.getJSON('/_make_query', args, function(data) {
        // var chart = $('#feed_main_chart').highcharts();
        response = generate_chart();
        response.series[0].name = data.name;
        response.series[0].data = data.data;
        response.series[0].color = Highcharts.getOptions().colors[colorWheel];
        colorWheel += 1;
        console.log(data.data);
        var series = response.series;
        // var chart = new Highcharts.StockChart(response);
        var chart = $('#feed_main_chart').highcharts("StockChart", response);
        response.series = series;
        initial_main_feed.series = series;
        // close the filter
        deselect($("#querySettings"));
  });
  // Open a socket to listen for any updates
  var decws = open_websocket("/socket/");
  decws.onmessage = function(event) {
        var data = JSON.parse(event.data); //messages are objects, not pure JSON

        console.log("Streaming data input received : " + data.data);
        if (data.table == 'dec') {
          console.log("table is : " + data.table);
          if ((data.span == page_args['a'] ||  page_args['a']=="ALL") &&
              (data.domain == page_args['b'] ||  page_args['b']=="ALL") &&
              ((data.thread.indexOf(page_args['c']) > -1) ||  page_args['c']=="ALL") &&
              (data.tablename == page_args['d'] ||  page_args['d']=="") &&
              (data.ip == page_args['e'] ||  page_args['e']=="") ) {
            draw_on_graph([data.data], 0);
          }
        }

  }
  window.addEventListener("beforeunload", function(event) {
    decws.close();
  });
  return false;
};



// Add a new line to the current graph
var submit_query_add = function(e) {
  var args = {
    table: 'dec',
    a: $('#spanNames').val()[0],
    b: $('#domainNames').val()[0],
    c: $('#threadNames').val()[0],
    d: $('#tableNames').val(),
    e: $('#ipAddress').val()
  };
  args = $.param(args);
  $.getJSON('/_make_query', args, function(data) {
        response = initial_main_feed;
        var tooltip = {pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f}</b><br/>'}
        response.series.push({name: data.name, data: data.data, tooltip: tooltip, color: Highcharts.getOptions().colors[colorWheel]})
        colorWheel += 1;
        var series = response.series;
        var chart = new Highcharts.StockChart(response);
        initial_main_feed.series = series;
        // For dec only
        deselect($("#querySettings"));
  });
  return false;
};


// Add a table displaying the scoreboard for largest amounts of rows output

var make_table = function(column, chartNum, listLen, timeInterval) {
  $(".sub_" + chartNum + "_chart_container table").remove();
  var time = "cast(from_unixtime(unix_timestamp(time, 'yyyy/MM/dd:HH:mm:ss')) as timestamp)"
  var SQLTime = {"All Time": "", "Past Day": "and " + time + " BETWEEN now() and now() - interval 1 day", "Past Week": "and " + time + " BETWEEN now() and now() - interval 1 week", "Past Month": "and " + time + " BETWEEN now() and now() - interval 1 week", "Past Year":"and " + time + " BETWEEN now() and now() - interval 1 year"};
  var timespan = SQLTime[timeInterval];
  var args = {
    query: "select " + column +", sum(numrows)/count(distinct time) n from dec WHERE numrows > 0 " + timespan + " group by " + column +" ORDER BY -n LIMIT " + listLen
  };
  console.log("select " + column +", sum(numrows)/count(distinct time) n from dec WHERE numrows > 0 " + timespan + " group by " + column +" ORDER BY -n LIMIT " + listLen);
  args = $.param(args);
  $.getJSON('/_make_table_query', args, function(data) {
        var table = data.code;
        $(table).appendTo('.sub_' + chartNum + '_chart_container');
  });
  return false;
};

var make_table_1 = function(e) {make_table("table_name", 1, $('#tableNum').val(), $('#tableTime').val())};
var make_table_2 = function(e) {make_table("ip", 2, $('#ipNum').val(), $('#ipTime').val())};
var make_table_3 = function(e) {make_table("CONCAT(span, '.', domain)", 3, $('#aggsetNum').val(), $('#aggsetTime').val())};



