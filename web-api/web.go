// web.go
package main

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
)

const (
	SUCCEEDED = iota
	FAILED
	RECOVERED
)

var state = SUCCEEDED
var author string

func main() {
	http.HandleFunc("/putResult", putResult)
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
