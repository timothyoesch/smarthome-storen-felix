import axios from "axios";

import config from "./config.mjs"


function setStoren(WindObjekt) {
    /* -- do not edit following lines - START -- {
    "expert": true,
    "debug": false,
    "verbose": false
    }
    -- do not edit previous lines - END --*/ 
    
    var AktorPosition, SturmwertKlein, SturmpositionKlein, Sturmwert, Sturmstatus, UrPosition, AktuellerBoeenwert, UrPosition;

    // Diesen Wert an aktuellen Aktor anpassen.
    AktorPosition = 'shelly.0.SHSW-25#6869F9#1.Shutter.Position'/*Position*/;
    // Windgeschwindigkeit für Teilöffnung
    SturmwertKlein = 30; //in km/h
    // Position für Teilöffnung
    SturmpositionKlein = 65; //in % offen

    // Windgeschwindigkeit für Vollöffnung
    Sturmwert = 40; // in km/h

    //init
    Sturmstatus = 0;
    UrPosition = getState(AktorPosition).val;

    on({id: WindObjekt, change: "any"}, function (obj) {
    var value = obj.state.val;
    var oldValue = obj.oldState.val;

    var aktPos = getState(AktorPosition).val;
    var AktuellerBoeenwert = getState(WindObjekt).val;

    if (
        (Sturmstatus == 0)||
        ((Sturmstatus == 1) && (aktPos != SturmpositionKlein))||
        ((Sturmstatus == 2) && (aktPos != 100))
        )
        //Benutzereinstellung, also sichern in UrPosition
    {
        UrPosition = aktPos;
    };
    
    if (AktuellerBoeenwert >= Sturmwert) {
        setState(AktorPosition/*Position*/, 100); // voll öffnen
        Sturmstatus = 2;
    }
    else if (AktuellerBoeenwert >= SturmwertKlein) {
        if (UrPosition  > SturmpositionKlein){
            setState(AktorPosition/*Position*/, UrPosition); //wenn ursprüngliche Position weiter offen, dann auf diese fahren
        }
        else {
            setState(AktorPosition/*Position*/, SturmpositionKlein);
        }
        Sturmstatus = 1;
    }

    else {
        if(Sturmstatus > 0) {
        setState(AktorPosition/*Position*/, UrPosition);   //kein Sturm -> zurück auf Anfang
        }
        Sturmstatus = 0;
    }

    });

}

axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
        zip : config.zip,
        appid: config.APIKey
    }
})
.then(function (response) {
    console.log(response.data)
    const WindGust = response.data.wind.gust
    if (WindGust) {
        setStoren(WindGust)
        console.log("Storen set")
    } else {
        console.log("No Gust")
        return
    }
})