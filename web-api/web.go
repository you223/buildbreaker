// web.go
package main

import (
	"fmt"
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

func main() {
	http.HandleFunc("/putResult", putResult)
	http.HandleFunc("/checkResult", checkResult)
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
}

func checkResult(res http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(res, "State=", state.String())
	fmt.Fprintln(res, "Author=", author)
}
