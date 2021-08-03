Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#resultHolder2").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let players = ["giannis_antetokounmpo", "stephen_curry", "luka_doncic", "kevin_durant", "lebron_james"];
            
            let match1 = null;
            let match2 = null;
        
            if (data.length==2) {
                match1=data[0];
                match2=data[1];   
            
                $("#error").hide();
                $("#divClassTable").hide();
                $("#resultHolder").show();
                $("#resultHolder2").show();
                $("#resultHolder").html($(`[data-player="${match1.class}"`).html());
                $("#resultHolder2").html($(`[data-player="${match2.class}"`).html());
            }

            let bestScore = -1;

            if (data.length==1) {
                for (let i=0;i<data.length;++i) {
                    let maxScoreForThisClass = Math.max(...data[i].class_probability);
                    if(maxScoreForThisClass>bestScore) {
                        match = data[i];
                        bestScore = maxScoreForThisClass;
                    }
                }
            }

            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#resultHolder2").hide();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#resultHolder2").hide()
    $("#divClassTable").hide();

    init();
});