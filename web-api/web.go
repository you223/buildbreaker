// web.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
)

type State int

const (
	UNKNOWN = iota
	SUCCEEDED
	FAILED
	RECOVERED
)

type Fixed_auther int

const (
	UNKNOWN2 = iota
	SAME
	NOT_SAME
)

func (s State) String() string {
	switch s {
	case SUCCEEDED:
		return "SUCCEEDED"
	case FAILED:
		return "FAILED"
	case RECOVERED:
		return "RECOVERED"
	default:
		return "Unknown"
	}
}

var state State = SUCCEEDED
var author string
var pre_author string
var fixed_author Fixed_auther = SAME

var photos = map[string]string{"nobu": "test.png", "wataru": "test2.png", "nantake": "test3.png"}
var errorSound = map[string]string{"nobu": "http://192.168.1.79/daisanji/buildbreaker/public/sound/abuse/12_out.wav", "wataru": "http://192.168.1.79/daisanji/buildbreaker/public/sound/abuse/12_out.wav", "nantake": "http://192.168.1.79/daisanji/buildbreaker/public/sound/abuse/12_out.wav"}
var recoverSound = map[string]string{"nobu": "http://192.168.1.79/daisanji/buildbreaker/public/sound/happy/06_Recovery.wav", "wataru": "http://192.168.1.79/daisanji/buildbreaker/public/sound/happy/06_Recovery.wav", "nantake": "http://192.168.1.79/daisanji/buildbreaker/public/sound/happy/06_Recovery.wav"}

// Breaker
type Breaker struct {
	Status string        `json:"status"`
	Detail BreakerDetail `json:"detail"`
}

type BreakerDetail struct {
	Name  string `json:"name"`
	Photo string `json:"photo"`
	Sound string `json:"sound"`
}

func main() {
	http.HandleFunc("/putResult", putResult)
	http.HandleFunc("/buildStatus", getStatus)
	http.HandleFunc("/", hello)
	fmt.Println("listening...")
	err := http.ListenAndServe(":"+os.Getenv("PORT"), nil)
	if err != nil {
		panic(err)
	}
}

func hello(res http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(res, "hello, world")
}

func putResult(res http.ResponseWriter, req *http.Request) {
	m, _ := url.ParseQuery(req.URL.RawQuery)
	fmt.Fprintln(res, "Name=", m["name"][0])
	fmt.Fprintln(res, "Result=", m["result"][0])
	pre_author = author
	author = m["name"][0]
	if m["result"][0] == "SUCCEEDED" {
		if state == FAILED {
			state = RECOVERED
		} else {
			state = SUCCEEDED
		}
	} else {
		state = FAILED
	}

	if pre_author == author {
		fixed_author = SAME
	} else {
		fixed_author = NOT_SAME
	}
}

func getStatus(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
    res.Header().Set("Access-Control-Allow-Origin", "*")

	var breaker Breaker

	if state == SUCCEEDED {
		breaker = getSuccessStatus()
	} else if state == FAILED {
		breaker = getFailedStatus()
	} else if state == RECOVERED {
		breaker = getRecoveredStatus()
	} else {
		return
	}

	outgoingJSON, error := json.Marshal(breaker)

	if error != nil {
		log.Println(error.Error())
		http.Error(res, error.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprint(res, string(outgoingJSON))
}

func getSuccessStatus() Breaker {
	return Breaker{"success", BreakerDetail{"", "", ""}}
}

func getFailedStatus() Breaker {
	return Breaker{"failed", BreakerDetail{author, photos[author], errorSound[author]}}
}

func getRecoveredStatus() Breaker {
	return Breaker{"recovered", BreakerDetail{author, photos[author], recoverSound[author]}}
}
