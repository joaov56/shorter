package http

import (
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"shorter/backend/infrastructure/controllers"
)

func SetupRoutes(router *mux.Router, client *mongo.Client) {
	router.HandleFunc("/api/url", controllers.CreateShortURL(client)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/getUrlsByUserId/{email}", controllers.GetUrlsByUserId(client)).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}", controllers.GetLongURL(client)).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}/click", controllers.IncrementClickCount(client)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/{shortURL}/stats", controllers.GetClickStats(client)).Methods("GET")
	
	router.HandleFunc("/api/dashboard/{email}", controllers.GetUserClickStats(client)).Methods("GET")
	
	router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		controllers.RegisterUser(w, r, client)
	}).Methods("POST", "OPTIONS")
} 